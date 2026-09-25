import { forwardRef, useId, type ReactNode } from "react";
import { IG_LOGOS, IG_W, wrapText } from "@/social/instagram/kit";
import { igH } from "@/social/instagram/layout";
import { FACT_COLORS, type Fact, type PsychologyData } from "./data";

/*
 * "Trading Psychology Facts" (Indian Traders), drawn in SVG on the feed's 1080 × 1350
 * coordinates, from the reference post in public/social/instagram/trading-psychology.
 * Left column: brush title, subtitle, photo. Right column: the fact cards, which share the
 * height between the header and the "Better mindset" line. Story and a hidden header / footer
 * move the title and the bottom line and stretch the cards and the photo.
 */

const FONT = "Inter, 'Segoe UI', Arial, sans-serif";
const BRUSH = "'Permanent Marker', 'Segoe Print', cursive";
const COND = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
const GOLD = "#FFD21F";
const t = (size: number, weight: number, fill: string, family = FONT) => ({ fontFamily: family, fontSize: size, fontWeight: weight, fill });

const THEMES: Record<string, { bg: [string, string, string]; card: string }> = {
  black: { bg: ["#0b0d10", "#06070a", "#050608"], card: "#0a0c10" },
  navy: { bg: ["#0f2344", "#0a1a33", "#071427"], card: "#0b1a30" },
};

/* ---------------- icons (64-unit grid, drawn in the card colour) ---------------- */

const HEAD = "M24 58V48C15 44 10 36 10 27C10 15 20 6 32 6C43 6 52 14 53 25L58 34H53V41C53 45 50 47 46 47H40V58";

const ICONS: Record<string, { label: string; draw: ReactNode }> = {
  "head-brain": {
    label: "Head + brain",
    draw: (
      <>
        <path d={HEAD} />
        <path d="M22 20c0-4 4-6 7-4 2-3 7-3 8 0 4-1 7 3 5 6 3 2 2 7-2 8 0 4-4 5-7 3-2 3-7 2-8-1-4 0-6-4-4-6-3-2-2-6 1-6z" />
        <path d="M31 15v19M25 24h5M32 21h5M32 28h4" />
      </>
    ),
  },
  "head-sun": {
    label: "Head + spark",
    draw: (
      <>
        <path d={HEAD} />
        <circle cx="31" cy="25" r="5" />
        <path d="M31 13v4M31 33v4M19 25h4M39 25h4M23 17l3 3M39 17l-3 3M23 33l3-3M39 33l-3-3" />
      </>
    ),
  },
  "head-face": {
    label: "Head + emotions",
    draw: (
      <>
        <path d={HEAD} />
        <circle cx="30" cy="24" r="9" />
        <path d="M26 27c2 3 6 3 8 0" />
        <path d="M27 21h.01M33 21h.01" strokeWidth="4" />
      </>
    ),
  },
  "head-gears": {
    label: "Head + gears",
    draw: (
      <>
        <path d={HEAD} />
        <circle cx="27" cy="22" r="6" strokeDasharray="3 2.4" strokeWidth="4" />
        <circle cx="27" cy="22" r="2" />
        <circle cx="37" cy="32" r="4.5" strokeDasharray="2.4 2" strokeWidth="3.4" />
      </>
    ),
  },
  target: {
    label: "Target",
    draw: (
      <>
        <circle cx="32" cy="32" r="21" />
        <circle cx="32" cy="32" r="13" />
        <circle cx="32" cy="32" r="5" />
        <path d="M32 3v10M32 51v10M3 32h10M51 32h10" />
      </>
    ),
  },
  checklist: {
    label: "Checklist",
    draw: (
      <>
        <rect x="12" y="10" width="32" height="46" rx="4" />
        <rect x="21" y="6" width="14" height="8" rx="2" />
        <path d="M18 23l3 3 5-6M18 34l3 3 5-6M18 45l3 3 5-6M30 24h8M30 35h8M30 46h4" />
        <path d="M40 54l13-15 4 4-13 15-6 2z" />
      </>
    ),
  },
  shield: {
    label: "Shield",
    draw: (
      <>
        <path d="M32 6l20 7v15c0 13-8 23-20 29C20 51 12 41 12 28V13z" />
        <path d="M23 31l6 6 12-13" />
      </>
    ),
  },
  chart: {
    label: "Chart up",
    draw: (
      <>
        <path d="M8 56h48M8 56V8" />
        <path d="M14 46l12-12 9 7 17-19" />
        <path d="M44 22h8v8" />
      </>
    ),
  },
  bulb: {
    label: "Light bulb",
    draw: (
      <>
        <path d="M22 40c-5-4-8-9-8-15a18 18 0 0 1 36 0c0 6-3 11-8 15-2 2-3 4-3 7H25c0-3-1-5-3-7z" />
        <path d="M25 53h14M27 59h10" />
      </>
    ),
  },
  clock: {
    label: "Clock",
    draw: (
      <>
        <circle cx="32" cy="32" r="24" />
        <path d="M32 18v15l10 6" />
      </>
    ),
  },
};

