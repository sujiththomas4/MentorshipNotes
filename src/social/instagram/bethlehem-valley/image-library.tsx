import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, inputCls } from "./editor-kit";
import { backend, type LibraryItem } from "@/social/backend";
import { BV_ART } from "./shared";

/*
 * Picker for header photos: choose from the image library (dropdown) or upload on the fly,
 * either for this post only or saved to the library for every post.
 */

const EVENT = "bv-image-library-change";

/** Images that ship with the templates (always available, cannot be removed). */
export const BUILTIN_IMAGES: LibraryItem[] = [
  { id: "pepper", label: "Pepper (default)", src: `${BV_ART}/pepper.webp`, builtin: true },
  { id: "landscape", label: "Plantation landscape", src: `${BV_ART}/landscape.webp`, builtin: true },
  { id: "pepper-garden", label: "Pepper garden", src: `${BV_ART}/tips/background.webp`, builtin: true },
  { id: "pepper-farmer", label: "Pepper farmer (cut-out)", src: `${BV_ART}/tips/farmer.webp`, builtin: true },
  { id: "agri-hen", label: "Hen (agri poster)", src: `${BV_ART}/agri/hen.webp`, builtin: true },
  { id: "agri-pepper", label: "Pepper clusters (agri poster)", src: `${BV_ART}/agri/pepper-circle.webp`, builtin: true },
];

let cache: LibraryItem[] | null = null;

/** Built-in images plus the ones added to library.json (re-read after every change). */
export function useImageLibrary() {
  const [items, setItems] = useState<LibraryItem[]>(cache ?? []);
  useEffect(() => {
    const load = () =>
      backend
        .listLibrary()
        .then((list) => {
          cache = list;
          setItems(list);
        })
        .catch(() => {});
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, []);
  return [...BUILTIN_IMAGES, ...[...items].sort((a, b) => a.label.localeCompare(b.label))];
}

/** Read an image file, scaled down to at most `max` px on the long side, as a WebP data URL. */
export async function shrinkImage(file: File, max = 1400): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * s);
    canvas.height = Math.round(img.naturalHeight * s);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const niceName = (fileName: string) =>
  fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

/**
 * `value`: the image in use (a library path or an uploaded data URL), or null for none.
 * `onChange(null)` = none.
 */
export function ImagePicker({ value, onChange, onMsg, label }: { value: string | null; onChange: (src: string | null) => void; onMsg: (s: string) => void; label: string }) {
  const items = useImageLibrary();
  const [pending, setPending] = useState<{ src: string; name: string; save: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const current = value ? items.find((i) => i.src === value) : undefined;
  const isUpload = !!value && !current;
  const selectValue = !value ? "__none" : current ? current.id : "__upload";

  async function confirmUpload() {
    if (!pending) return;
    if (!pending.save) {
      onChange(pending.src);
      onMsg(`${label}: using the uploaded image for this post only.`);
      setPending(null);
      return;
    }
    setBusy(true);
    try {
      const item = await backend.addLibraryImage(pending.name, pending.src);
      window.dispatchEvent(new Event(EVENT));
      onChange(item.src);
      onMsg(`“${item.label}” added to the image library.`);
      setPending(null);
    } catch (e) {
      onMsg(`Couldn't save to the library: ${e instanceof Error ? e.message : "error"}. Is the local dev server running?`);
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: LibraryItem) {
    if (!confirm(`Remove “${item.label}” from the image library? Posts that use it will lose the picture.`)) return;
    try {
      await backend.removeLibraryImage(item.id);
      window.dispatchEvent(new Event(EVENT));
      if (value === item.src) onChange(null);
      onMsg(`“${item.label}” removed from the library.`);
    } catch (e) {
      onMsg(`Couldn't remove it: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <X className="h-4 w-4 text-muted-foreground" />}
        </span>
        <select
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__none") onChange(null);
            else if (v !== "__upload") onChange(items.find((i) => i.id === v)?.src ?? null);
          }}
          aria-label={`${label}: choose an image`}
          className={cn(inputCls, "w-auto min-w-[200px]")}
        >
          <option value="__none">None</option>
          <optgroup label="Image library">
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </optgroup>
          {isUpload && <option value="__upload">Uploaded for this post</option>}
        </select>
        <label className={cn(btn, "cursor-pointer")}>
          <ImagePlus className="h-4 w-4" /> Upload…
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                setPending({ src: await shrinkImage(f), name: niceName(f.name), save: true });
              } catch {
                onMsg(`Couldn't read ${f.name}.`);
              }
            }}
          />
        </label>
        {current && !current.builtin && (
          <button type="button" onClick={() => remove(current)} title="Remove this image from the library" className={cn(btn, "text-muted-foreground")}>
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {pending && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
          <img src={pending.src} alt="" className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-[220px] flex-1 space-y-2">
            <input
              value={pending.name}
              onChange={(e) => setPending({ ...pending, name: e.target.value })}
              placeholder="Name, e.g. Ginger"
              aria-label="Image name"
              className={inputCls}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pending.save} onChange={(e) => setPending({ ...pending, save: e.target.checked })} className="h-4 w-4 accent-[#0A3A20]" />
              Save to the image library (reuse it in any post)
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={confirmUpload} disabled={busy || (pending.save && !pending.name.trim())} className={cn(btn, "bg-[#0A3A20] text-white hover:bg-[#0A3A20]/90")}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending.save ? "Add & use" : "Use"}
            </button>
            <button type="button" onClick={() => setPending(null)} className={btn}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
