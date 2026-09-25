import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { BV_ART, BvIcon, LeafPattern, Lines, PlacedPhoto, seeded, themeClass, themeColors, useAutoFit, type FitResult } from "../shared";
import type { BvLook, FarmTipData, HeaderStyle } from "./data";
import "./artwork.css";

/*
 * Port of bethlehem-valley-post-v2.html. The layout and styles are the template's own CSS
 * (artwork.css, scoped to .bv2) with its geometry (geo) for story / feed. Badge logos are the
 * Branding PNGs; the round emblem, pepper photo and landscape are the template's images
 * (public/social/instagram/bethlehem-valley).
 */

export const BV_EMBLEM = `${BV_ART}/emblem.webp`;
export const BV_PEPPER = `${BV_ART}/pepper.webp`;
export const BV_LANDSCAPE = `${BV_ART}/landscape.webp`;

/** Header heights at story size; the header is scaled down for feed. */
const HEADER_H: Record<HeaderStyle, number> = { centered: 448, classic: 470, compact: 280 };

/** The template's geometry (geo) for story / feed; `landscape` = the bottom landscape band. */
export function bvGeo(d: Pick<BvLook, "format" | "headerStyle" | "showHeader" | "showFooter">, landscape = false) {
  const feed = d.format === "feed",
    H = feed ? 1350 : 1920,
    hs = feed ? (d.headerStyle === "compact" ? 0.9 : 0.74) : 1;
  // hidden header / footer: keep a plain margin instead of the band
  const hh = d.showHeader === false ? (feed ? 44 : 64) : Math.round(HEADER_H[d.headerStyle] * hs);
  const footerH = d.showFooter === false ? 0 : feed ? 112 : 152,
    land = landscape && !feed;
  const landH = land ? 300 : 0;
  const featH = feed ? 170 : 222;
  // space kept free at the bottom: the footer band, or (footer hidden) a margin that also holds the page badge
  const bottomH = footerH || (feed ? 60 : 84);
  const featTop = land ? H - footerH - landH - featH : H - bottomH - featH - 24;
  return { feed, H, hs, hh, footerH, bottomH, land, landH, featH, featTop, midTop: hh + (feed ? 4 : 8), midBottom: featTop - (feed ? 20 : 30) };
}

export function logoSrc(l: FarmTipData["headerLogo"]) {
  return l === "emblem" ? BV_EMBLEM : (BV_VARIANTS[(Number(l) || 1) - 1] ?? BV_VARIANTS[0]).web;
}

/** Header bottom wave in the page's cream (theme colour). */
function wave(s: HeaderStyle, cream: string): ReactNode {
  if (s === "centered")
    return (
      <svg className="hwave" viewBox="0 0 1080 120" height="120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 28 C150 18 260 40 380 70 C520 104 700 96 860 58 C960 36 1030 28 1080 30 V120 H0Z" fill={cream} />
      </svg>
    );
  if (s === "classic")
    return (
      <svg className="hwave" viewBox="0 0 1080 140" height="140" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 70 C260 10 520 20 760 55 C900 76 1000 72 1080 50 L1080 140 L0 140Z" fill={cream} />
        <path d="M0 70 C260 10 520 20 760 55 C900 76 1000 72 1080 50" fill="none" stroke="#D8AA35" strokeWidth="4" />
      </svg>
    );
  return (
    <svg className="hwave" viewBox="0 0 1080 70" height="70" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 40 C300 0 700 70 1080 22 V70 H0Z" fill={cream} />
      <path d="M0 40 C300 0 700 70 1080 22" fill="none" stroke="#D8AA35" strokeWidth="3" />
    </svg>
  );
}

