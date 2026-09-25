import type { IgLogoVariant } from "@/social/instagram/kit";
import { defaultLayout, mergeLayout, type IgLayout, type IgTheme } from "@/social/instagram/layout";

/*
 * Indian Traders "Trading Psychology Facts" post: brush title, 3–6 neon fact cards with an
 * icon, a photo on the left, a "Better mindset = Better trades" line and the plan / execute /
 * manage-risk footer. Text marked with *stars* in the subtitle is drawn in gold.
 */

export const FACT_COLORS = {
  yellow: "#FFD21F",
  green: "#22E07A",
  blue: "#1FB2FF",
  purple: "#B45CFF",
  teal: "#2FE0E0",
  orange: "#FF9F1C",
  red: "#FF4D5E",
  pink: "#FF5FB0",
} as const;
export type FactColor = keyof typeof FACT_COLORS;

export type Fact = { icon: string; color: FactColor; title: string; body: string };

export type PsychologyData = {
  /** the brush label above the title */
  kicker: string;
  title1: string;
  title2: string;
  /** Enter = new line; *words* are gold */
  subtitle: string;
  facts: Fact[];
  photo: string | null;
  /** 50–200 % */
  photoZoom: number;
  photoX: number;
  photoY: number;
  sloganLeft: string;
  sloganRight: string;
  footer: [string, string, string];
  hashtag: string;
  /** top-right line, "|" separated; empty hides it */
  tagline: string;
  logo: IgLogoVariant;
  /** the shield on white (as in the reference) instead of the see-through one */
  logoFilled: boolean;
  layout: IgLayout;
};

export const MIN_FACTS = 3;
export const MAX_FACTS = 6;

export const PSYCHOLOGY_THEMES: IgTheme[] = [
  { id: "black", label: "Black & gold", swatch: ["#07080b", "#FFD21F", "#22E07A"] },
  { id: "navy", label: "Navy & gold", swatch: ["#0a1a33", "#FFD21F", "#1FB2FF"] },
];

export const DEFAULT_PHOTO = "/social/instagram/trading-psychology/trader.jpg";

export function defaultData(): PsychologyData {
  return {
    kicker: "TRADING",
    title1: "PSYCHOLOGY",
    title2: "FACTS",
    subtitle: "BECAUSE IT'S NOT JUST ABOUT\nCHARTS, IT'S ABOUT *YOUR MIND.*",
    facts: [
      { icon: "head-brain", color: "yellow", title: "FEAR DRIVES\nBAD DECISIONS", body: "Fear can make you exit early,\nfreeze, or avoid good setups." },
      { icon: "head-sun", color: "green", title: "GREED CREATES\nOVERTRADING", body: "Greed makes you take unnecessary\nrisks and ignore your plan." },
      { icon: "head-face", color: "blue", title: "EMOTIONS CLOUD\nJUDGEMENT", body: "Emotions like excitement, anger\nand frustration can destroy\nrational thinking." },
      { icon: "target", color: "purple", title: "PATIENCE PAYS\nTHE BIGGEST DIVIDENDS", body: "Waiting for the right setup\nis a skill — not a weakness." },
      { icon: "checklist", color: "teal", title: "DISCIPLINE BEATS\nSKILL (MOST OF THE TIME)", body: "The best traders aren't always\nright, they just follow their plan." },
      { icon: "head-gears", color: "orange", title: "YOUR MINDSET\nBUILDS YOUR RESULTS", body: "A calm mind, positive outlook\nand self-control lead to consistency." },
    ],
    photo: DEFAULT_PHOTO,
    photoZoom: 100,
    photoX: 0,
    photoY: 0,
    sloganLeft: "BETTER MINDSET",
    sloganRight: "BETTER TRADES",
    footer: ["PLAN", "EXECUTE", "MANAGE RISK"],
    hashtag: "#TradingPsychology",
    tagline: "LEARN | TRADE | GROW",
    logo: "horizontal",
    logoFilled: true,
    layout: defaultLayout("black"),
  };
}

const str = (v: unknown, b: string) => (v === undefined || v === null ? b : String(v));
const clamp = (v: unknown, min: number, max: number, b: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : b;
};

/** Saved data or a .json file → full data (unknown keys dropped, missing ones filled). */
export function mergeData(raw: Record<string, unknown> | null): PsychologyData {
  const base = defaultData();
  if (!raw) return base;
  const facts = Array.isArray(raw.facts)
    ? (raw.facts as Partial<Fact>[]).slice(0, MAX_FACTS).map((f, i) => {
        const b = base.facts[i] ?? base.facts[0];
        return {
          icon: str(f?.icon, b.icon),
          color: f?.color && f.color in FACT_COLORS ? f.color : b.color,
          title: str(f?.title, ""),
          body: str(f?.body, ""),
        };
      })
    : base.facts;
  while (facts.length < MIN_FACTS) facts.push({ ...base.facts[facts.length], title: "", body: "" });
  const footer = Array.isArray(raw.footer) ? (raw.footer as unknown[]).map((s) => str(s, "")) : base.footer;
  return {
    kicker: str(raw.kicker, base.kicker),
    title1: str(raw.title1, base.title1),
    title2: str(raw.title2, base.title2),
    subtitle: str(raw.subtitle, base.subtitle),
    facts,
    photo: raw.photo === undefined ? base.photo : typeof raw.photo === "string" && raw.photo ? raw.photo : null,
    photoZoom: clamp(raw.photoZoom, 50, 200, base.photoZoom),
    photoX: clamp(raw.photoX, -400, 400, base.photoX),
    photoY: clamp(raw.photoY, -400, 400, base.photoY),
    sloganLeft: str(raw.sloganLeft, base.sloganLeft),
    sloganRight: str(raw.sloganRight, base.sloganRight),
    footer: [footer[0] ?? "", footer[1] ?? "", footer[2] ?? ""],
    hashtag: str(raw.hashtag, base.hashtag),
    tagline: str(raw.tagline, base.tagline),
    logo: raw.logo === "tricolor" ? "tricolor" : "horizontal",
    logoFilled: typeof raw.logoFilled === "boolean" ? raw.logoFilled : base.logoFilled,
    layout: mergeLayout(raw.layout, base.layout, PSYCHOLOGY_THEMES),
  };
}
