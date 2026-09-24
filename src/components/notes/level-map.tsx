import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/components/notes/blocks";

type Level = { price: number; label: string; tone?: Tone | "gold" | "accent" };
type Band = { from: number; to: number; label: string; tone?: Tone | "accent" };
type Marker = { price: number; label: string; tone?: Tone };

const FILL = {
  bull: "fill-bull",
  bear: "fill-bear",
  neutral: "fill-neutral-tone",
  gold: "fill-gold",
  accent: "fill-accent",
};
const STROKE = {
  bull: "stroke-bull",
  bear: "stroke-bear",
  neutral: "stroke-neutral-tone",
  gold: "stroke-gold",
  accent: "stroke-accent",
};
const BAND = {
  bull: "fill-bull/10",
  bear: "fill-bear/10",
  neutral: "fill-neutral-tone/10",
  accent: "fill-accent/10",
};

/**
 * A vertical price ladder: reference levels as lines, zones as shaded bands, and markers
 * (an open, an entry, a target) as arrows on the right. Good for "where did we open
 * relative to yesterday's value" pictures.
 */
export function LevelMap({
  levels = [],
  bands = [],
  markers = [],
  title,
  caption,
  height = 260,
}: {
  levels?: Level[];
  bands?: Band[];
  markers?: Marker[];
  title?: ReactNode;
  caption?: ReactNode;
  height?: number;
}) {
  const prices = [...levels.map((l) => l.price), ...bands.flatMap((b) => [b.from, b.to]), ...markers.map((m) => m.price)];
  if (prices.length === 0) return null;
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const span = hi - lo || 1;
  const PAD = 22;
  const W = 520;
  const y = (p: number) => PAD + ((hi - p) / span) * (height - PAD * 2);
  const fmt = (p: number) => p.toLocaleString("en-IN");

  return (
    <figure className="my-6">
      <div className="card-elevated rounded-xl border border-border bg-card p-4">
        {title && <p className="mb-2 font-display font-semibold">{title}</p>}
        <svg viewBox={`0 0 ${W} ${height}`} className="mx-auto block h-auto w-full max-w-xl" role="img" aria-label="Price level map">
          {bands.map((b, i) => {
            const top = y(Math.max(b.from, b.to));
            const bot = y(Math.min(b.from, b.to));
            return (
              <g key={`b${i}`}>
                <rect x={70} y={top} width={300} height={Math.max(bot - top, 2)} rx={4} className={BAND[b.tone ?? "accent"]} />
                <text x={78} y={top + 16} className="fill-muted-foreground text-[11px]">
                  {b.label}
                </text>
              </g>
            );
          })}
          {levels.map((l, i) => (
            <g key={`l${i}`}>
              <line x1={70} x2={370} y1={y(l.price)} y2={y(l.price)} strokeWidth={1.5} className={STROKE[l.tone ?? "accent"]} />
              <text x={62} y={y(l.price)} textAnchor="end" dominantBaseline="central" className="fill-muted-foreground font-mono text-[11px]">
                {fmt(l.price)}
              </text>
              <text x={366} y={y(l.price) - 7} textAnchor="end" className={cn("text-[11px] font-semibold", FILL[l.tone ?? "accent"])}>
                {l.label}
              </text>
            </g>
          ))}
          {markers.map((m, i) => {
            const my = y(m.price);
            const tone = m.tone ?? "neutral";
            return (
              <g key={`m${i}`}>
                <path d={`M372 ${my} l10 -6 v12 z`} className={FILL[tone]} />
                <line x1={382} x2={392} y1={my} y2={my} strokeWidth={2} className={STROKE[tone]} />
                <text x={398} y={my} dominantBaseline="central" className={cn("text-[12px] font-semibold", FILL[tone])}>
                  {m.label}
                </text>
                <text x={398} y={my + 13} dominantBaseline="central" className="fill-muted-foreground font-mono text-[10px]">
                  {fmt(m.price)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
