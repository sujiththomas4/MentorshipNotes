import { MAX_LEGS, emptyLeg, num, type Leg } from "@/social/instagram/option-selling/data";

/*
 * Weekly Option Selling V2 (1080 × 1350), from Indian_Traders_Weekly_Option_Selling_1080x1350_outlined.svg.
 * ENTRY shows each leg's price, the entry label and the net premium; EXIT adds the exit price
 * and the total P&L. Legs, prices and P&L maths are shared with the first Weekly Option Selling.
 */

export type TradeModeV2 = "ENTRY" | "EXIT";
export type FooterItem = { title: string; sub: string };

export type OptionSellingV2Data = {
  /** yyyy-mm-dd */
  date: string;
  instrument: string;
  strategy: string;
  mode: TradeModeV2;
  /** header pill in Entry mode; empty hides it */
  entryLabel: string;
  /** header pill in Exit mode; empty hides it */
  exitLabel: string;
  /** right-hand tag of the Entry panel; empty hides it */
  entryTag: string;
  legs: Leg[];
  /** margin used (₹) for the P&L %; empty = net premium */
  percentBase: string;
  showPercent: boolean;
  cardTitle: string;
  /** "|" separated */
  nav: string;
  /** "|" separated, under the title */
  subheadline: string;
  footer: [FooterItem, FooterItem, FooterItem];
};

export { MAX_LEGS };

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Trade values start empty: never invent a trade. */
export function defaultData(): OptionSellingV2Data {
  return {
    date: todayIso(),
    instrument: "NIFTY",
    strategy: "Weekly Option Selling",
    mode: "ENTRY",
    entryLabel: "TRADE ENTRY",
    exitLabel: "TRADE EXIT",
    entryTag: "POSITION OPEN",
    legs: [emptyLeg()],
    percentBase: "",
    showPercent: true,
    cardTitle: "TRADE DETAILS",
    nav: "LEARN | TRADE | GROW",
    subheadline: "SMALL MOVES | CONSISTENT GAINS",
    footer: [
      { title: "PLAN", sub: "Have a Strategy" },
      { title: "EXECUTE", sub: "With Discipline" },
      { title: "MANAGE RISK", sub: "Protect Your Capital" },
    ],
  };
}

/** The trade in the reference SVG (NIFTY 22500 / 22600 CE bear call spread). */
export function exampleData(): OptionSellingV2Data {
  return {
    ...defaultData(),
    date: "2025-04-18",
    instrument: "NIFTY",
    legs: [
      emptyLeg({ action: "SELL", strike: "22500", type: "CE", qty: "75", price: "18.5", exitPrice: "2.6" }),
      emptyLeg({ action: "BUY", strike: "22600", type: "CE", qty: "75", price: "4.2", exitPrice: "0.8" }),
    ],
  };
}

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

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

/** Saved data or a Weekly Option Selling (V1) JSON → full data. */
export function mergeData(raw: Record<string, unknown> | null): OptionSellingV2Data {
  const base = defaultData();
  if (!raw) return base;
  const legs = Array.isArray(raw.legs) && raw.legs.length ? (raw.legs as Record<string, unknown>[]).slice(0, MAX_LEGS).map(toLeg) : base.legs;
  const mode: TradeModeV2 = raw.mode === "EXIT" || raw.mode === "CLOSE" ? "EXIT" : "ENTRY";
  const f = Array.isArray(raw.footer) ? (raw.footer as unknown[]) : [];
  const footer = base.footer.map((b, i) => {
    const x = f[i];
    if (x && typeof x === "object") {
      const o = x as Record<string, unknown>;
      return { title: o.title !== undefined ? str(o.title) : b.title, sub: o.sub !== undefined ? str(o.sub) : b.sub };
    }
    return typeof x === "string" ? { ...b, title: x } : b;
  }) as OptionSellingV2Data["footer"];
  const text = (k: keyof OptionSellingV2Data) => (raw[k] !== undefined ? str(raw[k]) : (base[k] as string));
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(str(raw.date)) ? str(raw.date) : base.date,
    instrument: str(raw.instrument) || base.instrument,
    strategy: text("strategy"),
    mode,
    entryLabel: raw.entryLabel !== undefined ? str(raw.entryLabel) : str(raw.badgeEntry) || base.entryLabel,
    exitLabel: raw.exitLabel !== undefined ? str(raw.exitLabel) : str(raw.badgeClose) || base.exitLabel,
    entryTag: text("entryTag"),
    legs,
    percentBase: str(raw.percentBase),
    showPercent: typeof raw.showPercent === "boolean" ? raw.showPercent : base.showPercent,
    cardTitle: text("cardTitle"),
    nav: raw.nav !== undefined ? str(raw.nav) : raw.tagline !== undefined ? str(raw.tagline) : base.nav,
    subheadline: text("subheadline"),
    footer,
  };
}

export type NetPremium = { ok: true; net: number } | { ok: false; why: string };

/** Premium at entry: SELL legs add price × qty, BUY legs subtract it (> 0 = net credit). */
export function netPremium(d: Pick<OptionSellingV2Data, "legs">): NetPremium {
  let net = 0;
  for (const [i, l] of d.legs.entries()) {
    const e = num(l.price);
    const q = num(l.qty);
    if (!Number.isFinite(e) || !Number.isFinite(q)) return { ok: false, why: `Leg ${i + 1} needs a quantity and entry price.` };
    net += (l.action === "SELL" ? 1 : -1) * e * q;
  }
  return { ok: true, net };
}
