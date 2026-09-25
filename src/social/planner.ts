import { useEffect, useState } from "react";
import { backend } from "@/social/backend";
import type { Weekday } from "@/social/schedule";

/*
 * Content planner: when each template is posted.
 *   slots    - recurring: a template on some weekdays at a time ("Global Market, Mon–Fri, 8:30")
 *   oneOffs  - a post on one specific date and time
 *   changes  - one occurrence of a slot skipped or moved to another date / time
 *   posted   - occurrences ticked as posted
 *   recurringFrom - recurring slots start on this date (a slot's own "from" overrides it)
 * A template without any slot uses its registry default days (no time) until you add one.
 * Saved through the social backend (today: src/content/social/planner.json via the dev server);
 * the browser keeps a copy.
 */

export type RecurringSlot = {
  id: string;
  templateId: string;
  days: Weekday[];
  time: string;
  note: string;
  active: boolean;
  /** yyyy-mm-dd this slot starts on; "" = the plan's recurringFrom */
  from: string;
};
export type OneOffPost = { id: string; templateId: string; date: string; time: string; note: string };
export type SlotChange = { slotId: string; date: string; skip?: boolean; toDate?: string; toTime?: string };
export type Planner = {
  version: 1;
  /** yyyy-mm-dd all recurring slots start on (unless a slot sets its own); "" = no start date */
  recurringFrom: string;
  slots: RecurringSlot[];
  oneOffs: OneOffPost[];
  changes: SlotChange[];
  posted: string[];
};

export type PlanTemplate = { id: string; title: string; brand: string; schedule: { days: Weekday[] } };

export type Occurrence = {
  /** stable key: "<slotId>@<original date>" or "once:<id>" */
  key: string;
  templateId: string;
  date: string;
  time: string;
  note: string;
  kind: "recurring" | "once";
  slotId?: string;
  oneOffId?: string;
  /** date the recurring occurrence originally belonged to */
  from?: string;
  moved?: boolean;
  /** from a template's default days (no slot saved yet) */
  implicit?: boolean;
  skipped?: boolean;
  posted: boolean;
};

export const EMPTY_PLANNER: Planner = { version: 1, recurringFrom: "", slots: [], oneOffs: [], changes: [], posted: [] };

export const planId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ---------- dates & times ---------- */

