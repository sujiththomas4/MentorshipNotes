import { BV_ART } from "../shared";

/*
 * Bethlehem Valley "Azolla for Poultry" carousel, from design-briefs/azolla-poultry-carousel.md:
 * six 1080 × 1350 slides on dark navy (hook, what is Azolla, why it helps, how fast it grows,
 * what you can save, comment "AZOLLA"). Every text, photo and number is editable; slides can be
 * switched off (page numbers follow). In headlines, *stars* mark the green accent words.
 */

export type PhotoFit = "cover" | "contain";
/** A photo slot. src null = the drawn Azolla illustration (or none where noted). */
export type AzPhoto = { src: string | null; fit: PhotoFit; zoom: number; x: number; y: number };
export type AzCard = { icon: string; title: string; text: string };
export type AzStat = { icon: string; value: string; label: string; text: string };
export type AzDay = { day: string; stage: string; photo: AzPhoto };

export type AzollaData = {
  /** always feed (1080 × 1350); kept for the shared preview / file-name helpers */
  format: "feed";
  /** file name topic */
  category: string;
  brandLine: string;
  series: string;
  handle: string;
  /** which of the 6 slides are in the carousel */
  enabled: boolean[];
  s1: { eyebrow: string; title1: string; stat: string; title3: string; sub: string; ml: string; pill: string; badge: string; footer: string; photo: AzPhoto };
  s2: { title1: string; title2: string; callout: string; facts: AzCard[]; statement1: string; statement2: string; footer: string; photo: AzPhoto };
  s3: { title1: string; title2: string; photoLabel: string; stats: AzStat[]; rule: string; footer: string; photo: AzPhoto };
  s4: { title1: string; title2: string; sub: string; days: AzDay[]; note: string; needs: string; warning: string; footer: string };
  s5: {
    title1: string;
    title2: string;
    sub: string;
    birds: number;
    /** what the birds are called in the rows, e.g. "hens" */
    birdWord: string;
    /** grams of feed per bird per day */
    feedPerBird: number;
    /** ₹ per kg */
    feedPrice: number;
    /** % of feed replaced, low and high */
    replaceMin: number;
    replaceMax: number;
    footnote: string;
    footer: string;
  };
  s6: { title1: string; title2: string; comment: string; cta: string; includes: string; footer: string; photo: AzPhoto };
};

export const SLIDE_NAMES = ["Hook", "What is Azolla", "Why it helps", "How fast it grows", "What you save", "Comment AZOLLA"];

const HEN = `${BV_ART}/agri/hen.webp`;
const photo = (src: string | null, y = 50, zoom = 100, x = 50): AzPhoto => ({ src, fit: "cover", zoom, x, y });

/** The copy from the design brief. */
export function sampleData(): AzollaData {
  return {
    format: "feed",
    category: "azolla poultry",
    brandLine: "BETHLEHEM VALLEY",
    series: "POULTRY TIPS",
    handle: "@bethlehemvalley",
    enabled: [true, true, true, true, true, true],
    s1: {
      eyebrow: "POULTRY FARMERS, READ THIS",
      title1: "FEED TAKES",
      stat: "60–70%",
      title3: "OF YOUR COST.",
      sub: "What if a plant that grows on water could cut that bill?",
      ml: "",
      pill: "MEET AZOLLA",
      badge: "THE FEED BILL",
      footer: "SWIPE: WHAT IS AZOLLA",
      photo: photo(HEN, 40, 112, 62),
    },
    s2: {
      title1: "WHAT EXACTLY",
      title2: "IS *AZOLLA?*",
      callout: "A tiny fern that floats and grows on water.",
      facts: [
        { icon: "float", title: "FLOATS ON WATER", text: "No field needed. A small pit is enough." },
        { icon: "nitrogen", title: "MAKES ITS OWN NITROGEN", text: "Lives with a blue-green alga (Anabaena) that fixes nitrogen from the air." },
        { icon: "pit", title: "GROWS FAST, ALL YEAR", text: "With water, partial shade and a little cow dung." },
      ],
      statement1: "NOT A WEED FOR POULTRY.",
      statement2: "A HOME-GROWN FEED SUPPLEMENT.",
      footer: "SWIPE: WHY IT HELPS YOUR BIRDS",
      photo: photo(null),
    },
    s3: {
      title1: "WHY IT HELPS",
      title2: "YOUR *BIRDS*",
      photoLabel: "Fresh Azolla, washed, mixed with the usual feed",
      stats: [
        { icon: "", value: "20–30%", label: "PROTEIN IN DRY AZOLLA", text: "Rich in essential amino acids." },
        { icon: "mineral", value: "MINERALS", label: "CALCIUM · PHOSPHORUS · IRON", text: "Good for bones and eggshells." },
        { icon: "yolk", value: "CAROTENE", label: "NATURAL PIGMENTS", text: "Richer yolk colour in layers." },
        { icon: "", value: "5–10%", label: "OF DAILY FEED", text: "Commonly recommended share to replace." },
      ],
      rule: "Wash well  •  Start with small amounts  •  Increase slowly",
      footer: "SWIPE: HOW FAST IT GROWS",
      photo: photo(HEN, 30),
    },
    s4: {
      title1: "HOW FAST CAN",
      title2: "*AZOLLA* GROW?",
      sub: "CAN DOUBLE IN 3–10 DAYS IN GOOD CONDITIONS",
      days: [
        { day: "DAY 1", stage: "STARTER", photo: photo(null) },
        { day: "AROUND DAY 7", stage: "SPREADING", photo: photo(null) },
        { day: "DAY 10–15", stage: "FULL MAT", photo: photo(null) },
      ],
      note: "Start harvesting daily once the mat covers the water.",
      needs: "WATER 10 CM • PARTIAL SHADE • 20–30 °C • COW DUNG • DAILY HARVEST",
      warning: "YIELD VARIES. MEASURE YOUR OWN PIT.",
      footer: "NEXT: WHAT CAN YOU SAVE?",
    },
    s5: {
      title1: "WHAT CAN",
      title2: "YOU *SAVE?*",
      sub: "EXAMPLE: {birds} LAYING HENS FOR ONE MONTH",
      birds: 100,
      birdWord: "hens",
      feedPerBird: 115,
      feedPrice: 40,
      replaceMin: 5,
      replaceMax: 10,
      footnote:
        "*Example with sample prices. Use your own bird count and feed price. Fresh Azolla is about 90% water, so the real saving depends on how much feed it actually replaces.",
      footer: "LAST: HOW TO GET STARTED",
    },
    s6: {
      title1: "WANT TO START",
      title2: "YOUR OWN *AZOLLA?*",
      comment: "AZOLLA",
      cta: "Comment *AZOLLA* and we'll send you the product details.",
      includes: "Starter culture  •  Pit sheet  •  Setup guide  •  Price",
      footer: "SAVE THIS POST",
      photo: photo(null),
    },
  };
}

