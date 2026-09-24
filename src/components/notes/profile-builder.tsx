import { useEffect, useState, type ReactNode } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { analyseProfile } from "@/components/notes/profile-chart";
import { cn } from "@/lib/utils";

export type BuildPeriod = { letter: string; start: string; end: string; low: number; high: number };

// rainbow like the TPO chart: early periods red, later ones blue
const HUE = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#a3e635", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"];

const ROW = 22;
const CELL = 22;

/**
 * Step through a day period by period and watch the profile build: each 30-minute
 * period adds its letter at every price it traded.
 */
export function ProfileBuilder({
  periods,
  step,
  title,
  caption,
}: {
  periods: BuildPeriod[];
  /** price distance between rows */
  step: number;
  title?: ReactNode;
  caption?: ReactNode;
}) {
  const [shown, setShown] = useState(periods.length);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setShown((n) => {
        if (n >= periods.length) {
          setPlaying(false);
          return n;
        }
        return n + 1;
      });
    }, 1100);
    return () => clearInterval(t);
  }, [playing, periods.length]);

  const hi = Math.max(...periods.map((p) => p.high));
  const lo = Math.min(...periods.map((p) => p.low));
  const prices: number[] = [];
  for (let p = hi; p >= lo - 1e-9; p -= step) prices.push(Math.round(p * 100) / 100);

  const active = periods.slice(0, shown);
  const rows = prices.map((price) => active.filter((p) => price >= p.low - 1e-9 && price <= p.high + 1e-9));
  const counts = rows.map((r) => r.length);
  const traded = counts.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
  const top = Math.min(...traded);
  const bot = Math.max(...traded);
  const { poc, vahIdx, valIdx } = analyseProfile(
    prices.slice(top, bot + 1).map((price, i) => ({ price, tpos: "x".repeat(counts[top + i]) })),
  );
  const current = periods[shown - 1];
  const maxW = periods.length;
  const priceW = 64;
  const W = priceW + maxW * CELL + 16;
  const H = prices.length * ROW + 12;
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4 md:p-5">
        {title && <p className="mb-3 font-display font-semibold">{title}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (shown >= periods.length) setShown(1);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            aria-label="Previous period"
            onClick={() => {
              setPlaying(false);
              setShown((n) => Math.max(1, n - 1));
            }}
            className="rounded-lg border border-border p-2 hover:bg-secondary"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next period"
            onClick={() => {
              setPlaying(false);
              setShown((n) => Math.min(periods.length, n + 1));
            }}
            className="rounded-lg border border-border p-2 hover:bg-secondary"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <div className="ml-1 flex flex-wrap gap-1">
            {periods.map((p, i) => (
              <button
                key={p.letter}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setShown(i + 1);
                }}
                className={cn(
                  "h-9 min-w-9 rounded-lg px-2 font-mono text-sm font-bold transition",
                  i < shown ? "text-[#0f1729]" : "bg-secondary text-muted-foreground",
                  i === shown - 1 && "ring-2 ring-foreground ring-offset-2 ring-offset-card",
                )}
                style={i < shown ? { backgroundColor: HUE[i % HUE.length] } : undefined}
                title={`${p.letter}: ${p.start} – ${p.end}`}
              >
                {p.letter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[auto_1fr]">
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-none" role="img" aria-label={`Profile after period ${current.letter}`}>
              <rect width={W} height={H} rx={12} fill="#0f1729" />
              {/* value area and POC */}
              <rect x={priceW - 4} y={6 + (top + vahIdx) * ROW} width={maxW * CELL + 8} height={(valIdx - vahIdx + 1) * ROW} rx={5} fill="rgba(96,165,250,0.12)" />
              <rect x={priceW - 4} y={6 + (top + poc) * ROW} width={maxW * CELL + 8} height={ROW} rx={4} fill="rgba(245,158,11,0.25)" />
              {prices.map((price, r) => (
                <g key={price}>
                  <text x={priceW - 10} y={6 + r * ROW + ROW / 2} textAnchor="end" dominantBaseline="central" fill={counts[r] ? "#e2e8f0" : "#475569"} fontSize={11} fontFamily="ui-monospace, monospace">
                    {price.toLocaleString("en-IN")}
                  </text>
                  {rows[r].map((p, j) => {
                    const idx = periods.indexOf(p);
                    const isNew = idx === shown - 1;
                    return (
                      <g key={p.letter}>
                        <rect
                          x={priceW + j * CELL + 1}
                          y={6 + r * ROW + 2}
                          width={CELL - 2}
                          height={ROW - 4}
                          rx={3}
                          fill={HUE[idx % HUE.length]}
                          stroke={isNew ? "white" : "none"}
                          strokeWidth={isNew ? 2 : 0}
                        />
                        <text x={priceW + j * CELL + CELL / 2} y={6 + r * ROW + ROW / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#0f1729">
                          {p.letter}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl p-4 text-[#0f1729]" style={{ backgroundColor: HUE[(shown - 1) % HUE.length] }}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">After period</p>
              <p className="font-display text-3xl font-bold">
                {current.letter} <span className="text-lg font-semibold">{current.start} – {current.end}</span>
              </p>
              <p className="text-sm">
                {current.letter} traded {current.low.toLocaleString("en-IN")} – {current.high.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Stat label="Periods" value={`${shown} of ${periods.length}`} />
              <Stat label="TPOs" value={String(total)} />
              <Stat label="Day range" value={`${prices[bot].toLocaleString("en-IN")} – ${prices[top].toLocaleString("en-IN")}`} />
              <Stat label="POC so far" value={prices[top + poc].toLocaleString("en-IN")} gold />
            </div>
            <p className="text-xs text-muted-foreground">
              White outline = the letters the latest period just added. Gold row = POC, blue band = value area, both
              recalculated as the profile grows.
            </p>
          </div>
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={cn("rounded-xl px-3 py-2", gold ? "bg-gold/15" : "bg-secondary/70")}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono font-semibold">{value}</p>
    </div>
  );
}
