import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Pencil,
  Radio,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialTemplate } from "@/social/registry";
import {
  DAY_LONG,
  DAY_SHORT,
  WEEK,
  formatDays,
  nextDay,
  saveScheduleDays,
  type Weekday,
} from "@/social/schedule";

type Props = {
  template: SocialTemplate;
  days: Weekday[];
  today: Weekday | null;
};

/** "Live today" pill (pulsing) or "Next: Wed" / "Tomorrow" when not scheduled today. */
export function LiveBadge({
  days,
  today,
  live,
  className,
}: {
  days: Weekday[];
  today: Weekday | null;
  /** from the planner (includes one-off posts and skipped dates); default: today's weekday is in days */
  live?: boolean;
  className?: string;
}) {
  if (today === null) return null;
  if (live ?? days.includes(today))
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow",
          className,
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        Goes live today
      </span>
    );
  const n = nextDay(days, today);
  if (!n) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      <CalendarClock className="h-3.5 w-3.5" />
      {n.inDays === 1 ? "Next: tomorrow" : `Next: ${DAY_SHORT[n.day]}`}
    </span>
  );
}

/** Week strip: the 7 days, scheduled ones filled, today outlined. Editable when `editing`. */
function DayStrip({
  days,
  today,
  onToggle,
}: {
  days: Weekday[];
  today: Weekday | null;
  onToggle?: (d: Weekday) => void;
}) {
  return (
    <div className="flex gap-1">
      {WEEK.map((d) => {
        const on = days.includes(d);
        const isToday = d === today;
        const cls = cn(
          "flex h-7 w-8 items-center justify-center rounded-md text-[11px] font-bold transition-colors",
          on
            ? isToday
              ? "bg-emerald-500 text-white"
              : "bg-accent text-accent-foreground"
            : "bg-secondary text-muted-foreground",
          isToday && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-card",
          onToggle && "cursor-pointer hover:opacity-80",
        );
        return onToggle ? (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            title={DAY_LONG[d]}
            onClick={() => onToggle(d)}
            className={cls}
          >
            {DAY_SHORT[d].slice(0, 2)}
          </button>
        ) : (
          <span
            key={d}
            title={`${DAY_LONG[d]}${on ? " · scheduled" : ""}${isToday ? " · today" : ""}`}
            className={cls}
          >
            {DAY_SHORT[d].slice(0, 2)}
          </span>
        );
      })}
    </div>
  );
}

/** Schedule block for a template card / page: label, note, week strip, edit. */
export function ScheduleBlock({
  template,
  days,
  today,
  custom,
  time,
}: Props & { custom: boolean; time?: string }) {
  const [editing, setEditing] = useState(false);
  const toggle = (d: Weekday) =>
    saveScheduleDays(
      template.id,
      days.includes(d) ? days.filter((x) => x !== d) : [...days, d],
    );
  return (
    <div
      className="rounded-xl border border-border bg-secondary/40 p-3"
      onClick={(e) => editing && e.preventDefault()}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold">
          <CalendarDays className="h-3.5 w-3.5 text-accent" />
          {formatDays(days)}
          {time && <span className="font-normal text-muted-foreground">· {time}</span>}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditing((v) => !v);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Pencil className="h-3 w-3" /> {editing ? "Done" : "Edit"}
        </button>
      </div>
      {template.schedule.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{template.schedule.note}</p>}
      <div className="mt-2" onClick={(e) => editing && e.stopPropagation()}>
        <DayStrip
          days={days}
          today={today}
          onToggle={editing ? toggle : undefined}
        />
      </div>
      {editing && custom && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            saveScheduleDays(template.id, null);
          }}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
        >
          <RotateCcw className="h-3 w-3" /> Back to default (
          {formatDays(template.schedule.days)})
        </button>
      )}
    </div>
  );
}

/** Small header pill for the editor page. */
export function ScheduleInline({
  days,
  today,
}: {
  days: Weekday[];
  today: Weekday | null;
}) {
  const live = today !== null && days.includes(today);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        live
          ? "bg-emerald-500/15 text-emerald-700"
          : "bg-secondary text-muted-foreground",
      )}
    >
      {live ? (
        <Radio className="h-3.5 w-3.5" />
      ) : (
        <CalendarDays className="h-3.5 w-3.5" />
      )}
      {formatDays(days)}
    </span>
  );
}
