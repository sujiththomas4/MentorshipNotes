import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { toBlob, toPng } from "html-to-image";
import fontCss from "./fonts.css?raw";
import "./fonts.css";

/*
 * Shared pieces for the Bethlehem Valley Instagram posts, ported from the two HTML templates in
 * "src/sample htmls/". Unlike the Indian Traders SVG artwork, these posts are HTML laid out by
 * the browser (bilingual paragraphs that wrap and shrink to fit), exported with html-to-image
 * exactly as the HTML templates did. Fonts are the files embedded in those templates
 * (public/social/instagram/bethlehem-valley/fonts), renamed "BV …" so they never clash with
 * the app's own fonts.
 */

export const BV_ART = "/social/instagram/bethlehem-valley";

export type BvFormat = "story" | "feed";
export const BV_FORMATS: Record<BvFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story 1080 × 1920" },
  feed: { w: 1080, h: 1350, label: "Feed 1080 × 1350" },
};

export type BvFeature = { icon: string; title: string; ml: string };

/**
 * Colour themes. "forest" is the templates' own dark green; the others only override the
 * colour variables (class .theme-<id> on the post), so layouts stay identical.
 */
export type BvTheme = "forest" | "harvest";
export const BV_THEMES: { id: BvTheme; label: string; swatch: [string, string, string] }[] = [
  { id: "forest", label: "Forest Green", swatch: ["#0A3A20", "#E9C35A", "#F5F2E4"] },
  { id: "harvest", label: "Harvest Brown", swatch: ["#4A2A17", "#E9C35A", "#F6EEE2"] },
];
export const themeClass = (t: BvTheme | undefined) => (t && t !== "forest" ? ` theme-${t}` : "");

/**
 * Theme colours for the few SVG shapes drawn with fixed colours (header / footer waves, brush).
 * These use real values, not CSS variables: the PNG export does not resolve variables inside SVG fills.
 */
export const BV_THEME_COLORS: Record<BvTheme, { dark: string; cream: string; brush: string }> = {
  forest: { dark: "#0A3A20", cream: "#F5F2E4", brush: "#0f3f22" },
  harvest: { dark: "#4A2A17", cream: "#F6EEE2", brush: "#3a2112" },
};
export const themeColors = (t: BvTheme | undefined) => BV_THEME_COLORS[t ?? "forest"] ?? BV_THEME_COLORS.forest;

