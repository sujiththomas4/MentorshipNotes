import type { ReactNode } from "react";
import { IG, IG_LOGOS, IG_W, fitFont } from "@/social/instagram/kit";
import { igH, type IgLayout } from "@/social/instagram/layout";
import { Icon, SCRIPT_FONT, type IconName, type Palette } from "@/social/instagram/swing-trade/artwork";
import type { IndicatorCommon } from "./data";

/*
 * Pieces shared by the Indicator Intro and Indicator Details posts, in the Swing Trade style
 * (white page, navy + emerald, the same icons, logo plate, script words and brush banner).
 */

export const t = (size: number, weight: number, fill: string) => ({ fontFamily: IG.font, fontSize: size, fontWeight: weight, fill });

/* ---------------- icons: Swing Trade's set plus a few for indicators (64-unit grid) ---------------- */

const EXTRA: Record<string, ReactNode> = {
  clock: (
    <>
      <circle cx={32} cy={32} r={24} strokeWidth={4} />
      <path d="M32 18v15l10 6" strokeWidth={4} />
    </>
  ),
  layers: (
    <>
      <path d="M32 8L58 21 32 34 6 21z" strokeWidth={4} />
      <path d="M6 32l26 13 26-13M6 43l26 13 26-13" strokeWidth={4} />
    </>
  ),
  levels: (
    <>
      <path d="M6 14h40M6 32h52M6 50h40" strokeWidth={4} strokeDasharray="6 5" />
      <path d="M52 8l6 6-6 6M52 44l6 6-6 6" strokeWidth={4} />
    </>
  ),
  wave: (
    <>
      <path d="M6 50V10M6 50h52" strokeWidth={4} />
      <path d="M10 40c8-18 14-18 20-6s12 12 18-8 8-10 10-10" strokeWidth={4} />
    </>
  ),
  volume: (
    <>
      <path d="M6 56h52" strokeWidth={4} />
      <path d="M12 50V36M22 50V24M32 50V30M42 50V14M52 50V26" strokeWidth={6} />
    </>
  ),
  book: (
    <>
      <path d="M32 14C26 9 16 8 8 10v40c8-2 18-1 24 4 6-5 16-6 24-4V10c-8-2-18-1-24 4z" strokeWidth={4} />
      <path d="M32 14v40" strokeWidth={4} />
    </>
  ),
  check: (
    <>
      <circle cx={32} cy={32} r={24} strokeWidth={4} />
      <path d="M21 32l8 8 15-16" strokeWidth={4.5} />
    </>
  ),
  alert: (
    <>
      <path d="M32 7L59 54H5z" strokeWidth={4} />
      <path d="M32 24v14" strokeWidth={4.5} />
      <circle cx={32} cy={46} r={2.6} strokeWidth={2} />
    </>
  ),
  star: <path d="M32 7l7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 45.8 16.8 53.8l2.9-16.9-12.3-12 17-2.5z" strokeWidth={4} />,
  eye: (
    <>
      <path d="M4 32c7-12 17-18 28-18s21 6 28 18c-7 12-17 18-28 18S11 44 4 32z" strokeWidth={4} />
      <circle cx={32} cy={32} r={8} strokeWidth={4} />
    </>
  ),
  pin: (
    <>
      <path d="M32 58S12 38 12 25a20 20 0 0 1 40 0c0 13-20 33-20 33z" strokeWidth={4} />
      <circle cx={32} cy={25} r={7} strokeWidth={4} />
    </>
  ),
};

export const ICON_OPTIONS: [string, string][] = [
  ["chart", "Chart up"],
  ["wave", "Indicator line"],
  ["levels", "Levels / pivots"],
  ["volume", "Volume"],
  ["clock", "Time frame"],
  ["layers", "Type / layers"],
  ["target", "Target"],
  ["entry", "Entry / crosshair"],
  ["stop", "Stop / shield"],
  ["risk", "Risk balance"],
  ["price", "Price / coins"],
  ["tag", "Tag"],
  ["calendar", "Calendar"],
  ["bulb", "Idea"],
  ["book", "Learn"],
  ["check", "Check"],
  ["alert", "Warning"],
  ["star", "Star"],
  ["eye", "Watch"],
  ["pin", "Pin"],
];

