import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { blankData as tipBlank, type BvLook, type FarmTipData } from "../farm-tip/data";
import { toonCoverPage, toonIdeaPage, type ToonPage } from "./toon-data";

/*
 * Multi-page (carousel) posts for Bethlehem Valley. One brand look (header + footer, story or
 * feed) is shared by every page; each page picks its own template:
 *   tip    - the Farm Tip layout (heading, text, photo, feature row, landscape band)
 *   steps  - step-by-step instructions or bullet points
 *   promo  - a property / tool promotion: photo, price, highlights, advantages, contact
 *   features - explains a product / tool / method through its features (no price or seller)
 *   cover  - first slide: banner title, what the post covers, description, "swipe" button;
 *            fonts, sizes, alignment and button style are all adjustable
 * Placeholder texts only: the user fills in the real content.
 */

export type PageKind = "cover" | "tip" | "steps" | "promo" | "features" | "guide" | "follow" | "toonCover" | "toonIdea";

export const PAGE_KINDS: { kind: PageKind; label: string; note: string }[] = [
  { kind: "cover", label: "Cover", note: "First slide: title, what it covers, swipe button" },
  { kind: "tip", label: "Farm tip", note: "Heading, text, photo, feature row" },
  { kind: "steps", label: "Steps / bullets", note: "1, 2, 3 steps, bullets or checks" },
  { kind: "promo", label: "Promotion", note: "Property or tool: price, advantages, contact" },
  { kind: "features", label: "Features", note: "Explain the advantages: feature cards, no price or seller" },
  { kind: "guide", label: "Product guide", note: "Pesticide / product: controls, crops, when (not) to use, dosage, safety" },
  { kind: "follow", label: "Follow (last page)", note: "Logo, handle, follow / like / save / share row, follow button" },
  { kind: "toonCover", label: "Caricature cover", note: "Big title, number badge, caricature farmer, icon row" },
  { kind: "toonIdea", label: "Caricature idea", note: "Numbered idea with icon list, caricature farmer, tip box" },
];

type PageBase = {
  id: string;
  /** use the compact header on this page (more room for content) */
  smallHeader: boolean;
};

export type PhotoSet = { photo: string | null; photoZoom: number; photoX: number; photoY: number };
export type ListItem = { text: string; ml: string };

export type TipPage = PageBase & { kind: "tip" } & Omit<FarmTipData, keyof BvLook>;

export type ListStyle = "numbers" | "bullets" | "checks";
export type StepsPage = PageBase &
  PhotoSet & {
    kind: "steps";
    category: string;
    categoryIcon: string;
    meta: string;
    heading: string;
    mlHeading: string;
    /** optional intro under the heading */
    body: string;
    mlBody: string;
    listStyle: ListStyle;
    /** first number (to continue a list from the previous page) */
    startAt: number;
    /** each step in a white card */
    cards: boolean;
    steps: ListItem[];
    showPhoto: boolean;
    /** optional note / warning box under the list */
    note: string;
    mlNote: string;
  };

export type Highlight = { icon: string; label: string; value: string };
export type PhotoSize = "s" | "m" | "l";
export type PromoPage = PageBase &
  PhotoSet & {
    kind: "promo";
    ribbon: string;
    ribbonIcon: string;
    heading: string;
    mlHeading: string;
    location: string;
    priceLabel: string;
    price: string;
    priceNote: string;
    photoSize: PhotoSize;
    highlights: Highlight[];
    advTitle: string;
    advantages: ListItem[];
    contactTitle: string;
    contactName: string;
    phone: string;
    whatsapp: string;
    address: string;
    /** email or website */
    extra: string;
    extraIcon: "mail" | "globe";
    cta: string;
    mlCta: string;
  };

export type FeatureItem = { icon: string; title: string; text: string; ml: string };
export type FeaturesPage = PageBase &
  PhotoSet & {
    kind: "features";
    category: string;
    categoryIcon: string;
    meta: string;
    heading: string;
    mlHeading: string;
    /** what it is / who it is for */
    body: string;
    mlBody: string;
    showPhoto: boolean;
    photoSize: PhotoSize;
    /** grid = 2-column cards, list = one card per row */
    layout: "grid" | "list";
    features: FeatureItem[];
    /** optional one-line summary in a green band */
    takeaway: string;
    mlTakeaway: string;
  };

