import { createContext, useContext, type ReactNode } from "react";

/*
 * Shared pieces for Indian Traders Instagram artwork. Everything is drawn in a fixed
 * 1080 × 1350 SVG coordinate system; the preview only scales the whole SVG.
 */

export const IG_W = 1080;
export const IG_H = 1350;

/** Palette from the Global Market Sentiments spec (TEMPLATE_INSTRUCTIONS.md §6). */
export const IG = {
  bg: "#031321",
  card: "#061b2b",
  card2: "#0a2438",
  text: "#f5f7fa",
  muted: "#b9c7d3",
  border: "#54728b",
  bull: "#20e878",
  bear: "#ff3d48",
  neutral: "#8292a2",
  font: "Inter, 'Manrope', 'DM Sans', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
} as const;

/** Colour themes for the dark slides (Global Market). The bull / bear colours stay the same. */
export type IgPalette = { [K in keyof typeof IG]: string } & { bgTop: string; bgBot: string; glow1: string; glow2: string; globe: string };
export const IG_PALETTES: Record<string, IgPalette> = {
  navy: { ...IG, bgTop: "#0A1B2C", bgBot: "#050E18", glow1: "#1F8BFF", glow2: "#0E4F8A", globe: "#5FB2FF" },
  black: {
    ...IG,
    bg: "#050505",
    card: "#131313",
    card2: "#1b1b1b",
    border: "#3f3f3f",
    muted: "#b8b8b8",
    bgTop: "#121212",
    bgBot: "#020202",
    glow1: "#8a8a8a",
    glow2: "#3a3a3a",
    globe: "#a8a8a8",
  },
};
const IgPaletteContext = createContext<IgPalette>(IG_PALETTES.navy);
/** Wrap a slide so its parts (header, footer, tiles…) use the chosen palette. */
export const IgPaletteProvider = IgPaletteContext.Provider;
export const useIg = () => useContext(IgPaletteContext);
export const igPalette = (theme: string | undefined) => IG_PALETTES[theme ?? "navy"] ?? IG_PALETTES.navy;

/** Locked logos from Branding (public/branding/logos). Never redrawn: placed as the PNG. */
export const IG_LOGOS = {
  horizontal: { href: "/branding/logos/assets/indian-traders-horizontal-shield.png", filledHref: "/branding/logos/assets/shield-filled/indian-traders-horizontal-shield-filled.png", w: 1124, h: 492, label: "Horizontal Shield" },
  tricolor: { href: "/branding/logos/assets/indian-traders-tricolor-shield.png", filledHref: "/branding/logos/assets/shield-filled/indian-traders-tricolor-shield-filled.png", w: 911, h: 1059, label: "Tricolor Shield" },
} as const;
export type IgLogoVariant = keyof typeof IG_LOGOS;

export type Sentiment = "BULLISH" | "BEARISH" | "NEUTRAL";

export const SENTIMENT: Record<Sentiment, { color: string; mark: string }> = {
  BULLISH: { color: IG.bull, mark: "↑" },
  BEARISH: { color: IG.bear, mark: "↓" },
  NEUTRAL: { color: IG.neutral, mark: "—" },
};

/** "2025-04-25" → "Apr 25, 2025", as on the reference slides (empty stays empty). */
export function formatIgDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
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
export function IgHeader({ date, logo = "horizontal" }: { date: string; logo?: IgLogoVariant }) {
  return (
    <g>
      <IgLogo variant={logo} />
      <IgDatePill right={IG_W - 60} y={62} text={formatIgDate(date)} />
    </g>
  );
}

/** Card gradients (from the Swing Trade "TRADE DIRECTION" card), top-left → bottom-right. */
export const SENTIMENT_CARD: Record<Sentiment, [string, string, string]> = {
  BULLISH: ["#16b978", "#079457", "#0aa66a"],
  BEARISH: ["#f24a55", "#d31f2c", "#ef3340"],
  NEUTRAL: ["#8e9aa6", "#5f6f7e", "#7e8f9d"],
};

/** Arrow (or dash for NEUTRAL) in a translucent white circle. */
function SentimentMark({ cx, cy, r, sentiment }: { cx: number; cy: number; r: number; sentiment: Sentiment }) {
  const a = r * 0.55;
  const sw = Math.max(3, r * 0.2);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" fillOpacity={0.18} />
      <g stroke="#FFFFFF" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {sentiment === "BULLISH" && <path d={`M${cx} ${cy + a} V${cy - a} M${cx - a * 0.8} ${cy - a * 0.15} L${cx} ${cy - a} L${cx + a * 0.8} ${cy - a * 0.15}`} />}
        {sentiment === "BEARISH" && <path d={`M${cx} ${cy - a} V${cy + a} M${cx - a * 0.8} ${cy + a * 0.15} L${cx} ${cy + a} L${cx + a * 0.8} ${cy + a * 0.15}`} />}
        {sentiment === "NEUTRAL" && <path d={`M${cx - a * 0.8} ${cy} H${cx + a * 0.8}`} />}
      </g>
    </g>
  );
}

