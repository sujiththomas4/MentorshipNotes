import type { ReactNode } from "react";

/*
 * Shared pieces for Indian Traders Instagram artwork. Everything is drawn in a fixed
 * 1080 × 1350 SVG coordinate system; the preview only scales the whole SVG.
 */

export const IG_W = 1080;
export const IG_H = 1350;

export const IG = {
  bg: "#071422",
  card: "#0D2234",
  card2: "#112B40",
  text: "#F5F8FA",
  muted: "#9DB1C1",
  border: "#426378",
  bull: "#2ADA74",
  bear: "#FF4952",
  neutral: "#7E8F9D",
  font: "Inter, 'Manrope', 'DM Sans', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
} as const;

export type Sentiment = "BULLISH" | "BEARISH" | "NEUTRAL";

export const SENTIMENT: Record<Sentiment, { color: string; mark: string }> = {
  BULLISH: { color: IG.bull, mark: "↑" },
  BEARISH: { color: IG.bear, mark: "↓" },
  NEUTRAL: { color: IG.neutral, mark: "—" },
};

/** "2026-09-24" → "24 SEP 2026" (empty stays empty). */
export function formatIgDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso.toUpperCase();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`;
}

/** Rough text width for Inter bold, used to shrink long labels instead of stretching them. */
export function fitFont(text: string, maxWidth: number, maxSize: number, minSize = 18) {
  const est = text.length * 0.62;
  return Math.max(minSize, Math.min(maxSize, est ? maxWidth / est : maxSize));
}

/**
 * Fit a label into `maxW`: one line if it stays at least `min1` px, otherwise two balanced
 * lines, and as a last resort cut with "…". Never stretches the text.
 */
export function fitLines(text: string, maxW: number, max: number, min1: number, min2 = 20): { lines: string[]; size: number } {
  const CH = 0.64; // approx. width of an Inter ExtraBold capital, per px of font size
  const one = maxW / (Math.max(text.length, 1) * CH);
  if (one >= min1) return { lines: [text], size: Math.min(max, one) };
  const words = text.split(/\s+/);
  if (words.length > 1) {
    let best = [text, ""];
    let bestLen = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      const len = Math.max(a.length, b.length);
      if (len < bestLen) [best, bestLen] = [[a, b], len];
    }
    const size = Math.min(max * 0.9, maxW / (bestLen * CH));
    if (size >= min2) return { lines: best, size };
  }
  const cut = Math.floor(maxW / (min2 * CH));
  return { lines: [text.length > cut ? text.slice(0, cut - 1) + "…" : text], size: min2 };
}

/** Word-wrap plain text to lines of about `maxChars` characters (at most `maxLines`). */
export function wrapText(text: string, maxChars: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > maxChars) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S*$/, "") + "…";
    return kept;
  }
  return lines;
}

/** Header shared by every slide: logo left, date pill right. */
export function IgHeader({ date }: { date: string }) {
  return (
    <g>
      <IgLogo x={62} y={66} />
      <IgDatePill right={IG_W - 60} y={62} text={formatIgDate(date)} />
    </g>
  );
}

/** Solid sentiment pill with a round arrow icon, right-aligned at `right`. */
export function IgSolidBadge({ right, y, sentiment }: { right: number; y: number; sentiment: Sentiment }) {
  const s = SENTIMENT[sentiment];
  const h = 84;
  const w = 300;
  const x = right - w;
  const dark = sentiment === "NEUTRAL";
  const cx = x + 44;
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={s.color} />
      <circle cx={cx} cy={cy} r={24} fill="#FFFFFF" fillOpacity={dark ? 0.35 : 0.25} />
      <g stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {sentiment === "BULLISH" && <path d={`M${cx} ${cy + 12} V${cy - 12} M${cx - 10} ${cy - 2} L${cx} ${cy - 12} L${cx + 10} ${cy - 2}`} />}
        {sentiment === "BEARISH" && <path d={`M${cx} ${cy - 12} V${cy + 12} M${cx - 10} ${cy + 2} L${cx} ${cy + 12} L${cx + 10} ${cy + 2}`} />}
        {sentiment === "NEUTRAL" && <path d={`M${cx - 12} ${cy} H${cx + 12}`} />}
      </g>
      <text x={x + 84 + (w - 84) / 2 - 8} y={cy + 1} textAnchor="middle" dominantBaseline="central" fill="#FFFFFF" fontFamily={IG.font} fontSize={30} fontWeight={800} letterSpacing={1.5}>
        {sentiment}
      </text>
    </g>
  );
}

/** Dark navy background with a soft glow, faint grid, a faint rising chart and a globe at the bottom. */
export function IgBackground({ id }: { id: string }) {
  const chart = [
    [0, 560], [70, 540], [140, 575], [210, 520], [280, 545], [350, 490], [420, 510], [490, 455], [560, 480], [630, 420],
    [700, 440], [770, 380], [840, 405], [910, 340], [980, 360], [1080, 300],
  ];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A1B2C" />
          <stop offset="0.55" stopColor={IG.bg} />
          <stop offset="1" stopColor="#050E18" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="1.02" r="0.62">
          <stop offset="0" stopColor="#1F8BFF" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#0E4F8A" stopOpacity="0.16" />
          <stop offset="1" stopColor={IG.bg} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-top`} cx="0.85" cy="0" r="0.6">
          <stop offset="0" stopColor={IG.bull} stopOpacity="0.10" />
          <stop offset="1" stopColor={IG.bg} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-globe`}>
          <circle cx={540} cy={1560} r={560} />
        </clipPath>
      </defs>
      <rect width={IG_W} height={IG_H} fill={`url(#${id}-bg)`} />
      <rect width={IG_W} height={IG_H} fill={`url(#${id}-top)`} />
      {/* faint grid */}
      <g stroke="#FFFFFF" strokeOpacity="0.035" strokeWidth={1}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={i * 90 + 45} x2={i * 90 + 45} y1={0} y2={IG_H} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`h${i}`} x1={0} x2={IG_W} y1={i * 90 + 45} y2={i * 90 + 45} />
        ))}
      </g>
      {/* faint rising chart behind the title */}
      <polyline
        points={chart.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={IG.bull}
        strokeOpacity="0.10"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* globe */}
      <rect width={IG_W} height={IG_H} fill={`url(#${id}-glow)`} />
      <g clipPath={`url(#${id}-globe)`} fill="none" stroke="#5FB2FF" strokeOpacity="0.16" strokeWidth={1.5}>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse key={`lat${k}`} cx={540} cy={1560} rx={560} ry={560 - k * 95} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse key={`lon${k}`} cx={540} cy={1560} rx={80 + k * 96} ry={560} />
        ))}
      </g>
      <circle cx={540} cy={1560} r={560} fill="none" stroke="#5FB2FF" strokeOpacity="0.28" strokeWidth={2} />
    </g>
  );
}

