import { createServerFn } from "@tanstack/react-start";

/*
 * Saved posts on this computer (dev server):
 *   src/content/social/posts/<yyyy-mm-dd>/<safe key>.json   one file per planned post
 *   public/social/posts/assets/<sha1>.<ext>                  photos, shared by content hash
 *   public/social/posts/previews/<safe key>-<stamp>.webp     small preview per post
 * File layout and fields are described in README.md (migration to Supabase).
 */

export const POSTS_ASSET_URL = "/social/posts/assets/";
const PREVIEW_URL = "/social/posts/previews/";
const SCHEMA = 1;

type PostFile = { schema: number; key: string; templateId: string; date: string; time: string; savedAt: string; preview: string | null; data: unknown };

async function dirs() {
  const path = await import("node:path");
  const root = process.cwd();
  return {
    path,
    posts: path.join(root, "src", "content", "social", "posts"),
    assets: path.join(root, "public", "social", "posts", "assets"),
    previews: path.join(root, "public", "social", "posts", "previews"),
  };
}

export const safeKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

/** Every saved post file: [path, parsed]. */
async function allPosts(): Promise<[string, PostFile][]> {
  const fs = await import("node:fs/promises");
  const { path, posts } = await dirs();
  const out: [string, PostFile][] = [];
  let days: string[] = [];
  try {
    days = (await fs.readdir(posts)).filter(isDate);
  } catch {
    return out;
  }
  for (const d of days) {
    for (const f of await fs.readdir(path.join(posts, d)).catch(() => [] as string[])) {
      if (!f.endsWith(".json")) continue;
      const p = path.join(posts, d, f);
      try {
        out.push([p, JSON.parse(await fs.readFile(p, "utf8")) as PostFile]);
      } catch {
        /* skip unreadable files */
      }
    }
  }
  return out;
}

/** Remove a post file, and its date folder when that was the last file in it. */
async function removeFile(p: string) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.rm(p, { force: true });
  await fs.rmdir(path.dirname(p)).catch(() => {}); // only succeeds when empty
}

/** Summaries of all saved posts (no editor data), as JSON text. */
export const listSavedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const list = (await allPosts()).map(([, p]) => ({ key: p.key, templateId: p.templateId, date: p.date, time: p.time, savedAt: p.savedAt, preview: p.preview }));
  return { json: JSON.stringify(list) };
});

/** One saved post as JSON text, or null. */
export const getSavedPost = createServerFn({ method: "GET" })
  .inputValidator((d: { key: string }) => ({ key: String(d.key ?? "") }))
  .handler(async ({ data }) => {
    const hit = (await allPosts()).find(([, p]) => p.key === data.key);
    return { json: hit ? JSON.stringify(hit[1]) : (null as string | null) };
  });

export const writeSavedPost = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string; templateId: string; date: string; time: string; dataJson: string; assets: { name: string; base64: string }[]; preview: string | null }) => {
    const key = String(d.key ?? "");
    if (!key) throw new Error("Missing the planned post.");
    if (!isDate(String(d.date))) throw new Error("Missing the post date.");
    const dataJson = String(d.dataJson ?? "");
    JSON.parse(dataJson);
    if (dataJson.length > 3_000_000) throw new Error("The post is too large to save.");
    const assets = (Array.isArray(d.assets) ? d.assets : []).map((a) => {
      if (!/^[a-f0-9]{40}\.(png|jpg|webp)$/.test(String(a.name))) throw new Error("Bad image name.");
      return { name: String(a.name), base64: String(a.base64) };
    });
    const preview = d.preview && /^data:image\/(webp|png|jpeg);base64,/.test(d.preview) ? d.preview : null;
    return { key, templateId: String(d.templateId ?? ""), date: String(d.date), time: String(d.time ?? ""), dataJson, assets, preview };
  })
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const { path, posts, assets, previews } = await dirs();
    await fs.mkdir(assets, { recursive: true });
    await fs.mkdir(previews, { recursive: true });
    for (const a of data.assets) {
      const p = path.join(assets, a.name);
      const exists = await fs.stat(p).then(
        () => true,
        () => false,
      );
      if (!exists) await fs.writeFile(p, Buffer.from(a.base64, "base64"));
    }
    // replace any earlier file (and preview) of this post, wherever its date folder was
    for (const [p, old] of await allPosts()) {
      if (old.key !== data.key) continue;
      await removeFile(p);
      if (old.preview) await fs.rm(path.join(previews, path.basename(old.preview)), { force: true });
    }
    let preview: string | null = null;
    if (data.preview) {
      const name = `${safeKey(data.key)}-${Date.now().toString(36)}.webp`;
      await fs.writeFile(path.join(previews, name), Buffer.from(data.preview.split(",")[1], "base64"));
      preview = PREVIEW_URL + name;
    }
    const file: PostFile = {
      schema: SCHEMA,
      key: data.key,
      templateId: data.templateId,
      date: data.date,
      time: data.time,
      savedAt: new Date().toISOString(),
      preview,
      data: JSON.parse(data.dataJson),
    };
    await fs.mkdir(path.join(posts, data.date), { recursive: true });
    await fs.writeFile(path.join(posts, data.date, `${safeKey(data.key)}.json`), JSON.stringify(file, null, 2) + "\n", "utf8");
    const { data: _d, ...meta } = file;
    void _d;
    return { json: JSON.stringify(meta) };
  });

/** Remove a saved post and its preview (photos stay: other posts may use them). */
export const removeSavedPost = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => ({ key: String(d.key ?? "") }))
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const { path, previews } = await dirs();
    for (const [p, old] of await allPosts()) {
      if (old.key !== data.key) continue;
      await removeFile(p);
      if (old.preview) await fs.rm(path.join(previews, path.basename(old.preview)), { force: true });
    }
    return { ok: true };
  });
