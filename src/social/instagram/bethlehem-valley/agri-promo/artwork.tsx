import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type CSSProperties } from "react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { BrandTitleInline } from "../brand-title";
import { BvIcon, Lines, useAutoFit, type FitResult } from "../shared";
import type { AgriPromoData, PhotoFit } from "./data";
import "./artwork.css";

/*
 * Agri Promotion poster (agriculture_svg_master_template.md), laid out in HTML like the other
 * Bethlehem Valley posts so the text wraps and shrinks to fit. The spec's 1024 × 1536 artboard
 * is scaled to 1080 wide; feed (1350) and story (1920) keep the same zones, the right column
 * spreads its blocks over the height. SVG colours are real values (the PNG export does not
 * resolve CSS variables inside SVG).
 */

/** Spec colour tokens (section 2). */
export const AGRI = {
  forest900: "#063F25",
  forest800: "#07552D",
  forest700: "#0B6B35",
  leaf600: "#319B22",
  leaf500: "#55B52A",
  lime400: "#B7E51A",
  yellow400: "#FFD21A",
  yellow500: "#F4BE00",
  cream: "#F7F8E9",
  ink: "#123C2C",
  muted: "#587066",
  line: "#A9D79A",
};

/** Icons added for this poster (64 px grid, currentColor strokes, like the BV icon pack). */
const AGRI_ICONS: Record<string, string> = {
  growth:
    '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 56h48"/><path d="M16 50V40M28 50V32M40 50V26" stroke-width="7"/><path d="M12 30 26 19l9 6 17-15"/><path d="M43 10h9v9"/></g>',
  expert:
    '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="21" r="11"/><path d="M11 56c0-12 9-21 21-21s21 9 21 21"/><path d="M26 36l6 8 6-8"/></g>',
  hen:
    '<g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 33c0 12 8 20 20 20s18-8 17-20"/><path d="M13 33c-4-8-2-17 5-21 1 8 5 13 12 15"/><path d="M50 33c0-7-4-11-4-17 0-5 3-8 7-8 3 0 5 3 5 6l4 2-4 2c-1 5-4 9-8 15"/><path d="M50 8c0-3 3-4 4-2 1-3 4-2 3 1"/><path d="M25 37c4 6 12 6 16 0"/><path d="M29 53v6M37 53v6M26 59h6M34 59h6"/></g><circle cx="53" cy="13" r="1.8" fill="currentColor"/>',
  cow:
    '<g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 22c0-6 5-10 11-10s11 4 11 10v16c0 9-5 15-11 15s-11-6-11-15z"/><path d="M21 22c-6 0-10-2-12-6 4-2 8-2 12 1M43 22c6 0 10-2 12-6-4-2-8-2-12 1"/><path d="M25 13c-2-4-5-6-8-6M39 13c2-4 5-6 8-6"/><ellipse cx="32" cy="44" rx="8" ry="6"/></g><circle cx="29" cy="44" r="1.6" fill="currentColor"/><circle cx="35" cy="44" r="1.6" fill="currentColor"/><circle cx="27" cy="27" r="1.8" fill="currentColor"/><circle cx="37" cy="27" r="1.8" fill="currentColor"/>',
  hands:
    '<g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M32 38V22"/><path d="M32 28c-7 0-11-4-11-11 7 0 11 4 11 11z"/><path d="M32 24c0-7 4-11 11-11 0 7-4 11-11 11z"/><path d="M6 40c6 0 12 4 16 10h20c4-6 10-10 16-10"/><path d="M14 56h36"/></g>',
  trend:
    '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 48 22 33l9 8 21-22"/><path d="M40 19h12v12"/><path d="M8 57h48"/></g>',
};

export const AGRI_ICON_NAMES: Record<string, string> = {
  growth: "Growth chart",
  expert: "Expert / person",
  hen: "Hen / poultry",
  cow: "Cow / dairy",
  hands: "Hands & plant",
  trend: "Growth arrow",
};

export function AgriIcon({ name, className }: { name: string; className?: string }) {
  const svg = AGRI_ICONS[name];
  if (svg) return <svg viewBox="0 0 64 64" className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
  return <BvIcon name={name} className={className} />;
}

/* ---------- geometry ---------- */

const W = 1080;
/** footer band height per format */
const BAND = { feed: 186, story: 220 };

function geometry(d: AgriPromoData) {
  const story = d.format === "story";
  const H = story ? 1920 : 1350;
  /** top of the footer band (the page bottom when the band is off) */
  const F = d.showFooter ? H - BAND[d.format] : H;
  /** the hero / cream boundary (spec section 5), stretched to the height above the band */
  const k = (F + 20) / 1360;
  const y = (v: number) => (v * k).toFixed(1);
  const edge = `M548 0C${478} ${y(150)} ${452} ${y(330)} ${478} ${y(520)}C${505} ${y(720)} ${495} ${y(870)} ${448} ${y(1040)}C${418} ${y(1150)} ${420} ${y(1250)} ${480} ${y(1360)}`;
  const cream = `${edge}H${W}V0Z`;
  // circle: diameter and top, resting just above the band
  const cd = story ? 430 : 372;
  const ct = F - cd - (story ? 70 : 34);
  return { story, H, F, edge, cream, cd, ct };
}