const SWING_ICONS: IconName[] = ["calendar", "chart", "tag", "price", "entry", "target", "stop", "bulb", "risk"];

export function EduIcon({ name, x, y, size, color }: { name: string; x: number; y: number; size: number; color: string }) {
  if ((SWING_ICONS as string[]).includes(name)) return <Icon name={name as IconName} x={x} y={y} size={size} color={color} />;
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 64 64" overflow="visible" stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {EXTRA[name] ?? EXTRA.star}
    </svg>
  );
}

/* ---------------- layout ---------------- */

/**
 * Stack the body sections between the header and the footer. `secs` are the feed drawing's
 * sections (top y + height); a section with `grow` takes that share of any extra height
 * (story format, hidden header / footer), the rest of the extra is shared out as gaps.
 * Returns each section's shift and height.
 */
export function flow(l: IgLayout, secs: { y: number; h: number; grow?: number }[], headerEnd = 140, footerStart = 1270) {
  const H = igH(l);
  const top = l.showHeader ? headerEnd : 44;
  const bottom = l.showFooter ? H - (1350 - footerStart) : H - 44;
  const extra = Math.max(0, bottom - top - (footerStart - headerEnd));
  const growShare = secs.reduce((a, s) => a + (s.grow ?? 0), 0);
  const gap = (extra * (1 - growShare)) / (secs.length + 1);
  let grown = 0;
  const out = secs.map((s, i) => {
    const dy = top - headerEnd + gap * (i + 1) + grown;
    const add = extra * (s.grow ?? 0);
    grown += add;
    return { dy, h: s.h + add };
  });
  return { H, footerDy: H - 1350, secs: out };
}

/* ---------------- chart picture ---------------- */

export type ChartBox = { x: number; y: number; w: number; h: number };
export type ChartFields = { chart: string | null; chartSize: { w: number; h: number } | null; chartFit: "fit" | "fill"; chartZoom: number; chartX: number; chartY: number };

/** Where the uploaded chart is drawn inside `B`: fit/fill × zoom, centred, then shifted. */
export function placeChart(d: ChartFields, B: ChartBox) {
  const size = d.chartSize ?? { w: B.w, h: B.h };
  const base = d.chartFit === "fill" ? Math.max(B.w / size.w, B.h / size.h) : Math.min(B.w / size.w, B.h / size.h);
  const s = base * (d.chartZoom / 100);
  const w = size.w * s;
  const h = size.h * s;
  return { x: B.x + (B.w - w) / 2 + d.chartX, y: B.y + (B.h - h) / 2 + d.chartY, w, h };
}

