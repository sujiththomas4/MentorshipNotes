import type { IgLogoVariant, Sentiment } from "@/social/instagram/kit";

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
  /** OI slide only: change in call (CE) and put (PE) open interest, as typed (e.g. "+12.4 L") */
  ceChange: string;
  peChange: string;
  /** OI slide only: which side is building up */
  buildup: "CE" | "PE" | "";
};

export type GlobalMarketData = {
  /** yyyy-mm-dd */
  date: string;
  titleTop: string;
  titleAccent: string;
  subtitle: string;
  footer: string;
  swipe: string;
  /** which locked logo from Branding */
  logo: IgLogoVariant;
  /** photo background on the cover (slide 1) */
  coverPhoto: boolean;
  /** dark overlay over the photo, 0–90 % */
  coverDim: number;
  /** see-through of the tiles and panels over the photo, 0 = clear … 100 = solid (%) */
  cardOpacity: number;
  /** opacity of the chart pictures on BULLISH / BEARISH slides (%) */
  chartOpacity: number;
  markets: Record<MarketKey, MarketItem>;
};

export const MARKET_ORDER: MarketKey[] = ["dow", "crudeOil", "dollarIndex", "giftNifty", "oiBuildup", "preOpen"];

/** file names from the spec's folder workflow (YYYY-MM-DD/01_cover_initial.png …) */
export const SLIDE_FILES: Record<"cover" | MarketKey, string> = {
  cover: "01_cover_initial",
  dow: "02_dow_initial",
  crudeOil: "03_crude_oil_initial",
  dollarIndex: "04_dollar_index_initial",
  giftNifty: "05_gift_nifty_initial",
  oiBuildup: "06_oi_buildup_initial",
  preOpen: "07_pre_open_initial",
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
    ceChange: "",
    peChange: "",
    buildup: "",
    ...p,
  };
}

/** Values and descriptions stay empty: never invent market data or commentary. */
export function defaultData(): GlobalMarketData {
  return {
    date: todayIso(),
    titleTop: "GLOBAL MARKET",
    titleAccent: "SENTIMENTS",
    subtitle: "Key Global Cues  |  Market Direction  |  What to Watch",
    footer: "Swipe to see details →",
    swipe: "Swipe →",
    logo: "horizontal",
    coverPhoto: true,
    coverDim: 30,
    cardOpacity: 72,
    chartOpacity: 100,
    markets: {
      dow: item({ name: "DOW", title: "DOW", subtitle: "(U.S. Stock Market)", sentiment: "BULLISH" }),
      crudeOil: item({ name: "CRUDE OIL", title: "CRUDE OIL", subtitle: "(WTI)", sentiment: "BEARISH" }),
      dollarIndex: item({ name: "Dollar Index", title: "Dollar Index", subtitle: "(DXY)", sentiment: "NEUTRAL" }),
      giftNifty: item({ name: "Gift Nifty", title: "Gift Nifty", subtitle: "(NSE Futures)", sentiment: "BULLISH" }),
      oiBuildup: item({
        name: "Prev. Day OI Buildup",
        title: "Previous Day OI Buildup",
        valueNote: "(Net OI Change)",
        secondLabel: "Direction",
        chart: "off",
        sentiment: "NEUTRAL",
      }),
      preOpen: item({ name: "Pre-Open Market", title: "Pre-Open Market", subtitle: "(Today)", sentiment: "NEUTRAL" }),
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
