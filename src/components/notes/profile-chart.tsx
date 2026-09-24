import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/components/notes/blocks";

export type ProfileRow = { price: number; tpos: string };

/**
 * Accepts rows, or text with one price per line: "22450 ABCD" or "22450 | ABCD".
 * Spaces inside the letters are ignored. Rows come back highest price first.
 */
export function parseProfile(input: string | ProfileRow[]): ProfileRow[] {
  const rows = Array.isArray(input)
    ? input
    : input
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .flatMap((l) => {
          const m = l.match(/^(-?[\d.,]+)\s*\|?\s*(.*)$/);
          return m ? [{ price: Number(m[1].replace(/,/g, "")), tpos: m[2] }] : [];
        });
  return rows.map((r) => ({ price: r.price, tpos: r.tpos.replace(/[\s|]/g, "") })).sort((a, b) => b.price - a.price);
}

/**
 * POC = the row with the most TPOs (ties go to the one nearest the middle).
 * Value area = grow from the POC one row at a time towards the bigger neighbour
 * until it holds `vaShare` of all TPOs. Indexes are into rows (0 = highest price).
 */
export function analyseProfile(rows: ProfileRow[], vaShare = 0.7) {
  const counts = rows.map((r) => r.tpos.length);
  const total = counts.reduce((a, b) => a + b, 0);
  const mid = (rows.length - 1) / 2;
  let poc = 0;
  counts.forEach((c, i) => {
    if (c > counts[poc] || (c === counts[poc] && Math.abs(i - mid) < Math.abs(poc - mid))) poc = i;
  });
  let top = poc;
  let bot = poc;
  let acc = counts[poc] ?? 0;
  while (acc < total * vaShare && (top > 0 || bot < rows.length - 1)) {
    const up = top > 0 ? counts[top - 1] : -1;
    const down = bot < rows.length - 1 ? counts[bot + 1] : -1;
    if (up >= down) acc += counts[--top];
    else acc += counts[++bot];
  }
  return { counts, total, poc, vahIdx: top, valIdx: bot };
}

const ROW_H = 20;
const CELL_W = 15;
const PAD = 6;
const LABEL_W = 92;

const TONE_FILL: Record<Tone, string> = { bull: "fill-bull", bear: "fill-bear", neutral: "fill-neutral-tone" };
const TONE_STROKE: Record<Tone, string> = { bull: "stroke-bull", bear: "stroke-bear", neutral: "stroke-neutral-tone" };

/**
 * A TPO (letter) profile with value area, POC, initial balance and single prints marked.
 *
 * <ProfileChart title="Day 1" data={`
 *   22480 A
 *   22470 AB
 *   22460 ABC
 * `} />
 */
