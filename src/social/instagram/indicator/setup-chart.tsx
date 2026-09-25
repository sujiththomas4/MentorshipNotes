import type { ReactNode } from "react";
import type { Palette } from "@/social/instagram/swing-trade/artwork";
import type { SetupSample } from "./setup-data";
import { t, type ChartBox } from "./shared";

/*
 * Drawn illustrations for the Indicator Setup post (used until a real chart is uploaded).
 * Candles follow scripted way-points so each picture shows its idea: pullbacks to VWAP on a
 * premium chart, reversal at S3 and breakout above R4, a rejection where R3 sits inside CPR.
 * Illustrative only, not price data.
 */

function seeded(seed: number) {
  let h = seed >>> 0 || 1;
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

type Candle = { o: number; c: number; hi: number; lo: number; v: number };

/** Candles through way-points [index, price], with a little seeded noise. */
function candles(way: [number, number][], n: number, seed: number): Candle[] {
  const r = seeded(seed);
  const prices = way.map((w) => w[1]);
  const noise = (Math.max(...prices) - Math.min(...prices)) * 0.018;
  const at = (i: number) => {
    const k = way.findIndex((w) => w[0] >= i);
    if (k <= 0) return way[0][1];
    const [i0, p0] = way[k - 1];
    const [i1, p1] = way[k];
    return p0 + ((p1 - p0) * (i - i0)) / (i1 - i0);
  };
  const out: Candle[] = [];
  let prev = at(0);
  for (let i = 0; i < n; i++) {
    const c = at(i) + (r() - 0.5) * noise * 2;
    out.push({ o: prev, c, hi: Math.max(prev, c) + r() * noise, lo: Math.min(prev, c) - r() * noise, v: 0.4 + r() });
    prev = c;
  }
  return out;
}

type Level = { p: number; label: string; color: string; dash?: boolean; width?: number };
type Mark = { i: number; up: boolean; label: string };

function Plot({ B, C, K, levels = [], band, line, marks = [], tag, children }: { B: ChartBox; C: Palette; K: Candle[]; levels?: Level[]; band?: [number, number, string]; line?: { values: number[]; label: string }; marks?: Mark[]; tag: boolean; children?: ReactNode }) {
  const all = [...K.flatMap((k) => [k.hi, k.lo]), ...levels.map((l) => l.p), ...(line?.values ?? [])];
  let lo = Math.min(...all);
  let hi = Math.max(...all);
  const pad = (hi - lo) * 0.08;
  lo -= pad;
  hi += pad;
  const x0 = B.x + 26;
  const x1 = B.x + B.w - 150;
  const y0 = B.y + 56;
  const y1 = B.y + B.h - 26;
  const step = (x1 - x0) / K.length;
  const X = (i: number) => x0 + step * (i + 0.5);
  const Y = (p: number) => y0 + (1 - (p - lo) / (hi - lo)) * (y1 - y0);
  const green = "#0e9f63";
  const red = "#e5323f";
  return (
    <g>
      <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={C.chartBg} />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={B.x} x2={B.x + B.w} y1={y0 + (y1 - y0) * f} y2={y0 + (y1 - y0) * f} stroke={C.gridH} />
      ))}
      {band && <rect x={x0 - 10} y={Y(band[1])} width={x1 - x0 + 20} height={Y(band[0]) - Y(band[1])} fill={band[2]} opacity={0.18} />}
      {levels.map((l) => (
        <g key={l.label}>
          <line x1={x0 - 10} x2={x1 + 10} y1={Y(l.p)} y2={Y(l.p)} stroke={l.color} strokeWidth={l.width ?? 2.2} strokeDasharray={l.dash ? "8 6" : undefined} />
          <rect x={x1 + 16} y={Y(l.p) - 14} width={118} height={28} rx={5} fill={l.color} />
          <text x={x1 + 75} y={Y(l.p) + 1} textAnchor="middle" dominantBaseline="central" {...t(14, 700, "#fff")}>
            {l.label}
          </text>
        </g>
      ))}
      {K.map((k, i) => {
        const col = k.c >= k.o ? green : red;
        const yt = Y(Math.max(k.o, k.c));
        const yb = Y(Math.min(k.o, k.c));
        return (
          <g key={i}>
            <line x1={X(i)} x2={X(i)} y1={Y(k.hi)} y2={Y(k.lo)} stroke={col} strokeWidth={1.5} />
            <rect x={X(i) - step * 0.32} y={yt} width={step * 0.64} height={Math.max(1.5, yb - yt)} fill={col} rx={0.8} />
          </g>
        );
      })}
      {line && (
        <g>
          <path d={line.values.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(p).toFixed(1)}`).join(" ")} fill="none" stroke="#1d6fd6" strokeWidth={3.4} strokeLinejoin="round" />
          <rect x={x1 + 16} y={Y(line.values[line.values.length - 1]) - 14} width={118} height={28} rx={5} fill="#1d6fd6" />
          <text x={x1 + 75} y={Y(line.values[line.values.length - 1]) + 1} textAnchor="middle" dominantBaseline="central" {...t(14, 700, "#fff")}>
            {line.label}
          </text>
        </g>
      )}
      {marks.map((m) => {
        const k = K[m.i];
        const x = X(m.i);
        const y = m.up ? Y(k.lo) + 14 : Y(k.hi) - 14;
        const col = m.up ? green : red;
        return (
          <g key={m.i}>
            <path d={m.up ? `M${x} ${y} l-9 15 h18 z` : `M${x} ${y} l-9 -15 h18 z`} fill={col} />
            <text x={x} y={m.up ? y + 34 : y - 24} textAnchor="middle" {...t(15, 800, col)}>
              {m.label}
            </text>
          </g>
        );
      })}
      {children}
      {tag && (
        <text x={B.x + B.w - 14} y={B.y + 26} textAnchor="end" {...t(14, 600, C.muted)} fontStyle="italic">
          Illustration · upload your chart
        </text>
      )}
    </g>
  );
}

export function SetupChart({ kind, B, C, tag }: { kind: SetupSample; B: ChartBox; C: Palette; tag: boolean }) {
  if (kind === "camarilla-premium") {
    const K = candles([[0, 128], [8, 146], [14, 118], [18, 111], [26, 144], [32, 148], [38, 124], [44, 113], [50, 149], [55, 172], [59, 184]], 60, 7);
    return (
      <Plot
        B={B}
        C={C}
        K={K}
        tag={tag}
        levels={[
          { p: 170, label: "R4 (H4)", color: "#b3261e", dash: true },
          { p: 150, label: "R3 (H3)", color: "#e5323f" },
          { p: 110, label: "S3 (L3)", color: "#0e9f63" },
          { p: 90, label: "S4 (L4)", color: "#0a6b43", dash: true },
        ]}
        marks={[
          { i: 18, up: true, label: "Reversal" },
          { i: 55, up: true, label: "Breakout" },
        ]}
      />
    );
  }
  if (kind === "cpr-camarilla") {
    const K = candles([[0, 24470], [10, 24512], [18, 24498], [28, 24560], [34, 24592], [38, 24613], [42, 24582], [50, 24530], [59, 24492]], 60, 11);
    return (
      <Plot
        B={B}
        C={C}
        K={K}
        tag={tag}
        band={[24582, 24622, "#1d6fd6"]}
        levels={[
          { p: 24622, label: "TC", color: "#1d6fd6", dash: true, width: 1.8 },
          { p: 24602, label: "R3 (H3)", color: "#e5323f", width: 2.8 },
          { p: 24582, label: "BC", color: "#1d6fd6", dash: true, width: 1.8 },
        ]}
        marks={[{ i: 38, up: false, label: "Rejection" }]}
      >
        <text x={B.x + 40} y={B.y + B.h * 0.56} {...t(16, 800, "#1d6fd6")}>
          CPR band + R3 inside = confluence zone
        </text>
      </Plot>
    );
  }
  // VWAP on a premium chart: rising premium, pullbacks that hold VWAP
  const K = candles([[0, 80], [10, 100], [16, 93], [26, 118], [32, 110], [44, 138], [50, 130], [59, 152]], 60, 3);
  // the line runs just under each pullback low, so the picture shows price respecting VWAP
  const dips: [number, number][] = [[0, K[0].lo - 3], [16, K[16].lo - 0.8], [32, K[32].lo - 0.8], [50, K[50].lo - 0.8], [59, K[50].lo + 7]];
  const shown = K.map((_, i) => {
    const k = dips.findIndex((p) => p[0] >= i);
    if (k <= 0) return dips[0][1];
    const [i0, p0] = dips[k - 1];
    const [i1, p1] = dips[k];
    const f = (i - i0) / (i1 - i0);
    return p0 + (p1 - p0) * (f * f * (3 - 2 * f));
  });
  return (
    <Plot
      B={B}
      C={C}
      K={K}
      tag={tag}
      line={{ values: shown, label: "VWAP" }}
      marks={[
        { i: 16, up: true, label: "Buy" },
        { i: 32, up: true, label: "Buy" },
        { i: 50, up: true, label: "Buy" },
      ]}
    />
  );
}