export type CoverItem = { icon: string; text: string; ml: string };
export type CoverPage = PageBase &
  PhotoSet & {
    kind: "cover";
    /** photo = title on the photo, stacked = photo above the title, plain = no photo */
    banner: "photo" | "stacked" | "plain";
    /** banner photo height at story size, px (feed scales it down) */
    bannerHeight: number;
    align: "left" | "center";
    eyebrow: string;
    eyebrowIcon: string;
    heading: string;
    mlHeading: string;
    titleFont: "sans" | "serif" | "script";
    /** sizes in % of the default */
    titleSize: number;
    coversTitle: string;
    coversStyle: "list" | "cards" | "chips";
    covers: CoverItem[];
    coversSize: number;
    /** description */
    body: string;
    mlBody: string;
    textSize: number;
    showCta: boolean;
    cta: string;
    mlCta: string;
    ctaStyle: "gold" | "green" | "outline";
    ctaAlign: "left" | "center" | "right";
    ctaSize: number;
  };

/* ---------- product guide (pesticides etc.) ---------- */

export type GuideSectionId = "title" | "targets" | "crops" | "when" | "whenNot" | "dosage" | "advantages" | "safety" | "disclaimer";
export type GuideSection = { id: GuideSectionId; show: boolean; title: string };
export type GuideTone = "green" | "red" | "amber" | "blue" | "purple";

/** Every section a guide page can show, in the default order, with its default heading. */
export const GUIDE_SECTIONS: { id: GuideSectionId; label: string; title: string }[] = [
  { id: "title", label: "Product title", title: "" },
  { id: "targets", label: "What it controls", title: "CONTROLS" },
  { id: "crops", label: "Recommended crops", title: "RECOMMENDED CROPS" },
  { id: "when", label: "When to use", title: "WHEN TO USE" },
  { id: "whenNot", label: "When NOT to use", title: "WHEN NOT TO USE" },
  { id: "dosage", label: "Dosage & application", title: "DOSAGE & APPLICATION" },
  { id: "advantages", label: "Advantages", title: "ADVANTAGES" },
  { id: "safety", label: "Safety / precautions", title: "SAFETY FIRST" },
  { id: "disclaimer", label: "Label disclaimer", title: "" },
];

export type GuidePage = PageBase &
  PhotoSet & {
    kind: "guide";
    /** product type badge, e.g. INSECTICIDE / FUNGICIDE / BIO-PESTICIDE */
    typeLabel: string;
    typeIcon: string;
    tone: GuideTone;
    heading: string;
    mlHeading: string;
    /** active ingredient / composition line */
    ingredient: string;
    showPhoto: boolean;
    sections: GuideSection[];
    targets: ListItem[];
    crops: ListItem[];
    when: ListItem[];
    whenNot: ListItem[];
    dosage: Highlight[];
    advantages: ListItem[];
    safety: ListItem[];
    disclaimer: string;
    mlDisclaimer: string;
    /** sizes in % of the default */
    headingSize: number;
    textSize: number;
  };

/* ---------- follow (closing page) ---------- */

export type FollowActionId = "follow" | "like" | "save" | "share" | "bell";
export type FollowAction = { id: FollowActionId; show: boolean; label: string; ml: string };
export const FOLLOW_ACTION_ICONS: Record<FollowActionId, string> = { follow: "userplus", like: "heart", save: "bookmark", share: "send", bell: "bell" };

export type FollowPage = PageBase & {
  kind: "follow";
  /** green = the content sits on a brand-green card, cream = on the page background */
  background: "green" | "cream";
  showLogo: boolean;
  logo: "emblem" | number;
  heading: string;
  mlHeading: string;
  handle: string;
  body: string;
  mlBody: string;
  /** optional chips: what followers get */
  perks: CoverItem[];
  actions: FollowAction[];
  showButton: boolean;
  button: string;
  mlButton: string;
  titleSize: number;
  textSize: number;
  buttonSize: number;
};

