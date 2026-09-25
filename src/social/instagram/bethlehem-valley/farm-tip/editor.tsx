import { useState } from "react";
import { FilePlus2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Check,
  FeaturesPanel,
  FooterFields,
  FormatPanel,
  ImageButton,
  JsonButtons,
  Panel,
  PhotoPanel,
  PreviewCard,
  TextPanel,
  TopicPanel,
  btn,
  useStoredPost,
} from "../editor-kit";
import { bvFileBase, type FitResult } from "../shared";
import { FarmTipArtwork } from "./artwork";
import { HeaderPanel } from "./header-panel";
import { SAMPLE_POST, blankData, keepLook, mergeData, type FarmTipData } from "./data";

const STORE_KEY = "social:Instagram_BV_FarmTip";

export function FarmTipEditor() {
  const { data, setData, set } = useStoredPost<FarmTipData>(STORE_KEY, blankData, mergeData);
  const [fit, setFit] = useState<FitResult | null>(null);
  const [msg, setMsg] = useState("");

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <JsonButtons data={data} fileBase={bvFileBase(data.category, data.format)} onOpen={(raw) => setData(mergeData(raw))} onMsg={setMsg} />
          <button
            type="button"
            onClick={() => (setData((d) => ({ ...blankData(), ...keepLook(d) })), setMsg("Blank template loaded. Your header and footer settings are kept."))}
            className={btn}
          >
            <FilePlus2 className="h-4 w-4" /> Blank template
          </button>
          <button
            type="button"
            onClick={() => (setData((d) => ({ ...blankData(), ...keepLook(d), ...SAMPLE_POST })), setMsg("Sample post loaded. Check the advice and Malayalam before posting."))}
            className={btn}
          >
            <Sparkles className="h-4 w-4" /> Sample post
          </button>
        </div>

        <FormatPanel data={data} set={set} />

        <HeaderPanel data={data} set={set} onMsg={setMsg} />

        <TopicPanel data={data} set={set} metaHint="e.g. 25 Sep or Tip #12" />
        <TextPanel data={data} set={set} fit={fit} />
        <PhotoPanel data={data} set={set} removeLabel="Remove photo" onMsg={setMsg}>
          <Check checked={data.decorLeaves} onChange={(v) => set("decorLeaves", v)}>
            Leaf decoration on the photo
          </Check>
        </PhotoPanel>
        <FeaturesPanel data={data} set={set} />

        <Panel title="Bottom" note="The landscape band and closing line show on the story format only.">
          <Check checked={data.showLandscape} onChange={(v) => set("showLandscape", v)}>
            Landscape with closing line
          </Check>
          {data.showLandscape && (
            <div className="mt-3 flex flex-wrap gap-2">
              <ImageButton label="Choose landscape" onImage={(src, name) => (set("landscape", src), setMsg(`Landscape: ${name}`))} />
              <button type="button" onClick={() => set("landscape", "default")} className={cn(btn, data.landscape === "default" && "border-[#D8AA35] bg-[#D8AA35]/10")}>
                Default landscape
              </button>
            </div>
          )}
          <div className="mt-4">
            <FooterFields data={data} set={set} handleHint="@bethlehemvalley" />
          </div>
        </Panel>
      </div>

      <PreviewCard data={data} msg={msg} onMsg={setMsg} render={(ref) => <FarmTipArtwork ref={ref} data={data} onFit={setFit} />} />
    </div>
  );
}