/* ---------- pieces ---------- */

/** A photo filling its box: cover (crops) or contain (whole photo), zoomed around the focus point x / y (%). */
function Photo({ src, fit, zoom, x, y }: { src: string; fit: PhotoFit; zoom: number; x: number; y: number }) {
  return <img src={src} alt="" style={{ objectFit: fit, objectPosition: `${x}% ${y}%`, transform: `scale(${zoom / 100})`, transformOrigin: `${x}% ${y}%` }} />;
}

/** The two-leaf logo mark (spec section 8). */
function LeafMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <path d="M30 58C12 54 4 40 8 18c16 2 26 14 22 40Z" fill={AGRI.forest700} />
      <path d="M34 58C34 34 44 16 60 8c4 24-6 44-26 50Z" fill={AGRI.leaf500} />
      <path d="M30 58C26 44 20 32 12 24M34 58c4-16 12-30 22-44" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".7" />
    </svg>
  );
}

/** A single leaf (spec section 7), pointing up; rotate with CSS. */
function Leaf({ className, fill = AGRI.leaf500, style }: { className?: string; fill?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 70" className={className} style={style} aria-hidden="true">
      <path d="M20 2C36 18 38 44 20 68 2 44 4 18 20 2Z" fill={fill} />
      <path d="M20 12V62" stroke="#fff" strokeWidth="1.6" opacity=".55" />
    </svg>
  );
}

