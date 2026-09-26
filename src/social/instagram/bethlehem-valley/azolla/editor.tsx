import { useRef, useState, type ReactNode } from "react";
import { Download, Images, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveAllBlobs } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import { PasteImageButton } from "@/social/paste-image";
import { Check, Field, JsonButtons, Panel, PositionPad, Seg, btn, inputCls, useStoredPost } from "../editor-kit";
import { ImagePicker, shrinkImage } from "../image-library";
import { Scaled, bvFileBase, bvPngBlob, downloadBvPng } from "../shared";
import { AZ_ICON_NAMES, AzollaSlide } from "./artwork";
import { SLIDE_NAMES, mergeData, rupees, sampleData, savings, type AzPhoto, type AzollaData, type PhotoFit } from "./data";

const STORE_KEY = "social:Instagram_BV_Azolla";
const W = 1080;
const H = 1350;
type SlideKey = "s1" | "s2" | "s3" | "s4" | "s5" | "s6";
const KEYS: SlideKey[] = ["s1", "s2", "s3", "s4", "s5", "s6"];

/* ---------- small editors ---------- */

function Text({ label, value, onChange, hint, area }: { label: string; value: string; onChange: (v: string) => void; hint?: string; area?: boolean }) {
  return (
    <Field label={label} hint={hint}>
      {area ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={cn(inputCls, "resize-y leading-relaxed")} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </Field>
  );
}

function Num({ label, value, onChange, min = 0, max = 100000, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <Field label={label}>
      <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))} className={inputCls} />
    </Field>
  );
}

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {Object.entries(AZ_ICON_NAMES).map(([k, n]) => (
        <option key={k} value={k}>
          {n}
        </option>
      ))}
    </select>
  );
}

/** Photo slot: library / upload / paste, fit, zoom and the position pad. */
function PhotoEditor({ label, p, onChange, aspect, onMsg, fallback }: { label: string; p: AzPhoto; onChange: (p: AzPhoto) => void; aspect: number; onMsg: (s: string) => void; fallback: string }) {
  return (
    <div className="space-y-3 rounded-xl border border-border p-3">
      <Field label={label} hint={p.src ? undefined : `No photo: ${fallback}.`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <ImagePicker value={p.src} onChange={(src) => onChange({ ...p, src, zoom: 100, x: 50, y: 50 })} onMsg={onMsg} label={label} />
          </div>
          <PasteImageButton
            className={btn}
            onMsg={onMsg}
            onImage={async (file) => {
              onChange({ ...p, src: await shrinkImage(file, 1600), zoom: 100, x: 50, y: 50 });
              onMsg(`${label}: pasted image.`);
            }}
          />
        </div>
      </Field>
      {p.src && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1">
              <Seg<PhotoFit>
                value={p.fit}
                onChange={(fit) => onChange({ ...p, fit })}
                options={[
                  ["cover", "Full cover (crop)"],
                  ["contain", "Fit (whole photo)"],
                ]}
              />
            </div>
            <button type="button" onClick={() => onChange({ ...p, zoom: 100, x: 50, y: 50 })} className={btn}>
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
          <Field label={`Zoom (${p.zoom}%)`}>
            <input type="range" min={20} max={250} value={p.zoom} onChange={(e) => onChange({ ...p, zoom: Number(e.target.value) })} className="w-full accent-[#8BD136]" />
          </Field>
          <PositionPad label="Photo position" image={p.src} aspect={aspect} x={p.x} y={p.y} onChange={(x, y) => onChange({ ...p, x, y })} onCenter={() => onChange({ ...p, x: 50, y: 50 })} />
        </>
      )}
    </div>
  );
}

const HEAD_HINT = "Put *stars* around words to make them green.";

/* ---------- editor ---------- */

