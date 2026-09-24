import type { Sentiment } from "@/social/instagram/kit";

export type MarketKey = "dow" | "crudeOil" | "dollarIndex" | "giftNifty" | "oiBuildup" | "preOpen";

export type MarketItem = {
  /** short name on the cover card */
  name: string;
  /** heading on the market's own slide */
  title: string;
  /** small line under the heading, e.g. "(WTI)" */
  subtitle: string;
  value: string;
  /** small note under the value, e.g. "(Net OI Change)" */
  valueNote: string;
  /** label of the second figure: "Change (%)" or e.g. "Direction" */
  secondLabel: string;
  /** the second figure: change % or a word like "More Shorts" */
  change: string;
  sentiment: Sentiment;
  /** your own commentary for the slide */
  description: string;
  /** auto = decorative trend by sentiment, points = plot the pasted values, off = no chart */
  chart: "auto" | "points" | "off";
  points: string;
};

export type GlobalMarketData = {
  /** yyyy-mm-dd */
  date: string;
  titleTop: string;
  titleAccent: string;
  subtitle: string;
  footer: string;
  swipe: string;
  markets: Record<MarketKey, MarketItem>;
};

export const MARKET_ORDER: MarketKey[] = ["dow", "crudeOil", "dollarIndex", "giftNifty", "oiBuildup", "preOpen"];

/** file names from the daily folder layout: 01_cover.png … 07_premarket.png */
export const SLIDE_FILES: Record<"cover" | MarketKey, string> = {
  cover: "01_cover",
  dow: "02_dow",
  crudeOil: "03_crude",
  dollarIndex: "04_dxy",
  giftNifty: "05_gift",
  oiBuildup: "06_oi",
  preOpen: "07_premarket",
};

export const TOTAL_SLIDES = 1 + MARKET_ORDER.length;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function item(p: Partial<MarketItem> & Pick<MarketItem, "name" | "title" | "sentiment">): MarketItem {
  return {
    subtitle: "",
    value: "",
    valueNote: "",
    secondLabel: "Change (%)",
    change: "",
    description: "",
    chart: "auto",
    points: "",
    ...p,
  };
}

/** Values and descriptions stay empty: never invent market data or commentary. */
export function defaultData(): GlobalMarketData {
  return {
    date: todayIso(),
    titleTop: "GLOBAL MARKET",
    titleAccent: "SENTIMENTS",
    subtitle: "Global cues • Market direction • What to watch",
    footer: "Swipe to see details →",
    swipe: "Swipe →",
    markets: {
      dow: item({ name: "DOW", title: "DOW", subtitle: "(U.S. Stock Market)", sentiment: "BULLISH" }),
      crudeOil: item({ name: "CRUDE OIL", title: "CRUDE OIL", subtitle: "(WTI)", sentiment: "BEARISH" }),
      dollarIndex: item({ name: "DOLLAR INDEX", title: "Dollar Index", subtitle: "(DXY)", sentiment: "NEUTRAL" }),
      giftNifty: item({ name: "GIFT NIFTY", title: "Gift Nifty", subtitle: "(NSE Futures)", sentiment: "BULLISH" }),
      oiBuildup: item({
        name: "PREV. DAY OI",
        title: "Previous Day OI Buildup",
        valueNote: "(Net OI Change)",
        secondLabel: "Direction",
        chart: "off",
        sentiment: "NEUTRAL",
      }),
      preOpen: item({ name: "PRE-OPEN", title: "Pre-Open Market", subtitle: "(Today)", sentiment: "NEUTRAL" }),
    },
  };
}

/** Saved data from an older version may lack newer fields: fill them from the defaults. */
export function mergeData(saved: Partial<GlobalMarketData> | null): GlobalMarketData {
  const base = defaultData();
  if (!saved) return base;
  const markets = { ...base.markets };
  for (const k of MARKET_ORDER) markets[k] = { ...base.markets[k], ...(saved.markets?.[k] ?? {}) };
  return { ...base, ...saved, markets };
}

/** "72.14, 71.9 72.5" → [72.14, 71.9, 72.5] (anything non-numeric ignored). */
export function parsePoints(s: string) {
  return s
    .split(/[\s,;]+/)
    .map((x) => Number(x.replace(/[^0-9.+-]/g, "")))
    .filter((n) => Number.isFinite(n) && n !== 0);
}
