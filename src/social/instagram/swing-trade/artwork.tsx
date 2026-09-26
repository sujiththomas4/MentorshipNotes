import { forwardRef, type ReactNode } from "react";
import { IG, IG_LOGOS, IG_W, fitFont, wrapText } from "@/social/instagram/kit";
import { igSpread } from "@/social/instagram/layout";
import { chartPlacement, inr, num, type SwingBase, type SwingTradeData } from "./data";

/*
 * Swing Trade post, ported from swing-trade.html to SVG at 1080 × 1350 (same coordinates as
 * the HTML's CSS). The logo is the locked Branding PNG on a navy plate: the logo artwork is
 * white on transparent, so it must sit on dark navy, never be recoloured.
 */

/** Colour themes. `navy` = accents on the page (banner, icons), `strong` = headline / value text. */
export const LIGHT = {
  navy: "#12355B",
  navyDark: "#0B223D",
  emerald: "#0AA66A",
  red: "#EF3340",
  border: "#D9E1E8",
  label: "#33506f",
  body: "#1d3350",
  strong: "#0B223D",
  icon: "#12355B",
  banner: "#12355B",
  bgTop: "#fbfcfd",
  bgBot: "#f6f9fb",
  glow: "#eef4f9",
  card: "#ffffff",
  pill: "#eaf0f5",
  pillText: "#12355B",
  risk: "#e6f6ef",
  deco1: "#d6e3ec",
  deco2: "#bfe8d4",
  chartBg: "#ffffff",
  gridV: "#f1f4f7",
  gridH: "#eef2f6",
  axis: "#e3e9ef",
  axisText: "#51627a",
  monthText: "#33475f",
  chartText: "#14253D",
  muted: "#8a99ab",
};
export type Palette = typeof LIGHT;
const DARK: Palette = {
  ...LIGHT,
  border: "#26435f",
  label: "#9fb6cc",
  body: "#d9e4ee",
  strong: "#ffffff",
  icon: "#8cb8ea",
  banner: "#1d5fae",
  bgTop: "#0e2239",
  bgBot: "#071523",
  glow: "#17365a",
  card: "#10263d",
  pill: "#16304c",
  pillText: "#e6eef6",
  risk: "#0f3a2c",
  deco1: "#23405e",
  deco2: "#1d5a44",
  chartBg: "#0c1d31",
  gridV: "#132b44",
  gridH: "#132b44",
  axis: "#23405e",
  axisText: "#9fb6cc",
  monthText: "#b8c8d8",
  chartText: "#e6eef6",
  muted: "#7f93a8",
};
export const PALETTES: Record<string, Palette> = { light: LIGHT, navy: DARK };

/** Section shifts for the chosen format (the editor uses `chartDy` for dragging the chart). */
export function swingLayout(d: SwingBase) {
  // header above 140; body: title | info row | chart | direction + levels | bottom card; footer from 1270
  const sp = igSpread(d.layout, 140, 1270, [380, 488, 996, 1125]);
  return { ...sp, chartDy: sp.dy(2) };
}
export const SCRIPT_FONT = "'Lobster Two', cursive";

export function formatDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso || "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`;
}

/* ---------------- icons (64 × 64, from the HTML) ---------------- */

export type IconName = "calendar" | "chart" | "tag" | "price" | "entry" | "target" | "stop" | "bulb" | "risk" | "factory" | "pie" | "percent" | "people";

