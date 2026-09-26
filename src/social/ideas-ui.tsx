import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, CalendarPlus, Check, CircleCheckBig, LayoutTemplate, Lightbulb, Pencil, Plus, RotateCcw, Search, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRANDS } from "@/branding/brands";
import type { SocialPlatform } from "@/social/registry";
import { DAY_SHORT } from "@/social/schedule";
import { fmtTime, isoDate, parseIso, planId, updatePlanner, usePlanner, type IdeaStatus, type OneOffPost, type PlanTemplate, type Priority, type TopicIdea } from "@/social/planner";

/*
 * Topic ideas: ad hoc post / video topics with a priority (P1–P5) and free notes (video
 * references, key points). A finalized idea is scheduled onto the calendar as a one-off post
 * (the post keeps the idea's id); an idea can be scheduled more than once.
 */

export const PRIORITIES: Priority[] = [1, 2, 3, 4, 5];
const PRIORITY_STYLE: Record<Priority, string> = {
  1: "bg-red-600 text-white",
  2: "bg-orange-500 text-white",
  3: "bg-amber-400 text-amber-950",
  4: "bg-sky-500 text-white",
  5: "bg-slate-400 text-white",
};
const STATUS_LABEL: Record<IdeaStatus, string> = { idea: "Idea", final: "Finalized", done: "Done" };
type Filter = "open" | "idea" | "final" | "scheduled" | "done" | "all";
const FILTERS: [Filter, string][] = [
  ["open", "Open"],
  ["idea", "Ideas"],
  ["final", "Finalized"],
  ["scheduled", "Scheduled"],
  ["done", "Done"],
  ["all", "All"],
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (s: string) => {
  const d = parseIso(s);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
const brandOf = (id: string) => BRANDS.find((b) => b.id === id);

type Draft = { title: string; priority: Priority; brand: string; templates: string[]; notes: string };
const EMPTY_DRAFT: Draft = { title: "", priority: 3, brand: "", templates: [], notes: "" };

const setIdea = (id: string, patch: Partial<TopicIdea>) => updatePlanner((p) => ({ ...p, ideas: p.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

export function IdeasScreen({ platform: pf, focus }: { platform: SocialPlatform; focus?: string }) {
  const planner = usePlanner();
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(isoDate(new Date())), []);
  const [filter, setFilter] = useState<Filter>("open");
  const [brand, setBrand] = useState<string>("all");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const templates: PlanTemplate[] = useMemo(() => pf.templates.map((t) => ({ id: t.id, title: t.title, brand: t.brand, schedule: t.schedule })), [pf]);
  const postsOf = (id: string) => planner.oneOffs.filter((o) => o.ideaId === id).sort((a, b) => a.date.localeCompare(b.date));

  useEffect(() => {
    if (!focus || !planner.ideas.some((i) => i.id === focus)) return;
    setFilter("all");
    requestAnimationFrame(() => document.getElementById(`idea-${focus}`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
  }, [focus, planner.ideas.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!today) return <div className="mt-10 text-sm text-muted-foreground">Loading topic ideas…</div>;

  const upcoming = (id: string) => postsOf(id).filter((o) => o.date >= today);
  const matches = (i: TopicIdea) => {
    if (brand !== "all" && i.brand !== brand && i.brand !== "") return false;
    const text = q.trim().toLowerCase();
    if (text && !`${i.title}\n${i.notes}`.toLowerCase().includes(text)) return false;
    if (filter === "all") return true;
    if (filter === "open") return i.status !== "done";
    if (filter === "scheduled") return i.status !== "done" && upcoming(i.id).length > 0;
    return i.status === filter;
  };
  const list = planner.ideas.filter(matches).sort((a, b) => a.priority - b.priority || (b.created || "").localeCompare(a.created || "") || a.title.localeCompare(b.title));
  const open = planner.ideas.filter((i) => i.status !== "done");

  function add(d: Draft) {
    updatePlanner((p) => ({ ...p, ideas: [...p.ideas, { id: planId(), title: d.title.trim(), priority: d.priority, status: "idea", brand: d.brand, templates: d.templates, notes: d.notes.trim(), created: today! }] }));
    setAdding(false);
  }

  return (
    <div>
      <header className="relative mt-4 overflow-hidden rounded-3xl px-6 py-7 text-white shadow-xl md:px-10" style={{ background: pf.gradient }}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <Lightbulb className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">{pf.name}</p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Topic ideas</h1>
          </div>
          <Link to="/social/$platform/planner" params={{ platform: pf.id }} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25">
            <CalendarClock className="h-4 w-4" /> Content planner
          </Link>
          <Link to="/social/$platform" params={{ platform: pf.id }} className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25">
            ← Templates
          </Link>
        </div>
        <p className="mt-3 max-w-3xl text-white/90">Ad hoc post and video topics. Give each a priority and notes, finalize it, then schedule it on the calendar as a one-off post.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Stat label="Open" value={open.length} />
          <Stat label="P1" value={open.filter((i) => i.priority === 1).length} />
          <Stat label="Finalized, not scheduled" value={open.filter((i) => i.status === "final" && !upcoming(i.id).length).length} />
          <Stat label="Scheduled ahead" value={open.filter((i) => upcoming(i.id).length).length} />
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap overflow-hidden rounded-xl border border-border bg-card" role="radiogroup" aria-label="Show">
          {FILTERS.map(([f, l]) => (
            <button key={f} type="button" role="radio" aria-checked={filter === f} onClick={() => setFilter(f)} className={cn("px-3.5 py-2 text-sm font-semibold", filter === f ? "bg-foreground text-background" : "hover:bg-secondary")}>
              {l}
            </button>
          ))}
        </div>
        <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles and notes" aria-label="Search ideas" className={cn(inputCls, "mt-0 pl-8")} />
        </label>
        <span className="flex-1" />
        <button type="button" onClick={() => setAdding((v) => !v)} className={cn(smallBtn, "bg-foreground px-3 py-2 text-sm text-background hover:bg-foreground/90")}>
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {adding ? "Close" : "New topic"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill active={brand === "all"} onClick={() => setBrand("all")}>
          All accounts
        </Pill>
        {BRANDS.map((b) => (
          <Pill key={b.id} active={brand === b.id} onClick={() => setBrand(b.id)} color={b.ui.from}>
            {b.name}
          </Pill>
        ))}
      </div>

      {adding && (
        <div className="card-elevated mt-4 rounded-2xl border border-accent/40 bg-card p-4">
          <IdeaForm templates={templates} initial={{ ...EMPTY_DRAFT, brand: brand === "all" ? "" : brand }} submitLabel="Add topic" onSubmit={add} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="mt-5 space-y-3">
        {list.map((i) => (
          <IdeaCard key={i.id} idea={i} posts={postsOf(i.id)} today={today} templates={templates} platform={pf.id} highlight={i.id === focus} posted={planner.posted} />
        ))}
        {!list.length && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {planner.ideas.length ? "No topics match this filter." : "No topics yet. Click “New topic” to note your first idea."}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm ring-1 ring-white/25">
      <span className="text-white/85">{label}</span>
      <b className="font-display text-lg leading-none">{value}</b>
    </span>
  );
}

function Pill({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium", active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-secondary")}>
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

export function PriorityBadge({ p, className }: { p: Priority; className?: string }) {
  return <span className={cn("inline-flex items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold", PRIORITY_STYLE[p], className)}>P{p}</span>;
}

function IdeaForm({ templates, initial, submitLabel, onSubmit, onCancel }: { templates: PlanTemplate[]; initial: Draft; submitLabel: string; onSubmit: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const inBrand = (t: PlanTemplate, brand: string) => !brand || t.brand === brand;
  const toggle = (id: string) => setD({ ...d, templates: d.templates.includes(id) ? d.templates.filter((x) => x !== id) : [...d.templates, id] });
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_200px] md:items-end">
        <label className="text-xs font-medium text-muted-foreground">
          Topic
          <input autoFocus value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="e.g. How to read an open auction in the first 30 minutes" className={inputCls} />
        </label>
        <div className="text-xs font-medium text-muted-foreground">
          Priority
          <div className="mt-0.5 flex gap-1" role="radiogroup" aria-label="Priority">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={d.priority === p}
                onClick={() => setD({ ...d, priority: p })}
                className={cn("h-9 w-11 rounded-lg font-mono text-sm font-bold transition", d.priority === p ? PRIORITY_STYLE[p] : "bg-secondary text-muted-foreground hover:bg-secondary/70")}
              >
                P{p}
              </button>
            ))}
          </div>
        </div>
        <label className="text-xs font-medium text-muted-foreground">
          Account
          <select
            value={d.brand}
            onChange={(e) => {
              const brand = e.target.value;
              // keep only picked templates that belong to the new account
              setD({ ...d, brand, templates: d.templates.filter((id) => templates.some((t) => t.id === id && inBrand(t, brand))) });
            }}
            className={inputCls}
          >
            <option value="">Any account</option>
            {BRANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        <span className="flex flex-wrap items-baseline gap-2">
          Templates this topic can be used with
          <span className="font-normal">{d.templates.length ? `${d.templates.length} selected` : "none selected = any template"}</span>
          {d.templates.length > 0 && (
            <button type="button" onClick={() => setD({ ...d, templates: [] })} className="font-semibold text-accent hover:underline">
              Clear
            </button>
          )}
        </span>
        <div className="mt-1 space-y-2">
          {BRANDS.filter((b) => (!d.brand || b.id === d.brand) && templates.some((t) => t.brand === b.id)).map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.ui.from }} /> {b.name}
              </span>
              {templates
                .filter((t) => t.brand === b.id)
                .map((t) => {
                  const on = d.templates.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(t.id)}
                      className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition", on ? "border-violet-600 bg-violet-600 text-white" : "border-border bg-card text-foreground hover:bg-secondary")}
                    >
                      {on && <Check className="h-3 w-3" />}
                      {t.title}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      <label className="text-xs font-medium text-muted-foreground">
        Notes: video references, key points
        <textarea
          value={d.notes}
          onChange={(e) => setD({ ...d, notes: e.target.value })}
          rows={6}
          placeholder={"https://www.youtube.com/watch?v=…\n- key point 1\n- key point 2"}
          className={cn(inputCls, "resize-y font-normal leading-relaxed")}
        />
      </label>
      <div className="flex gap-2">
        <button type="button" disabled={!d.title.trim()} onClick={() => onSubmit(d)} className={cn(smallBtn, "bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-40")}>
          <Check className="h-4 w-4" /> {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={cn(smallBtn, "px-4 py-2 text-sm")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Notes with line breaks kept and links clickable. */
export function Notes({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85 [overflow-wrap:anywhere]">
      {parts.map((s, i) =>
        i % 2 ? (
          <a key={i} href={s} target="_blank" rel="noreferrer" className="font-medium text-accent underline underline-offset-2 hover:opacity-80">
            {s}
          </a>
        ) : (
          s
        ),
      )}
    </p>
  );
}

function IdeaCard({ idea: i, posts, today, templates, platform, highlight, posted }: { idea: TopicIdea; posts: OneOffPost[]; today: string; templates: PlanTemplate[]; platform: string; highlight: boolean; posted: string[] }) {
  const [editing, setEditing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const b = brandOf(i.brand);
  const tplTitle = (id: string) => templates.find((t) => t.id === id)?.title ?? id;

  if (editing)
    return (
      <div id={`idea-${i.id}`} className="card-elevated rounded-2xl border border-accent/40 bg-card p-4">
        <IdeaForm
          templates={templates}
          initial={{ title: i.title, priority: i.priority, brand: i.brand, templates: i.templates, notes: i.notes }}
          submitLabel="Save"
          onSubmit={(d) => (setIdea(i.id, { title: d.title.trim(), priority: d.priority, brand: d.brand, templates: d.templates, notes: d.notes.trim() }), setEditing(false))}
          onCancel={() => setEditing(false)}
        />
      </div>
    );

  return (
    <div
      id={`idea-${i.id}`}
      className={cn("rounded-2xl border bg-card p-4", i.status === "done" && "opacity-60", highlight ? "border-accent ring-2 ring-accent/40" : i.status === "final" ? "border-emerald-300" : "border-border")}
      style={b ? { borderLeft: `4px solid ${b.ui.from}` } : undefined}
    >
      <div className="flex flex-wrap items-start gap-3">
        <select
          value={i.priority}
          onChange={(e) => setIdea(i.id, { priority: Number(e.target.value) as Priority })}
          aria-label="Priority"
          title="Change priority"
          className={cn("cursor-pointer appearance-none rounded-md px-2 py-1 text-center font-mono text-sm font-bold outline-none", PRIORITY_STYLE[i.priority])}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p} className="bg-card text-foreground">
              P{p}
            </option>
          ))}
        </select>
        <div className="min-w-0 flex-1">
          <p className={cn("font-display text-lg font-bold leading-snug", i.status === "done" && "line-through")}>{i.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className={cn("rounded-full px-2 py-0.5 font-semibold", i.status === "final" ? "bg-emerald-100 text-emerald-900" : i.status === "done" ? "bg-secondary text-muted-foreground" : "bg-amber-100 text-amber-900")}>{STATUS_LABEL[i.status]}</span>
            {b ? (
              <span className="rounded-full px-2 py-0.5 font-semibold text-white" style={{ background: b.ui.from }}>
                {b.name}
              </span>
            ) : (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">Any account</span>
            )}
            {i.created && <span className="text-muted-foreground">added {shortDate(i.created)}</span>}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
            <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
            {i.templates.length ? (
              i.templates.map((id) => (
                <span key={id} className="rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 font-medium text-violet-900">
                  {tplTitle(id)}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">Any template</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {i.status === "idea" && (
            <button type="button" onClick={() => setIdea(i.id, { status: "final" })} className={cn(smallBtn, "text-emerald-700")}>
              <Star className="h-3.5 w-3.5" /> Finalize
            </button>
          )}
          {i.status !== "done" && (
            <button type="button" onClick={() => setScheduling((v) => !v)} className={cn(smallBtn, i.status === "final" && "border-violet-600 bg-violet-600 text-white hover:bg-violet-700")}>
              <CalendarPlus className="h-3.5 w-3.5" /> Schedule
            </button>
          )}
          <button type="button" onClick={() => setEditing(true)} className={smallBtn} title="Edit">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          {i.status === "done" ? (
            <button type="button" onClick={() => setIdea(i.id, { status: "final" })} className={smallBtn}>
              <RotateCcw className="h-3.5 w-3.5" /> Reopen
            </button>
          ) : (
            <>
              {i.status === "final" && (
                <button type="button" onClick={() => setIdea(i.id, { status: "idea" })} className={cn(smallBtn, "text-muted-foreground")} title="Back to idea">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button type="button" onClick={() => setIdea(i.id, { status: "done" })} className={cn(smallBtn, "text-muted-foreground")} title="Done with this topic">
                <CircleCheckBig className="h-3.5 w-3.5" /> Done
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() =>
              confirm(`Delete the topic “${i.title}”?${posts.length ? " Its scheduled posts stay on the calendar." : ""}`) &&
              updatePlanner((p) => ({ ...p, ideas: p.ideas.filter((x) => x.id !== i.id), oneOffs: p.oneOffs.map((o) => (o.ideaId === i.id ? { ...o, ideaId: undefined } : o)) }))
            }
            className={cn(smallBtn, "text-red-600")}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {i.notes && (
        <div className="mt-3 rounded-xl bg-secondary/50 p-3">
          <Notes text={i.notes} />
        </div>
      )}

      {posts.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-muted-foreground">On the calendar:</span>
          {posts.map((o) => {
            const done = posted.includes(`once:${o.id}`);
            return (
              <Link
                key={o.id}
                to="/social/$platform/planner"
                params={{ platform }}
                className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium hover:border-accent", done ? "border-emerald-300 bg-emerald-50 text-emerald-900" : o.date < today ? "border-border text-muted-foreground" : "border-violet-300 bg-violet-50 text-violet-900")}
              >
                {done && <Check className="h-3 w-3" />}
                {shortDate(o.date)}
                {o.time && ` · ${fmtTime(o.time)}`} · {tplTitle(o.templateId)}
              </Link>
            );
          })}
        </div>
      )}

      {scheduling && <ScheduleForm idea={i} today={today} templates={templates} onDone={() => setScheduling(false)} />}
    </div>
  );
}

function ScheduleForm({ idea, today, templates, onDone }: { idea: TopicIdea; today: string; templates: PlanTemplate[]; onDone: () => void }) {
  const choices = idea.templates.length ? templates.filter((t) => idea.templates.includes(t.id)) : templates.filter((t) => !idea.brand || t.brand === idea.brand);
  const [s, setS] = useState({ templateId: choices.length === 1 ? choices[0].id : "", date: today, time: "" });
  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-violet-200 bg-violet-50/50 p-3 sm:grid-cols-[minmax(0,1fr)_150px_120px_auto] sm:items-end">
      <label className="text-xs font-medium text-muted-foreground">
        Template
        <select value={s.templateId} onChange={(e) => setS({ ...s, templateId: e.target.value })} className={inputCls}>
          <option value="">Choose a template…</option>
          {BRANDS.filter((b) => choices.some((t) => t.brand === b.id)).map((b) => (
            <optgroup key={b.id} label={b.name}>
              {choices
                .filter((t) => t.brand === b.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium text-muted-foreground">
        Date
        <input type="date" value={s.date} onChange={(e) => setS({ ...s, date: e.target.value })} className={inputCls} />
      </label>
      <label className="text-xs font-medium text-muted-foreground">
        Time
        <input type="time" value={s.time} onChange={(e) => setS({ ...s, time: e.target.value })} className={inputCls} />
      </label>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={!s.templateId || !s.date}
          onClick={() => {
            updatePlanner((p) => ({
              ...p,
              oneOffs: [...p.oneOffs, { id: planId(), templateId: s.templateId, date: s.date, time: s.time, note: idea.title, ideaId: idea.id }],
              ideas: p.ideas.map((x) => (x.id === idea.id && x.status === "idea" ? { ...x, status: "final" } : x)),
            }));
            onDone();
          }}
          className={cn(smallBtn, "bg-violet-600 px-3 py-2 text-white hover:bg-violet-700 disabled:opacity-40")}
        >
          <CalendarPlus className="h-4 w-4" /> Add to calendar
        </button>
        <button type="button" onClick={onDone} className={cn(smallBtn, "py-2")} aria-label="Cancel">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const inputCls = "mt-0.5 w-full rounded-lg border border-input bg-card px-2.5 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const smallBtn = "inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary";
