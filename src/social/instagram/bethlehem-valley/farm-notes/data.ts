import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import type { BvFeature, BvFormat, BvTheme } from "../shared";

/*
 * Bethlehem Valley "Farm Notes" post, from src/sample htmls/bethlehem-valley-post.html
 * (the first design: logo + name + slogan header, pepper-vine illustration as the default photo).
 * Field names are the template's JSON, so its "Save post" .json files open here unchanged.
 */

export type FarmNotesData = {
  format: BvFormat;
  /** hide the whole header / footer band (the content then uses the space) */
  showHeader: boolean;
  showFooter: boolean;
  /** colour theme (forest = the original dark green) */
  theme: BvTheme;
  /** badge logo variant 1–8 (Branding → Bethlehem Valley) */
  logo: number;
  brandName: string;
  tagline: string;
  slogan1: string;
  slogan2: string;
  sloganSmall: string;
  category: string;
  categoryIcon: string;
  meta: string;
  heading: string;
  mlHeading: string;
  body: string;
  mlBody: string;
  /** data URL; null = the drawn pepper-vine illustration */
  photo: string | null;
  photoZoom: number;
  photoX: number;
  photoY: number;
  features: BvFeature[];
  growEn: string;
  growMl: string;
  handle: string;
  follow: string;
};

/** The sample post that ships in the HTML template (its "Reset to sample post"). */
export function sampleData(): FarmNotesData {
  return {
    format: "story",
    showHeader: true,
    showFooter: true,
    theme: "forest",
    logo: 1,
    brandName: "Bethlehem Valley",
    tagline: "FARM & PLANTATION",
    slogan1: "Healthy Plants",
    slogan2: "Better Harvests",
    sloganSmall: "DAILY FARM NOTES",
    category: "PEPPER PROTECTION",
    categoryIcon: "shield",
    meta: "25 Sep 2026",
    heading: "Protect Pepper Vines from Quick Wilt",
    mlHeading: "ദ്രുതവാട്ടത്തിൽ നിന്ന്\nകുരുമുളകിനെ സംരക്ഷിക്കാം",
    body: "Before the monsoon, clear drainage around the vine base so water never stands. Apply Trichoderma-enriched organic manure at the base and spray 1% Bordeaux mixture on the leaves.",
    mlBody:
      "മഴക്കാലത്തിന് മുൻപ് ചുവട്ടിൽ വെള്ളം കെട്ടിനിൽക്കാതെ നീർവാർച്ച ഉറപ്പാക്കുക. ട്രൈക്കോഡെർമ ചേർത്ത ജൈവവളം ചുവട്ടിൽ നൽകി, ഒരു ശതമാനം ബോർഡോ മിശ്രിതം ഇലകളിൽ തളിക്കുക.",
    photo: null,
    photoZoom: 100,
    photoX: 50,
    photoY: 50,
    features: [
      { icon: "leaf", title: "Healthy Plants", ml: "ആരോഗ്യമുള്ള ചെടികൾ" },
      { icon: "shield", title: "Better Protection", ml: "കൂടുതൽ സംരക്ഷണം" },
      { icon: "seedling", title: "Quality Yield", ml: "നല്ല വിളവ്" },
      { icon: "sprout", title: "Sustainable Farming", ml: "സുസ്ഥിര കൃഷി" },
    ],
    growEn: "Grow Together",
    growMl: "ഒരുമിച്ച് വളരാം",
    handle: "@bethlehemvalley",
    follow: "Follow for daily updates",
  };
}

/** Saved data or a template .json → full data (unknown keys dropped, missing ones filled). */
export function mergeData(raw: Record<string, unknown> | null): FarmNotesData {
  const base = sampleData();
  if (!raw) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(base) as (keyof FarmNotesData)[]) {
    const v = raw[k];
    if (v === undefined) continue;
    const b = base[k];
    if (k === "photo") out.photo = typeof v === "string" && v ? v : null;
    else if (k === "features") out.features = Array.isArray(v) ? (v as BvFeature[]).slice(0, 4).map((f, i) => ({ ...base.features[i], ...f })) : b;
    else if (k === "format") out.format = v === "feed" ? "feed" : "story";
    else if (typeof b === "boolean") out[k] = v !== false && v !== "false";
    else if (typeof b === "number") out[k] = Number.isFinite(Number(v)) ? Number(v) : b;
    else out[k] = String(v);
  }
  out.logo = Math.min(BV_VARIANTS.length, Math.max(1, Math.round(Number(out.logo)) || 1));
  return out as FarmNotesData;
}
