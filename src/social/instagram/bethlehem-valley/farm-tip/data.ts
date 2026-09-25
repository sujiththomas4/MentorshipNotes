import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import type { BvFeature, BvFormat, BvTheme } from "../shared";

/*
 * Bethlehem Valley "Farm Tip" post, from src/sample htmls/bethlehem-valley-post-v2.html
 * (the second design: three header styles, round emblem, script slogan, leaf decoration and a
 * landscape band with a brush-stroke closing line). Field names are the template's JSON, so its
 * "Save post" .json files open here unchanged.
 */

export type HeaderStyle = "centered" | "classic" | "compact";

export type FarmTipData = {
  format: BvFormat;
  /** hide the whole header / footer band (the content then uses the space) */
  showHeader: boolean;
  showFooter: boolean;
  /** colour theme (forest = the original dark green) */
  theme: BvTheme;
  headerStyle: HeaderStyle;
  /** "emblem" (round emblem) or badge logo variant 1–8 */
  headerLogo: "emblem" | number;
  /** centered header, top-left photo: "default" (pepper photo), "none" or a data URL */
  headerPhoto: string;
  /** centered header, top-right photo (e.g. cow & hen): a data URL, "" = none chosen yet */
  headerPhotoRight: string;
  showHeaderPhotoRight: boolean;
  showSlogan: boolean;
  brandName: string;
  tagline: string;
  /** Enter = line break (centered); joined to one line (classic) or two (compact) */
  slogan: string;
  /** classic header only */
  sloganSmall: string;
  category: string;
  categoryIcon: string;
  meta: string;
  heading: string;
  mlHeading: string;
  body: string;
  mlBody: string;
  /** data URL; null = "ADD YOUR IMAGE HERE" placeholder */
  photo: string | null;
  photoZoom: number;
  photoX: number;
  photoY: number;
  decorLeaves: boolean;
  features: BvFeature[];
  /** story only: landscape band with the closing line */
  showLandscape: boolean;
  /** "default" or a data URL */
  landscape: string;
  growEn: string;
  growMl: string;
  handle: string;
  follow: string;
};

/** Brand look shared by the header and footer (also by every page of a multi-page post). */
export type BvLook = Pick<
  FarmTipData,
  "format" | "showHeader" | "showFooter" | "theme" | "headerStyle" | "headerLogo" | "headerPhoto" | "headerPhotoRight" | "showHeaderPhotoRight" | "showSlogan" | "brandName" | "tagline" | "slogan" | "sloganSmall" | "handle" | "follow"
>;

/** The template's blank post (its "Blank template"). */
export function blankData(): FarmTipData {
  return {
    format: "story",
    showHeader: true,
    showFooter: true,
    theme: "forest",
    headerStyle: "centered",
    headerLogo: "emblem",
    headerPhoto: "default",
    headerPhotoRight: "",
    showHeaderPhotoRight: false,
    showSlogan: true,
    brandName: "Bethlehem Valley",
    tagline: "FARM & PLANTATION",
    slogan: "Healthy\nPlants\nBetter\nHarvests",
    sloganSmall: "DAILY FARM NOTES",
    category: "TODAY'S TIP",
    categoryIcon: "lightbulb",
    meta: "",
    heading: "Your Main Heading Goes Here",
    mlHeading: "ഇവിടെ നിങ്ങളുടെ മലയാളം\nതലക്കെട്ട് നൽകാം",
    body: "Write your key information here.\nIt can be about pepper protection, base valam, fertilizer details, best time, best variety, or any other farm/plantation related information.",
    mlBody:
      "ഇവിടെ നിങ്ങളുടെ പ്രധാന വിവരങ്ങൾ നൽകാം. ഇത് കുരുമുളക് സംരക്ഷണം, അടിവളം, വള വിവരങ്ങൾ, ഏറ്റവും നല്ല സമയം, മികച്ച ഇനം അല്ലെങ്കിൽ മറ്റ് ഫാം/പ്ലാന്റേഷൻ വിവരങ്ങൾ ആകാം.",
    photo: null,
    photoZoom: 100,
    photoX: 50,
    photoY: 50,
    decorLeaves: true,
    features: [
      { icon: "leaf", title: "Healthy Plants", ml: "ആരോഗ്യമുള്ള ചെടികൾ" },
      { icon: "shield", title: "Better Protection", ml: "കൂടുതൽ സംരക്ഷണം" },
      { icon: "seedling", title: "Quality Yield", ml: "നല്ല വിളവ്" },
      { icon: "sprout", title: "Sustainable Farming", ml: "സുസ്ഥിര കൃഷി" },
    ],
    showLandscape: true,
    landscape: "default",
    growEn: "Grow Together",
    growMl: "ഒരുമിച്ച് വളരാം",
    handle: "",
    follow: "Follow for daily updates",
  };
}

