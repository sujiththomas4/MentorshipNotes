import { useState, type ReactNode } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PASTE_HINT, PasteImageButton, usePasteImage } from "@/social/paste-image";
import { Field, Panel, btn, inputCls } from "./editor-kit";
import type { ChartFields } from "./shared";

/* Chart upload + placement panel (Indicator Intro and Indicator Setup). */

type WithChart = ChartFields & { chartCaption: string; sampleTag: boolean };

export function ChartPanel<T extends WithChart>({ data, update, note, sampleLabel, children }: { data: T; update: (p: Partial<WithChart>) => void; note: string; sampleLabel: string; children?: ReactNode }) {
  function onChart(file?: File) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const src = String(r.result);
      const img = new Image();
      img.onload = () => update({ chart: src, chartSize: { w: img.naturalWidth, h: img.naturalHeight }, chartZoom: 100, chartX: 0, chartY: 0 });
      img.src = src;
    };
    r.readAsDataURL(file);
    setMsg("");
  }
  const [msg, setMsg] = useState("");
  usePasteImage(onChart);
  return (
    <Panel title="Chart" note={note}>
      <div className="flex flex-wrap gap-2">
        <label className={cn(btn, "cursor-pointer")}>
          <ImagePlus className="h-4 w-4" /> Upload chart
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => (onChart(e.target.files?.[0]), (e.target.value = ""))} />
        </label>
        <PasteImageButton onImage={onChart} onMsg={setMsg} className={btn} />
        <button type="button" onClick={() => update({ chart: null, chartSize: null })} disabled={!data.chart} className={cn(btn, "text-muted-foreground")}>
          <Trash2 className="h-4 w-4" /> {sampleLabel}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{msg || PASTE_HINT}</p>
      {children}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Caption (top-left of the chart)" hint="empty hides it">
          <input value={data.chartCaption} onChange={(e) => update({ chartCaption: e.target.value })} className={inputCls} />
        </Field>
        {data.chart ? (
          <Field label="Fit">
            <select value={data.chartFit} onChange={(e) => update({ chartFit: e.target.value as WithChart["chartFit"] })} className={inputCls}>
              <option value="fit">Whole chart (fit)</option>
              <option value="fill">Fill the box (crop)</option>
            </select>
          </Field>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" checked={data.sampleTag} onChange={(e) => update({ sampleTag: e.target.checked })} className="h-4 w-4 accent-[#0AA66A]" />
            Show the “upload your chart” note
          </label>
        )}
      </div>
      {data.chart && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label={`Zoom (${data.chartZoom}%)`}>
            <input type="range" min={25} max={400} value={data.chartZoom} onChange={(e) => update({ chartZoom: Number(e.target.value) })} className="w-full accent-[#0AA66A]" />
          </Field>
          <Field label="Left ↔ right">
            <input type="range" min={-600} max={600} value={data.chartX} onChange={(e) => update({ chartX: Number(e.target.value) })} className="w-full accent-[#0AA66A]" />
          </Field>
          <Field label="Up ↕ down">
            <input type="range" min={-600} max={600} value={data.chartY} onChange={(e) => update({ chartY: Number(e.target.value) })} className="w-full accent-[#0AA66A]" />
          </Field>
        </div>
      )}
    </Panel>
  );
}