export type BvPage = CoverPage | TipPage | StepsPage | PromoPage | FeaturesPage | GuidePage | FollowPage | ToonPage;

export type PagesLook = BvLook & { pageNumbers: boolean };
export type PagesData = { look: PagesLook; pages: BvPage[] };

export const MAX_PAGES = 10;
export const MAX_STEPS = 8;
export const MAX_ADVANTAGES = 8;
export const MAX_HIGHLIGHTS = 4;
export const MAX_FEATURES = 6;

export const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const LOOK_KEYS = ["format", "showHeader", "showFooter", "theme", "headerStyle", "headerLogo", "headerPhoto", "headerPhotoRight", "showHeaderPhotoRight", "showSlogan", "brandName", "tagline", "slogan", "sloganSmall", "handle", "follow"] as const;

export function defaultLook(): PagesLook {
  const t = tipBlank();
  return { ...(Object.fromEntries(LOOK_KEYS.map((k) => [k, t[k]])) as BvLook), pageNumbers: true };
}

const photo = (): PhotoSet => ({ photo: null, photoZoom: 100, photoX: 50, photoY: 50 });

export function tipPage(): TipPage {
  const t = tipBlank() as Partial<FarmTipData>;
  for (const k of LOOK_KEYS) delete t[k];
  return { ...(t as Omit<FarmTipData, keyof BvLook>), id: newId(), kind: "tip", smallHeader: false };
}

export function stepsPage(): StepsPage {
  return {
    id: newId(),
    kind: "steps",
    smallHeader: false,
    category: "STEP BY STEP",
    categoryIcon: "check",
    meta: "",
    heading: "Your Step-by-Step Heading",
    mlHeading: "ഇവിടെ നിങ്ങളുടെ മലയാളം\nതലക്കെട്ട് നൽകാം",
    body: "A short introduction (optional). Leave empty to hide it.",
    mlBody: "",
    listStyle: "numbers",
    startAt: 1,
    cards: false,
    steps: [
      { text: "Write the first step here.", ml: "ഒന്നാം ഘട്ടം ഇവിടെ എഴുതുക." },
      { text: "Write the second step here.", ml: "രണ്ടാം ഘട്ടം ഇവിടെ എഴുതുക." },
      { text: "Write the third step here.", ml: "മൂന്നാം ഘട്ടം ഇവിടെ എഴുതുക." },
      { text: "Write the fourth step here.", ml: "നാലാം ഘട്ടം ഇവിടെ എഴുതുക." },
    ],
    showPhoto: false,
    ...photo(),
    note: "Tip: add an extra note or warning here, or leave it empty.",
    mlNote: "",
  };
}

export function promoPage(): PromoPage {
  return {
    id: newId(),
    kind: "promo",
    smallHeader: false,
    ribbon: "FOR SALE",
    ribbonIcon: "tag",
    heading: "Your Property or Tool Name",
    mlHeading: "ഇവിടെ മലയാളം പേര് നൽകാം",
    location: "Location, District",
    priceLabel: "PRICE",
    price: "₹ 0,00,000",
    priceNote: "Negotiable",
    ...photo(),
    photoSize: "m",
    highlights: [
      { icon: "area", label: "SIZE", value: "—" },
      { icon: "drop", label: "WATER", value: "—" },
      { icon: "home", label: "ACCESS", value: "—" },
    ],
    advTitle: "ADVANTAGES",
    advantages: [
      { text: "Advantage one", ml: "ഒന്നാമത്തെ നേട്ടം" },
      { text: "Advantage two", ml: "രണ്ടാമത്തെ നേട്ടം" },
      { text: "Advantage three", ml: "മൂന്നാമത്തെ നേട്ടം" },
      { text: "Advantage four", ml: "നാലാമത്തെ നേട്ടം" },
    ],
    contactTitle: "CONTACT",
    contactName: "Bethlehem Valley",
    phone: "+91 00000 00000",
    whatsapp: "",
    address: "",
    extra: "",
    extraIcon: "mail",
    cta: "Call / WhatsApp now",
    mlCta: "ഇപ്പോൾ വിളിക്കൂ",
  };
}

