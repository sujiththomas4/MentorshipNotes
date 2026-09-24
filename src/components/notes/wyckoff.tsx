import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Wyckoff market cycle, redrawn: Accumulation → Mark Up → Distribution → Mark Down,
 * with the named events along the price path. Coordinates are in a 900 × 400 box.
 */

const PHASES = [
  { name: "Accumulation", role: "Cause", x0: 40, x1: 275, band: "fill-bull/8", text: "fill-bull" },
  { name: "Mark Up", role: "Effect", x0: 275, x1: 440, band: "fill-accent/8", text: "fill-accent" },
  { name: "Distribution", role: "Cause", x0: 440, x1: 665, band: "fill-gold/10", text: "fill-gold" },
  { name: "Mark Down", role: "Effect", x0: 665, x1: 890, band: "fill-bear/8", text: "fill-bear" },
];

// price path (y grows downwards)
const P: [number, number][] = [
  [20, 170], [45, 235], [62, 325], [82, 248], [102, 300], [122, 248], [142, 302], [162, 248],
  [182, 332], [202, 252], [222, 312], [245, 242], [268, 222], [290, 258], [330, 190], [348, 210],
  [395, 130], [410, 148], [452, 82], [472, 138], [492, 100], [512, 138], [532, 100], [552, 136],
  [575, 78], [595, 125], [612, 100], [635, 155], [655, 132], [700, 220], [718, 205], [770, 290],
  [790, 278], [870, 365],
];

type Ev = { i: number; label: string; dx: number; dy: number; anchor?: "start" | "middle" | "end"; kind: "low" | "high" };

const EVENTS: Ev[] = [
  { i: 2, label: "Selling Climax", dx: 0, dy: 22, anchor: "middle", kind: "low" },
  { i: 8, label: "Spring", dx: 0, dy: 22, anchor: "middle", kind: "low" },
  { i: 10, label: "Low volume failed sell-off (Test)", dx: 6, dy: 36, anchor: "start", kind: "low" },
  { i: 12, label: "Jump the Creek", dx: -6, dy: -14, anchor: "end", kind: "high" },
  { i: 15, label: "Low volume sell-offs", dx: 10, dy: 16, anchor: "start", kind: "low" },
  { i: 18, label: "Buying Climax", dx: 0, dy: -14, anchor: "middle", kind: "high" },
  { i: 24, label: "Failed Rally", dx: 0, dy: -14, anchor: "middle", kind: "high" },
  { i: 26, label: "Test", dx: 10, dy: -8, anchor: "start", kind: "high" },
  { i: 27, label: "Break the Ice", dx: -8, dy: 20, anchor: "end", kind: "low" },
  { i: 28, label: "Low volume rally", dx: 10, dy: -4, anchor: "start", kind: "high" },
  { i: 33, label: "Break out with volume", dx: -10, dy: 4, anchor: "end", kind: "low" },
];

const Y_OFF = 26; // room for the phase header row

export function WyckoffCycle({ title, caption }: { title?: ReactNode; caption?: ReactNode }) {
  const pts = P.map(([x, y]) => [x, y + Y_OFF] as const);
  const path = pts.map(([x, y], k) => `${k ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <figure className="my-6">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        {title && <p className="mb-2 font-display font-semibold">{title}</p>}
        <div className="overflow-x-auto">
          <svg viewBox="0 0 900 420" className="block h-auto w-full min-w-[640px]" role="img" aria-label="Wyckoff market cycle">
            {PHASES.map((ph) => (
              <g key={ph.name}>
                <rect x={ph.x0} y={4} width={ph.x1 - ph.x0 - 4} height={408} rx={10} className={ph.band} />
                <text x={(ph.x0 + ph.x1) / 2} y={24} textAnchor="middle" className={cn("text-[15px] font-semibold", ph.text)}>
                  {ph.name}
                  <tspan className="fill-muted-foreground text-[12px] font-normal"> ({ph.role})</tspan>
                </text>
              </g>
            ))}

            {/* trading ranges */}
            <g className="stroke-foreground/35" strokeDasharray="5 4" strokeWidth={1.5}>
              <line x1={60} x2={262} y1={248 + Y_OFF} y2={248 + Y_OFF} />
              <line x1={60} x2={262} y1={302 + Y_OFF} y2={302 + Y_OFF} />
              <line x1={460} x2={655} y1={100 + Y_OFF} y2={100 + Y_OFF} />
              <line x1={460} x2={655} y1={137 + Y_OFF} y2={137 + Y_OFF} />
            </g>

            <path d={path} className="fill-none stroke-foreground" strokeWidth={2.5} strokeLinejoin="round" />

            {EVENTS.map((e) => {
              const [x, y] = pts[e.i];
              return (
                <g key={e.label}>
                  <circle cx={x} cy={y} r={5} className={e.kind === "low" ? "fill-bear" : "fill-accent"} stroke="white" strokeWidth={1.5} />
                  <text x={x + e.dx} y={y + e.dy} textAnchor={e.anchor ?? "middle"} className="fill-foreground text-[11.5px] font-medium">
                    {e.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-bear" /> events at lows
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" /> events at highs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-2 border-dashed border-foreground/40" /> trading range
          </span>
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
