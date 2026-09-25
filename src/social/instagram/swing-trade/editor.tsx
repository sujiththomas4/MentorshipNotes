import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { usePlannedDraft } from "@/social/saved-posts";
import {
  Download,
  FileDown,
  ImagePlus,
  Loader2,
  Move,
  RotateCcw,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { downloadSvgAsPng, svgToPngBlob } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import {
  IG_H,
  IG_LOGOS,
  IG_W,
  type IgLogoVariant,
} from "@/social/instagram/kit";
import { cn } from "@/lib/utils";
import { SwingTradeArtwork } from "./artwork";
import {
  CHART_BOX,
  CHART_SHIFT,
  CHART_ZOOM_MAX,
  CHART_ZOOM_MIN,
  LOGO_MAX,
  LOGO_MIN,
  clampLogo,
  clampNum,
  defaultData,
  exampleData,
  levelProblems,
  mergeData,
  suggestedRR,
  type SwingTradeData,
} from "./data";

const STORE_KEY = "social:Instagram_SwingTrade";

export function SwingTradeEditor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<SwingTradeData>(STORE_KEY, defaultData, (raw) => mergeData(raw as Partial<Record<keyof SwingTradeData, unknown>> | null));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);


  const set = <K extends keyof SwingTradeData>(k: K, v: SwingTradeData[K]) =>
    setData((d) => ({ ...d, [k]: v }));
  const problems = levelProblems(data);
  const rr = suggestedRR(data);

  async function download() {
    if (!svgRef.current) return;
    setBusy(true);
    setMsg("");
    try {
      const name = `swing_${(data.ticker || "trade").toLowerCase().replace(/[^a-z0-9]+/g, "-")}_${data.date || "undated"}.png`;
      await downloadSvgAsPng(svgRef.current, IG_W, IG_H, name);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  function readFile(file: File, as: "text" | "dataUrl") {
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      if (as === "text") r.readAsText(file);
      else r.readAsDataURL(file);
    });
  }

  async function onChart(file?: File) {
    if (!file) return;
    const url = await readFile(file, "dataUrl");
    const size = await imageSize(url);
    setData((d) => ({ ...d, chart: url, chartSize: size, ...PLACEMENT_RESET }));
    setMsg(
      `Using your chart image (${file.name}). Drag it in the preview or use the controls below to position it.`,
    );
  }

  // a chart saved before sizes were stored: measure it once
  useEffect(() => {
    if (!data.chart || data.chartSize) return;
    let alive = true;
    imageSize(data.chart).then(
      (size) =>
        alive &&
        size &&
        setData((d) =>
          d.chart === data.chart ? { ...d, chartSize: size } : d,
        ),
    );
    return () => {
      alive = false;
    };
  }, [data.chart, data.chartSize, setData]);

  // drag the chart image in the preview (1 preview px = 1080 / preview width canvas px)
  const drag = useRef<{
    px: number;
    py: number;
    x: number;
    y: number;
    k: number;
  } | null>(null);
  function onPreviewDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!data.chart || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const k = IG_W / r.width;
    const cx = (e.clientX - r.left) * k;
    const cy = (e.clientY - r.top) * k;
    const B = CHART_BOX;
    if (cx < B.x || cx > B.x + B.w || cy < B.y || cy > B.y + B.h) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      px: e.clientX,
      py: e.clientY,
      x: data.chartX,
      y: data.chartY,
      k,
    };
  }
  function onPreviewMove(e: ReactPointerEvent<HTMLDivElement>) {
    const g = drag.current;
    if (!g) return;
    setData((d) => ({
      ...d,
      chartX: clampNum(
        Math.round(g.x + (e.clientX - g.px) * g.k),
        -CHART_SHIFT,
        CHART_SHIFT,
        0,
      ),
      chartY: clampNum(
        Math.round(g.y + (e.clientY - g.py) * g.k),
        -CHART_SHIFT,
        CHART_SHIFT,
        0,
      ),
    }));
  }
  function onPreviewUp() {
    drag.current = null;
  }

  async function onLoadJson(file?: File) {
    if (!file) return;
    try {
      const raw = JSON.parse(await readFile(file, "text"));
      if (
        !raw ||
        typeof raw !== "object" ||
        !("stockName" in raw) ||
        !("direction" in raw)
      )
        throw new Error("the file needs at least stockName and direction");
      setData(mergeData(raw));
      setMsg(`Loaded ${file.name}.`);
    } catch (e) {
      setMsg(
        `Couldn't load ${file.name}: ${e instanceof Error ? e.message : "invalid JSON"}`,
      );
    }
  }

  function saveJson() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(
        [JSON.stringify({ template: "swing-trade", ...data }, null, 2)],
        { type: "application/json" },
      ),
    );
    a.download = `swing_${(data.ticker || "trade").toLowerCase()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const setReason = (i: number, v: string) =>
    setData((d) => ({
      ...d,
      reason: d.reason.map((r, j) => (j === i ? v : r)),
    }));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setData(exampleData())}
            className={btn}
          >
            <Sparkles className="h-4 w-4" /> Load example (RELIANCE)
          </button>
          <label className={cn(btn, "cursor-pointer")}>
            <Upload className="h-4 w-4" /> Load data (.json)
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => (
                onLoadJson(e.target.files?.[0]),
                (e.target.value = "")
              )}
            />
          </label>
          <button type="button" onClick={saveJson} className={btn}>
            <FileDown className="h-4 w-4" /> Download data (.json)
          </button>
          <button
            type="button"
            onClick={() =>
              confirm("Clear all fields?") && setData(defaultData())
            }
            className={cn(btn, "text-muted-foreground")}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        <Panel title="Stock">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Post date">
              <input
                type="date"
                value={data.date}
                onChange={(e) => set("date", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Stock name">
              <input
                value={data.stockName}
                onChange={(e) => set("stockName", e.target.value)}
                className={inputCls}
                placeholder="e.g. RELIANCE INDUSTRIES"
              />
            </Field>
            <Field label="Ticker">
              <input
                value={data.ticker}
                onChange={(e) => set("ticker", e.target.value)}
                className={inputCls}
                placeholder="e.g. RELIANCE"
              />
            </Field>
            <Field label="Exchange">
              <input
                value={data.exchange}
                onChange={(e) => set("exchange", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Current price (₹)">
              <input
                value={data.currentPrice}
                onChange={(e) => set("currentPrice", e.target.value)}
                className={inputCls}
                inputMode="decimal"
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Trade">
          <div className="mb-4 grid grid-cols-2 gap-2">
            {(["BUY", "SELL"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => set("direction", dir)}
                aria-pressed={data.direction === dir}
                className={cn(
                  "rounded-xl border-2 py-2.5 font-display font-bold tracking-wide transition-colors",
                  data.direction === dir
                    ? dir === "BUY"
                      ? "border-[#0AA66A] bg-[#0AA66A] text-white"
                      : "border-[#EF3340] bg-[#EF3340] text-white"
                    : dir === "BUY"
                      ? "border-[#0AA66A]/40 text-[#0AA66A]"
                      : "border-[#EF3340]/40 text-[#EF3340]",
                )}
              >
                {dir === "BUY" ? "↑ BUY" : "↓ SELL"}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Entry (₹)">
              <input
                value={data.entryPrice}
                onChange={(e) => set("entryPrice", e.target.value)}
                className={inputCls}
                inputMode="decimal"
              />
            </Field>
            <Field label="Target 1 (₹)">
              <input
                value={data.target1}
                onChange={(e) => set("target1", e.target.value)}
                className={inputCls}
                inputMode="decimal"
              />
            </Field>
            <Field label="Target 2 (₹)">
              <input
                value={data.target2}
                onChange={(e) => set("target2", e.target.value)}
                className={inputCls}
                inputMode="decimal"
              />
            </Field>
            <Field label="Stop loss (₹)">
              <input
                value={data.stopLoss}
                onChange={(e) => set("stopLoss", e.target.value)}
                className={inputCls}
                inputMode="decimal"
              />
            </Field>
          </div>
          {problems.length > 0 && (
            <div className="mt-3 space-y-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {problems.map((p) => (
                <p key={p} className="flex gap-2">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {p}
                </p>
              ))}
            </div>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Time frame">
              <input
                value={data.timeframe}
                onChange={(e) => set("timeframe", e.target.value)}
                className={inputCls}
                list="st-tf"
              />
              <datalist id="st-tf">
                {["Daily", "Weekly", "Monthly", "4H", "Hourly"].map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Field>
            <Field label="Trade setup">
              <input
                value={data.setup}
                onChange={(e) => set("setup", e.target.value)}
                className={inputCls}
                list="st-setup"
                placeholder="e.g. Breakout"
              />
              <datalist id="st-setup">
                {[
                  "Breakout",
                  "Breakdown",
                  "Pullback",
                  "Reversal",
                  "Trend continuation",
                ].map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Field>
            <Field label="Risk / reward">
              <input
                value={data.riskReward}
                onChange={(e) => set("riskReward", e.target.value)}
                className={inputCls}
                placeholder="e.g. 1 : 2.5"
              />
            </Field>
          </div>
          {rr && (rr.t1 !== null || rr.t2 !== null) && (
            <p className="mt-2 text-xs text-muted-foreground">
              From your levels: {rr.t1 !== null && <>1 : {rr.t1} to Target 1</>}
              {rr.t1 !== null && rr.t2 !== null && " · "}
              {rr.t2 !== null && (
                <>
                  1 : {rr.t2} to Target 2{" "}
                  <button
                    type="button"
                    className="font-semibold text-accent hover:underline"
                    onClick={() => set("riskReward", `1 : ${rr.t2}`)}
                  >
                    use this
                  </button>
                </>
              )}
            </p>
          )}
          <div className="mt-4">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Key reasons (1–3 short points)
            </span>
            <div className="space-y-2">
              {data.reason.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={r}
                    onChange={(e) => setReason(i, e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Breakout above resistance with strong volume"
                  />
                  {data.reason.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remove reason"
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          reason: d.reason.filter((_, j) => j !== i),
                        }))
                      }
                      className="rounded-lg border border-border px-2 text-muted-foreground hover:bg-secondary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {data.reason.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setData((d) => ({ ...d, reason: [...d.reason, ""] }))
                  }
                  className="text-sm font-medium text-accent hover:underline"
                >
                  + Add a reason
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Up to 4 lines fit in the Key Reason box; keep each point short.
            </p>
          </div>
        </Panel>

        <Panel
          title="Chart"
          note="Without an image, an illustrative candlestick chart is drawn from your levels. Use your real chart before posting a real trade."
        >
          <div className="flex flex-wrap items-center gap-2">
            <label className={cn(btn, "cursor-pointer")}>
              <ImagePlus className="h-4 w-4" />{" "}
              {data.chart ? "Replace chart image" : "Upload chart image"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => (
                  onChart(e.target.files?.[0]),
                  (e.target.value = "")
                )}
              />
            </label>
            {data.chart && (
              <button
                type="button"
                onClick={() => set("chart", null)}
                className={btn}
              >
                <Trash2 className="h-4 w-4" /> Remove image
              </button>
            )}
            {!data.chart && (
              <label className="ml-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.illustrativeTag}
                  onChange={(e) => set("illustrativeTag", e.target.checked)}
                />
                Show "Illustrative chart" tag
              </label>
            )}
          </div>
          {data.chart && (
            <div className="mt-4 space-y-3 rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div
                  className="grid grid-cols-2 gap-1.5"
                  role="radiogroup"
                  aria-label="Chart image fit"
                >
                  {(
                    [
                      ["fit", "Fit (whole image)"],
                      ["fill", "Fill the box"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={data.chartFit === v}
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          chartFit: v,
                          chartZoom: 100,
                          chartX: 0,
                          chartY: 0,
                        }))
                      }
                      className={cn(
                        "rounded-lg border-2 px-3 py-1.5 text-xs font-semibold",
                        data.chartFit === v
                          ? "border-[#0AA66A] bg-[#0AA66A] text-white"
                          : "border-border hover:border-muted-foreground/40",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setData((d) => ({ ...d, ...PLACEMENT_RESET }))}
                  className={btn}
                >
                  <RotateCcw className="h-4 w-4" /> Reset position
                </button>
              </div>
              <Slider
                label="Size"
                unit="%"
                min={CHART_ZOOM_MIN}
                max={CHART_ZOOM_MAX}
                step={1}
                value={data.chartZoom}
                onChange={(v) => set("chartZoom", v)}
              />
              <Slider
                label="Left / right"
                unit="px"
                min={-600}
                max={600}
                step={1}
                value={data.chartX}
                onChange={(v) => set("chartX", v)}
              />
              <Slider
                label="Up / down"
                unit="px"
                min={-400}
                max={400}
                step={1}
                value={data.chartY}
                onChange={(v) => set("chartY", v)}
              />
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Move className="h-3.5 w-3.5" /> Tip: drag the chart in the
                preview to move it. Anything outside the chart box is cropped.
              </p>
            </div>
          )}
          {!data.chart && (
            <p className="mt-2 flex gap-2 text-xs text-amber-800">
              <TriangleAlert className="h-4 w-4 shrink-0" /> The drawn chart is
              not real price data.
            </p>
          )}
        </Panel>

        <Panel
          title="Logo"
          note="The locked logo from Branding. It is only scaled, never recoloured."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-sm font-semibold">Background</p>
              <div
                className="grid grid-cols-3 gap-2"
                role="radiogroup"
                aria-label="Logo background"
              >
                {(
                  [
                    ["shield", "Shield only"],
                    ["plate", "Rectangle"],
                    ["none", "None"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={data.logoBg === v}
                    onClick={() => set("logoBg", v)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 text-xs font-semibold",
                      data.logoBg === v
                        ? "border-[#0AA66A]"
                        : "border-border hover:border-muted-foreground/40",
                    )}
                  >
                    <span className="flex h-12 w-full items-center justify-center rounded bg-[#f6f9fb]">
                      <span
                        className={cn(
                          "flex h-10 items-center justify-center",
                          v === "plate" && "rounded-md bg-[#0B223D] px-1.5",
                        )}
                      >
                        <img
                          src={
                            v === "shield"
                              ? IG_LOGOS[data.logo].filledHref
                              : IG_LOGOS[data.logo].href
                          }
                          alt=""
                          className="max-h-8 max-w-[4.5rem]"
                        />
                      </span>
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Logo size</span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded border border-border px-2 hover:bg-secondary"
                    onClick={() =>
                      set("logoHeight", clampLogo(data.logoHeight - 2))
                    }
                    aria-label="Smaller"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={LOGO_MIN}
                    max={LOGO_MAX}
                    value={data.logoHeight}
                    onChange={(e) =>
                      set("logoHeight", clampLogo(Number(e.target.value)))
                    }
                    className="w-16 rounded border border-input bg-card px-1.5 py-0.5 text-right font-mono text-sm"
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                  <button
                    type="button"
                    className="rounded border border-border px-2 hover:bg-secondary"
                    onClick={() =>
                      set("logoHeight", clampLogo(data.logoHeight + 2))
                    }
                    aria-label="Larger"
                  >
                    +
                  </button>
                </span>
              </div>
              <input
                type="range"
                min={LOGO_MIN}
                max={LOGO_MAX}
                value={data.logoHeight}
                onChange={(e) =>
                  set("logoHeight", clampLogo(Number(e.target.value)))
                }
                className="mt-2 w-full accent-[#0AA66A]"
              />
              <p className="text-xs text-muted-foreground">
                Height on the 1080 × 1350 post ({LOGO_MIN}–{LOGO_MAX} px,
                default 86).
              </p>
            </div>
          </div>
          {data.logoBg === "none" && (
            <p className="mt-2 flex gap-2 text-xs text-amber-800">
              <TriangleAlert className="h-4 w-4 shrink-0" /> The logo is white;
              on this light background parts of it (bull, bear, TRADERS) will be
              hard to see.
            </p>
          )}
          {data.logoBg === "shield" && data.logo === "horizontal" && (
            <p className="mt-2 flex gap-2 text-xs text-amber-800">
              <TriangleAlert className="h-4 w-4 shrink-0" /> Only the shield
              gets the navy fill; the white &quot;TRADERS&quot; beside it stays
              hard to see on this light background. The Tricolor Shield keeps
              all its wording inside the shield.
            </p>
          )}
          {data.logoHeight + (data.logoBg === "plate" ? 34 : 0) > 124 && (
            <p className="mt-2 flex gap-2 text-xs text-amber-800">
              <TriangleAlert className="h-4 w-4 shrink-0" /> At this size the
              logo reaches into the SWING TRADING title; check the preview.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(Object.keys(IG_LOGOS) as IgLogoVariant[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("logo", v)}
                aria-pressed={data.logo === v}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-3 text-left",
                  data.logo === v
                    ? "border-[#0AA66A]"
                    : "border-border hover:border-muted-foreground/40",
                )}
              >
                <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-[#0B223D] p-2">
                  <img
                    src={IG_LOGOS[v].href}
                    alt=""
                    className="max-h-full max-w-full"
                  />
                </span>
                <span className="text-sm font-semibold">
                  {IG_LOGOS[v].label}
                </span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Text">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (navy)">
              <input
                value={data.titleA}
                onChange={(e) => set("titleA", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Title (green)">
              <input
                value={data.titleB}
                onChange={(e) => set("titleB", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Script words (3)">
              <div className="grid grid-cols-3 gap-2">
                {data.script.map((s, i) => (
                  <input
                    key={i}
                    value={s}
                    onChange={(e) =>
                      set(
                        "script",
                        data.script.map((x, j) =>
                          j === i ? e.target.value : x,
                        ) as [string, string, string],
                      )
                    }
                    className={inputCls}
                  />
                ))}
              </div>
            </Field>
            <Field label="Footer" wide>
              <input
                value={data.footer}
                onChange={(e) => set("footer", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="card-elevated rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display font-semibold">Live preview</p>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              1080 × 1350
            </span>
          </div>
          <div
            onPointerDown={onPreviewDown}
            onPointerMove={onPreviewMove}
            onPointerUp={onPreviewUp}
            onPointerCancel={onPreviewUp}
            className={cn(
              "touch-none select-none",
              data.chart && "cursor-move",
            )}
          >
            <div data-plan-preview>
              <SwingTradeArtwork
                ref={svgRef}
                data={data}
                className="block h-auto w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0AA66A] px-4 py-3 font-display font-bold text-white shadow hover:brightness-95 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            Download PNG
          </button>
          <VideoDownload
            getPng={async () => {
              if (!svgRef.current) throw new Error("preview not ready");
              return svgToPngBlob(svgRef.current, IG_W, IG_H);
            }}
            fileBase={`swing_${(data.ticker || "trade").toLowerCase().replace(/[^a-z0-9]+/g, "-")}_${data.date || "undated"}`}
            w={IG_W}
            h={IG_H}
            onMsg={setMsg}
          />
          {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            Exports exactly 1080 × 1350 px. Your inputs are remembered in this
            browser.
          </p>
        </div>
      </div>
    </div>
  );
}

const btn =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary";
const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="card-elevated rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-lg font-semibold">{title}</p>
      {note && <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={cn("block", wide && "sm:col-span-2")}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const PLACEMENT_RESET = {
  chartFit: "fit" as const,
  chartZoom: 100,
  chartX: 0,
  chartY: 0,
};

/** Natural pixel size of an image (null if it can't be read). */
function imageSize(src: string) {
  return new Promise<{ w: number; h: number } | null>((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve(
        img.naturalWidth && img.naturalHeight
          ? { w: img.naturalWidth, h: img.naturalHeight }
          : null,
      );
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => clampNum(v, min, max, value);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <button
        type="button"
        aria-label={`${label} down`}
        className="rounded border border-border px-2 hover:bg-secondary"
        onClick={() => onChange(clamp(value - (unit === "%" ? 5 : 10)))}
      >
        −
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="min-w-0 flex-1 accent-[#0AA66A]"
      />
      <button
        type="button"
        aria-label={`${label} up`}
        className="rounded border border-border px-2 hover:bg-secondary"
        onClick={() => onChange(clamp(value + (unit === "%" ? 5 : 10)))}
      >
        +
      </button>
      <span className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="w-16 rounded border border-input bg-card px-1.5 py-0.5 text-right font-mono text-xs"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}
