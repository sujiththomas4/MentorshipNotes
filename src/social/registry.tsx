import type { ComponentType } from "react";
import { Instagram, Send, Twitter, Youtube, type LucideIcon } from "lucide-react";
import { CoverSlide } from "@/social/instagram/global-market/cover";
import { defaultData } from "@/social/instagram/global-market/data";
import { GlobalMarketEditor } from "@/social/instagram/global-market/editor";
import { SwingTradeArtwork } from "@/social/instagram/swing-trade/artwork";
import { exampleData as swingExample } from "@/social/instagram/swing-trade/data";
import { SwingTradeEditor } from "@/social/instagram/swing-trade/editor";
import type { Schedule } from "@/social/schedule";
import type { BrandId } from "@/branding/brands";
import { OptionSellingArtwork } from "@/social/instagram/option-selling/artwork";
import { exampleData as optionSellingExample } from "@/social/instagram/option-selling/data";
import { OptionSellingEditor } from "@/social/instagram/option-selling/editor";
import { Scaled } from "@/social/instagram/bethlehem-valley/shared";
import { FarmNotesArtwork } from "@/social/instagram/bethlehem-valley/farm-notes/artwork";
import { sampleData as farmNotesSample } from "@/social/instagram/bethlehem-valley/farm-notes/data";
import { FarmNotesEditor } from "@/social/instagram/bethlehem-valley/farm-notes/editor";
import { FarmTipArtwork } from "@/social/instagram/bethlehem-valley/farm-tip/artwork";
import { sampleData as farmTipSample } from "@/social/instagram/bethlehem-valley/farm-tip/data";
import { FarmTipEditor } from "@/social/instagram/bethlehem-valley/farm-tip/editor";
import { TipsListArtwork } from "@/social/instagram/bethlehem-valley/tips-list/artwork";
import { sampleData as tipsListSample } from "@/social/instagram/bethlehem-valley/tips-list/data";
import { TipsListEditor } from "@/social/instagram/bethlehem-valley/tips-list/editor";
import { IdeasCoverArtwork } from "@/social/instagram/bethlehem-valley/ideas-cover/artwork";
import { sampleData as ideasCoverSample } from "@/social/instagram/bethlehem-valley/ideas-cover/data";
import { IdeasCoverEditor } from "@/social/instagram/bethlehem-valley/ideas-cover/editor";
import { BvPageArtwork } from "@/social/instagram/bethlehem-valley/pages/artwork";
import { PRESETS } from "@/social/instagram/bethlehem-valley/pages/data";
import { BvPagesEditor } from "@/social/instagram/bethlehem-valley/pages/editor";

/*
 * Social media platforms and their post templates. To add a template: build its artwork +
 * editor (see instagram/global-market/) and list it under its platform here.
 */

export type SocialTemplate = {
  /** also the URL segment */
  id: string;
  title: string;
  description: string;
  size: { w: number; h: number; label: string };
  /** default posting days (editable in the app); note e.g. "weekly / occasional" */
  schedule: Schedule;
  /** which Instagram account / brand the template belongs to */
  brand: BrandId;
  Editor: ComponentType;
  /** a static preview for the gallery tile */
  Thumbnail: ComponentType;
};

export type SocialPlatform = {
  id: string;
  name: string;
  icon: LucideIcon;
  /** brand-ish gradient for the tile */
  gradient: string;
  available: boolean;
  templates: SocialTemplate[];
};

