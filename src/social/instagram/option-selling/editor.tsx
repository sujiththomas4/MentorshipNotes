import { useRef, useState, type ReactNode } from "react";
import { usePlannedDraft } from "@/social/saved-posts";
import { Download, FileDown, Loader2, Plus, RotateCcw, Sparkles, Trash2, Upload } from "lucide-react";
import { downloadSvgAsPng, svgToPngBlob } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import { IG_H, IG_LOGOS, IG_W, type IgLogoVariant } from "@/social/instagram/kit";
import { cn } from "@/lib/utils";
import { OptionSellingArtwork } from "./artwork";
import { MAX_LEGS, defaultData, emptyLeg, exampleData, fmtRupees, mergeData, pnl, type Leg, type OptionSellingData } from "./data";

const STORE_KEY = "social:Instagram_WeeklyOptionSelling";

export function OptionSellingEditor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<OptionSellingData>(STORE_KEY, defaultData, mergeData);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);


  const set = <K extends keyof OptionSellingData>(k: K, v: OptionSellingData[K]) => setData((d) => ({ ...d, [k]: v }));
  const setLeg = (i: number, p: Partial<Leg>) => setData((d) => ({ ...d, legs: d.legs.map((l, j) => (j === i ? { ...l, ...p } : l)) }));
  const closed = data.mode === "CLOSE";
  const r = closed ? pnl(data) : null;

  async function download() {
    if (!svgRef.current) return;
    setBusy(true);
    setMsg("");
    try {
      const first = data.legs[0];
      const strike = first ? `${first.strike.replace(/[^0-9]/g, "")}${first.type.toLowerCase()}` : "trade";
      await downloadSvgAsPng(
        svgRef.current,
        IG_W,
        IG_H,
        `option-selling_${data.instrument.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "trade"}_${strike}_${data.mode.toLowerCase()}_${data.date}.png`,
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLoadJson(file?: File) {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!raw || typeof raw !== "object" || !Array.isArray(raw.legs)) throw new Error('the file needs a "legs" list');
      setData(mergeData(raw));
      setMsg(`Loaded ${file.name}.`);
    } catch (e) {
      setMsg(`Couldn't load ${file.name}: ${e instanceof Error ? e.message : "invalid JSON"}`);
    }
  }

  function saveJson() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ template: "weekly-option-selling", ...data }, null, 2)], { type: "application/json" }));
    a.download = `option-selling_${data.instrument.toLowerCase()}_${data.date}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setData(exampleData())} className={btn}>
            <Sparkles className="h-4 w-4" /> Load example (SENSEX)
          </button>
          <label className={cn(btn, "cursor-pointer")}>
            <Upload className="h-4 w-4" /> Load data (.json)
            <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => (onLoadJson(e.target.files?.[0]), (e.target.value = ""))} />
          </label>
          <button type="button" onClick={saveJson} className={btn}>
            <FileDown className="h-4 w-4" /> Download data (.json)
          </button>
          <button type="button" onClick={() => confirm("Clear all fields?") && setData(defaultData())} className={cn(btn, "text-muted-foreground")}>
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        <Panel title="Mode" note="Entry: quantity and entry price. Close: adds the close price and the total P&L.">
          <Toggle
            value={data.mode}
            onChange={(v) => set("mode", v)}
            options={[
              ["ENTRY", "Entry", "#c98a00"],
              ["CLOSE", "Close", "#0fa24b"],
            ]}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Badge in Entry mode">
              <input value={data.badgeEntry} onChange={(e) => set("badgeEntry", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Badge in Close mode">
              <input value={data.badgeClose} onChange={(e) => set("badgeClose", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Panel>

        <Panel title="Post">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <input type="date" value={data.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Instrument">
              <input value={data.instrument} onChange={(e) => set("instrument", e.target.value)} className={inputCls} list="os-instr" />
              <datalist id="os-instr">
                {["NIFTY", "SENSEX", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"].map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Field>
          </div>
        </Panel>

        <Panel title="Legs" note={`1–${MAX_LEGS} options. Quantity is total units (lots × lot size).`}>
          <div className="space-y-3">
            {data.legs.map((l, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">Leg {i + 1}</span>
                  {data.legs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setData((d) => ({ ...d, legs: d.legs.filter((_, j) => j !== i) }))}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
                <div className={cn("grid gap-3", closed ? "grid-cols-2 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-5")}>
                  <Field label="Action">
                    <select value={l.action} onChange={(e) => setLeg(i, { action: e.target.value as Leg["action"] })} className={inputCls}>
                      <option>SELL</option>
                      <option>BUY</option>
                    </select>
                  </Field>
                  <Field label="Strike">
                    <input value={l.strike} onChange={(e) => setLeg(i, { strike: e.target.value })} className={inputCls} inputMode="numeric" />
                  </Field>
                  <Field label="Type">
                    <select value={l.type} onChange={(e) => setLeg(i, { type: e.target.value as Leg["type"] })} className={inputCls}>
                      <option>CE</option>
                      <option>PE</option>
                      <option value="">—</option>
                    </select>
                  </Field>
                  <Field label="Qty">
                    <input value={l.qty} onChange={(e) => setLeg(i, { qty: e.target.value })} className={inputCls} inputMode="numeric" />
                  </Field>
                  <Field label="Entry price">
                    <input value={l.price} onChange={(e) => setLeg(i, { price: e.target.value })} className={inputCls} inputMode="decimal" />
                  </Field>
                  {closed && (
                    <Field label="Close price">
                      <input value={l.exitPrice} onChange={(e) => setLeg(i, { exitPrice: e.target.value })} className={inputCls} inputMode="decimal" />
                    </Field>
                  )}
                </div>
              </div>
            ))}
            {data.legs.length < MAX_LEGS && (
              <button
                type="button"
                onClick={() =>
                  setData((d) => {
                    const last = d.legs[d.legs.length - 1];
                    return { ...d, legs: [...d.legs, emptyLeg({ action: "BUY", type: last?.type ?? "CE", qty: last?.qty ?? "" })] };
                  })
                }
                className={btn}
              >
                <Plus className="h-4 w-4" /> Add leg
              </button>
            )}
          </div>
        </Panel>

        {closed && (
          <Panel title="P&L" note="SELL: (entry − close) × qty. BUY: (close − entry) × qty. Summed over all legs.">
            <div className={cn("rounded-lg px-3 py-2 text-sm", r?.ok ? (r.total >= 0 ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900") : "bg-secondary text-muted-foreground")}>
              {r?.ok ? (
                <>
                  Total P&amp;L{" "}
                  <b>
                    {r.total >= 0 ? "+" : "−"}
                    {fmtRupees(r.total)}
                  </b>
                  {r.percent !== null && (
                    <>
                      {" "}
                      ({r.percent >= 0 ? "+" : "−"}
                      {Math.abs(r.percent).toFixed(1)}% of {data.percentBase ? "margin" : "net premium"} {fmtRupees(r.base)})
                    </>
                  )}
                </>
              ) : (
                r?.why
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="% base: margin used (₹), blank = net premium">
                <input value={data.percentBase} onChange={(e) => set("percentBase", e.target.value)} className={inputCls} inputMode="decimal" />
              </Field>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" checked={data.showPercent} onChange={(e) => set("showPercent", e.target.checked)} className="h-4 w-4" />
                Show the % on the post
              </label>
            </div>
          </Panel>
        )}

        <Panel title="Logo & text" note="The locked logo from Branding, only scaled.">
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(IG_LOGOS) as IgLogoVariant[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("logo", v)}
                aria-pressed={data.logo === v}
                className={cn("flex items-center gap-3 rounded-xl border-2 p-3 text-left", data.logo === v ? "border-[#f5b800]" : "border-border hover:border-muted-foreground/40")}
              >
                <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-[#07080b] p-2">
                  <img src={IG_LOGOS[v].href} alt="" className="max-h-full max-w-full" />
                </span>
                <span className="text-sm font-semibold">{IG_LOGOS[v].label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Title line 1 (silver)">
              <input value={data.title1} onChange={(e) => set("title1", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Title line 2 (gold)">
              <input value={data.title2} onChange={(e) => set("title2", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Top-right tagline (use | between, blank hides)">
              <input value={data.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Footer (3 words)">
              <div className="grid grid-cols-3 gap-2">
                {data.footer.map((s, i) => (
                  <input
                    key={i}
                    value={s}
                    onChange={(e) => set("footer", data.footer.map((x, j) => (j === i ? e.target.value : x)) as [string, string, string])}
                    className={inputCls}
                  />
                ))}
              </div>
            </Field>
          </div>
        </Panel>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="card-elevated rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display font-semibold">Live preview</p>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">1080 × 1350</span>
          </div>
          <div data-plan-preview>
            <OptionSellingArtwork ref={svgRef} data={data} className="block h-auto w-full rounded-lg shadow-lg" />
          </div>
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5b800] px-4 py-3 font-display font-bold text-[#15110a] shadow hover:brightness-95 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            Download PNG
          </button>
          <VideoDownload
            getPng={async () => {
              if (!svgRef.current) throw new Error("preview not ready");
              return svgToPngBlob(svgRef.current, IG_W, IG_H);
            }}
            fileBase={`option-selling_${data.instrument.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "trade"}_${data.mode.toLowerCase()}_${data.date}`}
            w={IG_W}
            h={IG_H}
            onMsg={setMsg}
          />
          {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
          <p className="mt-2 text-xs text-muted-foreground">Exports exactly 1080 × 1350 px. Your inputs are remembered in this browser.</p>
        </div>
      </div>
    </div>
  );
}

const btn = "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary";
const inputCls = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Toggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string, string][] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup">
      {options.map(([v, label, c]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className="rounded-xl border-2 py-2.5 font-display font-bold tracking-wide transition-colors"
          style={value === v ? { backgroundColor: c, borderColor: c, color: "#fff" } : { borderColor: `${c}55`, color: c }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="card-elevated rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-lg font-semibold">{title}</p>
      {note && <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
