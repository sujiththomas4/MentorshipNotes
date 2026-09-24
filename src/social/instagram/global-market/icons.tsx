import type { ReactNode } from "react";
import { IG } from "@/social/instagram/kit";
import type { MarketKey } from "./data";

/* Market icons, drawn in an 88 × 88 box. `uid` keeps clip-path ids unique per slide. */

function UsFlag({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-us`}>
          <circle cx={44} cy={44} r={30} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-us)`}>
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={14} y={14 + i * 8.6} width={60} height={4.3} fill="#E53945" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={`w${i}`} x={14} y={18.3 + i * 8.6} width={60} height={4.3} fill="#FFFFFF" />
        ))}
        <rect x={14} y={14} width={30} height={30} fill="#1D4E9E" />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={21 + c * 8} cy={21 + r * 8} r={1.8} fill="#FFFFFF" />))}
      </g>
    </g>
  );
}

function IndiaFlag({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-in`}>
          <circle cx={44} cy={44} r={30} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-in)`}>
        <rect x={14} y={14} width={60} height={20} fill="#FF9933" />
        <rect x={14} y={34} width={60} height={20} fill="#FFFFFF" />
        <rect x={14} y={54} width={60} height={20} fill="#138808" />
        <circle cx={44} cy={44} r={7} fill="none" stroke="#000080" strokeWidth={1.8} />
        <circle cx={44} cy={44} r={1.6} fill="#000080" />
      </g>
    </g>
  );
}

function Drop() {
  return <path d="M44 16 C44 16 24 40 24 52 A20 20 0 0 0 64 52 C64 40 44 16 44 16 Z" fill="#38BDF8" stroke="#BAE6FD" strokeWidth={2} />;
}

function Dollar() {
  return (
    <g>
      <circle cx={44} cy={44} r={28} fill={IG.bull} fillOpacity={0.2} stroke={IG.bull} strokeWidth={3} />
      <text x={44} y={46} textAnchor="middle" dominantBaseline="central" fill={IG.bull} fontFamily={IG.font} fontSize={36} fontWeight={800}>
        $
      </text>
    </g>
  );
}

function Bars() {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={22 + i * 12} y={60 - (i + 1) * 9} width={8} height={(i + 1) * 9} rx={1.5} fill={IG.text} />
      ))}
      <path d="M20 44 L36 32 L46 38 L66 20" fill="none" stroke={IG.bull} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M57 19 L67 19 L67 29" fill="none" stroke={IG.bull} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Clock() {
  return (
    <g fill="none" stroke={IG.text} strokeWidth={3.5} strokeLinecap="round">
      <circle cx={44} cy={44} r={24} />
      <line x1={44} x2={44} y1={44} y2={30} />
      <line x1={44} x2={54} y1={44} y2={50} />
    </g>
  );
}

const ICONS: Record<MarketKey, (p: { uid: string }) => ReactNode> = {
  dow: UsFlag,
  crudeOil: Drop,
  dollarIndex: Dollar,
  giftNifty: IndiaFlag,
  oiBuildup: Bars,
  preOpen: Clock,
};

/** Round icon tile for a market, `size` px wide, top-left at x, y. */
export function MarketIcon({ k, x, y, size, uid }: { k: MarketKey; x: number; y: number; size: number; uid: string }) {
  const Icon = ICONS[k];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={IG.card2} stroke={IG.border} strokeWidth={2} />
      <g transform={`scale(${size / 88})`}>
        <Icon uid={uid} />
      </g>
    </g>
  );
}
