import type { ReactNode } from "react";

/*
 * Normal distribution with the standard-deviation bands shaded:
 * ±1σ 34.1% each side, ±2σ 13.6%, ±3σ 2.1%, beyond 0.1%.
 */

const pdf = (z: number) => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);

const BANDS = [
  { from: -3.6, to: -3, pct: "0.1%", op: 0.12 },
  { from: -3, to: -2, pct: "2.1%", op: 0.28 },
  { from: -2, to: -1, pct: "13.6%", op: 0.55 },
  { from: -1, to: 0, pct: "34.1%", op: 0.95 },
  { from: 0, to: 1, pct: "34.1%", op: 0.95 },
  { from: 1, to: 2, pct: "13.6%", op: 0.55 },
  { from: 2, to: 3, pct: "2.1%", op: 0.28 },
  { from: 3, to: 3.6, pct: "0.1%", op: 0.12 },
];

function samples(from: number, to: number, n = 24) {
  return Array.from({ length: n + 1 }, (_, i) => from + ((to - from) * i) / n);
}

/** Horizontal bell curve with σ bands and their percentages. */
export function BellCurve({ title, caption }: { title?: ReactNode; caption?: ReactNode }) {
  const W = 640;
  const BASE = 230;
  const X = (z: number) => 40 + ((z + 3.6) / 7.2) * (W - 80);
  const Y = (z: number) => BASE - pdf(z) * 500;
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        {title && <p className="mb-2 font-display font-semibold">{title}</p>}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} 270`} className="block h-auto w-full min-w-[480px]" role="img" aria-label="Bell curve with standard deviation bands">
            {BANDS.map((b, i) => {
              const pts = samples(b.from, b.to).map((z) => `${X(z)},${Y(z)}`);
              return (
                <polygon
                  key={i}
                  points={`${X(b.from)},${BASE} ${pts.join(" ")} ${X(b.to)},${BASE}`}
                  fill="var(--color-accent)"
                  fillOpacity={b.op}
                  stroke="white"
                  strokeWidth={1.5}
                />
              );
            })}
            <path
              d={samples(-3.6, 3.6, 120)
                .map((z, i) => `${i ? "L" : "M"}${X(z)} ${Y(z)}`)
                .join(" ")}
              className="fill-none stroke-primary"
              strokeWidth={2}
            />
            <line x1={30} x2={W - 30} y1={BASE} y2={BASE} className="stroke-foreground/40" />

            {BANDS.map((b, i) => {
              const mid = (b.from + b.to) / 2;
              const inner = Math.abs(mid) < 2;
              const y = inner ? BASE - (Math.abs(mid) < 1 ? 90 : 26) : Y(mid) - 12;
              return (
                <text
                  key={`t${i}`}
                  x={X(mid)}
                  y={y}
                  textAnchor="middle"
                  className={inner ? "fill-white text-[13px] font-bold" : "fill-foreground text-[11px] font-semibold"}
                >
                  {b.pct}
                </text>
              );
            })}
            {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
              <text key={z} x={X(z)} y={BASE + 20} textAnchor="middle" className="fill-muted-foreground font-mono text-[12px]">
                {z === 0 ? "0" : `${z > 0 ? "+" : "−"}${Math.abs(z)}σ`}
              </text>
            ))}
          </svg>
        </div>
        <div className="mt-3 grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-3">
          <SigmaStat range="±1σ" pct="68.2%" note="≈ the value area (~70%)" strong />
          <SigmaStat range="±2σ" pct="95.4%" />
          <SigmaStat range="±3σ" pct="99.7%" />
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function SigmaStat({ range, pct, note, strong }: { range: string; pct: string; note?: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${strong ? "bg-accent/10" : "bg-secondary/60"}`}>
      <span className="font-mono font-semibold">{range}</span> <span className="font-display text-lg font-bold">{pct}</span>
      {note && <span className="block text-xs text-accent">{note}</span>}
    </div>
  );
}

/** The bell curve turned on its side (price up the page), to set beside a profile. */
export function SidewaysBell({ height = 180 }: { height?: number }) {
  const W = 110;
  const Yz = (z: number) => 10 + ((3.3 - z) / 6.6) * (height - 20);
  const Xp = (z: number) => 6 + pdf(z) * 240;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width={W} height={height} aria-hidden>
      {BANDS.map((b, i) => {
        const from = Math.max(b.from, -3.3);
        const to = Math.min(b.to, 3.3);
        if (from >= to) return null;
        const pts = samples(from, to).map((z) => `${Xp(z)},${Yz(z)}`);
        return (
          <polygon
            key={i}
            points={`6,${Yz(from)} ${pts.join(" ")} 6,${Yz(to)}`}
            fill="var(--color-accent)"
            fillOpacity={b.op}
            stroke="white"
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}
