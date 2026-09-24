import type { ReactNode } from "react";
import {
  ArrowRight,
  BookMarked,
  CircleCheck,
  Info,
  Lightbulb,
  Quote,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A top-level heading in a session; these build the "On this page" list. */
export function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section className="note-section mt-6 rounded-3xl px-5 py-6 first:mt-0 md:px-8 md:py-7">
      <h2 id={id ?? slugify(title)} data-toc className="flex scroll-mt-24 items-center gap-3 font-display text-2xl font-semibold">
        <span className="note-section-dot h-3 w-3 shrink-0 rounded-full" />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const CALLOUTS = {
  note: { icon: Info, label: "Note", cls: "border-accent/40 bg-accent/5", ic: "text-accent" },
  tip: { icon: Lightbulb, label: "Tip", cls: "border-gold/40 bg-gold/8", ic: "text-gold" },
  rule: { icon: CircleCheck, label: "Rule", cls: "border-bull/40 bg-bull/6", ic: "text-bull" },
  warning: { icon: TriangleAlert, label: "Watch out", cls: "border-bear/40 bg-bear/6", ic: "text-bear" },
  risk: { icon: ShieldAlert, label: "Risk", cls: "border-bear/40 bg-bear/6", ic: "text-bear" },
  definition: { icon: BookMarked, label: "Definition", cls: "border-primary/30 bg-secondary", ic: "text-primary" },
} as const;

export type CalloutKind = keyof typeof CALLOUTS;

/** A boxed note: note, tip, rule, warning, risk or definition. */
export function Callout({ kind = "note", title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const c = CALLOUTS[kind];
  const Icon = c.icon;
  return (
    <aside className={cn("my-5 rounded-xl border px-4 py-3.5", c.cls)}>
      <p className={cn("flex items-center gap-2 text-sm font-semibold", c.ic)}>
        <Icon className="h-4 w-4" />
        {title ?? c.label}
      </p>
      <div className="note-prose mt-1.5 text-[15px]">{children}</div>
    </aside>
  );
}

/** Something the mentor said, word for word or close to it. */
export function MentorQuote({ children, who = "Dr. Sherlymon Abraham" }: { children: ReactNode; who?: string }) {
  return (
    <figure className="my-6 rounded-xl border-l-4 border-accent bg-card px-5 py-4 card-elevated">
      <Quote className="h-5 w-5 text-accent/60" />
      <blockquote className="mt-1 font-display text-lg leading-snug">{children}</blockquote>
      <figcaption className="mt-2 text-xs text-muted-foreground">— {who}</figcaption>
    </figure>
  );
}

/** Numbered key takeaways. */
export function KeyPoints({ items, title = "Key points" }: { items: ReactNode[]; title?: string }) {
  return (
    <div className="my-6">
      <p className="eyebrow mb-3">{title}</p>
      <ol className="space-y-2">
        {items.map((k, i) => (
          <li key={i} className="flex items-start gap-3 rounded-lg border-l-[3px] border-accent bg-secondary/70 py-2.5 pl-3 pr-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
              {i + 1}
            </span>
            <span className="leading-relaxed">{k}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Glossary-style list of terms. */
export function Terms({ items }: { items: { term: ReactNode; def: ReactNode; abbr?: string }[] }) {
  return (
    <dl className="my-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-[minmax(9rem,auto)_1fr]">
      {items.map((t, i) => (
        <div key={i} className="contents">
          <dt className="bg-secondary px-4 py-3 font-display font-semibold">
            {t.term}
            {t.abbr && <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">{t.abbr}</span>}
          </dt>
          <dd className="bg-card px-4 py-3 text-[15px] leading-relaxed">{t.def}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Numbered vertical steps — a procedure or a checklist. */
export function Steps({ items }: { items: { title: ReactNode; body?: ReactNode }[] }) {
  return (
    <ol className="relative my-6 space-y-5 pl-10">
      <span className="absolute bottom-3 left-[13px] top-3 w-px bg-border" />
      {items.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-accent bg-card font-mono text-xs font-semibold text-accent">
            {i + 1}
          </span>
          <p className="pt-0.5 font-display font-semibold">{s.title}</p>
          {s.body && <div className="mt-1 text-[15px] text-muted-foreground">{s.body}</div>}
        </li>
      ))}
    </ol>
  );
}

/** A left-to-right chain: condition → condition → outcome. Wraps on phones. */
export function Flow({ items }: { items: ReactNode[] }) {
  return (
    <div className="my-6 flex flex-wrap items-center gap-2">
      {items.map((x, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              i === items.length - 1
                ? "border-accent bg-accent font-medium text-accent-foreground"
                : "border-border bg-card",
            )}
          >
            {x}
          </span>
          {i < items.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </div>
      ))}
    </div>
  );
}

export type Tone = "bull" | "bear" | "neutral";

const TONE = {
  bull: { bar: "bg-bull", text: "text-bull", label: "Bullish" },
  bear: { bar: "bg-bear", text: "text-bear", label: "Bearish" },
  neutral: { bar: "bg-neutral-tone", text: "text-neutral-tone", label: "Neutral" },
};

/** Scenario cards: "if this happens → read it like this". */
export function Scenarios({
  items,
}: {
  items: { when: ReactNode; then: ReactNode; tone?: Tone; tag?: string }[];
}) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      {items.map((s, i) => {
        const t = TONE[s.tone ?? "neutral"];
        return (
          <div key={i} className="card-elevated relative overflow-hidden rounded-xl border border-border bg-card p-4 pl-5">
            <span className={cn("absolute inset-y-0 left-0 w-1", t.bar)} />
            <p className={cn("eyebrow", t.text)}>{s.tag ?? t.label}</p>
            <p className="mt-1.5 text-[15px]">
              <span className="font-semibold">If </span>
              {s.when}
            </p>
            <p className="mt-2 flex gap-1.5 text-[15px] text-muted-foreground">
              <ArrowRight className={cn("mt-1 h-4 w-4 shrink-0", t.text)} />
              <span>{s.then}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Comparison table. A cell can be plain content or { v, tone } to colour it. */
export function Compare({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: (ReactNode | { v: ReactNode; tone: Tone })[][];
  caption?: string;
}) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[32rem] border-collapse text-left text-[15px]">
          <thead>
            <tr className="bg-secondary">
              {columns.map((c, i) => (
                <th key={i} className="px-4 py-2.5 font-display text-sm font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border align-top">
                {r.map((cell, j) => {
                  const toned = cell && typeof cell === "object" && "tone" in cell && "v" in cell;
                  return (
                    <td
                      key={j}
                      className={cn(
                        "px-4 py-2.5",
                        j === 0 && "font-medium",
                        toned && TONE[(cell as { tone: Tone }).tone].text,
                      )}
                    >
                      {toned ? (cell as { v: ReactNode }).v : (cell as ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

/** Side-by-side columns that stack on phones. */
export function Columns({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={cn("my-6 grid gap-4", cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>{children}</div>;
}

/** A plain titled card, handy inside Columns. */
export function Panel({ title, tone, children }: { title?: ReactNode; tone?: Tone; children: ReactNode }) {
  return (
    <div className="card-elevated rounded-xl border border-border bg-card p-4">
      {title && <p className={cn("font-display font-semibold", tone && TONE[tone].text)}>{title}</p>}
      <div className="note-prose mt-1.5 text-[15px]">{children}</div>
    </div>
  );
}

/** Inline highlighted term. */
export function Hl({ children, tone }: { children: ReactNode; tone?: Tone }) {
  return (
    <mark
      className={cn(
        "rounded px-1 py-px font-medium",
        tone ? cn(TONE[tone].text, "bg-transparent underline decoration-2 underline-offset-2") : "bg-gold/20 text-foreground",
      )}
    >
      {children}
    </mark>
  );
}
