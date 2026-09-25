/*
 * Indian Traders locked logos. Files live in public/branding/logos/ (copied from
 * "Assets with AI/Logo/indian_traders_two_locked_logo_variants_complete_assets");
 * everything below comes from its README.md and assets/logo_spec.json.
 */

export const BRAND_BASE = "/branding/logos";
export const brandFile = (path: string) => `${BRAND_BASE}/${path}`;

export type LogoPart = { file: string; label: string; size: string; issue?: string };

export type LogoVariant = {
  id: string;
  name: string;
  layout: string;
  /** starting width from the README */
  width: number;
  full: LogoPart;
  emblem: LogoPart;
  wordmark: LogoPart;
  source: string;
};

export const VARIANTS: LogoVariant[] = [
  {
    id: "tricolor",
    name: "Indian Traders Tricolor Shield",
    layout: "Vertical: full wording inside the shield",
    width: 180,
    full: { file: "assets/indian-traders-tricolor-shield.png", label: "Full logo", size: "911 × 1059" },
    emblem: { file: "assets/indian-traders-tricolor-shield-emblem.png", label: "Emblem", size: "907 × 826", issue: "Cut off through TRADERS" },
    wordmark: { file: "assets/indian-traders-tricolor-wordmark.png", label: "Wordmark", size: "635 × 305" },
    source: "source/locked_vertical_source.png",
  },
  {
    id: "horizontal",
    name: "Indian Traders Horizontal Shield",
    layout: "Horizontal: shield left, wordmark right",
    width: 260,
    full: { file: "assets/indian-traders-horizontal-shield.png", label: "Full logo", size: "1124 × 492" },
    emblem: { file: "assets/indian-traders-horizontal-shield-emblem.png", label: "Emblem", size: "441 × 488" },
    wordmark: { file: "assets/indian-traders-horizontal-wordmark-tricolor.png", label: "Wordmark", size: "656 × 275" },
    source: "source/locked_horizontal_source.png",
  },
];

/** Kept for the sidebar and Branding tiles: the two complete logos. */
export const LOGOS = VARIANTS.map((v) => ({ file: v.full.file, name: v.name }));
export const EMBLEM = VARIANTS[1].emblem.file;

export const ANATOMY = [
  "Muscular white bull facing left",
  "White bear facing right",
  "Green and red candlesticks at the top",
  "Cyan-to-blue shield border",
  "INDIAN in saffron / white / green",
  "TRADERS in white",
];

/** "Color reference" in the README (approximate except the tricolor). */
export const COLOR_GROUPS = [
  {
    name: "Shield",
    colors: [
      { name: "Cyan", hex: "#10D9E8" },
      { name: "Blue", hex: "#168BFF" },
    ],
  },
  {
    name: "Market candles",
    colors: [
      { name: "Green", hex: "#00E676" },
      { name: "Red", hex: "#FF2A32" },
    ],
  },
  {
    name: "Tricolor wordmark",
    colors: [
      { name: "Saffron", hex: "#FF9933" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Green", hex: "#33D666" },
    ],
  },
];

export const PALETTE = COLOR_GROUPS.flatMap((g) => g.colors);

export const DONTS = [
  "Change the bull or bear",
  "Change their direction",
  "Add shading to the bull or bear",
  "Change the shield shape",
  "Change the candlestick arrangement",
  "Replace the wordmark",
  "Stretch the logo",
  "Add a gold border",
  "Add a circular border",
  "Recolour the logo as a whole",
];

/** Placement guidance for Instagram cards (1080 × 1350). */
export const INSTAGRAM = { w: 1080, h: 1350, safe: 60, left: 55, top: 40, vertical: 150, horizontal: 180 };
