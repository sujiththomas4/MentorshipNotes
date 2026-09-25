/*
 * Bethlehem Valley logo kit, from "bethlehem-valley-logo-studio.html" (Downloads):
 * 7 badge variants at 1080 × 1080, transparent PNG, each with a separate soft-shadow layer
 * (540 × 540, tinted when drawn). Files in public/branding/bethlehem-valley/:
 *   bv-NN-logo.png   original 1080 × 1080 (use for exports / downloads)
 *   bv-NN-web.png    540 × 540 copy for the app's pages
 *   bv-NN-shadow.png shadow layer (alpha only; its colour is applied by a filter)
 *   bv-mark.png      160 × 160 copy of variant 01 for small places
 * Variant 08 is the round emblem the Farm Tip / Pages templates always had
 * (public/social/instagram/bethlehem-valley/emblem.webp), added to the kit so every template can use it.
 */

export const BV_BASE = "/branding/bethlehem-valley";

export type BvVariant = { n: number; id: string; logo: string; web: string; shadow: string };

export const BV_VARIANTS: BvVariant[] = Array.from({ length: 8 }, (_, i) => {
  const id = String(i + 1).padStart(2, "0");
  return {
    n: i + 1,
    id,
    logo: `${BV_BASE}/bv-${id}-logo.png`,
    web: `${BV_BASE}/bv-${id}-web.png`,
    shadow: `${BV_BASE}/bv-${id}-shadow.png`,
  };
});

/** The round-emblem variant (same picture as the templates' "Round emblem"). */
export const BV_EMBLEM_VARIANT = 8;

/** Default / primary variant until one is chosen. */
export const BV_PRIMARY = 0;

/** Brand colours named in the logo studio. */
export const BV_COLORS = [
  { name: "Forest green", hex: "#0B3D24" },
  { name: "Deep green", hex: "#063A20" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Warm gold", hex: "#E2B94B" },
  { name: "Ivory", hex: "#F7F3E8" },
  { name: "Original paper", hex: "#F8F6EE" },
];

/** Studio defaults (same as the HTML studio). */
export const BV_GRADIENT = { from: "#14583a", to: "#041f11" };

export const BV_SIZES = {
  square: { w: 1080, h: 1080, label: "Square 1080²", logo: 100 },
  portrait: { w: 1080, h: 1350, label: "Post 4:5", logo: 92 },
  story: { w: 1080, h: 1920, label: "Story 9:16", logo: 90 },
} as const;
export type BvSize = keyof typeof BV_SIZES;

export const BV_SHADOW_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Forest", hex: "#063A20" },
  { name: "Gold glow", hex: "#E2B94B" },
  { name: "White glow", hex: "#FFFFFF" },
];
