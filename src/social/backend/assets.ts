/*
 * Photos inside saved posts. The editors keep images as data: URLs (uploads) or URLs. When a
 * post is saved, every embedded data: image becomes a file named by its content hash and the
 * data keeps a portable reference "asset:<sha1>.<ext>". Loading turns references back into
 * URLs for the current backend. Moving to Supabase = uploading the same files to a bucket;
 * the saved JSON does not change.
 */

export const ASSET_PREFIX = "asset:";
const DATA_IMAGE = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/;
/** small images (icons) can stay inline */
const MIN_INLINE_CHARS = 4000;

export type AssetFile = { name: string; base64: string };

async function sha1Hex(bytes: Uint8Array) {
  const h = await crypto.subtle.digest("SHA-1", bytes as unknown as ArrayBuffer);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Walk any JSON value, replacing strings with fn(s). */
async function mapStrings(v: unknown, fn: (s: string) => Promise<string> | string): Promise<unknown> {
  if (typeof v === "string") return fn(v);
  if (Array.isArray(v)) return Promise.all(v.map((x) => mapStrings(x, fn)));
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = await mapStrings(x, fn);
    return out;
  }
  return v;
}

/**
 * Data ready to store: embedded images → "asset:<name>" (+ the files to write), and URLs of
 * already-stored assets (`urlOf(name)`) → back to their reference.
 */
export async function toPortable(data: unknown, assetUrlPrefix: string): Promise<{ data: unknown; files: AssetFile[] }> {
  const files = new Map<string, AssetFile>();
  const out = await mapStrings(data, async (s) => {
    if (s.startsWith(assetUrlPrefix)) return ASSET_PREFIX + s.slice(assetUrlPrefix.length);
    const m = s.length >= MIN_INLINE_CHARS ? DATA_IMAGE.exec(s) : null;
    if (!m) return s;
    const name = `${await sha1Hex(b64ToBytes(m[2]))}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
    files.set(name, { name, base64: m[2] });
    return ASSET_PREFIX + name;
  });
  return { data: out, files: [...files.values()] };
}

/** Stored data → editor data: "asset:<name>" → a URL the browser can load. */
export async function fromPortable(data: unknown, urlOf: (name: string) => string) {
  return mapStrings(data, (s) => (s.startsWith(ASSET_PREFIX) ? urlOf(s.slice(ASSET_PREFIX.length)) : s));
}
