import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from "react";
import { logoSrc } from "../farm-tip/artwork";
import { BvIcon, themeClass, useAutoFit, type FitResult } from "../shared";
import type { PagesLook } from "./data";
import type { ToonCoverPage, ToonIdeaPage, ToonItem, ToonMini, ToonPage } from "./toon-data";
import "../farm-tip/artwork.css";
import "./toon.css";

/*
 * Caricature pages: content-first slides with their own light frame (see toon-data.ts).
 */

type Props = { look: PagesLook; page: ToonPage; n: number; total: number; onFit?: (r: FitResult) => void };

const pct = (v: number) => String(Math.min(200, Math.max(40, Number(v) || 100)) / 100);

/** Title lines coloured by the pattern (dark = black, g = green). */
function Colored({ text, colors }: { text: string; colors: "alternate" | "firstDark" | "allGreen" | "allDark" }) {
  const lines = String(text || "").split("\n");
  return (
    <>
      {lines.map((l, i) => {
        const green = colors === "allGreen" || (colors === "alternate" && i % 2 === 1) || (colors === "firstDark" && i > 0);
        return (
          <span key={i}>
            {i > 0 && <br />}
            <span className={green ? "g" : "dk"}>{l}</span>
          </span>
        );
      })}
    </>
  );
}

/** Leaf sprig drawn in SVG (corners). */
function Sprig({ className }: { className: string }) {
  const leaf = (x: number, y: number, r: number, s: number, c: string) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C18 -22 52 -26 78 -8 C52 10 20 14 0 0Z" fill={c} />
      <path d="M2 0 C28 -8 50 -9 74 -8" stroke="#ffffff" strokeOpacity=".45" strokeWidth="2" fill="none" />
    </g>
  );
  return (
    <svg className={`t-leaf ${className}`} viewBox="0 0 300 230" aria-hidden="true">
      <path d="M10 225 C60 170 120 120 290 40" stroke="#6b9e3c" strokeWidth="5" fill="none" strokeLinecap="round" />
      {leaf(40, 190, -70, 1.1, "#4f9a2f")}
      {leaf(70, 168, 20, 1.0, "#78b845")}
      {leaf(110, 140, -60, 1.15, "#3f8a27")}
      {leaf(150, 115, 25, 1.05, "#86c255")}
      {leaf(195, 90, -50, 1.0, "#4f9a2f")}
      {leaf(240, 64, 15, 0.9, "#78b845")}
    </svg>
  );
}

const FARMER = (
  <svg viewBox="0 0 120 150" fill="none" aria-hidden="true">
    <ellipse cx="60" cy="30" rx="44" ry="10" fill="currentColor" opacity=".55" />
    <path d="M36 30c2-14 12-22 24-22s22 8 24 22" fill="currentColor" opacity=".7" />
    <circle cx="60" cy="48" r="18" fill="currentColor" />
    <path d="M26 146c0-34 14-58 34-58s34 24 34 58Z" fill="currentColor" />
  </svg>
);

function Character({ src, fade, style, className = "" }: { src: string; fade: boolean; style?: CSSProperties; className?: string }) {
  return (
    <div className={`t-char ${className}${fade ? " fade" : ""}`} style={style}>
      {src ? (
        <img src={src} alt="Caricature" />
      ) : (
        <div className="t-ph">
          {FARMER}
          ADD A<br />
          CARICATURE
        </div>
      )}
    </div>
  );
}