export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function parseIso(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export const addDays = (s: string, n: number) => {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
};
export const weekdayOf = (s: string) => parseIso(s).getDay() as Weekday;
/** Monday of the week containing `s`. */
export const weekStart = (s: string) => addDays(s, -((weekdayOf(s) + 6) % 7));
/** The 6 × 7 days shown for the month containing `s` (Monday first). */
export function monthGrid(s: string) {
  const d = parseIso(s);
  const first = isoDate(new Date(d.getFullYear(), d.getMonth(), 1));
  const start = weekStart(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
/** "08:30" → "8:30 AM"; "" → "Any time". */
export function fmtTime(t: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || "");
  if (!m) return "Any time";
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}
const timeKey = (t: string) => (/^\d{1,2}:\d{2}$/.test(t) ? t.padStart(5, "0") : "99:99");

/* ---------- what is posted when ---------- */

/** Saved slots, plus a default slot (registry days, no time) for templates without any. */
export function effectiveSlots(p: Planner, templates: PlanTemplate[]): (RecurringSlot & { implicit?: boolean })[] {
  const withSlots = new Set(p.slots.map((s) => s.templateId));
  const defaults = templates
    .filter((t) => !withSlots.has(t.id) && t.schedule.days.length)
    .map((t) => ({ id: `default:${t.id}`, templateId: t.id, days: t.schedule.days, time: "", note: "", active: true, from: "", implicit: true }));
  return [...p.slots, ...defaults];
}

/** The date a slot starts on ("" = no start). */
export const slotStart = (s: RecurringSlot, p: Planner) => s.from || p.recurringFrom || "";

/** Everything planned on a date (skipped recurring ones included with skipped: true), by time. */
export function occurrencesOn(date: string, p: Planner, templates: PlanTemplate[]): Occurrence[] {
  const known = new Set(templates.map((t) => t.id));
  const slots = effectiveSlots(p, templates).filter((s) => s.active && known.has(s.templateId));
  const posted = new Set(p.posted);
  const out: Occurrence[] = [];
  const wd = weekdayOf(date);
  for (const s of slots) {
    if (!s.days.includes(wd)) continue;
    const start = slotStart(s, p);
    if (start && date < start) continue; // before this slot starts
    const ch = p.changes.find((c) => c.slotId === s.id && c.date === date);
    const key = `${s.id}@${date}`;
    if (ch?.toDate && ch.toDate !== date) continue; // moved away to another day
    out.push({
      key,
      templateId: s.templateId,
      date,
      time: ch?.toTime ?? s.time,
      note: s.note,
      kind: "recurring",
      slotId: s.id,
      from: date,
      implicit: s.implicit,
      skipped: !!ch?.skip,
      moved: !!ch?.toTime && ch.toTime !== s.time,
      posted: posted.has(key),
    });
  }
  // occurrences moved here from another day
  for (const ch of p.changes) {
    if (ch.toDate !== date || ch.date === date || ch.skip) continue;
    const s = slots.find((x) => x.id === ch.slotId);
    if (!s || !s.days.includes(weekdayOf(ch.date))) continue;
    if (slotStart(s, p) && ch.date < slotStart(s, p)) continue;
    const key = `${s.id}@${ch.date}`;
    out.push({ key, templateId: s.templateId, date, time: ch.toTime ?? s.time, note: s.note, kind: "recurring", slotId: s.id, from: ch.date, moved: true, implicit: s.implicit, posted: posted.has(key) });
  }
  for (const o of p.oneOffs) {
    if (o.date !== date || !known.has(o.templateId)) continue;
    const key = `once:${o.id}`;
    out.push({ key, templateId: o.templateId, date, time: o.time, note: o.note, kind: "once", oneOffId: o.id, posted: posted.has(key) });
  }
  return out.sort((a, b) => timeKey(a.time).localeCompare(timeKey(b.time)));
}

/* ---------- shared store (all pages see the same plan) ---------- */

const LOCAL = "social:planner";
/** "1" = keep the plan in this browser only, never read or write the project file (for testing). */
const LOCAL_ONLY = "social:planner:local-only";
const localOnly = () => {
  try {
    return localStorage.getItem(LOCAL_ONLY) === "1";
  } catch {
    return false;
  }
};
const OLD_SCHEDULE = "social:schedule";
const EVENT = "social-planner-change";
let state: Planner = EMPTY_PLANNER;
let loaded = false;
let serverOk = true;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function clean(raw: unknown): Planner {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Planner>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const days = (v: unknown) => (Array.isArray(v) ? (v.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) as Weekday[]) : []);
  const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
  return {
    version: 1,
    recurringFrom: date(r.recurringFrom),
    slots: (Array.isArray(r.slots) ? r.slots : []).map((s) => ({
      id: str(s.id) || planId(),
      templateId: str(s.templateId),
      days: days(s.days),
      time: str(s.time),
      note: str(s.note),
      active: s.active !== false,
      from: date(s.from),
    })),
    oneOffs: (Array.isArray(r.oneOffs) ? r.oneOffs : []).map((o) => ({ id: str(o.id) || planId(), templateId: str(o.templateId), date: str(o.date), time: str(o.time), note: str(o.note) })),
    changes: (Array.isArray(r.changes) ? r.changes : []).map((c) => ({
      slotId: str(c.slotId),
      date: str(c.date),
      ...(c.skip ? { skip: true } : {}),
      ...(c.toDate ? { toDate: str(c.toDate) } : {}),
      ...(c.toTime ? { toTime: str(c.toTime) } : {}),
    })),
    posted: (Array.isArray(r.posted) ? r.posted : []).filter((k): k is string => typeof k === "string"),
  };
}

/** The older day-only schedule (per template, in this browser) becomes recurring slots once. */
function migrateOldSchedule(): RecurringSlot[] {
  try {
    const old = JSON.parse(localStorage.getItem(OLD_SCHEDULE) || "{}") as Record<string, Weekday[]>;
    return Object.entries(old).map(([templateId, days]) => ({ id: planId(), templateId, days, time: "", note: "", active: true, from: "" }));
  } catch {
    return [];
  }
}

function writeLocal() {
  try {
    localStorage.setItem(LOCAL, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function scheduleServerSave() {
  if (localOnly()) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    backend.savePlanner(JSON.stringify(state, null, 2)).then(
      () => (serverOk = true),
      () => (serverOk = false),
    );
  }, 400);
}

async function loadOnce() {
  if (loaded) return;
  loaded = true;
  let local: Planner | null = null;
  try {
    const raw = localStorage.getItem(LOCAL);
    if (raw) local = clean(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  if (!local) {
    const migrated = migrateOldSchedule();
    if (migrated.length) local = { ...EMPTY_PLANNER, slots: migrated };
  }
  if (local) {
    state = local;
    window.dispatchEvent(new Event(EVENT));
  }
  if (localOnly()) return;
  try {
    const json = await backend.loadPlanner();
    if (json) {
      state = clean(JSON.parse(json)); // the project file wins
      writeLocal();
      window.dispatchEvent(new Event(EVENT));
    } else if (local) scheduleServerSave(); // first time: put the browser's plan into the project
  } catch {
    serverOk = false;
  }
}

/** The current plan; re-renders on every change. EMPTY_PLANNER until mounted (no hydration mismatch). */
export function usePlanner() {
  const [p, setP] = useState<Planner>(EMPTY_PLANNER);
  useEffect(() => {
    const sync = () => setP(state);
    sync();
    window.addEventListener(EVENT, sync);
    void loadOnce();
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return p;
}

/** Change the plan (the function receives a copy). Saved to the browser at once and to the project file shortly after. */
export function updatePlanner(fn: (p: Planner) => Planner) {
  state = clean(fn(structuredClone(state)));
  writeLocal();
  window.dispatchEvent(new Event(EVENT));
  scheduleServerSave();
}

export const plannerSavedToProject = () => serverOk;
