import { common, mergeCommon, type IndicatorCommon, type Point } from "./data";

/*
 * Indicator Setup ("power setup") post: one strong idea, e.g. "VWAP on the premium chart".
 * Title block, a chart (upload, or a drawn illustration made for the setup), three
 * "how to trade it" steps and a rule strip. Three presets fill in everything.
 */

/** Drawn illustration when no chart is uploaded. */
export type SetupSample = "vwap-premium" | "camarilla-premium" | "cpr-camarilla";
export const SETUP_SAMPLES: [SetupSample, string][] = [
  ["vwap-premium", "Premium chart with VWAP"],
  ["camarilla-premium", "Premium chart with Camarilla levels"],
  ["cpr-camarilla", "CPR band with Camarilla R3 inside"],
];

export type SetupData = IndicatorCommon & {
  banner: string;
  sample: SetupSample;
  chart: string | null;
  chartSize: { w: number; h: number } | null;
  chartFit: "fit" | "fill";
  chartZoom: number;
  chartX: number;
  chartY: number;
  chartCaption: string;
  sampleTag: boolean;
  stepsTitle: string;
  steps: [Point, Point, Point];
  ruleLabel: string;
  rule: string;
};

export type SetupPreset = { id: string; label: string; make: () => SetupData };

const base = (): Omit<SetupData, "titleA" | "titleB" | "subtitle" | "banner" | "sample" | "chartCaption" | "steps" | "ruleLabel" | "rule"> => ({
  ...common(),
  chart: null,
  chartSize: null,
  chartFit: "fit",
  chartZoom: 100,
  chartX: 0,
  chartY: 0,
  sampleTag: true,
  stepsTitle: "HOW TO TRADE IT",
});

export const SETUP_PRESETS: SetupPreset[] = [
  {
    id: "vwap-premium",
    label: "VWAP on the premium chart",
    make: () => ({
      ...base(),
      titleA: "VWAP",
      titleB: "ON PREMIUM",
      subtitle: "Very powerful on the option premium chart",
      banner: "POWER SETUP",
      sample: "vwap-premium",
      chartCaption: "NIFTY 24500 CE · 5 min · VWAP",
      steps: [
        { icon: "chart", title: "Open the premium chart", text: "Plot VWAP on the option's own chart (CE / PE), not only on the index." },
        { icon: "entry", title: "Buy the pullback", text: "Premium holding above VWAP and bouncing from it = buyers in control." },
        { icon: "stop", title: "Exit below VWAP", text: "A close back below VWAP means the move has failed: cut the trade." },
      ],
      ruleLabel: "RULE",
      rule: "Premium above VWAP → look to buy.  Premium below VWAP → avoid buying, or exit.",
    }),
  },
  {
    id: "camarilla-premium",
    label: "Camarilla Pivot on the premium chart",
    make: () => ({
      ...base(),
      titleA: "CAMARILLA",
      titleB: "PIVOT",
      subtitle: "Very powerful on the option premium chart",
      banner: "PREMIUM LEVELS",
      sample: "camarilla-premium",
      chartCaption: "BANKNIFTY 52000 PE · 5 min · Camarilla",
      steps: [
        { icon: "levels", title: "Plot on the premium", text: "Work out Camarilla from the option's own previous-day high, low and close." },
        { icon: "entry", title: "Reversal at S3", text: "Premium holding S3 and turning up is a low-risk buy zone." },
        { icon: "target", title: "Breakout above R4", text: "A strong close above R4 often starts a fast, trending move." },
      ],
      ruleLabel: "RULE",
      rule: "Between S3 and R3 = range: trade reversals.  Beyond S4 / R4 = trend: trade breakouts.",
    }),
  },
  {
    id: "cpr-camarilla",
    label: "Camarilla S3 / R3 inside CPR",
    make: () => ({
      ...base(),
      titleA: "S3 / R3",
      titleB: "INSIDE CPR",
      subtitle: "When Camarilla S3 or R3 falls inside the Central Pivot Range",
      banner: "CONFLUENCE",
      sample: "cpr-camarilla",
      chartCaption: "NIFTY · 5 min · CPR + Camarilla",
      steps: [
        { icon: "levels", title: "Find the overlap", text: "Check whether Camarilla R3 or S3 lies between CPR's TC and BC." },
        { icon: "eye", title: "Wait for price to reach it", text: "Two pivot levels in one zone make strong support or resistance." },
        { icon: "entry", title: "Trade the reaction", text: "Rejection at R3 inside CPR → short; bounce at S3 inside CPR → long." },
      ],
      ruleLabel: "WHY IT WORKS",
      rule: "Two pivot methods agreeing on one zone means more traders watch it, so the reaction is stronger.",
    }),
  },
];

export const setupSample = () => SETUP_PRESETS[0].make();

const str = (v: unknown, b: string) => (v === undefined || v === null ? b : String(v));
const num = (v: unknown, min: number, max: number, b: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : b;
};

export function mergeSetup(raw: Record<string, unknown> | null): SetupData {
  const b = setupSample();
  if (!raw) return b;
  const steps = b.steps.map((s, i) => {
    const r = Array.isArray(raw.steps) ? (raw.steps as Partial<Point>[])[i] : undefined;
    return { icon: str(r?.icon, s.icon), title: str(r?.title, s.title), text: str(r?.text, s.text) };
  }) as SetupData["steps"];
  const size = raw.chartSize as { w?: unknown; h?: unknown } | null | undefined;
  return {
    ...mergeCommon(raw, b),
    banner: str(raw.banner, b.banner),
    sample: SETUP_SAMPLES.some(([k]) => k === raw.sample) ? (raw.sample as SetupSample) : b.sample,
    chart: typeof raw.chart === "string" && raw.chart ? raw.chart : null,
    chartSize: size && Number(size.w) > 0 && Number(size.h) > 0 ? { w: Number(size.w), h: Number(size.h) } : null,
    chartFit: raw.chartFit === "fill" ? "fill" : "fit",
    chartZoom: num(raw.chartZoom, 25, 400, 100),
    chartX: num(raw.chartX, -600, 600, 0),
    chartY: num(raw.chartY, -600, 600, 0),
    chartCaption: str(raw.chartCaption, b.chartCaption),
    sampleTag: typeof raw.sampleTag === "boolean" ? raw.sampleTag : b.sampleTag,
    stepsTitle: str(raw.stepsTitle, b.stepsTitle),
    steps,
    ruleLabel: str(raw.ruleLabel, b.ruleLabel),
    rule: str(raw.rule, b.rule),
  };
}
