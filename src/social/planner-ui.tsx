import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck2,
  Lightbulb,
  List,
  MoveRight,
  Pause,
  Play,
  Plus,
  Repeat,
  Rows3,
  SkipForward,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedPostMeta } from "@/social/backend";
import { deleteSavedPost, useSavedPosts } from "@/social/saved-posts";
import { Notes, PriorityBadge } from "@/social/ideas-ui";
import { BRANDS, type BrandId } from "@/branding/brands";
import type { SocialPlatform } from "@/social/registry";
import { DAY_LONG, DAY_SHORT, WEEK, formatDays, type Weekday } from "@/social/schedule";
import {
  addDays,
  effectiveSlots,
  fmtTime,
  isoDate,
  monthGrid,
  occurrencesOn,
  parseIso,
  planId,
  updatePlanner,
  usePlanner,
  slotStart,
  weekStart,
  type Occurrence,
  type PlanTemplate,
  type Planner,
  type RecurringSlot,
  type TopicIdea,
} from "@/social/planner";

/*
 * Content planner screen: a calendar (month / week / list) of what posts when, a day panel to
 * tick, move, skip or add posts, and the recurring schedule underneath.
 */

type View = "month" | "week" | "list";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shortDate = (s: string) => {
  const d = parseIso(s);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
};
const longDate = (s: string) => {
  const d = parseIso(s);
  return `${DAY_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const brandOf = (id: string) => BRANDS.find((b) => b.id === id);

/* ---------- plan edits ---------- */

/** Change a slot; a default slot (from the registry days) is saved as a real slot first. */
function setSlot(slot: RecurringSlot & { implicit?: boolean }, patch: Partial<RecurringSlot>) {
  updatePlanner((p) => {
    const i = p.slots.findIndex((s) => s.id === slot.id);
    if (i >= 0) p.slots[i] = { ...p.slots[i], ...patch };
    else p.slots.push({ id: slot.id, templateId: slot.templateId, days: slot.days, time: slot.time, note: slot.note, active: slot.active, from: slot.from ?? "", ...patch });
    return p;
  });
}
const removeSlot = (id: string) => updatePlanner((p) => ({ ...p, slots: p.slots.filter((s) => s.id !== id), changes: p.changes.filter((c) => c.slotId !== id) }));
/** Skip / move one occurrence of a recurring slot (null clears the change). */
function setChange(o: Occurrence, change: { skip?: boolean; toDate?: string; toTime?: string } | null) {
  updatePlanner((p) => {
    const rest = p.changes.filter((c) => !(c.slotId === o.slotId && c.date === o.from));
    return { ...p, changes: change ? [...rest, { slotId: o.slotId!, date: o.from!, ...change }] : rest };
  });
}
const togglePosted = (key: string) =>
  updatePlanner((p) => ({ ...p, posted: p.posted.includes(key) ? p.posted.filter((k) => k !== key) : [...p.posted, key] }));

/* ---------- page ---------- */

export function PlannerScreen({ platform: pf }: { platform: SocialPlatform }) {
  const planner = usePlanner();
  const saved = useSavedPosts();
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(isoDate(new Date())), []);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<string>("");
  const [selected, setSelected] = useState<string>("");
  const [brand, setBrand] = useState<BrandId | "all">("all");
  useEffect(() => {
    if (today && !cursor) {
      setCursor(today);
      setSelected(today);
    }
  }, [today, cursor]);

  const allTemplates: PlanTemplate[] = useMemo(() => pf.templates.map((t) => ({ id: t.id, title: t.title, brand: t.brand, schedule: t.schedule })), [pf]);
  const templates = useMemo(() => allTemplates.filter((t) => brand === "all" || t.brand === brand), [allTemplates, brand]);
  const tpl = (id: string) => allTemplates.find((t) => t.id === id);
  const on = (d: string) => occurrencesOn(d, planner, templates);

  if (!today || !cursor) return <div className="mt-10 text-sm text-muted-foreground">Loading the planner…</div>;

  const step = (n: number) => {
    const d = parseIso(cursor);
    if (view === "month") setCursor(isoDate(new Date(d.getFullYear(), d.getMonth() + n, 1)));
    else setCursor(addDays(cursor, n * (view === "week" ? 7 : 30)));
  };
  const cd = parseIso(cursor);
  const ws = weekStart(cursor);
  const label =
    view === "month" ? `${MONTHS[cd.getMonth()]} ${cd.getFullYear()}` : view === "week" ? `${shortDate(ws)} – ${shortDate(addDays(ws, 6))}` : `${shortDate(cursor)} – ${shortDate(addDays(cursor, 29))}`;

  // quick numbers for the header
  const week = Array.from({ length: 7 }, (_, i) => on(addDays(weekStart(today), i)).filter((o) => !o.skipped));
  const weekCount = week.reduce((a, l) => a + l.length, 0);
  const todayCount = on(today).filter((o) => !o.skipped).length;
  const slotsCount = effectiveSlots(planner, templates).filter((s) => s.active).length;
  const savedAhead = [...saved.values()].filter((m) => m.date >= today && !planner.posted.includes(m.key) && templates.some((t) => t.id === m.templateId)).length;

  return (
    <div>
      <header className="relative mt-4 overflow-hidden rounded-3xl px-6 py-7 text-white shadow-xl md:px-10" style={{ background: pf.gradient }}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <CalendarClock className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">{pf.name}</p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Content planner</h1>
          </div>
          <Link to="/social/$platform/ideas" params={{ platform: pf.id }} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25">
            <Lightbulb className="h-4 w-4" /> Topic ideas
          </Link>
          <Link to="/social/$platform" params={{ platform: pf.id }} className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25">
            ← Templates
          </Link>
        </div>
        <p className="mt-3 max-w-3xl text-white/90">Recurring slots repeat every week; add one-off posts on any date. Skip or move a single day without touching the routine.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Stat icon={<CalendarDays className="h-4 w-4" />} label="Today" value={todayCount} />
          <Stat icon={<Rows3 className="h-4 w-4" />} label="This week" value={weekCount} />
          <Stat icon={<Repeat className="h-4 w-4" />} label="Recurring slots" value={slotsCount} />
          <Stat icon={<FileCheck2 className="h-4 w-4" />} label="Posts ready (saved ahead)" value={savedAhead} />
        </div>
      </header>

      {/* toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-xl border border-border bg-card" role="radiogroup" aria-label="View">
          {(
            [
              ["month", "Month", <CalendarDays key="m" className="h-4 w-4" />],
              ["week", "Week", <Rows3 key="w" className="h-4 w-4" />],
              ["list", "List", <List key="l" className="h-4 w-4" />],
            ] as [View, string, ReactNode][]
          ).map(([v, l, icon]) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={cn("inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold", view === v ? "bg-foreground text-background" : "hover:bg-secondary")}>
              {icon} {l}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1">
          <IconBtn label="Previous" onClick={() => step(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </IconBtn>
          <button type="button" onClick={() => (setCursor(today), setSelected(today))} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-secondary">
            Today
          </button>
          <IconBtn label="Next" onClick={() => step(1)}>
            <ChevronRight className="h-4 w-4" />
          </IconBtn>
        </div>
        <h2 className="font-display text-xl font-bold">{label}</h2>
        <span className="flex-1" />
        <div className="flex flex-wrap gap-2">
          <BrandPill active={brand === "all"} onClick={() => setBrand("all")}>
            All accounts
          </BrandPill>
          {BRANDS.map((b) => (
            <BrandPill key={b.id} active={brand === b.id} onClick={() => setBrand(b.id)} color={b.ui.from}>
              {b.name}
            </BrandPill>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          {view === "month" && <MonthView cursor={cursor} today={today} selected={selected} onSelect={setSelected} on={on} tpl={tpl} saved={saved} />}
          {view === "week" && <WeekView start={ws} today={today} selected={selected} onSelect={setSelected} on={on} tpl={tpl} saved={saved} />}
          {view === "list" && <ListView start={cursor} today={today} onSelect={setSelected} on={on} tpl={tpl} saved={saved} />}
        </div>
        <div className="xl:sticky xl:top-6 xl:self-start">
          <DayPanel date={selected} today={today} occ={on(selected)} tpl={tpl} templates={templates} platform={pf.id} saved={saved} ideas={planner.ideas} />
        </div>
      </div>

      <RecurringManager planner={planner} templates={templates} tpl={tpl} platform={pf.id} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm ring-1 ring-white/25">
      {icon}
      <span className="text-white/85">{label}</span>
      <b className="font-display text-lg leading-none">{value}</b>
    </span>
  );
}

function BrandPill({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium", active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-secondary")}>
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

function IconBtn({ label, onClick, disabled, children, className }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode; className?: string }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className={cn("rounded-lg border border-border bg-card p-2 hover:bg-secondary disabled:opacity-40", className)}>
      {children}
    </button>
  );
}

type Tpl = (id: string) => PlanTemplate | undefined;
type On = (d: string) => Occurrence[];

/** A post in a calendar cell: brand colour bar, time, template title. */
type Saved = Map<string, SavedPostMeta>;

function Chip({ o, tpl, big, ready }: { o: Occurrence; tpl: Tpl; big?: boolean; ready?: boolean }) {
  const t = tpl(o.templateId);
  const b = brandOf(t?.brand ?? "");
  return (
    <span
      className={cn("flex min-w-0 items-center gap-1.5 rounded-md border-l-[3px] px-1.5 py-0.5 text-left", big ? "text-sm" : "text-[11px]", o.posted && "opacity-55")}
      style={{ borderColor: b?.ui.from ?? "#888", background: `${b?.ui.from ?? "#888888"}14` }}
    >
      {o.posted ? (
        <Check className="h-3 w-3 shrink-0 text-emerald-600" />
      ) : ready ? (
        <FileCheck2 className="h-3 w-3 shrink-0 text-violet-600" aria-label="post saved, ready" />
      ) : o.ideaId ? (
        <Lightbulb className="h-3 w-3 shrink-0 text-amber-600" aria-label="from a topic idea" />
      ) : o.kind === "once" ? (
        <CalendarPlus className="h-3 w-3 shrink-0 opacity-60" />
      ) : null}
      {o.time && <span className="shrink-0 font-semibold tabular-nums">{fmtTime(o.time).replace(" ", "")}</span>}
      <span className={cn("truncate", o.posted && "line-through")}>{t?.title ?? o.templateId}</span>
    </span>
  );
}

function MonthView({ cursor, today, selected, onSelect, on, tpl, saved }: { cursor: string; today: string; selected: string; onSelect: (d: string) => void; on: On; tpl: Tpl; saved: Saved }) {
  const month = parseIso(cursor).getMonth();
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-secondary/60">
        {WEEK.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {DAY_SHORT[d]}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthGrid(cursor).map((d) => {
          const list = on(d).filter((o) => !o.skipped);
          const inMonth = parseIso(d).getMonth() === month;
          const past = d < today;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              aria-pressed={d === selected}
              className={cn(
                "flex min-h-[118px] flex-col gap-1 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-secondary/60",
                !inMonth && "bg-secondary/30 text-muted-foreground",
                past && inMonth && "bg-secondary/15",
                d === selected && "bg-accent/10 ring-2 ring-inset ring-accent",
              )}
            >
              <span className={cn("mb-0.5 inline-flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-semibold", d === today && "bg-emerald-500 text-white")}>{parseIso(d).getDate()}</span>
              {list.slice(0, 3).map((o) => (
                <Chip key={o.key} o={o} tpl={tpl} ready={saved.has(o.key)} />
              ))}
              {list.length > 3 && <span className="px-1 text-[11px] font-medium text-muted-foreground">+{list.length - 3} more</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ start, today, selected, onSelect, on, tpl, saved }: { start: string; today: string; selected: string; onSelect: (d: string) => void; on: On; tpl: Tpl; saved: Saved }) {
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((d) => {
        const list = on(d).filter((o) => !o.skipped);
        return (
          <button
            key={d}
            type="button"
            onClick={() => onSelect(d)}
            aria-pressed={d === selected}
            className={cn("flex min-h-[260px] min-w-0 flex-col gap-2 rounded-2xl border bg-card p-2 text-left transition-colors hover:border-accent", d === selected ? "border-accent ring-2 ring-accent/40" : "border-border", d < today && "opacity-75")}
          >
            <span className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{DAY_SHORT[parseIso(d).getDay()]}</span>
              <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-bold", d === today && "bg-emerald-500 text-white")}>{parseIso(d).getDate()}</span>
            </span>
            {list.length === 0 && <span className="mt-6 text-center text-xs text-muted-foreground">Nothing planned</span>}
            {list.map((o) => {
              const t = tpl(o.templateId);
              const b = brandOf(t?.brand ?? "");
              return (
                <span key={o.key} className={cn("min-w-0 rounded-xl border-l-4 bg-secondary/50 p-2", o.posted && "opacity-55")} style={{ borderColor: b?.ui.from }}>
                  <span className="flex items-center gap-1 whitespace-nowrap text-[11px] font-bold tabular-nums">
                    <Clock className="h-3 w-3" /> {fmtTime(o.time)}
                    {o.ideaId && <Lightbulb className="h-3 w-3 text-amber-600" aria-label="from a topic idea" />}
                    {o.posted ? <Check className="ml-auto h-3.5 w-3.5 text-emerald-600" /> : saved.has(o.key) ? <FileCheck2 className="ml-auto h-3.5 w-3.5 text-violet-600" /> : null}
                  </span>
                  <span className={cn("mt-0.5 block text-[13px] font-semibold leading-tight [overflow-wrap:anywhere]", o.posted && "line-through")}>{t?.title}</span>
                  {o.note && <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{o.note}</span>}
                </span>
              );
            })}
          </button>
        );
      })}
    </div>
  );
}

function ListView({ start, today, onSelect, on, tpl, saved }: { start: string; today: string; onSelect: (d: string) => void; on: On; tpl: Tpl; saved: Saved }) {
  const days = Array.from({ length: 30 }, (_, i) => addDays(start, i))
    .map((d) => ({ d, list: on(d).filter((o) => !o.skipped) }))
    .filter((r) => r.list.length);
  return (
    <div className="space-y-3">
      {days.length === 0 && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nothing planned in these 30 days.</p>}
      {days.map(({ d, list }) => (
        <button key={d} type="button" onClick={() => onSelect(d)} className="block w-full rounded-2xl border border-border bg-card p-4 text-left hover:border-accent">
          <p className="flex items-center gap-2 font-display font-semibold">
            {longDate(d)}
            {d === today && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">Today</span>}
          </p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {list.map((o) => (
              <Chip key={o.key} o={o} tpl={tpl} big ready={saved.has(o.key)} />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------- day panel ---------- */

function DayPanel({
  date,
  today,
  occ,
  tpl,
  templates,
  platform,
  saved,
  ideas,
}: {
  date: string;
  today: string;
  occ: Occurrence[];
  tpl: Tpl;
  templates: PlanTemplate[];
  platform: string;
  saved: Saved;
  ideas: TopicIdea[];
}) {
  const [moving, setMoving] = useState<string | null>(null);
  const [mv, setMv] = useState({ date: "", time: "" });
  const [add, setAdd] = useState({ templateId: "", time: "", note: "", ideaId: "" });
  const [showTopic, setShowTopic] = useState<string | null>(null);
  const fits = (i: TopicIdea, templateId: string) => !templateId || (i.templates.length ? i.templates.includes(templateId) : !i.brand || i.brand === tpl(templateId)?.brand);
  const openIdeas = ideas
    .filter((i) => i.status !== "done" && fits(i, add.templateId))
    .sort((a, b) => (a.status === "final" ? 0 : 1) - (b.status === "final" ? 0 : 1) || a.priority - b.priority);
  const live = occ.filter((o) => !o.skipped);
  const skipped = occ.filter((o) => o.skipped);
  const rel = date === today ? "Today" : date === addDays(today, 1) ? "Tomorrow" : date < today ? "Past" : "";

  function saveMove(o: Occurrence) {
    if (!mv.date) return;
    if (o.kind === "once") updatePlanner((p) => ({ ...p, oneOffs: p.oneOffs.map((x) => (x.id === o.oneOffId ? { ...x, date: mv.date, time: mv.time } : x)) }));
    else setChange(o, { toDate: mv.date, ...(mv.time ? { toTime: mv.time } : {}) });
    setMoving(null);
  }

  return (
    <section className="card-elevated rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold leading-tight">{longDate(date)}</p>
          <p className="text-sm text-muted-foreground">
            {rel && <span className={cn("mr-2 font-semibold", rel === "Today" && "text-emerald-600")}>{rel}</span>}
            {live.length ? `${live.length} ${live.length === 1 ? "post" : "posts"} planned` : "Nothing planned"}
          </p>
        </div>
        <CalendarDays className="h-6 w-6 text-accent" />
      </div>

      <div className="mt-4 space-y-3">
        {live.map((o) => {
          const t = tpl(o.templateId);
          const b = brandOf(t?.brand ?? "");
          const post = saved.get(o.key);
          const idea = o.ideaId ? ideas.find((i) => i.id === o.ideaId) : undefined;
          return (
            <div key={o.key} className={cn("rounded-xl border p-3", o.posted ? "border-emerald-300 bg-emerald-50/60" : post ? "border-violet-300 bg-violet-50/50" : "border-border")}>
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => togglePosted(o.key)}
                  title={o.posted ? "Posted: click to undo" : "Mark as posted"}
                  aria-pressed={o.posted}
                  className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2", o.posted ? "border-emerald-500 bg-emerald-500 text-white" : "border-border hover:border-emerald-500")}
                >
                  {o.posted && <Check className="h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-display font-bold tabular-nums">
                    <Clock className="h-4 w-4 text-muted-foreground" /> {fmtTime(o.time)}
                  </p>
                  <p className={cn("mt-0.5 font-semibold leading-snug", o.posted && "line-through opacity-70")}>{t?.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-white" style={{ background: b?.ui.from }}>
                      {b?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
                      {o.kind === "once" ? <CalendarPlus className="h-3 w-3" /> : <Repeat className="h-3 w-3" />}
                      {o.kind === "once" ? "One-off" : o.implicit ? "Default days" : "Recurring"}
                    </span>
                    {o.moved && o.from && o.from !== o.date && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900">Moved from {shortDate(o.from)}</span>}
                    {o.moved && o.from === o.date && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900">Time changed</span>}
                  </p>
                  {o.note && <p className="mt-1 text-sm text-muted-foreground">{o.note}</p>}
                  {idea && (
                    <button
                      type="button"
                      onClick={() => setShowTopic(showTopic === o.key ? null : o.key)}
                      aria-expanded={showTopic === o.key}
                      className="mt-1 flex w-fit items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
                    >
                      <Lightbulb className="h-3.5 w-3.5" /> {showTopic === o.key ? "Hide topic" : "See topic"} (P{idea.priority})
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showTopic === o.key && "rotate-180")} />
                    </button>
                  )}
                  <p className={cn("mt-1.5 inline-flex items-center gap-1 text-xs font-semibold", post ? "text-violet-700" : "text-muted-foreground")}>
                    {post ? <FileCheck2 className="h-3.5 w-3.5" /> : <CalendarPlus className="h-3.5 w-3.5" />}
                    {post ? "Post ready · saved " + new Date(post.savedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Post not created yet"}
                  </p>
                </div>
                {post?.preview && (
                  <Link to="/social/$platform/$template" params={{ platform, template: o.templateId }} search={{ plan: o.key, date: o.date, time: o.time }} title="Open the saved post">
                    <img src={post.preview} alt="Saved post preview" className="w-16 shrink-0 rounded-md border border-border shadow-sm" />
                  </Link>
                )}
              </div>

              {idea && showTopic === o.key && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                  <p className="flex items-start gap-2">
                    <PriorityBadge p={idea.priority} className="mt-0.5" />
                    <span className="min-w-0 flex-1 font-semibold leading-snug">{idea.title}</span>
                  </p>
                  {idea.notes ? (
                    <div className="mt-2">
                      <Notes text={idea.notes} />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">No notes on this topic.</p>
                  )}
                  <Link to="/social/$platform/ideas" params={{ platform }} search={{ idea: idea.id }} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                    Open in Topic ideas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {moving === o.key ? (
                <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-secondary/60 p-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Date
                    <input type="date" value={mv.date} onChange={(e) => setMv({ ...mv, date: e.target.value })} className={inputCls} />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground">
                    Time
                    <input type="time" value={mv.time} onChange={(e) => setMv({ ...mv, time: e.target.value })} className={inputCls} />
                  </label>
                  <button type="button" onClick={() => saveMove(o)} className={cn(smallBtn, "bg-foreground text-background hover:bg-foreground/90")}>
                    Save
                  </button>
                  <button type="button" onClick={() => setMoving(null)} className={smallBtn}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Link
                    to="/social/$platform/$template"
                    params={{ platform, template: o.templateId }}
                    search={{ plan: o.key, date: o.date, time: o.time }}
                    className={cn(smallBtn, post ? "border-violet-600 bg-violet-600 text-white hover:bg-violet-700" : "text-accent")}
                  >
                    {post ? "Open & download" : "Create post"} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {post && (
                    <button
                      type="button"
                      onClick={() => confirm("Remove the saved post for this day? The planned slot stays.") && void deleteSavedPost(o.key)}
                      className={cn(smallBtn, "text-muted-foreground")}
                      title="Remove the saved post (keeps the plan)"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Saved post
                    </button>
                  )}
                  <button type="button" onClick={() => (setMoving(o.key), setMv({ date: o.date, time: o.time }))} className={smallBtn}>
                    <MoveRight className="h-3.5 w-3.5" /> Move / time
                  </button>
                  {o.kind === "recurring" && o.moved && (
                    <button type="button" onClick={() => setChange(o, null)} className={smallBtn}>
                      <Undo2 className="h-3.5 w-3.5" /> Undo move
                    </button>
                  )}
                  {o.kind === "recurring" ? (
                    <button type="button" onClick={() => setChange(o, { skip: true })} className={cn(smallBtn, "text-muted-foreground")}>
                      <SkipForward className="h-3.5 w-3.5" /> Skip this day
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => confirm("Delete this one-off post?") && updatePlanner((p) => ({ ...p, oneOffs: p.oneOffs.filter((x) => x.id !== o.oneOffId), posted: p.posted.filter((k) => k !== o.key) }))}
                      className={cn(smallBtn, "text-red-600")}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {skipped.length > 0 && (
          <div className="rounded-xl border border-dashed border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skipped on this day</p>
            {skipped.map((o) => (
              <p key={o.key} className="mt-1.5 flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-muted-foreground line-through">
                  {fmtTime(o.time)} · {tpl(o.templateId)?.title}
                </span>
                <button type="button" onClick={() => setChange(o, null)} className={smallBtn}>
                  <Undo2 className="h-3.5 w-3.5" /> Undo
                </button>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* one-off post */}
      <div className="mt-5 rounded-xl bg-secondary/50 p-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <CalendarPlus className="h-4 w-4 text-accent" /> Add a post on this day
        </p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_120px] gap-2">
          <TemplateSelect value={add.templateId} onChange={(v) => setAdd({ ...add, templateId: v })} templates={templates} />
          <input type="time" value={add.time} onChange={(e) => setAdd({ ...add, time: e.target.value })} aria-label="Time" className={inputCls} />
        </div>
        {openIdeas.length > 0 && (
          <select
            value={add.ideaId}
            onChange={(e) => setAdd({ ...add, ideaId: e.target.value, note: ideas.find((i) => i.id === e.target.value)?.title ?? add.note })}
            aria-label="From a topic idea"
            className={cn(inputCls, "mt-2")}
          >
            <option value="">From a topic idea (optional)…</option>
            {openIdeas.map((i) => (
              <option key={i.id} value={i.id}>
                P{i.priority} · {i.title}
                {i.status === "final" ? " ★" : ""}
              </option>
            ))}
          </select>
        )}
        <input value={add.note} onChange={(e) => setAdd({ ...add, note: e.target.value })} placeholder="Note, e.g. topic: ginger pests" aria-label="Note" className={cn(inputCls, "mt-2")} />
        <button
          type="button"
          disabled={!add.templateId}
          onClick={() => {
            updatePlanner((p) => ({
              ...p,
              oneOffs: [...p.oneOffs, { id: planId(), templateId: add.templateId, date, time: add.time, note: add.note.trim(), ...(add.ideaId ? { ideaId: add.ideaId } : {}) }],
              ideas: p.ideas.map((i) => (i.id === add.ideaId && i.status === "idea" ? { ...i, status: "final" } : i)),
            }));
            setAdd({ templateId: add.templateId, time: "", note: "", ideaId: "" });
          }}
          className={cn(smallBtn, "mt-2 w-full justify-center bg-foreground py-2 text-background hover:bg-foreground/90 disabled:opacity-40")}
        >
          <Plus className="h-4 w-4" /> Add one-off post
        </button>
      </div>
    </section>
  );
}

function TemplateSelect({ value, onChange, templates, placeholder = "Choose a template…" }: { value: string; onChange: (v: string) => void; templates: PlanTemplate[]; placeholder?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Template" className={inputCls}>
      <option value="">{placeholder}</option>
      {BRANDS.filter((b) => templates.some((t) => t.brand === b.id)).map((b) => (
        <optgroup key={b.id} label={b.name}>
          {templates
            .filter((t) => t.brand === b.id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

/* ---------- recurring schedule ---------- */

function RecurringManager({ planner, templates, tpl, platform }: { planner: Planner; templates: PlanTemplate[]; tpl: Tpl; platform: string }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{ templateId: string; days: Weekday[]; time: string; note: string }>({ templateId: "", days: [1, 2, 3, 4, 5], time: "", note: "" });
  const slots = effectiveSlots(planner, templates).filter((s) => tpl(s.templateId));
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Repeat className="h-6 w-6 text-accent" /> Recurring schedule
          </h2>
          <p className="text-sm text-muted-foreground">These repeat every week. A template can have several slots (e.g. weekdays 8:30 AM and Saturday 10:00 AM).</p>
          <label className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-accent" />
            Recurring posts start on
            <input
              type="date"
              value={planner.recurringFrom}
              onChange={(e) => updatePlanner((p) => ({ ...p, recurringFrom: e.target.value }))}
              aria-label="Recurring posts start on"
              className="rounded-lg border border-input bg-card px-2 py-1 text-sm outline-none focus:border-accent"
            />
            <span className="text-xs font-normal text-muted-foreground">
              {planner.recurringFrom ? `Nothing recurring before ${longDate(planner.recurringFrom)}; a slot can set a later start.` : "No start date: recurring posts show on every matching day."}
            </span>
          </label>
        </div>
        <button type="button" onClick={() => setAdding((v) => !v)} className={cn(smallBtn, "bg-foreground px-3 py-2 text-sm text-background hover:bg-foreground/90")}>
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {adding ? "Close" : "Add recurring slot"}
        </button>
      </div>

      {adding && (
        <div className="card-elevated mt-4 grid gap-3 rounded-2xl border border-accent/40 bg-card p-4 lg:grid-cols-[minmax(0,1.2fr)_auto_130px_minmax(0,1fr)_auto] lg:items-end">
          <label className="text-xs font-medium text-muted-foreground">
            Template
            <TemplateSelect value={draft.templateId} onChange={(v) => setDraft({ ...draft, templateId: v })} templates={templates} />
          </label>
          <div className="text-xs font-medium text-muted-foreground">
            Days
            <DayToggles days={draft.days} onChange={(d) => setDraft({ ...draft, days: d })} />
          </div>
          <label className="text-xs font-medium text-muted-foreground">
            Time
            <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className={inputCls} />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Note (optional)
            <input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="e.g. morning market update" className={inputCls} />
          </label>
          <button
            type="button"
            disabled={!draft.templateId || !draft.days.length}
            onClick={() => {
              updatePlanner((p) => ({ ...p, slots: [...p.slots, { id: planId(), templateId: draft.templateId, days: [...draft.days].sort(), time: draft.time, note: draft.note.trim(), active: true, from: "" }] }));
              setDraft({ ...draft, note: "" });
              setAdding(false);
            }}
            className={cn(smallBtn, "justify-center bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-40")}
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      )}

      <div className="mt-4 space-y-6">
        {BRANDS.filter((b) => slots.some((s) => tpl(s.templateId)?.brand === b.id)).map((b) => (
          <div key={b.id}>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="h-3 w-3 rounded-full" style={{ background: b.ui.from }} /> {b.name}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {slots
                .filter((s) => tpl(s.templateId)?.brand === b.id)
                .map((s, i) => (
                  <div key={s.id} className={cn("grid items-center gap-3 p-3 lg:grid-cols-[minmax(0,1.3fr)_auto_130px_minmax(0,1fr)_auto]", i > 0 && "border-t border-border", !s.active && "opacity-55")}>
                    <div className="min-w-0">
                      <Link to="/social/$platform/$template" params={{ platform, template: s.templateId }} className="block truncate font-semibold hover:text-accent">
                        {tpl(s.templateId)?.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDays(s.days)} · {fmtTime(s.time)}
                        {slotStart(s, planner) && <> · from {shortDate(slotStart(s, planner))}</>}
                        {s.implicit && (
                          <span className="ml-1 whitespace-nowrap rounded bg-secondary px-1.5 py-0.5" title="The template's default days. Change the time, days or note to make it your own slot.">
                            default days
                          </span>
                        )}
                        {!s.active && <span className="ml-1 rounded bg-secondary px-1.5 py-0.5">paused</span>}
                      </p>
                      <label className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground" title="Leave empty to follow “Recurring posts start on”">
                        Starts
                        <input
                          type="date"
                          value={s.from ?? ""}
                          onChange={(e) => setSlot(s, { from: e.target.value })}
                          aria-label="This slot starts on"
                          className="rounded-md border border-input bg-card px-1.5 py-0.5 text-[11px] outline-none focus:border-accent"
                        />
                        {!s.from && planner.recurringFrom && <span>(overall start)</span>}
                      </label>
                    </div>
                    <DayToggles days={s.days} onChange={(d) => setSlot(s, { days: d })} />
                    <input type="time" value={s.time} onChange={(e) => setSlot(s, { time: e.target.value })} aria-label="Time" className={inputCls} />
                    <input defaultValue={s.note} key={s.note} onBlur={(e) => e.target.value !== s.note && setSlot(s, { note: e.target.value.trim() })} placeholder="Note" aria-label="Note" className={inputCls} />
                    <div className="flex gap-1.5">
                      <IconBtn label={s.active ? "Pause this slot" : "Resume this slot"} onClick={() => setSlot(s, { active: !s.active })}>
                        {s.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </IconBtn>
                      <IconBtn
                        label={s.implicit ? "Template default (pause it instead)" : "Delete this slot"}
                        disabled={s.implicit}
                        onClick={() => confirm(`Delete this recurring slot (${tpl(s.templateId)?.title}, ${formatDays(s.days)})?`) && removeSlot(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
        {!slots.length && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No recurring slots yet. Add one to fill the calendar.</p>}
      </div>
    </section>
  );
}

function DayToggles({ days, onChange }: { days: Weekday[]; onChange: (d: Weekday[]) => void }) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {WEEK.map((d) => {
        const on = days.includes(d);
        return (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            title={DAY_LONG[d]}
            onClick={() => onChange(on ? days.filter((x) => x !== d) : ([...days, d].sort() as Weekday[]))}
            className={cn("h-8 w-9 rounded-md text-[11px] font-bold transition-colors", on ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70")}
          >
            {DAY_SHORT[d].slice(0, 2)}
          </button>
        );
      })}
      <span className="ml-1 flex gap-1">
        <button type="button" onClick={() => onChange([0, 1, 2, 3, 4, 5, 6])} className="rounded px-1.5 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-secondary">
          All
        </button>
        <button type="button" onClick={() => onChange([1, 2, 3, 4, 5])} className="rounded px-1.5 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-secondary">
          Mon–Fri
        </button>
      </span>
    </div>
  );
}

const inputCls = "mt-0.5 w-full rounded-lg border border-input bg-card px-2.5 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const smallBtn = "inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary";
