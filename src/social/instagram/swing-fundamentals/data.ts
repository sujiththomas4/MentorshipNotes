import { baseDefaults, mergeBase, num, str, type SwingBase } from "@/social/instagram/swing-trade/data";

/*
 * Indian Traders — Swing Trade without Target and Stop Loss (single post, 1080 × 1350).
 * The Swing Trade layout with the stock's fundamentals in place of the trade levels:
 *   Entry price → Sector        Target 1 → Market cap       Target 2 → Sales (₹ Cr)
 *   Stop loss → ROCE            Trade setup → Net profit    Key reason → company PE vs industry PE
 *   Risk / reward → Promoter holding
 */

export type SwingFundamentalsData = SwingBase & {
  sector: string;
  /** ₹ crore, as typed */
  marketCap: string;
  /** sales / revenue, ₹ crore */
  sales: string;
  /** % */
  roce: string;
  /** ₹ crore */
  netProfit: string;
  companyPe: string;
  industryPe: string;
  /** % */
  promoterHolding: string;
  /** text on the brush banner under the title */
  banner: string;
};

/** Values start empty: never invent a company's numbers. */
export function defaultData(): SwingFundamentalsData {
  return {
    ...baseDefaults(),
    sector: "",
    marketCap: "",
    sales: "",
    roce: "",
    netProfit: "",
    companyPe: "",
    industryPe: "",
    promoterHolding: "",
    banner: "TRADE SETUP",
  };
}

/** Made-up numbers for a made-up company (gallery thumbnail and "Load example"). */
export function exampleData(): SwingFundamentalsData {
  return {
    ...defaultData(),
    date: "2026-09-15",
    stockName: "SAMPLE INDUSTRIES",
    ticker: "SAMPLE",
    currentPrice: "1420",
    sector: "Capital Goods",
    marketCap: "48250",
    sales: "12640",
    roce: "24.6",
    netProfit: "1385",
    companyPe: "32.4",
    industryPe: "41.8",
    promoterHolding: "56.2",
  };
}

export function mergeData(raw: Partial<Record<keyof SwingFundamentalsData, unknown>> | null): SwingFundamentalsData {
  const base = defaultData();
  if (!raw) return base;
  return {
    ...mergeBase(raw, base),
    sector: str(raw.sector, base.sector),
    marketCap: str(raw.marketCap, base.marketCap),
    sales: str(raw.sales, base.sales),
    roce: str(raw.roce, base.roce),
    netProfit: str(raw.netProfit, base.netProfit),
    companyPe: str(raw.companyPe, base.companyPe),
    industryPe: str(raw.industryPe, base.industryPe),
    promoterHolding: str(raw.promoterHolding, base.promoterHolding),
    banner: str(raw.banner, base.banner),
  };
}

/** 48250 → "₹48,250 Cr"; text is shown as typed; empty → —. */
export function crore(v: string) {
  const n = num(v);
  if (Number.isFinite(n)) return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
  return v.trim() || "—";
}

/** 24.6 → "24.6%"; text (e.g. "24.6 %") as typed; empty → —. */
export function percent(v: string) {
  const n = num(v.replace(/%\s*$/, ""));
  if (Number.isFinite(n)) return `${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
  return v.trim() || "—";
}

/** "32.4 vs 41.8" and whether the company trades below / above its industry's PE. */
export function peCompare(d: SwingFundamentalsData) {
  const c = d.companyPe.trim();
  const i = d.industryPe.trim();
  const value = c || i ? `${c || "—"} vs ${i || "—"}` : "—";
  const [cn, inum] = [num(c), num(i)];
  const relation = Number.isFinite(cn) && Number.isFinite(inum) && cn !== inum ? (cn < inum ? "below" : "above") : null;
  return { value, relation };
}
