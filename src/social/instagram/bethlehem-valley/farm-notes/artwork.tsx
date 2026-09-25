import { forwardRef, useImperativeHandle, useRef } from "react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { BvIcon, LeafPattern, Lines, PlacedPhoto, seeded, themeClass, useAutoFit, type FitResult } from "../shared";
import type { FarmNotesData } from "./data";
import "./artwork.css";

/*
 * Port of bethlehem-valley-post.html. The layout and styles are the template's own CSS
 * (artwork.css, scoped to .bv1); the badge logo is the Branding PNG.
 */

/** The template's default photo: a drawn pepper vine with ripening spikes. */
const PEPPER_ART = (() => {
  const r = seeded("pepper-vine");
  const leaf = (x: number, y: number, s: number, a: number, shade: number) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
    <path d="M0 0 C-60 -20 -85 -95 -40 -150 C-20 -175 0 -185 0 -215 C0 -185 20 -175 40 -150 C85 -95 60 -20 0 0Z" fill="url(#bvp-lf${shade})"/>
    <path d="M0 -4 C-2 -70 -1 -140 0 -205" stroke="#cfe6a8" stroke-opacity=".55" stroke-width="4" fill="none"/>
    <path d="M0 -60 C-20 -80 -35 -95 -45 -120 M0 -60 C20 -80 35 -95 45 -120 M0 -110 C-15 -125 -25 -140 -30 -158 M0 -110 C15 -125 25 -140 30 -158" stroke="#cfe6a8" stroke-opacity=".3" stroke-width="3" fill="none"/></g>`;
  const spike = (x: number, y: number, len: number, a: number, ripe: number) => {
    let g = `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0 C4 ${len * 0.4} -4 ${len * 0.7} 2 ${len}" stroke="#4b6b2a" stroke-width="6" fill="none"/>`;
    for (let t = 16; t < len; t += 17) {
      const w = Math.sin((t / len) * Math.PI) * 8 + 7;
      for (const sx of [-1, 1]) {
        const red = r() < ripe;
        const cx = sx * w * 0.9 + (r() - 0.5) * 3,
          cy = t + (r() - 0.5) * 4,
          rr = 10 + r() * 3;
        g += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="url(#${red ? "bvp-br" : "bvp-bg"})"/><circle cx="${(cx - 2.5).toFixed(1)}" cy="${(cy - 3).toFixed(1)}" r="${(rr * 0.3).toFixed(1)}" fill="#fff" opacity=".45"/>`;
      }
    }
    return g + "</g>";
  };
  let bokeh = "";
  for (let i = 0; i < 26; i++)
    bokeh += `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 1000).toFixed(0)}" r="${(20 + r() * 70).toFixed(0)}" fill="${r() < 0.5 ? "#e9f3c8" : "#a7cf7c"}" opacity="${(0.12 + r() * 0.25).toFixed(2)}"/>`;
  return `<defs><linearGradient id="bvp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f1da"/><stop offset=".45" stop-color="#b9d78f"/><stop offset="1" stop-color="#3f7a3a"/></linearGradient>
  <linearGradient id="bvp-lf0" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5aa33c"/><stop offset="1" stop-color="#1f5e2a"/></linearGradient>
  <linearGradient id="bvp-lf1" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76b94a"/><stop offset="1" stop-color="#2d7431"/></linearGradient>
  <linearGradient id="bvp-lf2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3c8a34"/><stop offset="1" stop-color="#0f4424"/></linearGradient>
  <radialGradient id="bvp-bg" cx="35%" cy="30%"><stop offset="0" stop-color="#b9e36a"/><stop offset="1" stop-color="#3d8a25"/></radialGradient>
  <radialGradient id="bvp-br" cx="35%" cy="30%"><stop offset="0" stop-color="#ff8a6a"/><stop offset="1" stop-color="#b3141f"/></radialGradient>
  <filter id="bvp-soft"><feGaussianBlur stdDeviation="18"/></filter><filter id="bvp-ds"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity=".25"/></filter></defs>
  <rect width="800" height="1000" fill="url(#bvp-sky)"/><g filter="url(#bvp-soft)">${bokeh}</g>
  <path d="M180 1000 C230 820 180 640 260 470 C330 320 300 170 380 -20" stroke="#6b4a2b" stroke-width="30" fill="none" stroke-linecap="round"/>
  <path d="M180 1000 C230 820 180 640 260 470 C330 320 300 170 380 -20" stroke="#8b6a44" stroke-width="10" fill="none" stroke-dasharray="4 26" stroke-linecap="round"/>
  <g filter="url(#bvp-ds)">
   ${leaf(300, 250, 1.05, 58, 2)}${leaf(330, 170, 0.9, -40, 1)}${leaf(250, 520, 1.25, -55, 0)}${leaf(270, 470, 1.15, 62, 1)}${leaf(215, 780, 1.2, -62, 2)}${leaf(235, 720, 1.1, 55, 0)}
   ${spike(420, 300, 230, -8, 0.35)}${spike(470, 330, 200, -18, 0.55)}${spike(330, 560, 250, 4, 0.25)}${spike(395, 590, 220, -14, 0.7)}${spike(300, 820, 200, 10, 0.15)}
   ${leaf(360, 380, 0.95, 95, 0)}${leaf(310, 640, 1.0, 110, 2)}
  </g>`;
})();

