import type { IgLogoVariant } from "@/social/instagram/kit";
import { defaultLayout, mergeLayout, type IgLayout, type IgTheme } from "@/social/instagram/layout";

/*
 * Indian Traders — Swing Trade (single post, 1080 × 1350). Field names follow the original
 * HTML template's trade-data JSON, so its .json files can be loaded as they are.
 */

export type Direction = "BUY" | "SELL";
export type LogoBg = "none" | "plate" | "shield";

export const SWING_THEMES: IgTheme[] = [
  { id: "light", label: "Light", swatch: ["#fbfcfd", "#12355B", "#0AA66A"] },
  { id: "navy", label: "Dark navy", swatch: ["#0e2239", "#8cb8ea", "#0AA66A"] },
];

export type SwingTradeData = {
  /** yyyy-mm-dd */
  date: string;
  stockName: string;
  ticker: string;
  exchange: string;
  /** prices are kept as typed; they are formatted as ₹1,425 on the artwork */
  currentPrice: string;
  direction: Direction;
  entryPrice: string;
  target1: string;
  target2: string;
  stopLoss: string;
  timeframe: string;
  setup: string;
  /** 1–3 short points */
  reason: string[];
  riskReward: string;
  /** your chart image (data URL). null = the illustrative chart drawn from the levels */
  chart: string | null;
  /** natural size of the chart image, for positioning (null until known) */
  chartSize: { w: number; h: number } | null;
  /** fit = whole image visible, fill = cover the chart box */
  chartFit: "fit" | "fill";
  /** zoom on top of fit/fill, % */
  chartZoom: number;
  /** offset from centred, px on the 1080 × 1350 canvas */
  chartX: number;
  chartY: number;
  /** small "Illustrative chart" tag while no real chart image is set */
  illustrativeTag: boolean;
  logo: IgLogoVariant;
  /** behind the logo: nothing, a navy rectangle, or navy filling only the inside of the shield */
  logoBg: LogoBg;
  /** logo height in px on the 1080 × 1350 canvas */
  logoHeight: number;
  titleA: string;
  titleB: string;
  script: [string, string, string];
  footer: string;
  /** format (feed / story), header + footer on/off, colour theme */
  layout: IgLayout;
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Trade values start empty: never invent a trade. */
export function defaultData(): SwingTradeData {
  return {
    date: todayIso(),
    stockName: "",
    ticker: "",
    exchange: "NSE",
    currentPrice: "",
    direction: "BUY",
    entryPrice: "",
    target1: "",
    target2: "",
    stopLoss: "",
    timeframe: "Daily",
    setup: "",
    reason: [""],
    riskReward: "",
    chart: null,
    chartSize: null,
    chartFit: "fit",
    chartZoom: 100,
    chartX: 0,
    chartY: 0,
    illustrativeTag: true,
    logo: "horizontal",
    logoBg: "plate",
    logoHeight: 86,
    titleA: "SWING",
    titleB: "TRADING",
    script: ["Plan", "Execute", "Grow"],
    footer: "TRADE SMART   |   LEARN DAILY   |   GROW TOGETHER",
    layout: defaultLayout("light"),
  };
}

/** The example that shipped inside swing-trade.html. */
export function exampleData(): SwingTradeData {
  return {
    ...defaultData(),
    date: "2026-09-15",
    stockName: "RELIANCE INDUSTRIES",
    ticker: "RELIANCE",
    exchange: "NSE",
    currentPrice: "1420",
    direction: "BUY",
    entryPrice: "1425",
    target1: "1450",
    target2: "1480",
    stopLoss: "1390",
    timeframe: "Daily",
    setup: "Breakout",
    reason: ["Breakout above resistance with strong volume", "Uptrend intact"],
    riskReward: "1 : 2.5",
  };
}

/** "15 Sep 2026" / ISO / anything Date understands → yyyy-mm-dd (else unchanged). */
function toIso(s: unknown) {
  const str = String(s ?? "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Saved or imported data (possibly from the HTML template) → full data, missing fields from defaults. */
export function mergeData(raw: Partial<Record<keyof SwingTradeData, unknown>> | null): SwingTradeData {
  const base = defaultData();
  if (!raw) return base;
  const s = (v: unknown, fallback: string) => (v === undefined || v === null ? fallback : String(v));
  const reason = Array.isArray(raw.reason) ? raw.reason.map(String).slice(0, 3) : raw.reason ? [String(raw.reason)] : base.reason;
  const script = Array.isArray(raw.script) && raw.script.length === 3 ? (raw.script.map(String) as [string, string, string]) : base.script;
  return {
    date: raw.date ? toIso(raw.date) : base.date,
    stockName: s(raw.stockName, base.stockName),
    ticker: s(raw.ticker, base.ticker),
    exchange: s(raw.exchange, base.exchange),
    currentPrice: s(raw.currentPrice, base.currentPrice),
    direction: String(raw.direction).toUpperCase() === "SELL" ? "SELL" : "BUY",
    entryPrice: s(raw.entryPrice, base.entryPrice),
    target1: s(raw.target1, base.target1),
    target2: s(raw.target2, base.target2),
    stopLoss: s(raw.stopLoss, base.stopLoss),
    timeframe: s(raw.timeframe, base.timeframe),
    setup: s(raw.setup, base.setup),
    reason: reason.length ? reason : base.reason,
    riskReward: s(raw.riskReward, base.riskReward),
    chart: typeof raw.chart === "string" && raw.chart ? raw.chart : null,
    chartSize: isSize(raw.chartSize) ? raw.chartSize : null,
    chartFit: raw.chartFit === "fill" ? "fill" : "fit",
    chartZoom: clampNum(raw.chartZoom, CHART_ZOOM_MIN, CHART_ZOOM_MAX, 100),
    chartX: clampNum(raw.chartX, -CHART_SHIFT, CHART_SHIFT, 0),
    chartY: clampNum(raw.chartY, -CHART_SHIFT, CHART_SHIFT, 0),
    illustrativeTag: typeof raw.illustrativeTag === "boolean" ? raw.illustrativeTag : base.illustrativeTag,
    logo: raw.logo === "tricolor" ? "tricolor" : "horizontal",
    logoBg: raw.logoBg === "none" || raw.logoBg === "shield" || raw.logoBg === "plate" ? raw.logoBg : (raw as { logoPlate?: unknown }).logoPlate === false ? "none" : base.logoBg,
    logoHeight: clampLogo(Number(raw.logoHeight ?? base.logoHeight)),
    titleA: s(raw.titleA, base.titleA),
    titleB: s(raw.titleB, base.titleB),
    script,
    footer: s(raw.footer, base.footer),
    layout: mergeLayout(raw.layout, base.layout, SWING_THEMES),
  };
}

/** "1,425.50" / "₹1425" → 1425.5 (NaN when empty or not a number). */
export function num(v: string) {
  const t = String(v ?? "").replace(/[₹,\s]/g, "");
  return t === "" ? NaN : Number(t);
}

/** ₹1,425 with Indian grouping; non-numbers are shown as typed, empty as —. */
export function inr(v: string) {
  const n = num(v);
  if (Number.isFinite(n)) return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return v.trim() || "—";
}

/** Reward : risk to Target 2 (and Target 1), as a suggestion for the Risk / Reward field. */
export function suggestedRR(d: SwingTradeData) {
  const e = num(d.entryPrice);
  const sl = num(d.stopLoss);
  const risk = Math.abs(e - sl);
  if (!Number.isFinite(risk) || risk === 0) return null;
  const r = (t: string) => {
    const x = num(t);
    return Number.isFinite(x) ? Math.round((Math.abs(x - e) / risk) * 10) / 10 : null;
  };
  return { t1: r(d.target1), t2: r(d.target2) };
}

/** Level order check: BUY needs SL < entry < T1 < T2, SELL the reverse. */
export function levelProblems(d: SwingTradeData) {
  const [e, t1, t2, sl] = [d.entryPrice, d.target1, d.target2, d.stopLoss].map(num);
  const out: string[] = [];
  const buy = d.direction === "BUY";
  const lt = (a: number, b: number) => (buy ? a < b : a > b);
  if (Number.isFinite(sl) && Number.isFinite(e) && !lt(sl, e)) out.push(`Stop loss should be ${buy ? "below" : "above"} the entry for a ${d.direction}.`);
  if (Number.isFinite(e) && Number.isFinite(t1) && !lt(e, t1)) out.push(`Target 1 should be ${buy ? "above" : "below"} the entry for a ${d.direction}.`);
  if (Number.isFinite(t1) && Number.isFinite(t2) && !lt(t1, t2)) out.push(`Target 2 should be ${buy ? "above" : "below"} Target 1.`);
  return out;
}

export const LOGO_MIN = 40;
export const LOGO_MAX = 160;
export function clampLogo(px: number) {
  return Number.isFinite(px) ? Math.min(LOGO_MAX, Math.max(LOGO_MIN, Math.round(px))) : 86;
}

/* ---- chart image placement ---- */

/** the chart box on the canvas */
export const CHART_BOX = { x: 40, y: 497, w: 1001, h: 484 };
export const CHART_ZOOM_MIN = 25;
export const CHART_ZOOM_MAX = 400;
export const CHART_SHIFT = 1000;

function isSize(v: unknown): v is { w: number; h: number } {
  const o = v as { w?: unknown; h?: unknown } | null;
  return !!o && typeof o.w === "number" && typeof o.h === "number" && o.w > 0 && o.h > 0;
}

export function clampNum(v: unknown, min: number, max: number, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** Where the chart image is drawn: fit/fill scale × zoom, centred in the box, then shifted. */
export function chartPlacement(d: Pick<SwingTradeData, "chartSize" | "chartFit" | "chartZoom" | "chartX" | "chartY">) {
  const B = CHART_BOX;
  const size = d.chartSize ?? { w: B.w, h: B.h };
  const base = d.chartFit === "fill" ? Math.max(B.w / size.w, B.h / size.h) : Math.min(B.w / size.w, B.h / size.h);
  const s = base * (d.chartZoom / 100);
  const w = size.w * s;
  const h = size.h * s;
  return { x: B.x + (B.w - w) / 2 + d.chartX, y: B.y + (B.h - h) / 2 + d.chartY, w, h };
}