/** Icon pack from the templates (64 px grid, 4 px stroke, currentColor). */
const ICONS: Record<string, string> = {
  lightbulb:
    '<path d="M20 27c0-9 7-16 16-16s16 7 16 16c0 6-3 10-7 14-2 2-3 4-3 7H30c0-3-1-5-3-7-4-4-7-8-7-14Z" stroke="currentColor" stroke-width="4"/><path d="M29 53h14M31 59h10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  leaf: '<path d="M51 10C30 11 14 21 13 40c13 7 28 0 34-13 3-7 4-13 4-17Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M13 53c8-14 18-24 31-33" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  shield:
    '<path d="M32 7 52 15v15c0 13-8 22-20 27C20 52 12 43 12 30V15L32 7Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="m22 32 7 7 14-15" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
  seedling:
    '<path d="M32 55V28" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M32 31c-10-1-17-7-18-17 10-1 18 4 18 17Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M32 39c2-10 9-15 19-15 0 10-6 16-19 15Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M18 55h28" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  sprout:
    '<path d="M32 57V34" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M32 35C20 35 13 28 13 18c12 0 19 6 19 17Z" stroke="currentColor" stroke-width="4"/><path d="M32 39c0-11 7-18 19-18 0 11-7 18-19 18Z" stroke="currentColor" stroke-width="4"/>',
  instagram:
    '<rect x="9" y="9" width="46" height="46" rx="13" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="32" r="11" stroke="currentColor" stroke-width="4"/><circle cx="46" cy="18" r="3" fill="currentColor"/>',
  bug: '<ellipse cx="32" cy="37" rx="12" ry="16" stroke="currentColor" stroke-width="4"/><path d="M32 21v32M20 30H10M44 30h10M20 42H11M44 42h9M24 22l-6-8M40 22l6-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="18" r="5" stroke="currentColor" stroke-width="4"/>',
  drop: '<path d="M32 8C24 21 15 30 15 40a17 17 0 0 0 34 0C49 30 40 21 32 8Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M24 42a8 8 0 0 0 8 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  sun: '<circle cx="32" cy="32" r="11" stroke="currentColor" stroke-width="4"/><path d="M32 7v7M32 50v7M7 32h7M50 32h7M14 14l5 5M45 45l5 5M14 50l5-5M45 19l5-5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  clock: '<circle cx="32" cy="32" r="23" stroke="currentColor" stroke-width="4"/><path d="M32 18v15l10 7" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
  flask:
    '<path d="M25 8h14M27 8v17L13 50a5 5 0 0 0 4 7h30a5 5 0 0 0 4-7L37 25V8" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M19 42h26" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  scissors:
    '<circle cx="18" cy="46" r="8" stroke="currentColor" stroke-width="4"/><circle cx="46" cy="46" r="8" stroke="currentColor" stroke-width="4"/><path d="M23 40 46 8M41 40 18 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  basket:
    '<path d="M8 26h48l-6 26H14L8 26Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M20 26 28 10M44 26 36 10M24 34v10M32 34v10M40 34v10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  star: '<path d="m32 8 7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 25l16-2 7-15Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  alert:
    '<path d="M32 8 58 54H6L32 8Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M32 25v14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="46" r="2.8" fill="currentColor"/>',
  pepper:
    '<path d="M32 6c0 8-2 12-2 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
    [18, 26, 34, 42, 50].map((y, i) => `<circle cx="${i % 2 ? 36 : 28}" cy="${y}" r="4.6" stroke="currentColor" stroke-width="3.2"/>`).join(""),
  farm: '<path d="M8 30 32 12l24 18M14 26v28h36V26" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M27 54V40h10v14" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  // added for the Steps and Promotion pages, drawn in the same 64 px / 4 px-stroke style
  cross: '<path d="M18 18l28 28M46 18 18 46" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
  heart: '<path d="M32 54S9 40 9 24a12 12 0 0 1 23-5 12 12 0 0 1 23 5c0 16-23 30-23 30Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  bookmark: '<path d="M17 9h30v46L32 44 17 55V9Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  send: '<path d="M56 8 8 28l20 8 8 20L56 8Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M28 36 56 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  bell: '<path d="M16 44V29a16 16 0 0 1 32 0v15l5 6H11l5-6Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M26 54a6 6 0 0 0 12 0" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  userplus:
    '<circle cx="26" cy="22" r="10" stroke="currentColor" stroke-width="4"/><path d="M8 54c0-10 8-17 18-17s18 7 18 17" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M50 18v16M42 26h16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  users:
    '<circle cx="24" cy="22" r="9" stroke="currentColor" stroke-width="4"/><circle cx="44" cy="25" r="7" stroke="currentColor" stroke-width="4"/><path d="M7 52c0-9 7-15 17-15s17 6 17 15M40 38c9 0 16 5 16 14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  chat: '<path d="M10 14h44v30H28L16 54V44h-6V14Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M20 26h24M20 34h16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  info: '<circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="4"/><path d="M32 29v16" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="20" r="3.2" fill="currentColor"/>',
  arrow: '<path d="M10 32h42M36 16l16 16-16 16" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="m14 33 12 12 24-26" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  phone:
    '<path d="M20 8h-6a5 5 0 0 0-5 5c0 23 19 42 42 42a5 5 0 0 0 5-5v-6l-12-5-6 6c-8-4-15-11-19-19l6-6-5-12Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  whatsapp:
    '<path d="M32 7a25 25 0 0 0-21 38L8 57l12-3A25 25 0 1 0 32 7Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M24 20c-3 1-4 4-3 7 2 7 9 14 16 16 3 1 6 0 7-3l-1-3-6-2-3 3c-3-1-6-4-7-7l3-3-2-6-4-2Z" fill="currentColor"/>',
  pin: '<path d="M32 58S14 40 14 26a18 18 0 0 1 36 0c0 14-18 32-18 32Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="26" r="7" stroke="currentColor" stroke-width="4"/>',
  mail: '<rect x="8" y="14" width="48" height="36" rx="6" stroke="currentColor" stroke-width="4"/><path d="m10 18 22 17 22-17" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  globe:
    '<circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="4"/><path d="M8 32h48M32 8c8 7 11 15 11 24s-3 17-11 24c-8-7-11-15-11-24S24 15 32 8Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  home: '<path d="M8 30 32 10l24 20" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 25v29h34V25" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M27 54V39h10v15" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  tool: '<path d="M40 8a14 14 0 0 0-13 19L9 45a6 6 0 0 0 9 9l18-18a14 14 0 0 0 19-13l-8 8-8-2-2-8 8-8c-1-2-3-3-5-3Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>',
  tag: '<path d="M8 12v18l26 26 22-22L30 8H12a4 4 0 0 0-4 4Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="21" cy="21" r="5" stroke="currentColor" stroke-width="4"/>',
  area: '<rect x="10" y="10" width="44" height="44" rx="4" stroke="currentColor" stroke-width="4" stroke-dasharray="7 5"/><path d="M20 44 44 20M34 20h10v10M30 44H20V34" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
};

