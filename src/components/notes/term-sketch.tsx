import type { ReactNode } from "react";

/*
 * Small profile sketches that highlight the part of a profile a term refers to.
 * Rows are drawn top (high price) to bottom (low price).
 */

export type TermKind =
  | "buying-tail"
  | "selling-tail"
  | "vah"
  | "val"
  | "poc"
  | "single-print"
  | "virgin-poc"
  | "half-back"
  | "tpo"
  | "value-area";

const BASE = [1, 2, 4, 6, 8, 9, 10, 9, 7, 5, 3, 2];
const W = 150;
const R = 11;
const X0 = 30;
const UNIT = 9;

const C = {
  bar: "fill-accent/40",
  va: "fill-accent/75",
  key: "fill-gold",
  bear: "fill-bear",
  bull: "fill-bull",
};

function Bars({ counts, cls, x = X0, y0 = 8 }: { counts: number[]; cls: (i: number) => string; x?: number; y0?: number }) {
  return (
    <>
      {counts.map((n, i) => (
        <rect key={i} x={x} y={y0 + i * R} width={n * UNIT} height={R - 2} rx={2} className={cls(i)} />
      ))}
    </>
  );
}

function Label({ y, children, cls = "fill-foreground" }: { y: number; children: ReactNode; cls?: string }) {
  return (
    <text x={4} y={y} dominantBaseline="central" className={`${cls} font-mono text-[9px] font-bold`}>
      {children}
    </text>
  );
}

export function TermSketch({ kind }: { kind: TermKind }) {
  const y = (i: number) => 8 + i * R + (R - 2) / 2;
  let body: ReactNode;

  switch (kind) {
    case "buying-tail": {
      const c = [2, 4, 6, 8, 9, 10, 8, 6, 4, 1, 1, 1];
      body = (
        <>
          <Bars counts={c} cls={(i) => (i >= 9 ? C.bull : C.bar)} />
          <text x={48} y={y(10)} dominantBaseline="central" className="fill-bull text-[10px] font-semibold">
            ← tail at the low
          </text>
        </>
      );
      break;
    }
    case "selling-tail": {
      const c = [1, 1, 1, 4, 6, 8, 10, 9, 8, 6, 4, 2];
      body = (
        <>
          <Bars counts={c} cls={(i) => (i <= 2 ? C.bear : C.bar)} />
          <text x={48} y={y(1)} dominantBaseline="central" className="fill-bear text-[10px] font-semibold">
            ← tail at the high
          </text>
        </>
      );
      break;
    }
    case "vah":
    case "val":
    case "value-area": {
      body = (
        <>
          <rect x={X0 - 3} y={8 + 3 * R - 1} width={W - X0} height={6 * R + 1} rx={3} className="fill-accent/10" />
          <Bars counts={BASE} cls={(i) => (i >= 3 && i <= 8 ? C.va : C.bar)} />
          {(kind === "vah" || kind === "value-area") && <Line y={8 + 3 * R - 1} label="VAH" hot={kind === "vah"} />}
          {(kind === "val" || kind === "value-area") && <Line y={8 + 9 * R - 1} label="VAL" hot={kind === "val"} />}
          {kind === "value-area" && (
            <text x={W - 4} y={y(6)} textAnchor="end" dominantBaseline="central" className="fill-accent text-[10px] font-bold">
              ~70%
            </text>
          )}
        </>
      );
      break;
    }
    case "poc":
      body = (
        <>
          <Bars counts={BASE} cls={(i) => (i === 6 ? C.key : C.bar)} />
          <Label y={y(6)} cls="fill-gold">POC</Label>
        </>
      );
      break;
    case "half-back":
      body = (
        <>
          <Bars counts={BASE} cls={(i) => (i === 5 ? C.bear : C.bar)} />
          <Label y={y(5)} cls="fill-bear">50%</Label>
          <line x1={X0} x2={W - 4} y1={8} y2={8} strokeDasharray="2 2" className="stroke-muted-foreground/50" />
          <line x1={X0} x2={W - 4} y1={8 + 12 * R - 2} y2={8 + 12 * R - 2} strokeDasharray="2 2" className="stroke-muted-foreground/50" />
        </>
      );
      break;
    case "single-print": {
      const c = [2, 4, 6, 5, 3, 1, 1, 1, 3, 5, 6, 3];
      body = (
        <>
          <Bars counts={c} cls={(i) => (i >= 5 && i <= 7 ? C.key : C.bar)} />
          <text x={48} y={y(6)} dominantBaseline="central" className="fill-gold text-[10px] font-semibold">
            ← single prints
          </text>
        </>
      );
      break;
    }
    case "virgin-poc": {
      const a = [1, 3, 5, 7, 5, 3, 1];
      const b = [2, 4, 6, 4, 2];
      body = (
        <>
          <Bars counts={a} cls={(i) => (i === 3 ? C.key : C.bar)} x={8} y0={8} />
          <line x1={8 + 7 * UNIT} x2={W - 2} y1={y(3)} y2={y(3)} strokeDasharray="4 3" strokeWidth={1.5} className="stroke-gold" />
          <Bars counts={b} cls={() => C.bar} x={90} y0={8 + 7 * R} />
          <text x={W - 2} y={y(3) - 8} textAnchor="end" className="fill-gold text-[9px] font-semibold">
            not revisited yet
          </text>
        </>
      );
      break;
    }
    case "tpo":
      body = (
        <>
          <rect x={52} y={40} width={34} height={34} rx={4} className="fill-bear" />
          <text x={69} y={58} textAnchor="middle" dominantBaseline="central" className="fill-white font-display text-[18px] font-bold">
            A
          </text>
          <text x={69} y={96} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            one letter · one price
          </text>
        </>
      );
      break;
  }

  return (
    <svg viewBox={`0 0 ${W} ${8 + 12 * R + 6}`} className="block h-auto w-full max-w-[170px]" aria-hidden>
      {body}
    </svg>
  );
}

function Line({ y, label, hot }: { y: number; label: string; hot: boolean }) {
  return (
    <>
      <line x1={X0 - 3} x2={W - 4} y1={y} y2={y} strokeWidth={hot ? 2 : 1} strokeDasharray="4 3" className={hot ? "stroke-gold" : "stroke-accent"} />
      <text x={4} y={y} dominantBaseline="central" className={`${hot ? "fill-gold" : "fill-accent"} font-mono text-[9px] font-bold`}>
        {label}
      </text>
    </>
  );
}

/** Glossary cards with a sketch of the term beside each definition. */
export function TermCards({
  items,
}: {
  items: { kind?: TermKind; term: string; abbr?: string; def: ReactNode; pending?: boolean }[];
}) {
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2">
      {items.map((t) => (
        <div key={t.term} className="card-elevated flex gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex w-32 shrink-0 items-center justify-center rounded-xl bg-secondary/60 p-2">
            {t.kind ? <TermSketch kind={t.kind} /> : <span className="font-display text-2xl font-bold text-muted-foreground">?</span>}
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-tight">{t.term}</p>
            {t.abbr && <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">{t.abbr}</p>}
            <div className="mt-2 text-[15px] leading-relaxed">{t.def}</div>
            {t.pending && (
              <p className="mt-2 inline-block rounded-full bg-amber-500/12 px-2 py-0.5 text-xs font-medium text-amber-700">
                Definition to be added
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
