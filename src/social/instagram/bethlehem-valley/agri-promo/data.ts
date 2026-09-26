import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { defaultBrandTitle, mergeBrandTitle, type BrandTitle } from "../brand-title";
import { BV_ART, type BvFormat } from "../shared";

/*
 * Bethlehem Valley "Agri Promotion" poster, from agriculture_svg_master_template.md:
 * hero photo on the left with an organic curved edge, a cream information panel on the right
 * (logo, three-line headline, description, yellow CTA, green feature banner, 4 benefits),
 * a circular secondary photo, and a dark-green footer band with 5 icons.
 * Not tied to poultry: photos, copy, benefits and icons are all replaceable.
 */

export type AgriBenefit = { icon: string; title: string; text: string };
export type AgriFooterItem = { icon: string; label: string };
/** cover = fill the area (crops), contain = the whole photo visible */
export type PhotoFit = "cover" | "contain";
/** where the farm name sits relative to the logo */
export type NamePos = "right" | "left" | "bottom" | "top";

export type AgriPromoData = {
  format: BvFormat;
  /** used for the file name only */
  category: string;
  showLogo: boolean;
  showCta: boolean;
  showBanner: boolean;
  showSecondary: boolean;
  showFooter: boolean;
  /** -1 = no logo (name only), 0 = the drawn two-leaf mark, 1–8 = Branding logo variants */
  logo: number;
  /** logo height, px */
  logoSize: number;
  /** dark rounded plate behind a Branding logo (they are drawn for dark backgrounds) */
  logoPlate: boolean;
  /** the farm name (style, lines, tagline, colour, size) */
  brandTitle: BrandTitle;
  namePos: NamePos;
  /** extra nudge of the name, px (from the position picked in namePos) */
  nameX: number;
  nameY: number;
  /** line 2 is the green accent line */
  headline1: string;
  headline2: string;
  headline3: string;
  description: string;
  cta: string;
  bannerEyebrow: string;
  bannerTitle: string;
  bannerSubtitle: string;
  /** left hero photo; null = plain green */
  hero: string | null;
  heroFit: PhotoFit;
  heroZoom: number;
  heroX: number;
  heroY: number;
  /** circular photo, bottom left */
  secondary: string | null;
  secondaryFit: PhotoFit;
  secondaryZoom: number;
  secondaryX: number;
  secondaryY: number;
  benefits: AgriBenefit[];
  footer: AgriFooterItem[];
};

export const ZOOM_MIN = 20;
export const ZOOM_MAX = 250;
export const LOGO_SIZE = { min: 40, max: 200, default: 70 };
/** nudge range of the name, px */
export const NAME_SHIFT = { x: 300, y: 200 };
export const MIN_BENEFITS = 2;
export const MAX_BENEFITS = 4;
export const FOOTER_ITEMS = 5;

export const AGRI_ART = `${BV_ART}/agri`;
export const DEFAULT_HERO = `${AGRI_ART}/hen.webp`;
export const DEFAULT_SECONDARY = `${AGRI_ART}/pepper-circle.webp`;

/** The spec's placeholder copy (section 22). */
export function sampleData(): AgriPromoData {
  return {
    format: "feed",
    category: "agri promo",
    showLogo: true,
    showCta: true,
    showBanner: true,
    showSecondary: true,
    showFooter: true,
    logo: 0,
    logoSize: LOGO_SIZE.default,
    logoPlate: true,
    brandTitle: { ...defaultBrandTitle("modern"), tagline: "GROW TOGETHER" },
    namePos: "right",
    nameX: 0,
    nameY: 0,
    headline1: "Healthy Farms",
    headline2: "Better Yields",
    headline3: "Greater Profits",
    description: "Quality farming solutions for\nsustainable growth and\na healthier tomorrow.",
    cta: "Get Started",
    bannerEyebrow: "YOUR SUCCESS IN",
    bannerTitle: "AGRICULTURE",
    bannerSubtitle: "IS OUR PRIORITY",
    hero: DEFAULT_HERO,
    heroFit: "cover",
    heroZoom: 100,
    heroX: 90,
    heroY: 20,
    secondary: DEFAULT_SECONDARY,
    secondaryFit: "cover",
    secondaryZoom: 100,
    secondaryX: 50,
    secondaryY: 50,
    benefits: [
      { icon: "growth", title: "High Productivity", text: "Better results, higher returns." },
      { icon: "shield", title: "Quality & Healthy Stock", text: "Strong, disease-resistant breeds and plants." },
      { icon: "expert", title: "Expert Support", text: "Guidance at every step." },
      { icon: "leaf", title: "Sustainable Farming", text: "For a greener future." },
    ],
    footer: [
      { icon: "sprout", label: "Healthy\nCrops" },
      { icon: "hen", label: "Quality\nLivestock" },
      { icon: "seedling", label: "Fresh\nProduce" },
      { icon: "hands", label: "Sustainable\nPractices" },
      { icon: "trend", label: "Long-Term\nGrowth" },
    ],
  };
}

