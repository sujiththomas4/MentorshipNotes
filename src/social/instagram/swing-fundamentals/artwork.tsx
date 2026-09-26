import { forwardRef } from "react";
import { IG } from "@/social/instagram/kit";
import { SwingFrame, type Palette, type SwingSlots } from "@/social/instagram/swing-trade/artwork";
import { inr } from "@/social/instagram/swing-trade/data";
import { crore, peCompare, percent, type SwingFundamentalsData } from "./data";

/*
 * Swing Trade without Target and Stop Loss: the Swing Trade frame with fundamentals in the
 * level row and bottom card. Without a chart image the chart box asks for one (there are no
 * levels to draw an illustrative chart from).
 */

export const SwingFundamentalsArtwork = forwardRef<SVGSVGElement, { data: SwingFundamentalsData; className?: string }>(function SwingFundamentalsArtwork({ data: d, className }, ref) {
  return <SwingFrame ref={ref} d={d} className={className} slots={(C) => slots(d, C)} />;
});

function slots(d: SwingFundamentalsData, C: Palette): SwingSlots {
  const pe = peCompare(d);
  return {
    ariaLabel: `Swing trade ${d.direction} ${d.ticker}, fundamentals`,
    banner: d.banner.trim() || "TRADE SETUP",
    chartFallback: <ChartPlaceholder d={d} C={C} />,
    levels: [
      { icon: "factory", label: "SECTOR", value: d.sector.trim() || "—" },
      { icon: "pie", label: "MARKET CAP", value: crore(d.marketCap), ic: C.emerald },
      { icon: "chart", label: "SALES", value: crore(d.sales), ic: C.emerald },
      { icon: "percent", label: "ROCE", value: percent(d.roce), ic: C.emerald },
    ],
    setup: { icon: "price", label: "NET PROFIT", value: crore(d.netProfit) },
    key: {
      icon: "risk",
      label: "PE VS INDUSTRY PE",
      value: pe.value,
      caption: `Company vs Industry${pe.relation ? ` · ${pe.relation} industry` : ""}`,
    },
    last: { icon: "people", label: "PROMOTER HOLDING", value: percent(d.promoterHolding) },
  };
}

const W = 1001;
const H = 484;

function ChartPlaceholder({ d, C }: { d: SwingFundamentalsData; C: Palette }) {
  const f = (size: number, weight: number, fill: string) => ({ fontFamily: IG.font, fontSize: size, fontWeight: weight, fill });
  return (
    <g>
      <rect width={W} height={H} fill={C.chartBg} />
      <text x={W / 2} y={H / 2 - 12} textAnchor="middle" {...f(24, 600, C.muted)}>
        Upload your chart image
      </text>
      <text x={W / 2} y={H / 2 + 22} textAnchor="middle" {...f(20, 500, C.muted)}>
        {`${d.stockName || d.ticker || "Stock"} · ${d.exchange || "NSE"}${d.currentPrice.trim() ? ` · ${inr(d.currentPrice)}` : ""}`}
      </text>
    </g>
  );
}