/** Icons offered in the editor (Instagram is footer-only). */
export const ICON_NAMES: Record<string, string> = {
  lightbulb: "Light bulb",
  leaf: "Leaf",
  shield: "Shield",
  seedling: "Seedling",
  sprout: "Sprout",
  pepper: "Pepper spike",
  bug: "Pest",
  drop: "Water drop",
  sun: "Sun",
  clock: "Clock",
  flask: "Fertilizer",
  scissors: "Pruning",
  basket: "Harvest",
  star: "Best variety",
  alert: "Alert",
  farm: "Farm",
  check: "Check",
  home: "Home / property",
  tool: "Tool",
  tag: "Price tag",
  area: "Area / size",
  pin: "Location",
  phone: "Phone",
  whatsapp: "WhatsApp",
  mail: "Email",
  globe: "Website",
  users: "Community",
  chat: "Questions / chat",
  heart: "Heart / like",
  bookmark: "Save",
  send: "Share",
  bell: "Notifications",
  userplus: "Follow",
};

/** Suggested categories; picking one also sets its badge icon. */
export const CATEGORIES: [string, string][] = [
  ["TODAY'S TIP", "lightbulb"],
  ["PEPPER PROTECTION", "shield"],
  ["FERTILIZER GUIDE", "flask"],
  ["BASE VALAM", "sprout"],
  ["BEST TIME", "clock"],
  ["BEST VARIETY", "star"],
  ["PEST ALERT", "bug"],
  ["DISEASE WATCH", "alert"],
  ["WATERING TIP", "drop"],
  ["PRUNING TIP", "scissors"],
  ["HARVEST TIP", "basket"],
  ["FARM UPDATE", "farm"],
  ["PLANTATION UPDATE", "pepper"],
  ["STEP BY STEP", "check"],
  ["HOW TO", "lightbulb"],
];

export function BvIcon({ name, className }: { name: string; className?: string }) {
  return <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] ?? ICONS.leaf }} />;
}

/** Deterministic random numbers, so the drawn decorations look the same on every render. */
export function seeded(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), (h = Math.imul(h ^ (h >>> 13), 3266489909)), (h ^= h >>> 16) >>> 0) / 4294967296;
}

/** Faint outline-leaf pattern behind the header. */
export const LEAF_PATTERN = (() => {
  let p = "";
  const r = seeded("pat");
  for (let i = 0; i < 22; i++) {
    const x = r() * 1080,
      y = r() * 470,
      a = r() * 360,
      s = 0.6 + r() * 0.9;
    p += `<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${a.toFixed(0)}) scale(${s.toFixed(2)})" d="M0 0C-18-6-26-28-12-45C-6-52 0-55 0-64C0-55 6-52 12-45C26-28 18-6 0 0Z M0 -2V-60" fill="none" stroke="#fff" stroke-width="2"/>`;
  }
  return p;
})();

export function LeafPattern() {
  return <svg className="leafpat" viewBox="0 0 1080 470" preserveAspectRatio="xMidYMid slice" aria-hidden="true" dangerouslySetInnerHTML={{ __html: LEAF_PATTERN }} />;
}

/** Text with Enter = line break, as in the templates. */
export function Lines({ text }: { text: string }) {
  const parts = String(text ?? "").split("\n");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {p}
        </span>
      ))}
    </>
  );
}

