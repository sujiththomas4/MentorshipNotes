/*
 * Trading desk logic, ported from the HTML notebook.
 *
 * PROVISIONAL: ACCEPT, openLocation() and targetsFor() are placeholder rules built on plain
 * acceptance / rejection, not the mentorship's rules. When the real rules arrive, these three
 * and the "Rules — pending mentorship" card in the playbook are what changes.
 */

export type Close = "above" | "inside" | "below";
export type Tone = "bull" | "bear" | "neu" | "gold";
export type LiveTag = "read" | "level" | "entry" | "exit" | "mistake";

export type DayFields = {
  pdh: string;
  vah: string;
  poc: string;
  val: string;
  pdl: string;
  open: string;
  m40: Close | "";
  m30: Close | "";
  day_type: string;
  notes: string;
  lesson: string;
};

export type TradingDay = {
  user_id: string;
  day: string;
  pdh: string | null;
  vah: string | null;
  poc: string | null;
  val: string | null;
  pdl: string | null;
  open: string | null;
  m40: Close | null;
  m30: Close | null;
  day_type: string | null;
  notes: string | null;
  lesson: string | null;
  updated_at: string;
};

export type LiveEntry = {
  id: string;
  day: string;
  ts: string;
  tag: LiveTag;
  text: string;
  created_at: string;
};

export const LEVEL_KEYS = ["pdh", "vah", "poc", "val", "pdl", "open"] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];

export const EMPTY_DAY: DayFields = {
  pdh: "", vah: "", poc: "", val: "", pdl: "", open: "",
  m40: "", m30: "", day_type: "", notes: "", lesson: "",
};

export const EXAMPLE_DAY: DayFields = {
  ...EMPTY_DAY,
  pdh: "24980", vah: "24935", poc: "24860", val: "24790", pdl: "24745", open: "24955",
  m40: "above", m30: "above",
};

export function fromRow(row: TradingDay | null | undefined): DayFields {
  if (!row) return { ...EMPTY_DAY };
  return {
    pdh: row.pdh ?? "", vah: row.vah ?? "", poc: row.poc ?? "", val: row.val ?? "",
    pdl: row.pdl ?? "", open: row.open ?? "",
    m40: row.m40 ?? "", m30: row.m30 ?? "",
    day_type: row.day_type ?? "", notes: row.notes ?? "", lesson: row.lesson ?? "",
  };
}

export function toRow(d: DayFields) {
  const blank = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    pdh: blank(d.pdh), vah: blank(d.vah), poc: blank(d.poc), val: blank(d.val),
    pdl: blank(d.pdl), open: blank(d.open),
    m40: d.m40 || null, m30: d.m30 || null,
    day_type: d.day_type || null,
    notes: d.notes.trim() ? d.notes : null,
    lesson: d.lesson.trim() ? d.lesson : null,
  };
}

export function hasLevels(d: Pick<DayFields, LevelKey | "m40" | "m30">) {
  return LEVEL_KEYS.some((k) => num(d[k]) !== null) || !!d.m40 || !!d.m30;
}