export function Icon({ name, x, y, size, color }: { name: IconName; x: number; y: number; size: number; color: string }) {
  const s = { stroke: color, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const body: Record<IconName, ReactNode> = {
    calendar: (
      <>
        <rect x={9} y={13} width={46} height={43} rx={6} strokeWidth={4} {...s} />
        <path d="M18 8v11M46 8v11M9 25h46" strokeWidth={4} {...s} />
        <path d="M19 33h7M29 33h7M39 33h7M19 43h7M29 43h7M39 43h7" strokeWidth={4} {...s} />
      </>
    ),
    chart: (
      <>
        <path d="M8 56h48" strokeWidth={4} {...s} />
        <path d="M14 50V40M24 50V34M34 50V38M44 50V28" strokeWidth={5} {...s} />
        <path d="M12 30l12-10 10 6 16-16" strokeWidth={4} {...s} />
        <path d="M42 10h8v8" strokeWidth={4} {...s} />
      </>
    ),
    tag: (
      <>
        <path d="M10 12h20l24 24a4 4 0 0 1 0 5.6L41.6 54a4 4 0 0 1-5.6 0L12 30V12z" strokeWidth={4} transform="rotate(8 32 32)" {...s} />
        <circle cx={23} cy={23} r={4} strokeWidth={3.5} {...s} />
      </>
    ),
    price: (
      <>
        <ellipse cx={26} cy={14} rx={15} ry={6} strokeWidth={3.6} {...s} />
        <path d="M11 14v8c0 3.3 6.7 6 15 6s15-2.7 15-6v-8M11 22v8c0 3.3 6.7 6 15 6M11 30v8c0 3.3 6.7 6 15 6M11 38v8c0 3.3 6.7 6 15 6" strokeWidth={3.6} {...s} />
        <ellipse cx={42} cy={36} rx={13} ry={5.5} strokeWidth={3.6} {...s} />
        <path d="M29 36v8c0 3 5.8 5.5 13 5.5S55 47 55 44v-8M29 44v7c0 3 5.8 5.5 13 5.5S55 54 55 51v-7" strokeWidth={3.6} {...s} />
      </>
    ),
    entry: (
      <>
        <circle cx={32} cy={32} r={18} strokeWidth={4} {...s} />
        <path d="M32 6v14M32 44v14M6 32h14M44 32h14" strokeWidth={4} {...s} />
        <circle cx={32} cy={32} r={3.5} fill={color} />
      </>
    ),
    target: (
      <>
        <circle cx={30} cy={34} r={22} strokeWidth={4} {...s} />
        <circle cx={30} cy={34} r={12} strokeWidth={4} {...s} />
        <circle cx={30} cy={34} r={3} fill={color} />
        <path d="M31 33L52 12M45 11h8v8" strokeWidth={4} {...s} />
      </>
    ),
    stop: (
      <>
        <path d="M32 7l22 8v16c0 13-9 22-22 27C19 53 10 44 10 31V15l22-8z" strokeWidth={4} {...s} />
        <path d="M24 24l16 16M40 24L24 40" strokeWidth={4} {...s} />
      </>
    ),
    bulb: (
      <>
        <path d="M24 44c0-6-8-10-8-20a16 16 0 0 1 32 0c0 10-8 14-8 20z" strokeWidth={4} {...s} />
        <path d="M25 51h14M27 57h10" strokeWidth={4} {...s} />
        <path d="M32 4v-1M8 24H6M58 24h-2M14 8l-2-2M50 8l2-2" strokeWidth={3.5} {...s} />
      </>
    ),
    risk: (
      <>
        <path d="M32 8v44M16 16h32M16 16l-9 18h18L16 16zM48 16l-9 18h18L48 16z" strokeWidth={4} {...s} />
        <path d="M7 34a9 6 0 0 0 18 0M39 34a9 6 0 0 0 18 0" strokeWidth={4} {...s} />
        <path d="M22 56h20" strokeWidth={4} {...s} />
        <circle cx={32} cy={10} r={3} fill={color} />
      </>
    ),
    factory: (
      <>
        <path d="M8 56V30l14 9V30l14 9V30l14 9V10h8v46z" strokeWidth={4} {...s} />
        <path d="M6 56h52M18 48h6M30 48h6M42 48h6" strokeWidth={4} {...s} />
      </>
    ),
    pie: (
      <>
        <path d="M28 12a22 22 0 1 0 24 24H28z" strokeWidth={4} {...s} />
        <path d="M36 4a22 22 0 0 1 24 24H36z" strokeWidth={4} {...s} />
      </>
    ),
    percent: (
      <>
        <path d="M50 12L14 52" strokeWidth={5} {...s} />
        <circle cx={18} cy={18} r={8} strokeWidth={4} {...s} />
        <circle cx={46} cy={46} r={8} strokeWidth={4} {...s} />
      </>
    ),
    people: (
      <>
        <circle cx={24} cy={20} r={9} strokeWidth={4} {...s} />
        <path d="M6 54c0-10 8-17 18-17s18 7 18 17" strokeWidth={4} {...s} />
        <circle cx={44} cy={18} r={7} strokeWidth={3.5} {...s} />
        <path d="M46 33c7 1 12 7 12 15" strokeWidth={3.5} {...s} />
      </>
    ),
  };
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 64 64" overflow="visible">
      {body[name]}
    </svg>
  );
}

/* ---------------- illustrative chart (port of chartSVG in the HTML) ---------------- */

