import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check, Field, Panel, Seg, inputCls, type Setter } from "./editor-kit";
import "./brand-title.css";

/*
 * "Bethlehem Valley" name beside the logo, for the templates that only had the logo
 * (Ideas Cover, Tips List). Several styles; the text shrinks to fit the space next to the logo.
 */

export type BrandTitleStyle = "off" | "classic" | "script" | "bold" | "ribbon" | "stacked" | "malayalam" | "modern";
export type BrandTitleTone = "forest" | "gold" | "white";

export type BrandTitle = {
  style: BrandTitleStyle;
  name1: string;
  name2: string;
  mlName: string;
  tagline: string;
  showTagline: boolean;
  tone: BrandTitleTone;
  /** 70–130 (%) */
  size: number;
};

export const BRAND_TITLE_STYLES: [BrandTitleStyle, string][] = [
  ["off", "None"],
  ["classic", "Classic serif"],
  ["script", "Script"],
  ["bold", "Bold rounded"],
  ["ribbon", "Ribbon"],
  ["stacked", "Stacked caps"],
  ["malayalam", "Malayalam"],
  ["modern", "Modern sans"],
];

export const BRAND_TITLE_TONES: [BrandTitleTone, string][] = [
  ["forest", "Green"],
  ["gold", "Gold"],
  ["white", "White (on photos)"],
];

export function defaultBrandTitle(style: BrandTitleStyle = "classic"): BrandTitle {
  return { style, name1: "Bethlehem", name2: "Valley", mlName: "ബെത്‌ലഹേം വാലി", tagline: "FARM & PLANTATION", showTagline: true, tone: "forest", size: 100 };
}

/** Saved value → full BrandTitle (missing = the default). */
export function mergeBrandTitle(raw: unknown, base = defaultBrandTitle()): BrandTitle {
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Record<keyof BrandTitle, unknown>>;
  const str = (k: "name1" | "name2" | "mlName" | "tagline") => (typeof r[k] === "string" ? (r[k] as string) : base[k]);
  const size = Number(r.size);
  return {
    style: BRAND_TITLE_STYLES.some(([v]) => v === r.style) ? (r.style as BrandTitleStyle) : base.style,
    name1: str("name1"),
    name2: str("name2"),
    mlName: str("mlName"),
    tagline: str("tagline"),
    showTagline: typeof r.showTagline === "boolean" ? r.showTagline : base.showTagline,
    tone: BRAND_TITLE_TONES.some(([v]) => v === r.tone) ? (r.tone as BrandTitleTone) : base.tone,
    size: Number.isFinite(size) ? Math.min(130, Math.max(70, size)) : base.size,
  };
}

/** Gold brush swoosh under the script style. */
const Swoosh = () => (
  <svg className="swoosh" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
    <path d="M4 18C80 6 190 2 296 10C200 8 110 12 20 22Z" />
  </svg>
);

/**
 * The name, placed in a box (absolute, in artwork pixels) next to the logo. It is laid out at
 * its natural size and scaled down (never up) to fit the box, anchored at the left middle.
 */
export function BrandTitleView({ t, box }: { t: BrandTitle; box: { left: number; top: number; width: number; height: number } }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let alive = true;
    const fit = () => {
      const o = outer.current;
      const i = inner.current;
      if (!o || !i || !alive) return;
      const k = Math.min(1, o.clientWidth / Math.max(1, i.offsetWidth), o.clientHeight / Math.max(1, i.offsetHeight));
      i.style.transform = `translateY(-50%) scale(${k.toFixed(3)})`;
    };
    fit();
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => {
      alive = false;
      document.fonts?.removeEventListener("loadingdone", fit);
    };
  }, [t]);

  if (t.style === "off") return null;
  return (
    <div ref={outer} className={cn("bvbt", `s-${t.style}`, `t-${t.tone}`)} style={{ ...box, position: "absolute" }}>
      <div ref={inner} className="in" style={{ fontSize: `${t.size / 100}em` }}>
        {titleBody(t)}
      </div>
    </div>
  );
}

/**
 * The name at its natural size in the page flow (no fitting box), for layouts that place it
 * themselves: `align` sets the text alignment (e.g. right when the name sits left of the logo).
 */
