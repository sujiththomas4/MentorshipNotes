import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Circle, CircleCheck, Hourglass, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Colours for icon bubbles; "accent" follows the theme. */
const HUES = {
  accent: "var(--color-accent)",
  green: "oklch(0.55 0.11 160)",
  amber: "oklch(0.64 0.13 70)",
  red: "oklch(0.57 0.17 25)",
  violet: "oklch(0.52 0.13 300)",
  teal: "oklch(0.56 0.08 200)",
  navy: "oklch(0.36 0.07 252)",
} as const;

export type Hue = keyof typeof HUES;

/** A rounded square with an icon on a soft tint of its colour. */
export function IconBubble({
  icon: Icon,
  hue = "accent",
  size = "md",
}: {
  icon: LucideIcon;
  hue?: Hue;
  size?: "sm" | "md" | "lg";
}) {
  const c = HUES[hue];
  const box = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-11 w-11 rounded-xl",
    lg: "h-14 w-14 rounded-2xl",
  }[size];
  const ic = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" }[size];
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center", box)}
      style={{
        backgroundColor: `color-mix(in oklch, ${c} 14%, transparent)`,
        color: c,
      }}
    >
      <Icon className={ic} />
    </span>
  );
}

/** Grid of icon cards: a quick visual overview of topics, parts or features. */
export function IconGrid({
  items,
  cols = 3,
}: {
  items: {
    icon: LucideIcon;
    title: ReactNode;
    body?: ReactNode;
    hue?: Hue;
    tag?: string;
  }[];
  cols?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "my-6 grid gap-4 sm:grid-cols-2",
        cols === 3 && "xl:grid-cols-3",
        cols === 4 && "lg:grid-cols-3 2xl:grid-cols-4",
      )}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className="card-elevated flex gap-4 rounded-2xl border border-border bg-card p-4"
        >
          <IconBubble icon={it.icon} hue={it.hue} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-display font-semibold">
              {it.title}
              {it.tag && (
                <span className="rounded-full bg-secondary px-2 py-px font-sans text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {it.tag}
                </span>
              )}
            </p>
            {it.body && (
              <div className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                {it.body}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder for details still to come (settings, screenshots, notes). */
export function Pending({
  title = "To be added",
  children,
  images,
}: {
  title?: string;
  children?: ReactNode;
  images?: boolean;
}) {
  const Icon = images ? ImagePlus : Hourglass;
  return (
    <div className="my-5 flex gap-3 rounded-2xl border-2 border-dashed border-amber-400/50 bg-amber-50/60 px-4 py-3.5">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div className="text-[15px]">
        <p className="font-semibold text-amber-800">{title}</p>
        {children && <div className="mt-0.5 text-amber-900/75">{children}</div>}
      </div>
    </div>
  );
}

/** Tick list; items without `done` show an empty circle. */
export function Checklist({
  items,
  title,
}: {
  items: { text: ReactNode; done?: boolean; note?: ReactNode }[];
  title?: string;
}) {
  const done = items.filter((i) => i.done).length;
  return (
    <div className="card-elevated my-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        {title && <p className="font-display font-semibold">{title}</p>}
        <span className="text-xs text-muted-foreground">
          {done} / {items.length} done
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-bull transition-all"
          style={{ width: `${(done / Math.max(items.length, 1)) * 100}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            {it.done ? (
              <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-bull" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/50" />
            )}
            <span className="text-[15px]">
              <span className={cn(it.done && "text-muted-foreground")}>
                {it.text}
              </span>
              {it.note && (
                <span className="block text-sm text-muted-foreground">
                  {it.note}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Glossary as cards: icon, term, abbreviation, definition, optional example. */
export function Glossary({
  items,
}: {
  items: {
    icon: LucideIcon;
    term: string;
    abbr?: string;
    hue?: Hue;
    def: ReactNode;
    example?: ReactNode;
  }[];
}) {
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {items.map((t) => (
        <div
          key={t.term}
          id={`term-${t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          className="card-elevated flex flex-col rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <IconBubble icon={t.icon} hue={t.hue} />
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold leading-tight">
                {t.term}
              </p>
              {t.abbr && (
                <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                  {t.abbr}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 text-[15px] leading-relaxed">{t.def}</div>
          {t.example && (
            <div className="mt-3 rounded-xl bg-secondary/70 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Example: </span>
              {t.example}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** A clock-face dial with a big count in the middle, e.g. days in a balance ("market clock"). */
export function CountDial({
  value,
  unit,
  label,
  hue = "amber",
}: {
  value: ReactNode;
  unit?: string;
  label?: ReactNode;
  hue?: Hue;
}) {
  const c = HUES[hue];
  const R = 70;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 180 180" width={180} height={180} aria-hidden>
          <circle
            cx={90}
            cy={90}
            r={R + 12}
            fill={`color-mix(in oklch, ${c} 10%, transparent)`}
          />
          <circle
            cx={90}
            cy={90}
            r={R}
            fill="var(--color-card)"
            stroke={c}
            strokeWidth={4}
          />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r1 = i % 3 === 0 ? R - 12 : R - 7;
            return (
              <line
                key={i}
                x1={90 + Math.sin(a) * r1}
                y1={90 - Math.cos(a) * r1}
                x2={90 + Math.sin(a) * (R - 3)}
                y2={90 - Math.cos(a) * (R - 3)}
                stroke={c}
                strokeWidth={i % 3 === 0 ? 3 : 1.5}
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-4xl font-bold leading-none"
            style={{ color: c }}
          >
            {value}
          </span>
          {unit && (
            <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
      </div>
      {label && (
        <p className="mt-2 max-w-48 text-center text-sm font-medium">{label}</p>
      )}
    </div>
  );
}

/** Big numbers in a row, e.g. "30 min · per letter". */
export function StatStrip({
  items,
}: {
  items: { value: ReactNode; label: ReactNode; icon?: LucideIcon; hue?: Hue }[];
}) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s, i) => (
        <div
          key={i}
          className="card-elevated flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
        >
          {s.icon && <IconBubble icon={s.icon} hue={s.hue} size="sm" />}
          <div>
            <p className="font-display text-2xl font-bold leading-none">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
