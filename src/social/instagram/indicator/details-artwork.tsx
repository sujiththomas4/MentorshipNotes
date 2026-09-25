import { forwardRef, useId } from "react";
import { IG_W, wrapText } from "@/social/instagram/kit";
import { LIGHT, PALETTES } from "@/social/instagram/swing-trade/artwork";
import type { DetailsData } from "./data";
import { EduDefs, EduFooter, EduHeader, EduIcon, TitleBlock, flow, t } from "./shared";

/*
 * Indicator Details post (Indian Traders, Swing Trade style), 1080 × 1350 feed coordinates:
 * header · title block (140–400) · numbered key points (418, share the height and grow in a
 * story) · pro tip (1130) · footer (1270).
 */

export const DetailsArtwork = forwardRef<SVGSVGElement, { data: DetailsData; className?: string }>(function DetailsArtwork({ data: d, className }, ref) {
  const u = `id${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;
  const C = PALETTES[d.layout.theme] ?? LIGHT;
  const tip = d.tip.trim();
  const L = flow(d.layout, [
    { y: 140, h: 260 },
    { y: 418, h: tip ? 694 : 834, grow: 0.85 },
    ...(tip ? [{ y: 1130, h: 122 }] : []),
  ]);
  const at = (i: number) => `translate(0 ${L.secs[i].dy})`;

  // points share the list's height; text grows a little when there is room
  const points = d.points.slice(0, 7);
  const n = Math.max(points.length, 1);
  const gap = 12;
  const rowH = (L.secs[1].h - gap * (n - 1)) / n;
  const k = Math.min(1.3, Math.max(0.8, rowH / 110));
  const ts = 25 * k;
  const bs = 19 * k;
  const bl = bs * 1.32;
  const maxLines = Math.max(1, Math.min(3, Math.floor((rowH - 28 - ts) / bl)));
  const chars = Math.floor(820 / (bs * 0.52));
  const tipLines = wrapText(tip, 74, 3);

  return (
    <svg ref={ref} viewBox={`0 0 ${IG_W} ${L.H}`} width={IG_W} height={L.H} xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={`${d.titleA} ${d.titleB} key points`}>
      <defs>
        <EduDefs u={u} C={C} />
      </defs>
      <rect width={IG_W} height={L.H} fill={`url(#${u}bg)`} />
      <rect width={IG_W} height={L.H} fill={`url(#${u}glow)`} />

      {d.layout.showHeader && <EduHeader d={d} C={C} />}

      <g transform={at(0)}>
        <TitleBlock d={d} C={C} u={u} />
      </g>

      {/* key points */}
      <g transform={at(1)}>
        {points.map((p, i) => {
          const y = 418 + i * (rowH + gap);
          const cy = y + rowH / 2;
          const body = wrapText(p.text, chars, maxLines);
          const block = ts + (body.length ? 8 + body.length * bl : 0);
          const top = cy - block / 2;
          const r = Math.min(26 * k, rowH / 2 - 8);
          return (
            <g key={i}>
              <rect x={40} y={y} width={1001} height={rowH} rx={16} fill={C.card} stroke={C.border} strokeWidth={1.5} />
              <circle cx={88} cy={cy} r={r} fill={C.emerald} />
              <text x={88} y={cy + 1} textAnchor="middle" dominantBaseline="central" {...t(r * 1.05, 800, "#fff")}>
                {i + 1}
              </text>
              <EduIcon name={p.icon} x={134} y={cy - 22 * k} size={44 * k} color={C.icon} />
              <line x1={134 + 44 * k + 18} x2={134 + 44 * k + 18} y1={y + 18} y2={y + rowH - 18} stroke={C.border} strokeWidth={1.5} />
              <text x={216} y={top + ts * 0.8} {...t(ts, 800, C.strong)}>
                {p.title}
              </text>
              {body.map((l, j) => (
                <text key={j} x={216} y={top + ts + 8 + bs * 0.85 + j * bl} {...t(bs, 500, C.body)}>
                  {l}
                </text>
              ))}
            </g>
          );
        })}
      </g>

      {/* pro tip */}
      {tip && (
        <g transform={at(2)}>
          <rect x={40} y={1130} width={1001} height={122} rx={16} fill={C.risk} />
          <rect x={40} y={1130} width={8} height={122} rx={4} fill={C.emerald} />
          <EduIcon name="bulb" x={72} y={1165} size={52} color={C.emerald} />
          <text x={146} y={1164} {...t(17, 800, C.emerald)} letterSpacing={1.4}>
            {d.tipLabel}
          </text>
          {tipLines.map((l, j) => (
            <text key={j} x={146} y={1194 + j * 26} {...t(tipLines.length > 2 ? 18 : 20, 600, C.strong)}>
              {l}
            </text>
          ))}
        </g>
      )}

      {d.layout.showFooter && (
        <g transform={`translate(0 ${L.footerDy})`}>
          <EduFooter text={d.footer} C={C} u={u} />
        </g>
      )}
    </svg>
  );
});
