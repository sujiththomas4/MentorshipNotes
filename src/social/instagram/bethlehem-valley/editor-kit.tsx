import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Download, FileDown, ImagePlus, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlannedDraft } from "@/social/saved-posts";
import { VideoDownload } from "@/social/video-ui";
import { BV_FORMATS, BV_THEMES, CATEGORIES, ICON_NAMES, Scaled, bvFileBase, bvPngBlob, downloadBvPng, fitMessage, type BvFeature, type BvFormat, type BvTheme, type FitResult } from "./shared";

/* Editor building blocks shared by the Bethlehem Valley templates. */

export type BvCommon = {
  format: BvFormat;
  category: string;
  categoryIcon: string;
  meta: string;
  heading: string;
  mlHeading: string;
  body: string;
  mlBody: string;
  photo: string | null;
  photoZoom: number;
  photoX: number;
  photoY: number;
  features: BvFeature[];
  growEn: string;
  growMl: string;
  handle: string;
  follow: string;
};

/** Field groups each panel needs (pages of a multi-page post carry only some of them). */
export type TopicFields = { category: string; categoryIcon: string; meta: string };
export type TextFields = { heading: string; mlHeading: string; body: string; mlBody: string };
export type PhotoFields = { photo: string | null; photoZoom: number; photoX: number; photoY: number };
export type FileFields = { format: BvFormat; category: string };

export type Setter<T> = <K extends keyof T>(k: K, v: T[K]) => void;

/**
 * Post data remembered in this browser; opened from the content planner it is that planned
 * post's own draft and the page's Save-to-plan bar saves it (see saved-posts.tsx).
 */
export function useStoredPost<T extends object>(key: string, init: () => T, merge: (raw: Record<string, unknown> | null) => T) {
  const { data, setData, plan } = usePlannedDraft<T>(key, init, merge);
  const set: Setter<T> = (k, v) => setData((d) => ({ ...d, [k]: v }));
  return { data, setData, set, plan };
}

export function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export const btn = "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary";
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
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#0A3A20]" />
      {children}
    </label>
  );
}

export function Seg<V extends string>({ value, onChange, options }: { value: V; onChange: (v: V) => void; options: [V, string][] }) {
  return (
    <div className="grid overflow-hidden rounded-xl border border-border" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup">
      {options.map(([v, label], i) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn("px-2 py-2.5 text-sm font-semibold transition-colors", i > 0 && "border-l border-border", value === v ? "bg-[#0A3A20] text-white" : "hover:bg-secondary")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** A file button that reads an image as a data URL. */
export function ImageButton({ label, onImage }: { label: string; onImage: (src: string, name: string) => void }) {
  return (
    <label className={cn(btn, "cursor-pointer")}>
      <ImagePlus className="h-4 w-4" /> {label}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onImage(await readImage(f), f.name);
        }}
      />
    </label>
  );
}

export function FormatPanel<T extends { format: BvFormat; showHeader: boolean; showFooter: boolean; theme: BvTheme }>({ data, set, note }: { data: T; set: Setter<T>; note?: string }) {
  return (
    <Panel title="Format & layout" note={note}>
      <Seg<BvFormat>
        value={data.format}
        onChange={(v) => set("format", v as T["format"])}
        options={[
          ["story", BV_FORMATS.story.label],
          ["feed", BV_FORMATS.feed.label],
        ]}
      />
      <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Colour theme</p>
      <div className="flex flex-wrap gap-2">
        {BV_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => set("theme", t.id as T["theme"])}
            aria-pressed={(data.theme ?? "forest") === t.id}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold",
              (data.theme ?? "forest") === t.id ? "border-foreground" : "border-border hover:border-muted-foreground/40",
            )}
          >
            <span className="flex overflow-hidden rounded-md">
              {t.swatch.map((c) => (
                <span key={c} className="h-6 w-4" style={{ background: c }} />
              ))}
            </span>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        <Check checked={data.showHeader} onChange={(v) => set("showHeader", v as T["showHeader"])}>
          Show header (logo, brand name, slogan)
        </Check>
        <Check checked={data.showFooter} onChange={(v) => set("showFooter", v as T["showFooter"])}>
          Show footer (Instagram, brand name)
        </Check>
      </div>
      {(!data.showHeader || !data.showFooter) && (
        <p className="mt-2 text-xs text-muted-foreground">The content moves into the freed space. The header and footer settings below are kept for when you turn them back on.</p>
      )}
    </Panel>
  );
}

