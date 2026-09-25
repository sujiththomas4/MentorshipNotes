import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadSvgAsPng } from "@/social/export";
import { BV_COLORS, BV_GRADIENT, BV_SHADOW_COLORS, BV_SIZES, BV_VARIANTS, type BvSize } from "@/branding/bethlehem-valley";

/*
 * Logo studio for Bethlehem Valley, ported from bethlehem-valley-logo-studio.html: pick a
 * variant, a canvas (square / 4:5 / story), a background and shadow, and export a PNG.
 * The logo PNGs are only placed and scaled; the shadow layer is tinted with a filter.
 */

type Bg = "none" | "solid" | "gradient" | "image";
export type StudioState = {
  v: number;
  size: BvSize;
  ring: boolean;
  bg: Bg;
  color: string;
  g1: string;
  g2: string;
  gtype: "linear" | "radial";
  gangle: number;
  bgimg: string | null;
  dim: number;
  bgop: number;
  lop: number;
  lsize: Record<BvSize, number>;
  ly: number;
  shon: boolean;
  shop: number;
  shcolor: string;
};

const DEFAULTS: StudioState = {
  v: 0,
  size: "square",
  ring: false,
  bg: "solid",
  color: "#0B3D24",
  g1: BV_GRADIENT.from,
  g2: BV_GRADIENT.to,
  gtype: "radial",
  gangle: 135,
  bgimg: null,
  dim: 20,
  bgop: 100,
  lop: 100,
  lsize: { square: BV_SIZES.square.logo, portrait: BV_SIZES.portrait.logo, story: BV_SIZES.story.logo },
  ly: 0,
  shon: true,
  shop: 70,
  shcolor: "#000000",
};

const STORE = "branding:bv-studio";

function layout(s: StudioState) {
  const { w: W, h: H } = BV_SIZES[s.size];
  const box = (W * s.lsize[s.size]) / 100;
  return { W, H, box, x: (W - box) / 2, y: (H - box) / 2 + ((s.ly / 100) * H) / 2 };
}

function gradVec(W: number, H: number, a: number) {
  const r = (a * Math.PI) / 180;
  const dx = Math.cos(r);
  const dy = Math.sin(r);
  const L = (Math.abs(W * dx) + Math.abs(H * dy)) / 2;
  return { x1: W / 2 - dx * L, y1: H / 2 - dy * L, x2: W / 2 + dx * L, y2: H / 2 + dy * L };
}

/** The composed artwork (also what is exported). */
export const StudioArt = forwardRef<SVGSVGElement, { s: StudioState; className?: string }>(function StudioArt({ s, className }, ref) {
  const { W, H, box, x, y } = layout(s);
  const A = BV_VARIANTS[s.v];
  const op = s.bgop / 100;
  const shadow = s.shon && s.shop > 0;
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={`Bethlehem Valley variant ${A.id}`}>
      <defs>
        {s.gtype === "linear" ? (
          <linearGradient id="bv-grad" gradientUnits="userSpaceOnUse" {...gradVec(W, H, s.gangle)}>
            <stop offset="0" stopColor={s.g1} />
            <stop offset="1" stopColor={s.g2} />
          </linearGradient>
        ) : (
          <radialGradient id="bv-grad" gradientUnits="userSpaceOnUse" cx={W / 2} cy={H / 2} r={Math.hypot(W, H) / 2}>
            <stop offset="0" stopColor={s.g1} />
            <stop offset="1" stopColor={s.g2} />
          </radialGradient>
        )}
        <filter id="bv-tint" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feFlood floodColor={s.shcolor} />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      {s.bg === "solid" && <rect width={W} height={H} fill={s.color} fillOpacity={op} />}
      {s.bg === "gradient" && <rect width={W} height={H} fill="url(#bv-grad)" fillOpacity={op} />}
      {s.bg === "image" && s.bgimg && (
        <g opacity={op}>
          <image href={s.bgimg} width={W} height={H} preserveAspectRatio="xMidYMid slice" />
          {s.dim > 0 && <rect width={W} height={H} fill="#000" fillOpacity={s.dim / 100} />}
        </g>
      )}
      {shadow && <image href={A.shadow} x={x} y={y} width={box} height={box} opacity={s.shop / 100} filter="url(#bv-tint)" />}
      <image href={A.logo} x={x} y={y} width={box} height={box} opacity={s.lop / 100} />
    </svg>
  );
});