export const FarmNotesArtwork = forwardRef<HTMLDivElement, { data: FarmNotesData; onFit?: (r: FitResult) => void }>(function FarmNotesArtwork({ data: d, onFit }, ref) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  useAutoFit(root, [d], 0.62, onFit);
  const feed = d.format === "feed";
  const logo = BV_VARIANTS[Math.min(BV_VARIANTS.length, Math.max(1, d.logo)) - 1] ?? BV_VARIANTS[0];
  // hidden header: the middle moves up; hidden footer: everything below the middle moves down
  const header = d.showHeader !== false;
  const footer = d.showFooter !== false;
  const drop = footer ? 0 : feed ? 85 : 170;
  const midStyle = { ...(header ? {} : { top: feed ? 50 : 70 }), ...(footer ? {} : { bottom: (feed ? 300 : 560) - drop }) };
  const below = (b: number) => (footer ? undefined : { bottom: b - drop });

  return (
    <div ref={root} className={`bv1 canvas${feed ? " feed" : ""}${themeClass(d.theme)}`}>
      {header && (
      <section className="hero">
        <LeafPattern />
        <div className="brandrow">
          <img className="logo" src={logo.web} alt="Bethlehem Valley" />
          <div className="brandtxt">
            <div className="bname">{d.brandName}</div>
            <div className="tagline">{d.tagline}</div>
          </div>
          <div className="slogan">
            <div className="s1">
              {d.slogan1}
              <br />
              {d.slogan2}
            </div>
            <div className="s2">{d.sloganSmall}</div>
          </div>
        </div>
        <svg className="wave" viewBox="0 0 1080 140" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 70 C260 10 520 20 760 55 C900 76 1000 72 1080 50 L1080 140 L0 140Z" fill="#F5F0E6" />
          <path d="M0 70 C260 10 520 20 760 55 C900 76 1000 72 1080 50" fill="none" stroke="#D8AA35" strokeWidth="4" />
        </svg>
      </section>
      )}

      <section className="mid" style={midStyle}>
        <div className="topline">
          <span className="badge">
            <BvIcon name={d.categoryIcon || "lightbulb"} />
            {d.category}
          </span>
          <span className="metatxt">{d.meta}</span>
        </div>
        <div className="grid">
          <div className="copy">
            <h1>
              <Lines text={d.heading} />
            </h1>
            <div className="mlh ml" lang="ml">
              <Lines text={d.mlHeading} />
            </div>
            <div className="rule">
              <i />
              <b />
            </div>
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
              <svg
                viewBox="0 0 800 1000"
                preserveAspectRatio="xMidYMid slice"
                aria-label="Illustration of a pepper vine with ripening spikes"
                dangerouslySetInnerHTML={{ __html: PEPPER_ART }}
              />
            )}
          </div>
        </div>
      </section>

      <section className="features" style={below(feed ? 140 : 372)}>
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

      <div className="grow" style={below(238)}>
        <BvIcon name="leaf" />
        <div>
          <div className="ge">{d.growEn}</div>
          <div className="gm ml" lang="ml">
            {d.growMl}
          </div>
        </div>
        <BvIcon name="leaf" className="r" />
      </div>

      {footer && (
      <footer className="footer">
        <svg className="wave" viewBox="0 0 1080 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 H1080 V20 C860 70 620 60 420 40 C260 24 120 30 0 50Z" fill="#F5F0E6" />
          <path d="M0 50 C120 30 260 24 420 40 C620 60 860 70 1080 20" fill="none" stroke="#D8AA35" strokeWidth="3" />
        </svg>
        <div className="in">
          <div className="follow">
            <BvIcon name="instagram" />
            <div>
              <div className="h">{d.handle}</div>
              <div className="t">{d.follow}</div>
            </div>
          </div>
          <div className="fbrand">
            <i />
            {d.brandName}
            <i />
          </div>
        </div>
      </footer>
      )}
    </div>
  );
});