/** Photo placed with zoom and focus point, as the templates' photo sliders do. */
export function PlacedPhoto({ src, zoom, x, y }: { src: string; zoom: number; x: number; y: number }) {
  return <img src={src} alt="" style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom / 100})`, transformOrigin: `${x}% ${y}%` }} />;
}

export type FitResult = { k: number; overflow: boolean };

/**
 * The templates' auto-fit, run after every render and again when fonts finish loading:
 * long brand names shrink (min 28 px), and the heading + text block scales down (--k)
 * until it fits its column, to at least `minK`.
 */
export function useAutoFit(root: RefObject<HTMLElement | null>, deps: unknown[], minK: number, onFit?: (r: FitResult) => void) {
  const cb = useRef(onFit);
  cb.current = onFit;
  useLayoutEffect(() => {
    let alive = true;
    const run = () => {
      const el = root.current;
      if (!el || !alive) return;
      el.querySelectorAll<HTMLElement>(".bname").forEach((b) => {
        b.style.fontSize = "";
        let f = parseFloat(getComputedStyle(b).fontSize);
        while (b.scrollWidth > b.clientWidth + 1 && f > 28) b.style.fontSize = `${--f}px`;
      });
      const c = el.querySelector<HTMLElement>(".copy");
      if (!c) return;
      let k = 1;
      c.style.setProperty("--k", "1");
      while (c.scrollHeight > c.clientHeight + 1 && k > minK) {
        k -= 0.02;
        c.style.setProperty("--k", k.toFixed(2));
      }
      cb.current?.({ k, overflow: c.scrollHeight > c.clientHeight + 1 });
    };
    run();
    document.fonts?.ready.then(run);
    document.fonts?.addEventListener("loadingdone", run);
    return () => {
      alive = false;
      document.fonts?.removeEventListener("loadingdone", run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Fit message for the editor, worded as in the templates. */
export function fitMessage(f: FitResult | null) {
  if (!f) return null;
  if (f.overflow) return { warn: true, text: "The text is too long to fit. Shorten it and move the rest to the caption." };
  if (f.k < 0.98) return { warn: false, text: `Text reduced to ${Math.round(f.k * 100)}% to fit.` };
  return null;
}

/** Shows a fixed-size artwork (w × h px) scaled down to the container's width. */
export function Scaled({ w, h, className, children }: { w: number; h: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setS(el.clientWidth / w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className={className} style={{ position: "relative", width: "100%", aspectRatio: `${w} / ${h}`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `scale(${s})`, visibility: s ? "visible" : "hidden" }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- export ---------- */

let embedded: Promise<string> | null = null;

/** fonts.css with every font file inlined, so the PNG uses the right fonts. */
function embeddedFontCss() {
  embedded ??= (async () => {
    let css = fontCss;
    const urls = [...new Set([...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]))];
    const data = await Promise.all(
      urls.map(async (u) => {
        const blob = await (await fetch(u)).blob();
        return await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      }),
    );
    urls.forEach((u, i) => (css = css.split(u).join(data[i])));
    return css;
  })();
  return embedded;
}

/** Download the post element as a PNG at its real size (1080 × 1920 or 1080 × 1350). */
export async function downloadBvPng(node: HTMLElement, width: number, height: number, filename: string) {
  await document.fonts.ready;
  const url = await toPng(node, { width, height, pixelRatio: 1, cacheBust: false, fontEmbedCSS: await embeddedFontCss() });
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
}

/** The post element as a PNG blob at its real size (for saving several pages at once). */
export async function bvPngBlob(node: HTMLElement, width: number, height: number) {
  await document.fonts.ready;
  const blob = await toBlob(node, { width, height, pixelRatio: 1, cacheBust: false, fontEmbedCSS: await embeddedFontCss() });
  if (!blob) throw new Error("PNG export failed");
  return blob;
}

/** "bethlehem-valley_pepper-protection_1080x1920_2026-09-25", as the templates name files. */
export function bvFileBase(category: string, format: BvFormat) {
  const slug = String(category || "post")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const d = new Date();
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `bethlehem-valley_${slug || "post"}_${format === "feed" ? "1080x1350" : "1080x1920"}_${day}`;
}
