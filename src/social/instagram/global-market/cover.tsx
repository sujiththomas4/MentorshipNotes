import { forwardRef } from "react";
import { IG, IG_H, IG_W, IgBackground, IgFooter, IgHeader, IgSentimentBadge, SENTIMENT, fitFont, fitLines, formatIgDate } from "@/social/instagram/kit";
import { MARKET_ORDER, TOTAL_SLIDES, type GlobalMarketData, type MarketItem, type MarketKey } from "./data";
import { MarketIcon } from "./icons";

const CARD_W = 465;
const CARD_H = 222;
const GAP = 30;
const GRID_TOP = 452;

function MarketCard({ k, item, x, y }: { k: MarketKey; item: MarketItem; x: number; y: number }) {
  const s = SENTIMENT[item.sentiment];
  const { lines, size } = fitLines(item.name.trim() || "—", CARD_W - 164, 34, 26);
  const detail = [item.value.trim(), item.change.trim()].filter(Boolean).join("   ");
  const nameTop = detail ? y + 66 : y + 80;
  return (
    <g>
      <rect x={x} y={y} width={CARD_W} height={CARD_H} rx={24} fill={IG.card} stroke={IG.border} strokeOpacity={0.7} strokeWidth={2} />
      <rect x={x} y={y + 24} width={5} height={CARD_H - 48} rx={2.5} fill={s.color} />
      <MarketIcon k={k} x={x + 30} y={y + 28} size={88} uid={`cv-${k}`} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + 140}
          y={nameTop + (i - (lines.length - 1) / 2) * size * 1.1}
          dominantBaseline="central"
          fill={IG.text}
          fontFamily={IG.font}
          fontSize={size}
          fontWeight={800}
          letterSpacing={0.5}
        >
          {line}
        </text>
      ))}
      {detail && (
        <text x={x + 140} y={y + 104} dominantBaseline="central" fill={IG.muted} fontFamily={IG.font} fontSize={23} fontWeight={600}>
          {detail}
        </text>
      )}
      <IgSentimentBadge x={x + 30} y={y + CARD_H - 76} w={CARD_W - 60} h={52} sentiment={item.sentiment} />
    </g>
  );
}

/** Slide 1: the cover with all six markets. */
export const CoverSlide = forwardRef<SVGSVGElement, { data: GlobalMarketData; className?: string }>(function CoverSlide(
  { data, className },
  ref,
) {
  const titleSize = fitFont(data.titleTop, 940, 62, 36);
  const accentSize = fitFont(data.titleAccent, 940, 84, 40);
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${IG_W} ${IG_H}`}
      width={IG_W}
      height={IG_H}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${data.titleTop} ${data.titleAccent}, ${formatIgDate(data.date)}`}
    >
      <defs>
        <linearGradient id="cv-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5CF29A" />
          <stop offset="1" stopColor="#1FC7A4" />
        </linearGradient>
      </defs>
      <IgBackground id="cv" />
      <IgHeader date={data.date} />

      <text x={IG_W / 2} y={262} textAnchor="middle" fill={IG.text} fontFamily={IG.font} fontSize={titleSize} fontWeight={800} letterSpacing={1}>
        {data.titleTop}
      </text>
      <text x={IG_W / 2} y={352} textAnchor="middle" fill="url(#cv-accent)" fontFamily={IG.font} fontSize={accentSize} fontWeight={800} letterSpacing={2}>
        {data.titleAccent}
      </text>
      <text x={IG_W / 2} y={404} textAnchor="middle" fill={IG.muted} fontFamily={IG.font} fontSize={fitFont(data.subtitle, 960, 25, 16)} fontWeight={600}>
        {data.subtitle}
      </text>

      {MARKET_ORDER.map((k, i) => (
        <MarketCard key={k} k={k} item={data.markets[k]} x={60 + (i % 2) * (CARD_W + GAP)} y={GRID_TOP + Math.floor(i / 2) * (CARD_H + GAP)} />
      ))}

      <IgFooter left={data.footer} page={`1/${TOTAL_SLIDES}`} />
    </svg>
  );
});
