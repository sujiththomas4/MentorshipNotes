import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { BV_VARIANTS } from "@/branding/bethlehem-valley";
import { cn } from "@/lib/utils";
import { Check, Field, JsonButtons, LogoPicker, Panel, PositionPad, PreviewCard, Seg, btn, inputCls, useStoredPost } from "../editor-kit";
import { BrandTitlePanel } from "../brand-title";
import { ImagePicker } from "../image-library";
import { BV_FORMATS, ICON_NAMES, bvFileBase, fitMessage, type BvFormat, type FitResult } from "../shared";
import { AGRI_ICON_NAMES, AgriIcon, AgriPromoArtwork } from "./artwork";
import {
  BENEFIT_PRESETS,
  LOGO_SIZE,
  MAX_BENEFITS,
  MIN_BENEFITS,
  NAME_SHIFT,
  ZOOM_MAX,
  ZOOM_MIN,
  mergeData,
  sampleData,
  type AgriBenefit,
  type AgriFooterItem,
  type AgriPromoData,
  type NamePos,
  type PhotoFit,
} from "./data";

const STORE_KEY = "social:Instagram_BV_AgriPromo";
/** tile for "no logo" in the logo picker */
const NO_LOGO = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="30" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#fff">NAME</text><text x="32" y="44" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#fff">ONLY</text></svg>');

function AgriIconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0B6B35] text-white">
        <AgriIcon name={value} className="h-5 w-5" />
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <optgroup label="Agri poster">
          {Object.entries(AGRI_ICON_NAMES).map(([k, n]) => (
            <option key={k} value={k}>
              {n}
            </option>
          ))}
        </optgroup>
        <optgroup label="Icon pack">
          {Object.entries(ICON_NAMES).map(([k, n]) => (
            <option key={k} value={k}>
              {n}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

export function AgriPromoEditor() {
  const { data, setData, set } = useStoredPost<AgriPromoData>(STORE_KEY, sampleData, mergeData);
  const [fit, setFit] = useState<FitResult | null>(null);
  const [msg, setMsg] = useState("");
  const fitMsg = fitMessage(fit);

  const text = (k: "headline1" | "headline2" | "headline3" | "cta" | "bannerEyebrow" | "bannerTitle" | "bannerSubtitle" | "category", label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={data[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} />
    </Field>
  );
  /** fit, zoom and the 2-D position pad for one photo */
  const photoControls = (p: "hero" | "secondary", aspect: number) => {
    const src = data[p];
    const fitKey = `${p}Fit` as const;
    const zoomKey = `${p}Zoom` as const;
    const xKey = `${p}X` as const;
    const yKey = `${p}Y` as const;
    if (!src) return null;
    return (
      <div className="space-y-3 rounded-xl border border-border p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[260px] flex-1">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Fit</p>
            <Seg<PhotoFit>
              value={data[fitKey]}
              onChange={(v) => set(fitKey, v)}
              options={[
                ["cover", "Full cover (crop)"],
                ["contain", "Fit (whole photo)"],
              ]}
            />
          </div>
          <button type="button" onClick={() => setData((d) => ({ ...d, [zoomKey]: 100, [xKey]: 50, [yKey]: 50 }))} className={btn}>
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
        <Field label={`Zoom (${data[zoomKey]}%)`}>
          <div className="flex items-center gap-2">
            <input type="range" min={ZOOM_MIN} max={ZOOM_MAX} value={data[zoomKey]} onChange={(e) => set(zoomKey, Number(e.target.value))} className="w-full accent-[#0B6B35]" />
            <button type="button" onClick={() => set(zoomKey, 100)} className={cn(btn, "shrink-0 px-2 py-1 text-xs")}>
              100%
            </button>
          </div>
        </Field>
        <PositionPad
          label="Photo position"
          image={src}
          aspect={aspect}
          x={data[xKey]}
          y={data[yKey]}
          onChange={(x, y) => setData((d) => ({ ...d, [xKey]: x, [yKey]: y }))}
          onCenter={() => setData((d) => ({ ...d, [xKey]: 50, [yKey]: 50 }))}
        />
      </div>
    );
  };
  const setBenefit = (i: number, p: Partial<AgriBenefit>) => set("benefits", data.benefits.map((b, j) => (j === i ? { ...b, ...p } : b)));
  const moveBenefit = (i: number, by: number) => {
    const list = [...data.benefits];
    [list[i], list[i + by]] = [list[i + by], list[i]];
    set("benefits", list);
  };
  const setFooter = (i: number, p: Partial<AgriFooterItem>) => set("footer", data.footer.map((f, j) => (j === i ? { ...f, ...p } : f)));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <JsonButtons data={data} fileBase={bvFileBase(data.category, data.format)} onOpen={(raw) => setData(mergeData(raw))} onMsg={setMsg} check={(raw) => "headline1" in raw} />
          <button
            type="button"
            onClick={() => confirm("Replace everything with the sample poster?") && (setData(sampleData()), setMsg("Reset to the sample poster."))}
            className={cn(btn, "text-muted-foreground")}
          >
            <RotateCcw className="h-4 w-4" /> Reset to sample poster
          </button>
        </div>

        <Panel title="Format & layout" note="Story keeps the same zones and spreads the right column over the extra height.">
          <Seg<BvFormat>
            value={data.format}
            onChange={(v) => set("format", v)}
            options={[
              ["feed", BV_FORMATS.feed.label],
              ["story", BV_FORMATS.story.label],
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            <Check checked={data.showLogo} onChange={(v) => set("showLogo", v)}>
              Logo
            </Check>
            <Check checked={data.showCta} onChange={(v) => set("showCta", v)}>
              Button
            </Check>
            <Check checked={data.showBanner} onChange={(v) => set("showBanner", v)}>
              Green banner
            </Check>
            <Check checked={data.showSecondary} onChange={(v) => set("showSecondary", v)}>
              Round photo
            </Check>
            <Check checked={data.showFooter} onChange={(v) => set("showFooter", v)}>
              Footer band
            </Check>
          </div>
        </Panel>

        <Panel title="Headline & text" note="Line 2 is the green accent line. Long lines shrink to fit; press Enter in the description for a line break.">
          <div className="grid gap-4 sm:grid-cols-3">
            {text("headline1", "Headline line 1")}
            {text("headline2", "Line 2 (green)")}
            {text("headline3", "Line 3")}
          </div>
          <div className="mt-4">
            <Field label="Description">
              <textarea value={data.description} onChange={(e) => set("description", e.target.value)} rows={3} className={cn(inputCls, "resize-y leading-relaxed")} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("cta", "Button text", "e.g. Get Started, Call Now, Order Today")}
            {text("category", "File name topic", "Used for the PNG / JSON file name only")}
          </div>
          {fitMsg && <p className={cn("mt-3 rounded-lg px-3 py-2 text-sm", fitMsg.warn ? "bg-amber-50 text-amber-900" : "bg-secondary text-muted-foreground")}>{fitMsg.text}</p>}
        </Panel>

        <Panel title="Green banner" note="Small line, big title, small line with lime rules.">
          <div className="grid gap-4 sm:grid-cols-3">
            {text("bannerEyebrow", "Top line")}
            {text("bannerTitle", "Title")}
            {text("bannerSubtitle", "Bottom line")}
          </div>
        </Panel>

        <Panel title="Photos" note="Pick from the image library, upload one, or add it to the library for every post.">
          <div className="space-y-4">
            <Field label="Hero photo (left)">
              <ImagePicker value={data.hero} onChange={(v) => set("hero", v)} onMsg={setMsg} label="Hero photo" />
            </Field>
            {photoControls("hero", 560 / 1210)}
            <Field label="Round photo (bottom left)">
              <ImagePicker value={data.secondary} onChange={(v) => set("secondary", v)} onMsg={setMsg} label="Round photo" />
            </Field>
            {photoControls("secondary", 1)}
          </div>
        </Panel>

        <Panel title="Benefits" note={`${MIN_BENEFITS}–${MAX_BENEFITS} rows with an icon, a title and a short line.`}>
          <Field label="Quick fill for a business (replaces the titles and icons)">
            <select
              value=""
              onChange={(e) => {
                const p = BENEFIT_PRESETS.find((x) => x.id === e.target.value);
                if (!p) return;
                set(
                  "benefits",
                  p.items.map(([icon, title], i) => ({ icon, title, text: data.benefits[i]?.text ?? "" })),
                );
                setMsg(`Benefits set for ${p.label}. Check the short lines under each title.`);
              }}
              className={inputCls}
            >
              <option value="">Choose a business…</option>
              {BENEFIT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="mt-4 space-y-3">
            {data.benefits.map((b, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Benefit {i + 1}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveBenefit(i, -1)} disabled={i === 0} className={cn(btn, "px-2 py-1")} aria-label="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveBenefit(i, 1)} disabled={i === data.benefits.length - 1} className={cn(btn, "px-2 py-1")} aria-label="Move down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => set("benefits", data.benefits.filter((_, j) => j !== i))}
                      disabled={data.benefits.length <= MIN_BENEFITS}
                      className={cn(btn, "px-2 py-1 text-muted-foreground")}
                      aria-label="Remove benefit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <Field label="Icon">
                    <AgriIconSelect value={b.icon} onChange={(v) => setBenefit(i, { icon: v })} />
                  </Field>
                  <Field label="Title">
                    <input value={b.title} onChange={(e) => setBenefit(i, { title: e.target.value })} className={inputCls} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Short line">
                      <input value={b.text} onChange={(e) => setBenefit(i, { text: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set("benefits", [...data.benefits, { icon: "leaf", title: "", text: "" }])} disabled={data.benefits.length >= MAX_BENEFITS} className={cn(btn, "mt-3")}>
            <Plus className="h-4 w-4" /> Add benefit
          </button>
        </Panel>

        <Panel title="Footer band" note="Five icons with a label each (Enter = second line).">
          <div className="grid gap-3 lg:grid-cols-2">
            {data.footer.map((f, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
                <Field label={`Icon ${i + 1}`}>
                  <AgriIconSelect value={f.icon} onChange={(v) => setFooter(i, { icon: v })} />
                </Field>
                <Field label="Label">
                  <textarea value={f.label} onChange={(e) => setFooter(i, { label: e.target.value })} rows={2} className={cn(inputCls, "resize-none leading-snug")} />
                </Field>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Logo" note="The two-leaf mark, a logo from Branding → Bethlehem Valley, or none (name only). The logo and name sit top right.">
          <LogoPicker
            options={[
              { v: -1, src: NO_LOGO, label: "No logo (name only)" },
              { v: 0, src: "/social/instagram/bethlehem-valley/agri/leaf-mark.svg", label: "Leaf mark" },
              ...BV_VARIANTS.map((v) => ({ v: v.n, src: v.web, label: `Logo variant ${v.n}` })),
            ]}
            value={data.logo}
            onChange={(v) => set("logo", v)}
          />
          {data.logo >= 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end">
              <Field label={`Logo size (${data.logoSize}px)`}>
                <input type="range" min={LOGO_SIZE.min} max={LOGO_SIZE.max} value={data.logoSize} onChange={(e) => set("logoSize", Number(e.target.value))} className="w-full accent-[#0B6B35]" />
              </Field>
              {data.logo > 0 && (
                <Check checked={data.logoPlate} onChange={(v) => set("logoPlate", v)}>
                  Dark plate behind the logo
                </Check>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Farm name position" note="Where the name sits next to the logo, then nudge it anywhere with the pad.">
          <Seg<NamePos>
            value={data.namePos}
            onChange={(v) => set("namePos", v)}
            options={[
              ["left", "Left of logo"],
              ["right", "Right of logo"],
              ["top", "Above"],
              ["bottom", "Below"],
            ]}
          />
          <div className="mt-4">
            <PositionPad
              label="Nudge the name"
              aspect={3 / 2}
              x={Math.round(((data.nameX + NAME_SHIFT.x) / (2 * NAME_SHIFT.x)) * 100)}
              y={Math.round(((data.nameY + NAME_SHIFT.y) / (2 * NAME_SHIFT.y)) * 100)}
              onChange={(x, y) => setData((d) => ({ ...d, nameX: Math.round((x / 100) * 2 * NAME_SHIFT.x - NAME_SHIFT.x), nameY: Math.round((y / 100) * 2 * NAME_SHIFT.y - NAME_SHIFT.y) }))}
              onCenter={() => setData((d) => ({ ...d, nameX: 0, nameY: 0 }))}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Centre of the pad = the normal spot. Moved {data.nameX}px across, {data.nameY}px down.
            </p>
          </div>
        </Panel>

        <BrandTitlePanel data={data} set={set} />
      </div>

      <PreviewCard data={data} msg={msg} onMsg={setMsg} render={(ref) => <AgriPromoArtwork ref={ref} data={data} onFit={setFit} />} />
    </div>
  );
}
