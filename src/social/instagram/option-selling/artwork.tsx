import { forwardRef, type ReactNode } from "react";
import { IG_H, IG_LOGOS, IG_W, fitFont } from "@/social/instagram/kit";
import { fmtInt, fmtPrice, fmtRupees, formatDate, num, pnl, type Leg, type OptionSellingData } from "./data";

/*
 * Port of option-selling.html ("Systematic Option Selling") to SVG, on the same 1080 × 1350
 * coordinates as its CSS. The logo is the locked Branding PNG; the bull/bear and candle art
 * are the PNGs from the HTML file (public/social/instagram/option-selling).
 */

const FONT = "'Inter Display', Inter, 'Segoe UI', Arial, sans-serif";
const ART = "/social/instagram/option-selling";
const GOLD = "#f5b800";
const LINE_GOLD = "#e8b923";
const HEAD = "#aab3ea";
const t = (size: number, weight: number, fill: string) => ({ fontFamily: FONT, fontSize: size, fontWeight: weight, fill });
/** rough width of Inter text, per px of font size per character */
const w = (text: string, size: number, k = 0.6) => text.length * size * k;

function Icon({ x, y, size, vb, children }: { x: number; y: number; size: number; vb: number; children: ReactNode }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill="none" overflow="visible">
      {children}
    </svg>
  );
}

const CAL = (
  <>
    <rect x="6" y="11" width="52" height="47" rx="7" stroke="url(#os-gc)" strokeWidth="5" />
    <path d="M6 24h52" stroke="url(#os-gc)" strokeWidth="5" />
    <path d="M19 5v12M45 5v12" stroke="url(#os-gc)" strokeWidth="5" strokeLinecap="round" />
    <g fill="url(#os-gc)">
      {[31, 42].flatMap((yy) => [15, 28, 41].map((xx) => <rect key={`${xx}-${yy}`} x={xx} y={yy} width="9" height="7" rx="1" />))}
    </g>
  </>
);

