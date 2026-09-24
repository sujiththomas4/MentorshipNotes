import { forwardRef } from "react";
import { IG, IG_H, IG_W, IgBackground, IgHeader, IgSolidBadge, SENTIMENT, fitFont, fitLines, wrapText, type Sentiment } from "@/social/instagram/kit";
import { MARKET_ORDER, TOTAL_SLIDES, parsePoints, type GlobalMarketData, type MarketKey } from "./data";
import { MarketIcon } from "./icons";

const PANEL_X = 60;
const PANEL_W = IG_W - 120;
const PANEL_Y = 400;
const TOP_H = 250;
const CHART_H = 300;

/** Colour and arrow for the second figure. A "%"/change figure is coloured by its sign;
 *  anything else (e.g. "More Shorts") takes the card's sentiment colour. */
function secondStyle(label: string, value: string, sentiment: Sentiment) {
  if (/%|change/i.test(label)) {
    const v = value.trim();
    const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
    if (v.startsWith("-") || v.startsWith("−") || n < 0) return { color: IG.bear, mark: "▼" };
    if (n > 0) return { color: IG.bull, mark: "▲" };
    return { color: IG.text, mark: "" };
  }
  return { color: SENTIMENT[sentiment].color, mark: "" };
}

/** Decorative random walk trending with the sentiment. Same shape every render. */
function decorativeSeries(seedText: string, sentiment: Sentiment, n = 70) {
  let seed = 0;
  for (const ch of seedText) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const drift = sentiment === "BULLISH" ? 0.9 : sentiment === "BEARISH" ? -0.9 : 0;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < n; i++) {
    v += drift + (rnd() - 0.5) * (sentiment === "NEUTRAL" ? 3 : 5);
    if (sentiment === "NEUTRAL") v += (50 - v) * 0.15;
    out.push(v);
  }
  return out;
}

function Sparkline({ values, color, uid, x, y, w, h }: { values: number[]; color: string; uid: string; x: number; y: number; w: number; h: number }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const px = (i: number) => x + (i / (values.length - 1)) * w;
  const py = (v: number) => y + h - ((v - lo) / span) * h;
  const line = values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.45" />
          <stop offset="1" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={`${line} L${x + w} ${y + h} L${x} ${y + h} Z`} fill={`url(#${uid}-fill)`} />
      <path d={line} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
}

/** Slides 2–7: one market in detail. */
export const DetailSlide = forwardRef<SVGSVGElement, { data: GlobalMarketData; k: MarketKey; className?: string }>(function DetailSlide(
  { data, k, className },
  ref,
) {
  const m = data.markets[k];
  const uid = `dt-${k}`;
  const page = MARKET_ORDER.indexOf(k) + 2;
  const s = SENTIMENT[m.sentiment];

  // heading
  const title = fitLines(m.title.trim() || m.name.trim() || "—", 440, 64, 44, 34);
  const titleCenter = m.subtitle.trim() ? 258 : 272;
  const titleBlock = title.lines.length * title.size * 1.1;

  // figures
  const value = m.value.trim() || "—";
  const second = m.change.trim() || "—";
  const valueSize = fitFont(value, 400, 68, 34);
  const secondSize = fitFont(second + "  ", 400, 68, 30);
  const st = second === "—" ? { color: IG.text, mark: "" } : secondStyle(m.secondLabel, second, m.sentiment);

  // chart
  const pts = m.chart === "points" ? parsePoints(m.points) : m.chart === "auto" ? decorativeSeries(k + m.name, m.sentiment) : [];
  const hasChart = m.chart !== "off";
  const panelH = TOP_H + (hasChart ? CHART_H : 0);
  const panelBottom = PANEL_Y + panelH;

  // description
  const descStart = panelBottom + 74;
  const descLines = wrapText(m.description, 50, Math.max(1, Math.floor((1235 - descStart) / 52) + 1));

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${IG_W} ${IG_H}`}
      width={IG_W}
      height={IG_H}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${m.title} ${m.sentiment}`}
    >
      <IgBackground id={uid} />
      <IgHeader date={data.date} />

      {/* heading row */}
      <MarketIcon k={k} x={60} y={196} size={152} uid={uid} />
      {title.lines.map((line, i) => (
        <text
          key={i}
          x={240}
          y={titleCenter - titleBlock / 2 + (i + 0.5) * title.size * 1.1}
          dominantBaseline="central"
          fill={IG.text}
          fontFamily={IG.font}
          fontSize={title.size}
          fontWeight={800}
        >
          {line}
        </text>
      ))}
      {m.subtitle.trim() && (
        <text x={240} y={titleCenter + titleBlock / 2 + 26} dominantBaseline="central" fill={IG.muted} fontFamily={IG.font} fontSize={30} fontWeight={600}>
          {m.subtitle}
        </text>
      )}
      <IgSolidBadge right={IG_W - 60} y={230} sentiment={m.sentiment} />

      {/* figures panel */}
      <rect x={PANEL_X} y={PANEL_Y} width={PANEL_W} height={panelH} rx={28} fill={IG.card} fillOpacity={0.85} stroke={IG.border} strokeWidth={2} />
      <text x={100} y={462} fill={IG.muted} fontFamily={IG.font} fontSize={30} fontWeight={600}>
        Value
      </text>
      <text x={100} y={548} fill={IG.text} fontFamily={IG.font} fontSize={valueSize} fontWeight={800}>
        {value}
      </text>
      {m.valueNote.trim() && (
        <text x={100} y={600} fill={IG.muted} fontFamily={IG.font} fontSize={26} fontWeight={500}>
          {m.valueNote}
        </text>
      )}
      <line x1={540} x2={540} y1={436} y2={620} stroke={IG.border} strokeWidth={2} />
      <text x={580} y={462} fill={IG.muted} fontFamily={IG.font} fontSize={30} fontWeight={600}>
        {m.secondLabel}
      </text>
      <text x={580} y={548} fill={st.color} fontFamily={IG.font} fontSize={secondSize} fontWeight={800}>
        {second}
        {st.mark && (
          <tspan dx={16} fontSize={secondSize * 0.62}>
            {st.mark}
          </tspan>
        )}
      </text>
      {hasChart && (
        <g>
          <line x1={100} x2={IG_W - 100} y1={PANEL_Y + TOP_H} y2={PANEL_Y + TOP_H} stroke={IG.border} strokeOpacity={0.6} strokeWidth={2} />
          <Sparkline values={pts} color={s.color} uid={uid} x={100} y={PANEL_Y + TOP_H + 40} w={PANEL_W - 80} h={CHART_H - 80} />
        </g>
      )}

      {/* description */}
      {descLines.map((line, i) => (
        <text key={i} x={62} y={descStart + i * 52} fill={IG.text} fontFamily={IG.font} fontSize={34} fontWeight={500}>
          {line}
        </text>
      ))}

      {/* footer */}
      <text x={60} y={1290} fill={IG.muted} fontFamily={IG.font} fontSize={26} fontWeight={700}>
        {page}/{TOTAL_SLIDES}
      </text>
      <text x={IG_W - 60} y={1290} textAnchor="end" fill={IG.text} fontFamily={IG.font} fontSize={26} fontWeight={700}>
        {data.swipe}
      </text>
    </svg>
  );
});
