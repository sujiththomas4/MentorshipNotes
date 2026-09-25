import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_POINTS, MIN_POINTS, type Point } from "./data";
import { Field, IconSelect, Panel, btn, inputCls } from "./editor-kit";

/* The key-points and pro-tip panels: used by Indicator Details and by the Intro's details page. */

export function PointsPanel({ points, onChange }: { points: Point[]; onChange: (p: Point[]) => void }) {
  const setPoint = (i: number, p: Partial<Point>) => onChange(points.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, by: number) => {
    const next = [...points];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };
  return (
    <Panel title="Key points" note={`${MIN_POINTS}–${MAX_POINTS} numbered points; they share the height, and long text wraps.`}>
      <div className="space-y-3">
        {points.map((p, i) => (
          <div key={i} className="rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Point {i + 1}</p>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={cn(btn, "px-2 py-1")} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === points.length - 1} className={cn(btn, "px-2 py-1")} aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onChange(points.filter((_, j) => j !== i))} disabled={points.length <= MIN_POINTS} className={cn(btn, "px-2 py-1 text-muted-foreground")} aria-label="Remove point">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <Field label="Icon">
                <IconSelect value={p.icon} onChange={(v) => setPoint(i, { icon: v })} />
              </Field>
              <Field label="Heading">
                <input value={p.title} onChange={(e) => setPoint(i, { title: e.target.value })} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Text">
                  <textarea value={p.text} onChange={(e) => setPoint(i, { text: e.target.value })} rows={2} className={cn(inputCls, "resize-y")} />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...points, { icon: "check", title: "", text: "" }])} disabled={points.length >= MAX_POINTS} className={cn(btn, "mt-3")}>
        <Plus className="h-4 w-4" /> Add point
      </button>
    </Panel>
  );
}

export function TipPanel({ label, tip, onChange }: { label: string; tip: string; onChange: (p: { tipLabel?: string; tip?: string }) => void }) {
  return (
    <Panel title="Pro tip" note="The green box under the points; leave the text empty to hide it (the points get its room).">
      <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
        <Field label="Label">
          <input value={label} onChange={(e) => onChange({ tipLabel: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Text">
          <textarea value={tip} onChange={(e) => onChange({ tip: e.target.value })} rows={2} className={cn(inputCls, "resize-y")} />
        </Field>
      </div>
    </Panel>
  );
}