const FOOT_ICONS = [
  <>
    <circle cx="23" cy="27" r="19" stroke={GOLD} strokeWidth="4" />
    <circle cx="23" cy="27" r="11" stroke={GOLD} strokeWidth="4" />
    <circle cx="23" cy="27" r="3.5" fill={GOLD} />
    <path d="M24 26L43 7M36 5l8 1 1 8" stroke={GOLD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  <>
    <path
      d="M25 4l4 6 7-2 1 7 7 2-3 6 5 5-6 4 2 7-7 1-2 7-6-3-5 5-4-6-7 1v-7l-7-3 4-6-4-5 6-4-1-7 7 0 2-7 6 3z"
      stroke={GOLD}
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    <circle cx="25" cy="25" r="8" stroke={GOLD} strokeWidth="3.5" />
  </>,
  <>
    <rect x="5" y="32" width="8" height="14" rx="1.5" stroke={GOLD} strokeWidth="3.5" />
    <rect x="19" y="22" width="8" height="24" rx="1.5" stroke={GOLD} strokeWidth="3.5" />
    <path d="M38 46V8M31 15l7-7 7 7" stroke={GOLD} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
];

function strikeText(l: Leg) {
  const s = num(l.strike);
  return `${Number.isFinite(s) ? s : l.strike.trim() || "—"}${l.type ? " " + l.type : ""}`;
}

/** Top/bottom highlight lines of the gold boxes (".glowline" in the HTML). */
function GlowLines({ x, y, width, h }: { x: number; y: number; width: number; h: number }) {
  return (
    <g>
      <rect x={x + width * 0.3} y={y - 1} width={width * 0.4} height={2} fill="url(#os-glow-top)" />
      <rect x={x + width * 0.3} y={y + h - 1} width={width * 0.4} height={2} fill="url(#os-glow-bot)" />
    </g>
  );
}

export const OptionSellingArtwork = forwardRef<SVGSVGElement, { data: OptionSellingData; className?: string }>(function OptionSellingArtwork(
  { data: d, className },
  ref,
) {
  const closed = d.mode === "CLOSE";
  const legs = d.legs.slice(0, 4);
  const n = Math.max(legs.length, 1);
  const P = closed ? pnl(d) : null;
  const neg = !!P && P.ok && P.total < 0;
  const logo = IG_LOGOS[d.logo];
  const logoH = d.logo === "horizontal" ? 104 : 132;
  const logoW = (logo.w / logo.h) * logoH;

  // ---- lower stack: info, table, P&L (CLOSE), footer ----
  const rowH = Math.min(122, Math.floor(300 / n));
  const INFO_H = 106;
  const HEAD_H = 98;
  const TABLE_H = HEAD_H + rowH * n;
  const PNL_H = 122;
  const FOOT_H = 50;
  const top = 572;
  const bottom = 1290;
  const blocks = [INFO_H, TABLE_H, ...(closed ? [PNL_H] : [])];
  const footY = bottom - FOOT_H;
  const free = footY - top - blocks.reduce((a, b) => a + b, 0);
  const gap = Math.min(64, free / blocks.length);
  let cursor = top + (free - gap * blocks.length) / 2;
  const infoY = cursor;
  cursor += INFO_H + gap;
  const tableY = cursor;
  cursor += TABLE_H + gap;
  const pnlY = cursor;

  // table columns: ACTION | STRIKE | QNTY | PRICE (+ EXIT when closed)
  const TX = 48;
  const TW = 984;
  const cols = closed
    ? [
        { key: "ACTION", w: 220 },
        { key: "STRIKE PRICE", w: 250 },
        { key: "QNTY", w: 150 },
        { key: "ENTRY", w: 182 },
        { key: "EXIT", w: 182 },
      ]
    : [
        { key: "ACTION", w: 250 },
        { key: "STRIKE PRICE", w: 314 },
        { key: "QNTY", w: 210 },
        { key: "PRICE", w: 210 },
      ];
  const colX = cols.reduce<number[]>((acc, c, i) => [...acc, i ? acc[i - 1] + cols[i - 1].w : TX], []);
  const vf = rowH < 100 ? 34 : 42;
  const ph = Math.min(74, rowH - 20);

  // P&L texts
  const amount = P && P.ok ? `${neg ? "−" : "+"}${fmtRupees(P.total)}` : "—";
  const pct = P && P.ok && P.percent !== null && d.showPercent ? `(${P.percent < 0 ? "−" : "+"}${Math.abs(P.percent).toFixed(1)}%)` : "";
  const pctW = pct ? w(pct, 39, 0.58) : 0;
  const sepX = TX + 44 + 82 + 32 + w("Total P&L", 39, 0.56) + 56;
  const amtL = sepX + 40;
  const amtR = TX + TW - 26 - pctW - (pct ? 24 : 0);
  const amtSize = fitFont(amount, amtR - amtL, 74, 36);

  // footer: icon + label, gold separators
  const foot = d.footer.map((s) => s.trim()).filter(Boolean);
  const footW = foot.map((s) => 50 + 22 + s.length * (18 * 0.66 + 3));
  const totalFoot = footW.reduce((a, b) => a + b, 0) + Math.max(0, foot.length - 1) * 78;
  let fx = IG_W / 2 - totalFoot / 2;

  const tag = d.tagline
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const badge = (closed ? d.badgeClose : d.badgeEntry).trim();

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${IG_W} ${IG_H}`}
      width={IG_W}
      height={IG_H}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${d.title1} ${d.title2} ${d.instrument} ${badge}`}
    >
      <defs>
        <linearGradient id="os-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080b" />
          <stop offset="0.6" stopColor="#040506" />
          <stop offset="1" stopColor="#050607" />
        </linearGradient>
        <radialGradient id="os-r-gold">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.1" />
          <stop offset="0.7" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="os-r-green">
          <stop offset="0" stopColor="#22d46b" stopOpacity="0.07" />
          <stop offset="0.7" stopColor="#22d46b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="os-sw1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffcf3a" />
          <stop offset=".35" stopColor={GOLD} stopOpacity=".9" />
          <stop offset=".6" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="os-sw2" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd24a" />
          <stop offset=".45" stopColor="#e0a000" stopOpacity=".8" />
          <stop offset=".85" stopColor="#e0a000" stopOpacity="0" />
        </linearGradient>
        <filter id="os-blur" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id="os-t1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#f0f0f0" />
          <stop offset=".58" stopColor="#a9a9a9" />
          <stop offset="1" stopColor="#e9e9e9" />
        </linearGradient>
        <linearGradient id="os-t2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0a8" />
          <stop offset=".35" stopColor="#ffd21f" />
          <stop offset=".6" stopColor="#f5b000" />
          <stop offset="1" stopColor="#c98400" />
        </linearGradient>
        <filter id="os-t1-sh" x="-5%" y="-20%" width="110%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <filter id="os-t2-sh" x="-5%" y="-30%" width="110%" height="170%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={GOLD} floodOpacity="0.28" />
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <linearGradient id="os-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe066" />
          <stop offset=".6" stopColor="#f5bd12" />
          <stop offset="1" stopColor="#d99a00" />
        </linearGradient>
        <linearGradient id="os-gc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#e0a000" />
        </linearGradient>
        <linearGradient id="os-glow-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff3c2" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff3c2" />
          <stop offset="1" stopColor="#fff3c2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="os-glow-bot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd766" stopOpacity="0" />
          <stop offset=".5" stopColor="#ffd766" />
          <stop offset="1" stopColor="#ffd766" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="os-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0e12" stopOpacity=".92" />
          <stop offset="1" stopColor="#060709" stopOpacity=".92" />
        </linearGradient>
        <linearGradient id="os-sell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f23a4d" />
          <stop offset="1" stopColor="#c4142a" />
        </linearGradient>
        <linearGradient id="os-buy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2fe07a" />
          <stop offset="1" stopColor="#0fa24b" />
        </linearGradient>
        <filter id="os-glow-red" x="-30%" y="-40%" width="160%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#e3243b" floodOpacity=".45" />
        </filter>
        <filter id="os-glow-green" x="-30%" y="-40%" width="160%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#22d46b" floodOpacity=".4" />
        </filter>
        <filter id="os-box-glow" x="-10%" y="-30%" width="120%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="11" floodColor={GOLD} floodOpacity=".12" />
        </filter>
        <linearGradient id="os-pnl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={neg ? "#2c080c" : "#082816"} stopOpacity=".85" />
          <stop offset=".45" stopColor={neg ? "#160608" : "#06140c"} stopOpacity=".85" />
          <stop offset="1" stopColor={neg ? "#28080c" : "#082214"} stopOpacity=".85" />
        </linearGradient>
        <linearGradient id="os-amt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={neg ? "#ff9aa5" : "#8dffb6"} />
          <stop offset=".6" stopColor={neg ? "#ef3346" : "#22d46b"} />
          <stop offset="1" stopColor={neg ? "#c21a2e" : "#15a852"} />
        </linearGradient>
        <filter id="os-pnl-glow" x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor={neg ? "#e3243b" : "#22d46b"} floodOpacity=".22" />
        </filter>
      </defs>

      {/* background */}
      <rect width={IG_W} height={IG_H} fill="url(#os-bg)" />
      <ellipse cx={86} cy={54} rx={700} ry={420} fill="url(#os-r-gold)" />
      <ellipse cx={994} cy={405} rx={640} ry={520} fill="url(#os-r-green)" />
      <ellipse cx={540} cy={1485} rx={900} ry={500} fill="url(#os-r-gold)" />
      <g transform="translate(0 1050)" fill="none">
        <path d="M0 20 C180 90 330 190 520 300" stroke="url(#os-sw1)" strokeWidth="10" filter="url(#os-blur)" opacity=".7" />
        <path d="M0 20 C180 90 330 190 520 300" stroke="url(#os-sw1)" strokeWidth="3" />
        <path d="M0 110 C160 170 280 240 360 300" stroke="url(#os-sw1)" strokeWidth="2" opacity=".6" />
        <path d="M1080 60 C860 160 640 250 420 300" stroke="url(#os-sw2)" strokeWidth="10" filter="url(#os-blur)" opacity=".7" />
        <path d="M1080 60 C860 160 640 250 420 300" stroke="url(#os-sw2)" strokeWidth="3" />
        <path d="M1080 150 C930 210 820 260 740 300" stroke="url(#os-sw2)" strokeWidth="2" opacity=".6" />
      </g>

      {/* header */}
      <image href={logo.href} x={66} y={66 + (104 - logoH) / 2} width={logoW} height={logoH} preserveAspectRatio="xMidYMid meet" />
      {tag.length > 0 && (
        <text x={IG_W - 66} y={110} textAnchor="end" {...t(19, 500, "#e8e8e8")} letterSpacing={4} xmlSpace="preserve">
          {tag.map((s, i) => (
            <tspan key={i}>
              {i > 0 && (
                <tspan fill={GOLD} letterSpacing={0}>
                  {"   |   "}
                </tspan>
              )}
              {s}
            </tspan>
          ))}
        </text>
      )}
      <image href={`${ART}/art-candles.png`} x={681} y={150} width={373} height={200} />
      <image href={`${ART}/art-bull.png`} x={738} y={352} width={342} height={228} />

      {/* title */}
      <text x={66} y={312} {...t(fitFont(d.title1, 940, 92, 48), 900, "url(#os-t1)")} letterSpacing={-2.5} filter="url(#os-t1-sh)">
        {d.title1}
      </text>
      <text x={66} y={408} {...t(fitFont(d.title2, 960, 96, 48), 900, "url(#os-t2)")} letterSpacing={-2.5} filter="url(#os-t2-sh)">
        {d.title2}
      </text>

      {/* brush badge */}
      {badge && (
        <g transform="rotate(-4.5 34 480)">
          <g transform="translate(34 430)">
            <path
              fill="url(#os-badge)"
              d="M44 22 C150 10 300 16 452 8 L470 14 L446 22 L494 24 L460 34 L482 40 L456 48 L478 56 L444 64 L470 72 L430 80 C310 88 190 84 70 92 L40 96 L62 86 L10 82 L48 74 L22 66 L52 58 L4 52 L50 44 L20 36 L54 30 Z"
            />
            <path d="M70 12 C200 6 320 8 440 2" stroke="#f5bd12" strokeWidth="3" strokeLinecap="round" opacity=".7" fill="none" />
            <path d="M90 97 C220 99 330 94 420 90" stroke="#e0a800" strokeWidth="3" strokeLinecap="round" opacity=".6" fill="none" />
            <path d="M462 44 L498 42 M456 62 L492 64 M20 60 L-4 62" stroke="#f5bd12" strokeWidth="2.5" strokeLinecap="round" opacity=".6" fill="none" />
          </g>
          <text x={96} y={480} dominantBaseline="central" {...t(fitFont(badge, 380, 50, 28), 900, "#15110a")} letterSpacing={-0.5}>
            {badge}
          </text>
        </g>
      )}

      {/* info: date + instrument */}
      <g>
        <rect x={185} y={infoY} width={710} height={INFO_H} rx={16} fill="none" stroke={LINE_GOLD} strokeWidth={2} filter="url(#os-box-glow)" />
        <rect x={185} y={infoY} width={710} height={INFO_H} rx={16} fill="#0a0a0a" fillOpacity={0.75} stroke={LINE_GOLD} strokeWidth={2} />
        <GlowLines x={185} y={infoY} width={710} h={INFO_H} />
        <Icon x={221} y={infoY + 23} size={60} vb={64}>
          {CAL}
        </Icon>
        <text x={307} y={infoY + 42} {...t(23, 500, HEAD)}>
          Date
        </text>
        <text x={307} y={infoY + 82} {...t(fitFont(formatDate(d.date), 210, 35, 22), 700, "#f4f5f7")}>
          {formatDate(d.date)}
        </text>
        <line x1={540} x2={540} y1={infoY + 21} y2={infoY + 85} stroke="#56504a" strokeWidth={2} />
        <text x={594} y={infoY + 42} {...t(23, 500, HEAD)}>
          Instrument
        </text>
        <text x={594} y={infoY + 86} {...t(fitFont(d.instrument.trim() || "—", 270, 40, 22), 800, "#f4f5f7")} letterSpacing={1.5}>
          {d.instrument.trim() || "—"}
        </text>
      </g>

      {/* legs table */}
      <g>
        <rect x={TX} y={tableY} width={TW} height={TABLE_H} rx={22} fill="none" stroke={LINE_GOLD} strokeWidth={2} filter="url(#os-box-glow)" />
        <rect x={TX} y={tableY} width={TW} height={TABLE_H} rx={22} fill="url(#os-table)" stroke={LINE_GOLD} strokeWidth={2} />
        <GlowLines x={TX} y={tableY} width={TW} h={TABLE_H} />
        {cols.map((c, i) => (
          <g key={c.key}>
            {i > 0 && <line x1={colX[i]} x2={colX[i]} y1={tableY + 2} y2={tableY + TABLE_H - 2} stroke="#ffffff" strokeOpacity={0.08} />}
            <text x={colX[i] + c.w / 2} y={tableY + HEAD_H / 2 + 1} textAnchor="middle" dominantBaseline="central" {...t(fitFont(c.key, c.w - 24, 26, 18), 700, HEAD)} letterSpacing={1}>
              {c.key}
            </text>
          </g>
        ))}
        {legs.map((l, r) => {
          const y0 = tableY + HEAD_H + r * rowH;
          const cy = y0 + rowH / 2;
          const sell = l.action === "SELL";
          const pillW = Math.min(184, cols[0].w - 48);
          const pillX = colX[0] + (cols[0].w - pillW) / 2 + 13;
          const word = sell ? "SELL" : "BUY";
          const inner = 36 + 14 + w(word, 36, 0.66);
          const ix = pillX + (pillW - inner) / 2;
          const values = [strikeText(l), fmtInt(l.qty), fmtPrice(l.price), ...(closed ? [fmtPrice(l.exitPrice)] : [])];
          return (
            <g key={r}>
              <line x1={TX} x2={TX + TW} y1={y0} y2={y0} stroke="#ffffff" strokeOpacity={0.14} />
              <rect x={TX + 14} y={y0 + 14} width={6} height={rowH - 28} rx={3} fill={sell ? "#e3243b" : "#22d46b"} filter={sell ? "url(#os-glow-red)" : "url(#os-glow-green)"} />
              <rect x={pillX} y={cy - ph / 2} width={pillW} height={ph} rx={12} fill={sell ? "url(#os-sell)" : "url(#os-buy)"} filter={sell ? "url(#os-glow-red)" : "url(#os-glow-green)"} />
              <svg x={ix} y={cy - 18} width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                <path d={sell ? "M4 8l8 8 8-8" : "M4 16l8-8 8 8"} />
              </svg>
              <text x={ix + 50} y={cy + 1} dominantBaseline="central" {...t(36, 800, "#fff")}>
                {word}
              </text>
              {values.map((v, i) => (
                <text
                  key={i}
                  x={colX[i + 1] + cols[i + 1].w / 2}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  {...t(fitFont(v, cols[i + 1].w - 30, vf, 20), 800, "#f4f5f7")}
                  letterSpacing={-0.5}
                >
                  {v}
                </text>
              ))}
            </g>
          );
        })}
      </g>

      {/* total P&L (CLOSE) */}
      {closed && (
        <g>
          <rect x={TX} y={pnlY} width={TW} height={PNL_H} rx={20} fill="none" stroke={neg ? "#e3243b" : "#2bd46e"} strokeWidth={2} filter="url(#os-pnl-glow)" />
          <rect x={TX} y={pnlY} width={TW} height={PNL_H} rx={20} fill="url(#os-pnl)" stroke={neg ? "#e3243b" : "#2bd46e"} strokeWidth={2} />
          <Icon x={TX + 44} y={pnlY + 20} size={82} vb={82}>
            <circle cx="41" cy="41" r="38" stroke={neg ? "#ff4d5e" : "#2bd46e"} strokeWidth="3.5" />
            <path
              d={neg ? "M20 29l14 14 9-8 17 18" : "M20 53l14-14 9 8 17-18"}
              stroke={neg ? "#ff4d5e" : "#2bd46e"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d={neg ? "M49 54h12V42" : "M49 28h12v12"} stroke={neg ? "#ff4d5e" : "#2bd46e"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </Icon>
          <text x={TX + 44 + 82 + 32} y={pnlY + PNL_H / 2 + 1} dominantBaseline="central" {...t(39, 700, "#f4f5f7")}>
            Total P&amp;L
          </text>
          <rect x={sepX} y={pnlY + 32} width={2} height={58} fill="#4a5a50" />
          <text x={(amtL + amtR) / 2} y={pnlY + PNL_H / 2 + 2} textAnchor="middle" dominantBaseline="central" {...t(amtSize, 900, "url(#os-amt)")} letterSpacing={-2}>
            {amount}
          </text>
          {pct && (
            <text x={TX + TW - 26} y={pnlY + PNL_H / 2 + 1} textAnchor="end" dominantBaseline="central" {...t(39, 800, neg ? "#ff5566" : "#35e27a")}>
              {pct}
            </text>
          )}
        </g>
      )}

      {/* footer */}
      <g>
        {foot.map((s, i) => {
          const x0 = fx;
          fx += footW[i] + 78;
          return (
            <g key={i}>
              {i > 0 && <rect x={x0 - 40} y={footY + 8} width={2} height={34} fill={GOLD} />}
              <Icon x={x0} y={footY} size={50} vb={50}>
                {FOOT_ICONS[i % 3]}
              </Icon>
              <text x={x0 + 72} y={footY + 26} dominantBaseline="central" {...t(18, 600, "#e8e8e8")} letterSpacing={3}>
                {s}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
});