export const AgriPromoArtwork = forwardRef<HTMLDivElement, { data: AgriPromoData; onFit?: (r: FitResult) => void }>(function AgriPromoArtwork({ data: d, onFit }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const brand = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  const g = geometry(d);
  const variant = d.logo > 0 ? (BV_VARIANTS[Math.min(BV_VARIANTS.length, d.logo) - 1] ?? BV_VARIANTS[0]) : null;
  const minTop = g.story ? 205 : 150;
  // the right column starts under the brand block, measured (its height depends on the name style,
  // size and position); runs before the auto-fit so that fits the column that is left
  useLayoutEffect(() => {
    let alive = true;
    const measure = () => {
      const r = root.current;
      const b = brand.current;
      if (!r || !alive) return;
      const top = b ? Math.max(minTop, b.offsetTop + b.offsetHeight + 26) : g.story ? 90 : 56;
      r.style.setProperty("--top", `${top}px`);
    };
    measure();
    document.fonts?.ready.then(measure);
    document.fonts?.addEventListener("loadingdone", measure);
    return () => {
      alive = false;
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [d, minTop, g.story]);
  useAutoFit(root, [d], 0.72, onFit);
  const hasLogo = d.logo >= 0;
  const vars = {
    "--H": `${g.H}px`,
    "--F": `${g.F}px`,
    "--ct": `${g.ct}px`,
    "--cd": `${g.cd}px`,
    "--top": `${d.showLogo ? minTop : g.story ? 90 : 56}px`,
  } as CSSProperties;
  const nameAlign = d.namePos === "left" ? "right" : d.namePos === "right" ? "left" : "center";

  return (
    <div ref={root} className={`bva canvas${g.story ? " story" : ""}`} style={vars}>
      {/* hero photo (left), under the cream panel */}
      <div className="hero">
        {d.hero ? <Photo src={d.hero} fit={d.heroFit} zoom={d.heroZoom} x={d.heroX} y={d.heroY} /> : <div className="hero-plain" />}
      </div>

      {/* cream information panel with the organic left edge */}
      <svg className="layer" viewBox={`0 0 ${W} ${g.H}`} aria-hidden="true">
        <defs>
          <linearGradient id="bva-swoosh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={AGRI.lime400} />
            <stop offset="1" stopColor={AGRI.leaf600} />
          </linearGradient>
        </defs>
        <path d={g.cream} fill={AGRI.cream} />
        {/* top-left swoosh with a dark leaf */}
        <path d="M0 0H250C214 70 130 118 0 128Z" fill="url(#bva-swoosh)" />
        <path d="M18 106C28 58 60 30 108 22 98 70 68 98 18 106Z" fill={AGRI.forest700} />
        <path d="M18 106C44 76 70 52 100 32" fill="none" stroke="#fff" strokeWidth="2" opacity=".45" />
      </svg>

      {/* brand (top right) */}
      {d.showLogo && (
        <div ref={brand} className={`brand pos-${d.namePos}`}>
          {variant ? (
            <div className={d.logoPlate ? "plate" : undefined}>
              <img src={variant.web} alt="Bethlehem Valley logo" style={{ height: d.logoSize }} />
            </div>
          ) : (
            hasLogo && <LeafMark className="mark" style={{ width: d.logoSize, height: d.logoSize }} />
          )}
          <BrandTitleInline t={d.brandTitle} align={nameAlign} style={{ transform: `translate(${d.nameX}px, ${d.nameY}px)` }} />
        </div>
      )}

      {/* right column: headline, description, CTA, banner, benefits (auto-fit shrinks it) */}
      <div className="copy">
        <div className="hl">
          {d.headline1 && <div className="l1 bname">{d.headline1}</div>}
          {d.headline2 && (
            <div className="l2 bname">
              {d.headline2}
              <Leaf className="hleaf" fill={AGRI.leaf600} />
            </div>
          )}
          {d.headline3 && <div className="l3 bname">{d.headline3}</div>}
        </div>

        {d.description.trim() && (
          <div className="desc">
            <Lines text={d.description} />
          </div>
        )}

        {d.showCta && d.cta.trim() && (
          <div className="ctarow">
            <svg className="dash l" viewBox="0 0 40 50" aria-hidden="true">
              <path d="M30 6 18 16M34 24H14M30 42 18 34" stroke={AGRI.forest700} strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="cta">
              <span className="ct">{d.cta}</span>
              <span className="arrow">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M7 16h17M17 8l8 8-8 8" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <svg className="dash r" viewBox="0 0 40 50" aria-hidden="true">
              <path d="M10 6 22 16M6 24H26M10 42 22 34" stroke={AGRI.forest700} strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {d.showBanner && (d.bannerTitle.trim() || d.bannerEyebrow.trim()) && (
          <div className="banner">
            <svg className="bshape" viewBox="0 0 700 170" preserveAspectRatio="none" aria-hidden="true">
              <path d="M14 22Q16 6 34 6H700V164H26Q8 164 8 148Z" fill={AGRI.leaf500} />
              <path d="M26 20Q28 14 38 14H700V154H36Q22 154 22 142Z" fill={AGRI.forest800} />
              <path d="M600 14H700V60Q660 20 600 14Z" fill={AGRI.forest900} opacity=".5" />
            </svg>
            <Leaf className="bleaf l" fill={AGRI.lime400} />
            <Leaf className="bleaf r" fill={AGRI.lime400} />
            <div className="btext">
              {d.bannerEyebrow && <div className="be">{d.bannerEyebrow}</div>}
              {d.bannerTitle && <div className="btl">{d.bannerTitle}</div>}
              {d.bannerSubtitle && (
                <div className="bs">
                  <i />
                  <span>{d.bannerSubtitle}</span>
                  <i />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="benefits">
          {d.benefits.map((b, i) => (
            <div key={i} className="ben">
              <div className="bic">
                <AgriIcon name={b.icon} className="ico" />
              </div>
              <div className="btx">
                {b.title && <div className="bti">{b.title}</div>}
                {b.text && (
                  <div className="bde">
                    <Lines text={b.text} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* footer band */}
      {d.showFooter && (
        <>
          <svg className="layer" viewBox={`0 0 ${W} ${g.H}`} aria-hidden="true">
            <path d={`M0 ${g.F - 40}C260 ${g.F - 110} 520 ${g.F + 10} 760 ${g.F - 16}S1010 ${g.F - 44} ${W} ${g.F - 30}V${g.H}H0Z`} fill={AGRI.leaf500} />
            <path d={`M0 ${g.F - 14}C260 ${g.F - 80} 520 ${g.F + 30} 760 ${g.F + 6}S1010 ${g.F - 20} ${W} ${g.F - 6}V${g.H}H0Z`} fill={AGRI.forest900} />
            <path d={`M0 ${g.H - 22}C300 ${g.H - 40} 700 ${g.H - 8} ${W} ${g.H - 30}V${g.H}H0Z`} fill={AGRI.lime400} />
            <path d={`M0 ${g.H - 14}C300 ${g.H - 30} 700 ${g.H} ${W} ${g.H - 22}V${g.H}H0Z`} fill={AGRI.leaf500} />
          </svg>
          <footer className="band">
            {d.footer.map((f, i) => (
              <div key={i} className="fi">
                <AgriIcon name={f.icon} className="fico" />
                <div className="fl">
                  <Lines text={f.label} />
                </div>
              </div>
            ))}
          </footer>
        </>
      )}

      {/* circular secondary photo (above the band's curve) */}
      {d.showSecondary && d.secondary && (
        <div className="circle">
          <div className="cimg">
            <Photo src={d.secondary} fit={d.secondaryFit} zoom={d.secondaryZoom} x={d.secondaryX} y={d.secondaryY} />
          </div>
          <Leaf className="cleaf" fill={AGRI.lime400} />
        </div>
      )}
    </div>
  );
});