function seeded(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Drawn stand-in when no chart is uploaded: candles, the indicator as a blue line, its name. */
export function SampleChart({ B, C, name, tag }: { B: ChartBox; C: Palette; name: string; tag: boolean }) {
  const r = seeded(name || "indicator");
  const N = 64;
  const K: { o: number; c: number; hi: number; lo: number }[] = [];
  let v = 100;
  for (let i = 0; i < N; i++) {
    const o = v;
    v += (r() - 0.47) * 2.2 + Math.sin(i / 9) * 0.6;
    K.push({ o, c: v, hi: Math.max(o, v) + r() * 1.2, lo: Math.min(o, v) - r() * 1.2 });
  }
  // the "indicator": a smooth running average of the closes
  const line: number[] = [];
  let acc = 0;
  K.forEach((k, i) => {
    acc = i ? acc * 0.9 + k.c * 0.1 : k.c;
    line.push(acc);
  });
  const lo = Math.min(...K.map((k) => k.lo));
  const hi = Math.max(...K.map((k) => k.hi));
  const pad = 26;
  const plotW = B.w - 110;
  const step = plotW / N;
  const X = (i: number) => B.x + pad + step * i;
  const Y = (p: number) => B.y + pad + 8 + (1 - (p - lo) / (hi - lo)) * (B.h - pad * 2 - 16);
  const path = line.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(p).toFixed(1)}`).join(" ");
  const last = line[N - 1];
  return (
    <g>
      <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={C.chartBg} />
      {[0.2, 0.4, 0.6, 0.8].map((f) => (
        <line key={f} x1={B.x} x2={B.x + B.w} y1={B.y + B.h * f} y2={B.y + B.h * f} stroke={C.gridH} />
      ))}
      {K.map((k, i) => {
        const col = k.c >= k.o ? "#0e9f63" : "#e5323f";
        const yt = Y(Math.max(k.o, k.c));
        const yb = Y(Math.min(k.o, k.c));
        return (
          <g key={i}>
            <line x1={X(i)} x2={X(i)} y1={Y(k.hi)} y2={Y(k.lo)} stroke={col} strokeWidth={1.4} />
            <rect x={X(i) - step * 0.32} y={yt} width={step * 0.64} height={Math.max(1.5, yb - yt)} fill={col} rx={0.8} />
          </g>
        );
      })}
      <path d={path} fill="none" stroke="#1d6fd6" strokeWidth={3.2} strokeLinejoin="round" />
      <rect x={X(N - 1) + 14} y={Y(last) - 15} width={92} height={30} rx={5} fill="#1d6fd6" />
      <text x={X(N - 1) + 60} y={Y(last) + 1} textAnchor="middle" dominantBaseline="central" {...t(fitFont(name || "LINE", 80, 16, 10), 700, "#fff")}>
        {name || "LINE"}
      </text>
      {tag && (
        <text x={B.x + B.w - 14} y={B.y + 26} textAnchor="end" {...t(14, 600, C.muted)} fontStyle="italic">
          Sample chart · upload yours
        </text>
      )}
    </g>
  );
}

/* ---------------- header, title block, footer ---------------- */

/** Logo (on the navy plate) and the pill on the right. */
export function EduHeader({ d, C }: { d: IndicatorCommon; C: Palette }) {
  const logo = IG_LOGOS[d.logo];
  const logoH = d.logoHeight;
  const logoW = (logo.w / logo.h) * logoH;
  const pad = d.logoBg === "plate" ? 17 : 0;
  const pill = d.pill.trim();
  const pillW = 20 + 32 + 14 + pill.length * 13.2 + 26;
  const pillX = IG_W - 40 - pillW;
  return (
    <g>
      {d.logoBg === "plate" && <rect x={40} y={26} width={logoW + pad * 2} height={logoH + pad * 2} rx={18} fill={C.navyDark} />}
      <image href={d.logoBg === "shield" ? logo.filledHref : logo.href} x={40 + pad} y={26 + pad} width={logoW} height={logoH} preserveAspectRatio="xMidYMid meet" />
      {pill && (
        <g>
          <rect x={pillX} y={30} width={pillW} height={56} rx={14} fill={C.pill} />
          <EduIcon name="book" x={pillX + 20} y={42} size={32} color={C.emerald} />
          <text x={pillX + 66} y={59} dominantBaseline="central" {...t(23, 700, C.pillText)} letterSpacing={0.6}>
            {pill}
          </text>
        </g>
      )}
    </g>
  );
}

/** Big two-colour title, subtitle, script words on the right and the brush banner. Feed y 140–400. */
export function TitleBlock({ d, C, u }: { d: IndicatorCommon & { banner: string }; C: Palette; u: string }) {
  const title = `${d.titleA} ${d.titleB}`.trim();
  // keep clear of the script words on the right (they start near x 880)
  const titleSize = Math.min(104, 800 / (Math.max(title.length, 1) * 0.66));
  const bannerSize = Math.min(60, 470 / (Math.max(d.banner.length, 1) * 0.72));
  // Inter Black capitals are wide (W, M): allow ~0.78 em each before the bars
  const barsX = 84 + d.banner.length * bannerSize * 0.78 + 22;
  return (
    <g>
      <text x={42} y={242} {...t(titleSize, 900, C.strong)} letterSpacing={-3}>
        <tspan>{d.titleA}</tspan>
        {d.titleB && <tspan fill={`url(#${u}title)`}> {d.titleB}</tspan>}
      </text>
      {d.subtitle && (
        <text x={46} y={284} {...t(fitFont(d.subtitle, 820, 27, 16), 600, C.label)} letterSpacing={0.3}>
          {d.subtitle}
        </text>
      )}
      <g transform="rotate(-13 975 250)">
        {d.script.map((s, i) => (
          <text key={i} x={900 + [0, -6, 12][i]} y={206 + i * 44.3} fontFamily={SCRIPT_FONT} fontStyle="italic" fontWeight={700} fontSize={41} fill={C.strong}>
            {s}
          </text>
        ))}
      </g>
      <path d="M918 338C954 326 992 316 1038 308" stroke={C.emerald} strokeWidth={5} strokeLinecap="round" fill="none" />
      {d.banner && (
        <g>
          <g transform="translate(30 300)">
            <path
              fill={C.banner}
              d="M26 14 C120 6 240 12 360 8 C450 5 540 10 612 6 L606 20 L626 24 L604 34 L618 44 L600 52 L622 62 L598 70 L612 82 L590 90 C470 98 350 92 240 97 C150 100 70 96 16 100 L28 90 L8 84 L24 74 L4 66 L22 56 L10 46 L24 38 L6 30 L22 22 Z"
            />
            <path d="M40 8 C200 2 420 6 590 2" stroke={C.banner} strokeWidth={4} strokeLinecap="round" opacity={0.7} fill="none" />
            <path d="M36 101 C200 104 420 98 572 96" stroke={C.banner} strokeWidth={3} strokeLinecap="round" opacity={0.6} fill="none" />
          </g>
          <text x={84} y={352 + bannerSize * 0.36} {...t(bannerSize, 900, "#fff")} letterSpacing={-0.5}>
            {d.banner}
          </text>
          {barsX < 600 && (
            <g transform={`translate(${barsX} 332)`} fill="#fff">
              <rect x={0} y={24} width={10} height={16} rx={1.5} />
              <rect x={16} y={13} width={10} height={27} rx={1.5} />
              <rect x={32} y={0} width={10} height={40} rx={1.5} />
            </g>
          )}
        </g>
      )}
    </g>
  );
}

