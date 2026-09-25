import { useRef, useState, type ReactNode } from "react";
import { usePlannedDraft } from "@/social/saved-posts";
import { Download, FolderDown, Loader2, RotateCcw } from "lucide-react";
import { downloadSvgAsPng, saveAllAsPng, svgToPngBlob } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import { igH } from "@/social/instagram/layout";
import { LayoutPanel } from "@/social/instagram/layout-ui";
import {
  IG_LOGOS,
  IG_W,
  SENTIMENT,
  type IgLogoVariant,
  type Sentiment,
} from "@/social/instagram/kit";
import { cn } from "@/lib/utils";
import {
  GLOBAL_THEMES,
  MARKET_ORDER,
  SLIDE_FILES,
  defaultData,
  mergeData,
  parsePoints,
  type GlobalMarketData,
  type MarketItem,
  type MarketKey,
} from "./data";
import { COVER_PHOTO, CoverSlide } from "./cover";
import { DetailSlide } from "./detail";

type SlideId = "cover" | MarketKey;
const SLIDES: SlideId[] = ["cover", ...MARKET_ORDER];
const STORE_KEY = "social:Instagram_GlobalMarket_All";

function Slide({
  id,
  data,
  className,
  svgRef,
}: {
  id: SlideId;
  data: GlobalMarketData;
  className?: string;
  svgRef?: (el: SVGSVGElement | null) => void;
}) {
  return id === "cover" ? (
    <CoverSlide ref={svgRef} data={data} className={className} />
  ) : (
    <DetailSlide ref={svgRef} data={data} k={id} className={className} />
  );
}

