import { forwardRef } from "react";
import {
  IG,
  IG_W,
  IgBackground,
  IgHeader,
  IgPaletteProvider,
  IgSolidBadge,
  igPalette,
  useIg,
  SENTIMENT,
  fitFont,
  fitLines,
  wrapText,
  type Sentiment,
} from "@/social/instagram/kit";
import {
  MARKET_ORDER,
  TOTAL_SLIDES,
  parsePoints,
  type GlobalMarketData,
  type MarketItem,
  type MarketKey,
} from "./data";
import { PhotoBackground } from "./cover";
import { igSpread } from "@/social/instagram/layout";
import { MarketIcon } from "./icons";

const PANEL_X = 60;
const PANEL_W = IG_W - 120;
const PANEL_Y = 400;
const TOP_H = 250;
const CHART_H = 300;

/** Chart pictures per sentiment (decorative, not price data). Missing = drawn trend line. */
export const SENTIMENT_CHART_IMAGE: Partial<Record<Sentiment, string>> = {
  BULLISH: "/social/instagram/global-market/chart-bullish.jpg",
  BEARISH: "/social/instagram/global-market/chart-bearish.jpg",
};

/** Colour and arrow for the second figure. A "%"/change figure is coloured by its sign;
 *  anything else (e.g. "More Shorts") takes the card's sentiment colour. */
function secondStyle(label: string, value: string, sentiment: Sentiment) {
  if (/%|change/i.test(label)) {
    const v = value.trim();
    const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
    if (v.startsWith("-") || v.startsWith("−") || n < 0)
      return { color: IG.bear, mark: "▼" };
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
  const drift =
    sentiment === "BULLISH" ? 0.9 : sentiment === "BEARISH" ? -0.9 : 0;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < n; i++) {
    v += drift + (rnd() - 0.5) * (sentiment === "NEUTRAL" ? 3 : 5);
    if (sentiment === "NEUTRAL") v += (50 - v) * 0.15;
    out.push(v);
  }
  return out;
}

function Sparkline({
  values,
  color,
  uid,
  x,
  y,
  w,
  h,
}: {
  values: number[];
  color: string;
  uid: string;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const px = (i: number) => x + (i / (values.length - 1)) * w;
  const py = (v: number) => y + h - ((v - lo) / span) * h;
  const line = values
    .map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`)
    .join(" ");
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.45" />
          <stop offset="1" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path
        d={`${line} L${x + w} ${y + h} L${x} ${y + h} Z`}
        fill={`url(#${uid}-fill)`}
      />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
}

const OI_ROW_H = 230;

/** "+12.4 L" → ▲ (up), "-3.1 L" → ▼ (down), otherwise nothing. */
function oiMark(v: string) {
  const t = v.trim();
  const n = parseFloat(t.replace(/[^0-9.-]/g, ""));
  if (t.startsWith("-") || t.startsWith("−") || n < 0) return "▼";
  if (n > 0) return "▲";
  return "";
}

/** OI slide figures: CE / PE OI change on top, buildup side (+ optional note) below. */
function OiFigures({ m, uid }: { m: MarketItem; uid: string }) {
  const IG = useIg();
  const cols = [
    {
      x: 100,
      label: "CE OI Change",
      sub: "Calls",
      v: m.ceChange.trim() || "—",
      accent: IG.bear,
    },
    {
      x: 580,
      label: "PE OI Change",
      sub: "Puts",
      v: m.peChange.trim() || "—",
      accent: IG.bull,
    },
  ];
  const rowY = PANEL_Y + TOP_H;
  const bu = m.buildup;
  const buColors =
    bu === "CE" ? ["#f24a55", "#d31f2c"] : ["#16b978", "#079457"];
  const note = m.change.trim();
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-bu`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={buColors[0]} />
          <stop offset="1" stopColor={buColors[1]} />
        </linearGradient>
      </defs>
      {cols.map((c) => {
        const mark = c.v === "—" ? "" : oiMark(c.v);
        const size = fitFont(c.v + (mark ? "  " : ""), 400, 68, 32);
        return (
          <g key={c.label}>
            <rect
              x={c.x}
              y={440}
              width={8}
              height={30}
              rx={4}
              fill={c.accent}
            />
            <text
              x={c.x + 22}
              y={464}
              fill={IG.muted}
              fontFamily={IG.font}
              fontSize={30}
              fontWeight={600}
            >
              {c.label}
            </text>
            <text
              x={c.x}
              y={548}
              fill={IG.text}
              fontFamily={IG.font}
              fontSize={size}
              fontWeight={800}
            >
              {c.v}
              {mark && (
                <tspan
                  dx={14}
                  fontSize={size * 0.55}
                  fill={mark === "▲" ? IG.bull : IG.bear}
                >
                  {mark}
                </tspan>
              )}
            </text>
            <text
              x={c.x}
              y={600}
              fill={IG.muted}
              fontFamily={IG.font}
              fontSize={26}
              fontWeight={500}
            >
              {c.sub}
            </text>
          </g>
        );
      })}
      <line
        x1={540}
        x2={540}
        y1={436}
        y2={620}
        stroke={IG.border}
        strokeWidth={2}
      />
      <line
        x1={100}
        x2={IG_W - 100}
        y1={rowY}
        y2={rowY}
        stroke={IG.border}
        strokeOpacity={0.6}
        strokeWidth={2}
      />

      {/* buildup */}
      <text
        x={100}
        y={rowY + 62}
        fill={IG.muted}
        fontFamily={IG.font}
        fontSize={30}
        fontWeight={600}
      >
        Buildup
      </text>
      {bu ? (
        <g>
          <rect
            x={100}
            y={rowY + 88}
            width={400}
            height={104}
            rx={16}
            fill={`url(#${uid}-bu)`}
          />
          <circle
            cx={152}
            cy={rowY + 140}
            r={32}
            fill="#FFFFFF"
            fillOpacity={0.18}
          />
          <text
            x={152}
            y={rowY + 141}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontFamily={IG.font}
            fontSize={26}
            fontWeight={900}
          >
            {bu}
          </text>
          <text
            x={202}
            y={rowY + 141}
            dominantBaseline="central"
            fill="#FFFFFF"
            fontFamily={IG.font}
            fontSize={44}
            fontWeight={900}
          >
            {bu} BUILDUP
          </text>
        </g>
      ) : (
        <text
          x={100}
          y={rowY + 160}
          fill={IG.text}
          fontFamily={IG.font}
          fontSize={60}
          fontWeight={800}
        >
          —
        </text>
      )}
      {note && (
        <g>
          <text
            x={580}
            y={rowY + 62}
            fill={IG.muted}
            fontFamily={IG.font}
            fontSize={30}
            fontWeight={600}
          >
            {m.secondLabel || "Direction"}
          </text>
          <text
            x={580}
            y={rowY + 158}
            fill={SENTIMENT[m.sentiment].color}
            fontFamily={IG.font}
            fontSize={fitFont(note, 380, 54, 28)}
            fontWeight={800}
          >
            {note}
          </text>
        </g>
      )}
    </g>
  );
}

