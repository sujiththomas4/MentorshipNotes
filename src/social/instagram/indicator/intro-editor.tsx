import { useRef, useState } from "react";
import { FolderDown, Loader2 } from "lucide-react";
import { usePlannedDraft } from "@/social/saved-posts";
import { saveAllBlobs, svgToPngBlob } from "@/social/export";
import { IG_W } from "@/social/instagram/kit";
import { igH } from "@/social/instagram/layout";
import { cn } from "@/lib/utils";
import { IntroArtwork } from "./intro-artwork";
import { DetailsArtwork } from "./details-artwork";
import { introDetails, introSample, mergeIntro, type DetailsPage, type InfoCell, type IntroData } from "./data";
import { PointsPanel, TipPanel } from "./points-panels";
import { ChartPanel } from "./chart-panel";
import { CommonPanels, Field, FileButtons, IconSelect, LogoPanel, Panel, Preview, btn, inputCls, slug } from "./editor-kit";

const STORE_KEY = "social:Instagram_IndicatorIntro";

export function IndicatorIntroEditor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<IntroData>(STORE_KEY, introSample, mergeIntro);
  const [msg, setMsg] = useState("");
  const introRef = useRef<SVGSVGElement>(null);
  const detailsRef = useRef<SVGSVGElement>(null);
  const [tab, setTab] = useState<"intro" | "details">("intro");
  const [busy, setBusy] = useState(false);
  const page = data.withDetails ? tab : "intro";
  const name = slug(data.banner);
  const fileBase = page === "intro" ? `indicator-intro_${name}` : `indicator-details_${name}`;

  const set = <K extends keyof IntroData>(k: K, v: IntroData[K]) => setData((d) => ({ ...d, [k]: v }));
  const setDetails = (p: Partial<DetailsPage>) => setData((d) => ({ ...d, details: { ...d.details, ...p } }));
  const setInfo = (i: number, p: Partial<InfoCell>) => set("info", data.info.map((c, j) => (j === i ? { ...c, ...p } : c)) as IntroData["info"]);

  /** Both pages as 01_intro.png + 02_details.png, in a folder (Chrome / Edge) or as downloads. */
  async function saveBoth() {
    const H = igH(data.layout);
    setBusy(true);
    setMsg("Creating 2 PNGs…");
    try {
      const svg = (el: SVGSVGElement | null) => {
        if (!el) throw new Error("preview not ready");
        return svgToPngBlob(el, IG_W, H);
      };
      const folder = `indicator_${name}`;
      const how = await saveAllBlobs(
        [
          { filename: "01_intro.png", blob: () => svg(introRef.current) },
          { filename: "02_details.png", blob: () => svg(detailsRef.current) },
        ],
        folder,
      );
      setMsg(how === "cancelled" ? "Cancelled." : how === "folder" ? `Saved both pages into the folder "${folder}".` : "Downloaded both pages.");
    } catch (e) {
      setMsg(`Couldn't save the pages: ${e instanceof Error ? e.message : "export failed"}.`);
    } finally {
      setBusy(false);
    }
  }

  const detailsText = (k: "titleA" | "titleB" | "subtitle" | "banner", label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={data.details[k]} onChange={(e) => setDetails({ [k]: e.target.value })} className={inputCls} />
    </Field>
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <FileButtons data={data} fileBase={fileBase} template="indicator-intro" onLoad={(raw) => setData(mergeIntro(raw))} onReset={() => setData(introSample())} onMsg={setMsg} check={(raw) => "info" in raw} />

        <CommonPanels data={data} set={set} titleNote="The big title reads INDICATOR INTRO (second word in green); put the indicator's name (VWAP, CAMARILLA PIVOT…) on the brush banner, and its full name as the subtitle." />

        <Panel title="Quick facts" note="The three cells under the banner.">
          <div className="space-y-3">
            {data.info.map((c, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-3">
                <Field label={`Icon ${i + 1}`}>
                  <IconSelect value={c.icon} onChange={(v) => setInfo(i, { icon: v })} />
                </Field>
                <Field label="Label">
                  <input value={c.label} onChange={(e) => setInfo(i, { label: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Value">
                  <input value={c.value} onChange={(e) => setInfo(i, { value: e.target.value })} className={inputCls} />
                </Field>
              </div>
            ))}
          </div>
        </Panel>

        <ChartPanel
          data={data}
          update={(p) => setData((d) => ({ ...d, ...p }))}
          sampleLabel="Use sample chart"
          note="Upload a screenshot of the indicator on a chart (e.g. NIFTY with VWAP, a strike chart with VWAP, Camarilla levels). Without one, a sample chart with the indicator line is drawn."
        />

        <Panel title="Why it matters & golden rule" note="Up to 4 short points on the left; the rule box on the right (Enter = new line).">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Left heading">
              <input value={data.whyTitle} onChange={(e) => set("whyTitle", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Rule heading">
              <input value={data.keyLabel} onChange={(e) => set("keyLabel", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Points" hint="one per line">
              <textarea value={data.why.join("\n")} onChange={(e) => set("why", e.target.value.split("\n").slice(0, 4))} rows={4} className={cn(inputCls, "resize-y")} />
            </Field>
            <Field label="Rule">
              <textarea value={data.keyText} onChange={(e) => set("keyText", e.target.value)} rows={4} className={cn(inputCls, "resize-y")} />
            </Field>
          </div>
        </Panel>

        <Panel title="Details page" note="Add a second page with the indicator's key points, posted together as a 2-slide carousel. It uses this post's logo, series pill, script words, footer and format.">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={data.withDetails}
              onChange={(e) => {
                set("withDetails", e.target.checked);
                setTab(e.target.checked ? "details" : "intro");
              }}
              className="h-4 w-4 accent-[#0AA66A]"
            />
            Add a details page (page 2)
          </label>
          {data.withDetails && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {detailsText("titleA", "Title (navy)", "e.g. VWAP")}
              {detailsText("titleB", "Second word (green)", "e.g. NOTES")}
              {detailsText("subtitle", "Subtitle")}
              {detailsText("banner", "Brush banner", "e.g. KEY POINTS")}
            </div>
          )}
        </Panel>

        {data.withDetails && (
          <>
            <PointsPanel points={data.details.points} onChange={(points) => setDetails({ points })} />
            <TipPanel label={data.details.tipLabel} tip={data.details.tip} onChange={(p) => setDetails(p)} />
          </>
        )}

        <LogoPanel data={data} set={set} />
      </div>

      <Preview
        data={data}
        fileBase={fileBase}
        svgRef={page === "intro" ? introRef : detailsRef}
        msg={msg}
        onMsg={setMsg}
        tabs={
          data.withDetails && (
            <div className="mb-3 inline-flex gap-1 rounded-xl bg-secondary p-1" role="tablist" aria-label="Page">
              {(
                [
                  ["intro", "1 · Intro"],
                  ["details", "2 · Details"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={page === id}
                  onClick={() => setTab(id)}
                  className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", page === id ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  {label}
                </button>
              ))}
            </div>
          )
        }
        extra={
          data.withDetails && (
            <button type="button" onClick={saveBoth} disabled={busy} className={cn(btn, "mt-2 w-full justify-center py-2.5")}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderDown className="h-4 w-4" />} Download both pages
            </button>
          )
        }
      >
        {/* both pages stay rendered (the hidden one too) so "Download both pages" can export them */}
        <div className={cn(page !== "intro" && "hidden")}>
          <IntroArtwork ref={introRef} data={data} className="block h-auto w-full rounded-lg shadow-lg" />
        </div>
        {data.withDetails && (
          <div className={cn(page !== "details" && "hidden")}>
            <DetailsArtwork ref={detailsRef} data={introDetails(data)} className="block h-auto w-full rounded-lg shadow-lg" />
          </div>
        )}
      </Preview>
    </div>
  );
}
