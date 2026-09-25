import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { defaultBrandTitle, mergeBrandTitle, type BrandTitle } from "../brand-title";
import { BV_ART, type BvFormat } from "../shared";

/*
 * Bethlehem Valley "Ideas Cover" feed post, from Bethlehem_Valley_1080x1350_outlined.svg:
 * slide number, three-line title with a leaf, divider, two-line subtitle, a square number
 * badge, a white footer panel with four feature icons, pager dots and the handle, and a
 * farmer cut-out over the farm photo on the right.
 */

export type IdeaFeature = { icon: string; label: string };

export type IdeasCoverData = {
  /** always the 1080 × 1350 feed (the layout is drawn for it) */
  format: BvFormat;
  /** used for the file name only */
  category: string;
  /** 0 = the round emblem from the design, 1–8 = Branding logo variants */
  logo: number;
  /** "Bethlehem Valley" beside the logo */
  brandTitle: BrandTitle;
  slide: string;
  title1: string;
  title2: string;
  title3: string;
  sub1: string;
  sub2: string;
  showBadge: boolean;
  badgeNumber: string;
  badge1: string;
  badge2: string;
  features: IdeaFeature[];
  /** pager dots: how many, and which one is filled (1-based); 0 dots = hidden */
  dots: number;
  activeDot: number;
  handle: string;
  /** full-page photo behind everything; null = plain white */
  background: string | null;
  /** cut-out figure standing bottom right; null = none */
  farmer: string | null;
  farmerZoom: number;
  farmerX: number;
  showLeaves: boolean;
};

export const DEFAULT_BACKGROUND = `${BV_ART}/ideas/background.png`;
export const DEFAULT_FARMER = `${BV_ART}/ideas/farmer.png`;
export const DESIGN_LOGO = `${BV_ART}/ideas/logo.png`;

export function sampleData(): IdeasCoverData {
  return {
    format: "feed",
    category: "10 FARM IDEAS",
    logo: 0,
    brandTitle: defaultBrandTitle(),
    slide: "01",
    title1: "കൃഷിയുടെ",
    title2: "വിജയത്തിനായി",
    title3: "10 ആശയങ്ങൾ",
    sub1: "കാർഷിക മേഖലയിൽ",
    sub2: "നിന്നും അറിവുകൾ",
    showBadge: true,
    badgeNumber: "10",
    badge1: "നൂതന",
    badge2: "ആശയങ്ങൾ",
    features: [
      { icon: "idea-sprout", label: "നൂതന\nചിന്ത" },
      { icon: "idea-bulb", label: "സുസ്ഥിര\nമാർഗങ്ങൾ" },
      { icon: "idea-chart", label: "ഉയർന്ന\nലാഭം" },
      { icon: "idea-people", label: "കർഷക\nസമൂഹം" },
    ],
    dots: 3,
    activeDot: 1,
    handle: "@bethlehemvalley",
    background: DEFAULT_BACKGROUND,
    farmer: DEFAULT_FARMER,
    farmerZoom: 100,
    farmerX: 0,
    showLeaves: true,
  };
}

const str = (v: unknown, b: string) => (v === undefined || v === null ? b : String(v));

/** Saved data or a .json file → full data (unknown keys dropped, missing ones filled). */
export function mergeData(raw: Record<string, unknown> | null): IdeasCoverData {
  const base = sampleData();
  if (!raw) return base;
  const num = (k: "logo" | "farmerZoom" | "farmerX" | "dots" | "activeDot", min: number, max: number) => {
    const n = Number(raw[k]);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : base[k];
  };
  const bool = (k: "showBadge" | "showLeaves") => (typeof raw[k] === "boolean" ? (raw[k] as boolean) : base[k]);
  const img = (k: "background" | "farmer") => (raw[k] === undefined ? base[k] : typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : null);
  const features = base.features.map((f, i) => {
    const r = Array.isArray(raw.features) ? (raw.features as Partial<IdeaFeature>[])[i] : undefined;
    return { icon: str(r?.icon, f.icon), label: str(r?.label, f.label) };
  });
  return {
    format: "feed",
    category: str(raw.category, base.category),
    logo: Math.round(num("logo", 0, BV_VARIANTS.length)),
    brandTitle: mergeBrandTitle(raw.brandTitle),
    slide: str(raw.slide, base.slide),
    title1: str(raw.title1, base.title1),
    title2: str(raw.title2, base.title2),
    title3: str(raw.title3, base.title3),
    sub1: str(raw.sub1, base.sub1),
    sub2: str(raw.sub2, base.sub2),
    showBadge: bool("showBadge"),
    badgeNumber: str(raw.badgeNumber, base.badgeNumber),
    badge1: str(raw.badge1, base.badge1),
    badge2: str(raw.badge2, base.badge2),
    features,
    dots: Math.round(num("dots", 0, 10)),
    activeDot: Math.round(num("activeDot", 1, 10)),
    handle: str(raw.handle, base.handle),
    background: img("background"),
    farmer: img("farmer"),
    farmerZoom: num("farmerZoom", 50, 150),
    farmerX: num("farmerX", -300, 300),
    showLeaves: bool("showLeaves"),
  };
}
