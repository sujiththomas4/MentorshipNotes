import { useRef, useState } from "react";
import { usePlannedDraft } from "@/social/saved-posts";
import { DetailsArtwork } from "./details-artwork";
import { detailsSample, mergeDetails, type DetailsData } from "./data";
import { CommonPanels, FileButtons, LogoPanel, Preview, slug } from "./editor-kit";
import { PointsPanel, TipPanel } from "./points-panels";

const STORE_KEY = "social:Instagram_IndicatorDetails";

export function IndicatorDetailsEditor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<DetailsData>(STORE_KEY, detailsSample, mergeDetails);
  const [msg, setMsg] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const fileBase = `indicator-details_${slug(`${data.titleA} ${data.titleB}`)}`;

  const set = <K extends keyof DetailsData>(k: K, v: DetailsData[K]) => setData((d) => ({ ...d, [k]: v }));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <FileButtons data={data} fileBase={fileBase} template="indicator-details" onLoad={(raw) => setData(mergeDetails(raw))} onReset={() => setData(detailsSample())} onMsg={setMsg} check={(raw) => "points" in raw} />

        <CommonPanels data={data} set={set} titleNote="E.g. VWAP NOTES, CPR RULES, CAMARILLA KEY POINTS; the second word is drawn in green." />

        <PointsPanel points={data.points} onChange={(p) => set("points", p)} />

        <TipPanel label={data.tipLabel} tip={data.tip} onChange={(p) => setData((d) => ({ ...d, ...p }))} />

        <LogoPanel data={data} set={set} />
      </div>

      <Preview data={data} fileBase={fileBase} svgRef={svgRef} msg={msg} onMsg={setMsg}>
        <DetailsArtwork ref={svgRef} data={data} className="block h-auto w-full rounded-lg shadow-lg" />
      </Preview>
    </div>
  );
}