export function featuresPage(): FeaturesPage {
  return {
    id: newId(),
    kind: "features",
    smallHeader: false,
    category: "KEY FEATURES",
    categoryIcon: "star",
    meta: "",
    heading: "Why Choose This Product",
    mlHeading: "ഇവിടെ നിങ്ങളുടെ മലയാളം\nതലക്കെട്ട് നൽകാം",
    body: "One or two lines about what it is and who it is for.",
    mlBody: "",
    showPhoto: true,
    ...photo(),
    photoSize: "m",
    layout: "grid",
    features: [
      { icon: "leaf", title: "Feature one", text: "Explain the benefit in one short line.", ml: "ഒന്നാമത്തെ സവിശേഷത" },
      { icon: "shield", title: "Feature two", text: "Explain the benefit in one short line.", ml: "രണ്ടാമത്തെ സവിശേഷത" },
      { icon: "drop", title: "Feature three", text: "Explain the benefit in one short line.", ml: "മൂന്നാമത്തെ സവിശേഷത" },
      { icon: "clock", title: "Feature four", text: "Explain the benefit in one short line.", ml: "നാലാമത്തെ സവിശേഷത" },
    ],
    takeaway: "Sum up the main benefit in one line, or leave it empty.",
    mlTakeaway: "",
  };
}

export const MAX_COVERS = 6;

export function coverPage(): CoverPage {
  return {
    id: newId(),
    kind: "cover",
    smallHeader: false,
    banner: "photo",
    bannerHeight: 520,
    align: "left",
    eyebrow: "NEW GUIDE",
    eyebrowIcon: "star",
    heading: "Your Cover Title Goes Here",
    mlHeading: "ഇവിടെ മലയാളം തലക്കെട്ട് നൽകാം",
    titleFont: "sans",
    titleSize: 100,
    coversTitle: "WHAT THIS POST COVERS",
    coversStyle: "list",
    covers: [
      { icon: "leaf", text: "First topic in this post", ml: "ഒന്നാമത്തെ വിഷയം" },
      { icon: "shield", text: "Second topic in this post", ml: "രണ്ടാമത്തെ വിഷയം" },
      { icon: "drop", text: "Third topic in this post", ml: "മൂന്നാമത്തെ വിഷയം" },
    ],
    coversSize: 100,
    body: "A short description of the post (optional). Leave empty to hide it.",
    mlBody: "",
    textSize: 100,
    showCta: true,
    cta: "Swipe for more",
    mlCta: "കൂടുതൽ അറിയാൻ സ്വൈപ്പ് ചെയ്യൂ",
    ctaStyle: "gold",
    ctaAlign: "right",
    ctaSize: 100,
    ...photo(),
  };
}

export const MAX_GUIDE_ITEMS = 8;
export const MAX_DOSAGE = 6;

/** A guide page; `show` lists the sections visible on it (all others stay hidden but keep their text). */
export function guidePage(show: GuideSectionId[] = GUIDE_SECTIONS.map((s) => s.id)): GuidePage {
  const item = (text: string, ml = ""): ListItem => ({ text, ml });
  return {
    id: newId(),
    kind: "guide",
    smallHeader: false,
    typeLabel: "INSECTICIDE",
    typeIcon: "bug",
    tone: "red",
    heading: "Product Name",
    mlHeading: "ഉൽപ്പന്നത്തിന്റെ പേര്",
    ingredient: "Active ingredient: write the composition from the label",
    showPhoto: true,
    ...photo(),
    sections: GUIDE_SECTIONS.map((s) => ({ id: s.id, show: show.includes(s.id), title: s.title })),
    targets: [item("Pest or disease 1"), item("Pest or disease 2"), item("Pest or disease 3")],
    crops: [item("Crop 1"), item("Crop 2"), item("Crop 3")],
    when: [item("When to use: point 1"), item("When to use: point 2"), item("When to use: point 3")],
    whenNot: [item("When not to use: point 1"), item("When not to use: point 2"), item("When not to use: point 3")],
    dosage: [
      { icon: "drop", label: "DOSE", value: "As per label" },
      { icon: "flask", label: "METHOD", value: "Spray / drench" },
      { icon: "clock", label: "INTERVAL", value: "—" },
      { icon: "sun", label: "BEST TIME", value: "—" },
      { icon: "alert", label: "WAITING PERIOD", value: "—" },
    ],
    advantages: [item("Advantage one", "ഒന്നാമത്തെ നേട്ടം"), item("Advantage two", "രണ്ടാമത്തെ നേട്ടം"), item("Advantage three", "മൂന്നാമത്തെ നേട്ടം")],
    safety: [item("Safety point 1"), item("Safety point 2"), item("Safety point 3")],
    disclaimer: "Always read and follow the product label. Consult your Krishi Bhavan or agricultural officer before use.",
    mlDisclaimer: "",
    headingSize: 100,
    textSize: 100,
  };
}

