import { createServerFn } from "@tanstack/react-start";

/*
 * Bethlehem Valley image library (header photos: pepper, ginger, cow & hen …).
 * Images added from the editors are written to public/social/instagram/bethlehem-valley/library/
 * with a list in library.json next to them. Runs on the local dev server; used only by local.ts.
 */

import type { LibraryItem } from "./types";

const PUBLIC_DIR = "/social/instagram/bethlehem-valley/library";
const MAX_BYTES = 8 * 1024 * 1024;

async function paths() {
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "social", "instagram", "bethlehem-valley", "library");
  return { path, dir, manifest: path.join(dir, "library.json") };
}

async function readManifest(file: string): Promise<{ items: LibraryItem[] }> {
  const fs = await import("node:fs/promises");
  try {
    const j = JSON.parse(await fs.readFile(file, "utf8"));
    return { items: Array.isArray(j.items) ? j.items : [] };
  } catch {
    return { items: [] };
  }
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "image";

/** Save an image (data URL) to the library under a name; returns the new entry. */
export const addLibraryImage = createServerFn({ method: "POST" })
  .inputValidator((d: { label: string; dataUrl: string }) => {
    const label = String(d.label ?? "").trim().slice(0, 60);
    const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(d.dataUrl ?? ""));
    if (!label) throw new Error("Give the image a name.");
    if (!m) throw new Error("Only PNG, JPEG or WebP images can be added.");
    if (m[2].length * 0.75 > MAX_BYTES) throw new Error("The image is too large (over 8 MB).");
    return { label, ext: m[1] === "jpeg" ? "jpg" : m[1], base64: m[2] };
  })
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const { path, dir, manifest } = await paths();
    await fs.mkdir(dir, { recursive: true });
    const id = `${slug(data.label)}-${Date.now().toString(36)}`;
    const file = `${id}.${data.ext}`;
    await fs.writeFile(path.join(dir, file), Buffer.from(data.base64, "base64"));
    const m = await readManifest(manifest);
    const item: LibraryItem = { id, label: data.label, src: `${PUBLIC_DIR}/${file}`, added: new Date().toISOString().slice(0, 10) };
    m.items.push(item);
    await fs.writeFile(manifest, JSON.stringify(m, null, 2) + "\n", "utf8");
    return item;
  });

/** Remove an added image (built-in ones are not in the list, so they cannot be removed). */
export const removeLibraryImage = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id ?? "") }))
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const { path, dir, manifest } = await paths();
    const m = await readManifest(manifest);
    const item = m.items.find((i) => i.id === data.id);
    if (!item) throw new Error("That image is not in the library.");
    // only ever delete a plain file name inside the library folder
    const file = path.basename(item.src);
    await fs.rm(path.join(dir, file), { force: true });
    m.items = m.items.filter((i) => i.id !== data.id);
    await fs.writeFile(manifest, JSON.stringify(m, null, 2) + "\n", "utf8");
    return { removed: data.id };
  });
