/*
 * "Format & layout" for the SVG templates (Indian Traders): feed 1080 × 1350 or story
 * 1080 × 1920, header / footer on or off, and a colour theme. The artwork is drawn on the
 * feed coordinates; `igSpread` says how far to move each part so the same drawing fills the
 * story height (extra space shared out between the sections) or the space a hidden header /
 * footer leaves.
 */

export type IgFormat = "feed" | "story";
export type IgLayout = { format: IgFormat; showHeader: boolean; showFooter: boolean; theme: string };

export const IG_FORMATS: Record<IgFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story 1080 × 1920 (9:16)" },
  feed: { w: 1080, h: 1350, label: "Feed 1080 × 1350 (4:5)" },
};

export const igH = (l: Pick<IgLayout, "format"> | undefined) => IG_FORMATS[l?.format === "story" ? "story" : "feed"].h;

export type IgTheme = { id: string; label: string; swatch: string[] };

export function defaultLayout(theme: string): IgLayout {
  return { format: "feed", showHeader: true, showFooter: true, theme };
}

export function mergeLayout(raw: unknown, base: IgLayout, themes: IgTheme[]): IgLayout {
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Record<keyof IgLayout, unknown>>;
  return {
    format: r.format === "story" || r.format === "feed" ? r.format : base.format,
    showHeader: typeof r.showHeader === "boolean" ? r.showHeader : base.showHeader,
    showFooter: typeof r.showFooter === "boolean" ? r.showFooter : base.showFooter,
    theme: themes.some((t) => t.id === r.theme) ? (r.theme as string) : base.theme,
  };
}

const EDGE = 44;

/**
 * Where things go on the chosen canvas. The feed drawing has its header above `headerEnd`,
 * its footer from `footerStart` down, and the body between; `cuts` split the body into
 * sections (y values on the feed drawing). Returns the canvas height, the footer's shift and
 * each section's shift (section i = between cuts[i-1] and cuts[i]).
 * Feed with header and footer on: every shift is 0, the drawing is unchanged.
 */
export function igSpread(l: IgLayout, headerEnd: number, footerStart: number, cuts: number[] = []) {
  const H = igH(l);
  const top = l.showHeader ? headerEnd : EDGE;
  const bottom = l.showFooter ? H - (1350 - footerStart) : H - EDGE;
  const extra = bottom - top - (footerStart - headerEnd);
  const gaps = cuts.length + 2;
  const each = extra / gaps;
  const dy = (i: number) => top - headerEnd + each * (i + 1);
  return { H, footerDy: H - 1350, dy, section: (y: number) => dy(cuts.filter((c) => y >= c).length) };
}
