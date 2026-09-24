import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/*
 * The same 30-minute periods drawn three ways: as candles, as one letter column per
 * period, and collapsed into the market profile.
 */

type Period = { letter: string; low: number; high: number; open: number; close: number };

const DEFAULT: Period[] = [
  { letter: "A", low: 4, high: 9, open: 8, close: 5 },
  { letter: "B", low: 2, high: 5, open: 5, close: 3 },
  { letter: "C", low: 3, high: 7, open: 3, close: 7 },
  { letter: "D", low: 5, high: 8, open: 7, close: 8 },
  { letter: "E", low: 7, high: 12, open: 8, close: 11 },
  { letter: "F", low: 8, high: 11, open: 11, close: 9 },
  { letter: "G", low: 6, high: 9, open: 9, close: 7 },
  { letter: "H", low: 5, high: 8, open: 7, close: 6 },
];

// rainbow like the TPO chart: early periods red, later ones blue
const HUE = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#a3e635", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"];

const CELL = 18;

export function CandleToProfile({
  periods = DEFAULT,
  caption,
  dayCandle = false,
}: {
  periods?: Period[];
  caption?: ReactNode;
  /** also show the whole day as one candle, next to the composite profile */
  dayCandle?: boolean;
}) {
  const lo = Math.min(...periods.map((p) => p.low));
  const hi = Math.max(...periods.map((p) => p.high));
  const rows = hi - lo + 1;
  const H = rows * CELL + 16;
  const y = (price: number) => 8 + (hi - price) * CELL;

  const collapsed = Array.from({ length: rows }, (_, r) => {
    const price = hi - r;
    return periods.filter((p) => price >= p.low && price <= p.high);
  });

  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-center gap-4 overflow-x-auto">
          <Panel label="30-min candles">
            <svg viewBox={`0 0 ${periods.length * 26 + 10} ${H}`} width={periods.length * 26 + 10} height={H}>
              <rect width="100%" height="100%" rx={10} fill="#0f1729" />
              {periods.map((p, i) => {
                const x = 12 + i * 26;
                const up = p.close >= p.open;
                const c = up ? "#84cc16" : "#f97316";
                const top = y(Math.max(p.open, p.close)) + CELL / 2;
                const bot = y(Math.min(p.open, p.close)) + CELL / 2;
                return (
                  <g key={p.letter}>
                    <line x1={x + 6} x2={x + 6} y1={y(p.high) + 2} y2={y(p.low) + CELL - 2} stroke={c} strokeWidth={1.5} />
                    <rect x={x} y={top} width={12} height={Math.max(bot - top, 3)} fill={c} rx={1.5} />
                  </g>
                );
              })}
            </svg>
          </Panel>

          <Arrow />

          <Panel label="split 30-min profile">
            <svg viewBox={`0 0 ${periods.length * CELL + 10} ${H}`} width={periods.length * CELL + 10} height={H}>
              <rect width="100%" height="100%" rx={10} fill="#0f1729" />
              {periods.map((p, i) =>
                Array.from({ length: p.high - p.low + 1 }, (_, k) => {
                  const price = p.high - k;
                  return <Tpo key={`${p.letter}${price}`} x={5 + i * CELL} y={y(price)} letter={p.letter} color={HUE[i % HUE.length]} />;
                }),
              )}
            </svg>
          </Panel>

          <Arrow />

          <Panel label="composite day profile">
            <svg
              viewBox={`0 0 ${Math.max(...collapsed.map((r) => r.length)) * CELL + 10} ${H}`}
              width={Math.max(...collapsed.map((r) => r.length)) * CELL + 10}
              height={H}
            >
              <rect width="100%" height="100%" rx={10} fill="#0f1729" />
              {collapsed.map((row, r) =>
                row.map((p, j) => (
                  <Tpo
                    key={`${r}-${p.letter}`}
                    x={5 + j * CELL}
                    y={8 + r * CELL}
                    letter={p.letter}
                    color={HUE[periods.indexOf(p) % HUE.length]}
                  />
                )),
              )}
            </svg>
          </Panel>

          {dayCandle && (
            <>
              <span className="mb-24 font-display text-2xl font-bold text-muted-foreground">=</span>
              <Panel label="day candle">
                <DayCandle periods={periods} H={H} y={y} />
              </Panel>
            </>
          )}
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Tpo({ x, y, letter, color }: { x: number; y: number; letter: string; color: string }) {
  return (
    <g>
      <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} rx={2} fill={color} />
      <text x={x + CELL / 2} y={y + CELL / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#0f1729">
        {letter}
      </text>
    </g>
  );
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function Arrow() {
  return <ArrowRight className="mb-24 h-6 w-6 shrink-0 text-muted-foreground" />;
}

function DayCandle({ periods, H, y }: { periods: Period[]; H: number; y: (price: number) => number }) {
  const open = periods[0].open;
  const close = periods[periods.length - 1].close;
  const high = Math.max(...periods.map((p) => p.high));
  const low = Math.min(...periods.map((p) => p.low));
  const c = close >= open ? "#84cc16" : "#f97316";
  const top = y(Math.max(open, close)) + CELL / 2;
  const bot = y(Math.min(open, close)) + CELL / 2;
  return (
    <svg viewBox={`0 0 60 ${H}`} width={60} height={H}>
      <rect width="100%" height="100%" rx={10} fill="#0f1729" />
      <line x1={30} x2={30} y1={y(high) + 2} y2={y(low) + CELL - 2} stroke={c} strokeWidth={2} />
      <rect x={16} y={top} width={28} height={Math.max(bot - top, 3)} fill={c} rx={2} />
    </svg>
  );
}