export function AzollaEditor() {
  const { data, setData, set } = useStoredPost<AzollaData>(STORE_KEY, sampleData, mergeData);
  const [sel, setSel] = useState(0);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<number, HTMLDivElement>());

  const order = data.enabled.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  const total = order.length;
  const place = (i: number) => order.indexOf(i) + 1;
  const folder = bvFileBase(data.category, "feed");
  const fileOf = (i: number) => `${String(place(i)).padStart(2, "0")}-${SLIDE_NAMES[i].toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  function upd<K extends SlideKey>(k: K, patch: Partial<AzollaData[K]>) {
    setData((d) => ({ ...d, [k]: { ...d[k], ...patch } }));
  }
  function updItem<K extends "s2" | "s3" | "s4">(k: K, list: "facts" | "stats" | "days", i: number, patch: object) {
    setData((d) => {
      const slide = d[k] as unknown as Record<string, object[]>;
      return { ...d, [k]: { ...slide, [list]: slide[list].map((x, j) => (j === i ? { ...x, ...patch } : x)) } };
    });
  }
  function toggle(i: number, on: boolean) {
    const enabled = data.enabled.map((v, j) => (j === i ? on : v));
    if (!enabled.some(Boolean)) return setMsg("Keep at least one slide.");
    set("enabled", enabled);
  }

  async function downloadOne() {
    if (!mainRef.current) return;
    setBusy(true);
    try {
      await downloadBvPng(mainRef.current, W, H, `${folder}_${fileOf(sel)}`);
      setMsg(`Saved slide ${place(sel) || sel + 1}.`);
    } catch (e) {
      setMsg(`Couldn't create the PNG: ${e instanceof Error ? e.message : "export failed"}.`);
    } finally {
      setBusy(false);
    }
  }
  async function downloadAll() {
    setBusy(true);
    setMsg(`Creating ${total} PNGs…`);
    try {
      const how = await saveAllBlobs(
        order.map((i) => ({
          filename: fileOf(i),
          blob: () => {
            const node = nodes.current.get(i);
            if (!node) throw new Error(`slide ${i + 1} is not ready`);
            return bvPngBlob(node, W, H);
          },
        })),
        folder,
      );
      setMsg(how === "cancelled" ? "Cancelled." : how === "folder" ? `Saved ${total} slides into the folder "${folder}".` : `Downloaded ${total} slides.`);
    } catch (e) {
      setMsg(`Couldn't save the slides: ${e instanceof Error ? e.message : "export failed"}.`);
    } finally {
      setBusy(false);
    }
  }

  const photo = (k: "s1" | "s2" | "s3" | "s6", label: string, aspect: number, fallback: string) => (
    <PhotoEditor label={label} p={data[k].photo} onChange={(p) => upd(k, { photo: p } as Partial<AzollaData[typeof k]>)} aspect={aspect} onMsg={setMsg} fallback={fallback} />
  );
  const footer = (k: SlideKey) => <Text label="Footer line (bottom right)" value={data[k].footer} onChange={(v) => upd(k, { footer: v } as Partial<AzollaData[typeof k]>)} />;
  const heads = (k: SlideKey) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Text label="Headline line 1" value={(data[k] as { title1: string }).title1} onChange={(v) => upd(k, { title1: v } as Partial<AzollaData[typeof k]>)} hint={HEAD_HINT} />
      <Text label="Headline line 2" value={(data[k] as { title2: string }).title2} onChange={(v) => upd(k, { title2: v } as Partial<AzollaData[typeof k]>)} />
    </div>
  );

  let panel: ReactNode = null;
  if (sel === 0) {
    const s = data.s1;
    panel = (
      <Panel title="Slide 1 · Hook" note="Full photo behind, the pain point in big type, and a teaser for Azolla.">
        <div className="space-y-4">
          <Text label="Yellow line above" value={s.eyebrow} onChange={(v) => upd("s1", { eyebrow: v })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Text label="Headline line 1" value={s.title1} onChange={(v) => upd("s1", { title1: v })} hint={HEAD_HINT} />
            <Text label="Big number (green)" value={s.stat} onChange={(v) => upd("s1", { stat: v })} />
            <Text label="Headline line 3" value={s.title3} onChange={(v) => upd("s1", { title3: v })} />
          </div>
          <Text label="Sentence under the headline" value={s.sub} onChange={(v) => upd("s1", { sub: v })} area />
          <Text label="Malayalam line (optional)" value={s.ml} onChange={(v) => upd("s1", { ml: v })} hint="e.g. തീറ്റച്ചെലവ് കുറയ്ക്കാൻ ഒരു വഴി!" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Green button" value={s.pill} onChange={(v) => upd("s1", { pill: v })} />
            <Text label="Text in the ₹ badge" value={s.badge} onChange={(v) => upd("s1", { badge: v })} />
          </div>
          {footer("s1")}
          {photo("s1", "Background photo (hens at a feeder)", W / H, "a drawn Azolla close-up")}
        </div>
      </Panel>
    );
  } else if (sel === 1) {
    const s = data.s2;
    panel = (
      <Panel title="Slide 2 · What is Azolla" note="Headline, a callout pointing at the photo band, three fact cards and a statement.">
        <div className="space-y-4">
          {heads("s2")}
          <Text label="Callout (right of the headline)" value={s.callout} onChange={(v) => upd("s2", { callout: v })} area />
          {photo("s2", "Photo band (Azolla close-up)", W / 480, "a drawn Azolla close-up")}
          <div className="grid gap-3 lg:grid-cols-3">
            {s.facts.map((f, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-border p-3">
                <p className="text-sm font-semibold">Card {i + 1}</p>
                <IconSelect value={f.icon} onChange={(v) => updItem("s2", "facts", i, { icon: v })} />
                <input value={f.title} onChange={(e) => updItem("s2", "facts", i, { title: e.target.value })} className={inputCls} aria-label="Card title" />
                <textarea value={f.text} onChange={(e) => updItem("s2", "facts", i, { text: e.target.value })} rows={3} className={cn(inputCls, "resize-y")} aria-label="Card text" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Statement line 1 (white)" value={s.statement1} onChange={(v) => upd("s2", { statement1: v })} />
            <Text label="Statement line 2 (yellow)" value={s.statement2} onChange={(v) => upd("s2", { statement2: v })} />
          </div>
          {footer("s2")}
        </div>
      </Panel>
    );
  } else if (sel === 2) {
    const s = data.s3;
    panel = (
      <Panel title="Slide 3 · Why it helps your birds" note="Photo with a caption, then four cards: a big value, a yellow label and a short line.">
        <div className="space-y-4">
          {heads("s3")}
          {photo("s3", "Photo (hens eating Azolla)", 952 / 380, "a drawn Azolla close-up")}
          <Text label="Caption on the photo" value={s.photoLabel} onChange={(v) => upd("s3", { photoLabel: v })} />
          <div className="grid gap-3 lg:grid-cols-2">
            {s.stats.map((c, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3">
                <p className="col-span-2 text-sm font-semibold">Card {i + 1}</p>
                <IconSelect value={c.icon} onChange={(v) => updItem("s3", "stats", i, { icon: v })} />
                <input value={c.value} onChange={(e) => updItem("s3", "stats", i, { value: e.target.value })} className={inputCls} aria-label="Value" placeholder="Value" />
                <input value={c.label} onChange={(e) => updItem("s3", "stats", i, { label: e.target.value })} className={cn(inputCls, "col-span-2")} aria-label="Label" placeholder="Label" />
                <input value={c.text} onChange={(e) => updItem("s3", "stats", i, { text: e.target.value })} className={cn(inputCls, "col-span-2")} aria-label="Short line" placeholder="Short line" />
              </div>
            ))}
          </div>
          <Text label="Yellow line at the bottom" value={s.rule} onChange={(v) => upd("s3", { rule: v })} />
          {footer("s3")}
        </div>
      </Panel>
    );
  } else if (sel === 3) {
    const s = data.s4;
    panel = (
      <Panel title="Slide 4 · How fast it grows" note="Three photos of the same pit. Without photos a drawn pit fills up from Day 1 to a full mat.">
        <div className="space-y-4">
          {heads("s4")}
          <Text label="Yellow line under the headline" value={s.sub} onChange={(v) => upd("s4", { sub: v })} />
          {s.days.map((day, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label={`Photo ${i + 1} · label above`} value={day.day} onChange={(v) => updItem("s4", "days", i, { day: v })} />
                <Text label="Label below" value={day.stage} onChange={(v) => updItem("s4", "days", i, { stage: v })} />
              </div>
              <PhotoEditor label={`Pit photo ${i + 1}`} p={day.photo} onChange={(p) => updItem("s4", "days", i, { photo: p })} aspect={300 / 420} onMsg={setMsg} fallback="a drawn pit" />
            </div>
          ))}
          <Text label="Note under the last photo" value={s.note} onChange={(v) => upd("s4", { note: v })} area />
          <Text label="Needs (separate with •)" value={s.needs} onChange={(v) => upd("s4", { needs: v })} />
          <Text label="Red warning" value={s.warning} onChange={(v) => upd("s4", { warning: v })} />
          {footer("s4")}
        </div>
      </Panel>
    );
  } else if (sel === 4) {
    const s = data.s5;
    const v = savings(s);
    panel = (
      <Panel title="Slide 5 · What you save" note="Put in your own numbers; the rows, bars and the big saving recalculate.">
        <div className="space-y-4">
          {heads("s5")}
          <Text label="Yellow line under the headline" value={s.sub} onChange={(x) => upd("s5", { sub: x })} hint="{birds} is replaced by the number of birds." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Num label="Birds" value={s.birds} onChange={(x) => upd("s5", { birds: x })} min={1} />
            <Text label="Birds are called" value={s.birdWord} onChange={(x) => upd("s5", { birdWord: x })} />
            <Num label="Feed per bird (g / day)" value={s.feedPerBird} onChange={(x) => upd("s5", { feedPerBird: x })} min={1} max={1000} />
            <Num label="Feed price (₹ / kg)" value={s.feedPrice} onChange={(x) => upd("s5", { feedPrice: x })} min={1} max={1000} step={0.5} />
            <Num label="Replaced, low (%)" value={s.replaceMin} onChange={(x) => upd("s5", { replaceMin: Math.min(x, s.replaceMax) })} max={100} />
            <Num label="Replaced, high (%)" value={s.replaceMax} onChange={(x) => upd("s5", { replaceMax: Math.max(x, s.replaceMin) })} max={100} />
          </div>
          <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
            {Math.round(v.feedKg).toLocaleString("en-IN")} kg feed a month · bill {rupees(v.bill)} · saving {rupees(v.lo)} – {rupees(v.hi)} a month · about {rupees(v.year)} a year at the high end.
          </p>
          <Text label="Footnote" value={s.footnote} onChange={(x) => upd("s5", { footnote: x })} area />
          {footer("s5")}
        </div>
      </Panel>
    );
  } else {
    const s = data.s6;
    panel = (
      <Panel title="Slide 6 · Comment AZOLLA" note="Photo on top, headline, a comment box with the keyword typed in, and what people get.">
        <div className="space-y-4">
          {photo("s6", "Top photo (hands holding Azolla)", W / 700, "a drawn Azolla close-up")}
          {heads("s6")}
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Word in the comment box" value={s.comment} onChange={(v) => upd("s6", { comment: v })} />
            <Text label="What people get (replace with your offer)" value={s.includes} onChange={(v) => upd("s6", { includes: v })} />
          </div>
          <Text label="Call to action" value={s.cta} onChange={(v) => upd("s6", { cta: v })} area hint={HEAD_HINT} />
          {footer("s6")}
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <JsonButtons data={data} fileBase={folder} onOpen={(raw) => setData(mergeData(raw))} onMsg={setMsg} check={(raw) => "s1" in raw} />
        <button
          type="button"
          onClick={() => confirm("Replace everything with the sample carousel?") && (setData(sampleData()), setMsg("Reset to the sample carousel."))}
          className={cn(btn, "text-muted-foreground")}
        >
          <RotateCcw className="h-4 w-4" /> Reset to sample
        </button>
      </div>

      {/* all slides: click to edit, untick to leave one out (these also export) */}
      <div className="card-elevated rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 font-display font-semibold">
          Slides <span className="text-sm font-normal text-muted-foreground">· {total} in the carousel</span>
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {KEYS.map((_, i) => (
            <div key={i} className={cn(!data.enabled[i] && "opacity-40")}>
              <button
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={sel === i}
                aria-label={`Slide ${i + 1}: ${SLIDE_NAMES[i]}`}
                className={cn("block w-full rounded-lg ring-2 ring-offset-2 ring-offset-card transition", sel === i ? "ring-[#F2B632]" : "ring-transparent hover:ring-border")}
              >
                <Scaled w={W} h={H} className="rounded-lg">
                  <AzollaSlide
                    ref={(el) => {
                      if (el) nodes.current.set(i, el);
                      else nodes.current.delete(i);
                    }}
                    data={data}
                    slide={i}
                    n={place(i) || i + 1}
                    total={total}
                  />
                </Scaled>
              </button>
              <div className="mt-2">
                <Check checked={data.enabled[i]} onChange={(v) => toggle(i, v)}>
                  <span className="text-xs">
                    {i + 1}. {SLIDE_NAMES[i]}
                  </span>
                </Check>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        <div className="space-y-6">
          {panel}
          <Panel title="Carousel" note="Top bar and footer on every slide.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Brand (top left)" value={data.brandLine} onChange={(v) => set("brandLine", v)} />
              <Text label="Series (after the yellow ×)" value={data.series} onChange={(v) => set("series", v)} />
              <Text label="Instagram handle (last slide)" value={data.handle} onChange={(v) => set("handle", v)} />
              <Text label="File name topic" value={data.category} onChange={(v) => set("category", v)} />
            </div>
          </Panel>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="card-elevated rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-semibold">
                Slide {sel + 1} · {SLIDE_NAMES[sel]}
                {!data.enabled[sel] && <span className="ml-2 text-xs font-normal text-amber-700">(left out)</span>}
              </p>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">1080 × 1350</span>
            </div>
            <div data-plan-preview>
              <Scaled w={W} h={H} className="rounded-lg shadow-lg">
                <AzollaSlide ref={mainRef} data={data} slide={sel} n={place(sel) || sel + 1} total={total} />
              </Scaled>
            </div>
            <button
              type="button"
              onClick={downloadAll}
              disabled={busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1D3A] px-4 py-3 font-display font-bold text-white shadow hover:brightness-125 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Images className="h-5 w-5" />}
              Download all {total} slides
            </button>
            <button type="button" onClick={downloadOne} disabled={busy} className={cn(btn, "mt-2 w-full justify-center py-2.5")}>
              <Download className="h-4 w-4" /> Download slide {sel + 1} only
            </button>
            <VideoDownload
              getPng={async () => {
                if (!mainRef.current) throw new Error("preview not ready");
                return bvPngBlob(mainRef.current, W, H);
              }}
              fileBase={`${folder}_${fileOf(sel).replace(/\.png$/, "")}`}
              w={W}
              h={H}
              onMsg={setMsg}
            />
            {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
            <p className="mt-2 text-xs text-muted-foreground">Slides export at 1080 × 1350, numbered in carousel order. In Chrome / Edge you pick a folder once.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
