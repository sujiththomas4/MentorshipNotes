import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Download, FileDown, ImagePlus, Loader2, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { usePlannedDraft } from "@/social/saved-posts";
import { downloadSvgAsPng, svgToPngBlob } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import { IG_LOGOS, IG_W, type IgLogoVariant } from "@/social/instagram/kit";
import { igH } from "@/social/instagram/layout";
import { LayoutPanel } from "@/social/instagram/layout-ui";
import { cn } from "@/lib/utils";
import { PSYCHOLOGY_ICONS, PsychologyArtwork } from "./artwork";
import { DEFAULT_PHOTO, FACT_COLORS, MAX_FACTS, MIN_FACTS, PSYCHOLOGY_THEMES, defaultData, mergeData, type Fact, type FactColor, type PsychologyData } from "./data";

const STORE_KEY = "social:Instagram_TradingPsychology";

export function PsychologyEditor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<PsychologyData>(STORE_KEY, defaultData, mergeData);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const H = igH(data.layout);
  const fileBase = `trading-psychology_${(data.title1 + "-" + data.title2).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "post"}`;

  const set = <K extends keyof PsychologyData>(k: K, v: PsychologyData[K]) => setData((d) => ({ ...d, [k]: v }));
  const setFact = (i: number, p: Partial<Fact>) => setData((d) => ({ ...d, facts: d.facts.map((f, j) => (j === i ? { ...f, ...p } : f)) }));
  const moveFact = (i: number, by: number) =>
    setData((d) => {
      const facts = [...d.facts];
      [facts[i], facts[i + by]] = [facts[i + by], facts[i]];
      return { ...d, facts };
    });

  async function download() {
    if (!svgRef.current) return;
    setBusy(true);
    setMsg("");
    try {
      await downloadSvgAsPng(svgRef.current, IG_W, H, `${fileBase}.png`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLoadJson(file?: File) {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!raw || typeof raw !== "object" || !Array.isArray(raw.facts)) throw new Error('the file needs a "facts" list');
      setData(mergeData(raw));
      setMsg(`Loaded ${file.name}.`);
    } catch (e) {
      setMsg(`Couldn't load ${file.name}: ${e instanceof Error ? e.message : "invalid JSON"}`);
    }
  }

  function saveJson() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ template: "trading-psychology", ...data }, null, 2)], { type: "application/json" }));
    a.download = `${fileBase}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function onPhoto(file?: File) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setData((d) => ({ ...d, photo: String(r.result), photoZoom: 100, photoX: 0, photoY: 0 }));
    r.readAsDataURL(file);
  }

  const text = (k: "kicker" | "title1" | "title2" | "sloganLeft" | "sloganRight" | "hashtag" | "tagline", label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={data[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} />
    </Field>
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <label className={cn(btn, "cursor-pointer")}>
            <Upload className="h-4 w-4" /> Load data (.json)
            <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => (onLoadJson(e.target.files?.[0]), (e.target.value = ""))} />
          </label>
          <button type="button" onClick={saveJson} className={btn}>
            <FileDown className="h-4 w-4" /> Download data (.json)
          </button>
          <button type="button" onClick={() => confirm("Replace everything with the sample post?") && setData(defaultData())} className={cn(btn, "text-muted-foreground")}>
            <RotateCcw className="h-4 w-4" /> Reset to sample
          </button>
        </div>

        <LayoutPanel value={data.layout} onChange={(l) => set("layout", l)} themes={PSYCHOLOGY_THEMES} header="Show header (logo, tagline)" footer="Show footer (plan · execute · manage risk, hashtag)" />

        <Panel title="Title" note="Brush label, the two big words and the subtitle. Put *stars* around words to make them gold.">
          <div className="grid gap-4 sm:grid-cols-3">
            {text("kicker", "Brush label")}
            {text("title1", "Big word (white)")}
            {text("title2", "Big word (gold)")}
          </div>
          <div className="mt-4">
            <Field label="Subtitle" hint="Enter = new line">
              <textarea value={data.subtitle} onChange={(e) => set("subtitle", e.target.value)} rows={2} className={cn(inputCls, "resize-y")} />
            </Field>
          </div>
        </Panel>

        <Panel title="Facts" note={`${MIN_FACTS}–${MAX_FACTS} cards; they share the height of the right column. Press Enter for line breaks, or leave the text on one line to wrap it.`}>
          <div className="space-y-3">
            {data.facts.map((f, i) => (
              <div key={i} className="rounded-xl border border-border p-3" style={{ borderLeft: `4px solid ${FACT_COLORS[f.color]}` }}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Card {i + 1}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveFact(i, -1)} disabled={i === 0} className={cn(btn, "px-2 py-1")} aria-label="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveFact(i, 1)} disabled={i === data.facts.length - 1} className={cn(btn, "px-2 py-1")} aria-label="Move down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => set("facts", data.facts.filter((_, j) => j !== i))}
                      disabled={data.facts.length <= MIN_FACTS}
                      className={cn(btn, "px-2 py-1 text-muted-foreground")}
                      aria-label="Remove card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Icon">
                    <select value={f.icon} onChange={(e) => setFact(i, { icon: e.target.value })} className={inputCls}>
                      {PSYCHOLOGY_ICONS.map(([k, n]) => (
                        <option key={k} value={k}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Colour</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(Object.keys(FACT_COLORS) as FactColor[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          title={c}
                          aria-label={c}
                          aria-pressed={f.color === c}
                          onClick={() => setFact(i, { color: c })}
                          className={cn("h-7 w-7 rounded-full border-2", f.color === c ? "border-foreground" : "border-transparent")}
                          style={{ background: FACT_COLORS[c] }}
                        />
                      ))}
                    </div>
                  </div>
                  <Field label="Heading" hint="Enter = new line">
                    <textarea value={f.title} onChange={(e) => setFact(i, { title: e.target.value })} rows={2} className={cn(inputCls, "resize-y uppercase")} />
                  </Field>
                  <Field label="Text">
                    <textarea value={f.body} onChange={(e) => setFact(i, { body: e.target.value })} rows={3} className={cn(inputCls, "resize-y")} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => set("facts", [...data.facts, { icon: "bulb", color: (Object.keys(FACT_COLORS) as FactColor[])[data.facts.length % 8], title: "NEW FACT", body: "" }])}
            disabled={data.facts.length >= MAX_FACTS}
            className={cn(btn, "mt-3")}
          >
            <Plus className="h-4 w-4" /> Add card
          </button>
        </Panel>

        <Panel title="Picture" note="Left side, faded into the page. A dark, moody photo works best.">
          <div className="flex flex-wrap gap-2">
            <label className={cn(btn, "cursor-pointer")}>
              <ImagePlus className="h-4 w-4" /> Upload picture
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => (onPhoto(e.target.files?.[0]), (e.target.value = ""))} />
            </label>
            <button type="button" onClick={() => setData((d) => ({ ...d, photo: DEFAULT_PHOTO, photoZoom: 100, photoX: 0, photoY: 0 }))} className={btn}>
              <RotateCcw className="h-4 w-4" /> Design picture
            </button>
            <button type="button" onClick={() => set("photo", null)} disabled={!data.photo} className={cn(btn, "text-muted-foreground")}>
              <Trash2 className="h-4 w-4" /> No picture
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label={`Zoom (${data.photoZoom}%)`}>
              <input type="range" min={50} max={200} value={data.photoZoom} onChange={(e) => set("photoZoom", Number(e.target.value))} className="w-full accent-[#f5b800]" disabled={!data.photo} />
            </Field>
            <Field label="Left ↔ right">
              <input type="range" min={-400} max={400} value={data.photoX} onChange={(e) => set("photoX", Number(e.target.value))} className="w-full accent-[#f5b800]" disabled={!data.photo} />
            </Field>
            <Field label="Up ↕ down">
              <input type="range" min={-400} max={400} value={data.photoY} onChange={(e) => set("photoY", Number(e.target.value))} className="w-full accent-[#f5b800]" disabled={!data.photo} />
            </Field>
          </div>
        </Panel>

        <Panel title="Bottom line & footer" note="“Better mindset = Better trades”; leave one side empty to show a single phrase.">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("sloganLeft", "Left (white)")}
            {text("sloganRight", "Right (gold)")}
            {[0, 1, 2].map((i) => (
              <Field key={i} label={`Footer item ${i + 1}`}>
                <input
                  value={data.footer[i]}
                  onChange={(e) => set("footer", data.footer.map((s, j) => (j === i ? e.target.value : s)) as PsychologyData["footer"])}
                  className={inputCls}
                />
              </Field>
            ))}
            {text("hashtag", "Hashtag", "leave empty to hide")}
            {text("tagline", "Top-right tagline", "“|” separates the words")}
          </div>
        </Panel>

        <Panel title="Logo" note="The locked logo from Branding, placed as its PNG.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo">
              <select value={data.logo} onChange={(e) => set("logo", e.target.value as IgLogoVariant)} className={inputCls}>
                {(Object.keys(IG_LOGOS) as IgLogoVariant[]).map((k) => (
                  <option key={k} value={k}>
                    {IG_LOGOS[k].label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="inline-flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={data.logoFilled} onChange={(e) => set("logoFilled", e.target.checked)} className="h-4 w-4 accent-[#f5b800]" />
              Filled shield
            </label>
          </div>
        </Panel>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="card-elevated rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display font-semibold">Live preview</p>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">1080 × {H}</span>
          </div>
          <div data-plan-preview className={cn(data.layout.format === "story" && "mx-auto max-w-[400px]")}>
            <PsychologyArtwork ref={svgRef} data={data} className="block h-auto w-full rounded-lg shadow-lg" />
          </div>
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5b800] px-4 py-3 font-display font-bold text-[#15110a] shadow hover:brightness-95 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            Download PNG
          </button>
          <VideoDownload
            getPng={async () => {
              if (!svgRef.current) throw new Error("preview not ready");
              return svgToPngBlob(svgRef.current, IG_W, H);
            }}
            fileBase={fileBase}
            w={IG_W}
            h={H}
            onMsg={setMsg}
          />
          {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
          <p className="mt-2 text-xs text-muted-foreground">Exports exactly 1080 × {H} px. Your inputs are remembered in this browser.</p>
        </div>
      </div>
    </div>
  );
}

const btn = "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50";
const inputCls = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="card-elevated rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-lg font-semibold">{title}</p>
      {note && <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
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
