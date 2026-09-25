import { forwardRef, type ReactNode } from "react";
import { IG_H, IG_W } from "@/social/instagram/kit";
import { fmtInt, fmtPrice, formatDate, num, pnl, type Leg } from "@/social/instagram/option-selling/data";
import { netPremium, type OptionSellingV2Data } from "./data";

/*
 * Port of Indian_Traders_Weekly_Option_Selling_1080x1350_outlined.svg. The painted artwork
 * (logo, WEEKLY / OPTION / SELLING, bull & bear, calendar, empty card, brush line) is its
 * embedded PNG; everything else is live text drawn in the reference's 1122 × 1402 space and
 * scaled to 1080 × 1350, like the original.
 */

const BG = "/social/instagram/option-selling-v2/background.png";
const RW = 1122;
const RH = 1402;
const FONT = "Poppins, 'Segoe UI', Arial, sans-serif";
const t = (size: number, weight: number, fill: string) => ({ fontFamily: FONT, fontSize: size, fontWeight: weight, fill });
/** fit Poppins text into maxW (k ≈ width per px of font size per character) */
const fit = (text: string, maxW: number, max: number, min: number, k = 0.64) => Math.max(min, Math.min(max, text.length ? maxW / (text.length * k) : max));

const split = (s: string) =>
  s
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);

function strikeText(l: Leg) {
  const s = num(l.strike);
  return `${Number.isFinite(s) ? s : l.strike.trim() || "—"}${l.type ? " " + l.type : ""}`;
}

