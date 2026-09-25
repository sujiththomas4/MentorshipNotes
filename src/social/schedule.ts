import { useEffect, useState } from "react";
import { fmtTime, isoDate, occurrencesOn, planId, updatePlanner, usePlanner, type PlanTemplate } from "@/social/planner";
import { PLATFORMS } from "@/social/registry";

/*
 * Posting schedule per template. Defaults live in the registry (SocialTemplate.schedule); the
 * content planner (planner.ts) holds the real plan: recurring slots with times, one-off posts,
 * skipped / moved dates. This module keeps the simple day-based view used by the gallery,
 * sidebar and badges, reading from the planner.
 */

/** 0 = Sunday … 6 = Saturday (Date#getDay) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Schedule = { days: Weekday[]; note?: string };

/** display order: Monday first */
export const WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Every template of every available platform, as the planner needs them. */
export function planTemplates(): PlanTemplate[] {
  return PLATFORMS.filter((p) => p.available).flatMap((p) => p.templates.map((t) => ({ id: t.id, title: t.title, brand: t.brand, schedule: t.schedule })));
}

/**
 * Set a template's posting days (the gallery's day strip). Edits its first recurring slot, or
 * adds one; null removes its slots so the registry default applies again.
 */
export function saveScheduleDays(templateId: string, days: Weekday[] | null) {
  updatePlanner((p) => {
    if (days === null) {
      const ids = new Set(p.slots.filter((s) => s.templateId === templateId).map((s) => s.id));
      return { ...p, slots: p.slots.filter((s) => !ids.has(s.id)), changes: p.changes.filter((c) => !ids.has(c.slotId)) };
    }
    const sorted = [...days].sort();
    const first = p.slots.find((s) => s.templateId === templateId);
    if (first) first.days = sorted;
    else p.slots.push({ id: planId(), templateId, days: sorted, time: "", note: "", active: true, from: "" });
    return p;
  });
}

/**
 * Today's weekday / date and helpers over the plan. Client-only, so `today` is null during
 * server rendering and the first paint (no hydration mismatch).
 */
export function useScheduleState() {
  const planner = usePlanner();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    // roll over at midnight if the app stays open
    const tick = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tick);
  }, []);
  const today = now ? (now.getDay() as Weekday) : null;
  const todayIso = now ? isoDate(now) : null;
  const mine = (id: string) => planner.slots.filter((s) => s.templateId === id && s.active);
  const daysFor = (id: string, s: Schedule): Weekday[] => {
    const slots = planner.slots.filter((x) => x.templateId === id);
    if (!slots.length) return s.days;
    return [...new Set(mine(id).flatMap((x) => x.days))].sort() as Weekday[];
  };
  const isCustom = (id: string) => planner.slots.some((s) => s.templateId === id);
  const todays = todayIso ? occurrencesOn(todayIso, planner, planTemplates()).filter((o) => !o.skipped) : [];
  /** Planned today (recurring, moved here or a one-off), not skipped. */
  const liveToday = (id: string) => todays.some((o) => o.templateId === id);
  /** "8:30 AM" of the template's first timed slot, or "". */
  const timeFor = (id: string) => {
    const t = mine(id).find((s) => s.time)?.time;
    return t ? fmtTime(t) : "";
  };
  return { today, todayIso, planner, todays, daysFor, isCustom, liveToday, timeFor };
}

/** "Every day", "Mon–Fri", "Mon · Wed", "Sat · Sun", "Not scheduled". */
export function formatDays(days: Weekday[]) {
  const set = new Set(days);
  if (set.size === 0) return "Not scheduled";
  if (set.size === 7) return "Every day";
  const order = WEEK.filter((d) => set.has(d));
  const idx = order.map((d) => WEEK.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (consecutive && order.length >= 3) return `${DAY_SHORT[order[0]]}–${DAY_SHORT[order[order.length - 1]]}`;
  return order.map((d) => DAY_SHORT[d]).join(" · ");
}

/** Days until the next scheduled day after today (1–7), or null if never. */
export function nextDay(days: Weekday[], today: Weekday) {
  for (let k = 1; k <= 7; k++) {
    const d = ((today + k) % 7) as Weekday;
    if (days.includes(d)) return { day: d, inDays: k };
  }
  return null;
}