/** Slides 2–7: one market in detail. */
export const DetailSlide = forwardRef<
  SVGSVGElement,
  { data: GlobalMarketData; k: MarketKey; className?: string }
>(function DetailSlide({ data, k, className }, ref) {
  const IG = igPalette(data.layout.theme);
  const m = data.markets[k];
  const uid = `dt-${k}`;
  const page = MARKET_ORDER.indexOf(k) + 2;
  const s = SENTIMENT[m.sentiment];

  // heading
  const title = fitLines(
    m.title.trim() || m.name.trim() || "—",
    440,
    64,
    44,
    34,
  );
  const titleCenter = m.subtitle.trim() ? 258 : 272;
  const titleBlock = title.lines.length * title.size * 1.1;

  // figures
  const value = m.value.trim() || "—";
  const second = m.change.trim() || "—";
  const valueSize = fitFont(value, 400, 68, 34);
  const secondSize = fitFont(second + "  ", 400, 68, 30);
  const st =
    second === "—"
      ? { color: IG.text, mark: "" }
      : secondStyle(m.secondLabel, second, m.sentiment);

  // chart
  const pts =
    m.chart === "points"
      ? parsePoints(m.points)
      : m.chart === "auto"
        ? decorativeSeries(k + m.name, m.sentiment)
        : [];
  // the OI slide shows CE / PE OI change and a buildup row instead of value + chart
  const isOI = k === "oiBuildup";
  const hasChart = !isOI && m.chart !== "off";
  // "Trend by sentiment" uses a picture where one is set for the sentiment
  const chartImage =
    m.chart === "auto" ? SENTIMENT_CHART_IMAGE[m.sentiment] : undefined;
  const panelH = TOP_H + (hasChart ? CHART_H : isOI ? OI_ROW_H : 0);
  const panelBottom = PANEL_Y + panelH;

  // description
  const descStart = panelBottom + 74;
  // header above 170; body: heading row | panel | description; footer from 1245
  const L = igSpread(data.layout, 170, 1245, [395, panelBottom + 20]);
  const descLines = wrapText(
    m.description,
    50,
    Math.max(1, Math.floor((1235 - descStart) / 52) + 1),
  );

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
        aria-label={`${m.title} ${m.sentiment}`}
      >
        {data.coverPhoto ? (
          <PhotoBackground dim={data.coverDim} uid={uid} detail h={L.H} />
        ) : (
          <IgBackground id={uid} h={L.H} />
        )}
        {data.layout.showHeader && (
          <IgHeader date={data.date} logo={data.logo} />
        )}

        <g transform={`translate(0 ${L.dy(0)})`}>
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
            <text
              x={240}
              y={titleCenter + titleBlock / 2 + 26}
              dominantBaseline="central"
              fill={IG.muted}
              fontFamily={IG.font}
              fontSize={30}
              fontWeight={600}
            >
              {m.subtitle}
            </text>
          )}
          <IgSolidBadge right={IG_W - 60} y={205} sentiment={m.sentiment} />
        </g>

        <g transform={`translate(0 ${L.dy(1)})`}>
          {/* figures panel */}
          <rect
            x={PANEL_X}
            y={PANEL_Y}
            width={PANEL_W}
            height={panelH}
            rx={28}
            fill={IG.card}
            fillOpacity={data.coverPhoto ? data.cardOpacity / 100 : 0.85}
            stroke={IG.border}
            strokeWidth={2}
          />
          {isOI ? (
            <OiFigures m={m} uid={uid} />
          ) : (
            <>
              <text
                x={100}
                y={462}
                fill={IG.muted}
                fontFamily={IG.font}
                fontSize={30}
                fontWeight={600}
              >
                Value
              </text>
              <text
                x={100}
                y={548}
                fill={IG.text}
                fontFamily={IG.font}
                fontSize={valueSize}
                fontWeight={800}
              >
                {value}
              </text>
              {m.valueNote.trim() && (
                <text
                  x={100}
                  y={600}
                  fill={IG.muted}
                  fontFamily={IG.font}
                  fontSize={26}
                  fontWeight={500}
                >
                  {m.valueNote}
                </text>
              )}
              <line
                x1={540}
                x2={540}
                y1={436}
                y2={620}
                stroke={IG.border}
                strokeWidth={2}
              />
              <text
                x={580}
                y={462}
                fill={IG.muted}
                fontFamily={IG.font}
                fontSize={30}
                fontWeight={600}
              >
                {m.secondLabel}
              </text>
              <text
                x={580}
                y={548}
                fill={st.color}
                fontFamily={IG.font}
                fontSize={secondSize}
                fontWeight={800}
              >
                {second}
                {st.mark && (
                  <tspan dx={16} fontSize={secondSize * 0.62}>
                    {st.mark}
                  </tspan>
                )}
              </text>
            </>
          )}
          {hasChart && chartImage && (
            <g>
              <defs>
                <clipPath id={`${uid}-panel`}>
                  <rect
                    x={PANEL_X + 1}
                    y={PANEL_Y + TOP_H}
                    width={PANEL_W - 2}
                    height={CHART_H - 1}
                    rx={27}
                  />
                  <rect
                    x={PANEL_X + 1}
                    y={PANEL_Y + TOP_H}
                    width={PANEL_W - 2}
                    height={40}
                  />
                </clipPath>
              </defs>
              <image
                href={chartImage}
                x={PANEL_X + 1}
                y={PANEL_Y + TOP_H}
                width={PANEL_W - 2}
                height={CHART_H - 1}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${uid}-panel)`}
                opacity={data.chartOpacity / 100}
              />
            </g>
          )}
          {hasChart && (
            <g>
              <line
                x1={100}
                x2={IG_W - 100}
                y1={PANEL_Y + TOP_H}
                y2={PANEL_Y + TOP_H}
                stroke={IG.border}
                strokeOpacity={0.6}
                strokeWidth={2}
              />
              {!chartImage && (
                <Sparkline
                  values={pts}
                  color={s.color}
                  uid={uid}
                  x={100}
                  y={PANEL_Y + TOP_H + 40}
                  w={PANEL_W - 80}
                  h={CHART_H - 80}
                />
              )}
            </g>
          )}
        </g>

        {/* description */}
        <g transform={`translate(0 ${L.dy(2)})`}>
          {descLines.map((line, i) => (
            <text
              key={i}
              x={62}
              y={descStart + i * 52}
              fill={IG.text}
              fontFamily={IG.font}
              fontSize={34}
              fontWeight={500}
            >
              {line}
            </text>
          ))}
        </g>

        {/* footer */}
        {data.layout.showFooter && (
          <g transform={`translate(0 ${L.footerDy})`}>
            <text
              x={60}
              y={1290}
              fill={IG.muted}
              fontFamily={IG.font}
              fontSize={26}
              fontWeight={700}
            >
              {page}/{TOTAL_SLIDES}
            </text>
            <text
              x={IG_W - 60}
              y={1290}
              textAnchor="end"
              fill={IG.text}
              fontFamily={IG.font}
              fontSize={26}
              fontWeight={700}
            >
              {data.swipe}
            </text>
          </g>
        )}
      </svg>
    </IgPaletteProvider>
  );
});