export function BrandTitleInline({ t, align = "left", className, style }: { t: BrandTitle; align?: "left" | "center" | "right"; className?: string; style?: CSSProperties }) {
  if (t.style === "off") return null;
  return (
    <div className={cn("bvbt flow", `s-${t.style}`, `t-${t.tone}`, `a-${align}`, className)} style={style}>
      <div className="in" style={{ fontSize: `${t.size / 100}em` }}>
        {titleBody(t)}
      </div>
    </div>
  );
}

function titleBody(t: BrandTitle): ReactNode {
  const tag = t.showTagline && t.tagline.trim() ? t.tagline : "";
  const full = [t.name1, t.name2].filter((s) => s.trim()).join(" ");
  let body: ReactNode = null;
  switch (t.style) {
    case "classic":
      body = (
        <>
          <div className="n1 serif">{t.name1}</div>
          {t.name2 && (
            <div className="n2 rule">
              <i />
              <span>{t.name2}</span>
              <i />
            </div>
          )}
          {tag && <div className="tg">{tag}</div>}
        </>
      );
      break;
    case "script":
      body = (
        <>
          <div className="n1 script">{full}</div>
          <Swoosh />
          {tag && <div className="tg">{tag}</div>}
        </>
      );
      break;
    case "bold":
      body = (
        <>
          <div className="n1 round">{t.name1}</div>
          {t.name2 && <div className="n2 round">{t.name2}</div>}
          {tag && <div className="tg">{tag}</div>}
        </>
      );
      break;
    case "ribbon":
      body = (
        <>
          <div className="pill">{full}</div>
          {tag && <div className="tg">{tag}</div>}
        </>
      );
      break;
    case "stacked":
      body = (
        <div className="bar">
          <div className="n1">{t.name1}</div>
          {t.name2 && <div className="n2">{t.name2}</div>}
          {tag && <div className="tg">{tag}</div>}
        </div>
      );
      break;
    case "modern":
      body = (
        <>
          <div className="n1">{full}</div>
          {tag && <div className="tg">{tag}</div>}
        </>
      );
      break;
    case "malayalam":
      body = (
        <>
          <div className="n1 round" lang="ml">
            {t.mlName}
          </div>
          <div className="n2 spaced">{full}</div>
          {tag && <div className="tg">{tag}</div>}
        </>
      );
      break;
  }
  return body;
}

/** Editor panel for a `brandTitle` field. */
export function BrandTitlePanel<T extends { brandTitle: BrandTitle }>({ data, set }: { data: T; set: Setter<T> }) {
  const t = data.brandTitle;
  const up = (p: Partial<BrandTitle>) => set("brandTitle", { ...t, ...p } as T["brandTitle"]);
  return (
    <Panel title="Brand name" note="“Bethlehem Valley” beside the logo. Pick a style; the name shrinks to fit the space.">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {BRAND_TITLE_STYLES.map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => up({ style: v })}
              aria-pressed={t.style === v}
              className={cn("rounded-lg border px-3 py-1.5 text-sm", t.style === v ? "border-[#0A3A20] bg-[#0A3A20] text-white" : "border-border bg-card hover:bg-secondary")}
            >
              {label}
            </button>
          ))}
        </div>
        {t.style !== "off" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name line 1">
                <input value={t.name1} onChange={(e) => up({ name1: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Name line 2">
                <input value={t.name2} onChange={(e) => up({ name2: e.target.value })} className={inputCls} />
              </Field>
              {t.style === "malayalam" && (
                <Field label="Malayalam name">
                  <input value={t.mlName} onChange={(e) => up({ mlName: e.target.value })} lang="ml" className={inputCls} />
                </Field>
              )}
              <Field label="Tagline">
                <input value={t.tagline} onChange={(e) => up({ tagline: e.target.value })} className={inputCls} disabled={!t.showTagline} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Seg value={t.tone} onChange={(v) => up({ tone: v })} options={BRAND_TITLE_TONES} />
              <Check checked={t.showTagline} onChange={(v) => up({ showTagline: v })}>
                Show tagline
              </Check>
            </div>
            <Field label={`Size (${t.size}%)`}>
              <input type="range" min={70} max={130} value={t.size} onChange={(e) => up({ size: Number(e.target.value) })} className="w-full accent-[#0A3A20]" />
            </Field>
          </>
        )}
      </div>
    </Panel>
  );
}
