import type { IgLogoVariant } from "@/social/instagram/kit";

/*
 * Weekly Option Selling post (1080 × 1350), from the "Systematic Option Selling" HTML design.
 * ENTRY shows each leg's quantity and entry price; CLOSE adds the exit price and the total P&L.
 * Field names follow the HTML template's JSON so its .json files load as they are.
 */

export type TradeMode = "ENTRY" | "CLOSE";
export type Leg = {
  action: "SELL" | "BUY";
  strike: string;
  type: "CE" | "PE" | "";
  qty: string;
  /** entry price */
  price: string;
  /** close (exit) price, used in CLOSE mode */
  exitPrice: string;
};

export type OptionSellingData = {
  /** yyyy-mm-dd */
  date: string;
  instrument: string;
  mode: TradeMode;
  badgeEntry: string;
  badgeClose: string;
  legs: Leg[];
  /** margin used (₹) for the P&L %; empty = net premium */
  percentBase: string;
  showPercent: boolean;
  title1: string;
  title2: string;
  /** top-right line, "|" separated; empty hides it */
  tagline: string;
  footer: [string, string, string];
  logo: IgLogoVariant;
};

export const MAX_LEGS = 4;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const emptyLeg = (p: Partial<Leg> = {}): Leg => ({ action: "SELL", strike: "", type: "CE", qty: "", price: "", exitPrice: "", ...p });

/** Trade values start empty: never invent a trade. */
export function defaultData(): OptionSellingData {
  return {
    date: todayIso(),
    instrument: "NIFTY",
    mode: "ENTRY",
    badgeEntry: "TRADE ENTRY",
    badgeClose: "TRADE EXIT",
    legs: [emptyLeg()],
    percentBase: "",
    showPercent: true,
    title1: "WEEKLY",
    title2: "OPTION SELLING",
    tagline: "LEARN | TRADE | GROW",
    footer: ["PLAN", "EXECUTE", "MANAGE RISK"],
    logo: "horizontal",
  };
}

/** The sample that shipped inside option-selling.html. */
export function exampleData(): OptionSellingData {
  return {
    ...defaultData(),
    date: "2026-09-15",
    instrument: "SENSEX",
    legs: [
      emptyLeg({ action: "SELL", strike: "25000", type: "CE", qty: "65", price: "12.2" }),
      emptyLeg({ action: "BUY", strike: "25200", type: "CE", qty: "65", price: "2.0" }),
    ],
  };
}

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

/** "15 Sep 2026" / ISO / anything Date understands → yyyy-mm-dd (else today). */
function toIso(v: unknown) {
  const s = str(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return todayIso();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toLeg(l: Record<string, unknown>): Leg {
  const t = str(l.type).toUpperCase();
  return {
    action: str(l.action).toUpperCase() === "BUY" ? "BUY" : "SELL",
    strike: str(l.strike),
    type: t === "PE" ? "PE" : t === "" ? "" : "CE",
    qty: str(l.qty),
    price: str(l.price),
    exitPrice: str(l.exitPrice),
  };
}

/** Saved data, an HTML-template JSON, or the older single-option shape → full data. */
export function mergeData(raw: Record<string, unknown> | null): OptionSellingData {
  const base = defaultData();
  if (!raw) return base;
  let legs: Leg[] = base.legs;
  if (Array.isArray(raw.legs) && raw.legs.length) legs = (raw.legs as Record<string, unknown>[]).slice(0, MAX_LEGS).map(toLeg);
  else if ("strike" in raw)
    // older version of this template: one sold option at the top level
    legs = [toLeg({ action: "SELL", strike: raw.strike, type: raw.optionType, qty: raw.qty, price: raw.entryPrice, exitPrice: raw.closePrice })];
  const pnlRaw = (raw.pnl ?? {}) as Record<string, unknown>;
  const footer = Array.isArray(raw.footer) ? (raw.footer as unknown[]).map(str) : base.footer;
  const mode: TradeMode = raw.mode === "CLOSE" ? "CLOSE" : raw.mode === "ENTRY" ? "ENTRY" : legs.some((l) => l.exitPrice) ? "CLOSE" : "ENTRY";
  return {
    date: raw.date ? toIso(raw.date) : base.date,
    instrument: str(raw.instrument ?? raw.index) || base.instrument,
    mode,
    badgeEntry: str(raw.badgeEntry) || (mode === "ENTRY" && raw.badge ? str(raw.badge) : base.badgeEntry),
    badgeClose: str(raw.badgeClose) || (mode === "CLOSE" && raw.badge ? str(raw.badge) : base.badgeClose),
    legs,
    percentBase: str(raw.percentBase ?? pnlRaw.percentBase),
    showPercent: typeof raw.showPercent === "boolean" ? raw.showPercent : base.showPercent,
    title1: raw.title1 !== undefined ? str(raw.title1) : base.title1,
    title2: raw.title2 !== undefined ? str(raw.title2) : base.title2,
    tagline: raw.tagline !== undefined ? str(raw.tagline) : raw.headerTagline !== undefined ? str(raw.headerTagline) : base.tagline,
    footer: [footer[0] ?? "", footer[1] ?? "", footer[2] ?? ""],
    logo: raw.logo === "tricolor" ? "tricolor" : "horizontal",
  };
}

/** "1,425.50" / "₹1425" → 1425.5 (NaN when empty or not a number). */
export function num(v: string) {
  const t = String(v ?? "").replace(/[₹,\s]/g, "");
  return t === "" ? NaN : Number(t);
}

/** Prices as in the design: at least one decimal (12.2, 2.0), at most two. */
export function fmtPrice(v: string) {
  const n = num(v);
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : v.trim() || "—";
}
export function fmtInt(v: string) {
  const n = num(v);
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : v.trim() || "—";
}
export function fmtRupees(n: number) {
  return "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export type PnL = { ok: true; total: number; percent: number | null; credit: number; base: number } | { ok: false; why: string };

/**
 * Total P&L of all legs (CLOSE mode): SELL (entry − exit) × qty, BUY (exit − entry) × qty.
 * % = total ÷ base; base = margin used when given, else the net premium received.
 */
export function pnl(d: OptionSellingData): PnL {
  let total = 0;
  let credit = 0;
  for (const [i, l] of d.legs.entries()) {
    const e = num(l.price);
    const x = num(l.exitPrice);
    const q = num(l.qty);
    const sell = l.action === "SELL";
    if (!Number.isFinite(e) || !Number.isFinite(q)) return { ok: false, why: `Leg ${i + 1} needs a quantity and entry price.` };
    if (!Number.isFinite(x)) return { ok: false, why: `Add the close price for leg ${i + 1}.` };
    credit += (sell ? 1 : -1) * e * q;
    total += (sell ? e - x : x - e) * q;
  }
  const mb = num(d.percentBase);
  const base = Number.isFinite(mb) && mb > 0 ? mb : Math.abs(credit);
  return { ok: true, total, percent: base ? (total / base) * 100 : null, credit, base };
}

export function formatDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso || "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`;
}