const rupees = (n: number) => `${n < 0 ? "−" : ""}₹ ${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Gold line icons from the reference (64 × 64 boxes). */
const ICON = {
  calendar: (
    <>
      <g fill="none" stroke="url(#os2-icon)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <rect x="8" y="12" width="48" height="44" rx="6" />
        <path d="M8 25h48M20 5v12M44 5v12" />
      </g>
      <g fill="url(#os2-icon)">
        {[31, 43].flatMap((y) => [15, 28, 41].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="7" rx="1.5" />))}
      </g>
    </>
  ),
  chart: (
    <>
      <g fill="none" stroke="url(#os2-icon)" strokeWidth="4.5" strokeLinejoin="round">
        <rect x="8" y="40" width="10" height="16" rx="1.5" />
        <rect x="24" y="32" width="10" height="24" rx="1.5" />
        <rect x="40" y="22" width="10" height="34" rx="1.5" />
      </g>
      <path d="M8 34L22 22L32 27L52 9" fill="none" stroke="url(#os2-icon)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 6H56V18" fill="none" stroke="url(#os2-icon)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  target: (
    <>
      <g fill="none" stroke="url(#os2-icon)" strokeWidth="5.5" strokeLinecap="round">
        <circle cx="30" cy="34" r="21" />
        <circle cx="30" cy="34" r="11" />
      </g>
      <circle cx="30" cy="34" r="4.5" fill="url(#os2-icon)" />
      <path d="M31 33L55 9" stroke="url(#os2-icon)" strokeWidth="5" strokeLinecap="round" />
      <path d="M47 6L58 6L58 17L52 17L52 12L47 12Z" fill="url(#os2-icon)" />
    </>
  ),
  gear: (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="28" y="4" width="8" height="12" rx="2" transform={`rotate(${a} 32 32)`} fill="url(#os2-icon)" />
      ))}
      <circle cx="32" cy="32" r="20" fill="none" stroke="url(#os2-icon)" strokeWidth="7" />
      <circle cx="32" cy="32" r="8" fill="none" stroke="url(#os2-icon)" strokeWidth="5" />
    </>
  ),
};

function Icon({ x, y, scale, children }: { x: number; y: number; scale: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#os2-shade)">
      {children}
    </g>
  );
}

export const OptionSellingV2Artwork = forwardRef<SVGSVGElement, { data: OptionSellingV2Data; className?: string }>(function OptionSellingV2Artwork(
  { data: d, className },
  ref,
) {
  const exit = d.mode === "EXIT";
  const legs = d.legs.slice(0, 4);
  const n = Math.max(legs.length, 1);
  const P = exit ? pnl(d) : null;
  const E = exit ? null : netPremium(d);
  const neg = !!P && P.ok && P.total < 0;

  // ---- card layout (reference: card 618.5–1160.5, table from 805, P&L panel 122 high; rows are taller) ----
  const CARD_TOP = 618.5;
  const CARD_MIN_BOTTOM = 1160.5;
  const TX = 145;
  const TW = 833;
  const HEAD_H = 60;
  // bigger rows than the reference so the trade values carry the post
  const rowH = [112, 82, 66, 54][n - 1];
  const TABLE_TOP = n >= 3 ? 797 : 805;
  const panelH = n >= 4 ? 96 : n >= 3 ? 104 : 122;
  const gapTP = n >= 4 ? 12 : n >= 3 ? 16 : 20;
  const natural = TABLE_TOP + HEAD_H + rowH * n + gapTP + panelH + 18.5;
  // a short table: the spare room goes above the table and above the panel
  const spare = Math.max(0, CARD_MIN_BOTTOM - natural);
  const tableY = TABLE_TOP + spare / 2;
  const tableH = HEAD_H + rowH * n;
  const panelY = tableY + tableH + gapTP + spare / 2;
  const cardBottom = panelY + panelH + 18.5;
  const cardH = cardBottom - CARD_TOP;
  const footDy = Math.min(34, Math.max(0, cardBottom - CARD_MIN_BOTTOM));

  const cols = exit
    ? [
        { key: "ACTION", w: 180 },
        { key: "STRIKE PRICE", w: 210 },
        { key: "QNTY", w: 125 },
        { key: "ENTRY", w: 159 },
        { key: "EXIT", w: 159 },
      ]
    : [
        { key: "ACTION", w: 204 },
        { key: "STRIKE PRICE", w: 244 },
        { key: "QNTY", w: 185 },
        { key: "PRICE", w: 200 },
      ];
  const colX = cols.reduce<number[]>((acc, c, i) => [...acc, i ? acc[i - 1] + cols[i - 1].w : TX], []);
  const PILL_W = 164;
  const pillH = Math.min(58, rowH - 14);
  const pillSize = Math.min(32, pillH * 0.66);
  const valSize = [36, 36, 32, 30][n - 1];

  // header pill: the mode's label
  const label = (exit ? d.exitLabel : d.entryLabel).trim();
  const labelSize = fit(label, 300, 23, 16, 0.7);
  const labelW = Math.min(330, label.length * labelSize * 0.7 + 60);

  const nav = split(d.nav);
  const sub = split(d.subheadline);

  // bottom panel: P&L (exit) or net premium (entry)
  const s = panelH / 122;
  const green = { stroke: "#35f592", icon: "#2fe07c" };
  const red = { stroke: "#ff3b5c", icon: "#ff4d68" };
  const gold = { stroke: "#ffd21c", icon: "#ffd21c" };
  const tone = exit ? (neg ? red : green) : gold;
  const amount = exit ? (P?.ok ? rupees(P.total) : "—") : E?.ok ? rupees(Math.abs(E.net)) : "—";
  const panelTitle = exit ? "TOTAL P&L" : E?.ok ? (E.net >= 0 ? "NET CREDIT" : "NET DEBIT") : "NET PREMIUM";
  const pct = exit && P?.ok && P.percent !== null && d.showPercent ? `${P.percent < 0 ? "−" : "+"}${Math.abs(P.percent).toFixed(2)}%` : "";
  const tag = exit ? pct : d.entryTag.trim();
  const amountSize = fit(amount, tag ? 318 : 600, 50, 30, 0.62);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${IG_W} ${IG_H}`}
      width={IG_W}
      height={IG_H}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`Weekly option selling ${d.instrument} ${formatDate(d.date)} ${label}`}
    >
      <defs>
        <linearGradient id="os2-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#021629" />
          <stop offset=".16" stopColor="#010b17" />
          <stop offset=".7" stopColor="#01060d" />
          <stop offset="1" stopColor="#010a0c" />
        </linearGradient>
        <linearGradient id="os2-goldline" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe46a" />
          <stop offset=".5" stopColor="#e2ab10" />
          <stop offset="1" stopColor="#ffd84a" />
        </linearGradient>
        <linearGradient id="os2-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe45a" />
          <stop offset=".55" stopColor="#ffc915" />
          <stop offset="1" stopColor="#f0a800" />
        </linearGradient>
        <linearGradient id="os2-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07203a" />
          <stop offset="1" stopColor="#041224" />
        </linearGradient>
        <linearGradient id="os2-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff3e5f" />
          <stop offset="1" stopColor="#d40a36" />
        </linearGradient>
        <linearGradient id="os2-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2ad873" />
          <stop offset="1" stopColor="#0b9848" />
        </linearGradient>
        <linearGradient id="os2-panel" x1="0" y1="0" x2="1" y2="1">
          {exit && !neg && (
            <>
              <stop offset="0" stopColor="#062a19" />
              <stop offset=".55" stopColor="#03170e" />
              <stop offset="1" stopColor="#052414" />
            </>
          )}
          {exit && neg && (
            <>
              <stop offset="0" stopColor="#2c0710" />
              <stop offset=".55" stopColor="#170309" />
              <stop offset="1" stopColor="#27060e" />
            </>
          )}
          {!exit && (
            <>
              <stop offset="0" stopColor="#2a2006" />
              <stop offset=".55" stopColor="#141003" />
              <stop offset="1" stopColor="#231a05" />
            </>
          )}
        </linearGradient>
        <linearGradient id="os2-amount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={exit ? (neg ? "#ff9aa9" : "#7dffb0") : "#ffe98a"} />
          <stop offset="1" stopColor={exit ? (neg ? "#ff3452" : "#2fd774") : "#f5b000"} />
        </linearGradient>
        <linearGradient id="os2-pct" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={neg ? "#ff3e5f" : "#1fb45a"} />
          <stop offset="1" stopColor={neg ? "#b8062d" : "#0c7a3a"} />
        </linearGradient>
        <linearGradient id="os2-icon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe066" />
          <stop offset=".5" stopColor="#ffc21a" />
          <stop offset="1" stopColor="#e59a00" />
        </linearGradient>
        <filter id="os2-glow" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="5" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".85" />
          </feComponentTransfer>
        </filter>
        <filter id="os2-panel-glow" x="-5%" y="-20%" width="110%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="6" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".9" />
          </feComponentTransfer>
        </filter>
        <filter id="os2-shade" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity=".55" />
        </filter>
      </defs>

      <rect width={IG_W} height={IG_H} fill="#020508" />
      <g transform={`scale(${IG_W / RW} ${IG_H / RH})`}>
        <image href={BG} x={0} y={0} width={RW} height={RH} preserveAspectRatio="none" />

        {/* nav, top right */}
        {nav.length > 0 && (
          <text x={1055} y={84} textAnchor="end" {...t(22, 500, "#eef3f8")} letterSpacing={3.5} xmlSpace="preserve">
            {nav.map((s, i) => (
              <tspan key={i}>
                {i > 0 && (
                  <tspan fill="#ffd21c" fontWeight={700} letterSpacing={0}>
                    {"    |    "}
                  </tspan>
                )}
                {s}
              </tspan>
            ))}
          </text>
        )}

        {/* subheadline under the title */}
        {sub.length > 0 && (
          <text x={72} y={578} transform="rotate(-2.2 72 574)" {...t(fit(sub.join(" | "), 560, 27, 18, 0.72), 600, "#cdd6e2")} letterSpacing={1.5} xmlSpace="preserve">
            {sub.map((s, i) => (
              <tspan key={i}>
                {i > 0 && <tspan letterSpacing={0}>{"   |   "}</tspan>}
                {s}
              </tspan>
            ))}
          </text>
        )}

        {/* trade card */}
        <rect x={124.5} y={CARD_TOP} width={873} height={cardH} rx={30} fill="url(#os2-card)" />
        <rect x={124.5} y={CARD_TOP} width={873} height={cardH} rx={30} fill="none" stroke="url(#os2-goldline)" strokeWidth={2.4} filter="url(#os2-glow)" />
        <rect x={124.5} y={CARD_TOP} width={873} height={cardH} rx={30} fill="none" stroke="url(#os2-goldline)" strokeWidth={2} />

        {/* card header */}
        <rect x={143} y={632} width={836} height={62} rx={18} fill="url(#os2-bar)" stroke="#1b3550" strokeWidth={1.5} />
        <rect x={157} y={638} width={50} height={50} rx={11} fill="url(#os2-gold)" />
        <g transform="translate(163 644) scale(.59)" fill="none" stroke="#2a1c00" strokeWidth={4} strokeLinejoin="round">
          <rect x="8" y="12" width="48" height="44" rx="5" />
          <path d="M8 24h48M20 6v12M44 6v12" />
          <path d="M18 34h6M29 34h6M40 34h6M18 44h6M29 44h6M40 44h6" />
        </g>
        <text x={232} y={673} {...t(fit(d.cardTitle, 965 - labelW - 30 - 232, 27, 18, 0.68), 600, "#ffffff")}>
          {d.cardTitle}
        </text>
        {label && (
          <g>
            <rect x={965 - labelW} y={640} width={labelW} height={43} rx={21.5} fill="url(#os2-gold)" />
            <text x={965 - labelW / 2} y={662} textAnchor="middle" dominantBaseline="central" {...t(labelSize, 700, "#141007")} letterSpacing={0.5}>
              {label}
            </text>
          </g>
        )}

        {/* date · instrument · strategy */}
        <Icon x={163} y={731} scale={0.66}>
          {ICON.calendar}
        </Icon>
        <text x={229} y={749} {...t(18.5, 500, "#b3c0ff")} letterSpacing={0.6}>
          DATE
        </text>
        <text x={229} y={779} {...t(fit(formatDate(d.date), 155, 20.5, 14, 0.56), 500, "#ffffff")}>
          {formatDate(d.date)}
        </text>
        <rect x={396} y={726} width={1.5} height={56} fill="#2e4257" />
        <Icon x={430} y={731} scale={0.66}>
          {ICON.chart}
        </Icon>
        <text x={495} y={749} {...t(18.5, 500, "#b3c0ff")} letterSpacing={0.6}>
          INSTRUMENT
        </text>
        <text x={495} y={779} {...t(fit(d.instrument.trim() || "—", 160, 20.5, 14, 0.66), 500, "#ffffff")}>
          {d.instrument.trim() || "—"}
        </text>
        <rect x={665} y={726} width={1.5} height={56} fill="#2e4257" />
        <Icon x={700} y={731} scale={0.66}>
          {ICON.target}
        </Icon>
        <text x={768} y={749} {...t(18.5, 500, "#b3c0ff")} letterSpacing={0.6}>
          STRATEGY
        </text>
        <text x={768} y={779} {...t(fit(d.strategy.trim() || "—", 200, 18.5, 13, 0.5), 500, "#ffffff")}>
          {d.strategy.trim() || "—"}
        </text>

        {/* legs table */}
        <g>
          <rect x={TX} y={tableY} width={TW} height={tableH} rx={14} fill="#020a13" />
          <path d={`M${TX + 14} ${tableY}H${TX + TW - 14}Q${TX + TW} ${tableY} ${TX + TW} ${tableY + 14}V${tableY + HEAD_H}H${TX}V${tableY + 14}Q${TX} ${tableY} ${TX + 14} ${tableY}Z`} fill="#0a1a2c" />
          {legs.map((_, r) => (
            <path key={r} d={`M${TX} ${tableY + HEAD_H + r * rowH}H${TX + TW}`} stroke="#1d3a55" strokeWidth={1.4} />
          ))}
          {colX.slice(1).map((x) => (
            <path key={x} d={`M${x} ${tableY}V${tableY + tableH}`} stroke="#1d3a55" strokeWidth={1.4} />
          ))}
          <rect x={TX} y={tableY} width={TW} height={tableH} rx={14} fill="none" stroke="#1f5d8c" strokeWidth={1.6} />
          {cols.map((c, i) => (
            <text key={c.key} x={colX[i] + c.w / 2} y={tableY + HEAD_H / 2 + 9} textAnchor="middle" {...t(fit(c.key, c.w - 20, 25, 16, 0.68), 600, "#ffffff")}>
              {c.key}
            </text>
          ))}
          {legs.map((l, r) => {
            const cy = tableY + HEAD_H + r * rowH + rowH / 2;
            const sell = l.action === "SELL";
            const px = colX[0] + cols[0].w / 2 - PILL_W / 2;
            const py = cy - pillH / 2;
            const values = [strikeText(l), fmtInt(l.qty), fmtPrice(l.price), ...(exit ? [fmtPrice(l.exitPrice)] : [])];
            return (
              <g key={r}>
                <rect x={px} y={py} width={PILL_W} height={pillH} rx={11} fill={sell ? "url(#os2-red)" : "url(#os2-green)"} />
                <rect x={px + 2} y={py + 2} width={PILL_W - 4} height={pillH * 0.35} rx={8} fill="#fff" opacity={0.14} />
                <path
                  d={sell ? `M${px + 22} ${cy - 7}l12 12l12-12` : `M${px + 22} ${cy + 6}l12-12l12 12`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={4.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x={px + (PILL_W + 50) / 2} y={cy + pillSize * 0.36} textAnchor="middle" {...t(pillSize, 700, "#ffffff")}>
                  {sell ? "SELL" : "BUY"}
                </text>
                {values.map((v, i) => (
                  <text key={i} x={colX[i + 1] + cols[i + 1].w / 2} y={cy + valSize * 0.36} textAnchor="middle" {...t(fit(v, cols[i + 1].w - 20, valSize, 18, 0.62), 600, "#ffffff")}>
                    {v}
                  </text>
                ))}
              </g>
            );
          })}
        </g>

        {/* bottom panel: total P&L (exit) or net premium + entry tag (entry) */}
        <g>
          <rect x={TX} y={panelY} width={TW} height={panelH} rx={18} fill="url(#os2-panel)" stroke={tone.stroke} strokeWidth={2.2} filter="url(#os2-panel-glow)" />
          <rect x={TX} y={panelY} width={TW} height={panelH} rx={18} fill="none" stroke={tone.stroke} strokeWidth={1.6} />
          <g transform={`translate(${225} ${panelY + panelH / 2}) scale(${s}) translate(-225 -1082)`} fill="none" stroke={tone.icon} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
            {exit ? (
              <>
                <path d="M190 1095A37 37 0 0 1 244 1051" />
                <path d="M261 1070A37 37 0 0 1 206 1114" />
                <path d="M236 1047L247 1049L245 1060" />
                <path d="M214 1118L203 1116L205 1105" />
                <path d={neg ? "M246 1042L262 1058M252 1059H263V1048" : "M246 1058L262 1042M252 1041H263V1052"} strokeWidth={4} />
                <text x={225} y={1097} textAnchor="middle" {...t(42, 600, tone.icon)} stroke="none">
                  ₹
                </text>
              </>
            ) : (
              <>
                <circle cx={225} cy={1082} r={37} />
                <path d="M199 1082H236M225 1071L236 1082L225 1093" />
                <path d="M229 1063H241Q247 1063 247 1069V1095Q247 1101 241 1101H229" />
              </>
            )}
          </g>
          <text x={297} y={panelY + 44 * s} {...t(25 * Math.min(1, s + 0.08), 600, "#ffffff")} letterSpacing={0.5}>
            {panelTitle}
          </text>
          <text x={297} y={panelY + 98 * s} {...t(amountSize * Math.min(1, s + 0.08), 700, "url(#os2-amount)")}>
            {amount}
          </text>
          {tag && (
            <g>
              <rect x={631} y={panelY + 30 * s} width={1.6} height={66 * s} fill={exit ? (neg ? "#6f2a37" : "#2a6f46") : "#6f5a1e"} />
              <rect
                x={725}
                y={panelY + 32 * s}
                width={212}
                height={63 * s}
                rx={10}
                fill={exit ? "url(#os2-pct)" : "url(#os2-gold)"}
                stroke={exit ? (neg ? "#ff6079" : "#3de583") : "#ffe46a"}
                strokeWidth={1.2}
              />
              {exit ? (
                <>
                  <text x={815} y={panelY + 63.5 * s} textAnchor="middle" dominantBaseline="central" {...t(fit(tag, 140, 29, 18, 0.6), 600, "#ffffff")}>
                    {tag}
                  </text>
                  <path
                    d={neg ? `M899 ${panelY + 57 * s}L910 ${panelY + 75 * s}L921 ${panelY + 57 * s}Z` : `M899 ${panelY + 73 * s}L910 ${panelY + 55 * s}L921 ${panelY + 73 * s}Z`}
                    fill="#ffffff"
                  />
                </>
              ) : (
                <text x={831} y={panelY + 63.5 * s} textAnchor="middle" dominantBaseline="central" {...t(fit(tag, 180, 22, 14, 0.7), 700, "#141007")} letterSpacing={0.5}>
                  {tag}
                </text>
              )}
            </g>
          )}
        </g>

        {/* footer */}
        <g transform={`translate(0 ${footDy})`}>
          {[
            { icon: ICON.target, ix: 233, tx: 308, w: 105 },
            { icon: ICON.gear, ix: 456, tx: 526, w: 125 },
            { icon: ICON.chart, ix: 697, tx: 772, w: 170 },
          ].map((f, i) => (
            <g key={i}>
              <Icon x={f.ix} y={1200} scale={0.9}>
                {f.icon}
              </Icon>
              <text x={f.tx} y={1229} {...t(fit(d.footer[i].title, f.w, 19, 13, 0.7), 600, "#ffffff")}>
                {d.footer[i].title}
              </text>
              <text x={f.tx} y={1253} {...t(fit(d.footer[i].sub, f.w, 14.2, 10, 0.52), 400, "#d3dae3")}>
                {d.footer[i].sub}
              </text>
            </g>
          ))}
          <rect x={420} y={1208} width={1.5} height={48} fill="#5b6570" />
          <rect x={658} y={1208} width={1.5} height={48} fill="#5b6570" />
        </g>
      </g>
    </svg>
  );
});
