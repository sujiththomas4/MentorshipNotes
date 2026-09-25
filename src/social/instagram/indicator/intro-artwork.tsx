import { forwardRef, useId } from "react";
import { IG_W, fitFont, wrapText } from "@/social/instagram/kit";
import { LIGHT, PALETTES } from "@/social/instagram/swing-trade/artwork";
import type { IntroData } from "./data";
import { EduDefs, EduFooter, EduHeader, EduIcon, SampleChart, TitleBlock, flow, placeChart, t } from "./shared";

/*
 * Indicator Intro post (Indian Traders, Swing Trade style), 1080 × 1350 feed coordinates:
 * header · title block (140–400) · three facts (410) · chart (520, grows in a story) ·
 * "why it matters" + golden rule (980) · footer (1270).
 */

export function introLayout(d: IntroData) {
  const f = flow(d.layout, [
    { y: 140, h: 260 },
    { y: 410, h: 92 },
    { y: 520, h: 440, grow: 0.75 },
    { y: 980, h: 270 },
  ]);
  return { ...f, chartBox: { x: 40, y: 520, w: 1001, h: f.secs[2].h }, chartDy: f.secs[2].dy };
}

export const IntroArtwork = forwardRef<SVGSVGElement, { data: IntroData; className?: string }>(function IntroArtwork({ data: d, className }, ref) {
  const u = `ii${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;
  const C = PALETTES[d.layout.theme] ?? LIGHT;
  const L = introLayout(d);
  const at = (i: number) => `translate(0 ${L.secs[i].dy})`;
  const B = L.chartBox;
  const cp = placeChart(d, B);

  // why it matters: wrapped bullets
  const why = d.why.map((s) => s.trim()).filter(Boolean);
  let wy = 1072;
  const whyRows = why.map((s) => {
    const lines = wrapText(s, 44, 2);
    const row = { y: wy, lines };
    wy += lines.length * 26 + 14;
    return row;
  });
  // golden rule: Enter = new line, otherwise wrapped
  const keyLines = (d.keyText.includes("\n") ? d.keyText.split("\n") : wrapText(d.keyText, 20, 5)).slice(0, 5);
  const keySize = Math.min(28, ...keyLines.map((l) => 318 / (Math.max(l.length, 1) * 0.55)));
  const cellW = 1001 / 3;
  // one size for all three values, so the row looks even
  const infoSize = Math.min(...d.info.map((c) => fitFont(c.value || "—", cellW - 80 - 16, 25, 13)));

  return (
    <svg ref={ref} viewBox={`0 0 ${IG_W} ${L.H}`} width={IG_W} height={L.H} xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={`${d.banner} indicator intro`}>
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

      {/* three facts */}
      <g transform={at(1)}>
        <rect x={40} y={410} width={1001} height={92} rx={16} fill={C.card} stroke={C.border} strokeWidth={1.5} />
        {d.info.map((c, i) => {
          const x0 = 40 + i * cellW;
          return (
            <g key={i}>
              {i > 0 && <line x1={x0} x2={x0} y1={430} y2={482} stroke={C.border} strokeWidth={1.5} />}
              <EduIcon name={c.icon} x={x0 + 22} y={435} size={42} color={C.icon} />
              <text x={x0 + 80} y={443} {...t(15.5, 600, C.label)} letterSpacing={0.4}>
                {c.label}
              </text>
              <text x={x0 + 80} y={476} {...t(infoSize, 800, C.strong)}>
                {c.value || "—"}
              </text>
            </g>
          );
        })}
      </g>

      {/* chart */}
      <g transform={at(2)}>
        <g clipPath={`url(#${u}chart)`}>
          {d.chart ? (
            <g>
              <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={C.chartBg} />
              <image href={d.chart} x={cp.x} y={cp.y} width={cp.w} height={cp.h} preserveAspectRatio="none" />
            </g>
          ) : (
            <SampleChart B={B} C={C} name={d.banner} tag={d.sampleTag} />
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

      {/* why it matters + golden rule */}
      <g transform={at(3)}>
        <rect x={40} y={980} width={620} height={270} rx={16} fill={C.card} stroke={C.border} strokeWidth={1.5} />
        <EduIcon name="bulb" x={64} y={1000} size={38} color={C.icon} />
        <text x={114} y={1027} {...t(17, 700, C.label)} letterSpacing={1.2}>
          {d.whyTitle}
        </text>
        {whyRows.map((w, i) => (
          <g key={i}>
            <circle cx={72} cy={w.y - 7} r={5} fill={C.emerald} />
            {w.lines.map((l, j) => (
              <text key={j} x={90} y={w.y + j * 26} {...t(19.5, 600, C.body)}>
                {l}
              </text>
            ))}
          </g>
        ))}

        <rect x={676} y={980} width={365} height={270} rx={16} fill={C.risk} />
        <rect x={676} y={980} width={8} height={270} rx={4} fill={C.emerald} />
        <EduIcon name="target" x={704} y={1000} size={42} color={C.emerald} />
        <text x={760} y={1029} {...t(17, 800, C.emerald)} letterSpacing={1.4}>
          {d.keyLabel}
        </text>
        {keyLines.map((l, i) => (
          <text key={i} x={706} y={1130 - ((keyLines.length - 1) * keySize * 1.3) / 2 + i * keySize * 1.3} dominantBaseline="central" {...t(keySize, 800, C.strong)}>
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