export function GlobalMarketEditor() {
  // the usual draft, or a planned post's own draft when opened from the content planner
  const { data, setData } = usePlannedDraft<GlobalMarketData>(STORE_KEY, defaultData, (raw) => mergeData(raw as Partial<GlobalMarketData> | null));
  const [active, setActive] = useState<SlideId>("cover");
  const [busy, setBusy] = useState<"" | "one" | "all">("");
  const [msg, setMsg] = useState("");
  const [compare, setCompare] = useState(false);
  const thumbs = useRef<Partial<Record<SlideId, SVGSVGElement | null>>>({});


  const set = <K extends keyof GlobalMarketData>(
    k: K,
    v: GlobalMarketData[K],
  ) => setData((d) => ({ ...d, [k]: v }));
  const setMarket = (k: MarketKey, patch: Partial<MarketItem>) =>
    setData((d) => ({
      ...d,
      markets: { ...d.markets, [k]: { ...d.markets[k], ...patch } },
    }));

  const folder = data.date || "undated";
  const H = igH(data.layout);

  async function downloadOne() {
    const svg = thumbs.current[active];
    if (!svg) return;
    setBusy("one");
    setMsg("");
    try {
      await downloadSvgAsPng(svg, IG_W, H, `${SLIDE_FILES[active]}.png`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy("");
    }
  }

  async function saveAll() {
    setBusy("all");
    setMsg("");
    try {
      const items = SLIDES.map((id) => ({
        svg: thumbs.current[id]!,
        filename: `${SLIDE_FILES[id]}.png`,
      })).filter((x) => x.svg);
      const how = await saveAllAsPng(items, IG_W, H, folder);
      if (how === "folder")
        setMsg(`Saved ${items.length} images in the folder “${folder}”.`);
      if (how === "downloads")
        setMsg(
          `Downloaded ${items.length} images (named ${folder}_01_cover_initial.png …).`,
        );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy("");
    }
  }

  function reset() {
    if (
      confirm(
        "Reset every slide to the defaults? Values and descriptions you typed will be cleared.",
      )
    )
      setData(defaultData());
  }

  const label = (id: SlideId) =>
    id === "cover" ? "Cover" : data.markets[id].name || id;

  return (
    <div className="space-y-6">
      {/* shared date + slide tabs */}
      <div className="card-elevated flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-4">
        <Field label="Post date (all slides)">
          <input
            type="date"
            value={data.date}
            onChange={(e) => set("date", e.target.value)}
            className={cn(inputCls, "w-48")}
          />
        </Field>
        <div
          className="flex flex-1 flex-wrap gap-1.5"
          role="tablist"
          aria-label="Slides"
        >
          {SLIDES.map((id, i) => {
            const on = id === active;
            const sent =
              id === "cover" ? null : SENTIMENT[data.markets[id].sentiment];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    on ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                {label(id)}
                {sent && (
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: sent.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
        {/* controls for the selected slide */}
        <div className="space-y-6">
          <LayoutPanel
            value={data.layout}
            onChange={(l) => set("layout", l)}
            themes={GLOBAL_THEMES}
            header="Show header (logo, date)"
            footer="Show footer (swipe, page number)"
            note="Applies to all 7 slides."
          />
          {active === "cover" ? (
            <CoverControls
              data={data}
              set={set}
              setMarket={setMarket}
              open={setActive}
            />
          ) : (
            <MarketControls
              k={active}
              m={data.markets[active]}
              setMarket={setMarket}
            />
          )}
        </div>

        {/* big preview + actions */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="card-elevated rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-semibold">
                Slide {SLIDES.indexOf(active) + 1} · {label(active)}
              </p>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompare((c) => !c)}
                  aria-pressed={compare}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    compare
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  Compare with reference
                </button>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                  1080 × {H}
                </span>
              </span>
            </div>
            {compare ? (
              <div className="grid grid-cols-2 gap-2">
                <figure>
                  <Slide
                    id={active}
                    data={data}
                    className="block h-auto w-full rounded-lg shadow-lg"
                  />
                  <figcaption className="mt-1 text-center text-xs text-muted-foreground">
                    Yours
                  </figcaption>
                </figure>
                <figure>
                  <img
                    src={`/social/instagram/global-market/reference/0${SLIDES.indexOf(active) + 1}.png`}
                    alt="Reference slide"
                    className="block h-auto w-full rounded-lg shadow-lg"
                  />
                  <figcaption className="mt-1 text-center text-xs text-muted-foreground">
                    Reference (sample data)
                  </figcaption>
                </figure>
              </div>
            ) : (
              <div
                className={cn(
                  data.layout.format === "story" && "mx-auto max-w-[400px]",
                )}
              >
                <Slide
                  id={active}
                  data={data}
                  className="block h-auto w-full rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={downloadOne}
                disabled={!!busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2ADA74] px-4 py-3 font-display font-bold text-[#0f7a3d] hover:bg-[#2ADA74]/10 disabled:opacity-60"
              >
                {busy === "one" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                This slide
              </button>
              <button
                type="button"
                onClick={saveAll}
                disabled={!!busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2ADA74] px-4 py-3 font-display font-bold text-[#071422] shadow hover:brightness-95 disabled:opacity-60"
              >
                {busy === "all" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FolderDown className="h-5 w-5" />
                )}
                Save all 7
              </button>
            </div>
            <VideoDownload
              getPng={async () => {
                const svg = thumbs.current[active];
                if (!svg) throw new Error("slide not ready");
                return svgToPngBlob(svg, IG_W, H);
              }}
              fileBase={`${folder}_${SLIDE_FILES[active]}`}
              w={IG_W}
              h={H}
              onMsg={setMsg}
            />
            {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Save all puts the PNGs in a folder named{" "}
                <span className="font-mono">{folder}</span>{" "}
                (01_cover_initial.png … 07_pre_open_initial.png).
              </p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* every slide, live */}
      <section className="card-elevated rounded-2xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-lg font-semibold">All 7 slides</p>
          <p className="text-xs text-muted-foreground">
            Updates live. Click a slide to edit it.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {SLIDES.map((id, i) => (
            <button
              key={id}
              type="button"
              {...(id === "cover" ? { "data-plan-preview": "" } : {})}
              onClick={() => setActive(id)}
              className={cn(
                "group overflow-hidden rounded-xl border-2 text-left transition-all",
                id === active
                  ? "border-[#2ADA74] shadow-lg"
                  : "border-transparent hover:border-border",
              )}
            >
              <Slide
                id={id}
                data={data}
                className="block h-auto w-full"
                svgRef={(el) => (thumbs.current[id] = el)}
              />
              <span className="block truncate px-2 py-1.5 text-xs">
                <span className="font-mono text-muted-foreground">
                  {SLIDE_FILES[id]}.png
                </span>
              </span>
              <span className="sr-only">Slide {i + 1}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- controls ---------------- */

function CoverControls({
  data,
  set,
  setMarket,
  open,
}: {
  data: GlobalMarketData;
  set: <K extends keyof GlobalMarketData>(k: K, v: GlobalMarketData[K]) => void;
  setMarket: (k: MarketKey, p: Partial<MarketItem>) => void;
  open: (id: SlideId) => void;
}) {
  return (
    <>
      <Panel
        title="Logo"
        note="The locked logo from Branding, placed as its PNG (never redrawn): top-left, about 92 px high."
      >
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(IG_LOGOS) as IgLogoVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set("logo", v)}
              aria-pressed={data.logo === v}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors",
                data.logo === v
                  ? "border-[#20e878]"
                  : "border-border hover:border-muted-foreground/40",
              )}
            >
              <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-[#031321] p-2">
                <img
                  src={IG_LOGOS[v].href}
                  alt=""
                  className="max-h-full max-w-full"
                />
              </span>
              <span className="text-sm font-semibold">{IG_LOGOS[v].label}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Cover">
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-border p-3">
          <span className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-[#031321]">
            <img
              src={COVER_PHOTO}
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={data.coverPhoto}
              onChange={(e) => set("coverPhoto", e.target.checked)}
              className="h-4 w-4"
            />
            Photo background (all 7 slides)
          </label>
          {data.coverPhoto && (
            <label className="flex flex-1 items-center gap-3 text-sm">
              <span className="whitespace-nowrap text-muted-foreground">
                Darken
              </span>
              <input
                type="range"
                min={0}
                max={90}
                value={data.coverDim}
                onChange={(e) => set("coverDim", Number(e.target.value))}
                className="min-w-24 flex-1 accent-[#2ADA74]"
              />
              <span className="w-10 text-right font-mono text-xs">
                {data.coverDim}%
              </span>
            </label>
          )}
          {data.coverPhoto && (
            <label className="flex basis-full items-center gap-3 text-sm">
              <span className="w-40 whitespace-nowrap text-muted-foreground">
                Tiles &amp; panels solid
              </span>
              <input
                type="range"
                min={20}
                max={100}
                value={data.cardOpacity}
                onChange={(e) => set("cardOpacity", Number(e.target.value))}
                className="min-w-24 flex-1 accent-[#2ADA74]"
              />
              <span className="w-10 text-right font-mono text-xs">
                {data.cardOpacity}%
              </span>
            </label>
          )}
          <label className="flex basis-full items-center gap-3 text-sm">
            <span className="w-40 whitespace-nowrap text-muted-foreground">
              Chart picture opacity
            </span>
            <input
              type="range"
              min={20}
              max={100}
              value={data.chartOpacity}
              onChange={(e) => set("chartOpacity", Number(e.target.value))}
              className="min-w-24 flex-1 accent-[#2ADA74]"
            />
            <span className="w-10 text-right font-mono text-xs">
              {data.chartOpacity}%
            </span>
          </label>
          <p className="basis-full text-xs text-muted-foreground">
            Lower &quot;solid&quot; lets more of the photo show through the
            cover tiles and the slide panels. Chart pictures appear on BULLISH
            (green) and BEARISH (red) slides.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input
              value={data.titleTop}
              onChange={(e) => set("titleTop", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Title (green)">
            <input
              value={data.titleAccent}
              onChange={(e) => set("titleAccent", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Subtitle" wide>
            <input
              value={data.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Cover footer">
            <input
              value={data.footer}
              onChange={(e) => set("footer", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Swipe text (slides 2–7)">
            <input
              value={data.swipe}
              onChange={(e) => set("swipe", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Markets"
        note="Sentiment, value and change set here also update each market's own slide. Open a market for its details."
      >
        <div className="space-y-3">
          {MARKET_ORDER.map((k, i) => {
            const m = data.markets[k];
            return (
              <div
                key={k}
                className="grid items-end gap-3 rounded-xl border border-border bg-background/60 p-3 md:grid-cols-[1.2fr_1fr_1fr_auto]"
              >
                <Field label={`Card ${i + 1} name`}>
                  <input
                    value={m.name}
                    onChange={(e) => setMarket(k, { name: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Value">
                  <input
                    value={m.value}
                    onChange={(e) => setMarket(k, { value: e.target.value })}
                    className={inputCls}
                    placeholder="optional"
                  />
                </Field>
                <Field label={m.secondLabel}>
                  <input
                    value={m.change}
                    onChange={(e) => setMarket(k, { change: e.target.value })}
                    className={inputCls}
                    placeholder="optional"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => open(k)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
                >
                  Details →
                </button>
                <div className="md:col-span-4">
                  <SentimentPicker
                    value={m.sentiment}
                    onChange={(v) => setMarket(k, { sentiment: v })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

function MarketControls({
  k,
  m,
  setMarket,
}: {
  k: MarketKey;
  m: MarketItem;
  setMarket: (k: MarketKey, p: Partial<MarketItem>) => void;
}) {
  const up = (p: Partial<MarketItem>) => setMarket(k, p);
  const pts = parsePoints(m.points);
  return (
    <>
      <Panel title="Heading">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slide title">
            <input
              value={m.title}
              onChange={(e) => up({ title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Small line under the title">
            <input
              value={m.subtitle}
              onChange={(e) => up({ subtitle: e.target.value })}
              className={inputCls}
              placeholder="e.g. (WTI)"
            />
          </Field>
          <Field label="Name on the cover card">
            <input
              value={m.name}
              onChange={(e) => up({ name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Sentiment (cover + this slide)
            </span>
            <SentimentPicker
              value={m.sentiment}
              onChange={(v) => up({ sentiment: v })}
            />
          </div>
        </div>
      </Panel>

      {k === "oiBuildup" ? (
        <Panel
          title="OI change"
          note="Empty figures show as —. Nothing is filled in for you."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CE OI change (calls)">
              <input
                value={m.ceChange}
                onChange={(e) => up({ ceChange: e.target.value })}
                className={inputCls}
                placeholder="e.g. +18.6 L"
              />
            </Field>
            <Field label="PE OI change (puts)">
              <input
                value={m.peChange}
                onChange={(e) => up({ peChange: e.target.value })}
                className={inputCls}
                placeholder="e.g. +9.2 L"
              />
            </Field>
          </div>
          <div className="mt-4">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Buildup
            </span>
            <div
              className="grid grid-cols-3 gap-1.5"
              role="radiogroup"
              aria-label="Buildup"
            >
              {(
                [
                  ["CE", "CE Buildup", "#EF3340"],
                  ["PE", "PE Buildup", "#0AA66A"],
                  ["", "Not set", "#7E8F9D"],
                ] as const
              ).map(([v, label, c]) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={m.buildup === v}
                  onClick={() => up({ buildup: v })}
                  className="rounded-lg border-2 px-2 py-2 text-xs font-bold tracking-wide transition-colors"
                  style={
                    m.buildup === v
                      ? { backgroundColor: c, borderColor: c, color: "#fff" }
                      : { borderColor: `${c}66`, color: c }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Note label">
              <input
                value={m.secondLabel}
                onChange={(e) => up({ secondLabel: e.target.value })}
                className={inputCls}
                placeholder="Direction"
              />
            </Field>
            <Field label="Note (optional)">
              <input
                value={m.change}
                onChange={(e) => up({ change: e.target.value })}
                className={inputCls}
                placeholder="e.g. More Shorts"
              />
            </Field>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            ▲ / ▼ follows the sign of each OI change. The buildup card is red
            for CE and green for PE; the cover tile shows e.g. &quot;PE
            Buildup&quot;.
          </p>
        </Panel>
      ) : (
        <Panel
          title="Figures"
          note="Empty figures show as —. Nothing is filled in for you."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Value">
              <input
                value={m.value}
                onChange={(e) => up({ value: e.target.value })}
                className={inputCls}
                placeholder="e.g. 39,061.00"
              />
            </Field>
            <Field label="Note under the value (optional)">
              <input
                value={m.valueNote}
                onChange={(e) => up({ valueNote: e.target.value })}
                className={inputCls}
                placeholder="e.g. (Net OI Change)"
              />
            </Field>
            <Field label="Second label">
              <input
                value={m.secondLabel}
                onChange={(e) => up({ secondLabel: e.target.value })}
                className={inputCls}
                placeholder="Change (%)"
              />
            </Field>
            <Field label={m.secondLabel || "Second value"}>
              <input
                value={m.change}
                onChange={(e) => up({ change: e.target.value })}
                className={inputCls}
                placeholder={
                  /%|change/i.test(m.secondLabel)
                    ? "e.g. +1.23%"
                    : "e.g. More Shorts"
                }
              />
            </Field>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            A change % is coloured by its sign (+ green ▲, − red ▼). Any other
            second value uses the sentiment colour.
          </p>
        </Panel>
      )}

      {k !== "oiBuildup" && (
        <Panel title="Chart">
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                ["auto", "Trend by sentiment"],
                ["points", "Plot my values"],
                ["off", "No chart"],
              ] as const
            ).map(([mode, text]) => (
              <button
                key={mode}
                type="button"
                onClick={() => up({ chart: mode })}
                className={cn(
                  "rounded-lg border-2 px-2 py-2 text-xs font-semibold transition-colors",
                  m.chart === mode
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary",
                )}
              >
                {text}
              </button>
            ))}
          </div>
          {m.chart === "auto" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Decorative, not real price data: BULLISH shows the green chart
              picture, BEARISH the red one, NEUTRAL a flat drawn line.
            </p>
          )}
          {m.chart === "points" && (
            <div className="mt-3">
              <Field label="Values to plot (oldest first, separated by commas or spaces)">
                <textarea
                  rows={3}
                  value={m.points}
                  onChange={(e) => up({ points: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. 38,610 38,720 38,690 38,905 39,061"
                />
              </Field>
              <p
                className={cn(
                  "mt-1 text-xs",
                  pts.length >= 2 ? "text-muted-foreground" : "text-amber-700",
                )}
              >
                {pts.length >= 2
                  ? `${pts.length} values plotted.`
                  : "Add at least 2 values to draw the chart."}
              </p>
            </div>
          )}
        </Panel>
      )}

      <Panel title="Description">
        <textarea
          rows={4}
          value={m.description}
          onChange={(e) => up({ description: e.target.value })}
          className={inputCls}
          placeholder="Your commentary for this market, e.g. what moved it and what to watch."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {m.description.length} characters. Keep it to about 3 lines ({"≈"}150
          characters) so it stays readable.
        </p>
      </Panel>
    </>
  );
}

/* ---------------- small UI ---------------- */

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
    <section className="rounded-2xl border border-border bg-card p-5 card-elevated">
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

function SentimentPicker({
  value,
  onChange,
}: {
  value: Sentiment;
  onChange: (v: Sentiment) => void;
}) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5"
      role="radiogroup"
      aria-label="Sentiment"
    >
      {(Object.keys(SENTIMENT) as Sentiment[]).map((s) => {
        const on = s === value;
        const c = SENTIMENT[s].color;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s)}
            className="whitespace-nowrap rounded-lg border-2 px-2 py-1.5 text-xs font-bold tracking-wide transition-colors"
            style={
              on
                ? { backgroundColor: c, borderColor: c, color: "#071422" }
                : { borderColor: `${c}66`, color: c }
            }
          >
            {SENTIMENT[s].mark} {s}
          </button>
        );
      })}
    </div>
  );
}