export function BvStudio({ variant, onVariant }: { variant: number; onVariant: (v: number) => void }) {
  const [s, setS] = useState<StudioState>(DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const ref = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);

  // remember settings (not the background image) in this browser
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw), bgimg: null });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ ...s, bgimg: null }));
    } catch {
      /* ignore */
    }
  }, [s, ready]);
  // the gallery picks the variant
  useEffect(() => setS((p) => (p.v === variant ? p : { ...p, v: variant })), [variant]);

  const set = <K extends keyof StudioState>(k: K, v: StudioState[K]) => setS((p) => ({ ...p, [k]: v }));
  const { W, H } = layout(s);

  async function exportPng(scale: 1 | 2) {
    if (!ref.current) return;
    setBusy(true);
    setMsg("");
    try {
      await downloadSvgAsPng(ref.current, W * scale, H * scale, `bethlehem-valley_v${BV_VARIANTS[s.v].id}_${W}x${H}${scale === 2 ? "@2x" : ""}.png`);
      setMsg(`Saved ${W * scale} × ${H * scale} PNG.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  function onImage(file?: File) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => set("bgimg", String(r.result));
    r.readAsDataURL(file);
  }

  const r = Math.min(W, H) / 2;
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* stage */}
      <div className="card-elevated flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 text-sm">
          <span className="font-semibold" style={{ color: "#0B3D24" }}>
            Variant {BV_VARIANTS[s.v].id}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {W} × {H} · {s.bg === "none" ? "transparent" : s.bg === "solid" ? s.color : s.bg}
          </span>
        </div>
        <div className="grid flex-1 place-items-center p-6" style={{ background: "radial-gradient(circle at 50% 40%, #fbfaf6, #ebe7dc)" }}>
          <div
            className="relative shadow-2xl"
            style={{
              width: `min(100%, ${(520 * W) / H}px)`,
              aspectRatio: `${W} / ${H}`,
              backgroundColor: "#fff",
              backgroundImage:
                "linear-gradient(45deg,#d9d9d9 25%,transparent 25%),linear-gradient(-45deg,#d9d9d9 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d9d9d9 75%),linear-gradient(-45deg,transparent 75%,#d9d9d9 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
            }}
          >
            <StudioArt ref={ref} s={s} className="block h-full w-full" />
            {s.ring && (
              <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <mask id="bv-ring-mask">
                    <rect width={W} height={H} fill="#fff" />
                    <circle cx={W / 2} cy={H / 2} r={r} fill="#000" />
                  </mask>
                </defs>
                <rect width={W} height={H} fill="rgba(0,0,0,.55)" mask="url(#bv-ring-mask)" />
                <circle cx={W / 2} cy={H / 2} r={r} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="10 8" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto border-t border-border p-3">
          {BV_VARIANTS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onVariant(i)}
              aria-pressed={s.v === i}
              aria-label={`Variant ${v.id}`}
              className={cn("h-16 w-16 shrink-0 rounded-xl border-2 p-1", s.v === i ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30" : "border-transparent")}
              style={{ background: "linear-gradient(160deg,#10492c,#062d18)" }}
            >
              <img src={v.web} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="card-elevated space-y-5 rounded-2xl border border-border bg-card p-5 text-sm">
        <Group title="Canvas">
          <Seg
            value={s.size}
            onChange={(v) => set("size", v)}
            options={(Object.keys(BV_SIZES) as BvSize[]).map((k) => [k, BV_SIZES[k].label])}
          />
          <label className="mt-2 flex items-center gap-2 font-medium">
            <input type="checkbox" checked={s.ring} onChange={(e) => set("ring", e.target.checked)} className="h-4 w-4 accent-[#0B3D24]" />
            Show profile-photo circle
          </label>
        </Group>

        <Group title="Background">
          <Seg
            value={s.bg}
            onChange={(v) => set("bg", v)}
            options={[
              ["none", "None"],
              ["solid", "Solid"],
              ["gradient", "Gradient"],
              ["image", "Image"],
            ]}
          />
          {s.bg === "solid" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[...BV_COLORS, { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }].map((c) => (
                <Swatch key={c.hex} c={c} on={s.color.toLowerCase() === c.hex.toLowerCase()} onClick={() => set("color", c.hex)} />
              ))}
              <input type="color" value={s.color} onChange={(e) => set("color", e.target.value)} aria-label="Custom colour" className="h-8 w-11 cursor-pointer rounded-md border border-border p-0.5" />
            </div>
          )}
          {s.bg === "gradient" && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <input type="color" value={s.g1} onChange={(e) => set("g1", e.target.value)} aria-label="Gradient start" className="h-8 flex-1 cursor-pointer rounded-md border border-border p-0.5" />
                <input type="color" value={s.g2} onChange={(e) => set("g2", e.target.value)} aria-label="Gradient end" className="h-8 flex-1 cursor-pointer rounded-md border border-border p-0.5" />
              </div>
              <Seg
                value={s.gtype}
                onChange={(v) => set("gtype", v)}
                options={[
                  ["linear", "Linear"],
                  ["radial", "Radial"],
                ]}
              />
              {s.gtype === "linear" && <Range label="Angle" unit="°" min={0} max={360} value={s.gangle} onChange={(v) => set("gangle", v)} />}
            </div>
          )}
          {s.bg === "image" && (
            <div className="mt-3 space-y-3">
              <label className="flex cursor-pointer items-center justify-center rounded-lg border border-border bg-secondary/50 px-3 py-2 font-medium hover:bg-secondary">
                {s.bgimg ? "Replace background image" : "Choose background image"}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => (onImage(e.target.files?.[0]), (e.target.value = ""))} />
              </label>
              <Range label="Darken image" unit="%" min={0} max={80} value={s.dim} onChange={(v) => set("dim", v)} />
            </div>
          )}
          {s.bg !== "none" && <Range label="Background opacity" unit="%" min={0} max={100} value={s.bgop} onChange={(v) => set("bgop", v)} />}
        </Group>

        <Group title="Logo">
          <Range label="Logo opacity" unit="%" min={0} max={100} value={s.lop} onChange={(v) => set("lop", v)} />
          <Range label="Size" unit="%" min={30} max={100} value={s.lsize[s.size]} onChange={(v) => set("lsize", { ...s.lsize, [s.size]: v })} />
          <Range label="Vertical position" unit="" min={-40} max={40} value={s.ly} onChange={(v) => set("ly", v)} />
        </Group>

        <Group title="Shadow">
          <label className="flex items-center gap-2 font-medium">
            <input type="checkbox" checked={s.shon} onChange={(e) => set("shon", e.target.checked)} className="h-4 w-4 accent-[#0B3D24]" />
            Show drop shadow
          </label>
          {s.shon && (
            <>
              <Range label="Shadow opacity" unit="%" min={0} max={100} value={s.shop} onChange={(v) => set("shop", v)} />
              <div className="flex flex-wrap items-center gap-2">
                {BV_SHADOW_COLORS.map((c) => (
                  <Swatch key={c.hex} c={c} on={s.shcolor.toLowerCase() === c.hex.toLowerCase()} onClick={() => set("shcolor", c.hex)} />
                ))}
                <input type="color" value={s.shcolor} onChange={(e) => set("shcolor", e.target.value)} aria-label="Custom shadow colour" className="h-8 w-11 cursor-pointer rounded-md border border-border p-0.5" />
              </div>
            </>
          )}
        </Group>

        <Group title="Export">
          <div className="grid grid-cols-2 gap-2">
            {([1, 2] as const).map((k) => (
              <button
                key={k}
                type="button"
                disabled={busy}
                onClick={() => exportPng(k)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B3D24] px-3 py-2.5 font-semibold text-white hover:bg-[#0e4a2c] disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} PNG {k}×
              </button>
            ))}
          </div>
          <a
            href={BV_VARIANTS[s.v].logo}
            download={`bethlehem-valley_v${BV_VARIANTS[s.v].id}_transparent_1080x1080.png`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium hover:bg-secondary"
          >
            <Download className="h-4 w-4" /> Transparent logo only (PNG)
          </a>
          <button
            type="button"
            onClick={() => setS({ ...DEFAULTS, v: s.v })}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-muted-foreground hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
          <p className="text-xs text-muted-foreground">PNG 1× is pixel-exact to the 1080 px artwork; 2× doubles the canvas but can't add detail that isn't in the source.</p>
        </Group>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#0B3D24" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="grid overflow-hidden rounded-lg border border-border" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map(([v, label], i) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn("px-1.5 py-2 text-xs font-semibold", i > 0 && "border-l border-border", value === v ? "bg-[#0B3D24] text-white" : "bg-[#faf8f3] hover:bg-[#f2efe6]")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Range({ label, unit, min, max, value, onChange }: { label: string; unit: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs font-semibold">
        {label}
        <span className="font-mono text-muted-foreground">
          {unit === "" && value > 0 ? "+" : ""}
          {value}
          {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#0B3D24]" />
    </label>
  );
}

function Swatch({ c, on, onClick }: { c: { name: string; hex: string }; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={`${c.name} ${c.hex}`}
      aria-label={`${c.name} ${c.hex}`}
      aria-pressed={on}
      onClick={onClick}
      className={cn("h-8 w-8 rounded-full border border-black/15", on && "ring-2 ring-[#0B3D24] ring-offset-2")}
      style={{ background: c.hex }}
    />
  );
}
