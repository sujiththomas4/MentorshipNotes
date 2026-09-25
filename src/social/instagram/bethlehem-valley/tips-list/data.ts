import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { defaultBrandTitle, mergeBrandTitle, type BrandTitle } from "../brand-title";
import { BV_ART, type BvFormat } from "../shared";

/*
 * Bethlehem Valley "Tips List" feed post, from bethlehem-valley_01_outlined.svg:
 * numbered title, 3–6 tip cards with an icon, a callout line, a four-benefit footer band
 * and a farmer cut-out over a faded photo on the right.
 */

export type TipItem = { icon: string; title: string; body: string };
export type TipBenefit = { icon: string; label: string };

export type TipsListData = {
  /** always the 1080 × 1350 feed (the layout is drawn for it) */
  format: BvFormat;
  /** used for the file name only */
  category: string;
  /** 0 = the round emblem from the design, 1–8 = Branding logo variants */
  logo: number;
  /** "Bethlehem Valley" beside the logo */
  brandTitle: BrandTitle;
  number: string;
  title1: string;
  title2: string;
  sub1: string;
  sub2: string;
  tips: TipItem[];
  callout1: string;
  callout2: string;
  benefits: TipBenefit[];
  url: string;
  /** right-hand photo (faded in from the left); null = none */
  background: string | null;
  /** cut-out figure standing bottom right; null = none */
  farmer: string | null;
  farmerZoom: number;
  farmerX: number;
};

export const MIN_TIPS = 3;
export const MAX_TIPS = 6;

export const DEFAULT_BACKGROUND = `${BV_ART}/tips/background.webp`;
export const DEFAULT_FARMER = `${BV_ART}/tips/farmer.webp`;

export function sampleData(): TipsListData {
  return {
    format: "feed",
    category: "PEPPER TIPS",
    logo: 0,
    brandTitle: defaultBrandTitle(),
    number: "01",
    title1: "കുരുമുളക്",
    title2: "കൃഷി",
    sub1: "വിജയകരമാക്കാൻ",
    sub2: "ഈ 5 കാര്യങ്ങൾ ശ്രദ്ധിക്കുക",
    tips: [
      { icon: "tip-sprout", title: "നല്ല ഇനം തിരഞ്ഞെടുക്കുക", body: "ഉയർന്ന ഉൽപാദനം നൽകുന്ന ശരിയായ\nഇനം തിരഞ്ഞെടുക്കുക." },
      { icon: "tip-soil", title: "മണ്ണിന്റെ ആരോഗ്യം", body: "ജൈവവളം, പച്ചിലവളം എന്നിവ\nഉപയോഗിച്ച് മണ്ണിന്റെ ഗുണം വർധിപ്പിക്കുക." },
      { icon: "tip-drop", title: "ശരിയായ നനവ്", body: "വേനൽക്കാലത്ത് ആവശ്യത്തിന്\nനനയ്ക്കുക. വെള്ളക്കെട്ട് ഒഴിവാക്കുക." },
      { icon: "tip-shield", title: "രോഗ കീട നിയന്ത്രണം", body: "ജൈവ നിയന്ത്രണ മാർഗങ്ങളുടെ\nഉപയോഗം പ്രോത്സാഹിപ്പിക്കുക." },
      { icon: "tip-growth", title: "ശരിയായ പരിപാലനം", body: "താങ്ങുമരം കോതൽ, കളയെടുപ്പ് എന്നിവ\nകൃത്യസമയത്ത് ചെയ്യുക." },
    ],
    callout1: "നല്ല പരിചരണത്തിലൂടെ",
    callout2: "കുരുമുളക് വിളവ് ഇരട്ടിയാക്കാം!",
    benefits: [
      { icon: "tip-sprout", label: "നല്ല വിളവ്" },
      { icon: "tip-shield", label: "രോഗ പ്രതിരോധം" },
      { icon: "tip-money", label: "കൂടുതൽ വരുമാനം" },
      { icon: "tip-leaf", label: "നാടിന്റെ അഭിമാനം" },
    ],
    url: "greenvillageideas.com",
    background: DEFAULT_BACKGROUND,
    farmer: DEFAULT_FARMER,
    farmerZoom: 100,
    farmerX: 0,
  };
}

const str = (v: unknown, b: string) => (v === undefined || v === null ? b : String(v));

/** Saved data or a .json file → full data (unknown keys dropped, missing ones filled). */
export function mergeData(raw: Record<string, unknown> | null): TipsListData {
  const base = sampleData();
  if (!raw) return base;
  const num = (k: "logo" | "farmerZoom" | "farmerX", min: number, max: number) => {
    const n = Number(raw[k]);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : base[k];
  };
  const img = (k: "background" | "farmer") => (raw[k] === undefined ? base[k] : typeof raw[k] === "string" && raw[k] ? (raw[k] as string) : null);
  const tips = Array.isArray(raw.tips)
    ? (raw.tips as Partial<TipItem>[]).slice(0, MAX_TIPS).map((t, i) => {
        const b = base.tips[i] ?? base.tips[0];
        return { icon: str(t?.icon, b.icon), title: str(t?.title, ""), body: str(t?.body, "") };
      })
    : base.tips;
  while (tips.length < MIN_TIPS) tips.push({ icon: "tip-sprout", title: "", body: "" });
  const benefits = base.benefits.map((b, i) => {
    const r = Array.isArray(raw.benefits) ? (raw.benefits as Partial<TipBenefit>[])[i] : undefined;
    return { icon: str(r?.icon, b.icon), label: str(r?.label, b.label) };
  });
  return {
    format: "feed",
    category: str(raw.category, base.category),
    logo: Math.round(num("logo", 0, BV_VARIANTS.length)),
    brandTitle: mergeBrandTitle(raw.brandTitle),
    number: str(raw.number, base.number),
    title1: str(raw.title1, base.title1),
    title2: str(raw.title2, base.title2),
    sub1: str(raw.sub1, base.sub1),
    sub2: str(raw.sub2, base.sub2),
    tips,
    callout1: str(raw.callout1, base.callout1),
    callout2: str(raw.callout2, base.callout2),
    benefits,
    url: str(raw.url, base.url),
    background: img("background"),
    farmer: img("farmer"),
    farmerZoom: num("farmerZoom", 50, 150),
    farmerX: num("farmerX", -300, 300),
  };
}
