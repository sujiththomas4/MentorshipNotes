import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { cn } from "@/lib/utils";
import { FeaturesPanel, Field, FooterFields, FormatPanel, JsonButtons, LogoPicker, Panel, PhotoPanel, PreviewCard, TextPanel, TopicPanel, btn, inputCls, useStoredPost } from "../editor-kit";
import { bvFileBase, type FitResult } from "../shared";
import { FarmNotesArtwork } from "./artwork";
import { mergeData, sampleData, type FarmNotesData } from "./data";

const STORE_KEY = "social:Instagram_BV_FarmNotes";

export function FarmNotesEditor() {
  const { data, setData, set } = useStoredPost<FarmNotesData>(STORE_KEY, sampleData, mergeData);
  const [fit, setFit] = useState<FitResult | null>(null);
  const [msg, setMsg] = useState("");
  const text = (k: "brandName" | "tagline" | "slogan1" | "slogan2" | "sloganSmall", label: string) => (
    <Field label={label}>
      <input value={data[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} />
    </Field>
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <JsonButtons data={data} fileBase={bvFileBase(data.category, data.format)} onOpen={(raw) => setData(mergeData(raw))} onMsg={setMsg} />
          <button
            type="button"
            onClick={() => confirm("Replace everything with the sample post?") && (setData(sampleData()), setMsg("Reset to the sample post."))}
            className={cn(btn, "text-muted-foreground")}
          >
            <RotateCcw className="h-4 w-4" /> Reset to sample post
          </button>
        </div>

        <FormatPanel data={data} set={set} />
        <TopicPanel data={data} set={set} metaHint="e.g. 25 Sep 2026 or Tip #12" />
        <TextPanel data={data} set={set} fit={fit} />
        <PhotoPanel data={data} set={set} removeLabel="Use illustration" onMsg={setMsg} />
        <FeaturesPanel data={data} set={set} />

        <Panel title="Brand" note="Badge logo from Branding → Bethlehem Valley.">
          <LogoPicker
            options={BV_VARIANTS.map((v) => ({ v: v.n, src: v.web, label: `Logo variant ${v.n}` }))}
            value={data.logo}
            onChange={(v) => set("logo", v)}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("brandName", "Brand name")}
            {text("tagline", "Tagline")}
            {text("slogan1", "Slogan line 1")}
            {text("slogan2", "Slogan line 2")}
            {text("sloganSmall", "Slogan small text")}
          </div>
        </Panel>

        <Panel title="Footer" note="The closing line shows on the story format only.">
          <FooterFields data={data} set={set} />
        </Panel>
      </div>

      <PreviewCard data={data} msg={msg} onMsg={setMsg} render={(ref) => <FarmNotesArtwork ref={ref} data={data} onFit={setFit} />} />
    </div>
  );
}
