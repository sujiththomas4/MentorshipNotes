import { forwardRef, useId } from "react";
import { IG_W, wrapText } from "@/social/instagram/kit";
import { LIGHT, PALETTES } from "@/social/instagram/swing-trade/artwork";
import { SetupChart } from "./setup-chart";
import type { SetupData } from "./setup-data";
import { EduDefs, EduFooter, EduHeader, EduIcon, TitleBlock, flow, placeChart, t } from "./shared";

/*
 * Indicator Setup post (Indian Traders, Swing Trade style), 1080 × 1350 feed coordinates:
 * header · title block (140–400) · chart (410, grows in a story) · three steps (880) ·
 * rule strip (1118) · footer (1270).
 */

export function setupLayout(d: SetupData) {
  const f = flow(d.layout, [
    { y: 140, h: 260 },
    { y: 410, h: 450, grow: 0.6 },
    { y: 880, h: 222, grow: 0.25 },
    { y: 1118, h: 132 },
  ]);
  return { ...f, chartBox: { x: 40, y: 410, w: 1001, h: f.secs[1].h }, chartDy: f.secs[1].dy };
}

export const SetupArtwork = forwardRef<SVGSVGElement, { data: SetupData; className?: string }>(function SetupArtwork({ data: d, className }, ref) {
  const u = `is${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;
  const C = PALETTES[d.layout.theme] ?? LIGHT;
  const L = setupLayout(d);
  const at = (i: number) => `translate(0 ${L.secs[i].dy})`;
  const B = L.chartBox;
  const cp = placeChart(d, B);

  // steps: three cards in a row
  const stepsH = L.secs[2].h;
  const cardTop = 880 + (d.stepsTitle ? 34 : 0);
  const cardH = 880 + stepsH - cardTop;
  const cardW = (1001 - 2 * 16) / 3;
  const k = Math.min(1.2, Math.max(1, cardH / 188));
  const ruleLines = wrapText(d.rule, 72, 2);

  return (
    <svg ref={ref} viewBox={`0 0 ${IG_W} ${L.H}`} width={IG_W} height={L.H} xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={`${d.titleA} ${d.titleB}`}>
      <defs>
        <EduDefs u={u} C={C} />
        <clipPath id={`${u}chart`}>
          <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={17} />
        </clipPath>
      </defs>
      <rect width={IG_W} height={L.H} fill={`url(#${u}bg)`} />
      <rect width={IG_W} height={L.H} fill={`url(#${u}glow)`} />

      {d.layout.showHeader && <EduHeader d={d} C={C} />}

      <g transform={at(0)}>
        <TitleBlock d={d} C={C} u={u} />
      </g>

      {/* chart */}
      <g transform={at(1)}>
        <g clipPath={`url(#${u}chart)`}>
          {d.chart ? (
            <g>
              <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={C.chartBg} />
              <image href={d.chart} x={cp.x} y={cp.y} width={cp.w} height={cp.h} preserveAspectRatio="none" />
            </g>
          ) : (
            <SetupChart kind={d.sample} B={B} C={C} tag={d.sampleTag} />
          )}
          {d.chartCaption && (
            <g>
              <rect x={B.x} y={B.y} width={d.chartCaption.length * 9.6 + 34} height={38} fill={C.card} fillOpacity={0.92} />
              <text x={B.x + 17} y={B.y + 25} {...t(16, 700, C.chartText)} letterSpacing={0.3}>
                {d.chartCaption}
              </text>
            </g>
          )}
        </g>
        <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={17} fill="none" stroke={C.border} strokeWidth={1.5} />
      </g>

      {/* steps */}
      <g transform={at(2)}>
        {d.stepsTitle && (
          <text x={44} y={902} {...t(17, 800, C.label)} letterSpacing={1.4}>
            {d.stepsTitle}
          </text>
        )}
        {d.steps.map((s, i) => {
          const x = 40 + i * (cardW + 16);
          const lines = wrapText(s.text, Math.floor(30 / k), 4);
          return (
            <g key={i}>
              <rect x={x} y={cardTop} width={cardW} height={cardH} rx={16} fill={C.card} stroke={C.border} strokeWidth={1.5} />
              <circle cx={x + 36} cy={cardTop + 38} r={19 * k} fill={C.emerald} />
              <text x={x + 36} y={cardTop + 39} textAnchor="middle" dominantBaseline="central" {...t(20 * k, 800, "#fff")}>
                {i + 1}
              </text>
              <EduIcon name={s.icon} x={x + cardW - 58} y={cardTop + 18} size={40} color={C.icon} />
              <text x={x + 20} y={cardTop + 88 * k} {...t(21 * k, 800, C.strong)}>
                {s.title}
              </text>
              {lines.map((l, j) => (
                <text key={j} x={x + 20} y={cardTop + 88 * k + 28 * k + j * 22 * k} {...t(16.5 * k, 500, C.body)}>
                  {l}
                </text>
              ))}
            </g>
          );
        })}
      </g>

      {/* rule strip */}
      <g transform={at(3)}>
        <rect x={40} y={1118} width={1001} height={132} rx={16} fill={C.risk} />
        <rect x={40} y={1118} width={8} height={132} rx={4} fill={C.emerald} />
        <EduIcon name="target" x={74} y={1158} size={52} color={C.emerald} />
        <text x={150} y={1156} {...t(17, 800, C.emerald)} letterSpacing={1.4}>
          {d.ruleLabel}
        </text>
        {ruleLines.map((l, j) => (
          <text key={j} x={150} y={1190 + j * 30} {...t(22, 700, C.strong)}>
            {l}
          </text>
        ))}
      </g>

      {d.layout.showFooter && (
        <g transform={`translate(0 ${L.footerDy})`}>
          <EduFooter text={d.footer} C={C} u={u} />
        </g>
      )}
    </svg>
  );
});
