import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Check, Field, IconSelect, Panel, Seg, btn, inputCls, type Setter } from "../editor-kit";
import { ImagePicker } from "../image-library";
import { MAX_TOON_ITEMS, MAX_TOON_ROW, type ToonCoverPage, type ToonFrame, type ToonIdeaPage, type ToonItem, type ToonMini } from "./toon-data";

/* Editor panels for the caricature pages. */

type Props<T> = { p: T; set: Setter<T>; onMsg: (s: string) => void };

function Slider({ label, value, onChange, min = 60, max = 160 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        <span className="flex items-center gap-2">
          <span className="font-mono text-foreground">{value}%</span>
          {value !== 100 && (
            <button type="button" onClick={() => onChange(100)} className="rounded px-1 text-[11px] underline hover:text-foreground">
              reset
            </button>
          )}
        </span>
      </span>
      <input type="range" min={min} max={max} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#0A3A20]" />
    </label>
  );
}

function Area({ label, value, onChange, rows = 2, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} lang="ml" className={cn(inputCls, "resize-y")} />
    </Field>
  );
}

function MoveBtns({ i, n, move, remove }: { i: number; n: number; move: (i: number, d: -1 | 1) => void; remove: () => void }) {
  const b = "rounded-lg border border-border bg-card p-1.5 hover:bg-secondary disabled:opacity-40";
  return (
    <div className="flex gap-1">
      <button type="button" title="Move up" onClick={() => move(i, -1)} disabled={i === 0} className={b}>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" title="Move down" onClick={() => move(i, 1)} disabled={i === n - 1} className={b}>
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button type="button" title="Remove" onClick={remove} className={b}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function swap<T>(arr: T[], i: number, d: -1 | 1) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Caricature image + frame options shared by both page types. */
function CharacterPanel<T extends ToonFrame>({ p, set, onMsg }: Props<T>) {
  return (
    <Panel title="Caricature" note="Pick a caricature from the image library or upload one (a cut-out PNG with a transparent background looks best). Saved to the library, it is ready for every post.">
      <ImagePicker label="Caricature" value={p.character || null} onChange={(src) => set("character", (src ?? "") as T["character"])} onMsg={onMsg} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Caricature size" value={p.charSize} onChange={(v) => set("charSize", v as T["charSize"])} min={50} max={150} />
        <div className="self-end pb-2">
          <Check checked={p.charFade} onChange={(v) => set("charFade", v as T["charFade"])}>
            Soften the edges (for a photo that is not cut out)
          </Check>
        </div>
      </div>
      <p className="mb-2 mt-5 text-xs font-medium text-muted-foreground">Page frame</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Check checked={p.showLogo} onChange={(v) => set("showLogo", v as T["showLogo"])}>
          Round logo (top left)
        </Check>
        <Check checked={p.showArrow} onChange={(v) => set("showArrow", v as T["showArrow"])}>
          Next arrow
        </Check>
        <Check checked={p.leaves} onChange={(v) => set("leaves", v as T["leaves"])}>
          Leaf sprigs in the corners
        </Check>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Title size" value={p.titleSize} onChange={(v) => set("titleSize", v as T["titleSize"])} min={50} max={160} />
        <Slider label="Text size" value={p.textSize} onChange={(v) => set("textSize", v as T["textSize"])} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Page counter (3/10) and the handle line come from “All pages” below (page numbers, Instagram handle).</p>
    </Panel>
  );
}

function RowEditor({ row, onChange, max = MAX_TOON_ROW }: { row: ToonMini[]; onChange: (r: ToonMini[]) => void; max?: number }) {
  return (
    <div className="space-y-2">
      {row.map((r, i) => (
        <div key={i} className="grid grid-cols-[170px_minmax(0,1fr)_auto] items-center gap-2">
          <IconSelect value={r.icon} onChange={(v) => onChange(row.map((x, j) => (j === i ? { ...x, icon: v } : x)))} />
          <input value={r.text} onChange={(e) => onChange(row.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} placeholder="Caption (optional)" lang="ml" className={inputCls} />
          <button type="button" title="Remove" onClick={() => onChange(row.filter((_, j) => j !== i))} className="rounded-lg border border-border p-2 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {row.length < max && (
        <button type="button" onClick={() => onChange([...row, { icon: "leaf", text: "" }])} className={btn}>
          <Plus className="h-4 w-4" /> Add icon
        </button>
      )}
    </div>
  );
}

const COLOR_OPTS: [ToonIdeaPage["colors"], string][] = [
  ["alternate", "Dark / green lines"],
  ["firstDark", "First line dark"],
  ["allGreen", "All green"],
  ["allDark", "All dark"],
];

export function ToonCoverEditor({ p, set, onMsg }: Props<ToonCoverPage>) {
  return (
    <>
      <Panel title="Cover title" note="Big display title on the left; press Enter for each line.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Area label="Title" value={p.title} onChange={(v) => set("title", v)} rows={4} />
          <div className="space-y-4">
            <Field label="Line colours">
              <select value={p.colors} onChange={(e) => set("colors", e.target.value as ToonCoverPage["colors"])} className={inputCls}>
                {COLOR_OPTS.filter(([v]) => v !== "allDark").map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Area label="Subtitle" value={p.subtitle} onChange={(v) => set("subtitle", v)} rows={3} />
          </div>
        </div>
        <div className="mt-4">
          <Check checked={p.showBadge} onChange={(v) => set("showBadge", v)}>
            Number badge (e.g. “10 ideas”)
          </Check>
          {p.showBadge && (
            <div className="mt-3 grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
              <Field label="Number">
                <input value={p.badgeNumber} onChange={(e) => set("badgeNumber", e.target.value)} className={inputCls} />
              </Field>
              <Area label="Badge text" value={p.badgeText} onChange={(v) => set("badgeText", v)} />
            </div>
          )}
        </div>
      </Panel>
      <CharacterPanel p={p} set={set} onMsg={onMsg} />
      <Panel title="Background & icon row" note="A soft farm photo fades in behind the lower half; the icon row sums up what the series gives.">
        <ImagePicker label="Background photo" value={p.scene || null} onChange={(src) => set("scene", src ?? "")} onMsg={onMsg} />
        <p className="mb-2 mt-5 text-xs font-medium text-muted-foreground">Icon row (up to {MAX_TOON_ROW}, empty = hidden)</p>
        <RowEditor row={p.row} onChange={(r) => set("row", r)} />
      </Panel>
    </>
  );
}

export function ToonIdeaEditor({ p, set, onMsg }: Props<ToonIdeaPage>) {
  const setItem = (i: number, patch: Partial<ToonItem>) => set("items", p.items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
      <Panel title="Layout" note="Card: series title on top and the idea in a white card. Split: number and big heading, list on the left, caricature on the right.">
        <Seg<ToonIdeaPage["layout"]>
          value={p.layout}
          onChange={(v) => set("layout", v)}
          options={[
            ["card", "Card"],
            ["split", "Split"],
          ]}
        />
        {p.layout === "card" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Area label="Series title on top (optional)" value={p.topTitle} onChange={(v) => set("topTitle", v)} hint="Leave empty to start with the card." />
            <Field label="Line under it (optional)">
              <input value={p.topSub} onChange={(e) => set("topSub", e.target.value)} lang="ml" className={inputCls} />
            </Field>
          </div>
        )}
      </Panel>

      <Panel title="Idea">
        <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
          <Field label="Number">
            <input value={p.number} onChange={(e) => set("number", e.target.value)} placeholder="1" className={inputCls} />
          </Field>
          <Field label="Number badge">
            <Seg<ToonIdeaPage["numberStyle"]>
              value={p.numberStyle}
              onChange={(v) => set("numberStyle", v)}
              options={[
                ["square", "Square"],
                ["circle", "Circle"],
                ["flag", "Corner flag"],
              ]}
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Area label="Heading (Enter = new line)" value={p.heading} onChange={(v) => set("heading", v)} />
          <Field label="Heading colours">
            <select value={p.colors} onChange={(e) => set("colors", e.target.value as ToonIdeaPage["colors"])} className={inputCls}>
              {COLOR_OPTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          {p.layout === "split" && <Area label="Line under the heading (optional)" value={p.headingSub} onChange={(v) => set("headingSub", v)} />}
        </div>
      </Panel>

      <Panel title="Points" note={`Up to ${MAX_TOON_ITEMS}. Bold text plus an optional second line (e.g. Malayalam explanation).`}>
        <Seg<ToonIdeaPage["itemStyle"]>
          value={p.itemStyle}
          onChange={(v) => set("itemStyle", v)}
          options={[
            ["icon", "Icons + dotted lines"],
            ["pill", "Pills"],
            ["photo", "Pictures"],
          ]}
        />
        <div className="mt-4 space-y-3">
          {p.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Point {i + 1}</span>
                <MoveBtns i={i} n={p.items.length} move={(k, d) => set("items", swap(p.items, k, d))} remove={() => set("items", p.items.filter((_, j) => j !== i))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)]">
                <IconSelect value={it.icon} onChange={(v) => setItem(i, { icon: v })} />
                <input value={it.text} onChange={(e) => setItem(i, { text: e.target.value })} placeholder="Point" lang="ml" className={inputCls} />
              </div>
              <input value={it.sub} onChange={(e) => setItem(i, { sub: e.target.value })} placeholder="Second line (optional)" lang="ml" className={cn(inputCls, "mt-2")} />
              {p.itemStyle === "photo" && (
                <div className="mt-2">
                  <ImagePicker label={`Point ${i + 1} picture`} value={it.image || null} onChange={(src) => setItem(i, { image: src ?? "" })} onMsg={onMsg} />
                </div>
              )}
            </div>
          ))}
          {p.items.length < MAX_TOON_ITEMS && (
            <button type="button" onClick={() => set("items", [...p.items, { icon: "check", image: "", text: "", sub: "" }])} className={btn}>
              <Plus className="h-4 w-4" /> Add point
            </button>
          )}
          {p.itemStyle === "photo" && <p className="text-xs text-muted-foreground">Points without a picture show their icon.</p>}
        </div>
      </Panel>

      <Panel title="Tip box & icon row">
        <Check checked={p.showTip} onChange={(v) => set("showTip", v)}>
          Tip box with a light bulb
        </Check>
        {p.showTip && (
          <div className="mt-3">
            <Area label="Tip" value={p.tip} onChange={(v) => set("tip", v)} />
          </div>
        )}
        <div className="mt-4">
          <Check checked={p.showRow} onChange={(v) => set("showRow", v)}>
            Icon row at the bottom
          </Check>
        </div>
        {p.showRow && (
          <div className="mt-3">
            <RowEditor row={p.row} onChange={(r) => set("row", r)} />
          </div>
        )}
      </Panel>

      <CharacterPanel p={p} set={set} onMsg={onMsg} />
    </>
  );
}
