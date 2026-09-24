import type { ComponentType } from "react";
import { Instagram, Send, Twitter, Youtube, type LucideIcon } from "lucide-react";
import { CoverSlide } from "@/social/instagram/global-market/cover";
import { defaultData } from "@/social/instagram/global-market/data";
import { GlobalMarketEditor } from "@/social/instagram/global-market/editor";

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
        Editor: GlobalMarketEditor,
        Thumbnail: () => <CoverSlide data={defaultData()} className="block h-auto w-full" />,
      },
    ],
  },
  { id: "youtube", name: "YouTube", icon: Youtube, gradient: "linear-gradient(135deg, #ff4e45, #c4302b)", available: false, templates: [] },
  { id: "x", name: "X (Twitter)", icon: Twitter, gradient: "linear-gradient(135deg, #3a3a3a, #000000)", available: false, templates: [] },
  { id: "telegram", name: "Telegram", icon: Send, gradient: "linear-gradient(135deg, #37aee2, #1e96c8)", available: false, templates: [] },
];

export const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);
export const getTemplate = (platform: string, id: string) => getPlatform(platform)?.templates.find((t) => t.id === id);