/** Levels are typed strings; parse at read time (commas and spaces stripped). */
export function num(v: string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[,\s]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function fmt(n: number | null) {
  return n === null ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function closeLabel(c: Close | "" | null) {
  return c === "above" ? "Above VAH" : c === "below" ? "Below VAL" : c === "inside" ? "Inside value" : "—";
}

export type Read = { tone: Tone; label: string; detail: string };

export function openLocation(d: Pick<DayFields, LevelKey>): Read | null {
  const vah = num(d.vah), val = num(d.val), open = num(d.open), pdh = num(d.pdh), pdl = num(d.pdl);
  if (open === null || vah === null || val === null) return null;
  if (pdh !== null && open > pdh)
    return { tone: "bull", label: "Above previous range", detail: "Open is outside yesterday's high. Strongest location — if it holds, look for a trend or double-distribution day." };
  if (open > vah)
    return { tone: "bull", label: "Above value, inside range", detail: "Open is over VAH but still inside yesterday's range. Needs acceptance above VAH to be worth anything." };
  if (pdl !== null && open < pdl)
    return { tone: "bear", label: "Below previous range", detail: "Open is under yesterday's low. Strongest short location — if it holds, look for one-sided selling." };
  if (open < val)
    return { tone: "bear", label: "Below value, inside range", detail: "Open is under VAL but still inside yesterday's range. Needs acceptance below VAL to be worth anything." };
  return { tone: "neu", label: "Inside value", detail: "Open is inside yesterday's value area. Balance until proven otherwise — expect rotation between VAL and VAH." };
}

export type Acceptance = Read & { bias: string };

export const ACCEPT: Record<string, Acceptance> = {
  "above|above": { tone: "bull", label: "Accepted above value", bias: "Long bias", detail: "Two closes held outside the value area. Value is migrating higher — buy retests of VAH, not the highs." },
  "above|inside": { tone: "neu", label: "Failed acceptance above", bias: "Rotation lower", detail: "Price went out and came back in. Failed breakouts rotate — POC is the first target, VAL behind it." },
  "above|below": { tone: "bear", label: "Reversal through value", bias: "Short bias", detail: "From above VAH to below VAL in one hour. Aggressive rejection — treat the earlier high as the day's extreme." },
  "inside|above": { tone: "bull", label: "Breaking out of value", bias: "Emerging long", detail: "Started balanced, now closing above VAH. Early — wait for the next close to hold outside before committing." },
  "inside|inside": { tone: "neu", label: "Balanced inside value", bias: "Rotational", detail: "No acceptance either side. Fade the value edges back toward POC and keep size small." },
  "inside|below": { tone: "bear", label: "Breaking down out of value", bias: "Emerging short", detail: "Started balanced, now closing below VAL. Early — wait for the next close to hold outside before committing." },
  "below|above": { tone: "bull", label: "Reversal through value", bias: "Long bias", detail: "From below VAL to above VAH in one hour. Aggressive rejection — treat the earlier low as the day's extreme." },
  "below|inside": { tone: "neu", label: "Failed breakdown", bias: "Rotation higher", detail: "Price broke down and came back in. Failed breakdowns rotate — POC first, VAH behind it." },
  "below|below": { tone: "bear", label: "Accepted below value", bias: "Short bias", detail: "Two closes held outside the value area. Value is migrating lower — sell retests of VAL, not the lows." },
};

export function acceptance(d: Pick<DayFields, "m40" | "m30">): Acceptance | null {
  return ACCEPT[`${d.m40}|${d.m30}`] ?? null;
}

export function targetsFor(d: Pick<DayFields, LevelKey>, tone: Tone): [string, string][] {
  const poc = num(d.poc), vah = num(d.vah), val = num(d.val);
  const out: [string, string][] = [];
  if (poc !== null) out.push(["First target · POC", fmt(poc)]);
  if (tone === "bull" && vah !== null) out.push(["Reference · VAH", fmt(vah)]);
  if (tone === "bull" && val !== null) out.push(["Extended · VAL", fmt(val)]);
  if (tone === "bear" && val !== null) out.push(["Reference · VAL", fmt(val)]);
  if (tone === "bear" && vah !== null) out.push(["Extended · VAH", fmt(vah)]);
  if (tone === "neu" && vah !== null && val !== null) {
    out.push(["Upper edge · VAH", fmt(vah)]);
    out.push(["Lower edge · VAL", fmt(val)]);
  }
  return out;
}

export const DAY_TYPES = [
  "Normal Day",
  "Normal Variation Day",
  "Trend Day",
  "Double Distribution Trend Day",
  "Neutral Day — Center",
  "Neutral Day — Extreme",
  "Non-trend Day",
];

export const LIVE_TAGS: LiveTag[] = ["read", "level", "entry", "exit", "mistake"];

/** Shown in the day log until the first real day exists. Always labelled as samples. */
export const EXAMPLE_LOG = [
  {
    id: "example-1",
    title: "Sample entry",
    sub: "How a day reads once you fill it in",
    dayType: "Normal Variation Day",
    stats: [["POC", "24,860"], ["VAH", "24,935"], ["VAL", "24,790"], ["Open", "24,955"], ["40m close", "Above VAH"], ["30m close", "Above VAH"]],
    notes: "Opened above value and outside the previous day's range. First 40 minutes held entirely above VAH — no rotation back in, so value is migrating higher. Took the retest of VAH as support on the 30-minute close, stop under the low of that candle.",
    lesson: "Two consecutive closes accepting outside value is the signal. One close is not acceptance.",
  },
  {
    id: "example-2",
    title: "Sample entry",
    sub: "Disappears once you log a real day",
    dayType: "Neutral Day — Center",
    stats: [["POC", "24,712"], ["VAH", "24,790"], ["VAL", "24,640"], ["Open", "24,725"], ["40m close", "Inside value"], ["30m close", "Inside value"]],
    notes: "Opened inside value, both closes stayed inside. Range extension on both sides later in the session and a close back in the middle — buyers and sellers both rejected. Nothing to do but fade the value edges back to POC with small size.",
    lesson: "Open inside value with both closes inside means rotation. Do not look for a breakout trade.",
  },
];

export const PLAYBOOK = {
  dayTypes: [
    ["Normal Day", "Wide initial balance, little extension. The first hour sets the day's range — fade the extremes back toward POC."],
    ["Normal Variation", "IB extended roughly double on one side, then balance. Most common day. Trade with the extension, target the opposite value edge."],
    ["Trend Day", "Narrow IB, one-sided range extension all session, value migrating in one direction. Do not fade. Close near the extreme."],
    ["Double Distribution", "Quiet open, breakout, second distribution builds away from the first. Single prints between the two act as support/resistance."],
    ["Neutral Day", "Range extension on both sides — buyers and sellers both rejected. Closes mid-range (Center) or at one extreme (Extreme, the stronger signal)."],
    ["Non-trend Day", "Tiny range, no conviction. Usually ahead of an event. Stand aside or scalp the edges tightly."],
  ],
  openingTypes: [
    ["Open-Drive", "Straight off the open in one direction with no auction back. Strongest conviction — the open is the day's extreme."],
    ["Open-Test-Drive", "Probes one way, rejects, then drives the other. The failed probe is your stop reference."],
    ["Open-Rejection-Reverse", "Moves out, gets rejected, auctions back through the open. Medium conviction."],
    ["Open-Auction", "Rotates around the open inside prior value. Lowest conviction — wait for acceptance outside value."],
  ],
  terms: [
    ["POC", "Price with the most TPOs / volume — the fairest price of that session, and the first magnet when price rotates."],
    ["VAH / VAL", "Edges of the 70% value area. Acceptance outside them is the trade; rejection at them is the fade."],
    ["IB", "Initial balance — the first hour's range. Extension beyond it shows who took control."],
    ["Single prints", "One-TPO prices left by a fast move. Unfinished business; price often returns to fill them."],
    ["Excess", "A tail at an extreme — a clean, rejected auction. A proper end to a move."],
    ["Poor high / low", "A flat extreme with no tail. Unfinished — expect it to be revisited and taken out."],
    ["Delta", "Market buys minus market sells at a price. Cumulative delta tracks it across the session."],
    ["Absorption", "Heavy aggressive orders hitting a level without price moving — a passive size is soaking them up."],
    ["Imbalance", "Lopsided trade between bid and ask diagonally in the footprint. Stacked imbalances mark real initiative."],
    ["Exhaustion", "Aggression rising while price stalls, then reverses. The move has run out of fuel."],
  ],
} as const;
