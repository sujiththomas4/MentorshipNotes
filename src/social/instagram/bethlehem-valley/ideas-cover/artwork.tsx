import { forwardRef, useImperativeHandle, useRef } from "react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { BrandTitleView } from "../brand-title";
import { BvIcon, Lines, useAutoFit } from "../shared";
import { DESIGN_LOGO, type IdeasCoverData } from "./data";
import "./artwork.css";

/*
 * Rebuild of Bethlehem_Valley_1080x1350_outlined.svg as HTML (so the Malayalam text stays
 * editable). Positions are the SVG's own; the feature icons and leaves are its paths.
 * Colours are real values, not CSS variables: the PNG export does not resolve variables in SVG fills.
 */

/** The design's feature icons, drawn on a 96-unit grid. */
const IDEA_ICONS: Record<string, string> = {
  "idea-sprout":
    '<path d="M48 79V47" fill="none" stroke="#155A20" stroke-width="6" stroke-linecap="round"/><path d="M47 49C26 50 16 38 16 24C31 22 46 29 47 49Z" fill="#4E922B"/><path d="M49 47C50 27 64 16 80 17C79 34 67 46 49 47Z" fill="#78A934"/><path d="M20 79C27 66 69 66 76 79C62 88 34 88 20 79Z" fill="#654225"/>',
  "idea-bulb":
    '<g fill="none" stroke="#155A20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M31 43C31 27 43 17 48 17C61 17 68 28 68 42C68 51 62 56 57 61H39C34 56 31 51 31 43Z"/><path d="M40 69H56M42 78H54"/><path d="M48 3V10M19 18L24 23M77 18L72 23M10 45H18M78 45H86"/></g>',
  "idea-chart":
    '<g fill="none" stroke="#155A20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 79V22M17 79H82"/><path d="M28 66L42 53L53 59L73 35"/><path d="M62 35H73V46"/><path d="M29 79V61M43 79V52M57 79V57M71 79V35"/></g>',
  "idea-people":
    '<g fill="#155A20"><circle cx="48" cy="28" r="12"/><circle cx="22" cy="38" r="9"/><circle cx="74" cy="38" r="9"/><path d="M27 72C27 55 36 47 48 47C60 47 69 55 69 72Z"/><path d="M4 70C5 57 12 50 22 50C29 50 35 54 38 61C31 65 27 70 26 76H5Z"/><path d="M92 70C91 57 84 50 74 50C67 50 61 54 58 61C65 65 69 70 70 76H91Z"/></g>',
};

/** Names for the editor's icon list (the BV icon pack is offered after these). */
export const IDEA_ICON_NAMES: Record<string, string> = {
  "idea-sprout": "Sprout (design)",
  "idea-bulb": "Light bulb (design)",
  "idea-chart": "Growth chart (design)",
  "idea-people": "Community (design)",
};

function IdeaIcon({ name }: { name: string }) {
  const draw = IDEA_ICONS[name];
  if (draw) return <svg className="ico" viewBox="0 0 96 96" aria-hidden="true" dangerouslySetInnerHTML={{ __html: draw }} />;
  return (
    <span className="ico bvico">
      <BvIcon name={name} />
    </span>
  );
}

/** The design's single leaf (170 × 100 units). */
function Leaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 100" aria-hidden="true">
      <g fill="#6EA52A" stroke="#4B7E19" strokeWidth="2">
        <path d="M20 94C57 28 102 10 166 12C145 60 105 100 20 94Z" />
        <path d="M28 88C70 65 108 40 156 18" fill="none" stroke="#91BC48" strokeWidth="3" />
      </g>
    </svg>
  );
}

export const IdeasCoverArtwork = forwardRef<HTMLDivElement, { data: IdeasCoverData }>(function IdeasCoverArtwork({ data: d }, ref) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  useAutoFit(root, [d], 1);
  const logo = d.logo > 0 ? (BV_VARIANTS[Math.min(BV_VARIANTS.length, d.logo) - 1] ?? BV_VARIANTS[0]).web : DESIGN_LOGO;
  const fz = d.farmerZoom / 100;

  return (
    <div ref={root} className="bvi canvas">
      {d.background && <img className="bgphoto" src={d.background} alt="" />}

      {/* footer panel, leaves and the figure (the figure overlaps the panel's right end) */}
      <div className="panel" />
      {d.showLeaves && <img className="leaves" src="/social/instagram/bethlehem-valley/ideas/leaves.png" alt="" />}
      {d.farmer && (
        <div className="farmer" style={{ transform: `translateX(${d.farmerX}px) scale(${fz})` }}>
          <img src={d.farmer} alt="" />
        </div>
      )}

      {/* header */}
      <div className="logo">
        <img src={logo} alt="Bethlehem Valley" />
      </div>
      <BrandTitleView t={d.brandTitle} box={{ left: 234, top: 38, width: 420, height: 134 }} />
      {d.slide && (
        <div className="slide">
          <span>{d.slide}</span>
        </div>
      )}
      <div className="title ml" lang="ml">
        <div className="tl bname">
          {d.title1}
          <Leaf className="tleaf" />
        </div>
        <div className="tl bname">{d.title2}</div>
        <div className="tl bname">{d.title3}</div>
      </div>
      <svg className="divider" viewBox="0 0 500 20" aria-hidden="true">
        <path d="M0 10H165M335 10H500" stroke="#7AA64A" strokeWidth="2" />
        <circle cx="240" cy="10" r="5" fill="#4F8D28" />
        <circle cx="260" cy="10" r="5" fill="#4F8D28" />
        <circle cx="280" cy="10" r="5" fill="#4F8D28" />
      </svg>
      <div className="sub ml" lang="ml">
        <div className="sl bname">{d.sub1}</div>
        <div className="sl bname">{d.sub2}</div>
      </div>

      {/* number badge */}
      {d.showBadge && (
        <>
          <div className="badge">
            <div className="bn">{d.badgeNumber}</div>
            <div className="b1 ml" lang="ml">
              {d.badge1}
            </div>
            <div className="b2 ml" lang="ml">
              {d.badge2}
            </div>
          </div>
          <Leaf className="bleaf" />
        </>
      )}

      {/* features, pager, handle */}
      <div className="features">
        {d.features.slice(0, 4).map((f, i) => (
          <div key={i} className="feat">
            <div className="fic">
              <IdeaIcon name={f.icon} />
            </div>
            <div className="fl ml" lang="ml">
              <Lines text={f.label} />
            </div>
          </div>
        ))}
      </div>
      {d.dots > 0 && (
        <div className="pager">
          {Array.from({ length: d.dots }, (_, i) => (
            <i key={i} className={i + 1 === d.activeDot ? "on" : undefined} />
          ))}
        </div>
      )}
      {d.handle && (
        <div className="handle">
          <Leaf className="hleaf" />
          <span>{d.handle}</span>
          <Leaf className="hleaf r" />
        </div>
      )}
    </div>
  );
});