export function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {Object.entries(ICON_NAMES).map(([k, n]) => (
        <option key={k} value={k}>
          {n}
        </option>
      ))}
    </select>
  );
}

export function TopicPanel<T extends TopicFields>({ data, set, metaHint }: { data: T; set: Setter<T>; metaHint: string }) {
  return (
    <Panel title="Topic" note="Pick a suggested category to set its icon, or type your own.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <input
            value={data.category}
            onChange={(e) => {
              set("category", e.target.value);
              const hit = CATEGORIES.find((c) => c[0] === e.target.value.trim().toUpperCase());
              if (hit) set("categoryIcon", hit[1]);
            }}
            list="bv-cats"
            className={inputCls}
          />
          <datalist id="bv-cats">
            {CATEGORIES.map((c) => (
              <option key={c[0]} value={c[0]} />
            ))}
          </datalist>
        </Field>
        <Field label="Badge icon">
          <IconSelect value={data.categoryIcon} onChange={(v) => set("categoryIcon", v)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Date or series (optional)">
            <input value={data.meta} onChange={(e) => set("meta", e.target.value)} placeholder={metaHint} className={inputCls} />
          </Field>
        </div>
      </div>
    </Panel>
  );
}

const TEXT_LABELS: [string, string, string, string] = ["English heading", "Malayalam heading", "English text", "Malayalam text"];

export function TextPanel<T extends TextFields>({ data, set, fit, labels = TEXT_LABELS, children }: { data: T; set: Setter<T>; fit: FitResult | null; labels?: [string, string, string, string]; children?: ReactNode }) {
  const m = fitMessage(fit);
  const area = (k: "heading" | "mlHeading" | "body" | "mlBody", label: string, rows: number, ml = false) => (
    <Field label={label}>
      <textarea value={data[k]} onChange={(e) => set(k, e.target.value as T[typeof k])} rows={rows} lang={ml ? "ml" : undefined} className={cn(inputCls, "resize-y leading-relaxed")} />
    </Field>
  );
  return (
    <Panel title="Text" note="English and Malayalam. Press Enter for a line break; long text shrinks to fit.">
      <div className="space-y-4">
        {area("heading", labels[0], 2)}
        {area("mlHeading", labels[1], 2, true)}
        {area("body", labels[2], 4)}
        {area("mlBody", labels[3], 4, true)}
        {children}
      </div>
      {m && <p className={cn("mt-3 rounded-lg px-3 py-2 text-sm", m.warn ? "bg-amber-50 text-amber-900" : "bg-secondary text-muted-foreground")}>{m.text}</p>}
    </Panel>
  );
}

export function PhotoPanel<T extends PhotoFields>({ data, set, removeLabel, onMsg, children }: { data: T; set: Setter<T>; removeLabel: string; onMsg: (s: string) => void; children?: ReactNode }) {
  const range = (k: "photoZoom" | "photoX" | "photoY", label: string, min: number, max: number) => (
    <Field label={label}>
      <input type="range" min={min} max={max} value={data[k]} onChange={(e) => set(k, Number(e.target.value) as T[typeof k])} className="w-full accent-[#0A3A20]" disabled={!data.photo} />
    </Field>
  );
  return (
    <Panel title="Photo">
      <div className="flex flex-wrap gap-2">
        <ImageButton
          label="Choose photo"
          onImage={(src, name) => {
            set("photo", src as T["photo"]);
            set("photoZoom", 100 as T["photoZoom"]);
            set("photoX", 50 as T["photoX"]);
            set("photoY", 50 as T["photoY"]);
            onMsg(`Photo added: ${name}`);
          }}
        />
        <button type="button" onClick={() => set("photo", null as T["photo"])} className={btn} disabled={!data.photo}>
          {removeLabel}
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {range("photoZoom", "Zoom", 100, 250)}
        <div className="grid gap-4 sm:grid-cols-2">
          {range("photoX", "Left ↔ right", 0, 100)}
          {range("photoY", "Top ↕ bottom", 0, 100)}
        </div>
        {children}
      </div>
    </Panel>
  );
}

export function FeaturesPanel<T extends { features: BvFeature[] }>({ data, set }: { data: T; set: Setter<T> }) {
  const setF = (i: number, p: Partial<BvFeature>) =>
    set(
      "features",
      data.features.map((f, j) => (j === i ? { ...f, ...p } : f)),
    );
  return (
    <Panel title="Feature row" note="Four icons with an English and a Malayalam line.">
      <div className="grid gap-3 lg:grid-cols-2">
        {data.features.map((f, i) => (
          <div key={i} className="rounded-xl border border-border p-3">
            <p className="mb-2 text-sm font-semibold">Feature {i + 1}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Icon">
                <IconSelect value={f.icon} onChange={(v) => setF(i, { icon: v })} />
              </Field>
              <Field label="English">
                <input value={f.title} onChange={(e) => setF(i, { title: e.target.value })} className={inputCls} />
              </Field>
              <div className="col-span-2">
                <Field label="Malayalam">
                  <input value={f.ml} onChange={(e) => setF(i, { ml: e.target.value })} lang="ml" className={inputCls} />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function FooterFields<T extends BvCommon>({ data, set, handleHint }: { data: T; set: Setter<T>; handleHint?: string }) {
  const input = (k: "growEn" | "growMl" | "handle" | "follow", label: string, ml = false, placeholder?: string) => (
    <Field label={label}>
      <input value={data[k]} onChange={(e) => set(k, e.target.value as T[typeof k])} lang={ml ? "ml" : undefined} placeholder={placeholder} className={inputCls} />
    </Field>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {input("growEn", "Closing line (English)")}
      {input("growMl", "Closing line (Malayalam)", true)}
      {input("handle", handleHint ? "Instagram handle (optional)" : "Instagram handle", false, handleHint)}
      {input("follow", "Follow text")}
    </div>
  );
}

/** Save / open the post as .json (same format as the HTML templates' Save post / Open post). */
export function JsonButtons({
  data,
  fileBase,
  onOpen,
  onMsg,
  check = (raw) => "heading" in raw,
}: {
  data: object;
  fileBase: string;
  onOpen: (raw: Record<string, unknown>) => void;
  onMsg: (s: string) => void;
  check?: (raw: Record<string, unknown>) => boolean;
}) {
  return (
    <>
      <label className={cn(btn, "cursor-pointer")}>
        <Upload className="h-4 w-4" /> Open post (.json)
        <input
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              const raw = JSON.parse(await f.text());
              if (!raw || typeof raw !== "object" || !check(raw)) throw new Error("this doesn't look like a saved post");
              onOpen(raw);
              onMsg(`Opened ${f.name}.`);
            } catch (err) {
              onMsg(`Couldn't open ${f.name}: ${err instanceof Error ? err.message : "invalid JSON"}`);
            }
          }}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
          a.download = `${fileBase}.json`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
          onMsg("Post saved.");
        }}
        className={btn}
      >
        <FileDown className="h-4 w-4" /> Save post (.json)
      </button>
    </>
  );
}

/** Sticky live preview with the PNG and video downloads. `render` receives the ref to put on the artwork. */
export function PreviewCard<T extends FileFields>({ data, msg, onMsg, render }: { data: T; msg: string; onMsg: (s: string) => void; render: (ref: RefObject<HTMLDivElement | null>) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const size = BV_FORMATS[data.format];
  async function download() {
    if (!ref.current) return;
    setBusy(true);
    onMsg("Creating PNG…");
    try {
      await downloadBvPng(ref.current, size.w, size.h, `${bvFileBase(data.category, data.format)}.png`);
      onMsg(`Saved ${size.w} × ${size.h} PNG.`);
    } catch (e) {
      onMsg(`Couldn't create the PNG: ${e instanceof Error ? e.message : "export failed"}. Chrome or Edge work best.`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="xl:sticky xl:top-6 xl:self-start">
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display font-semibold">Live preview</p>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {size.w} × {size.h}
          </span>
        </div>
        <div className={cn("mx-auto", data.format === "story" && "max-w-[400px]")}>
          <div data-plan-preview>
            <Scaled w={size.w} h={size.h} className="rounded-lg shadow-lg">
              {render(ref)}
            </Scaled>
          </div>
        </div>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A3A20] px-4 py-3 font-display font-bold text-white shadow hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          Download PNG
        </button>
        <VideoDownload
          getPng={async () => {
            if (!ref.current) throw new Error("preview not ready");
            return bvPngBlob(ref.current, size.w, size.h);
          }}
          fileBase={bvFileBase(data.category, data.format)}
          w={size.w}
          h={size.h}
          onMsg={onMsg}
        />
        {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
        <p className="mt-2 text-xs text-muted-foreground">Exports exactly {size.w} × {size.h} px. Your post is remembered in this browser.</p>
      </div>
    </div>
  );
}

/**
 * One 2-D control for a position: drag the dot (or click) anywhere in the pad; arrow keys nudge
 * (Shift = bigger steps). `x` / `y` are 0–100; `image` shows the photo behind the pad.
 */
export function PositionPad({
  x,
  y,
  onChange,
  image,
  aspect = 1,
  label,
  onCenter,
}: {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  image?: string | null;
  /** width / height of the pad */
  aspect?: number;
  label: string;
  onCenter?: () => void;
}) {
  const pad = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)));
  const at = (e: { clientX: number; clientY: number }) => {
    const r = pad.current!.getBoundingClientRect();
    onChange(clamp(((e.clientX - r.left) / r.width) * 100), clamp(((e.clientY - r.top) / r.height) * 100));
  };
  return (
    <div className="flex items-start gap-3">
      <div
        ref={pad}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuetext={`${x}% across, ${y}% down`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          at(e);
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && at(e)}
        onKeyDown={(e) => {
          const s = e.shiftKey ? 10 : 2;
          const d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
          if (!d) return;
          e.preventDefault();
          onChange(clamp(x + d[0]), clamp(y + d[1]));
        }}
        className="relative shrink-0 cursor-crosshair touch-none overflow-hidden rounded-lg border border-border bg-secondary bg-cover bg-center outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ aspectRatio: String(aspect), width: aspect >= 1 ? 170 : Math.round(200 * aspect), backgroundImage: image ? `url("${image}")` : undefined }}
      >
        <span className="pointer-events-none absolute inset-0 bg-white/30" />
        <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-black/20" />
        <span className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-black/20" />
        <span className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#0A3A20] shadow" style={{ left: `${x}%`, top: `${y}%` }} />
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>{label}: drag the dot, or use the arrow keys.</p>
        <p className="font-mono">
          {x}% · {y}%
        </p>
        {onCenter && (
          <button type="button" onClick={onCenter} className={cn(btn, "px-2 py-1 text-xs")}>
            Center
          </button>
        )}
      </div>
    </div>
  );
}

/** Logo picker: square tiles on the brand green. */
export function LogoPicker<V extends string | number>({ options, value, onChange }: { options: { v: V; src: string; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          title={o.label}
          aria-label={o.label}
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={cn("aspect-square rounded-xl border-2 bg-[#0A3A20] p-1", value === o.v ? "border-[#D8AA35]" : "border-transparent hover:border-[#D8AA35]/50")}
        >
          <img src={o.src} alt="" className="h-full w-full object-contain" />
        </button>
      ))}
    </div>
  );
}
