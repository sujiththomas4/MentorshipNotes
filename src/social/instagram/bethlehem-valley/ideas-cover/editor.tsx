import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { cn } from "@/lib/utils";
import { Check, Field, JsonButtons, LogoPicker, Panel, PreviewCard, btn, inputCls, useStoredPost } from "../editor-kit";
import { BrandTitlePanel } from "../brand-title";
import { ImagePicker } from "../image-library";
import { ICON_NAMES, bvFileBase } from "../shared";
import { IDEA_ICON_NAMES, IdeasCoverArtwork } from "./artwork";
import { DEFAULT_BACKGROUND, DEFAULT_FARMER, DESIGN_LOGO, mergeData, sampleData, type IdeaFeature, type IdeasCoverData } from "./data";

const STORE_KEY = "social:Instagram_BV_IdeasCover";

type TextKey = "slide" | "title1" | "title2" | "title3" | "sub1" | "sub2" | "badgeNumber" | "badge1" | "badge2" | "handle" | "category";

function IdeaIconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <optgroup label="From the design">
        {Object.entries(IDEA_ICON_NAMES).map(([k, n]) => (
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

export function IdeasCoverEditor() {
  const { data, setData, set } = useStoredPost<IdeasCoverData>(STORE_KEY, sampleData, mergeData);
  const [msg, setMsg] = useState("");

  const text = (k: TextKey, label: string, ml = true, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={data[k]} onChange={(e) => set(k, e.target.value)} lang={ml ? "ml" : undefined} className={inputCls} />
    </Field>
  );
  const setFeature = (i: number, p: Partial<IdeaFeature>) => set("features", data.features.map((f, j) => (j === i ? { ...f, ...p } : f)));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <JsonButtons data={data} fileBase={bvFileBase(data.category, "feed")} onOpen={(raw) => setData(mergeData(raw))} onMsg={setMsg} check={(raw) => "title1" in raw && "badgeNumber" in raw} />
          <button
            type="button"
            onClick={() => confirm("Replace everything with the sample post?") && (setData(sampleData()), setMsg("Reset to the sample post."))}
            className={cn(btn, "text-muted-foreground")}
          >
            <RotateCcw className="h-4 w-4" /> Reset to sample post
          </button>
        </div>

        <Panel title="Heading" note="Slide number, three-line title and the two lines under the divider. Long lines shrink to fit.">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("slide", "Slide number", false, "e.g. 01 · leave empty to hide")}
            {text("category", "File name topic", false, "Used for the PNG / JSON file name only")}
            {text("title1", "Title line 1 (with the leaf)")}
            {text("title2", "Title line 2")}
            {text("title3", "Title line 3")}
            <div />
            {text("sub1", "Subtitle line 1")}
            {text("sub2", "Subtitle line 2")}
          </div>
        </Panel>

        <Panel title="Number badge" note="The square green badge on the left.">
          <Check checked={data.showBadge} onChange={(v) => set("showBadge", v)}>
            Show the badge
          </Check>
          {data.showBadge && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {text("badgeNumber", "Number", false)}
              {text("badge1", "Line 1")}
              {text("badge2", "Line 2")}
            </div>
          )}
        </Panel>

        <Panel title="Features" note="Four icons on the white panel. Press Enter in a label for a second line.">
          <div className="grid gap-3 lg:grid-cols-2">
            {data.features.map((f, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3">
                <Field label={`Icon ${i + 1}`}>
                  <IdeaIconSelect value={f.icon} onChange={(v) => setFeature(i, { icon: v })} />
                </Field>
                <Field label="Label">
                  <textarea value={f.label} onChange={(e) => setFeature(i, { label: e.target.value })} rows={2} lang="ml" className={cn(inputCls, "resize-y")} />
                </Field>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Footer" note="Pager dots and the handle under the features.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Dots" hint="0 hides them">
              <input type="number" min={0} max={10} value={data.dots} onChange={(e) => set("dots", Math.max(0, Math.min(10, Number(e.target.value) || 0)))} className={inputCls} />
            </Field>
            <Field label="Filled dot">
              <input type="number" min={1} max={Math.max(1, data.dots)} value={data.activeDot} onChange={(e) => set("activeDot", Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className={inputCls} />
            </Field>
            {text("handle", "Handle", false, "leave empty to hide")}
          </div>
        </Panel>

        <Panel title="Pictures" note="The farm photo fills the page; the cut-out stands on the right. The sample photo already shows the farmer, so change both together.">
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
            <div className="flex flex-wrap gap-4">
              <Check checked={data.showLeaves} onChange={(v) => set("showLeaves", v)}>
                Leaves bottom left
              </Check>
              <button
                type="button"
                onClick={() => setData({ ...data, background: DEFAULT_BACKGROUND, farmer: DEFAULT_FARMER, farmerZoom: 100, farmerX: 0 })}
                className={cn(btn, "text-muted-foreground")}
              >
                <RotateCcw className="h-4 w-4" /> Design pictures
              </button>
            </div>
          </div>
        </Panel>

        <BrandTitlePanel data={data} set={set} />

        <Panel title="Logo" note="The round emblem from the design, or a logo variant from Branding → Bethlehem Valley.">
          <LogoPicker
            options={[{ v: 0, src: DESIGN_LOGO, label: "Round emblem" }, ...BV_VARIANTS.map((v) => ({ v: v.n, src: v.web, label: `Logo variant ${v.n}` }))]}
            value={data.logo}
            onChange={(v) => set("logo", v)}
          />
        </Panel>
      </div>

      <PreviewCard data={data} msg={msg} onMsg={setMsg} render={(ref) => <IdeasCoverArtwork ref={ref} data={data} />} />
    </div>
  );
}