const GOLD_SWOOSH = (
  <svg viewBox="0 0 130 22" fill="none" aria-hidden="true">
    <path d="M3 18C40 8 80 4 127 3" stroke="#E9C35A" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const PH_ICON = (
  <svg viewBox="0 0 106 92" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="98" height="84" rx="10" stroke="currentColor" strokeWidth="7" />
    <path d="M14 78 40 46l16 18 12-12 24 26Z" fill="currentColor" />
    <circle cx="72" cy="30" r="9" fill="currentColor" />
  </svg>
);

const DECOR = `<defs>
  <linearGradient id="bvd-l1" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb83f"/><stop offset="1" stop-color="#1f6b2a"/></linearGradient>
  <linearGradient id="bvd-l2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc85a"/><stop offset="1" stop-color="#2c7d31"/></linearGradient>
  <linearGradient id="bvd-l3" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f8f35"/><stop offset="1" stop-color="#0f4a22"/></linearGradient>
  <filter id="bvd-s"><feDropShadow dx="-4" dy="6" stdDeviation="6" flood-opacity=".22"/></filter></defs>
  <g filter="url(#bvd-s)">
  <path d="M300 40 C250 70 190 120 100 160 C170 175 250 160 300 120Z" fill="url(#bvd-l3)"/>
  <path d="M300 0 C240 60 170 130 20 190 C160 200 260 160 300 110Z" fill="url(#bvd-l1)"/>
  <path d="M300 0 C240 60 170 130 20 190" stroke="#c8e6a0" stroke-opacity=".7" stroke-width="3" fill="none"/>
  <path d="M300 110 C260 140 230 160 150 200 C230 212 280 190 300 170Z" fill="url(#bvd-l2)"/>
  <path d="M300 110 C260 140 230 160 150 200" stroke="#d6efb4" stroke-opacity=".6" stroke-width="2.5" fill="none"/></g>`;

/** Brush stroke behind the closing line, in the theme's dark colour (same shape every time). */
const brushCache = new Map<string, string>();
function brush(color: string) {
  if (!brushCache.has(color)) brushCache.set(color, drawBrush(color));
  return brushCache.get(color)!;
}
function drawBrush(color: string) {
  const r = seeded("brush"),
    pts: [number, number][] = [];
  for (let x = 26; x <= 440; x += 14) pts.push([x, 14 + Math.sin(x / 37) * 4 + (r() - 0.5) * 5]);
  for (let y = 16; y <= 146; y += 7) {
    const tip = r() < 0.5 ? r() * 22 : r() * 9;
    pts.push([446 + tip + Math.sin(y / 9) * 3, y]);
  }
  for (let x = 440; x >= 26; x -= 14) pts.push([x, 148 + Math.sin(x / 41) * 4 + (r() - 0.5) * 6]);
  for (let y = 146; y >= 16; y -= 7) {
    const tip = r() < 0.45 ? r() * 24 : r() * 8;
    pts.push([22 - tip, y]);
  }
  let streaks = "";
  for (let i = 0; i < 9; i++) {
    const top = i % 2 === 0,
      y = top ? 6 + r() * 9 : 152 + r() * 8,
      x1 = 30 + r() * 120,
      x2 = x1 + 120 + r() * 260;
    streaks += `<path d="M${x1.toFixed(0)} ${y.toFixed(1)} Q ${((x1 + x2) / 2).toFixed(0)} ${(y + (r() - 0.5) * 4).toFixed(1)} ${x2.toFixed(0)} ${(y + (r() - 0.5) * 3).toFixed(1)}" stroke="${color}" stroke-width="${(1.5 + r() * 3).toFixed(1)}" stroke-linecap="round" opacity="${(0.5 + r() * 0.5).toFixed(2)}" fill="none"/>`;
  }
  return `<path fill="${color}" d="M${pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L")}Z"/>${streaks}`;
}

export function BvHeader({ d, hs }: { d: BvLook; hs: number }) {
  if (d.showHeader === false) return null;
  const s = d.headerStyle;
  const brand = String(d.brandName || "").trim();
  const w = 1080 / hs;
  let inner: ReactNode;
  if (s === "centered") {
    const ph = d.headerPhoto === "none" ? null : d.headerPhoto === "default" || !d.headerPhoto ? BV_PEPPER : d.headerPhoto;
    const phR = d.showHeaderPhotoRight && d.headerPhotoRight ? d.headerPhotoRight : null;
    const isBadge = d.headerLogo !== "emblem";
    inner = (
      <>
        {ph ? <div className="hphoto" style={{ backgroundImage: `url('${ph}')` }} /> : <LeafPattern />}
        {phR && <div className="hphoto-r" style={{ backgroundImage: `url('${phR}')` }} />}
        <img className={`emblem${isBadge ? " badge-logo" : ""}`} src={logoSrc(d.headerLogo)} alt={brand || "Bethlehem Valley"} />
        {brand && <div className="bname">{brand}</div>}
        {d.tagline && brand && (
          <div className="tag">
            <i />
            {d.tagline}
            <i />
          </div>
        )}
        {d.showSlogan && (
          <div className="slogan script">
            <Lines text={d.slogan} />
            {GOLD_SWOOSH}
          </div>
        )}
      </>
    );
  } else if (s === "classic") {
    const sl = String(d.slogan || "")
      .replace(/\n/g, " ")
      .trim();
    inner = (
      <>
        <LeafPattern />
        <div className="brandrow">
          <img className="logo" src={logoSrc(d.headerLogo)} alt="Bethlehem Valley" />
          <div className="brandtxt">
            {brand && <div className="bname">{brand}</div>}
            <div className="tag">{d.tagline}</div>
          </div>
          {d.showSlogan && (
            <div className="slogan">
              <div className="s1">{sl}</div>
              <div className="s2">{d.sloganSmall}</div>
            </div>
          )}
        </div>
      </>
    );
  } else {
    const sl = String(d.slogan || "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const half = Math.ceil(sl.length / 2);
    const two = sl.length > 2 ? [sl.slice(0, half).join(" "), sl.slice(half).join(" ")] : sl;
    inner = (
      <>
        <LeafPattern />
        <div className="brandrow">
          <img className="logo" src={logoSrc(d.headerLogo)} alt="Bethlehem Valley" />
          <div className="brandtxt">
            {brand && <div className="bname">{brand}</div>}
            <div className="tag">{d.tagline}</div>
          </div>
          {d.showSlogan && (
            <div className="slogan script">
              <Lines text={two.join("\n")} />
            </div>
          )}
        </div>
      </>
    );
  }
  return (
    <header
      className={`header h-${s}${brand ? "" : " nobrand"}`}
      style={{ height: HEADER_H[s], width: w, left: (1080 - w) / 2, transform: `scale(${hs})` }}
    >
      <div className="hbg" />
      {inner}
      {wave(s, themeColors(d.theme).cream)}
    </header>
  );
}

/** Page n of total in a multi-page post (shown in the footer corner). */
export type BvPageNo = { n: number; total: number };

export function BvFooter({ d, height, page }: { d: BvLook; height: number; page?: BvPageNo }) {
  const handle = String(d.handle || "").trim();
  // footer hidden: keep only the page number, as a small badge in the corner
  if (d.showFooter === false)
    return page && page.total > 1 ? (
      <div className="pgfloat">
        {page.n}/{page.total}
        {page.n < page.total && <span>›</span>}
      </div>
    ) : null;
  return (
    <footer className="footer" style={{ height }}>
      <svg className="wave" viewBox="0 0 1080 46" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 30 C200 14 420 8 620 20 C800 30 960 30 1080 14 V46 H0Z" fill={themeColors(d.theme).dark} />
        <path d="M0 30 C200 14 420 8 620 20 C800 30 960 30 1080 14" fill="none" stroke="#D8AA35" strokeWidth="4" />
      </svg>
      <div className="in">
        <div className="follow">
          <BvIcon name="instagram" />
          <div>
            {handle && <div className="h">{handle}</div>}
            <div className="t">{d.follow}</div>
          </div>
        </div>
        <span className="fsep" />
        <div className="fbrand">
          <i />
          {d.brandName || "Bethlehem Valley"}
          <i />
        </div>
      </div>
      {page && page.total > 1 && (
        <div className="pgno">
          {page.n}/{page.total}
          {page.n < page.total && <span>›</span>}
        </div>
      )}
    </footer>
  );
}

export const FarmTipArtwork = forwardRef<HTMLDivElement, { data: FarmTipData; onFit?: (r: FitResult) => void; page?: BvPageNo }>(function FarmTipArtwork(
  { data: d, onFit, page },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  useAutoFit(root, [d], 0.6, onFit);
  const g = bvGeo(d, d.showLandscape);
  const landSrc = d.landscape && d.landscape !== "default" ? d.landscape : BV_LANDSCAPE;

  return (
    <div ref={root} className={`bv2 canvas${g.feed ? " feed" : ""}${themeClass(d.theme)}`}>
      <BvHeader d={d} hs={g.hs} />

      <section className="mid" style={{ top: g.midTop, height: g.midBottom - g.midTop }}>
        <div className="copy">
          <div>
            <span className="badge">
              <BvIcon name={d.categoryIcon || "lightbulb"} />
              {d.category}
            </span>
            {d.meta && <span className="metatxt">{d.meta}</span>}
          </div>
          <h1>
            <Lines text={d.heading} />
          </h1>
          <div className="mlh ml" lang="ml">
            <Lines text={d.mlHeading} />
          </div>
          <div className="rule" />
          <p className="body">
            <Lines text={d.body} />
          </p>
          <p className="mlb ml" lang="ml">
            <Lines text={d.mlBody} />
          </p>
        </div>
        <div className="photo">
          {d.photo ? (
            <PlacedPhoto src={d.photo} zoom={d.photoZoom} x={d.photoX} y={d.photoY} />
          ) : (
            <div className="ph">
              {PH_ICON}
              <span>
                ADD YOUR
                <br />
                IMAGE HERE
              </span>
            </div>
          )}
        </div>
      </section>
      {d.decorLeaves && (
        <div
          className="decor"
          style={{ top: g.midBottom - (g.feed ? 110 : 170), width: g.feed ? 200 : 300, height: g.feed ? 140 : 210 }}
        >
          <svg viewBox="0 0 300 210" aria-hidden="true" dangerouslySetInnerHTML={{ __html: DECOR }} />
        </div>
      )}

      <div className="fband" style={{ top: g.featTop - 18, height: g.featH + 18 + (g.land ? 40 : 24) }} />
      <section className="features" style={{ top: g.featTop + (g.feed ? 8 : 22) }}>
        {d.features.slice(0, 4).map((f, i) => (
          <div key={i} className="feature">
            <div className="fic">
              <BvIcon name={f.icon} />
            </div>
            <div className="ft">{f.title}</div>
            <div className="fm ml" lang="ml">
              {f.ml}
            </div>
          </div>
        ))}
      </section>

      {g.land && (
        <>
          <div className="land" style={{ top: g.H - g.footerH - g.landH + 20, backgroundImage: `url('${landSrc}')` }} />
          <div className="grow" style={{ top: g.H - g.footerH - g.landH + 44 }}>
            <svg viewBox="0 0 470 162" preserveAspectRatio="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: brush(themeColors(d.theme).brush) }} />
            <div className="ge script">{d.growEn}</div>
            <div className="gm ml" lang="ml">
              {d.growMl}
            </div>
            <svg className="gl" viewBox="0 0 210 12" aria-hidden="true">
              <path d="M3 9C60 3 140 2 207 4" stroke="#E9C35A" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}

      <BvFooter d={d} height={g.footerH} page={page} />
    </div>
  );
});