/** Benefit sets for other businesses (spec section 23); picking one replaces the titles and icons. */
export const BENEFIT_PRESETS: { id: string; label: string; items: [string, string][] }[] = [
  { id: "poultry", label: "Poultry", items: [["growth", "High Egg Production"], ["hen", "Healthy Birds"], ["expert", "Expert Poultry Support"], ["trend", "Better Farm Returns"]] },
  { id: "goat", label: "Goat farming", items: [["star", "Quality Breeds"], ["shield", "Healthy Livestock"], ["basket", "Feeding Guidance"], ["trend", "Farm Growth"]] },
  { id: "pepper", label: "Pepper plantation", items: [["seedling", "Quality Planting Material"], ["growth", "High Yield"], ["expert", "Crop Guidance"], ["leaf", "Sustainable Cultivation"]] },
  { id: "dairy", label: "Dairy farming", items: [["cow", "Healthy Cattle"], ["growth", "Better Milk Yield"], ["expert", "Veterinary Support"], ["leaf", "Sustainable Dairy"]] },
  { id: "vegetable", label: "Vegetable farming", items: [["seedling", "Quality Seeds"], ["growth", "Better Yield"], ["expert", "Crop Support"], ["basket", "Farm Fresh Produce"]] },
  { id: "nursery", label: "Nursery", items: [["sprout", "Healthy Plants"], ["star", "Wide Variety"], ["expert", "Expert Guidance"], ["leaf", "Sustainable Growth"]] },
];

const str = (v: unknown, b: string) => (v === undefined || v === null ? b : String(v));

/** Saved data or a .json file → full data (unknown keys dropped, missing ones filled). */
export function mergeData(raw: Record<string, unknown> | null): AgriPromoData {
  const base = sampleData();
  if (!raw) return base;
  const num = (k: "logo" | "logoSize" | "nameX" | "nameY" | "heroZoom" | "heroX" | "heroY" | "secondaryZoom" | "secondaryX" | "secondaryY", min: number, max: number) => {
    const n = Number(raw[k]);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : base[k];
  };
  const fit = (k: "heroFit" | "secondaryFit"): PhotoFit => (raw[k] === "contain" ? "contain" : "cover");
  // drafts from before the brand options kept the name as brandName / tagline
  const oldName = typeof raw.brandName === "string" ? { ...base.brandTitle, name1: raw.brandName, name2: "", ...(typeof raw.tagline === "string" ? { tagline: raw.tagline } : {}) } : base.brandTitle;
  const flag = (k: "showLogo" | "showCta" | "showBanner" | "showSecondary" | "showFooter" | "logoPlate") => (typeof raw[k] === "boolean" ? (raw[k] as boolean) : base[k]);
  const img = (k: "hero" | "secondary") => (raw[k] === undefined ? base[k] : typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : null);
  const s = (k: keyof AgriPromoData) => str(raw[k], base[k] as string);
  const benefits = Array.isArray(raw.benefits)
    ? (raw.benefits as Partial<AgriBenefit>[]).slice(0, MAX_BENEFITS).map((b, i) => {
        const d = base.benefits[i] ?? base.benefits[0];
        return { icon: str(b?.icon, d.icon), title: str(b?.title, ""), text: str(b?.text, "") };
      })
    : base.benefits;
  while (benefits.length < MIN_BENEFITS) benefits.push({ icon: "leaf", title: "", text: "" });
  const footer = base.footer.map((f, i) => {
    const r = Array.isArray(raw.footer) ? (raw.footer as Partial<AgriFooterItem>[])[i] : undefined;
    return { icon: str(r?.icon, f.icon), label: str(r?.label, f.label) };
  });
  return {
    format: raw.format === "story" ? "story" : "feed",
    category: s("category"),
    showLogo: flag("showLogo"),
    showCta: flag("showCta"),
    showBanner: flag("showBanner"),
    showSecondary: flag("showSecondary"),
    showFooter: flag("showFooter"),
    logo: Math.round(num("logo", -1, BV_VARIANTS.length)),
    logoSize: num("logoSize", LOGO_SIZE.min, LOGO_SIZE.max),
    logoPlate: flag("logoPlate"),
    brandTitle: mergeBrandTitle(raw.brandTitle, oldName),
    namePos: ["right", "left", "bottom", "top"].includes(raw.namePos as string) ? (raw.namePos as NamePos) : base.namePos,
    nameX: num("nameX", -NAME_SHIFT.x, NAME_SHIFT.x),
    nameY: num("nameY", -NAME_SHIFT.y, NAME_SHIFT.y),
    headline1: s("headline1"),
    headline2: s("headline2"),
    headline3: s("headline3"),
    description: s("description"),
    cta: s("cta"),
    bannerEyebrow: s("bannerEyebrow"),
    bannerTitle: s("bannerTitle"),
    bannerSubtitle: s("bannerSubtitle"),
    hero: img("hero"),
    heroFit: fit("heroFit"),
    heroZoom: num("heroZoom", ZOOM_MIN, ZOOM_MAX),
    heroX: num("heroX", 0, 100),
    heroY: num("heroY", 0, 100),
    secondary: img("secondary"),
    secondaryFit: fit("secondaryFit"),
    secondaryZoom: num("secondaryZoom", ZOOM_MIN, ZOOM_MAX),
    secondaryX: num("secondaryX", 0, 100),
    secondaryY: num("secondaryY", 0, 100),
    benefits,
    footer,
  };
}