export const PSYCHOLOGY_ICONS: [string, string][] = Object.entries(ICONS).map(([k, v]) => [k, v.label]);

/* ---------------- footer icons (from the Option Selling post) ---------------- */

const FOOT_ICONS = [
  <>
    <circle cx="23" cy="27" r="19" strokeWidth="3.6" />
    <circle cx="23" cy="27" r="11" strokeWidth="3.6" />
    <circle cx="23" cy="27" r="3.5" fill="#fff" />
    <path d="M24 26L43 7M36 5l8 1 1 8" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  <>
    <path
      d="M25 4l4 6 7-2 1 7 7 2-3 6 5 5-6 4 2 7-7 1-2 7-6-3-5 5-4-6-7 1v-7l-7-3 4-6-4-5 6-4-1-7 7 0 2-7 6 3z"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="25" cy="25" r="8" strokeWidth="3.2" />
  </>,
  <>
    <rect x="5" y="32" width="8" height="14" rx="1.5" strokeWidth="3.2" />
    <rect x="19" y="22" width="8" height="24" rx="1.5" strokeWidth="3.2" />
    <path d="M38 46V8M31 15l7-7 7 7" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </>,
];

/* ---------------- helpers ---------------- */

/** "IT'S ABOUT *YOUR MIND.*" → tspans, the starred part in gold. */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <tspan key={i} fill={GOLD}>
            {part.slice(1, -1)}
          </tspan>
        ) : (
          <tspan key={i}>{part}</tspan>
        ),
      )}
    </>
  );
}

/** Text lines of a card: Enter breaks where given, otherwise wrapped. */
const lines = (s: string, chars: number, max: number) => (s.includes("\n") ? s.split("\n").slice(0, max) : wrapText(s, chars, max));

/** Font size so the longest line fits `width` (k ≈ character width per px of font size). */
const fitLinesSize = (ls: string[], width: number, max: number, min: number, k: number) =>
  Math.max(min, Math.min(max, ...ls.map((l) => width / (Math.max(l.length, 1) * k))));

function FactCard({ f, y, h, card, u }: { f: Fact; y: number; h: number; card: string; u: string }) {
  const c = FACT_COLORS[f.color] ?? GOLD;
  const x = 655;
  const w = 393;
  const cy = y + h / 2;
  const tx = 782;
  const room = x + w - tx - 12;
  const title = lines(f.title.toUpperCase(), 22, 3).filter((l, i, a) => l || i < a.length - 1);
  const body = lines(f.body, 32, 4);
  const ts = fitLinesSize(title, room, 24, 15, 0.47);
  const bs = fitLinesSize(body, room, 16.5, 12, 0.555);
  const tl = ts * 1.04;
  const bl = bs * 1.36;
  const block = title.length * tl + (body.length ? 8 + body.length * bl : 0);
  const top = cy - block / 2;
  const r = Math.min(42, h / 2 - 14);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={22} fill="none" stroke={c} strokeWidth={2.5} filter={`url(#${u}glow-${f.color})`} />
      <rect x={x} y={y} width={w} height={h} rx={22} fill={card} fillOpacity={0.94} stroke={c} strokeWidth={2.5} />
      <circle cx={715} cy={cy} r={r} fill={c} fillOpacity={0.08} stroke={c} strokeWidth={2.5} />
      <svg x={715 - r * 0.62} y={cy - r * 0.62} width={r * 1.24} height={r * 1.24} viewBox="0 0 64 64" fill="none" stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" overflow="visible">
        {(ICONS[f.icon] ?? ICONS["head-brain"]).draw}
      </svg>
      {title.map((l, i) => (
        <text key={`t${i}`} x={tx} y={top + ts * 0.82 + i * tl} {...t(ts, 700, c, COND)} letterSpacing={0.4}>
          {l}
        </text>
      ))}
      {body.map((l, i) => (
        <text key={`b${i}`} x={tx} y={top + title.length * tl + 8 + bs * 0.9 + i * bl} {...t(bs, 500, "#e9edf2")}>
          {l}
        </text>
      ))}
    </g>
  );
}