function List({ items, style }: { items: ToonItem[]; style: ToonIdeaPage["itemStyle"] }) {
  const shown = items.filter((i) => i.text.trim() || i.sub.trim());
  return (
    <ul className={`t-list ${style === "photo" ? "pics" : style}`}>
      {shown.map((it, i) => (
        <li key={i}>
          {style === "photo" && it.image ? (
            <span className="t-ic pic">
              <img src={it.image} alt="" />
            </span>
          ) : (
            <span className="t-ic">
              <BvIcon name={it.icon} />
            </span>
          )}
          <span className="t-it">
            {it.text.trim() && <b>{it.text}</b>}
            {it.sub.trim() && <span lang="ml">{it.sub}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Row({ row, bare }: { row: ToonMini[]; bare?: boolean }) {
  const shown = row.filter((r) => r.icon);
  return (
    <div className={`t-row${bare ? " bare" : ""}`}>
      {shown.map((r, i) => (
        <div key={i}>
          <span className="c">
            <BvIcon name={r.icon} />
          </span>
          {r.text.trim() && <span lang="ml">{r.text}</span>}
        </div>
      ))}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="t-tip">
      <span className="bulb">
        <BvIcon name="lightbulb" />
      </span>
      <p lang="ml">
        {String(text)
          .split("\n")
          .map((l, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {l}
            </span>
          ))}
      </p>
    </div>
  );
}

export const ToonArtwork = forwardRef<HTMLDivElement, Props>(function ToonArtwork({ look, page, n, total, onFit }, ref) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  useAutoFit(root, [look, page], 0.55, onFit);
  const feed = look.format === "feed";
  const H = feed ? 1350 : 1920;
  const handle = String(look.handle || "").trim();
  const arrow = page.showArrow && n < total;
  const bottom = arrow ? 190 : handle ? 110 : 50;
  const top = page.showLogo ? 205 : 70;
  const vars = { "--ts": pct(page.titleSize), "--tx": pct(page.textSize), "--cs": pct(page.charSize) } as CSSProperties;

  return (
    <div ref={root} className={`bv2 canvas pg-toon${feed ? " feed" : ""}${themeClass(look.theme)}`} style={vars}>
      {page.leaves && (
        <>
          <Sprig className="tr" />
          <Sprig className="bl" />
        </>
      )}
      {page.kind === "toonCover" ? <Cover p={page} H={H} top={top} bottom={bottom} /> : page.layout === "split" ? <Split p={page} H={H} top={top} bottom={bottom} /> : <Card p={page} H={H} bottom={bottom} />}

      {page.showLogo && (
        <div className="t-logo">
          <span>
            <img src={logoSrc(look.headerLogo)} alt="Bethlehem Valley" />
          </span>
        </div>
      )}
      {look.pageNumbers && total > 1 && (
        <div className="t-count">
          {n}/{total}
        </div>
      )}
      {arrow && (
        <div className="t-arrow">
          <BvIcon name="arrow" />
        </div>
      )}
      {handle && (
        <div className="t-foot">
          <BvIcon name="instagram" />
          {handle}
        </div>
      )}
    </div>
  );
});

function Cover({ p, H, top, bottom }: { p: ToonCoverPage; H: number; top: number; bottom: number }) {
  const row = p.row.filter((r) => r.icon);
  const rowH = row.length ? 190 : 0;
  const rowTop = H - bottom - rowH;
  return (
    <>
      {p.scene && <div className="tc-scene" style={{ backgroundImage: `url('${p.scene}')` }} />}
      <Character src={p.character} fade={p.charFade} className="" style={{ right: 0, top: 110, bottom: bottom - 20, width: 600, transform: "scale(var(--cs))", transformOrigin: "bottom right" }} />
      <div className="copy tc-copy" style={{ top, height: (row.length ? rowTop - 24 : H - bottom) - top }}>
        <h1 className="t-title disp">
          <Colored text={p.title} colors={p.colors} />
          <BvIcon name="leaf" />
        </h1>
        {p.subtitle.trim() && (
          <div className="tc-sub" lang="ml">
            {p.subtitle.split("\n").map((l, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {l}
              </span>
            ))}
          </div>
        )}
        {p.showBadge && (p.badgeNumber.trim() || p.badgeText.trim()) && (
          <div className="tc-badge">
            {p.badgeNumber.trim() && <b>{p.badgeNumber}</b>}
            {p.badgeText.trim() && (
              <span>
                {p.badgeText.split("\n").map((l, i) => (
                  <span key={i} style={{ display: "block", margin: 0 }}>
                    {l}
                  </span>
                ))}
              </span>
            )}
          </div>
        )}
      </div>
      {row.length > 0 && (
        <div className="tc-row" style={{ top: rowTop }}>
          <Row row={row} />
        </div>
      )}
    </>
  );
}

function NumberBadge({ p }: { p: ToonIdeaPage }) {
  return p.number.trim() ? <span className={`t-num ${p.numberStyle}`}>{p.number}</span> : null;
}

function Card({ p, H, bottom }: { p: ToonIdeaPage; H: number; bottom: number }) {
  const hasTop = !!(p.topTitle.trim() || p.topSub.trim());
  const top = hasTop ? 46 : p.showLogo ? 205 : 60;
  return (
    <div className="copy ti-copy" style={{ top, height: H - bottom - top }}>
      {hasTop && (
        <div className="ti-top">
          {p.topTitle.trim() && (
            <h2 className="t-title disp ti-series">
              <Colored text={p.topTitle} colors="alternate" />
            </h2>
          )}
          {p.topSub.trim() && <div className="t-sub">{p.topSub}</div>}
        </div>
      )}
      <div className={`ti-card${p.numberStyle === "flag" ? " flag" : ""}`}>
        <div className="ti-head">
          <NumberBadge p={p} />
          <div className="h">
            <h1 className="t-title disp">
              <Colored text={p.heading} colors={p.colors} />
            </h1>
            <div className="t-rule">
              <i />
              <BvIcon name="leaf" className="" />
            </div>
          </div>
        </div>
        <div className="ti-body">
          <List items={p.items} style={p.itemStyle} />
        </div>
        {p.showTip && p.tip.trim() && <Tip text={p.tip} />}
        <Character src={p.character} fade={p.charFade} />
      </div>
      {p.showRow && (
        <div className="ti-rowwrap">
          <Row row={p.row} bare />
        </div>
      )}
    </div>
  );
}

function Split({ p, H, top, bottom }: { p: ToonIdeaPage; H: number; top: number; bottom: number }) {
  const archTop = Math.max(150, top - 40);
  return (
    <>
      <div className="ts-arch" style={{ top: archTop, bottom: bottom - 10 }} />
      <Character src={p.character} fade={p.charFade} className="ts-char" style={{ top: archTop + 20, bottom: bottom - 10, transform: "scale(var(--cs))", transformOrigin: "bottom right" }} />
      <div className="copy ts-copy" style={{ top, height: H - bottom - top }}>
        <div className="ts-head">
          <NumberBadge p={p} />
          <h1 className="t-title disp">
            <Colored text={p.heading} colors={p.colors} />
          </h1>
          <div className="t-rule">
            <i />
            <b />
            <b />
            <b />
          </div>
          {p.headingSub.trim() && (
            <div className="hs" lang="ml">
              {p.headingSub}
            </div>
          )}
        </div>
        <div className="ts-list">
          <List items={p.items} style={p.itemStyle} />
        </div>
        {p.showTip && p.tip.trim() && <Tip text={p.tip} />}
        {p.showRow && (
          <div className="ts-rowwrap">
            <Row row={p.row} bare />
          </div>
        )}
      </div>
    </>
  );
}

