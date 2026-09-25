import { useState, type ReactNode, type RefObject } from "react";
import { Download, FileDown, Loader2, RotateCcw, Upload } from "lucide-react";
import { downloadSvgAsPng, svgToPngBlob } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import { IG_LOGOS, IG_W, type IgLogoVariant } from "@/social/instagram/kit";
import { igH } from "@/social/instagram/layout";
import { LayoutPanel } from "@/social/instagram/layout-ui";
import type { LogoBg } from "@/social/instagram/swing-trade/data";
import { cn } from "@/lib/utils";
import { INDICATOR_THEMES, type IndicatorCommon } from "./data";
import { ICON_OPTIONS } from "./shared";

/* Editor pieces shared by the Indicator Intro and Indicator Details editors. */

export const btn = "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50";
export const inputCls = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="card-elevated rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-lg font-semibold">{title}</p>
      {note && <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {hint && <span className="ml-1.5 font-normal opacity-75">· {hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {ICON_OPTIONS.map(([k, n]) => (
        <option key={k} value={k}>
          {n}
        </option>
      ))}
    </select>
  );
}

type Setter<T> = <K extends keyof T>(k: K, v: T[K]) => void;

/** Load / save .json and reset, above the panels. */
export function FileButtons<T extends object>({ data, fileBase, template, onLoad, onReset, onMsg, check }: { data: T; fileBase: string; template: string; onLoad: (raw: Record<string, unknown>) => void; onReset: () => void; onMsg: (s: string) => void; check: (raw: Record<string, unknown>) => boolean }) {
  async function load(file?: File) {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!raw || typeof raw !== "object" || !check(raw)) throw new Error("this doesn't look like a saved post of this template");
      onLoad(raw);
      onMsg(`Loaded ${file.name}.`);
    } catch (e) {
      onMsg(`Couldn't load ${file.name}: ${e instanceof Error ? e.message : "invalid JSON"}`);
    }
  }
  function save() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ template, ...data }, null, 2)], { type: "application/json" }));
    a.download = `${fileBase}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  return (
    <div className="flex flex-wrap gap-2">
      <label className={cn(btn, "cursor-pointer")}>
        <Upload className="h-4 w-4" /> Load data (.json)
        <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => (load(e.target.files?.[0]), (e.target.value = ""))} />
      </label>
      <button type="button" onClick={save} className={btn}>
        <FileDown className="h-4 w-4" /> Download data (.json)
      </button>
      <button type="button" onClick={() => confirm("Replace everything with the sample post?") && onReset()} className={cn(btn, "text-muted-foreground")}>
        <RotateCcw className="h-4 w-4" /> Reset to sample
      </button>
    </div>
  );
}

/** Format & layout, title block and branding panels. */
export function CommonPanels<T extends IndicatorCommon & { banner: string }>({ data, set, titleNote }: { data: T; set: Setter<T>; titleNote: string }) {
  const text = (k: "pill" | "titleA" | "titleB" | "subtitle" | "banner" | "footer", label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={data[k]} onChange={(e) => set(k, e.target.value as T[typeof k])} className={inputCls} />
    </Field>
  );
  return (
    <>
      <LayoutPanel value={data.layout} onChange={(l) => set("layout", l as T["layout"])} themes={INDICATOR_THEMES} header="Show header (logo, series pill)" footer="Show footer (tagline)" />
      <Panel title="Title" note={titleNote}>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("titleA", "Title (navy)")}
          {text("titleB", "Second word (green)", "optional")}
          {text("subtitle", "Subtitle", "e.g. the full name")}
          {text("banner", "Brush banner")}
          {text("pill", "Series pill (top right)", "empty hides it")}
          {text("footer", "Footer tagline")}
          {[0, 1, 2].map((i) => (
            <Field key={i} label={`Script word ${i + 1}`}>
              <input value={data.script[i]} onChange={(e) => set("script", data.script.map((s, j) => (j === i ? e.target.value : s)) as T["script"])} className={inputCls} />
            </Field>
          ))}
        </div>
      </Panel>
    </>
  );
}

export function LogoPanel<T extends IndicatorCommon>({ data, set }: { data: T; set: Setter<T> }) {
  return (
    <Panel title="Logo" note="The locked logo from Branding. The white logo needs the navy plate on the light theme.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Logo">
          <select value={data.logo} onChange={(e) => set("logo", e.target.value as T["logo"])} className={inputCls}>
            {(Object.keys(IG_LOGOS) as IgLogoVariant[]).map((k) => (
              <option key={k} value={k}>
                {IG_LOGOS[k].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Background">
          <select value={data.logoBg} onChange={(e) => set("logoBg", e.target.value as LogoBg as T["logoBg"])} className={inputCls}>
            <option value="plate">Navy plate</option>
            <option value="shield">Filled shield</option>
            <option value="none">None</option>
          </select>
        </Field>
        <Field label={`Height (${data.logoHeight}px)`}>
          <input type="range" min={40} max={130} value={data.logoHeight} onChange={(e) => set("logoHeight", Number(e.target.value) as T["logoHeight"])} className="w-full accent-[#0AA66A]" />
        </Field>
      </div>
    </Panel>
  );
}

/**
 * Sticky preview with PNG + video downloads of the shown page (`svgRef`). `tabs` go above the
 * picture (multi-page posts), `extra` under the PNG button (e.g. "Download both pages").
 */
export function Preview({
  data,
  fileBase,
  svgRef,
  msg,
  onMsg,
  tabs,
  extra,
  children,
}: {
  data: IndicatorCommon;
  fileBase: string;
  svgRef: RefObject<SVGSVGElement | null>;
  msg: string;
  onMsg: (s: string) => void;
  tabs?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const H = igH(data.layout);
  async function download() {
    if (!svgRef.current) return;
    setBusy(true);
    onMsg("");
    try {
      await downloadSvgAsPng(svgRef.current, IG_W, H, `${fileBase}.png`);
    } catch (e) {
      onMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="xl:sticky xl:top-6 xl:self-start">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display font-semibold">Live preview</p>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">1080 × {H}</span>
        </div>
        {tabs}
        <div data-plan-preview className={cn(data.layout.format === "story" && "mx-auto max-w-[400px]")}>
          {children}
        </div>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0AA66A] px-4 py-3 font-display font-bold text-white shadow hover:brightness-95 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          Download PNG
        </button>
        {extra}
        <VideoDownload
          getPng={async () => {
            if (!svgRef.current) throw new Error("preview not ready");
            return svgToPngBlob(svgRef.current, IG_W, H);
          }}
          fileBase={fileBase}
          w={IG_W}
          h={H}
          onMsg={onMsg}
        />
        {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
        <p className="mt-2 text-xs text-muted-foreground">Exports exactly 1080 × {H} px. Your inputs are remembered in this browser.</p>
      </div>
    </div>
  );
}

/** "vwap-notes" style slug for file names. */
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "indicator";
