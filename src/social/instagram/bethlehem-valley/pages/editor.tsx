import { useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  BookOpen,
  ChevronLeft,
  CopyCheck,
  Eye,
  EyeOff,
  FlaskConical,
  UserPlus,
  Smile,
  Lightbulb,
  ChevronRight,
  Copy,
  Download,
  Images,
  ListChecks,
  Loader2,
  Megaphone,
  Plus,
  RotateCcw,
  Sprout,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { saveAllBlobs } from "@/social/export";
import { VideoDownload } from "@/social/video-ui";
import { cn } from "@/lib/utils";
import {
  Check,
  FeaturesPanel,
  Field,
  FormatPanel,
  IconSelect,
  ImageButton,
  JsonButtons,
  LogoPicker,
  Panel,
  PhotoPanel,
  Seg,
  TextPanel,
  TopicPanel,
  btn,
  inputCls,
  useStoredPost,
  type Setter,
} from "../editor-kit";
import { BV_EMBLEM_VARIANT, BV_VARIANTS } from "@/branding/bethlehem-valley";
import { BV_EMBLEM } from "../farm-tip/artwork";
import { HeaderPanel } from "../farm-tip/header-panel";
import {
  BV_FORMATS,
  BvIcon,
  Scaled,
  bvFileBase,
  bvPngBlob,
  downloadBvPng,
  fitMessage,
  type FitResult,
} from "../shared";
import { BvPageArtwork } from "./artwork";
import { ToonCoverEditor, ToonIdeaEditor } from "./toon-editor";
import {
  MAX_ADVANTAGES,
  MAX_COVERS,
  MAX_DOSAGE,
  MAX_PERKS,
  FOLLOW_ACTION_ICONS,
  MAX_GUIDE_ITEMS,
  GUIDE_CONTENT_KEYS,
  GUIDE_SECTIONS,
  MAX_FEATURES,
  MAX_HIGHLIGHTS,
  MAX_PAGES,
  MAX_STEPS,
  PAGE_KINDS,
  PRESETS,
  convertPage,
  duplicatePage,
  mergePages,
  newPage,
  pagesSlug,
  type BvPage,
  type CoverItem,
  type CoverPage,
  type GuidePage,
  type FollowPage,
  type GuideTone,
  type FeatureItem,
  type FeaturesPage,
  type ListItem,
  type ListStyle,
  type PageKind,
  type PagesData,
  type PagesLook,
  type PhotoSize,
  type PresetId,
  type PromoPage,
  type StepsPage,
  type TipPage,
} from "./data";

const STORE_KEYS: Record<PresetId, string> = {
  steps: "social:Instagram_BV_StepByStep",
  promo: "social:Instagram_BV_Promotion",
  features: "social:Instagram_BV_Features",
  cover: "social:Instagram_BV_Cover",
  pesticide: "social:Instagram_BV_PesticideGuide",
  welcome: "social:Instagram_BV_Welcome",
  toon: "social:Instagram_BV_Caricature",
};

const KIND_ICON: Record<PageKind, ReactNode> = {
  tip: <Sprout className="h-4 w-4" />,
  steps: <ListChecks className="h-4 w-4" />,
  promo: <Megaphone className="h-4 w-4" />,
  features: <BadgeCheck className="h-4 w-4" />,
  cover: <BookOpen className="h-4 w-4" />,
  guide: <FlaskConical className="h-4 w-4" />,
  follow: <UserPlus className="h-4 w-4" />,
  toonCover: <Smile className="h-4 w-4" />,
  toonIdea: <Lightbulb className="h-4 w-4" />,
};
const kindLabel = (k: PageKind) => PAGE_KINDS.find((x) => x.kind === k)!.label;

/** Multi-page Bethlehem Valley post: pages of any template, one shared look. */
export function BvPagesEditor({ preset }: { preset: PresetId }) {
  const init = PRESETS[preset];
  const { data, setData } = useStoredPost<PagesData>(
    STORE_KEYS[preset],
    init,
    (raw) => mergePages(raw, init),
  );
  const [selId, setSelId] = useState<string | null>(null);
  const [fits, setFits] = useState<Record<string, FitResult>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const mainRef = useRef<HTMLDivElement>(null);

  const { look, pages } = data;
  const sel = pages.find((p) => p.id === selId) ?? pages[0];
  const idx = pages.indexOf(sel);
  const size = BV_FORMATS[look.format];
  const total = pages.length;
  const folder = bvFileBase(pagesSlug(data), look.format);

  const setLook: Setter<PagesLook> = (k, v) =>
    setData((d) => ({ ...d, look: { ...d.look, [k]: v } }));
  const patchPage = (id: string, patch: Partial<BvPage>) =>
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === id ? ({ ...p, ...patch } as BvPage) : p,
      ),
    }));
  const setterFor =
    <T extends BvPage>(p: T): Setter<T> =>
    (k, v) =>
      patchPage(p.id, { [k]: v } as Partial<BvPage>);
  const fitFor = (id: string) => (r: FitResult) =>
    setFits((f) =>
      f[id]?.k === r.k && f[id]?.overflow === r.overflow
        ? f
        : { ...f, [id]: r },
    );

  function addPage(kind: PageKind) {
    if (total >= MAX_PAGES)
      return setMsg(
        `At most ${MAX_PAGES} pages (Instagram's carousel limit is 20, but keep it short).`,
      );
    const p = newPage(kind);
    setData((d) => ({
      ...d,
      pages: [...d.pages.slice(0, idx + 1), p, ...d.pages.slice(idx + 1)],
    }));
    setSelId(p.id);
    setMsg(`Added page ${idx + 2}: ${kindLabel(kind)}.`);
  }
  function move(dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= total) return;
    setData((d) => {
      const ps = [...d.pages];
      [ps[idx], ps[j]] = [ps[j], ps[idx]];
      return { ...d, pages: ps };
    });
  }
  function duplicate() {
    if (total >= MAX_PAGES) return setMsg(`At most ${MAX_PAGES} pages.`);
    const p = duplicatePage(sel);
    setData((d) => ({
      ...d,
      pages: [...d.pages.slice(0, idx + 1), p, ...d.pages.slice(idx + 1)],
    }));
    setSelId(p.id);
  }
  function remove() {
    if (
      total <= 1 ||
      !confirm(`Delete page ${idx + 1} (${kindLabel(sel.kind)})?`)
    )
      return;
    setData((d) => ({ ...d, pages: d.pages.filter((p) => p.id !== sel.id) }));
    setSelId(pages[idx + 1]?.id ?? pages[idx - 1]?.id ?? null);
  }

  const pageFile = (i: number, p: BvPage) =>
    `page-${String(i + 1).padStart(2, "0")}_${p.kind}.png`;
  async function downloadOne() {
    if (!mainRef.current) return;
    setBusy(true);
    setMsg("Creating PNG…");
    try {
      await downloadBvPng(
        mainRef.current,
        size.w,
        size.h,
        `${folder}_${pageFile(idx, sel)}`,
      );
      setMsg(`Saved page ${idx + 1} (${size.w} × ${size.h}).`);
    } catch (e) {
      setMsg(
        `Couldn't create the PNG: ${e instanceof Error ? e.message : "export failed"}.`,
      );
    } finally {
      setBusy(false);
    }
  }
  async function downloadAll() {
    setBusy(true);
    setMsg(`Creating ${total} PNGs…`);
    try {
      const how = await saveAllBlobs(
        pages.map((p, i) => ({
          filename: pageFile(i, p),
          blob: () => {
            const node = nodes.current.get(p.id);
            if (!node) throw new Error(`page ${i + 1} is not ready`);
            return bvPngBlob(node, size.w, size.h);
          },
        })),
        folder,
      );
      setMsg(
        how === "cancelled"
          ? "Cancelled."
          : how === "folder"
            ? `Saved ${total} pages into the folder "${folder}".`
            : `Downloaded ${total} pages.`,
      );
    } catch (e) {
      setMsg(
        `Couldn't save the pages: ${e instanceof Error ? e.message : "export failed"}.`,
      );
    } finally {
      setBusy(false);
    }
  }

  const fm = fitMessage(fits[sel.id] ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <JsonButtons
          data={{ template: `bv-pages-${preset}`, ...data }}
          fileBase={folder}
          check={(raw) => Array.isArray(raw.pages)}
          onOpen={(raw) => (setData(mergePages(raw, init)), setSelId(null))}
          onMsg={setMsg}
        />
        <button
          type="button"
          onClick={() =>
            confirm(
              "Start over? All pages are replaced with the template's first page.",
            ) && (setData(init()), setSelId(null), setMsg("Started over."))
          }
          className={cn(btn, "text-muted-foreground")}
        >
          <RotateCcw className="h-4 w-4" /> Start over
        </button>
      </div>

      {/* pages + editing on the left, the live preview on the right from the top */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        <div className="min-w-0 space-y-6">
          {/* ---------- page strip ---------- */}
          <section className="card-elevated rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg font-semibold">
                Pages{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({total} / {MAX_PAGES})
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Each page is one image of the carousel. Click a page to edit it;
                each page can use any template.
              </p>
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {pages.map((p, i) => (
                <div
                  key={p.id}
                  className="w-[118px] shrink-0"
                  {...(i === 0 ? { "data-plan-preview": "" } : {})}
                >
                  <button
                    type="button"
                    onClick={() => setSelId(p.id)}
                    aria-label={`Page ${i + 1}: ${kindLabel(p.kind)}`}
                    aria-pressed={p.id === sel.id}
                    className={cn(
                      "block w-full rounded-lg ring-2 ring-offset-2 ring-offset-card transition",
                      p.id === sel.id
                        ? "ring-[#D8AA35]"
                        : "ring-transparent hover:ring-border",
                    )}
                  >
                    <Scaled w={size.w} h={size.h} className="rounded-lg">
                      <BvPageArtwork
                        ref={(el) => {
                          if (el) nodes.current.set(p.id, el);
                          else nodes.current.delete(p.id);
                        }}
                        look={look}
                        page={p}
                        n={i + 1}
                        total={total}
                        onFit={fitFor(p.id)}
                      />
                    </Scaled>
                  </button>
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs">
                    <b>{i + 1}</b>
                    <span className="text-muted-foreground">
                      · {kindLabel(p.kind)}
                    </span>
                    {fits[p.id]?.overflow && (
                      <TriangleAlert
                        className="h-3.5 w-3.5 text-amber-600"
                        aria-label="text too long"
                      />
                    )}
                  </p>
                </div>
              ))}
            </div>
            {total < MAX_PAGES && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-border p-3">
                <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" /> Add page after {idx + 1}:
                </span>
                {PAGE_KINDS.map((k) => (
                  <button
                    key={k.kind}
                    type="button"
                    onClick={() => addPage(k.kind)}
                    title={k.note}
                    className={cn(btn, "px-2.5 py-1.5 text-xs")}
                  >
                    {KIND_ICON[k.kind]} {k.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <span className="font-display font-semibold">Page {idx + 1}</span>
              <div className="flex min-w-[260px] items-center gap-2">
                <span className="text-sm text-muted-foreground">Template</span>
                <span className="text-[#0A3A20]">{KIND_ICON[sel.kind]}</span>
                <select
                  value={sel.kind}
                  onChange={(e) => {
                    const k = e.target.value as PageKind;
                    setData((d) => ({
                      ...d,
                      pages: d.pages.map((p) =>
                        p.id === sel.id ? convertPage(p, k) : p,
                      ),
                    }));
                  }}
                  aria-label={`Template of page ${idx + 1}`}
                  className={cn(inputCls, "w-auto min-w-[220px] font-semibold")}
                >
                  {PAGE_KINDS.map((k) => (
                    <option key={k.kind} value={k.kind}>
                      {k.label}: {k.note}
                    </option>
                  ))}
                </select>
              </div>
              <Check
                checked={sel.smallHeader}
                onChange={(v) => patchPage(sel.id, { smallHeader: v })}
              >
                Small header
              </Check>
              <span className="flex-1" />
              <div className="flex flex-wrap gap-1.5">
                <IconBtn
                  label="Move left"
                  onClick={() => move(-1)}
                  disabled={idx === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </IconBtn>
                <IconBtn
                  label="Move right"
                  onClick={() => move(1)}
                  disabled={idx === total - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </IconBtn>
                <IconBtn
                  label="Duplicate page"
                  onClick={duplicate}
                  disabled={total >= MAX_PAGES}
                >
                  <Copy className="h-4 w-4" />
                </IconBtn>
                <IconBtn
                  label="Delete page"
                  onClick={remove}
                  disabled={total <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </div>
          </section>
          <FormatPanel data={look} set={setLook} note="Applies to all pages." />
          {sel.kind === "tip" && (
            <TipPageEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "steps" && (
            <StepsPageEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "promo" && (
            <PromoPageEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "features" && (
            <FeaturesPageEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "cover" && (
            <CoverPageEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "toonCover" && (
            <ToonCoverEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "toonIdea" && (
            <ToonIdeaEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "follow" && (
            <FollowPageEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
            />
          )}
          {sel.kind === "guide" && (
            <GuidePageEditor
              key={sel.id}
              p={sel}
              set={setterFor(sel)}
              onMsg={setMsg}
              others={
                pages.filter((x) => x.kind === "guide" && x.id !== sel.id)
                  .length
              }
              onCopyToAll={() => {
                const src = sel as GuidePage;
                const patch = Object.fromEntries(
                  GUIDE_CONTENT_KEYS.map((k) => [k, structuredClone(src[k])]),
                );
                setData((d) => ({
                  ...d,
                  pages: d.pages.map((x) =>
                    x.kind === "guide" && x.id !== src.id
                      ? ({ ...x, ...patch } as BvPage)
                      : x,
                  ),
                }));
                setMsg(
                  "Product details copied to the other guide pages (their shown sections are unchanged).",
                );
              }}
            />
          )}

          <div className="flex items-center gap-3 pt-2">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              All pages
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <HeaderPanel
            data={look}
            set={setLook}
            onMsg={setMsg}
            title="Header (all pages)"
          />
          <Panel title="Footer (all pages)">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram handle (optional)">
                <input
                  value={look.handle}
                  onChange={(e) => setLook("handle", e.target.value)}
                  placeholder="@bethlehemvalley"
                  className={inputCls}
                />
              </Field>
              <Field label="Follow text">
                <input
                  value={look.follow}
                  onChange={(e) => setLook("follow", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Check
                checked={look.pageNumbers}
                onChange={(v) => setLook("pageNumbers", v)}
              >
                Page numbers (2/5 ›) in the footer
              </Check>
            </div>
          </Panel>
        </div>

        {/* ---------- preview ---------- */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="card-elevated rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <IconBtn
                  label="Previous page"
                  onClick={() => setSelId(pages[idx - 1]?.id ?? sel.id)}
                  disabled={idx === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </IconBtn>
                <p className="px-1 font-display font-semibold">
                  Page {idx + 1} of {total}
                </p>
                <IconBtn
                  label="Next page"
                  onClick={() => setSelId(pages[idx + 1]?.id ?? sel.id)}
                  disabled={idx === total - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </IconBtn>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                {size.w} × {size.h}
              </span>
            </div>
            <div
              className={cn(
                "mx-auto",
                look.format === "story" && "max-w-[380px]",
              )}
            >
              <Scaled w={size.w} h={size.h} className="rounded-lg shadow-lg">
                <BvPageArtwork
                  ref={mainRef}
                  look={look}
                  page={sel}
                  n={idx + 1}
                  total={total}
                />
              </Scaled>
            </div>
            {fm && (
              <p
                className={cn(
                  "mt-3 rounded-lg px-3 py-2 text-sm",
                  fm.warn
                    ? "bg-amber-50 text-amber-900"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {fm.text}
              </p>
            )}
            <button
              type="button"
              onClick={downloadAll}
              disabled={busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A3A20] px-4 py-3 font-display font-bold text-white shadow hover:brightness-110 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Images className="h-5 w-5" />
              )}
              Download all {total} {total === 1 ? "page" : "pages"}
            </button>
            <button
              type="button"
              onClick={downloadOne}
              disabled={busy}
              className={cn(btn, "mt-2 w-full justify-center py-2.5")}
            >
              <Download className="h-4 w-4" /> Download page {idx + 1} only
            </button>
            <VideoDownload
              getPng={async () => {
                if (!mainRef.current) throw new Error("preview not ready");
                return bvPngBlob(mainRef.current, size.w, size.h);
              }}
              fileBase={`${folder}_${pageFile(idx, sel).replace(/.png$/, "")}`}
              w={size.w}
              h={size.h}
              onMsg={setMsg}
            />
            {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Every page exports at exactly {size.w} × {size.h} px, named
              page-01, page-02… In Chrome / Edge you pick a folder once and the
              pages go into a sub-folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-border bg-card p-2 hover:bg-secondary disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* ---------- per-template page editors ---------- */

type PageEditorProps<T> = { p: T; set: Setter<T>; onMsg: (s: string) => void };

function TipPageEditor({ p, set, onMsg }: PageEditorProps<TipPage>) {
  return (
    <>
      <TopicPanel data={p} set={set} metaHint="e.g. 25 Sep or Tip #12" />
      <TextPanel data={p} set={set} fit={null} />
      <PhotoPanel data={p} set={set} removeLabel="Remove photo" onMsg={onMsg}>
        <Check checked={p.decorLeaves} onChange={(v) => set("decorLeaves", v)}>
          Leaf decoration on the photo
        </Check>
      </PhotoPanel>
      <FeaturesPanel data={p} set={set} />
      <Panel
        title="Bottom"
        note="The landscape band and closing line show on the story format only."
      >
        <Check
          checked={p.showLandscape}
          onChange={(v) => set("showLandscape", v)}
        >
          Landscape with closing line
        </Check>
        {p.showLandscape && (
          <div className="mt-3 flex flex-wrap gap-2">
            <ImageButton
              label="Choose landscape"
              onImage={(src, name) => (
                set("landscape", src),
                onMsg(`Landscape: ${name}`)
              )}
            />
            <button
              type="button"
              onClick={() => set("landscape", "default")}
              className={cn(
                btn,
                p.landscape === "default" && "border-[#D8AA35] bg-[#D8AA35]/10",
              )}
            >
              Default landscape
            </button>
          </div>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Closing line (English)">
            <input
              value={p.growEn}
              onChange={(e) => set("growEn", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Closing line (Malayalam)">
            <input
              value={p.growMl}
              onChange={(e) => set("growMl", e.target.value)}
              lang="ml"
              className={inputCls}
            />
          </Field>
        </div>
      </Panel>
    </>
  );
}

function StepsPageEditor({ p, set, onMsg }: PageEditorProps<StepsPage>) {
  return (
    <>
      <TopicPanel data={p} set={set} metaHint="e.g. Part 1 of 2" />
      <TextPanel
        data={p}
        set={set}
        fit={null}
        labels={[
          "English heading",
          "Malayalam heading",
          "Intro, English (optional)",
          "Intro, Malayalam (optional)",
        ]}
      />
      <Panel
        title="Steps / bullet points"
        note="English in bold, Malayalam below. Empty lines are hidden."
      >
        <Seg<ListStyle>
          value={p.listStyle}
          onChange={(v) => set("listStyle", v)}
          options={[
            ["numbers", "1, 2, 3 steps"],
            ["bullets", "• Bullets"],
            ["checks", "✓ Checks"],
          ]}
        />
        <div className="mt-4 flex flex-wrap items-end gap-5">
          {p.listStyle === "numbers" && (
            <div className="w-40">
              <Field
                label="First number"
                hint="To continue from the last page."
              >
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={p.startAt}
                  onChange={(e) =>
                    set("startAt", Math.max(1, Number(e.target.value) || 1))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          )}
          <div className="pb-2">
            <Check checked={p.cards} onChange={(v) => set("cards", v)}>
              Each item in a white card
            </Check>
          </div>
          <div className="pb-2">
            <Check checked={p.showPhoto} onChange={(v) => set("showPhoto", v)}>
              Photo above the list
            </Check>
          </div>
        </div>
        <div className="mt-4">
          <ItemList
            items={p.steps}
            onChange={(v) => set("steps", v)}
            max={MAX_STEPS}
            noun={p.listStyle === "numbers" ? "Step" : "Point"}
            startAt={p.listStyle === "numbers" ? p.startAt : 1}
          />
        </div>
      </Panel>
      {p.showPhoto && (
        <PhotoPanel
          data={p}
          set={set}
          removeLabel="Remove photo"
          onMsg={onMsg}
        />
      )}
      <Panel
        title="Note box (optional)"
        note="A highlighted tip or warning under the list. Leave both empty to hide it."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="English">
            <textarea
              value={p.note}
              onChange={(e) => set("note", e.target.value)}
              rows={3}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <Field label="Malayalam">
            <textarea
              value={p.mlNote}
              onChange={(e) => set("mlNote", e.target.value)}
              rows={3}
              lang="ml"
              className={cn(inputCls, "resize-y")}
            />
          </Field>
        </div>
      </Panel>
    </>
  );
}

function PromoPageEditor({ p, set, onMsg }: PageEditorProps<PromoPage>) {
  const input = (
    k:
      | "ribbon"
      | "heading"
      | "mlHeading"
      | "location"
      | "priceLabel"
      | "price"
      | "priceNote",
    label: string,
    ml = false,
    placeholder?: string,
  ) => (
    <Field label={label}>
      <input
        value={p[k]}
        onChange={(e) => set(k, e.target.value)}
        lang={ml ? "ml" : undefined}
        placeholder={placeholder}
        className={inputCls}
      />
    </Field>
  );
  const contact = (
    k:
      | "contactTitle"
      | "contactName"
      | "phone"
      | "whatsapp"
      | "address"
      | "extra"
      | "cta"
      | "mlCta",
    label: string,
    ml = false,
    placeholder?: string,
  ) => (
    <Field label={label}>
      <input
        value={p[k]}
        onChange={(e) => set(k, e.target.value)}
        lang={ml ? "ml" : undefined}
        placeholder={placeholder}
        className={inputCls}
      />
    </Field>
  );
  const setHl = (i: number, patch: Partial<PromoPage["highlights"][number]>) =>
    set(
      "highlights",
      p.highlights.map((h, j) => (j === i ? { ...h, ...patch } : h)),
    );
  return (
    <>
      <Panel
        title="Property / tool"
        note="Empty fields are hidden on the post."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {input("heading", "Name / title (English)")}
          {input("mlHeading", "Name / title (Malayalam)", true)}
          {input(
            "location",
            "Location or model line",
            false,
            "e.g. Kattappana, Idukki",
          )}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            {input("ribbon", "Ribbon", false, "FOR SALE / FOR RENT / NEW")}
            <Field label="Ribbon icon">
              <IconSelect
                value={p.ribbonIcon}
                onChange={(v) => set("ribbonIcon", v)}
              />
            </Field>
          </div>
          {input("price", "Price", false, "₹ 25 Lakh")}
          <div className="grid grid-cols-2 gap-3">
            {input("priceLabel", "Price label", false, "PRICE")}
            {input("priceNote", "Price note", false, "Negotiable")}
          </div>
        </div>
      </Panel>
      <PhotoPanel data={p} set={set} removeLabel="Remove photo" onMsg={onMsg}>
        <Field label="Photo size">
          <Seg<PhotoSize>
            value={p.photoSize}
            onChange={(v) => set("photoSize", v)}
            options={[
              ["s", "Small"],
              ["m", "Medium"],
              ["l", "Large"],
            ]}
          />
        </Field>
      </PhotoPanel>
      <Panel
        title="Highlights"
        note={`Up to ${MAX_HIGHLIGHTS} key facts in a row (size, water, model, warranty…).`}
      >
        <div className="space-y-3">
          {p.highlights.map((h, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-3"
            >
              <Field label="Icon">
                <IconSelect
                  value={h.icon}
                  onChange={(v) => setHl(i, { icon: v })}
                />
              </Field>
              <Field label="Label">
                <input
                  value={h.label}
                  onChange={(e) => setHl(i, { label: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Value">
                <input
                  value={h.value}
                  onChange={(e) => setHl(i, { value: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <IconBtn
                label="Remove"
                onClick={() =>
                  set(
                    "highlights",
                    p.highlights.filter((_, j) => j !== i),
                  )
                }
              >
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          ))}
          {p.highlights.length < MAX_HIGHLIGHTS && (
            <button
              type="button"
              onClick={() =>
                set("highlights", [
                  ...p.highlights,
                  { icon: "leaf", label: "", value: "" },
                ])
              }
              className={btn}
            >
              <Plus className="h-4 w-4" /> Add highlight
            </button>
          )}
        </div>
      </Panel>
      <Panel
        title="Advantages"
        note="Shown with gold ticks; two columns when there are more than three."
      >
        <div className="mb-4 max-w-xs">
          <Field label="Title">
            <input
              value={p.advTitle}
              onChange={(e) => set("advTitle", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <ItemList
          items={p.advantages}
          onChange={(v) => set("advantages", v)}
          max={MAX_ADVANTAGES}
          noun="Advantage"
          rows={1}
        />
      </Panel>
      <Panel
        title="Contact"
        note="Empty lines are hidden. The phone number is shown largest."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {contact("contactTitle", "Label", false, "CONTACT")}
          {contact("contactName", "Name")}
          {contact("phone", "Phone", false, "+91 …")}
          {contact("whatsapp", "WhatsApp", false, "+91 …")}
          {contact("address", "Address / place")}
          <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
            {contact("extra", "Email or website")}
            <Field label="Icon">
              <select
                value={p.extraIcon}
                onChange={(e) =>
                  set("extraIcon", e.target.value as PromoPage["extraIcon"])
                }
                className={inputCls}
              >
                <option value="mail">Email</option>
                <option value="globe">Website</option>
              </select>
            </Field>
          </div>
          {contact("cta", "Button text (English)")}
          {contact("mlCta", "Button text (Malayalam)", true)}
        </div>
      </Panel>
    </>
  );
}

function FollowPageEditor({ p, set }: PageEditorProps<FollowPage>) {
  const setAct = (i: number, patch: Partial<FollowPage["actions"][number]>) =>
    set(
      "actions",
      p.actions.map((a, j) => (j === i ? { ...a, ...patch } : a)),
    );
  const setPerk = (i: number, patch: Partial<CoverItem>) =>
    set(
      "perks",
      p.perks.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    );
  const text = (
    k: "heading" | "mlHeading" | "handle" | "button" | "mlButton",
    label: string,
    ml = false,
    placeholder?: string,
  ) => (
    <Field label={label}>
      <input
        value={p[k]}
        onChange={(e) => set(k, e.target.value)}
        lang={ml ? "ml" : undefined}
        placeholder={placeholder}
        className={inputCls}
      />
    </Field>
  );
  return (
    <>
      <Panel
        title="Follow page"
        note="The closing slide: ask people to follow for daily updates."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Background">
            <Seg<FollowPage["background"]>
              value={p.background}
              onChange={(v) => set("background", v)}
              options={[
                ["green", "Green card"],
                ["cream", "Light"],
              ]}
            />
          </Field>
          <div className="self-end pb-2.5">
            <Check checked={p.showLogo} onChange={(v) => set("showLogo", v)}>
              Show the logo
            </Check>
          </div>
        </div>
        {p.showLogo && (
          <div className="mt-4">
            <LogoPicker<FollowPage["logo"]>
              options={[
                { v: "emblem", src: BV_EMBLEM, label: "Round emblem" },
                ...BV_VARIANTS.filter((v) => v.n !== BV_EMBLEM_VARIANT).map((v) => ({
                  v: v.n,
                  src: v.web,
                  label: `Badge logo ${v.n}`,
                })),
              ]}
              value={p.logo}
              onChange={(v) => set("logo", v)}
            />
          </div>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {text("heading", "Title (English)")}
          {text("mlHeading", "Title (Malayalam)", true)}
          {text("handle", "Instagram handle", false, "@bethlehemvalley")}
          <div />
          <Field label="Text (English)">
            <textarea
              value={p.body}
              onChange={(e) => set("body", e.target.value)}
              rows={2}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <Field label="Text (Malayalam)">
            <textarea
              value={p.mlBody}
              onChange={(e) => set("mlBody", e.target.value)}
              rows={2}
              lang="ml"
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <SizeSlider
            label="Title & handle size"
            value={p.titleSize}
            onChange={(v) => set("titleSize", v)}
          />
          <SizeSlider
            label="Text & icons size"
            value={p.textSize}
            onChange={(v) => set("textSize", v)}
          />
        </div>
      </Panel>

      <Panel
        title="Action row"
        note="Round icons reminding people what to do. Untick to hide one; rename freely."
      >
        <div className="space-y-2">
          {p.actions.map((a, i) => (
            <div
              key={a.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3"
            >
              <label className="flex w-28 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={a.show}
                  onChange={(e) => setAct(i, { show: e.target.checked })}
                  className="h-4 w-4 accent-[#0A3A20]"
                />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A3A20] text-white">
                  <BvIcon
                    name={FOLLOW_ACTION_ICONS[a.id]}
                    className="h-4 w-4"
                  />
                </span>
                {a.id}
              </label>
              <input
                value={a.label}
                onChange={(e) => setAct(i, { label: e.target.value })}
                aria-label={`${a.id} label, English`}
                className={inputCls}
              />
              <input
                value={a.ml}
                onChange={(e) => setAct(i, { ml: e.target.value })}
                lang="ml"
                aria-label={`${a.id} label, Malayalam`}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="What followers get (optional)"
        note={`Up to ${MAX_PERKS} chips between the text and the action row.`}
      >
        <div className="space-y-3">
          {p.perks.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3"
            >
              <IconSelect
                value={c.icon}
                onChange={(v) => setPerk(i, { icon: v })}
              />
              <input
                value={c.text}
                onChange={(e) => setPerk(i, { text: e.target.value })}
                placeholder="English"
                className={inputCls}
              />
              <input
                value={c.ml}
                onChange={(e) => setPerk(i, { ml: e.target.value })}
                lang="ml"
                placeholder="മലയാളം"
                className={inputCls}
              />
              <IconBtn
                label="Remove"
                onClick={() =>
                  set(
                    "perks",
                    p.perks.filter((_, j) => j !== i),
                  )
                }
              >
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          ))}
          {p.perks.length < MAX_PERKS && (
            <button
              type="button"
              onClick={() =>
                set("perks", [...p.perks, { icon: "check", text: "", ml: "" }])
              }
              className={btn}
            >
              <Plus className="h-4 w-4" /> Add chip
            </button>
          )}
        </div>
      </Panel>

      <Panel title="Follow button">
        <Check checked={p.showButton} onChange={(v) => set("showButton", v)}>
          Show the button
        </Check>
        {p.showButton && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("button", "Button text (English)", false, "Follow Now")}
            {text("mlButton", "Button text (Malayalam)", true)}
            <SizeSlider
              label="Button size"
              value={p.buttonSize}
              onChange={(v) => set("buttonSize", v)}
              min={60}
              max={170}
            />
          </div>
        )}
      </Panel>
    </>
  );
}

const TONE_OPTIONS: [GuideTone, string, string][] = [
  ["red", "Red", "#C0392B"],
  ["amber", "Amber", "#B7791F"],
  ["green", "Green", "#0B6B48"],
  ["blue", "Blue", "#1F6FA8"],
  ["purple", "Purple", "#6B46C1"],
];
const TYPE_SUGGESTIONS = [
  "INSECTICIDE",
  "FUNGICIDE",
  "HERBICIDE",
  "BIO-PESTICIDE",
  "BIO-FUNGICIDE",
  "ACARICIDE",
  "NEMATICIDE",
  "PLANT GROWTH REGULATOR",
  "FERTILIZER",
];

function GuidePageEditor({
  p,
  set,
  onMsg,
  others,
  onCopyToAll,
}: PageEditorProps<GuidePage> & { others: number; onCopyToAll: () => void }) {
  const on = (id: string) => p.sections.find((s) => s.id === id)?.show ?? false;
  const setSec = (i: number, patch: Partial<GuidePage["sections"][number]>) =>
    set(
      "sections",
      p.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    );
  const moveSec = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.sections.length) return;
    const next = [...p.sections];
    [next[i], next[j]] = [next[j], next[i]];
    set("sections", next);
  };
  const setDose = (i: number, patch: Partial<GuidePage["dosage"][number]>) =>
    set(
      "dosage",
      p.dosage.map((d, j) => (j === i ? { ...d, ...patch } : d)),
    );
  const list = (
    k: "targets" | "crops" | "when" | "whenNot" | "advantages" | "safety",
    noun: string,
  ) => (
    <ItemList
      items={p[k]}
      onChange={(v) => set(k, v)}
      max={MAX_GUIDE_ITEMS}
      noun={noun}
      rows={1}
    />
  );
  const secTitle = (id: string) =>
    GUIDE_SECTIONS.find((g) => g.id === id)!.label;
  return (
    <>
      <Panel
        title="Sections on this page"
        note="Tick what this page shows, reorder with the arrows and rename the headings. Hidden sections keep their text, so other pages can show them."
      >
        <div className="space-y-2">
          {p.sections.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-2",
                s.show
                  ? "border-emerald-600/40 bg-emerald-50/40"
                  : "border-border opacity-70",
              )}
            >
              <button
                type="button"
                onClick={() => setSec(i, { show: !s.show })}
                aria-pressed={s.show}
                title={
                  s.show ? "Shown: click to hide" : "Hidden: click to show"
                }
                className={cn(
                  "rounded-lg p-2",
                  s.show
                    ? "bg-emerald-600 text-white"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {s.show ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              <span className="w-44 shrink-0 text-sm font-semibold">
                {secTitle(s.id)}
              </span>
              {s.id !== "title" && s.id !== "disclaimer" ? (
                <input
                  value={s.title}
                  onChange={(e) => setSec(i, { title: e.target.value })}
                  aria-label={`${secTitle(s.id)} heading`}
                  placeholder="Heading (empty = none)"
                  className={cn(inputCls, "py-1.5")}
                />
              ) : (
                <span className="flex-1 text-xs text-muted-foreground">
                  {s.id === "title"
                    ? "Badge, name, ingredient and photo"
                    : "Small note at the bottom"}
                </span>
              )}
              <IconBtn
                label="Move up"
                onClick={() => moveSec(i, -1)}
                disabled={i === 0}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn
                label="Move down"
                onClick={() => moveSec(i, 1)}
                disabled={i === p.sections.length - 1}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </IconBtn>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tip: “When to use” and “When NOT to use” placed next to each other
          show as two cards side by side.
        </p>
        {others > 0 && (
          <button
            type="button"
            onClick={() =>
              confirm(
                `Copy this page's product details to the other ${others} guide page(s)?`,
              ) && onCopyToAll()
            }
            className={cn(btn, "mt-3")}
          >
            <CopyCheck className="h-4 w-4" /> Copy product details to the other{" "}
            {others} guide page{others > 1 ? "s" : ""}
          </button>
        )}
      </Panel>

      <Panel
        title="Product"
        note="Shown in the Product title section. Take the name and composition from the label."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type badge">
            <input
              value={p.typeLabel}
              onChange={(e) => set("typeLabel", e.target.value)}
              list="bv-guide-types"
              className={inputCls}
            />
            <datalist id="bv-guide-types">
              {TYPE_SUGGESTIONS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>
          <Field label="Badge icon">
            <IconSelect
              value={p.typeIcon}
              onChange={(v) => set("typeIcon", v)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Badge / accent colour">
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map(([v, label, c]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("tone", v)}
                    aria-pressed={p.tone === v}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-medium",
                      p.tone === v ? "border-foreground" : "border-border",
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ background: c }}
                    />
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Product name (English)">
            <textarea
              value={p.heading}
              onChange={(e) => set("heading", e.target.value)}
              rows={2}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <Field label="Product name (Malayalam)">
            <textarea
              value={p.mlHeading}
              onChange={(e) => set("mlHeading", e.target.value)}
              rows={2}
              lang="ml"
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Active ingredient / composition">
              <input
                value={p.ingredient}
                onChange={(e) => set("ingredient", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <SizeSlider
            label="Heading sizes"
            value={p.headingSize}
            onChange={(v) => set("headingSize", v)}
          />
          <SizeSlider
            label="Text sizes"
            value={p.textSize}
            onChange={(v) => set("textSize", v)}
          />
          <div className="pt-1">
            <Check checked={p.showPhoto} onChange={(v) => set("showPhoto", v)}>
              Product photo next to the name
            </Check>
          </div>
        </div>
      </Panel>
      {p.showPhoto && on("title") && (
        <PhotoPanel
          data={p}
          set={set}
          removeLabel="Remove photo"
          onMsg={onMsg}
        />
      )}

      {on("targets") && (
        <Panel
          title="What it controls"
          note="Pests, diseases or weeds. Shown as chips."
        >
          {list("targets", "Target")}
        </Panel>
      )}
      {on("crops") && (
        <Panel title="Recommended crops" note="Shown as green chips.">
          {list("crops", "Crop")}
        </Panel>
      )}
      {on("when") && <Panel title="When to use">{list("when", "Point")}</Panel>}
      {on("whenNot") && (
        <Panel title="When NOT to use">{list("whenNot", "Point")}</Panel>
      )}
      {on("dosage") && (
        <Panel
          title="Dosage & application"
          note={`Up to ${MAX_DOSAGE} facts. Copy the dose and waiting period exactly from the label.`}
        >
          <div className="space-y-3">
            {p.dosage.map((d, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_auto] items-end gap-3"
              >
                <Field label="Icon">
                  <IconSelect
                    value={d.icon}
                    onChange={(v) => setDose(i, { icon: v })}
                  />
                </Field>
                <Field label="Label">
                  <input
                    value={d.label}
                    onChange={(e) => setDose(i, { label: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Value">
                  <input
                    value={d.value}
                    onChange={(e) => setDose(i, { value: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <IconBtn
                  label="Remove"
                  onClick={() =>
                    set(
                      "dosage",
                      p.dosage.filter((_, j) => j !== i),
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </IconBtn>
              </div>
            ))}
            {p.dosage.length < MAX_DOSAGE && (
              <button
                type="button"
                onClick={() =>
                  set("dosage", [
                    ...p.dosage,
                    { icon: "drop", label: "", value: "" },
                  ])
                }
                className={btn}
              >
                <Plus className="h-4 w-4" /> Add fact
              </button>
            )}
          </div>
        </Panel>
      )}
      {on("advantages") && (
        <Panel title="Advantages">{list("advantages", "Advantage")}</Panel>
      )}
      {on("safety") && (
        <Panel title="Safety / precautions" note="Shown in an amber box.">
          {list("safety", "Point")}
        </Panel>
      )}
      {on("disclaimer") && (
        <Panel
          title="Label disclaimer"
          note="A small note at the bottom of the page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="English">
              <textarea
                value={p.disclaimer}
                onChange={(e) => set("disclaimer", e.target.value)}
                rows={2}
                className={cn(inputCls, "resize-y")}
              />
            </Field>
            <Field label="Malayalam">
              <textarea
                value={p.mlDisclaimer}
                onChange={(e) => set("mlDisclaimer", e.target.value)}
                rows={2}
                lang="ml"
                className={cn(inputCls, "resize-y")}
              />
            </Field>
          </div>
        </Panel>
      )}
    </>
  );
}

/** A % size slider (40–200 %, 100 = default). */
function SizeSlider({
  label,
  value,
  onChange,
  min = 60,
  max = 160,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        <span className="flex items-center gap-2">
          <span className="font-mono text-foreground">{value}%</span>
          {value !== 100 && (
            <button
              type="button"
              onClick={() => onChange(100)}
              className="rounded px-1 text-[11px] underline hover:text-foreground"
            >
              reset
            </button>
          )}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#0A3A20]"
      />
    </label>
  );
}

function CoverPageEditor({ p, set, onMsg }: PageEditorProps<CoverPage>) {
  const setC = (i: number, patch: Partial<CoverItem>) =>
    set(
      "covers",
      p.covers.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    );
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.covers.length) return;
    const next = [...p.covers];
    [next[i], next[j]] = [next[j], next[i]];
    set("covers", next);
  };
  const text = (
    k: "eyebrow" | "coversTitle" | "cta" | "mlCta",
    label: string,
    ml = false,
    placeholder?: string,
  ) => (
    <Field label={label}>
      <input
        value={p[k]}
        onChange={(e) => set(k, e.target.value)}
        lang={ml ? "ml" : undefined}
        placeholder={placeholder}
        className={inputCls}
      />
    </Field>
  );
  return (
    <>
      <Panel
        title="Banner & title"
        note="The big first impression. Long titles shrink to fit; the sliders set the size you want."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Banner">
            <Seg<CoverPage["banner"]>
              value={p.banner}
              onChange={(v) => set("banner", v)}
              options={[
                ["photo", "Title on photo"],
                ["stacked", "Photo above"],
                ["plain", "No photo"],
              ]}
            />
          </Field>
          <Field label="Alignment">
            <Seg<CoverPage["align"]>
              value={p.align}
              onChange={(v) => set("align", v)}
              options={[
                ["left", "Left"],
                ["center", "Centre"],
              ]}
            />
          </Field>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            {text(
              "eyebrow",
              "Small label above the title",
              false,
              "NEW GUIDE / PART 1",
            )}
            <Field label="Label icon">
              <IconSelect
                value={p.eyebrowIcon}
                onChange={(v) => set("eyebrowIcon", v)}
              />
            </Field>
          </div>
          <Field label="Title font">
            <Seg<CoverPage["titleFont"]>
              value={p.titleFont}
              onChange={(v) => set("titleFont", v)}
              options={[
                ["sans", "Modern"],
                ["serif", "Classic serif"],
                ["script", "Handwritten"],
              ]}
            />
          </Field>
          <Field label="Title (English)">
            <textarea
              value={p.heading}
              onChange={(e) => set("heading", e.target.value)}
              rows={2}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <Field label="Title (Malayalam)">
            <textarea
              value={p.mlHeading}
              onChange={(e) => set("mlHeading", e.target.value)}
              rows={2}
              lang="ml"
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <SizeSlider
            label="Title size"
            value={p.titleSize}
            onChange={(v) => set("titleSize", v)}
            min={50}
            max={180}
          />
          {p.banner !== "plain" && (
            <SizeSlider
              label="Photo height"
              value={Math.round((p.bannerHeight / 520) * 100)}
              onChange={(v) => set("bannerHeight", Math.round((520 * v) / 100))}
              min={40}
              max={170}
            />
          )}
        </div>
      </Panel>

      {p.banner !== "plain" && (
        <PhotoPanel
          data={p}
          set={set}
          removeLabel="Remove photo"
          onMsg={onMsg}
        />
      )}

      <Panel
        title="What it covers"
        note={`Up to ${MAX_COVERS} topics of this post. Empty ones are hidden.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text(
            "coversTitle",
            "Section label",
            false,
            "WHAT THIS POST COVERS / INSIDE",
          )}
          <Field label="Style">
            <Seg<CoverPage["coversStyle"]>
              value={p.coversStyle}
              onChange={(v) => set("coversStyle", v)}
              options={[
                ["list", "1, 2, 3 list"],
                ["cards", "Icon cards"],
                ["chips", "Chips"],
              ]}
            />
          </Field>
          <SizeSlider
            label="Text size"
            value={p.coversSize}
            onChange={(v) => set("coversSize", v)}
          />
        </div>
        <div className="mt-4 space-y-3">
          {p.covers.map((c, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Topic {i + 1}</span>
                <div className="flex gap-1">
                  <IconBtn
                    label="Move up"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label="Move down"
                    onClick={() => move(i, 1)}
                    disabled={i === p.covers.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label="Remove"
                    onClick={() =>
                      set(
                        "covers",
                        p.covers.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)]">
                <IconSelect
                  value={c.icon}
                  onChange={(v) => setC(i, { icon: v })}
                />
                <input
                  value={c.text}
                  onChange={(e) => setC(i, { text: e.target.value })}
                  placeholder="English"
                  aria-label={`Topic ${i + 1}, English`}
                  className={inputCls}
                />
                <input
                  value={c.ml}
                  onChange={(e) => setC(i, { ml: e.target.value })}
                  lang="ml"
                  placeholder="മലയാളം"
                  aria-label={`Topic ${i + 1}, Malayalam`}
                  className={inputCls}
                />
              </div>
            </div>
          ))}
          {p.covers.length < MAX_COVERS && (
            <button
              type="button"
              onClick={() =>
                set("covers", [...p.covers, { icon: "leaf", text: "", ml: "" }])
              }
              className={btn}
            >
              <Plus className="h-4 w-4" /> Add topic
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            The icon shows in the Icon cards and Chips styles; the list style
            numbers the topics.
          </p>
        </div>
      </Panel>

      <Panel
        title="Description (optional)"
        note="A short paragraph under the topics. Leave both empty to hide it."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="English">
            <textarea
              value={p.body}
              onChange={(e) => set("body", e.target.value)}
              rows={3}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <Field label="Malayalam">
            <textarea
              value={p.mlBody}
              onChange={(e) => set("mlBody", e.target.value)}
              rows={3}
              lang="ml"
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <SizeSlider
            label="Text size"
            value={p.textSize}
            onChange={(v) => set("textSize", v)}
          />
        </div>
      </Panel>

      <Panel
        title="Next-slide button"
        note="Tells people to swipe for the rest of the carousel. It sits at the bottom of the page."
      >
        <Check checked={p.showCta} onChange={(v) => set("showCta", v)}>
          Show the button
        </Check>
        {p.showCta && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("cta", "Button text (English)", false, "Swipe for more")}
            {text("mlCta", "Button text (Malayalam)", true)}
            <Field label="Style">
              <Seg<CoverPage["ctaStyle"]>
                value={p.ctaStyle}
                onChange={(v) => set("ctaStyle", v)}
                options={[
                  ["gold", "Gold"],
                  ["green", "Green"],
                  ["outline", "Outline"],
                ]}
              />
            </Field>
            <Field label="Position">
              <Seg<CoverPage["ctaAlign"]>
                value={p.ctaAlign}
                onChange={(v) => set("ctaAlign", v)}
                options={[
                  ["left", "Left"],
                  ["center", "Centre"],
                  ["right", "Right"],
                ]}
              />
            </Field>
            <SizeSlider
              label="Button size"
              value={p.ctaSize}
              onChange={(v) => set("ctaSize", v)}
              min={60}
              max={170}
            />
          </div>
        )}
      </Panel>
    </>
  );
}

function FeaturesPageEditor({ p, set, onMsg }: PageEditorProps<FeaturesPage>) {
  const setF = (i: number, patch: Partial<FeatureItem>) =>
    set(
      "features",
      p.features.map((f, j) => (j === i ? { ...f, ...patch } : f)),
    );
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.features.length) return;
    const next = [...p.features];
    [next[i], next[j]] = [next[j], next[i]];
    set("features", next);
  };
  return (
    <>
      <TopicPanel data={p} set={set} metaHint="e.g. Tool guide #3" />
      <TextPanel
        data={p}
        set={set}
        fit={null}
        labels={[
          "Name / heading (English)",
          "Name / heading (Malayalam)",
          "What it is, English (optional)",
          "What it is, Malayalam (optional)",
        ]}
      />
      <Panel
        title="Features"
        note={`Up to ${MAX_FEATURES} cards: icon, title, a short English line and Malayalam. Empty cards are hidden.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Layout">
            <Seg<FeaturesPage["layout"]>
              value={p.layout}
              onChange={(v) => set("layout", v)}
              options={[
                ["grid", "Cards, 2 columns"],
                ["list", "List, 1 per row"],
              ]}
            />
          </Field>
          <div className="flex flex-wrap items-end gap-4">
            <div className="pb-2.5">
              <Check
                checked={p.showPhoto}
                onChange={(v) => set("showPhoto", v)}
              >
                Photo
              </Check>
            </div>
            {p.showPhoto && (
              <div className="min-w-[220px] flex-1">
                <Field label="Photo size">
                  <Seg<PhotoSize>
                    value={p.photoSize}
                    onChange={(v) => set("photoSize", v)}
                    options={[
                      ["s", "Small"],
                      ["m", "Medium"],
                      ["l", "Large"],
                    ]}
                  />
                </Field>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {p.features.map((f, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Feature {i + 1}</span>
                <div className="flex gap-1">
                  <IconBtn
                    label="Move up"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label="Move down"
                    onClick={() => move(i, 1)}
                    disabled={i === p.features.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label="Remove"
                    onClick={() =>
                      set(
                        "features",
                        p.features.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                <Field label="Icon">
                  <IconSelect
                    value={f.icon}
                    onChange={(v) => setF(i, { icon: v })}
                  />
                </Field>
                <Field label="Title">
                  <input
                    value={f.title}
                    onChange={(e) => setF(i, { title: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <textarea
                  value={f.text}
                  onChange={(e) => setF(i, { text: e.target.value })}
                  rows={2}
                  placeholder="English: what it does for you"
                  aria-label={`Feature ${i + 1}, English`}
                  className={cn(inputCls, "resize-y")}
                />
                <textarea
                  value={f.ml}
                  onChange={(e) => setF(i, { ml: e.target.value })}
                  rows={2}
                  lang="ml"
                  placeholder="മലയാളം"
                  aria-label={`Feature ${i + 1}, Malayalam`}
                  className={cn(inputCls, "resize-y")}
                />
              </div>
            </div>
          ))}
          {p.features.length < MAX_FEATURES ? (
            <button
              type="button"
              onClick={() =>
                set("features", [
                  ...p.features,
                  { icon: "check", title: "", text: "", ml: "" },
                ])
              }
              className={btn}
            >
              <Plus className="h-4 w-4" /> Add feature
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              {MAX_FEATURES} is the most that fits. Add another Features page
              for more.
            </p>
          )}
        </div>
      </Panel>
      {p.showPhoto && (
        <PhotoPanel
          data={p}
          set={set}
          removeLabel="Remove photo"
          onMsg={onMsg}
        />
      )}
      <Panel
        title="Takeaway (optional)"
        note="A one-line summary in a green band under the cards. Leave both empty to hide it."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="English">
            <textarea
              value={p.takeaway}
              onChange={(e) => set("takeaway", e.target.value)}
              rows={2}
              className={cn(inputCls, "resize-y")}
            />
          </Field>
          <Field label="Malayalam">
            <textarea
              value={p.mlTakeaway}
              onChange={(e) => set("mlTakeaway", e.target.value)}
              rows={2}
              lang="ml"
              className={cn(inputCls, "resize-y")}
            />
          </Field>
        </div>
      </Panel>
    </>
  );
}

/** Editable list of English + Malayalam lines (steps, bullet points, advantages). */
function ItemList({
  items,
  onChange,
  max,
  noun,
  startAt = 1,
  rows = 2,
}: {
  items: ListItem[];
  onChange: (v: ListItem[]) => void;
  max: number;
  noun: string;
  startAt?: number;
  rows?: number;
}) {
  const setItem = (i: number, patch: Partial<ListItem>) =>
    onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">
              {noun} {startAt + i}
            </span>
            <div className="flex gap-1">
              <IconBtn
                label="Move up"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn
                label="Move down"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn
                label="Remove"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconBtn>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <textarea
              value={it.text}
              onChange={(e) => setItem(i, { text: e.target.value })}
              rows={rows}
              placeholder="English"
              aria-label={`${noun} ${startAt + i}, English`}
              className={cn(inputCls, "resize-y")}
            />
            <textarea
              value={it.ml}
              onChange={(e) => setItem(i, { ml: e.target.value })}
              rows={rows}
              lang="ml"
              placeholder="മലയാളം"
              aria-label={`${noun} ${startAt + i}, Malayalam`}
              className={cn(inputCls, "resize-y")}
            />
          </div>
        </div>
      ))}
      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, { text: "", ml: "" }])}
          className={btn}
        >
          <Plus className="h-4 w-4" /> Add {noun.toLowerCase()}
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {max} is the most that fits. Add another page to continue
          {noun === "Step"
            ? " (set its first number to carry on counting)"
            : ""}
          .
        </p>
      )}
    </div>
  );
}
