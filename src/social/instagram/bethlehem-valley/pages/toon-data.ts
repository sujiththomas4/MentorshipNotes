/*
 * Caricature pages ("toon"): content-first slides in the style of illustrated Malayalam farm
 * carousels. Big two-colour display titles, numbered badges, icon / photo lists, a caricature
 * farmer image, a tip box and an icon row, on a light page with its own small frame (round
 * logo, page counter, next arrow, handle). The brand header / footer are not used.
 * Placeholder text only; the caricature images come from the image library.
 */

const id = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** A list entry: icon (or a small picture when `image` is set), bold text, optional second line. */
export type ToonItem = { icon: string; image: string; text: string; sub: string };
/** An entry of the bottom icon row. */
export type ToonMini = { icon: string; text: string };

export type ToonFrame = {
  smallHeader: boolean;
  /** round logo top-left */
  showLogo: boolean;
  /** circled arrow at the bottom (hidden on the last page) */
  showArrow: boolean;
  /** leaf sprigs in the corners */
  leaves: boolean;
  /** caricature image (library path or uploaded data URL); "" = placeholder */
  character: string;
  /** soften the image edges (for pictures that are not cut out) */
  charFade: boolean;
  /** % of the default size */
  charSize: number;
  titleSize: number;
  textSize: number;
};

export type ToonCoverPage = ToonFrame & {
  id: string;
  kind: "toonCover";
  /** Enter = new line; lines alternate dark / green */
  title: string;
  colors: "alternate" | "firstDark" | "allGreen";
  subtitle: string;
  badgeNumber: string;
  badgeText: string;
  showBadge: boolean;
  /** soft farm photo behind the lower half; "" = none */
  scene: string;
  row: ToonMini[];
};

export type ToonIdeaPage = ToonFrame & {
  id: string;
  kind: "toonIdea";
  /** card: series title on top, a white card with number + heading + list | split: number + big heading, list left, character right */
  layout: "card" | "split";
  /** heading colours: lines alternate dark / green, or all one colour */
  colors: "alternate" | "firstDark" | "allGreen" | "allDark";
  /** series title above the card (card layout), Enter = new line */
  topTitle: string;
  topSub: string;
  number: string;
  numberStyle: "square" | "circle" | "flag";
  heading: string;
  /** a line under the heading (split layout) */
  headingSub: string;
  itemStyle: "icon" | "pill" | "photo";
  items: ToonItem[];
  showTip: boolean;
  tip: string;
  showRow: boolean;
  row: ToonMini[];
};

export type ToonPage = ToonCoverPage | ToonIdeaPage;

export const MAX_TOON_ITEMS = 6;
export const MAX_TOON_ROW = 5;

const frame = (): ToonFrame => ({
  smallHeader: false,
  showLogo: true,
  showArrow: true,
  leaves: true,
  character: "",
  charFade: false,
  charSize: 100,
  titleSize: 100,
  textSize: 100,
});

export function toonCoverPage(): ToonCoverPage {
  return {
    ...frame(),
    id: id(),
    kind: "toonCover",
    title: "കൃഷി\nനിങ്ങളുടെ\nപാഷൻ\nആണോ?",
    colors: "alternate",
    subtitle: "Your subtitle goes here:\nwhat this series is about",
    badgeNumber: "10",
    badgeText: "നൂതന\nആശയങ്ങൾ",
    showBadge: true,
    scene: "/social/instagram/bethlehem-valley/landscape.webp",
    row: [
      { icon: "sprout", text: "Point one" },
      { icon: "lightbulb", text: "Point two" },
      { icon: "star", text: "Point three" },
      { icon: "users", text: "Point four" },
    ],
  };
}

export function toonIdeaPage(layout: ToonIdeaPage["layout"] = "card"): ToonIdeaPage {
  return {
    ...frame(),
    id: id(),
    kind: "toonIdea",
    layout,
    colors: layout === "card" ? "alternate" : "allGreen",
    topTitle: "കൃഷിയിൽ നിന്നും\nഅധിക വരുമാനം നേടാം",
    topSub: "10 മികച്ച ആശയങ്ങൾ",
    number: "1",
    numberStyle: layout === "card" ? "square" : "circle",
    heading: "ആശയത്തിന്റെ പേര്",
    headingSub: "",
    itemStyle: layout === "card" ? "icon" : "pill",
    items: [
      { icon: "home", image: "", text: "First point", sub: "" },
      { icon: "leaf", image: "", text: "Second point", sub: "" },
      { icon: "users", image: "", text: "Third point", sub: "" },
      { icon: "clock", image: "", text: "Fourth point", sub: "" },
    ],
    showTip: true,
    tip: "ഒരു ചെറിയ സന്ദേശം ഇവിടെ എഴുതാം…",
    showRow: false,
    row: [
      { icon: "leaf", text: "" },
      { icon: "drop", text: "" },
      { icon: "sun", text: "" },
      { icon: "sprout", text: "" },
    ],
  };
}
