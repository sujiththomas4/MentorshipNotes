import type { IgLogoVariant } from "@/social/instagram/kit";
import { defaultLayout, mergeLayout, type IgLayout, type IgTheme } from "@/social/instagram/layout";
import type { LogoBg } from "@/social/instagram/swing-trade/data";

/*
 * Indian Traders indicator posts in the Swing Trade style:
 *  - Intro: "INDICATOR INTRO" as the big title, the indicator's name on the brush banner; what it is (3 facts), a chart (upload or sample), why it matters, the golden rule.
 *  - Details: the key points to note, numbered, and a pro tip.
 * The sample content is VWAP; every text is editable.
 */

export const INDICATOR_THEMES: IgTheme[] = [
  { id: "light", label: "Light", swatch: ["#fbfcfd", "#12355B", "#0AA66A"] },
  { id: "navy", label: "Dark navy", swatch: ["#0e2239", "#8cb8ea", "#0AA66A"] },
];

/** Fields both posts share: header, title block, footer, layout. */
export type IndicatorCommon = {
  /** right-hand pill, e.g. "INDICATOR SERIES #1"; empty hides it */
  pill: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  script: [string, string, string];
  footer: string;
  logo: IgLogoVariant;
  logoBg: LogoBg;
  logoHeight: number;
  layout: IgLayout;
};

export type InfoCell = { icon: string; label: string; value: string };
export type Point = { icon: string; title: string; text: string };

export type IntroData = IndicatorCommon & {
  banner: string;
  info: [InfoCell, InfoCell, InfoCell];
  chart: string | null;
  chartSize: { w: number; h: number } | null;
  chartFit: "fit" | "fill";
  chartZoom: number;
  chartX: number;
  chartY: number;
  /** small line above the chart, e.g. "NIFTY · 5 min · VWAP" */
  chartCaption: string;
  sampleTag: boolean;
  whyTitle: string;
  why: string[];
  keyLabel: string;
  keyText: string;
  /** a second page after the intro: the indicator's key points (a 2-slide carousel) */
  withDetails: boolean;
  details: DetailsPage;
};

/** The Intro's details page: its own fields; logo, pill, script, footer and layout come from the intro. */
export type DetailsPage = { titleA: string; titleB: string; subtitle: string; banner: string; points: Point[]; tipLabel: string; tip: string };

export type DetailsData = IndicatorCommon & {
  banner: string;
  points: Point[];
  tipLabel: string;
  tip: string;
};

export const MIN_POINTS = 3;
export const MAX_POINTS = 7;

export function common(): IndicatorCommon {
  return {
    pill: "INDICATOR SERIES",
    titleA: "VWAP",
    titleB: "",
    subtitle: "Volume Weighted Average Price",
    script: ["Learn", "Apply", "Grow"],
    footer: "TRADE SMART   |   LEARN DAILY   |   GROW TOGETHER",
    logo: "horizontal",
    logoBg: "plate",
    logoHeight: 86,
    layout: defaultLayout("light"),
  };
}

export function introSample(): IntroData {
  return {
    ...common(),
    titleA: "INDICATOR",
    titleB: "INTRO",
    banner: "VWAP",
    info: [
      { icon: "clock", label: "TIME FRAME", value: "Intraday (resets daily)" },
      { icon: "layers", label: "TYPE", value: "Trend & fair value" },
      { icon: "target", label: "BEST FOR", value: "Index, stocks & options" },
    ],
    chart: null,
    chartSize: null,
    chartFit: "fit",
    chartZoom: 100,
    chartX: 0,
    chartY: 0,
    chartCaption: "NIFTY · 5 min · VWAP",
    sampleTag: true,
    whyTitle: "WHY IT MATTERS",
    why: [
      "Shows the average price weighted by volume: where most trading happened.",
      "Institutions use it as the day's fair-value benchmark.",
      "Works as dynamic support / resistance during the day.",
    ],
    keyLabel: "GOLDEN RULE",
    keyText: "Above VWAP → prefer longs\nBelow VWAP → prefer shorts",
    withDetails: false,
    details: detailsPage(detailsSample()),
  };
}

const detailsPage = (d: DetailsData): DetailsPage => ({ titleA: d.titleA, titleB: d.titleB, subtitle: d.subtitle, banner: d.banner, points: d.points, tipLabel: d.tipLabel, tip: d.tip });

/** The Intro's details page as full Details data (it shares the intro's header, footer and layout). */
export function introDetails(d: IntroData): DetailsData {
  return { pill: d.pill, script: d.script, footer: d.footer, logo: d.logo, logoBg: d.logoBg, logoHeight: d.logoHeight, layout: d.layout, ...d.details };
}