/* ---------------- post ---------------- */

export const PsychologyArtwork = forwardRef<SVGSVGElement, { data: PsychologyData; className?: string }>(function PsychologyArtwork({ data: d, className }, ref) {
  // ids are per instance: several copies of the post can be on one page (gallery, planner)
  const u = `tp${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;
  const T = THEMES[d.layout.theme] ?? THEMES.black;
  const H = igH(d.layout);
  const story = d.layout.format === "story";
  const L = d.layout;

  // vertical plan (feed + header + footer = the reference post)
  const top = L.showHeader ? 150 : 50;
  const sloganY = L.showFooter ? H - 170 : H - 110;
  const titleDy = top - 150 + (story ? 50 : 0);
  const cardsTop = top + 7;
  const cardsBottom = sloganY - 78;
  const facts = d.facts.slice(0, 6);
  const gap = story ? 26 : 20;
  const cardH = (cardsBottom - cardsTop - gap * (facts.length - 1)) / Math.max(1, facts.length);
  const photoBottom = sloganY - 45;
  const photoH = story ? 800 : L.showHeader ? 615 : 680;
  const photoTop = photoBottom - photoH;
  const cover = Math.max(1, photoH / 615) * (d.photoZoom / 100);
  const pw = 645 * cover;
  const ph = 615 * cover;
  const chartDy = sloganY - 1180;

  // title sizes
  const kickerSize = Math.min(38, 230 / (Math.max(d.kicker.length, 1) * 0.72));
  const t1Size = Math.min(104, 560 / (Math.max(d.title1.length, 1) * 0.64));
  const t2Size = Math.min(150, 460 / (Math.max(d.title2.length, 1) * 0.72));
  const sub = d.subtitle.split("\n").slice(0, 3);
  const subSize = Math.min(24, 470 / (Math.max(...sub.map((s) => s.replace(/\*/g, "").length), 1) * 0.72));
  const sloganSize = Math.min(48, 330 / (Math.max(d.sloganLeft.length, d.sloganRight.length, 1) * 0.6));

  const logo = IG_LOGOS[d.logo];
  const logoH = d.logo === "horizontal" ? 112 : 128;
  const logoW = (logo.w / logo.h) * logoH;
  const tag = d.tagline
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  // footer: icon + label, gold separators
  const foot = d.footer.map((s) => s.trim()).filter(Boolean);
  const footY = H - 88;
  let fx = 52;

  // gold line chart along the bottom
  const chart = [
    [0, 1222], [40, 1212], [70, 1196], [100, 1214], [130, 1206], [165, 1236], [200, 1226], [240, 1250], [300, 1242], [360, 1262], [440, 1252],
    [520, 1262], [600, 1246], [680, 1256], [760, 1238], [830, 1244], [880, 1214], [920, 1224], [960, 1176], [990, 1186], [1030, 1140], [1080, 1104],
  ].map(([x, y]) => [x, y + chartDy]);
  const chartPts = chart.map((p) => p.join(",")).join(" ");

  return (
    <svg ref={ref} viewBox={`0 0 ${IG_W} ${H}`} width={IG_W} height={H} xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={`${d.kicker} ${d.title1} ${d.title2}`}>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.bg[0]} />
          <stop offset="0.55" stopColor={T.bg[1]} />
          <stop offset="1" stopColor={T.bg[2]} />
        </linearGradient>
        <radialGradient id={`${u}warm`}>
          <stop offset="0" stopColor={GOLD} stopOpacity="0.16" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset=".45" stopColor="#ffd21f" />
          <stop offset="1" stopColor="#e39a00" />
        </linearGradient>
        <linearGradient id={`${u}white`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#eeeeee" />
          <stop offset="1" stopColor="#bdbdbd" />
        </linearGradient>
        <filter id={`${u}shadow`} x="-10%" y="-20%" width="120%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.7" />
        </filter>
        <filter id={`${u}blur`} x="-5%" y="-50%" width="110%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        {Object.entries(FACT_COLORS).map(([k, c]) => (
          <filter key={k} id={`${u}glow-${k}`} x="-15%" y="-25%" width="130%" height="150%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor={c} floodOpacity="0.55" />
          </filter>
        ))}
        <linearGradient id={`${u}fade-y`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.16" stopColor="#fff" />
          <stop offset="0.92" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}fade-x`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.88" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${u}mask-y`} maskContentUnits="userSpaceOnUse">
          <rect x={0} y={photoTop} width={645} height={photoH} fill={`url(#${u}fade-y)`} />
        </mask>
        <mask id={`${u}mask-x`} maskContentUnits="userSpaceOnUse">
          <rect x={0} y={photoTop} width={645} height={photoH} fill={`url(#${u}fade-x)`} />
        </mask>
        <clipPath id={`${u}photo-clip`}>
          <rect x={0} y={photoTop} width={645} height={photoH} />
        </clipPath>
        <linearGradient id={`${u}under`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.22" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* background */}
      <rect width={IG_W} height={H} fill={`url(#${u}bg)`} />
      <ellipse cx={120} cy={60} rx={620} ry={420} fill={`url(#${u}warm)`} />
      <ellipse cx={0} cy={photoTop + 220} rx={260} ry={420} fill={`url(#${u}warm)`} />

      {/* photo, faded into the page */}
      {d.photo && (
        <g mask={`url(#${u}mask-y)`}>
          <g mask={`url(#${u}mask-x)`}>
            <g clipPath={`url(#${u}photo-clip)`}>
              <image href={d.photo} x={(645 - pw) / 2 + d.photoX} y={photoTop + (photoH - ph) / 2 + d.photoY} width={pw} height={ph} preserveAspectRatio="none" />
            </g>
          </g>
        </g>
      )}

      {/* header */}
      {L.showHeader && (
        <g>
          <image href={d.logoFilled ? logo.filledHref : logo.href} x={40} y={22 + (112 - logoH) / 2} width={logoW} height={logoH} preserveAspectRatio="xMidYMid meet" />
          {tag.length > 0 && (
            <text x={IG_W - 52} y={74} textAnchor="end" {...t(20, 500, "#f2f2f2")} letterSpacing={4.5} xmlSpace="preserve">
              {tag.map((s, i) => (
                <tspan key={i}>
                  {i > 0 && (
                    <tspan fill={GOLD} letterSpacing={0}>
                      {"    |    "}
                    </tspan>
                  )}
                  {s}
                </tspan>
              ))}
            </text>
          )}
        </g>
      )}

      {/* title block */}
      <g transform={`translate(0 ${titleDy}) rotate(-6 330 330)`}>
        {d.kicker && (
          <g>
            <path
              fill={`url(#${u}gold)`}
              d="M52 170 C120 158 220 162 330 150 L340 158 L318 166 L352 170 L322 180 L344 188 L316 196 L340 204 L300 212 C220 218 140 214 70 222 L46 224 L64 214 L40 208 L60 200 L34 194 L58 186 L38 178 Z"
            />
            <text x={190} y={187} textAnchor="middle" dominantBaseline="central" {...t(kickerSize, 900, "#15110a")} letterSpacing={1}>
              {d.kicker}
            </text>
          </g>
        )}
        <text x={58} y={318} {...t(t1Size, 400, `url(#${u}white)`, BRUSH)} filter={`url(#${u}shadow)`}>
          {d.title1}
        </text>
        <text x={112} y={430} {...t(t2Size, 400, `url(#${u}gold)`, BRUSH)} filter={`url(#${u}shadow)`}>
          {d.title2}
        </text>
        {sub.map((line, i) => (
          <text key={i} x={126} y={478 + i * (subSize * 1.3)} {...t(subSize, 800, "#ffffff")} letterSpacing={1.6}>
            <Marked text={line} />
          </text>
        ))}
        <path d={`M196 ${486 + sub.length * subSize * 1.3} C280 ${478 + sub.length * subSize * 1.3} 380 ${474 + sub.length * subSize * 1.3} 440 ${470 + sub.length * subSize * 1.3}`} stroke={GOLD} strokeWidth={5} strokeLinecap="round" fill="none" />
      </g>

      {/* fact cards */}
      {facts.map((f, i) => (
        <FactCard key={i} f={f} y={cardsTop + i * (cardH + gap)} h={cardH} card={T.card} u={u} />
      ))}

      {/* gold line chart + slogan */}
      <polygon points={`${chartPts} 1080,${H} 0,${H}`} fill={`url(#${u}under)`} />
      <polyline points={chartPts} fill="none" stroke={GOLD} strokeWidth={8} opacity={0.5} filter={`url(#${u}blur)`} />
      <polyline points={chartPts} fill="none" stroke={GOLD} strokeWidth={2.5} strokeLinejoin="round" />
      {(d.sloganLeft || d.sloganRight) && (
        <g transform={`rotate(-3 540 ${sloganY})`}>
          <text x={515} y={sloganY + 16} textAnchor="end" {...t(sloganSize, 400, "#ffffff", BRUSH)} filter={`url(#${u}shadow)`}>
            {d.sloganLeft}
          </text>
          {d.sloganLeft && d.sloganRight && (
            <text x={555} y={sloganY + 12} textAnchor="middle" {...t(40, 800, GOLD)}>
              =
            </text>
          )}
          <text x={598} y={sloganY + 16} {...t(sloganSize, 400, `url(#${u}gold)`, BRUSH)} filter={`url(#${u}shadow)`}>
            {d.sloganRight}
          </text>
          {d.sloganLeft && <path d={`M${515 - d.sloganLeft.length * sloganSize * 0.6} ${sloganY + 40} C360 ${sloganY + 32} 440 ${sloganY + 30} 505 ${sloganY + 28}`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9} />}
          {d.sloganRight && <path d={`M592 ${sloganY + 44} C680 ${sloganY + 36} 760 ${sloganY + 32} ${598 + d.sloganRight.length * sloganSize * 0.58} ${sloganY + 30}`} stroke={GOLD} strokeWidth={4} strokeLinecap="round" fill="none" />}
        </g>
      )}

      {/* footer */}
      {L.showFooter && (
        <g>
          {foot.map((s, i) => {
            const x0 = fx;
            fx += 58 + s.length * (16 * 0.68 + 4.5) + 48;
            return (
              <g key={i}>
                {i > 0 && <rect x={x0 - 24} y={footY + 10} width={2.5} height={32} fill={GOLD} />}
                <svg x={x0} y={footY + 4} width={42} height={42} viewBox="0 0 50 50" fill="none" stroke="#fff" overflow="visible">
                  {FOOT_ICONS[i % 3]}
                </svg>
                <text x={x0 + 58} y={footY + 26} dominantBaseline="central" {...t(16, 600, "#f2f2f2")} letterSpacing={4.5}>
                  {s}
                </text>
              </g>
            );
          })}
          {d.hashtag && (
            <text x={IG_W - 40} y={footY + 26} textAnchor="end" dominantBaseline="central" {...t(18, 700, "#ffffff")}>
              {d.hashtag}
            </text>
          )}
        </g>
      )}
    </svg>
  );
});
