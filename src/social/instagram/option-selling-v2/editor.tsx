import { useRef, useState } from "react";
import { usePlannedDraft } from "@/social/saved-posts";
import { Download, FileDown, Loader2, Plus, RotateCcw, Sparkles, Trash2, Upload } from "lucide-react";
import { downloadSvgAsPng, svgToPngBlob } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import { IG_H, IG_W } from "@/social/instagram/kit";
import { cn } from "@/lib/utils";
import { emptyLeg, fmtRupees, pnl, type Leg } from "@/social/instagram/option-selling/data";
import { Field, Panel, Toggle, btn, inputCls } from "@/social/instagram/option-selling/editor";
import { OptionSellingV2Artwork } from "./artwork";
import { MAX_LEGS, defaultData, exampleData, mergeData, netPremium, type OptionSellingV2Data } from "./data";

const STORE_KEY = "social:Instagram_WeeklyOptionSellingV2";

export function OptionSellingV2Editor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<OptionSellingV2Data>(STORE_KEY, defaultData, mergeData);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const set = <K extends keyof OptionSellingV2Data>(k: K, v: OptionSellingV2Data[K]) => setData((d) => ({ ...d, [k]: v }));
  const setLeg = (i: number, p: Partial<Leg>) => setData((d) => ({ ...d, legs: d.legs.map((l, j) => (j === i ? { ...l, ...p } : l)) }));
  const exit = data.mode === "EXIT";
  const r = exit ? pnl(data) : null;
  const e = exit ? null : netPremium(data);
  const fileBase = `option-selling-v2_${data.instrument.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "trade"}_${data.mode.toLowerCase()}_${data.date}`;

  async function download() {
    if (!svgRef.current) return;
    setBusy(true);
    setMsg("");
    try {
      await downloadSvgAsPng(svgRef.current, IG_W, IG_H, `${fileBase}.png`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Export failed");
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
    } catch (err) {
      setMsg(`Couldn't load ${file.name}: ${err instanceof Error ? err.message : "invalid JSON"}`);
    }
  }

  function saveJson() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ template: "weekly-option-selling-v2", ...data }, null, 2)], { type: "application/json" }));
    a.download = `${fileBase}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setData(exampleData())} className={btn}>
            <Sparkles className="h-4 w-4" /> Load example (NIFTY)
          </button>
          <label className={cn(btn, "cursor-pointer")}>
            <Upload className="h-4 w-4" /> Load data (.json)
            <input type="file" accept="application/json,.json" className="sr-only" onChange={(ev) => (onLoadJson(ev.target.files?.[0]), (ev.target.value = ""))} />
          </label>
          <button type="button" onClick={saveJson} className={btn}>
            <FileDown className="h-4 w-4" /> Download data (.json)
          </button>
          <button type="button" onClick={() => confirm("Clear all fields?") && setData(defaultData())} className={cn(btn, "text-muted-foreground")}>
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        <Panel title="Mode" note="Entry: entry prices, the entry label and the net premium. Exit: adds exit prices and the total P&L.">
          <Toggle
            value={data.mode}
            onChange={(v) => set("mode", v)}
            options={[
              ["ENTRY", "Entry", "#c98a00"],
              ["EXIT", "Exit", "#0fa24b"],
            ]}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {exit ? (
              <Field label="Exit label (header pill, blank hides)">
                <input value={data.exitLabel} onChange={(ev) => set("exitLabel", ev.target.value)} className={inputCls} />
              </Field>
            ) : (
              <>
                <Field label="Entry label (header pill, blank hides)">
                  <input value={data.entryLabel} onChange={(ev) => set("entryLabel", ev.target.value)} className={inputCls} />
                </Field>
                <Field label="Tag beside the net premium (blank hides)">
                  <input value={data.entryTag} onChange={(ev) => set("entryTag", ev.target.value)} className={inputCls} />
                </Field>
              </>
            )}
          </div>
        </Panel>

        <Panel title="Trade">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date">
              <input type="date" value={data.date} onChange={(ev) => set("date", ev.target.value)} className={inputCls} />
            </Field>
            <Field label="Instrument">
              <input value={data.instrument} onChange={(ev) => set("instrument", ev.target.value)} className={inputCls} list="os2-instr" />
              <datalist id="os2-instr">
                {["NIFTY", "SENSEX", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"].map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Field>
            <Field label="Strategy">
              <input value={data.strategy} onChange={(ev) => set("strategy", ev.target.value)} className={inputCls} />
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
                <div className={cn("grid gap-3", exit ? "grid-cols-2 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-5")}>
                  <Field label="Action">
                    <select value={l.action} onChange={(ev) => setLeg(i, { action: ev.target.value as Leg["action"] })} className={inputCls}>
                      <option>SELL</option>
                      <option>BUY</option>
                    </select>
                  </Field>
                  <Field label="Strike">
                    <input value={l.strike} onChange={(ev) => setLeg(i, { strike: ev.target.value })} className={inputCls} inputMode="numeric" />
                  </Field>
                  <Field label="Type">
                    <select value={l.type} onChange={(ev) => setLeg(i, { type: ev.target.value as Leg["type"] })} className={inputCls}>
                      <option>CE</option>
                      <option>PE</option>
                      <option value="">—</option>
                    </select>
                  </Field>
                  <Field label="Qty">
                    <input value={l.qty} onChange={(ev) => setLeg(i, { qty: ev.target.value })} className={inputCls} inputMode="numeric" />
                  </Field>
                  <Field label="Entry price">
                    <input value={l.price} onChange={(ev) => setLeg(i, { price: ev.target.value })} className={inputCls} inputMode="decimal" />
                  </Field>
                  {exit && (
                    <Field label="Exit price">
                      <input value={l.exitPrice} onChange={(ev) => setLeg(i, { exitPrice: ev.target.value })} className={inputCls} inputMode="decimal" />
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

        {exit ? (
          <Panel title="P&L" note="SELL: (entry − exit) × qty. BUY: (exit − entry) × qty. Summed over all legs.">
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
                      {Math.abs(r.percent).toFixed(2)}% of {data.percentBase ? "margin" : "net premium"} {fmtRupees(r.base)})
                    </>
                  )}
                </>
              ) : (
                r?.why
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="% base: margin used (₹), blank = net premium">
                <input value={data.percentBase} onChange={(ev) => set("percentBase", ev.target.value)} className={inputCls} inputMode="decimal" />
              </Field>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" checked={data.showPercent} onChange={(ev) => set("showPercent", ev.target.checked)} className="h-4 w-4" />
                Show the % on the post
              </label>
            </div>
          </Panel>
        ) : (
          <Panel title="Net premium" note="SELL legs add entry price × qty, BUY legs subtract it.">
            <div className={cn("rounded-lg px-3 py-2 text-sm", e?.ok ? "bg-amber-50 text-amber-900" : "bg-secondary text-muted-foreground")}>
              {e?.ok ? (
                <>
                  {e.net >= 0 ? "Net credit" : "Net debit"} <b>{fmtRupees(e.net)}</b>
                </>
              ) : (
                e?.why
              )}
            </div>
          </Panel>
        )}

        <Panel title="Text">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Card title">
              <input value={data.cardTitle} onChange={(ev) => set("cardTitle", ev.target.value)} className={inputCls} />
            </Field>
            <Field label="Top-right line (use | between, blank hides)">
              <input value={data.nav} onChange={(ev) => set("nav", ev.target.value)} className={inputCls} />
            </Field>
            <Field label="Line under the title (use | between, blank hides)">
              <input value={data.subheadline} onChange={(ev) => set("subheadline", ev.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {data.footer.map((f, i) => (
              <Field key={i} label={`Footer ${i + 1}`}>
                <div className="space-y-2">
                  <input
                    value={f.title}
                    onChange={(ev) => set("footer", data.footer.map((x, j) => (j === i ? { ...x, title: ev.target.value } : x)) as OptionSellingV2Data["footer"])}
                    className={inputCls}
                  />
                  <input
                    value={f.sub}
                    onChange={(ev) => set("footer", data.footer.map((x, j) => (j === i ? { ...x, sub: ev.target.value } : x)) as OptionSellingV2Data["footer"])}
                    className={inputCls}
                  />
                </div>
              </Field>
            ))}
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
            <OptionSellingV2Artwork ref={svgRef} data={data} className="block h-auto w-full rounded-lg shadow-lg" />
          </div>
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd21c] px-4 py-3 font-display font-bold text-[#15110a] shadow hover:brightness-95 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            Download PNG
          </button>
          <VideoDownload
            getPng={async () => {
              if (!svgRef.current) throw new Error("preview not ready");
              return svgToPngBlob(svgRef.current, IG_W, IG_H);
            }}
            fileBase={fileBase}
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