function CardDefs({ sentiment }: { sentiment: Sentiment }) {
  const [a, b, glow] = SENTIMENT_CARD[sentiment];
  return (
    <defs>
      <linearGradient id={`ig-card-${sentiment}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
      <filter id={`ig-card-shadow-${sentiment}`} x="-15%" y="-20%" width="130%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor={glow} floodOpacity="0.35" />
      </filter>
    </defs>
  );
}

/**
 * Sentiment card in the Swing Trade direction-card style: gradient, arrow in a circle,
 * small label and the big word. Right-aligned at `right`.
 */
export function IgSolidBadge({ right, y, sentiment, label = "SENTIMENT" }: { right: number; y: number; sentiment: Sentiment; label?: string }) {
  const h = 110;
  const w = 320;
  const x = right - w;
  const cy = y + h / 2;
  return (
    <g>
      <CardDefs sentiment={sentiment} />
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`url(#ig-card-${sentiment})`} filter={`url(#ig-card-shadow-${sentiment})`} />
      <SentimentMark cx={x + 58} cy={cy} r={34} sentiment={sentiment} />
      <text x={x + 110} y={cy - 22} dominantBaseline="central" fill="#FFFFFF" fillOpacity={0.95} fontFamily={IG.font} fontSize={16} fontWeight={600} letterSpacing={0.5}>
        {label}
      </text>
      <text x={x + 108} y={cy + 16} dominantBaseline="central" fill="#FFFFFF" fontFamily={IG.font} fontSize={fitFont(sentiment, w - 128, 42, 28)} fontWeight={900}>
        {sentiment}
      </text>
    </g>
  );
}

/** Compact version for the cover tiles: gradient bar, arrow circle on the left, the word. */
export function IgSentimentCard({ x, y, w, h, sentiment }: { x: number; y: number; w: number; h: number; sentiment: Sentiment }) {
  const cy = y + h / 2;
  const r = h * 0.34;
  const markX = x + 12 + r;
  return (
    <g>
      <CardDefs sentiment={sentiment} />
      <rect x={x} y={y} width={w} height={h} rx={14} fill={`url(#ig-card-${sentiment})`} filter={`url(#ig-card-shadow-${sentiment})`} />
      <SentimentMark cx={markX} cy={cy} r={r} sentiment={sentiment} />
      <text
        x={(markX + r + x + w) / 2}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFFFFF"
        fontFamily={IG.font}
        fontSize={fitFont(sentiment, w - (markX + r - x) - 18, 25, 16)}
        fontWeight={900}
        letterSpacing={0.5}
      >
        {sentiment}
      </text>
    </g>
  );
}

/** Dark navy background with a soft glow, faint grid, a faint rising chart and a globe at the bottom. */
export function IgBackground({ id, h = IG_H }: { id: string; h?: number }) {
  const IG = useIg();
  const chart = [
    [0, 560], [70, 540], [140, 575], [210, 520], [280, 545], [350, 490], [420, 510], [490, 455], [560, 480], [630, 420],
    [700, 440], [770, 380], [840, 405], [910, 340], [980, 360], [1080, 300],
  ];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={IG.bgTop} />
          <stop offset="0.55" stopColor={IG.bg} />
          <stop offset="1" stopColor={IG.bgBot} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="1.02" r="0.62">
          <stop offset="0" stopColor={IG.glow1} stopOpacity="0.38" />
          <stop offset="0.45" stopColor={IG.glow2} stopOpacity="0.16" />
          <stop offset="1" stopColor={IG.bg} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-top`} cx="0.85" cy="0" r="0.6">
          <stop offset="0" stopColor={IG.bull} stopOpacity="0.10" />
          <stop offset="1" stopColor={IG.bg} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-globe`}>
          <circle cx={540} cy={h + 210} r={560} />
        </clipPath>
      </defs>
      <rect width={IG_W} height={h} fill={`url(#${id}-bg)`} />
      <rect width={IG_W} height={h} fill={`url(#${id}-top)`} />
      {/* faint grid */}
      <g stroke="#FFFFFF" strokeOpacity="0.035" strokeWidth={1}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={i * 90 + 45} x2={i * 90 + 45} y1={0} y2={h} />
        ))}
        {Array.from({ length: Math.ceil(h / 90) }, (_, i) => (
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
      <rect width={IG_W} height={h} fill={`url(#${id}-glow)`} />
      <g clipPath={`url(#${id}-globe)`} fill="none" stroke={IG.globe} strokeOpacity="0.16" strokeWidth={1.5}>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse key={`lat${k}`} cx={540} cy={h + 210} rx={560} ry={560 - k * 95} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse key={`lon${k}`} cx={540} cy={h + 210} rx={80 + k * 96} ry={560} />
        ))}
      </g>
      <circle cx={540} cy={h + 210} r={560} fill="none" stroke={IG.globe} strokeOpacity="0.28" strokeWidth={2} />
    </g>
  );
}

/**
 * The locked Indian Traders logo, placed as its PNG (never redrawn or recoloured).
 * Spec: top-left, left ≈55, top ≈43, height ≈92 px; width follows the PNG's own ratio.
 */
export function IgLogo({ variant = "horizontal", x = 55, y = 43, height = 92 }: { variant?: IgLogoVariant; x?: number; y?: number; height?: number }) {
  const l = IG_LOGOS[variant];
  return <image href={l.href} x={x} y={y} height={height} width={(l.w / l.h) * height} preserveAspectRatio="xMidYMid meet" />;
}

/** Rounded date pill with a calendar icon, right-aligned at `right`. */
export function IgDatePill({ right, y, text }: { right: number; y: number; text: string }) {
  const IG = useIg();
  const label = text || "—";
  const w = Math.max(150, label.length * 12.5 + 90);
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
      <text x={x + 62} y={y + 40} fill={IG.text} fontFamily={IG.font} fontSize={23} fontWeight={700}>
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
  const IG = useIg();
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
  const IG = useIg();
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={IG.card2} stroke={IG.border} strokeWidth={2} />
      {children}
    </g>
  );
}
