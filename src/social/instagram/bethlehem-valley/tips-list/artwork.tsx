import { forwardRef, useImperativeHandle, useRef } from "react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { BrandTitleView } from "../brand-title";
import { BV_ART, BvIcon, Lines, useAutoFit, type FitResult } from "../shared";
import type { TipsListData } from "./data";
import "./artwork.css";

/*
 * Rebuild of bethlehem-valley_01_outlined.svg as HTML (so the Malayalam text stays editable
 * and wraps). Positions are the SVG's own; the drawn icons and leaf sprigs are its paths.
 * Colours are real values, not CSS variables: the PNG export does not resolve variables in SVG fills.
 */

/** Icon colours: on the dark-green card circles, and on the white footer circles. */
type Tone = { line: string; a: string; b: string; bg: string; check: string; on: string };
const DARK: Tone = { line: "#FFFFFF", a: "#B8D83D", b: "#E6F3B5", bg: "#07430C", check: "#2F7D1F", on: "#07430C" };
const LIGHT: Tone = { line: "#07430C", a: "#2F7D1F", b: "#B8D83D", bg: "#FFFFFF", check: "#B8D83D", on: "#EAF6D6" };

/** The design's icons, drawn on a 190-unit grid. */
const TIP_ICONS: Record<string, (t: Tone) => string> = {
  "tip-sprout": (t) =>
    `<g fill="none" stroke="${t.line}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M80 155V95"/><path d="M80 112C42 112 25 88 28 55C62 52 83 72 80 112Z" fill="${t.a}" stroke="none"/><path d="M80 95C82 53 110 30 145 35C147 72 124 96 80 95Z" fill="${t.b}" stroke="none"/><path d="M45 158H115"/></g>`,
  "tip-soil": (t) =>
    `<g fill="none" stroke="${t.line}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M38 140C52 116 75 111 92 124L112 140"/><path d="M67 110C49 93 50 66 66 48C91 58 103 78 95 99"/><path d="M93 98C96 67 118 50 145 54C146 80 127 99 93 98Z" fill="${t.a}" stroke="none"/><path d="M37 140H151"/></g>`,
  "tip-drop": (t) => `<path d="M95 25C95 25 45 82 45 116C45 146 67 168 95 168C123 168 145 146 145 116C145 82 95 25 95 25Z" fill="${t.a}"/>`,
  "tip-shield": (t) =>
    `<path d="M95 25L155 47V94C155 132 130 158 95 174C60 158 35 132 35 94V47Z" fill="${t.line}"/><path d="M95 48L133 62V94C133 117 118 135 95 147C72 135 57 117 57 94V62Z" fill="none" stroke="${t.bg}" stroke-width="7"/><path d="M77 97L90 110L116 82" fill="none" stroke="${t.check}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  "tip-growth": (t) =>
    `<g fill="none" stroke="${t.line}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M38 155V48"/><path d="M38 155H162"/><rect x="58" y="112" width="22" height="43" fill="${t.a}" stroke="none"/><rect x="91" y="88" width="22" height="67" fill="${t.a}" stroke="none"/><rect x="124" y="58" width="22" height="97" fill="${t.a}" stroke="none"/><path d="M65 90L98 65L130 45L155 28"/><path d="M135 28H155V48"/></g>`,
  "tip-money": (t) =>
    `<g fill="none" stroke="${t.line}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M28 150C44 128 70 120 92 130L118 142C126 146 124 158 114 158H84"/><path d="M84 158H120L158 132C166 127 172 138 166 145L134 172H62L28 172"/><circle cx="112" cy="64" r="34" fill="${t.a}" stroke="none"/><path d="M98 48H126M98 60H126M104 48C116 48 120 54 120 60S114 72 104 72L122 84" stroke="${t.on}" stroke-width="6"/></g>`,
  "tip-leaf": (t) =>
    `<g fill="none" stroke="${t.line}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M150 32C88 34 44 62 40 120C38 135 42 148 48 156C60 104 92 78 128 62C98 84 74 110 58 150C112 158 150 118 154 68C155 56 154 44 150 32Z" fill="${t.a}" stroke="none"/><path d="M40 164L58 146"/></g>`,
};

/** Names for the editor's icon list (the BV icon pack is offered after these). */
export const TIP_ICON_NAMES: Record<string, string> = {
  "tip-sprout": "Sprout (design)",
  "tip-soil": "Soil & hand (design)",
  "tip-drop": "Water drop (design)",
  "tip-shield": "Shield (design)",
  "tip-growth": "Growth chart (design)",
  "tip-money": "Income (design)",
  "tip-leaf": "Leaf (design)",
};

function TipIcon({ name, tone, className }: { name: string; tone: Tone; className: string }) {
  const draw = TIP_ICONS[name];
  if (draw) return <svg className={className} viewBox="0 0 190 190" aria-hidden="true" dangerouslySetInnerHTML={{ __html: draw(tone) }} />;
  return (
    <span className={`${className} bvico`} style={{ color: tone.line }}>
      <BvIcon name={name} />
    </span>
  );
}

/** The design's small leaf sprig (170 × 125 units). */
function Sprig({ className, stem = "#07430C", a = "#2F7D1F", b = "#B8D83D" }: { className?: string; stem?: string; a?: string; b?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 125" aria-hidden="true">
      <path d="M10 120C40 96 70 70 96 30" fill="none" stroke={stem} strokeWidth="6" strokeLinecap="round" />
      <path d="M96 30C60 38 40 70 44 104C80 98 100 66 96 30Z" fill={a} />
      <path d="M96 30C120 20 150 26 160 52C132 62 108 54 96 30Z" fill={b} />
    </svg>
  );
}

export const TipsListArtwork = forwardRef<HTMLDivElement, { data: TipsListData; onFit?: (r: FitResult) => void }>(function TipsListArtwork({ data: d, onFit }, ref) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  useAutoFit(root, [d], 0.7, onFit);
  const logo = d.logo > 0 ? (BV_VARIANTS[Math.min(BV_VARIANTS.length, d.logo) - 1] ?? BV_VARIANTS[0]).web : `${BV_ART}/tips/logo.webp`;
  const fz = d.farmerZoom / 100;

  return (
    <div ref={root} className="bvt canvas">
      {/* background shapes */}
      <svg className="deco" viewBox="0 0 1080 1350" aria-hidden="true">
        <path d="M620 0H1080V120C930 180 780 50 620 0Z" fill="#EAF6D6" />
        <path d="M0 1230C190 1160 300 1290 460 1350H0Z" fill="#EAF6D6" />
        <circle cx="925" cy="560" r="250" fill="#F6F7D9" opacity=".8" />
        <path d="M1080 0C1010 100 1000 170 940 250" fill="none" stroke="#DCEFBF" strokeWidth="18" strokeLinecap="round" />
      </svg>
      {d.background && (
        <div className="bgphoto">
          <img src={d.background} alt="" />
        </div>
      )}
      {d.farmer && (
        <div className="farmer" style={{ transform: `translateX(${d.farmerX}px) scale(${fz})` }}>
          <img src={d.farmer} alt="" />
        </div>
      )}

      {/* header */}
      <div className="logo">
        <img src={logo} alt="Bethlehem Valley" />
      </div>
      <BrandTitleView t={d.brandTitle} box={{ left: 200, top: 36, width: 370, height: 116 }} />
      <div className="num">
        <span>{d.number}</span>
      </div>
      <div className="t1 bname ml" lang="ml">
        {d.title1}
        <Sprig className="tsprig" />
      </div>
      <div className="t2 bname ml" lang="ml">
        {d.title2}
      </div>
      <div className="sub ml" lang="ml">
        <div>{d.sub1}</div>
        <div>{d.sub2}</div>
      </div>
      <svg className="divider" viewBox="0 0 600 34" aria-hidden="true">
        <line x1="0" y1="17" x2="230" y2="17" stroke="#2F7D1F" strokeWidth="4" />
        <circle cx="278" cy="17" r="7" fill="#2F7D1F" />
        <circle cx="300" cy="17" r="7" fill="#2F7D1F" />
        <circle cx="322" cy="17" r="7" fill="#2F7D1F" />
        <line x1="370" y1="17" x2="600" y2="17" stroke="#2F7D1F" strokeWidth="4" />
      </svg>

      {/* tip cards */}
      <div className="copy tips">
        {d.tips.map((t, i) => (
          <div key={i} className="card">
            <div className="cic">
              <TipIcon name={t.icon} tone={DARK} className="ico" />
            </div>
            <div className="ctext ml" lang="ml">
              <div className="ct">{t.title}</div>
              <div className="cb">
                <i />
                <span>
                  <Lines text={t.body} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* callout */}
      <div className="callout">
        <div className="bulb">
          <svg viewBox="0 0 190 190" aria-hidden="true">
            <g fill="none" stroke="#07430C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M70 122H120" />
              <path d="M78 140H112" />
              <path d="M80 104C63 94 55 79 58 61C61 40 78 25 98 25C121 25 138 42 140 64C141 82 132 96 116 105C111 108 109 113 109 118H75C75 112 73 108 68 104Z" fill="#EAF6D6" />
              <path d="M98 6V0M42 25L36 19M154 25L160 19M29 63H20M176 63H167" />
            </g>
          </svg>
        </div>
        <div className="ctx ml" lang="ml">
          <div>{d.callout1}</div>
          <div className="g">{d.callout2}</div>
        </div>
        <Sprig className="csprig" />
      </div>

      {/* footer band */}
      <footer className="band">
        <div className="benefits">
          {d.benefits.slice(0, 4).map((b, i) => (
            <div key={i} className="ben">
              <div className="bic">
                <TipIcon name={b.icon} tone={LIGHT} className="ico" />
              </div>
              <div className="bl ml" lang="ml">
                {b.label}
              </div>
            </div>
          ))}
        </div>
        {d.url && (
          <div className="url">
            <Sprig className="usprig" stem="#B8D83D" a="#B8D83D" b="#FFFFFF" />
            <span>{d.url}</span>
            <Sprig className="usprig r" stem="#B8D83D" a="#B8D83D" b="#FFFFFF" />
          </div>
        )}
      </footer>
      <svg className="branch" viewBox="0 0 150 125" aria-hidden="true">
        <path d="M12 122C58 108 105 68 148 9" fill="none" stroke="#07430C" strokeWidth="5" strokeLinecap="round" />
        <path d="M43 99C18 90 10 68 16 47C42 49 61 63 62 83C58 91 51 97 43 99Z" fill="#2F7D1F" />
        <path d="M73 74C50 61 48 39 57 20C80 24 95 38 93 58C88 66 82 71 73 74Z" fill="#B8D83D" />
        <path d="M106 49C88 32 91 13 105 0C126 8 137 23 131 40C123 47 115 50 106 49Z" fill="#2F7D1F" />
      </svg>
    </div>
  );
});
