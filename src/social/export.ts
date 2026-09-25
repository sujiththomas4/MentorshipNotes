/*
 * SVG → PNG at the artwork's real size. The SVG is drawn into a canvas whose pixel size is
 * set explicitly (never from CSS), so the export is exact regardless of the preview scale.
 * Fonts: an SVG drawn as an image cannot use the page's web fonts, so the Inter font files
 * are fetched once and embedded into the SVG as data URLs before rendering.
 */

const FONT_CSS = "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=Lobster+Two:ital,wght@1,700&family=Poppins:wght@400;500;600;700&family=Permanent+Marker&family=Barlow+Condensed:wght@600;700&display=swap";
let fontCssPromise: Promise<string> | null = null;

async function toDataUrl(url: string) {
  const blob = await (await fetch(url)).blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

const imageCache = new Map<string, Promise<string>>();
function imageDataUrl(url: string) {
  if (!imageCache.has(url)) imageCache.set(url, toDataUrl(url));
  return imageCache.get(url)!;
}

/** Inter / Poppins @font-face rules with the font files inlined. Empty string if offline. */
function embeddedFontCss() {
  fontCssPromise ??= (async () => {
    try {
      let css = await (await fetch(FONT_CSS)).text();
      // keep only the latin + latin-ext subsets (latin-ext has ₹): all the artwork uses, and it keeps the SVG small
      const blocks = css.split("@font-face").filter((b) => /U\+0000-00FF|U\+0100-02BA/.test(b));
      css = blocks.map((b) => "@font-face" + b).join("\n");
      const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
      const data = await Promise.all(urls.map(toDataUrl));
      urls.forEach((u, i) => (css = css.split(u).join(data[i])));
      return css;
    } catch {
      return "";
    }
  })();
  return fontCssPromise;
}

export async function svgToPngBlob(svg: SVGSVGElement, width: number, height: number): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  clone.removeAttribute("style");

  // an SVG drawn as an <img> cannot load external files: inline every <image> (e.g. the logo)
  const images = Array.from(clone.querySelectorAll("image"));
  await Promise.all(
    images.map(async (el) => {
      const href = el.getAttribute("href") ?? el.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (!href || href.startsWith("data:")) return;
      el.setAttribute("href", await imageDataUrl(new URL(href, location.href).href));
    }),
  );

  const css = await embeddedFontCss();
  if (css) {
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = css;
    clone.insertBefore(style, clone.firstChild);
  }

  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "sync";
    img.src = url;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

type DirHandle = {
  getDirectoryHandle(name: string, o?: { create?: boolean }): Promise<DirHandle>;
  getFileHandle(name: string, o?: { create?: boolean }): Promise<{
    createWritable(): Promise<{ write(b: Blob): Promise<void>; close(): Promise<void> }>;
  }>;
};

/**
 * Save several SVGs as PNGs. Where the browser allows it (Chrome / Edge), the user picks a
 * folder and the files go into a sub-folder named `folder` (e.g. the date). Otherwise each
 * file downloads separately, prefixed with the folder name.
 * Returns "folder" or "downloads" to say which way it went.
 */
export async function saveAllAsPng(
  items: { svg: SVGSVGElement; filename: string }[],
  width: number,
  height: number,
  folder: string,
): Promise<"folder" | "downloads" | "cancelled"> {
  return saveAllBlobs(
    items.map((it) => ({ filename: it.filename, blob: () => svgToPngBlob(it.svg, width, height) })),
    folder,
  );
}

/** Same as saveAllAsPng for any images: each item makes its PNG blob when it is saved. */
export async function saveAllBlobs(items: { filename: string; blob: () => Promise<Blob> }[], folder: string): Promise<"folder" | "downloads" | "cancelled"> {
  const picker = (window as unknown as { showDirectoryPicker?: (o?: object) => Promise<DirHandle> }).showDirectoryPicker;
  if (picker) {
    let root: DirHandle;
    try {
      root = await picker({ mode: "readwrite", id: "instagram-posts" });
    } catch {
      return "cancelled";
    }
    const dir = await root.getDirectoryHandle(folder, { create: true });
    for (const it of items) {
      const blob = await it.blob();
      const fh = await dir.getFileHandle(it.filename, { create: true });
      const w = await fh.createWritable();
      await w.write(blob);
      await w.close();
    }
    return "folder";
  }
  for (const it of items) {
    downloadBlob(await it.blob(), `${folder}_${it.filename}`);
    await new Promise((r) => setTimeout(r, 400));
  }
  return "downloads";
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function downloadSvgAsPng(svg: SVGSVGElement, width: number, height: number, filename: string) {
  downloadBlob(await svgToPngBlob(svg, width, height), filename);
}