export function ProfileChart({
  data,
  title,
  caption,
  ib = "AB",
  vaShare = 0.7,
  showSingles = true,
  marks = [],
  poc: pocOverride,
  vah: vahOverride,
  val: valOverride,
  showHalfBack = false,
}: {
  data: string | ProfileRow[];
  title?: ReactNode;
  caption?: ReactNode;
  /** letters that make up the initial balance; "" to hide it */
  ib?: string;
  vaShare?: number;
  /** outline rows that have a single TPO */
  showSingles?: boolean;
  /** notes pinned to a price on the right */
  marks?: { price: number; text: string; tone?: Tone }[];
  /** use these instead of the calculated levels (e.g. to match the mentor's chart) */
  poc?: number;
  vah?: number;
  val?: number;
  /** mark the half back: the row at 50% of the profile's total height, in red */
  showHalfBack?: boolean;
}) {
  const rows = parseProfile(data);
  if (rows.length === 0) return null;

  const a = analyseProfile(rows, vaShare);
  const rowOf = (price: number) =>
    rows.reduce((best, r, i) => (Math.abs(r.price - price) < Math.abs(rows[best].price - price) ? i : best), 0);
  const pocIdx = pocOverride !== undefined ? rowOf(pocOverride) : a.poc;
  const vahIdx = vahOverride !== undefined ? rowOf(vahOverride) : a.vahIdx;
  const valIdx = valOverride !== undefined ? rowOf(valOverride) : a.valIdx;
  const hbIdx = showHalfBack ? rowOf((rows[0].price + rows[rows.length - 1].price) / 2) : -1;

  const ibSet = new Set(ib.split(""));
  const ibRows = rows.map((r, i) => ([...r.tpos].some((c) => ibSet.has(c)) ? i : -1)).filter((i) => i >= 0);
  const ibTop = ibRows.length ? Math.min(...ibRows) : -1;
  const ibBot = ibRows.length ? Math.max(...ibRows) : -1;

  const priceText = rows.map((r) => r.price.toLocaleString("en-IN"));
  const priceW = Math.max(...priceText.map((p) => p.length)) * 7.4 + 22;
  const maxLetters = Math.max(...a.counts, 1);
  const lettersW = maxLetters * CELL_W;
  const labelX = priceW + lettersW + 14;
  const markX = labelX + LABEL_W;
  const markW = marks.length ? Math.max(...marks.map((m) => m.text.length)) * 6.6 + 30 : 0;
  const W = markX + markW;
  const H = PAD * 2 + rows.length * ROW_H;
  const y = (i: number) => PAD + i * ROW_H;

  const levelLabel = (i: number) => {
    const names = [i === vahIdx && "VAH", i === pocIdx && "POC", i === valIdx && "VAL", i === hbIdx && "HALF BACK"].filter(Boolean);
    return names.length ? names.join(" · ") : null;
  };

  return (
    <figure className="my-6">
      <div className="card-elevated rounded-xl border border-border bg-card p-4">
        {title && <p className="mb-3 font-display font-semibold">{title}</p>}
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            className="block max-w-none"
            role="img"
            aria-label={`Market profile. POC ${priceText[pocIdx]}, value area ${priceText[valIdx]} to ${priceText[vahIdx]}.`}
          >
            {/* value area band */}
            <rect
              x={priceW - 2}
              y={y(vahIdx)}
              width={lettersW + 8}
              height={(valIdx - vahIdx + 1) * ROW_H}
              rx={4}
              className="fill-accent/10"
            />
            {/* POC row */}
            <rect x={priceW - 2} y={y(pocIdx)} width={lettersW + 8} height={ROW_H} rx={3} className="fill-gold/25" />
            {/* half back row */}
            {hbIdx >= 0 && (
              <rect x={priceW - 2} y={y(hbIdx)} width={lettersW + 8} height={ROW_H} rx={3} className="fill-bear/30" />
            )}
            {/* initial balance bracket */}
            {ibTop >= 0 && (
              <path
                d={`M${priceW - 5} ${y(ibTop) + 3} h-3 V${y(ibBot) + ROW_H - 3} h3`}
                className="fill-none stroke-accent"
                strokeWidth={2}
              />
            )}

            {rows.map((r, i) => {
              const level = levelLabel(i);
              const single = showSingles && a.counts[i] === 1;
              return (
                <g key={r.price}>
                  <text
                    x={priceW - 12}
                    y={y(i) + ROW_H / 2}
                    dominantBaseline="central"
                    textAnchor="end"
                    className={cn(
                      "font-mono text-[11px] tabular-nums",
                      level ? "fill-foreground font-semibold" : "fill-muted-foreground",
                    )}
                  >
                    {priceText[i]}
                  </text>
                  {single && (
                    <rect
                      x={priceW + 1}
                      y={y(i) + 2}
                      width={CELL_W - 2}
                      height={ROW_H - 4}
                      rx={3}
                      className="fill-none stroke-gold"
                      strokeDasharray="3 2"
                    />
                  )}
                  {[...r.tpos].map((c, j) => (
                    <text
                      key={j}
                      x={priceW + j * CELL_W + CELL_W / 2}
                      y={y(i) + ROW_H / 2}
                      dominantBaseline="central"
                      textAnchor="middle"
                      className={cn(
                        "font-mono text-[12px]",
                        ibSet.has(c) ? "fill-accent font-bold" : "fill-foreground/75",
                      )}
                    >
                      {c}
                    </text>
                  ))}
                  {level && (
                    <text
                      x={labelX}
                      y={y(i) + ROW_H / 2}
                      dominantBaseline="central"
                      className={cn(
                        "font-mono text-[11px] font-semibold",
                        i === pocIdx ? "fill-gold" : i === hbIdx && level === "HALF BACK" ? "fill-bear" : "fill-accent",
                      )}
                    >
                      {level}
                    </text>
                  )}
                </g>
              );
            })}

            {marks.map((m, k) => {
              const i = rowOf(m.price);
              const cy = y(i) + ROW_H / 2;
              const tone = m.tone ?? "neutral";
              const level = levelLabel(i);
              return (
                <g key={k}>
                  <line
                    x1={level ? labelX + level.length * 7 + 6 : priceW + a.counts[i] * CELL_W + 4}
                    x2={markX + 6}
                    y1={cy}
                    y2={cy}
                    strokeDasharray="2 3"
                    className={TONE_STROKE[tone]}
                  />
                  <circle cx={markX + 10} cy={cy} r={3.5} className={TONE_FILL[tone]} />
                  <text x={markX + 20} y={cy} dominantBaseline="central" className={cn("text-[12px]", TONE_FILL[tone])}>
                    {m.text}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <Legend swatch="bg-gold/40">
            POC <b className="font-mono text-foreground">{priceText[pocIdx]}</b>
          </Legend>
          <Legend swatch="bg-accent/20">
            Value area <b className="font-mono text-foreground">{priceText[valIdx]} – {priceText[vahIdx]}</b>
          </Legend>
          {ibTop >= 0 && (
            <Legend swatch="bg-accent">
              IB ({ib}) <b className="font-mono text-foreground">{priceText[ibBot]} – {priceText[ibTop]}</b>
            </Legend>
          )}
          {showSingles && a.counts.includes(1) && <Legend swatch="border border-dashed border-gold">Single print</Legend>}
          {hbIdx >= 0 && (
            <Legend swatch="bg-bear/50">
              Half back <b className="font-mono text-foreground">{priceText[hbIdx]}</b>
            </Legend>
          )}
          <span className="ml-auto">{a.total} TPOs</span>
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Legend({ swatch, children }: { swatch: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block h-3 w-3 rounded-sm", swatch)} />
      <span>{children}</span>
    </span>
  );
}

const SHAPES = {
  normal: [1, 2, 3, 5, 7, 9, 10, 9, 7, 5, 3, 2, 1],
  p: [2, 4, 7, 9, 10, 9, 7, 4, 2, 1, 1, 1, 1],
  b: [1, 1, 1, 1, 2, 4, 7, 9, 10, 9, 7, 4, 2],
  trend: [2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 2],
  double: [1, 3, 6, 8, 6, 3, 1, 1, 1, 3, 6, 8, 6, 3, 1],
  wide: [2, 4, 5, 6, 6, 7, 7, 6, 6, 5, 4, 2],
} satisfies Record<string, number[]>;

export type ShapeName = keyof typeof SHAPES;

/** A small bar sketch of a profile shape, with the value area and POC shaded. */
export function MiniProfile({
  shape,
  counts,
  label,
  note,
}: {
  shape?: ShapeName;
  /** TPO count per row, top to bottom; overrides `shape` */
  counts?: number[];
  label?: ReactNode;
  note?: ReactNode;
}) {
  const c = counts ?? SHAPES[shape ?? "normal"];
  const rows = c.map((n, i) => ({ price: c.length - i, tpos: "x".repeat(n) }));
  const { poc, vahIdx, valIdx } = analyseProfile(rows);
  const max = Math.max(...c);
  const BAR_H = 7;
  const GAP = 2;
  const W = 96;
  const H = c.length * (BAR_H + GAP);
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card p-3 text-center card-elevated">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden>
        {c.map((n, i) => (
          <rect
            key={i}
            x={4}
            y={i * (BAR_H + GAP)}
            width={((W - 8) * n) / max}
            height={BAR_H}
            rx={2}
            className={i === poc ? "fill-gold" : i >= vahIdx && i <= valIdx ? "fill-accent/70" : "fill-muted-foreground/30"}
          />
        ))}
      </svg>
      {label && <p className="mt-2 font-display text-sm font-semibold">{label}</p>}
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

/** A row of MiniProfiles. */
export function ShapeGallery({ children }: { children: ReactNode }) {
  return <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}