export function detailsSample(): DetailsData {
  return {
    ...common(),
    titleB: "NOTES",
    subtitle: "Key points every trader must remember",
    banner: "KEY POINTS",
    points: [
      { icon: "clock", title: "Resets every day", text: "VWAP starts fresh at the market open, so use it on intraday charts only." },
      { icon: "wave", title: "Price above VWAP = strength", text: "Buyers are in control; look for longs on pullbacks to VWAP." },
      { icon: "levels", title: "Price below VWAP = weakness", text: "Sellers are in control; VWAP often acts as resistance on bounces." },
      { icon: "volume", title: "Volume gives it weight", text: "High-volume candles move VWAP more than quiet ones." },
      { icon: "entry", title: "Wait for confirmation", text: "Don't enter just because price touches VWAP; wait for a rejection candle." },
      { icon: "alert", title: "Avoid a flat, choppy VWAP", text: "When price keeps crossing VWAP there is no direction: stay out." },
    ],
    tipLabel: "PRO TIP",
    tip: "Combine VWAP with CPR or Camarilla levels: a level that lines up with VWAP is much stronger.",
  };
}

/* ---------------- merging saved / loaded data ---------------- */

const str = (v: unknown, b: string) => (v === undefined || v === null ? b : String(v));
const num = (v: unknown, min: number, max: number, b: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : b;
};

export function mergeCommon(raw: Record<string, unknown>, base: IndicatorCommon): IndicatorCommon {
  const script = Array.isArray(raw.script) && raw.script.length === 3 ? (raw.script.map((s) => str(s, "")) as [string, string, string]) : base.script;
  return {
    pill: str(raw.pill, base.pill),
    titleA: str(raw.titleA, base.titleA),
    titleB: str(raw.titleB, base.titleB),
    subtitle: str(raw.subtitle, base.subtitle),
    script,
    footer: str(raw.footer, base.footer),
    logo: raw.logo === "tricolor" ? "tricolor" : "horizontal",
    logoBg: raw.logoBg === "none" || raw.logoBg === "shield" || raw.logoBg === "plate" ? raw.logoBg : base.logoBg,
    logoHeight: Math.round(num(raw.logoHeight, 40, 160, base.logoHeight)),
    layout: mergeLayout(raw.layout, base.layout, INDICATOR_THEMES),
  };
}

export function mergeIntro(raw: Record<string, unknown> | null): IntroData {
  const base = introSample();
  if (!raw) return base;
  const info = base.info.map((b, i) => {
    const r = Array.isArray(raw.info) ? (raw.info as Partial<InfoCell>[])[i] : undefined;
    return { icon: str(r?.icon, b.icon), label: str(r?.label, b.label), value: str(r?.value, b.value) };
  }) as IntroData["info"];
  const size = raw.chartSize as { w?: unknown; h?: unknown } | null | undefined;
  return {
    ...mergeCommon(raw, base),
    banner: str(raw.banner, base.banner),
    info,
    chart: typeof raw.chart === "string" && raw.chart ? raw.chart : null,
    chartSize: size && Number(size.w) > 0 && Number(size.h) > 0 ? { w: Number(size.w), h: Number(size.h) } : null,
    chartFit: raw.chartFit === "fill" ? "fill" : "fit",
    chartZoom: num(raw.chartZoom, 25, 400, 100),
    chartX: num(raw.chartX, -600, 600, 0),
    chartY: num(raw.chartY, -600, 600, 0),
    chartCaption: str(raw.chartCaption, base.chartCaption),
    sampleTag: typeof raw.sampleTag === "boolean" ? raw.sampleTag : base.sampleTag,
    whyTitle: str(raw.whyTitle, base.whyTitle),
    why: Array.isArray(raw.why) ? raw.why.slice(0, 4).map((s) => str(s, "")) : base.why,
    keyLabel: str(raw.keyLabel, base.keyLabel),
    keyText: str(raw.keyText, base.keyText),
    withDetails: typeof raw.withDetails === "boolean" ? raw.withDetails : base.withDetails,
    details: raw.details && typeof raw.details === "object" ? detailsPage(mergeDetails(raw.details as Record<string, unknown>)) : base.details,
  };
}

export function mergeDetails(raw: Record<string, unknown> | null): DetailsData {
  const base = detailsSample();
  if (!raw) return base;
  const points = Array.isArray(raw.points)
    ? (raw.points as Partial<Point>[]).slice(0, MAX_POINTS).map((p) => ({ icon: str(p?.icon, "check"), title: str(p?.title, ""), text: str(p?.text, "") }))
    : base.points;
  while (points.length < MIN_POINTS) points.push({ icon: "check", title: "", text: "" });
  return {
    ...mergeCommon(raw, base),
    banner: str(raw.banner, base.banner),
    points,
    tipLabel: str(raw.tipLabel, base.tipLabel),
    tip: str(raw.tip, base.tip),
  };
}