export const PLATFORMS: SocialPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    gradient: "linear-gradient(135deg, #feda75, #fa7e1e 30%, #d62976 60%, #962fbf 80%, #4f5bd5)",
    available: true,
    templates: [
      {
        id: "Instagram_GlobalMarket_All",
        title: "Instagram_GlobalMarket_All",
        description: "7-slide daily carousel: a global market sentiment cover plus one slide each for Dow, crude oil, dollar index, Gift Nifty, previous-day OI and pre-open.",
        size: { w: 1080, h: 1350, label: "1080 × 1350 · 4:5 portrait" },
        schedule: { days: [1, 2, 3, 4, 5] },
        brand: "indian-traders",
        Editor: GlobalMarketEditor,
        Thumbnail: () => <CoverSlide data={defaultData()} className="block h-auto w-full" />,
      },
      {
        id: "Instagram_SwingTrade",
        title: "Swing Trade",
        description: "Single swing-trade post: stock, BUY/SELL direction, entry, targets, stop loss, chart, key reasons and risk/reward.",
        size: { w: 1080, h: 1350, label: "1080 × 1350 · 4:5 portrait" },
        schedule: { days: [6, 0], note: "weekly / occasional" },
        brand: "indian-traders",
        Editor: SwingTradeEditor,
        Thumbnail: () => <SwingTradeArtwork data={swingExample()} className="block h-auto w-full" />,
      },
      {
        id: "Instagram_WeeklyOptionSelling",
        title: "Weekly Option Selling",
        description: "Gold & black option-selling post: 1–4 legs (BUY/SELL, strike, CE/PE, qty, price); Entry or Close mode, Close adds exit prices and the total P&L.",
        size: { w: 1080, h: 1350, label: "1080 × 1350 · 4:5 portrait" },
        schedule: { days: [1, 3] },
        brand: "indian-traders",
        Editor: OptionSellingEditor,
        Thumbnail: () => <OptionSellingArtwork data={optionSellingExample()} className="block h-auto w-full" />,
      },
      {
        id: "Instagram_BV_Caricature",
        title: "Caricature Ideas Carousel",
        description:
          "Content-first illustrated carousel: big two-colour Malayalam titles, numbered idea cards with icon / picture lists, a caricature farmer, tip box and icon row, on a light page with a small round logo, page counter and next arrow (no brand header / footer). Cover + idea pages in Card or Split layout; add as many as you need.",
        size: { w: 1080, h: 1350, label: "1080 × 1350 feed · or 1080 × 1920 story · multi-page" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: () => <BvPagesEditor preset="toon" />,
        Thumbnail: () => <PagesThumb preset="toon" />,
      },
      {
        id: "Instagram_BV_Welcome",
        title: "Page Introduction (Welcome)",
        description:
          "The page's first post: a welcome cover with what the page offers, 'What you'll find here' (daily updates, farmers' experiences, pesticides, crops & maintenance, farming & plantation, tools & products), 'Your farmer's friend', and a last page asking people to follow for daily updates. Ready-written in English and Malayalam; every page is editable. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed · 4 pages" },
        schedule: { days: [], note: "first post of the page" },
        brand: "bethlehem-valley",
        Editor: () => <BvPagesEditor preset="welcome" />,
        Thumbnail: () => <PagesThumb preset="welcome" />,
      },
      {
        id: "Instagram_BV_Cover",
        title: "Carousel Cover",
        description:
          "First slide of a carousel: banner title (on a photo, under a photo or plain), what the post covers (list, icon cards or chips), a description and a 'Swipe for more' button. Fonts, sizes, alignment and button style are adjustable. Multi-page: add the content pages after it. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed · multi-page" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: () => <BvPagesEditor preset="cover" />,
        Thumbnail: () => <PagesThumb preset="cover" />,
      },
      {
        id: "Instagram_BV_PesticideGuide",
        title: "Pesticide / Product Guide",
        description:
          "Everything about one pesticide or farm product: type badge, name, active ingredient, photo, what it controls, crops, when to use / when NOT to use, dosage & application, advantages, safety and a label disclaimer. Every section can be shown, hidden, reordered and renamed per page. Starts as a 4-page carousel with a cover. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed · multi-page" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: () => <BvPagesEditor preset="pesticide" />,
        Thumbnail: () => <PagesThumb preset="pesticide" page={1} />,
      },
      {
        id: "Instagram_BV_FarmTip",
        title: "Farm Tip",
        description:
          "Bilingual (English / Malayalam) farm tip: centered, classic or compact header with emblem and script slogan, category badge, text, photo, 4-feature row and a landscape band with the closing line. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: FarmTipEditor,
        Thumbnail: () => (
          <Scaled w={1080} h={1920}>
            <FarmTipArtwork data={farmTipSample()} />
          </Scaled>
        ),
      },
      {
        id: "Instagram_BV_StepByStep",
        title: "Step-by-Step Guide",
        description:
          "Bilingual step-by-step instructions or bullet points (1, 2, 3 / bullets / checks), with an optional photo and note box. Multi-page: add pages and pick Steps, Promotion or Farm tip for each. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed · multi-page" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: () => <BvPagesEditor preset="steps" />,
        Thumbnail: () => <PagesThumb preset="steps" />,
      },
      {
        id: "Instagram_BV_Promotion",
        title: "Property & Tool Promotion",
        description:
          "Promote a property or tool: photo with ribbon and price, highlights, advantages and a contact card (phone, WhatsApp, address). Multi-page: add pages and pick Promotion, Steps or Farm tip for each. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed · multi-page" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: () => <BvPagesEditor preset="promo" />,
        Thumbnail: () => <PagesThumb preset="promo" />,
      },
      {
        id: "Instagram_BV_Features",
        title: "Features & Advantages",
        description:
          "Explain a product, tool or method through its advantages (no price or seller): heading, what it is, optional photo, up to 6 feature cards with icons, and a takeaway line. Multi-page: add pages and pick any template for each. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed · multi-page" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: () => <BvPagesEditor preset="features" />,
        Thumbnail: () => <PagesThumb preset="features" />,
      },
      {
        id: "Instagram_BV_FarmNotes",
        title: "Farm Notes (Classic)",
        description:
          "The first bilingual farm post design: logo, name and slogan header, category badge, text, photo or pepper-vine illustration, 4-feature row, closing line and footer. Story or feed.",
        size: { w: 1080, h: 1920, label: "1080 × 1920 story · or 1080 × 1350 feed" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: FarmNotesEditor,
        Thumbnail: () => (
          <Scaled w={1080} h={1920}>
            <FarmNotesArtwork data={farmNotesSample()} />
          </Scaled>
        ),
      },
      {
        id: "Instagram_BV_TipsList",
        title: "Tips List",
        description:
          "Malayalam numbered tips post: logo, number badge, two-line title, 3–6 tip cards with icons, a callout line, a farmer cut-out over a faded photo and a four-benefit footer band with the website.",
        size: { w: 1080, h: 1350, label: "1080 × 1350 feed" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: TipsListEditor,
        Thumbnail: () => (
          <Scaled w={1080} h={1350}>
            <TipsListArtwork data={tipsListSample()} />
          </Scaled>
        ),
      },
      {
        id: "Instagram_BV_IdeasCover",
        title: "Ideas Cover",
        description:
          "Malayalam carousel cover: logo, slide number, three-line title with a leaf, divider, two-line subtitle, a square number badge, a white panel with four feature icons, pager dots and the handle, and a farmer cut-out over a farm photo on the right.",
        size: { w: 1080, h: 1350, label: "1080 × 1350 feed" },
        schedule: { days: [], note: "posting days not set yet" },
        brand: "bethlehem-valley",
        Editor: IdeasCoverEditor,
        Thumbnail: () => (
          <Scaled w={1080} h={1350}>
            <IdeasCoverArtwork data={ideasCoverSample()} />
          </Scaled>
        ),
      },
    ],
  },
  { id: "youtube", name: "YouTube", icon: Youtube, gradient: "linear-gradient(135deg, #ff4e45, #c4302b)", available: false, templates: [] },
  { id: "x", name: "X (Twitter)", icon: Twitter, gradient: "linear-gradient(135deg, #3a3a3a, #000000)", available: false, templates: [] },
  { id: "telegram", name: "Telegram", icon: Send, gradient: "linear-gradient(135deg, #37aee2, #1e96c8)", available: false, templates: [] },
];

/** Gallery preview of a multi-page template: its first page, made once. */
const THUMBS = { steps: PRESETS.steps(), promo: PRESETS.promo(), features: PRESETS.features(), cover: PRESETS.cover(), pesticide: PRESETS.pesticide(), welcome: PRESETS.welcome(), toon: PRESETS.toon() };
/** `page` picks which page to preview (default the first). */
function PagesThumb({ preset, page = 0 }: { preset: keyof typeof THUMBS; page?: number }) {
  const d = THUMBS[preset];
  return (
    <Scaled w={1080} h={d.look.format === "feed" ? 1350 : 1920}>
      <BvPageArtwork look={d.look} page={d.pages[page] ?? d.pages[0]} n={1} total={1} />
    </Scaled>
  );
}

export const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);
export const getTemplate = (platform: string, id: string) => getPlatform(platform)?.templates.find((t) => t.id === id);