export const MAX_PERKS = 4;

export function followPage(): FollowPage {
  return {
    id: newId(),
    kind: "follow",
    smallHeader: false,
    background: "green",
    showLogo: true,
    // badge logo: transparent PNG (the round emblem image has a square background)
    logo: 1,
    heading: "Follow for Daily Updates",
    mlHeading: "ദിവസേനയുള്ള വിവരങ്ങൾക്ക് ഫോളോ ചെയ്യൂ",
    handle: "@bethlehemvalley",
    body: "Turn on notifications so you never miss a farm update.",
    mlBody: "ഒരു കൃഷി വിവരവും നഷ്ടപ്പെടാതിരിക്കാൻ നോട്ടിഫിക്കേഷൻ ഓണാക്കൂ.",
    perks: [],
    actions: [
      { id: "follow", show: true, label: "Follow", ml: "ഫോളോ" },
      { id: "like", show: true, label: "Like", ml: "ലൈക്ക്" },
      { id: "save", show: true, label: "Save", ml: "സേവ്" },
      { id: "share", show: true, label: "Share", ml: "ഷെയർ" },
      { id: "bell", show: true, label: "Notify", ml: "നോട്ടിഫിക്കേഷൻ" },
    ],
    showButton: true,
    button: "Follow Now",
    mlButton: "ഇപ്പോൾ ഫോളോ ചെയ്യൂ",
    titleSize: 100,
    textSize: 100,
    buttonSize: 100,
  };
}

export const newPage = (kind: PageKind): BvPage =>
  kind === "cover"
    ? coverPage()
    : kind === "tip"
      ? tipPage()
      : kind === "steps"
        ? stepsPage()
        : kind === "promo"
          ? promoPage()
          : kind === "features"
            ? featuresPage()
            : kind === "guide"
              ? guidePage()
              : kind === "toonCover"
                ? toonCoverPage()
                : kind === "toonIdea"
                  ? toonIdeaPage()
                  : followPage();

/** Product details a guide page can copy to the other guide pages (everything except which sections show). */
export const GUIDE_CONTENT_KEYS = [
  "typeLabel", "typeIcon", "tone", "heading", "mlHeading", "ingredient", "showPhoto", "photo", "photoZoom", "photoX", "photoY",
  "targets", "crops", "when", "whenNot", "dosage", "advantages", "safety", "disclaimer", "mlDisclaimer", "headingSize", "textSize",
] as const;