/** The template's "Sample post" text (header / footer settings are kept). */
export const SAMPLE_POST: Partial<FarmTipData> = {
  category: "PEPPER PROTECTION",
  categoryIcon: "shield",
  heading: "Protect Pepper Vines from Quick Wilt",
  mlHeading: "ദ്രുതവാട്ടത്തിൽ നിന്ന്\nകുരുമുളകിനെ സംരക്ഷിക്കാം",
  body: "Before the monsoon, clear drainage around the vine base so water never stands. Apply Trichoderma-enriched organic manure at the base and spray 1% Bordeaux mixture on the leaves.",
  mlBody:
    "മഴക്കാലത്തിന് മുൻപ് ചുവട്ടിൽ വെള്ളം കെട്ടിനിൽക്കാതെ നീർവാർച്ച ഉറപ്പാക്കുക. ട്രൈക്കോഡെർമ ചേർത്ത ജൈവവളം ചുവട്ടിൽ നൽകി, ഒരു ശതമാനം ബോർഡോ മിശ്രിതം ഇലകളിൽ തളിക്കുക.",
};

export const sampleData = (): FarmTipData => ({ ...blankData(), ...SAMPLE_POST });

/** Header, logo and footer settings that "Blank template" / "Sample post" keep. */
export const LOOK_KEYS: (keyof FarmTipData)[] = [
  "format",
  "showHeader",
  "showFooter",
  "theme",
  "headerPhotoRight",
  "showHeaderPhotoRight",
  "headerStyle",
  "headerLogo",
  "headerPhoto",
  "showSlogan",
  "brandName",
  "tagline",
  "slogan",
  "sloganSmall",
  "showLandscape",
  "landscape",
  "decorLeaves",
  "handle",
  "follow",
];

export function keepLook(d: FarmTipData): Partial<FarmTipData> {
  return Object.fromEntries(LOOK_KEYS.map((k) => [k, d[k]]));
}

/** Saved data or a template .json → full data (unknown keys dropped, missing ones filled). */
export function mergeData(raw: Record<string, unknown> | null): FarmTipData {
  const base = blankData();
  if (!raw) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(base) as (keyof FarmTipData)[]) {
    const v = raw[k];
    if (v === undefined) continue;
    const b = base[k];
    if (k === "photo") out.photo = typeof v === "string" && v ? v : null;
    else if (k === "features") out.features = Array.isArray(v) ? (v as BvFeature[]).slice(0, 4).map((f, i) => ({ ...base.features[i], ...f })) : b;
    else if (k === "format") out.format = v === "feed" ? "feed" : "story";
    else if (k === "headerStyle") out.headerStyle = v === "classic" || v === "compact" ? v : "centered";
    else if (k === "headerLogo") out.headerLogo = v === "emblem" ? "emblem" : Math.min(BV_VARIANTS.length, Math.max(1, Math.round(Number(v)) || 1));
    else if (typeof b === "boolean") out[k] = !!v;
    else if (typeof b === "number") out[k] = Number.isFinite(Number(v)) ? Number(v) : b;
    else out[k] = String(v);
  }
  return out as FarmTipData;
}
