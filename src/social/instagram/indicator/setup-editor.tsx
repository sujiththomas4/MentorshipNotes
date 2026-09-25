import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { usePlannedDraft } from "@/social/saved-posts";
import { cn } from "@/lib/utils";
import type { Point } from "./data";
import { SetupArtwork } from "./setup-artwork";
import { SETUP_PRESETS, SETUP_SAMPLES, mergeSetup, setupSample, type SetupData, type SetupSample } from "./setup-data";
import { ChartPanel } from "./chart-panel";
import { CommonPanels, Field, FileButtons, IconSelect, LogoPanel, Panel, Preview, btn, inputCls, slug } from "./editor-kit";

const STORE_KEY = "social:Instagram_IndicatorSetup";

export function IndicatorSetupEditor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<SetupData>(STORE_KEY, setupSample, mergeSetup);
  const [msg, setMsg] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const fileBase = `indicator-setup_${slug(`${data.titleA} ${data.titleB}`)}`;

  const set = <K extends keyof SetupData>(k: K, v: SetupData[K]) => setData((d) => ({ ...d, [k]: v }));
  const setStep = (i: number, p: Partial<Point>) => set("steps", data.steps.map((s, j) => (j === i ? { ...s, ...p } : s)) as SetupData["steps"]);

  /** Fill everything from a preset, keeping the look (logo, format, theme, footer). */
  function applyPreset(id: string) {
    const p = SETUP_PRESETS.find((x) => x.id === id);
    if (!p || !confirm(`Replace the texts and chart with “${p.label}”?`)) return;
    const next = p.make();
    setData((d) => ({ ...next, pill: d.pill, script: d.script, footer: d.footer, logo: d.logo, logoBg: d.logoBg, logoHeight: d.logoHeight, layout: d.layout }));
    setMsg(`Loaded “${p.label}”.`);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <FileButtons data={data} fileBase={fileBase} template="indicator-setup" onLoad={(raw) => setData(mergeSetup(raw))} onReset={() => setData(setupSample())} onMsg={setMsg} check={(raw) => "steps" in raw} />

        <Panel title="Start from a setup" note="Fills in the title, chart illustration, steps and rule. Your logo, format, theme and footer stay.">
          <div className="flex flex-wrap gap-2">
            {SETUP_PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => applyPreset(p.id)} className={cn(btn, data.sample === p.id && !data.chart && "border-[#0AA66A]")}>
                <Sparkles className="h-4 w-4 text-[#0AA66A]" /> {p.label}
              </button>
            ))}
          </div>
        </Panel>

        <CommonPanels data={data} set={set} titleNote="One strong idea: e.g. VWAP + ON PREMIUM, CAMARILLA + PIVOT, S3 / R3 + INSIDE CPR. The second word is drawn in green." />

        <ChartPanel
          data={data}
          update={(p) => setData((d) => ({ ...d, ...p }))}
          sampleLabel="Use the illustration"
          note="Upload your chart (e.g. the option premium with VWAP or Camarilla levels). Without one, the illustration below is drawn."
        >
          {!data.chart && (
            <div className="mt-4 max-w-sm">
              <Field label="Illustration">
                <select value={data.sample} onChange={(e) => set("sample", e.target.value as SetupSample)} className={inputCls}>
                  {SETUP_SAMPLES.map(([k, n]) => (
                    <option key={k} value={k}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </ChartPanel>

        <Panel title="Steps" note="Three cards under the chart.">
          <div className="mb-3 max-w-sm">
            <Field label="Heading above the cards" hint="empty hides it">
              <input value={data.stepsTitle} onChange={(e) => set("stepsTitle", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="space-y-3">
            {data.steps.map((s, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                <Field label={`Step ${i + 1} icon`}>
                  <IconSelect value={s.icon} onChange={(v) => setStep(i, { icon: v })} />
                </Field>
                <Field label="Heading">
                  <input value={s.title} onChange={(e) => setStep(i, { title: e.target.value })} className={inputCls} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Text">
                    <textarea value={s.text} onChange={(e) => setStep(i, { text: e.target.value })} rows={2} className={cn(inputCls, "resize-y")} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Rule strip" note="The green strip at the bottom (about two lines).">
          <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <Field label="Label">
              <input value={data.ruleLabel} onChange={(e) => set("ruleLabel", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Text">
              <textarea value={data.rule} onChange={(e) => set("rule", e.target.value)} rows={2} className={cn(inputCls, "resize-y")} />
            </Field>
          </div>
        </Panel>

        <LogoPanel data={data} set={set} />
      </div>

      <Preview data={data} fileBase={fileBase} svgRef={svgRef} msg={msg} onMsg={setMsg}>
        <SetupArtwork ref={svgRef} data={data} className="block h-auto w-full rounded-lg shadow-lg" />
      </Preview>
    </div>
  );
}
