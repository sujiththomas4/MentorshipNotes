import { forwardRef } from "react";
import { IG_H, IG_W, IgBackground, IgFooter, IgHeader, IgPaletteProvider, IgSentimentCard, fitFont, fitLines, formatIgDate, igPalette, useIg } from "@/social/instagram/kit";
import { igSpread } from "@/social/instagram/layout";
import { MARKET_ORDER, TOTAL_SLIDES, type GlobalMarketData, type MarketItem, type MarketKey } from "./data";
import { MarketIcon } from "./icons";

/* Cover, laid out like the reference: title block, then six tiles in 3 columns × 2 rows. */

const COLS = 3;
const GAP = 24;
const TILE_W = (IG_W - 120 - GAP * (COLS - 1)) / COLS; // 304
const TILE_H = 330;
const GRID_TOP = 490;

function Tile({ k, item, x, y, glass, opacity }: { k: MarketKey; item: MarketItem; x: number; y: number; glass: boolean; opacity: number }) {
  const IG = useIg();
  const cx = x + TILE_W / 2;
  const { lines, size } = fitLines(item.name.trim() || "—", TILE_W - 36, 34, 26, 22);
  // the OI tile shows the buildup side (e.g. "PE Buildup"); others show value + change
  const detail = k === "oiBuildup" ? (item.buildup ? `${item.buildup} Buildup` : "") : [item.value.trim(), item.change.trim()].filter(Boolean).join("  ");
  const nameMid = y + 172;
  const pillW = TILE_W - 64;
  const pillY = y + TILE_H - 88;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={TILE_W}
        height={TILE_H}
        rx={22}
        fill={IG.card}
        fillOpacity={glass ? opacity : 0.88}
        stroke={glass ? "#6f93ad" : IG.border}
        strokeOpacity={glass ? 0.8 : 1}
        strokeWidth={2}
      />
      <MarketIcon k={k} x={cx - 48} y={y + 30} size={96} uid={`cv-${k}`} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={nameMid + (i - (lines.length - 1) / 2) * size * 1.08}
          textAnchor="middle"
          dominantBaseline="central"
          fill={IG.text}
          fontFamily={IG.font}
          fontSize={size}
          fontWeight={800}
        >
          {line}
        </text>
      ))}
      {detail && (
        <text x={cx} y={y + 216} textAnchor="middle" dominantBaseline="central" fill={IG.muted} fontFamily={IG.font} fontSize={fitFont(detail, TILE_W - 30, 21, 15)} fontWeight={600}>
          {detail}
        </text>
      )}
      <IgSentimentCard x={cx - pillW / 2} y={pillY} w={pillW} h={62} sentiment={item.sentiment} />
    </g>
  );
}

export const COVER_PHOTO = "/social/instagram/global-market/cover-bg.jpg";

/**
 * Landscape photo (1448 × 1086) scaled to fill the portrait canvas and centred, with a navy
 * overlay that is darkest behind the title so text stays readable. `dim` is 0–90 (%).
 */
export function PhotoBackground({ dim, uid = "cv", detail = false, h = IG_H }: { dim: number; uid?: string; detail?: boolean; h?: number }) {
  const IG = useIg();
  const k = Math.min(90, Math.max(0, dim)) / 100;
  const c = (v: number) => Math.min(0.95, v);
  // cover: darkest behind the title, lightest at the globe; detail slides keep the lower
  // part darker too, because the description text sits there
  const stops: [number, number][] = detail
    ? [
        [0, c(k + 0.3)],
        [0.35, c(k + 0.1)],
        [0.7, c(k + 0.25)],
        [1, c(k + 0.2)],
      ]
    : [
        [0, c(k + 0.3)],
        [0.36, c(k + 0.15)],
        [0.62, k],
        [1, k * 0.45],
      ];
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-dim`} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o, a]) => (
            <stop key={o} offset={o} stopColor={IG.bg} stopOpacity={a} />
          ))}
        </linearGradient>
      </defs>
      <rect width={IG_W} height={h} fill={IG.bg} />
      <image href={COVER_PHOTO} x={0} y={0} width={IG_W} height={h} preserveAspectRatio="xMidYMid slice" />
      <rect width={IG_W} height={h} fill={`url(#${uid}-dim)`} />
    </g>
  );
}

/** Slide 1: the cover with all six markets. */
export const CoverSlide = forwardRef<SVGSVGElement, { data: GlobalMarketData; className?: string }>(function CoverSlide({ data, className }, ref) {
  const IG = igPalette(data.layout.theme);
  // header above 160; body: title block | tiles; footer from 1240
  const L = igSpread(data.layout, 160, 1240, [470]);
  const titleSize = fitFont(data.titleTop, 940, 76, 40);
  const accentSize = fitFont(data.titleAccent, 960, 104, 44);
  return (
    <IgPaletteProvider value={IG}>
      <svg
        ref={ref}
        viewBox={`0 0 ${IG_W} ${L.H}`}
        width={IG_W}
        height={L.H}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={`${data.titleTop} ${data.titleAccent}, ${formatIgDate(data.date)}`}
      >
        <defs>
          <linearGradient id="cv-accent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3fe46a" />
            <stop offset="0.6" stopColor="#20e8a0" />
            <stop offset="1" stopColor="#35c8f0" />
          </linearGradient>
        </defs>
        {data.coverPhoto ? <PhotoBackground dim={data.coverDim} h={L.H} /> : <IgBackground id="cv" h={L.H} />}
        {data.layout.showHeader && <IgHeader date={data.date} logo={data.logo} />}

        <g transform={`translate(0 ${L.dy(0)})`}>
          <text x={IG_W / 2} y={292} textAnchor="middle" fill={IG.text} fontFamily={IG.font} fontSize={titleSize} fontWeight={800} letterSpacing={1}>
            {data.titleTop}
          </text>
          <text x={IG_W / 2} y={396} textAnchor="middle" fill="url(#cv-accent)" fontFamily={IG.font} fontSize={accentSize} fontWeight={800} letterSpacing={1}>
            {data.titleAccent}
          </text>
          <text x={IG_W / 2} y={452} textAnchor="middle" fill="#d7e0e7" fontFamily={IG.font} fontSize={fitFont(data.subtitle, 960, 28, 16)} fontWeight={500} xmlSpace="preserve">
            {data.subtitle}
          </text>
        </g>

        <g transform={`translate(0 ${L.dy(1)})`}>
          {MARKET_ORDER.map((k, i) => (
            <Tile
              key={k}
              k={k}
              glass={data.coverPhoto}
              opacity={data.cardOpacity / 100}
              item={data.markets[k]}
              x={60 + (i % COLS) * (TILE_W + GAP)}
              y={GRID_TOP + Math.floor(i / COLS) * (TILE_H + GAP)}
            />
          ))}
        </g>

        {data.layout.showFooter && (
          <g transform={`translate(0 ${L.footerDy})`}>
            <IgFooter left={data.footer} page={`1/${TOTAL_SLIDES}`} />
          </g>
        )}
      </svg>
    </IgPaletteProvider>
  );
});