/** Monthly numbers for slide 5. */
export function savings(s: AzollaData["s5"]) {
  const feedKg = (s.birds * s.feedPerBird * 30) / 1000;
  const bill = feedKg * s.feedPrice;
  const lo = (bill * s.replaceMin) / 100;
  const hi = (bill * s.replaceMax) / 100;
  return { feedKg, bill, lo, hi, year: hi * 12 };
}

export const rupees = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

/* ---------- merge ---------- */

const str = (v: unknown, b: string) => (typeof v === "string" ? v : v === undefined || v === null ? b : String(v));
const num = (v: unknown, b: number, min: number, max: number) => {
  const n = Number(v);
  return v === undefined || v === null || v === "" || !Number.isFinite(n) ? b : Math.min(max, Math.max(min, n));
};
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

function mergePhoto(raw: unknown, base: AzPhoto): AzPhoto {
  const r = obj(raw);
  return {
    src: r.src === undefined ? base.src : typeof r.src === "string" && r.src ? r.src : null,
    fit: r.fit === "contain" ? "contain" : "cover",
    zoom: num(r.zoom, base.zoom, 20, 250),
    x: num(r.x, base.x, 0, 100),
    y: num(r.y, base.y, 0, 100),
  };
}

/** Text fields of a slide from raw, the rest from base; photos / lists merged item by item. */
function mergeSlide<T extends Record<string, unknown>>(raw: unknown, base: T): T {
  const r = obj(raw);
  const out: Record<string, unknown> = {};
  for (const [k, b] of Object.entries(base)) {
    const v = r[k];
    if (k === "photo") out[k] = mergePhoto(v, b as AzPhoto);
    else if (Array.isArray(b)) {
      const list = Array.isArray(v) ? v : [];
      out[k] = b.map((item, i) => {
        const ri = obj(list[i]);
        const m: Record<string, unknown> = {};
        for (const [ik, ib] of Object.entries(item as Record<string, unknown>)) m[ik] = ik === "photo" ? mergePhoto(ri[ik], ib as AzPhoto) : str(ri[ik], ib as string);
        return m;
      });
    } else if (typeof b === "number") out[k] = num(v, b, 0, 1_000_000);
    else out[k] = str(v, b as string);
  }
  return out as T;
}

/** Saved data or a .json file → full data (unknown keys dropped, missing ones filled). */
export function mergeData(raw: Record<string, unknown> | null): AzollaData {
  const base = sampleData();
  if (!raw) return base;
  const enabled = base.enabled.map((b, i) => (Array.isArray(raw.enabled) && typeof raw.enabled[i] === "boolean" ? (raw.enabled[i] as boolean) : b));
  if (!enabled.some(Boolean)) enabled[0] = true;
  const s5 = mergeSlide(raw.s5, base.s5);
  s5.replaceMin = Math.min(100, s5.replaceMin);
  s5.replaceMax = Math.min(100, Math.max(s5.replaceMin, s5.replaceMax));
  return {
    format: "feed",
    category: str(raw.category, base.category),
    brandLine: str(raw.brandLine, base.brandLine),
    series: str(raw.series, base.series),
    handle: str(raw.handle, base.handle),
    enabled,
    s1: mergeSlide(raw.s1, base.s1),
    s2: mergeSlide(raw.s2, base.s2),
    s3: mergeSlide(raw.s3, base.s3),
    s4: mergeSlide(raw.s4, base.s4),
    s5,
    s6: mergeSlide(raw.s6, base.s6),
  };
}