/** Switch a page to another template, keeping what both share (heading, texts, photo, list items). */
export function convertPage(p: BvPage, kind: PageKind): BvPage {
  if (p.kind === kind) return p;
  const next = newPage(kind) as Record<string, unknown>;
  const src = p as Record<string, unknown>;
  for (const k of Object.keys(next)) if (k !== "id" && k !== "kind" && k in src && typeof src[k] === typeof next[k]) next[k] = src[k];
  if (p.kind === "steps" && kind === "promo") next.advantages = p.steps;
  if (p.kind === "promo" && kind === "steps") next.steps = p.advantages;
  // list items <-> feature cards
  const items = p.kind === "steps" ? p.steps : p.kind === "promo" ? p.advantages : null;
  if (items && kind === "features") next.features = items.map((it) => ({ icon: "check", title: it.text, text: "", ml: it.ml }));
  if (p.kind === "features") {
    const back = p.features.map((f) => ({ text: f.title, ml: f.ml }));
    if (kind === "steps") next.steps = back;
    if (kind === "promo") next.advantages = back;
    // Farm tip's feature row: icon + title + Malayalam, four at most
    if (kind === "tip") next.features = p.features.slice(0, 4).map((f) => ({ icon: f.icon, title: f.title, ml: f.ml }));
  }
  if (p.kind === "tip" && kind === "features") next.features = p.features.map((f) => ({ icon: f.icon, title: f.title, text: "", ml: f.ml }));
  // cover topics <-> list items / feature cards
  const asTopics =
    p.kind === "steps" ? p.steps.map((s) => ({ icon: "check", text: s.text, ml: s.ml }))
    : p.kind === "promo" ? p.advantages.map((s) => ({ icon: "check", text: s.text, ml: s.ml }))
    : p.kind === "features" ? p.features.map((f) => ({ icon: f.icon, text: f.title, ml: f.ml }))
    : null;
  if (kind === "cover" && asTopics) next.covers = asTopics.slice(0, MAX_COVERS);
  if (p.kind === "cover") {
    if (kind === "steps") next.steps = p.covers.map((c) => ({ text: c.text, ml: c.ml }));
    if (kind === "promo") next.advantages = p.covers.map((c) => ({ text: c.text, ml: c.ml }));
    if (kind === "features") next.features = p.covers.map((c) => ({ icon: c.icon, title: c.text, text: "", ml: c.ml }));
  }
  // product guide: steps become "when to use", feature cards become advantages, and back
  if (kind === "guide") {
    if (p.kind === "steps") next.when = p.steps;
    if (p.kind === "features") next.advantages = p.features.map((f) => ({ text: f.title, ml: f.ml }));
  }
  if (p.kind === "guide") {
    if (kind === "steps") next.steps = p.when;
    if (kind === "features") next.features = p.advantages.map((a) => ({ icon: "check", title: a.text, text: "", ml: a.ml }));
    if (kind === "cover") next.covers = p.targets.slice(0, MAX_COVERS).map((t) => ({ icon: "check", text: t.text, ml: t.ml }));
  }
  next.id = p.id;
  return next as BvPage;
}

export function duplicatePage(p: BvPage): BvPage {
  return { ...structuredClone(p), id: newId() };
}

/** Fill a saved / opened page with its template defaults (unknown keys dropped). */
function mergePage(raw: Record<string, unknown>): BvPage | null {
  const kind = raw.kind as PageKind;
  if (!PAGE_KINDS.some((k) => k.kind === kind)) return null;
  const base = newPage(kind) as Record<string, unknown>;
  for (const [k, b] of Object.entries(base)) {
    const v = raw[k];
    if (v === undefined || k === "kind") continue;
    if (k === "photo") base.photo = typeof v === "string" && v ? v : null;
    else if (Array.isArray(b)) base[k] = Array.isArray(v) ? v.map((it, i) => ({ ...((b[i] ?? b[0]) as object), ...(it as object) })) : b;
    else if (k === "headerLogo" || k === "logo") base[k] = v === "emblem" ? "emblem" : Math.min(BV_VARIANTS.length, Math.max(1, Math.round(Number(v)) || 1));
    else if (typeof b === typeof v) base[k] = v;
  }
  if (kind === "guide") {
    // keep the saved order, and add any section missing from an older / edited file
    const saved = (Array.isArray(raw.sections) ? raw.sections : []) as Partial<GuideSection>[];
    const known = saved.filter((s) => GUIDE_SECTIONS.some((g) => g.id === s.id));
    const secs: GuideSection[] = known.map((s) => {
      const def = GUIDE_SECTIONS.find((g) => g.id === s.id)!;
      return { id: def.id, show: s.show !== false, title: typeof s.title === "string" ? s.title : def.title };
    });
    for (const g of GUIDE_SECTIONS) if (!secs.some((s) => s.id === g.id)) secs.push({ id: g.id, show: false, title: g.title });
    base.sections = secs;
  }
  return base as BvPage;
}