/** Indian Traders mark: rising bars with a green arrow, then the wordmark. */
export function IgLogo({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={40} width={12} height={24} rx={2} fill={IG.text} />
      <rect x={18} y={28} width={12} height={36} rx={2} fill={IG.text} />
      <rect x={36} y={16} width={12} height={48} rx={2} fill={IG.text} />
      <rect x={54} y={4} width={12} height={60} rx={2} fill={IG.text} />
      <path d="M-2 32 L24 12 L38 22 L64 -4" fill="none" stroke={IG.bull} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52 -8 L68 -8 L68 8" fill="none" stroke={IG.bull} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <text x={86} y={28} fill={IG.text} fontFamily={IG.font} fontSize={30} fontWeight={800} letterSpacing={1.5}>
        INDIAN
      </text>
      <text x={86} y={62} fill={IG.text} fontFamily={IG.font} fontSize={30} fontWeight={800} letterSpacing={1.5}>
        TRADERS
      </text>
    </g>
  );
}

/** Rounded date pill with a calendar icon, right-aligned at `right`. */
export function IgDatePill({ right, y, text }: { right: number; y: number; text: string }) {
  const label = text || "—";
  const w = Math.max(150, label.length * 13.5 + 86);
  const x = right - w;
  return (
    <g>
      <rect x={x} y={y} width={w} height={62} rx={16} fill={IG.card} stroke={IG.border} strokeWidth={2} />
      <g transform={`translate(${x + 22} ${y + 17})`} fill="none" stroke={IG.text} strokeWidth={2.6} strokeLinecap="round">
        <rect x={0} y={3} width={26} height={24} rx={4} />
        <line x1={0} x2={26} y1={11} y2={11} />
        <line x1={7} x2={7} y1={0} y2={6} />
        <line x1={19} x2={19} y1={0} y2={6} />
      </g>
      <text x={x + 62} y={y + 40} fill={IG.text} fontFamily={IG.font} fontSize={22} fontWeight={800} letterSpacing={1}>
        {label}
      </text>
    </g>
  );
}

/** Sentiment pill: coloured tint, arrow/dash and the word, centred in the given box. */
export function IgSentimentBadge({ x, y, w, h, sentiment }: { x: number; y: number; w: number; h: number; sentiment: Sentiment }) {
  const s = SENTIMENT[sentiment];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={s.color} fillOpacity={0.16} stroke={s.color} strokeWidth={2.5} />
      <text
        x={x + w / 2}
        y={y + h / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={s.color}
        fontFamily={IG.font}
        fontSize={26}
        fontWeight={800}
        letterSpacing={2}
      >
        {s.mark} {sentiment}
      </text>
    </g>
  );
}

export function IgFooter({ left, page }: { left: string; page: string }) {
  return (
    <g>
      <text x={60} y={1290} fill={IG.muted} fontFamily={IG.font} fontSize={22} fontWeight={600}>
        {left}
      </text>
      {page && (
        <g>
          <rect x={IG_W - 60 - 92} y={1258} width={92} height={46} rx={23} fill={IG.card} stroke={IG.border} strokeWidth={2} />
          <text x={IG_W - 60 - 46} y={1282} textAnchor="middle" dominantBaseline="central" fill={IG.text} fontFamily={IG.font} fontSize={21} fontWeight={800}>
            {page}
          </text>
        </g>
      )}
    </g>
  );
}

/** Round icon tile used on the market cards. */
export function IgIconTile({ x, y, size, children }: { x: number; y: number; size: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={IG.card2} stroke={IG.border} strokeWidth={2} />
      {children}
    </g>
  );
}
