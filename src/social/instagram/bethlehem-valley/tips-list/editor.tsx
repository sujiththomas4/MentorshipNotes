import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { cn } from "@/lib/utils";
import { Field, JsonButtons, LogoPicker, Panel, PreviewCard, btn, inputCls, useStoredPost } from "../editor-kit";
import { BrandTitlePanel } from "../brand-title";
import { ImagePicker } from "../image-library";
import { BV_ART, ICON_NAMES, bvFileBase, fitMessage, type FitResult } from "../shared";
import { TIP_ICON_NAMES, TipsListArtwork } from "./artwork";
import { MAX_TIPS, MIN_TIPS, mergeData, sampleData, type TipBenefit, type TipItem, type TipsListData } from "./data";

const STORE_KEY = "social:Instagram_BV_TipsList";

function TipIconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <optgroup label="From the design">
        {Object.entries(TIP_ICON_NAMES).map(([k, n]) => (
          <option key={k} value={k}>
            {n}
          </option>
        ))}
      </optgroup>
      <optgroup label="Icon pack">
        {Object.entries(ICON_NAMES).map(([k, n]) => (
          <option key={k} value={k}>
            {n}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

export function TipsListEditor() {
  const { data, setData, set } = useStoredPost<TipsListData>(STORE_KEY, sampleData, mergeData);
  const [fit, setFit] = useState<FitResult | null>(null);
  const [msg, setMsg] = useState("");
  const fitMsg = fitMessage(fit);

  const text = (k: "number" | "title1" | "title2" | "sub1" | "sub2" | "callout1" | "callout2" | "url" | "category", label: string, ml = true, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={data[k]} onChange={(e) => set(k, e.target.value)} lang={ml ? "ml" : undefined} className={inputCls} />
    </Field>
  );
  const setTip = (i: number, p: Partial<TipItem>) => set("tips", data.tips.map((t, j) => (j === i ? { ...t, ...p } : t)));
  const moveTip = (i: number, by: number) => {
    const tips = [...data.tips];
    [tips[i], tips[i + by]] = [tips[i + by], tips[i]];
    set("tips", tips);
  };
  const setBenefit = (i: number, p: Partial<TipBenefit>) => set("benefits", data.benefits.map((b, j) => (j === i ? { ...b, ...p } : b)));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <JsonButtons data={data} fileBase={bvFileBase(data.category, "feed")} onOpen={(raw) => setData(mergeData(raw))} onMsg={setMsg} check={(raw) => "tips" in raw} />
          <button
            type="button"
            onClick={() => confirm("Replace everything with the sample post?") && (setData(sampleData()), setMsg("Reset to the sample post."))}
            className={cn(btn, "text-muted-foreground")}
          >
            <RotateCcw className="h-4 w-4" /> Reset to sample post
          </button>
        </div>

        <Panel title="Heading" note="Number badge, two-line title and the line above the tips.">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("number", "Number badge", false, "e.g. 01")}
            {text("category", "File name topic", false, "Used for the PNG / JSON file name only")}
            {text("title1", "Title line 1")}
            {text("title2", "Title line 2 (large)")}
            {text("sub1", "Subtitle line 1")}
            {text("sub2", "Subtitle line 2")}
          </div>
        </Panel>

        <Panel title="Tips" note={`${MIN_TIPS}–${MAX_TIPS} cards. Press Enter in the text for a line break; long text shrinks to fit.`}>
          <div className="space-y-3">
            {data.tips.map((t, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Tip {i + 1}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveTip(i, -1)} disabled={i === 0} className={cn(btn, "px-2 py-1")} aria-label="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveTip(i, 1)} disabled={i === data.tips.length - 1} className={cn(btn, "px-2 py-1")} aria-label="Move down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => set("tips", data.tips.filter((_, j) => j !== i))}
                      disabled={data.tips.length <= MIN_TIPS}
                      className={cn(btn, "px-2 py-1 text-muted-foreground")}
                      aria-label="Remove tip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <Field label="Icon">
                    <TipIconSelect value={t.icon} onChange={(v) => setTip(i, { icon: v })} />
                  </Field>
                  <Field label="Title">
                    <input value={t.title} onChange={(e) => setTip(i, { title: e.target.value })} lang="ml" className={inputCls} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Text">
                      <textarea value={t.body} onChange={(e) => setTip(i, { body: e.target.value })} rows={2} lang="ml" className={cn(inputCls, "resize-y leading-relaxed")} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => set("tips", [...data.tips, { icon: "tip-sprout", title: "", body: "" }])}
            disabled={data.tips.length >= MAX_TIPS}
            className={cn(btn, "mt-3")}
          >
            <Plus className="h-4 w-4" /> Add tip
          </button>
          {fitMsg && <p className={cn("mt-3 rounded-lg px-3 py-2 text-sm", fitMsg.warn ? "bg-amber-50 text-amber-900" : "bg-secondary text-muted-foreground")}>{fitMsg.text}</p>}
        </Panel>

        <Panel title="Callout" note="The rounded line under the tips (second line in green).">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("callout1", "Line 1")}
            {text("callout2", "Line 2")}
          </div>
        </Panel>

        <Panel title="Pictures" note="The photo fades in from the left; the cut-out stands bottom right.">
          <div className="space-y-4">
            <Field label="Background photo">
              <ImagePicker value={data.background} onChange={(v) => set("background", v)} onMsg={setMsg} label="Background photo" />
            </Field>
            <Field label="Cut-out figure (transparent PNG / WebP)">
              <ImagePicker value={data.farmer} onChange={(v) => set("farmer", v)} onMsg={setMsg} label="Cut-out figure" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Figure size (${data.farmerZoom}%)`}>
                <input type="range" min={50} max={150} value={data.farmerZoom} onChange={(e) => set("farmerZoom", Number(e.target.value))} className="w-full accent-[#0A3A20]" disabled={!data.farmer} />
              </Field>
              <Field label="Figure left ↔ right">
                <input type="range" min={-300} max={300} value={data.farmerX} onChange={(e) => set("farmerX", Number(e.target.value))} className="w-full accent-[#0A3A20]" disabled={!data.farmer} />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Footer" note="Four benefits on the green band, and the website.">
          <div className="grid gap-3 lg:grid-cols-2">
            {data.benefits.map((b, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3">
                <Field label={`Icon ${i + 1}`}>
                  <TipIconSelect value={b.icon} onChange={(v) => setBenefit(i, { icon: v })} />
                </Field>
                <Field label="Label">
                  <input value={b.label} onChange={(e) => setBenefit(i, { label: e.target.value })} lang="ml" className={inputCls} />
                </Field>
              </div>
            ))}
          </div>
          <div className="mt-4">{text("url", "Website (leave empty to hide)", false)}</div>
        </Panel>

        <BrandTitlePanel data={data} set={set} />

        <Panel title="Logo" note="The round emblem from the design, or a logo variant from Branding → Bethlehem Valley.">
          <LogoPicker
            options={[{ v: 0, src: `${BV_ART}/tips/logo.webp`, label: "Round emblem" }, ...BV_VARIANTS.map((v) => ({ v: v.n, src: v.web, label: `Logo variant ${v.n}` }))]}
            value={data.logo}
            onChange={(v) => set("logo", v)}
          />
        </Panel>
      </div>

      <PreviewCard data={data} msg={msg} onMsg={setMsg} render={(ref) => <TipsListArtwork ref={ref} data={data} onFit={setFit} />} />
    </div>
  );
}
