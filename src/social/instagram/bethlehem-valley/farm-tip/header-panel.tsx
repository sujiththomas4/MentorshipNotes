import type { ReactNode } from "react";
import { BV_EMBLEM_VARIANT, BV_VARIANTS } from "@/branding/bethlehem-valley";
import { cn } from "@/lib/utils";
import { Check, Field, LogoPicker, Panel, Seg, inputCls, type Setter } from "../editor-kit";
import { ImagePicker } from "../image-library";
import { BV_EMBLEM, BV_PEPPER } from "./artwork";
import type { BvLook, HeaderStyle } from "./data";

/** Header settings (style, logo, header photo, brand name, slogan): Farm Tip and multi-page posts. */
export function HeaderPanel<T extends BvLook>({ data, set, onMsg, title = "Header", children }: { data: T; set: Setter<T>; onMsg: (s: string) => void; title?: string; children?: ReactNode }) {
  const style = data.headerStyle;
  return (
    <Panel title={title} note="Centered: photo + emblem + script slogan. Classic: logo, name and slogan in a row. Compact: a shorter band.">
      <Seg<HeaderStyle>
        value={style}
        onChange={(v) => set("headerStyle", v as T["headerStyle"])}
        options={[
          ["centered", "Centered"],
          ["classic", "Classic"],
          ["compact", "Compact"],
        ]}
      />
      <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Logo</p>
      <LogoPicker<BvLook["headerLogo"]>
        options={[{ v: "emblem", src: BV_EMBLEM, label: "Round emblem" }, ...BV_VARIANTS.filter((v) => v.n !== BV_EMBLEM_VARIANT).map((v) => ({ v: v.n, src: v.web, label: `Badge logo ${v.n}` }))]}
        value={data.headerLogo}
        onChange={(v) => set("headerLogo", v as T["headerLogo"])}
      />
      {style === "centered" && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Header photo, top left: pick the crop or topic of this post (pepper, ginger …)</p>
          <ImagePicker
            label="Top-left photo"
            value={data.headerPhoto === "none" ? null : data.headerPhoto === "default" || !data.headerPhoto ? BV_PEPPER : data.headerPhoto}
            onChange={(src) => set("headerPhoto", (src === null ? "none" : src === BV_PEPPER ? "default" : src) as T["headerPhoto"])}
            onMsg={onMsg}
          />
          <div className="mt-5">
            <Check
              checked={data.showHeaderPhotoRight && !!data.headerPhotoRight}
              onChange={(v) => {
                if (v && !data.headerPhotoRight) return onMsg("Pick or upload a photo for the top right first (e.g. cow & hen).");
                set("showHeaderPhotoRight", v as T["showHeaderPhotoRight"]);
              }}
            >
              Header photo, top right (e.g. cow & hen)
            </Check>
            <div className="mt-2">
              <ImagePicker
                label="Top-right photo"
                value={data.headerPhotoRight || null}
                onChange={(src) => {
                  set("headerPhotoRight", (src ?? "") as T["headerPhotoRight"]);
                  set("showHeaderPhotoRight", !!src as T["showHeaderPhotoRight"]);
                }}
                onMsg={onMsg}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Both photos fade into the header; the slogan stays on top with a soft shadow. Upload… adds a picture on the fly: keep “Save to the image library” ticked to reuse it in any post.
          </p>
        </div>
      )}
      {style !== "centered" && <p className="mt-3 text-xs text-muted-foreground">Header photos (left and right) show with the Centered style.</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Brand name" hint="Leave empty to show a bigger logo.">
          <input value={data.brandName} onChange={(e) => set("brandName", e.target.value as T["brandName"])} className={inputCls} />
        </Field>
        <Field label="Tagline">
          <input value={data.tagline} onChange={(e) => set("tagline", e.target.value as T["tagline"])} className={inputCls} />
        </Field>
      </div>
      <div className="mt-4">
        <Check checked={data.showSlogan} onChange={(v) => set("showSlogan", v as T["showSlogan"])}>
          Show slogan
        </Check>
      </div>
      {data.showSlogan && (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Slogan" hint="Enter = new line (centered). Classic shows one line, compact two.">
            <textarea value={data.slogan} onChange={(e) => set("slogan", e.target.value as T["slogan"])} rows={4} className={cn(inputCls, "resize-y")} />
          </Field>
          {style === "classic" && (
            <Field label="Slogan small text" hint="Classic header only.">
              <input value={data.sloganSmall} onChange={(e) => set("sloganSmall", e.target.value as T["sloganSmall"])} className={inputCls} />
            </Field>
          )}
        </div>
      )}
      {children}
    </Panel>
  );
}
