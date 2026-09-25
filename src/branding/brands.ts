/*
 * The brands (Instagram accounts) this app makes content for. Each brand has its own
 * Branding page and its own templates (SocialTemplate.brand).
 *
 * A brand with logo = null shows "logo coming" placeholders.
 */

export type BrandId = "indian-traders" | "bethlehem-valley";

export type Brand = {
  id: BrandId;
  name: string;
  /** one line about the brand */
  about: string;
  /** Instagram handle, "" until known */
  handle: string;
  /** the brand's main logo file (public path), null = not supplied yet */
  logo: string | null;
  /** square mark for small places (sidebar, chips), null = initials */
  mark: string | null;
  /** Branding page for this brand */
  page: "/branding/logo" | "/branding/bethlehem-valley";
  /** app-only colours for this brand's headers and chips (not brand colours) */
  ui: { from: string; to: string; ink: string };
};

export const BRANDS: Brand[] = [
  {
    id: "indian-traders",
    name: "Indian Traders",
    about: "Stock market education: global cues, trade setups and option selling.",
    handle: "",
    logo: "/branding/logos/assets/indian-traders-horizontal-shield.png",
    mark: "/branding/logos/assets/indian-traders-horizontal-shield-emblem.png",
    page: "/branding/logo",
    ui: { from: "#0d2440", to: "#050b14", ink: "#10D9E8" },
  },
  {
    id: "bethlehem-valley",
    name: "Bethlehem Valley",
    about: "Farm and plantation.",
    handle: "",
    logo: "/branding/bethlehem-valley/bv-01-web.png",
    mark: "/branding/bethlehem-valley/bv-mark.png",
    page: "/branding/bethlehem-valley",
    ui: { from: "#14583a", to: "#041f11", ink: "#E2B94B" },
  },
];

export const getBrand = (id: string) => BRANDS.find((b) => b.id === id);

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