/** The gradient defs the title and footer use (ids per instance). */
export function EduDefs({ u, C }: { u: string; C: Palette }) {
  return (
    <>
      <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.bgTop} />
        <stop offset="1" stopColor={C.bgBot} />
      </linearGradient>
      <radialGradient id={`${u}glow`} gradientUnits="userSpaceOnUse" cx={918} cy={0} r={900} gradientTransform="translate(918 0) scale(1 0.5556) translate(-918 0)">
        <stop offset="0" stopColor={C.glow} />
        <stop offset="0.7" stopColor={C.glow} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${u}title`} gradientUnits="userSpaceOnUse" x1={300} x2={900} y1={0} y2={0}>
        <stop offset="0" stopColor="#0aa66a" />
        <stop offset="0.6" stopColor="#10b87a" />
        <stop offset="1" stopColor="#0c9e63" />
      </linearGradient>
      <linearGradient id={`${u}fl`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0aa66a" stopOpacity="0" />
        <stop offset="1" stopColor="#0aa66a" />
      </linearGradient>
      <linearGradient id={`${u}fr`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1d6fd6" />
        <stop offset="1" stopColor="#1d6fd6" stopOpacity="0" />
      </linearGradient>
    </>
  );
}

/** Tagline between two fading lines, with the faint growth chart in the corner. Feed y 1270–1350. */
export function EduFooter({ text, C, u }: { text: string; C: Palette; u: string }) {
  const w = text.length * 12;
  const lineL = Math.max(40, 540 - w / 2 - 28 - 170);
  const lineR = Math.min(IG_W - 40 - 170, 540 + w / 2 + 28);
  return (
    <g>
      <rect x={lineL} y={1300} width={170} height={2} rx={1} fill={`url(#${u}fl)`} />
      <rect x={lineR} y={1300} width={170} height={2} rx={1} fill={`url(#${u}fr)`} />
      <text x={540} y={1301} textAnchor="middle" dominantBaseline="central" {...t(14.5, 600, C.pillText)} letterSpacing={3.4} xmlSpace="preserve">
        {text}
      </text>
      <g transform="translate(966 1234)" opacity={0.55} fill="none">
        <path d="M20 118V92M44 118V74M68 118V56M92 118V36" stroke={C.deco1} strokeWidth={12} />
        <path d="M6 96L40 66 62 76 104 30" stroke={C.deco2} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M86 28h20v20" stroke={C.deco2} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}