function seeded(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const TF: Record<string, string> = { daily: "1D", weekly: "1W", monthly: "1M", hourly: "1H", "4h": "4H", "15m": "15m" };
const W = 1001;
const H = 484;

function IllustrativeChart({ d, tag, C }: { d: SwingTradeData; tag: boolean; C: Palette }) {
  const buy = d.direction !== "SELL";
  const e = num(d.entryPrice);
  const t1 = num(d.target1);
  const t2 = num(d.target2);
  const sl = num(d.stopLoss);
  const cpRaw = num(d.currentPrice);
  const cp = Number.isFinite(cpRaw) ? cpRaw : e;
  if (![e, t1, t2, sl].every(Number.isFinite) || e <= 0) {
    return (
      <g>
        <rect width={W} height={H} fill={C.chartBg} />
        <text x={W / 2} y={H / 2 - 12} textAnchor="middle" fill={C.muted} fontFamily={IG.font} fontSize={24} fontWeight={600}>
          Enter entry, targets and stop loss
        </text>
        <text x={W / 2} y={H / 2 + 22} textAnchor="middle" fill={C.muted} fontFamily={IG.font} fontSize={20} fontWeight={500}>
          or upload your chart image
        </text>
      </g>
    );
  }

  const r = seeded(d.ticker + d.date + d.direction);
  const N = 86;
  const start = buy ? cp * 0.895 : cp * 1.105;
  const res = buy ? e * 0.994 : e * 1.006;
  const closes: number[] = [];
  let v = start;
  let m = 0;
  for (let i = 0; i < N; i++) {
    const goal = i < N - 8 ? start + (res - start) * Math.pow(i / (N - 8), 0.85) : res + (cp * (buy ? 1.012 : 0.988) - res) * ((i - (N - 8)) / 7);
    m = m * 0.5 + (r() - 0.5) * cp * 0.012;
    v += (goal - v) * 0.28 + m;
    closes.push(v);
  }
  const K = closes.map((c, i) => {
    const o = i ? closes[i - 1] + (r() - 0.5) * cp * 0.004 : c * (buy ? 0.996 : 1.004);
    const hi = Math.max(o, c) + r() * cp * 0.008;
    const lo = Math.min(o, c) - r() * cp * 0.008;
    const vol = 0.35 + r() * 0.5 + (Math.abs(c - o) / cp) * 20;
    return { o, c, hi, lo, vol };
  });
  K[N - 1].vol = 1.25;
  K[N - 2].vol = Math.max(K[N - 2].vol, 0.95);

  const lvls = [e, t1, t2, sl];
  let lo = Math.min(...K.map((k) => k.lo), ...lvls);
  let hi = Math.max(...K.map((k) => k.hi), ...lvls);
  const pad = (hi - lo) * 0.07 || 1;
  lo -= pad;
  hi += pad * 1.3;
  const top = 26;
  const bot = H - 58;
  const plotR = 880;
  const axisX = plotR + 12;
  const candleR = 600;
  const step = (candleR - 8) / N;
  const bw = Math.max(3, step * 0.62);
  const y = (p: number) => top + (1 - (p - lo) / (hi - lo)) * (bot - top);
  const x = (i: number) => 6 + step * i + step / 2;

  // price ticks
  const raw = (hi - lo) / 7;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const stp = [1, 2, 2.5, 4, 5, 10].map((k) => k * mag).find((k) => k >= raw) || raw;
  const ticks: number[] = [];
  for (let p = Math.ceil(lo / stp) * stp; p <= hi; p += stp) ticks.push(p);

  // month labels from trading days ending at the post date
  const endD = new Date(d.date);
  const end = isNaN(endD.getTime()) ? new Date() : endD;
  const days: Date[] = [];
  const cur = new Date(end);
  while (days.length < N) {
    if (cur.getDay() % 6) days.unshift(new Date(cur));
    cur.setDate(cur.getDate() - 1);
  }
  const months = days.map((dd, i) => ({ dd, i })).filter(({ dd, i }) => i > 3 && dd.getMonth() !== days[i - 1].getMonth());

  // trendline through swing lows (BUY) / highs (SELL)
  const pick = buy ? (k: (typeof K)[number]) => k.lo : (k: (typeof K)[number]) => k.hi;
  const i0 = 8;
  const i1 = N - 10;
  let a = pick(K[i0]);
  const slope = (pick(K[i1]) - a) / (i1 - i0);
  let off = 0;
  for (let i = i0; i <= i1; i++) {
    const dv = pick(K[i]) - (a + slope * (i - i0));
    off = buy ? Math.min(off, dv) : Math.max(off, dv);
  }
  a += off;

  const breakout = /break/i.test(d.setup);
  const zoneY = y(res);
  const bandH = Math.max(8, Math.abs(y(res * 1.004) - y(res * 0.996)));
  const lastX = x(N - 1) + bw;
  const tagX = plotR - 150;
  const tags = [
    { n: "Target 2", p: t2, c: "#0a9d63" },
    { n: "Target 1", p: t1, c: "#0a9d63" },
    { n: "Entry", p: e, c: C.navy },
    { n: "Stop Loss", p: sl, c: C.red },
  ]
    .map((l) => ({ ...l, y: y(l.p) }))
    .sort((p, q) => p.y - q.y);
  for (let i = 1; i < tags.length; i++) if (tags[i].y - tags[i - 1].y < 30) tags[i].y = tags[i - 1].y + 30;

  const f = (size: number, weight: number, fill: string) => ({ fontFamily: IG.font, fontSize: size, fontWeight: weight, fill });
  const tf = TF[d.timeframe.toLowerCase()] || d.timeframe;

  return (
    <g>
      <defs>
        <marker id="st-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" fill={C.chartText} />
        </marker>
      </defs>
      <rect width={W} height={H} fill={C.chartBg} />
      {months.map(({ i }) => (
        <line key={`vg${i}`} x1={x(i)} x2={x(i)} y1={top - 10} y2={bot} stroke={C.gridV} />
      ))}
      {ticks.map((p) => (
        <g key={p}>
          <line x1={0} x2={plotR} y1={y(p)} y2={y(p)} stroke={C.gridH} />
          <text x={axisX + 10} y={y(p) + 5} {...f(14, 500, C.axisText)}>
            {Math.round(p).toLocaleString("en-IN")}
          </text>
        </g>
      ))}
      <line x1={plotR} x2={plotR} y1={0} y2={H} stroke={C.axis} />
      <line x1={0} x2={W} y1={bot + 4} y2={bot + 4} stroke={C.axis} />
      {/* reward / risk zones */}
      <rect x={lastX} y={Math.min(y(e), y(t2))} width={tagX - lastX - 6} height={Math.abs(y(t2) - y(e))} fill={C.emerald} opacity={0.12} />
      <rect x={lastX} y={Math.min(y(e), y(sl))} width={tagX - lastX - 6} height={Math.abs(y(sl) - y(e))} fill={C.red} opacity={0.12} />
      {/* volume */}
      {K.map((k, i) => (
        <rect key={`v${i}`} x={x(i) - bw / 2} y={bot - k.vol * 48 * 0.8} width={bw} height={k.vol * 48 * 0.8} fill={k.c >= k.o ? "#6fd3a8" : "#f59ca3"} opacity={0.75} />
      ))}
      {breakout && (
        <g>
          <rect x={x(N - 36)} y={zoneY - bandH / 2} width={x(N - 1) - x(N - 36) + 20} height={bandH} fill="#9cc2ec" opacity={0.45} stroke="#6a9fd8" />
          <text x={x(N - 36) + 40} y={buy ? zoneY - 58 : zoneY + 70} {...f(16, 600, C.chartText)}>
            {buy ? "Resistance Breakout" : "Support Breakdown"}
          </text>
          <path
            d={`M${x(N - 36) + 205} ${buy ? zoneY - 50 : zoneY + 62} L${x(N - 9)} ${buy ? zoneY - 10 : zoneY + 10}`}
            stroke={C.chartText}
            strokeWidth={1.6}
            markerEnd="url(#st-ah)"
          />
        </g>
      )}
      <line x1={x(i0 - 2)} y1={y(a + slope * -2)} x2={x(N - 1)} y2={y(a + slope * (N - 1 - i0))} stroke="#1d6fd6" strokeWidth={2.4} />
      {/* candles */}
      {K.map((k, i) => {
        const col = k.c >= k.o ? "#0e9f63" : "#e5323f";
        const yt = y(Math.max(k.o, k.c));
        const yb = y(Math.min(k.o, k.c));
        return (
          <g key={`c${i}`}>
            <line x1={x(i)} x2={x(i)} y1={y(k.hi)} y2={y(k.lo)} stroke={col} strokeWidth={1.4} />
            <rect x={x(i) - bw / 2} y={yt} width={bw} height={Math.max(1.5, yb - yt)} fill={col} rx={0.8} />
          </g>
        );
      })}
      {/* level lines + tags */}
      {tags.map((l) => (
        <g key={l.n}>
          <line x1={x(N - 3)} x2={tagX} y1={y(l.p)} y2={y(l.p)} stroke={l.c} strokeWidth={1.6} strokeDasharray="6 5" />
          <rect x={tagX} y={l.y - 13} width={140} height={26} rx={3} fill={l.c} />
          <text x={tagX + 9} y={l.y + 5.5} {...f(14, 600, "#fff")}>
            {l.n}
          </text>
          <text x={tagX + 131} y={l.y + 5.5} textAnchor="end" {...f(14, 600, "#fff")}>
            {inr(String(l.p))}
          </text>
        </g>
      ))}
      {months.map(({ dd, i }) => (
        <text key={`m${i}`} x={x(i) + 14} y={H - 18} {...f(15, 600, C.monthText)}>
          {dd.toLocaleString("en", { month: "short" })}
        </text>
      ))}
      <text x={14} y={22} {...f(14.5, 600, C.chartText)} letterSpacing={0.2}>
        {`${d.stockName || d.ticker || "—"} · ${tf} · ${d.exchange || "NSE"}`}
      </text>
      {tag && (
        <text x={W - 12} y={22} textAnchor="end" {...f(13, 600, C.muted)} fontStyle="italic">
          Illustrative chart
        </text>
      )}
    </g>
  );
}

/* ---------------- post ---------------- */

/** One labelled value on the post (icon colour `ic`, value colour `vc`; default: theme). */
export type SwingCell = { icon: IconName; label: string; value: string; ic?: string; vc?: string };
/** What differs between posts in the Swing Trade style; the frame draws everything else. */
export type SwingSlots = {
  ariaLabel: string;
  /** text on the brush banner under the title */
  banner: string;
  /** drawn in the chart box (1001 × 484) when no chart image is set */
  chartFallback: ReactNode;
  /** the four boxes right of the BUY / SELL box */
  levels: [SwingCell, SwingCell, SwingCell, SwingCell];
  /** bottom card, second box (the first is the time frame) */
  setup: SwingCell;
  /** bottom card, wide third box: bullet lines, or one value with a small caption */
  key: { icon: IconName; label: string; lines?: string[]; value?: string; caption?: string };
  /** bottom card, green last box */
  last: SwingCell;
};

export const SwingTradeArtwork = forwardRef<SVGSVGElement, { data: SwingTradeData; className?: string }>(function SwingTradeArtwork({ data: d, className }, ref) {
  return <SwingFrame ref={ref} d={d} className={className} slots={(C) => tradeSlots(d, C)} />;
});

function tradeSlots(d: SwingTradeData, C: Palette): SwingSlots {
  return {
    ariaLabel: `Swing trade ${d.direction} ${d.ticker}`,
    banner: "TRADE SETUP",
    chartFallback: <IllustrativeChart d={d} tag={d.illustrativeTag} C={C} />,
    levels: [
      { icon: "entry", label: "ENTRY PRICE", value: inr(d.entryPrice) },
      { icon: "target", label: "TARGET 1", value: inr(d.target1), ic: C.emerald },
      { icon: "target", label: "TARGET 2", value: inr(d.target2), ic: C.emerald },
      { icon: "stop", label: "STOP LOSS", value: inr(d.stopLoss), ic: C.red, vc: C.red },
    ],
    setup: { icon: "chart", label: "TRADE SETUP", value: d.setup.trim() || "—" },
    key: { icon: "bulb", label: "KEY REASON", lines: d.reason },
    last: { icon: "risk", label: "RISK / REWARD", value: d.riskReward.trim() || "—" },
  };
}

/** The Swing Trade post: header, title, info row, chart, direction + levels, bottom card, footer. */
export const SwingFrame = forwardRef<SVGSVGElement, { d: SwingBase; slots: (C: Palette) => SwingSlots; className?: string }>(function SwingFrame({ d, slots, className }, ref) {
  const C = PALETTES[d.layout.theme] ?? LIGHT;
  const S = slots(C);
  const L = swingLayout(d);
  const at = (i: number) => `translate(0 ${L.dy(i)})`;
  const buy = d.direction !== "SELL";
  const cp = chartPlacement(d);
  const t = (size: number, weight: number, fill: string) => ({ fontFamily: IG.font, fontSize: size, fontWeight: weight, fill });

  // header: locked logo on a navy plate
  const logo = IG_LOGOS[d.logo];
  const logoH = d.logoHeight;
  const logoW = (logo.w / logo.h) * logoH;
  const pad = d.logoBg === "plate" ? 17 : 0;
  const plateW = logoW + pad * 2;
  const plateH = logoH + pad * 2;
  const date = formatDate(d.date);
  const pillW = 20 + 32 + 14 + date.length * 14 + 26;
  const pillX = IG_W - 40 - pillW;

  // title
  const title = `${d.titleA} ${d.titleB}`;
  const titleSize = Math.min(104, (860 + 3.5 * title.length) / (Math.max(title.length, 1) * 0.68));

  // rows
  const info = [
    { w: 437.2, icon: "chart" as const, label: "STOCK NAME", value: d.stockName.trim() || "—" },
    { w: 282, icon: "tag" as const, label: "TICKER", value: d.ticker.trim() || "—" },
    { w: 282, icon: "price" as const, label: "CURRENT PRICE", value: inr(d.currentPrice) },
  ];
  const levels = S.levels.map((l) => ({ ...l, ic: l.ic ?? C.icon, vc: l.vc ?? C.strong }));

  // key reasons: up to 4 wrapped lines
  const reasonLines: { text: string; bullet: boolean }[] = [];
  for (const rsn of (S.key.lines ?? []).map((x) => x.trim()).filter(Boolean)) {
    wrapText(rsn, 29, 4).forEach((line, i) => reasonLines.push({ text: line, bullet: i === 0 }));
  }
  const shownReasons = reasonLines.slice(0, 4);

  const footerW = d.footer.length * 12;
  const lineL = Math.max(40, 540 - footerW / 2 - 28 - 170);
  const lineR = Math.min(IG_W - 40 - 170, 540 + footerW / 2 + 28);

  let cx = 40;
  const infoCells = info.map((c) => {
    const x0 = cx;
    cx += c.w;
    return { ...c, x0 };
  });
  const bottomW = [210.4, 221.5, 343.3, 225.9];
  const bx = bottomW.reduce<number[]>((acc, w, i) => [...acc, i ? acc[i - 1] + bottomW[i - 1] : 40], []);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${IG_W} ${L.H}`}
      width={IG_W}
      height={L.H}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={S.ariaLabel}
    >
      <defs>
        <linearGradient id="st-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.bgTop} />
          <stop offset="1" stopColor={C.bgBot} />
        </linearGradient>
        <radialGradient id="st-glow" gradientUnits="userSpaceOnUse" cx={918} cy={0} r={900} gradientTransform="translate(918 0) scale(1 0.5556) translate(-918 0)">
          <stop offset="0" stopColor={C.glow} />
          <stop offset="0.7" stopColor={C.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="st-title" gradientUnits="userSpaceOnUse" x1={420} x2={900} y1={0} y2={0}>
          <stop offset="0" stopColor="#0aa66a" />
          <stop offset="0.6" stopColor="#10b87a" />
          <stop offset="1" stopColor="#0c9e63" />
        </linearGradient>
        <linearGradient id="st-buy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16b978" />
          <stop offset="1" stopColor="#079457" />
        </linearGradient>
        <linearGradient id="st-sell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f24a55" />
          <stop offset="1" stopColor="#d31f2c" />
        </linearGradient>
        <linearGradient id="st-fl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0aa66a" stopOpacity="0" />
          <stop offset="1" stopColor="#0aa66a" />
        </linearGradient>
        <linearGradient id="st-fr" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1d6fd6" />
          <stop offset="1" stopColor="#1d6fd6" stopOpacity="0" />
        </linearGradient>
        <clipPath id="st-chart-clip">
          <rect x={40} y={497} width={1001} height={484} rx={17} />
        </clipPath>
        <filter id="st-shadow" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0aa66a" floodOpacity="0.22" />
        </filter>
      </defs>

      <rect width={IG_W} height={L.H} fill="url(#st-bg)" />
      <rect width={IG_W} height={L.H} fill="url(#st-glow)" />

      {/* header */}
      {d.layout.showHeader && (
        <g>
          {d.logoBg === "plate" && <rect x={40} y={26} width={plateW} height={plateH} rx={18} fill={C.navyDark} />}
          <image href={d.logoBg === "shield" ? logo.filledHref : logo.href} x={40 + pad} y={26 + pad} width={logoW} height={logoH} preserveAspectRatio="xMidYMid meet" />
          <rect x={pillX} y={30} width={pillW} height={56} rx={14} fill={C.pill} />
          <Icon name="calendar" x={pillX + 20} y={42} size={32} color={C.emerald} />
          <text x={pillX + 66} y={59} dominantBaseline="central" {...t(25, 600, C.pillText)}>
            {date}
          </text>
        </g>
      )}

      {/* title + script + banner */}
      <g transform={at(0)}>
        <text x={42} y={250} {...t(titleSize, 900, C.strong)} letterSpacing={-3.5}>
          <tspan>{d.titleA}</tspan>
          <tspan fill="url(#st-title)"> {d.titleB}</tspan>
        </text>
        <g transform="rotate(-13 975 250)">
          {d.script.map((s, i) => (
            <text key={i} x={900 + [0, -6, 12][i]} y={220 + i * 44.3} fontFamily={SCRIPT_FONT} fontStyle="italic" fontWeight={700} fontSize={41} fill={C.strong}>
              {s}
            </text>
          ))}
        </g>
        <path d="M918 352C954 340 992 330 1038 322" stroke={C.emerald} strokeWidth={5} strokeLinecap="round" fill="none" />

        {/* TRADE SETUP brush banner */}
        <g transform="translate(30 266)">
          <path
            fill={C.banner}
            d="M26 14 C120 6 240 12 360 8 C450 5 540 10 612 6 L606 20 L626 24 L604 34 L618 44 L600 52 L622 62 L598 70 L612 82 L590 90 C470 98 350 92 240 97 C150 100 70 96 16 100 L28 90 L8 84 L24 74 L4 66 L22 56 L10 46 L24 38 L6 30 L22 22 Z"
          />
          <path d="M40 8 C200 2 420 6 590 2" stroke={C.banner} strokeWidth={4} strokeLinecap="round" opacity={0.7} fill="none" />
          <path d="M36 101 C200 104 420 98 572 96" stroke={C.banner} strokeWidth={3} strokeLinecap="round" opacity={0.6} fill="none" />
          <path d="M600 30 L636 28 M596 60 L632 58 M594 80 L620 82" stroke={C.banner} strokeWidth={2.5} strokeLinecap="round" opacity={0.55} fill="none" />
        </g>
        <text x={84} y={328} {...t(Math.min(55, fitFont(S.banner, 400, 55, 30)), 900, "#fff")} letterSpacing={-0.5}>
          {S.banner}
        </text>
        <g transform="translate(500 292)" fill="#fff">
          <rect x={0} y={24} width={10} height={16} rx={1.5} />
          <rect x={16} y={13} width={10} height={27} rx={1.5} />
          <rect x={32} y={0} width={10} height={40} rx={1.5} />
        </g>
      </g>

      {/* info row */}
      <g transform={at(1)}>
        <rect x={40} y={386} width={1001} height={92} rx={16} fill={C.card} stroke={C.border} strokeWidth={1.5} />
        {infoCells.map((c, i) => (
          <g key={c.label}>
            {i > 0 && <line x1={c.x0} x2={c.x0} y1={406} y2={458} stroke={C.border} strokeWidth={1.5} />}
            <Icon name={c.icon} x={c.x0 + 26} y={411} size={42} color={C.icon} />
            <text x={c.x0 + 86} y={419} {...t(16.5, 600, C.label)} letterSpacing={0.4}>
              {c.label}
            </text>
            <text x={c.x0 + 86} y={452} {...t(fitFont(c.value, c.w - 86 - 22, 27, 16), 800, C.strong)}>
              {c.value}
            </text>
          </g>
        ))}
      </g>

      {/* chart */}
      <g transform={at(2)}>
        <g clipPath="url(#st-chart-clip)">
          {d.chart ? (
            <g>
              <rect x={40} y={497} width={1001} height={484} fill={C.chartBg} />
              <image href={d.chart} x={cp.x} y={cp.y} width={cp.w} height={cp.h} preserveAspectRatio="none" />
            </g>
          ) : (
            <svg x={40} y={497} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
              {S.chartFallback}
            </svg>
          )}
        </g>
        <rect x={40} y={497} width={1001} height={484} rx={17} fill="none" stroke={C.border} strokeWidth={1.5} />
      </g>

      {/* direction + levels */}
      <g transform={at(3)}>
        <rect x={40} y={1012} width={258} height={106} rx={14} fill={buy ? "url(#st-buy)" : "url(#st-sell)"} filter="url(#st-shadow)" />
        <circle cx={93} cy={1065} r={33} fill="#fff" fillOpacity={0.18} />
        <svg x={73} y={1045} width={40} height={40} viewBox="0 0 64 64">
          <path d={buy ? "M32 54V12M14 30l18-18 18 18" : "M32 10v42M14 34l18 18 18-18"} stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <text x={144} y={1047} {...t(14, 600, "#fff")} letterSpacing={0.3} opacity={0.95}>
          TRADE DIRECTION
        </text>
        <text x={144} y={1091} {...t(41, 900, "#fff")}>
          {buy ? "BUY" : "SELL"}
        </text>

        <rect x={312} y={1012} width={729} height={106} rx={16} fill={C.card} stroke={C.border} strokeWidth={1.5} />
        {levels.map((l, i) => {
          const x0 = 312 + i * 182.25;
          return (
            <g key={l.label}>
              {i > 0 && <line x1={x0} x2={x0} y1={1033} y2={1097} stroke={C.border} strokeWidth={1.5} />}
              <Icon name={l.icon} x={x0 + 22} y={1033} size={34} color={l.ic} />
              <text x={x0 + 70} y={1047} {...t(15, 600, C.label)} letterSpacing={0.4}>
                {l.label}
              </text>
              <text x={x0 + 70} y={1086} {...t(fitFont(l.value, 182.25 - 70 - 12, 30, 18), 800, l.vc)}>
                {l.value}
              </text>
            </g>
          );
        })}
      </g>

      {/* bottom card */}
      <g transform={at(4)}>
        <rect x={40} y={1132} width={1001} height={128} rx={16} fill={C.card} stroke={C.border} strokeWidth={1.5} />
        <line x1={bx[1]} x2={bx[1]} y1={1150} y2={1242} stroke={C.border} strokeWidth={1.5} />
        <line x1={bx[2]} x2={bx[2]} y1={1150} y2={1242} stroke={C.border} strokeWidth={1.5} />
        {[
          { x0: bx[0], w: bottomW[0], icon: "calendar" as const, label: "TIME FRAME", value: d.timeframe.trim() || "—" },
          { x0: bx[1], w: bottomW[1], ...S.setup },
        ].map((c) => (
          <g key={c.label}>
            <Icon name={c.icon} x={c.x0 + 24} y={1161} size={34} color={c.ic ?? C.icon} />
            <text x={c.x0 + 73} y={1175} {...t(14.5, 600, C.label)} letterSpacing={0.4}>
              {c.label}
            </text>
            <text x={c.x0 + 73} y={1208} {...t(fitFont(c.value, c.w - 73 - 16, 23, 14), 800, c.vc ?? C.strong)}>
              {c.value}
            </text>
          </g>
        ))}
        <Icon name={S.key.icon} x={bx[2] + 24} y={1161} size={34} color={C.icon} />
        <text x={bx[2] + 73} y={1175} {...t(14.5, 600, C.label)} letterSpacing={0.4}>
          {S.key.label}
        </text>
        {S.key.value !== undefined && (
          <g>
            <text x={bx[2] + 73} y={1212} {...t(fitFont(S.key.value || "—", bottomW[2] - 73 - 16, 27, 14), 800, C.strong)}>
              {S.key.value || "—"}
            </text>
            {S.key.caption && (
              <text x={bx[2] + 73} y={1236} {...t(fitFont(S.key.caption, bottomW[2] - 73 - 20, 13.5, 10), 600, C.label)}>
                {S.key.caption}
              </text>
            )}
          </g>
        )}
        {shownReasons.map((l, i) => (
          <g key={i}>
            {l.bullet && <circle cx={bx[2] + 77} cy={1191 + i * 19} r={2.6} fill={C.body} />}
            <text x={bx[2] + 86} y={1196 + i * 19} {...t(15.5, 600, C.body)}>
              {l.text}
            </text>
          </g>
        ))}
        {!shownReasons.length && S.key.value === undefined && (
          <text x={bx[2] + 73} y={1208} {...t(23, 800, C.strong)}>
            —
          </text>
        )}
        <rect x={bx[3] + 6} y={1146} width={bottomW[3] - 18} height={100} rx={14} fill={C.risk} />
        <Icon name={S.last.icon} x={bx[3] + 22} y={1176} size={40} color={S.last.ic ?? C.emerald} />
        {S.last.label.length > 13 && S.last.label.includes(" ") ? (
          // a long label goes on two lines
          <text x={bx[3] + 76} y={1168} {...t(13.5, 600, C.label)} letterSpacing={0.4}>
            <tspan>{S.last.label.slice(0, S.last.label.lastIndexOf(" "))}</tspan>
            <tspan x={bx[3] + 76} dy={17}>
              {S.last.label.slice(S.last.label.lastIndexOf(" ") + 1)}
            </tspan>
          </text>
        ) : (
          <text x={bx[3] + 76} y={1180} {...t(14.5, 600, C.label)} letterSpacing={0.4}>
            {S.last.label}
          </text>
        )}
        <text x={bx[3] + 76} y={1218} {...t(fitFont(S.last.value, bottomW[3] - 76 - 16, 31, 16), 800, S.last.vc ?? C.strong)}>
          {S.last.value}
        </text>
      </g>

      {/* footer */}
      {d.layout.showFooter && (
        <g transform={`translate(0 ${L.footerDy})`}>
          <rect x={lineL} y={1300} width={170} height={2} rx={1} fill="url(#st-fl)" />
          <rect x={lineR} y={1300} width={170} height={2} rx={1} fill="url(#st-fr)" />
          <text x={540} y={1301} textAnchor="middle" dominantBaseline="central" {...t(14.5, 600, C.pillText)} letterSpacing={3.4} xmlSpace="preserve">
            {d.footer}
          </text>
          <g transform="translate(966 1234)" opacity={0.55} fill="none">
            <path d="M20 118V92M44 118V74M68 118V56M92 118V36" stroke={C.deco1} strokeWidth={12} />
            <path d="M6 96L40 66 62 76 104 30" stroke={C.deco2} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M86 28h20v20" stroke={C.deco2} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      )}
    </svg>
  );
});