export function mergePages(raw: Record<string, unknown> | null, init: () => PagesData): PagesData {
  const base = init();
  if (!raw || !Array.isArray(raw.pages)) return base;
  const look = { ...base.look } as Record<string, unknown>;
  const rl = (raw.look ?? {}) as Record<string, unknown>;
  for (const [k, b] of Object.entries(base.look)) if (rl[k] !== undefined && (typeof rl[k] === typeof b || k === "headerLogo")) look[k] = rl[k];
  const pages = (raw.pages as Record<string, unknown>[])
    .map((p) => (p && typeof p === "object" ? mergePage(p) : null))
    .filter((p): p is BvPage => !!p)
    .slice(0, MAX_PAGES);
  return { look: look as PagesLook, pages: pages.length ? pages : base.pages };
}

/** Starting points of the two gallery templates. */
export const PRESETS = {
  steps: (): PagesData => ({ look: defaultLook(), pages: [stepsPage()] }),
  promo: (): PagesData => ({ look: defaultLook(), pages: [promoPage()] }),
  features: (): PagesData => ({ look: defaultLook(), pages: [featuresPage()] }),
  /** a cover followed by one content page, so the swipe button leads somewhere */
  cover: (): PagesData => ({ look: defaultLook(), pages: [coverPage(), stepsPage()] }),
  /** the page's first post: welcome cover, what we offer, farmers' friend, follow */
  /** caricature carousel: cover + three idea pages in different layouts; brand header / footer off */
  toon: (): PagesData => ({
    look: { ...defaultLook(), format: "feed", showHeader: false, showFooter: false, handle: "@bethlehemvalley" },
    pages: [
      toonCoverPage(),
      { ...toonIdeaPage("card"), number: "1" },
      { ...toonIdeaPage("split"), number: "2", topTitle: "", topSub: "" },
      { ...toonIdeaPage("card"), number: "3", itemStyle: "photo", topSub: "", showRow: true, row: [
        { icon: "leaf", text: "Point one" },
        { icon: "tag", text: "Point two" },
        { icon: "users", text: "Point three" },
        { icon: "basket", text: "Point four" },
      ] },
    ],
  }),
  welcome: (): PagesData => ({
    look: { ...defaultLook(), handle: "@bethlehemvalley" },
    pages: [
      {
        ...coverPage(),
        eyebrow: "WELCOME",
        eyebrowIcon: "leaf",
        heading: "Welcome to Bethlehem Valley",
        mlHeading: "ബെത്‌ലഹേം വാലിയിലേക്ക് സ്വാഗതം",
        photo: "/social/instagram/bethlehem-valley/pepper.webp",
        bannerHeight: 480,
        coversTitle: "WHAT THIS PAGE OFFERS",
        coversStyle: "cards",
        covers: [
          { icon: "sun", text: "Daily farm updates", ml: "ദിവസേനയുള്ള കൃഷി വിവരങ്ങൾ" },
          { icon: "users", text: "Farmers' experiences", ml: "കർഷകരുടെ അനുഭവങ്ങൾ" },
          { icon: "shield", text: "Pesticide guides", ml: "കീടനാശിനി വിവരങ്ങൾ" },
          { icon: "sprout", text: "Crops & maintenance", ml: "വിളകളും പരിപാലനവും" },
          { icon: "pepper", text: "Farming & plantation", ml: "കൃഷിയും തോട്ടവും" },
          { icon: "tool", text: "Tools & products", ml: "ഉപകരണങ്ങളും ഉൽപ്പന്നങ്ങളും" },
        ],
        body: "Your farmer's friend for practical tips, real experiences and simple guides, in English and Malayalam.",
        mlBody: "പ്രായോഗിക അറിവുകളും യഥാർത്ഥ അനുഭവങ്ങളുമായി കർഷകരുടെ സുഹൃത്ത്.",
      },
      {
        ...featuresPage(),
        category: "WHAT WE OFFER",
        categoryIcon: "star",
        heading: "What You'll Find Here",
        mlHeading: "ഇവിടെ നിങ്ങൾക്ക് ലഭിക്കുന്നത്",
        body: "Everything a farmer needs, in one place.",
        mlBody: "ഒരു കർഷകന് വേണ്ടതെല്ലാം ഒരിടത്ത്.",
        showPhoto: false,
        layout: "grid",
        features: [
          { icon: "sun", title: "Daily farm updates", text: "Tips, alerts and seasonal work, every day.", ml: "ദിവസേനയുള്ള കൃഷി വിവരങ്ങൾ" },
          { icon: "users", title: "Farmers' experiences", text: "Real stories and lessons from fellow farmers.", ml: "കർഷകരുടെ അനുഭവങ്ങൾ" },
          { icon: "shield", title: "Pesticide guides", text: "What to use, when to use, and how to stay safe.", ml: "കീടനാശിനി വിവരങ്ങൾ" },
          { icon: "sprout", title: "Crops & maintenance", text: "Care, nutrition and protection for your crops.", ml: "വിളകളും പരിപാലനവും" },
          { icon: "pepper", title: "Farming & plantation", text: "Pepper, spices and plantation know-how.", ml: "കൃഷിയും തോട്ടവും" },
          { icon: "tool", title: "Tools & products", text: "Useful instruments and products for the farm.", ml: "കാർഷിക ഉപകരണങ്ങളും ഉൽപ്പന്നങ്ങളും" },
        ],
        takeaway: "",
        mlTakeaway: "",
      },
      {
        ...featuresPage(),
        category: "FARMERS' FRIEND",
        categoryIcon: "users",
        heading: "Your Farmer's Friend",
        mlHeading: "കർഷകരുടെ സുഹൃത്ത്",
        body: "More than a page: a community where farmers learn from each other.",
        mlBody: "കർഷകർ പരസ്പരം പഠിക്കുന്ന ഒരു കൂട്ടായ്മ.",
        showPhoto: true,
        photo: "/social/instagram/bethlehem-valley/landscape.webp",
        photoSize: "s",
        layout: "list",
        features: [
          { icon: "chat", title: "Ask your doubts", text: "Comment or send us a message.", ml: "സംശയങ്ങൾ ചോദിക്കൂ" },
          { icon: "users", title: "Share your experience", text: "Your story can help another farmer.", ml: "നിങ്ങളുടെ അനുഭവം പങ്കുവെക്കൂ" },
          { icon: "lightbulb", title: "Learn together", text: "Simple, practical guides in English and Malayalam.", ml: "ഒരുമിച്ച് പഠിക്കാം" },
          { icon: "leaf", title: "Grow together", text: "Healthy plants, better harvests.", ml: "ഒരുമിച്ച് വളരാം" },
        ],
        takeaway: "",
        mlTakeaway: "",
      },
      followPage(),
    ],
  }),
  /** pesticide carousel: cover + overview + use / don't use + advantages & safety */
  pesticide: (): PagesData => ({
    look: defaultLook(),
    pages: [
      {
        ...coverPage(),
        eyebrow: "PESTICIDE GUIDE",
        eyebrowIcon: "shield",
        heading: "Product Name: What You Should Know",
        mlHeading: "ഉൽപ്പന്നത്തിന്റെ പേര്",
        covers: [
          { icon: "bug", text: "What it controls", ml: "" },
          { icon: "check", text: "When to use and when not to use", ml: "" },
          { icon: "drop", text: "Dosage and application", ml: "" },
          { icon: "alert", text: "Safety precautions", ml: "" },
        ],
      },
      guidePage(["title", "targets", "crops", "dosage", "disclaimer"]),
      guidePage(["title", "when", "whenNot", "disclaimer"]),
      guidePage(["title", "advantages", "safety", "disclaimer"]),
    ],
  }),
};
export type PresetId = keyof typeof PRESETS;

/** Words for file names: the first page's heading. */
export function pagesSlug(d: PagesData) {
  const p = d.pages[0];
  const s = String((p && ("heading" in p ? p.heading : "")) || "post")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return s || "post";
}
