import { ArrayBufferTarget, Muxer } from "mp4-muxer";

/*
 * Still image → MP4 video (for Instagram Reels), made in the browser with WebCodecs.
 * H.264 High profile at a very low quantizer, so text stays sharp; frames that don't change
 * cost almost nothing, so a 10-second still is only a little bigger than the PNG.
 * "reel" puts a 4:5 post on a 1080 × 1920 canvas over a blurred copy of itself.
 */

export type VideoSize = "post" | "reel";
export type VideoMotion = "still" | "zoom";
export type VideoOptions = { seconds: number; size: VideoSize; motion: VideoMotion };

const FPS = 30;
const REEL = { w: 1080, h: 1920 };
/** H.264 quantizer (lower = better); 14 is visually lossless for flat graphics and text */
const QP = 14;

export const videoSupported = () => typeof window !== "undefined" && "VideoEncoder" in window && "VideoFrame" in window;

/** Size of the video for an image of w × h. */
export function videoDims(w: number, h: number, size: VideoSize) {
  return size === "reel" ? REEL : { w: w - (w % 2), h: h - (h % 2) };
}

async function pickConfig(w: number, h: number): Promise<{ config: VideoEncoderConfig; quantizer: boolean }> {
  const base = { width: w, height: h, framerate: FPS, avc: { format: "avc" as const } };
  // High profile level 4.2, then Main, then Baseline, for older encoders
  for (const codec of ["avc1.64002A", "avc1.4D402A", "avc1.42E02A"]) {
    const q: VideoEncoderConfig = { ...base, codec, bitrateMode: "quantizer" as VideoEncoderBitrateMode };
    if ((await VideoEncoder.isConfigSupported(q).catch(() => null))?.supported) return { config: q, quantizer: true };
    const v: VideoEncoderConfig = { ...base, codec, bitrate: 20_000_000, bitrateMode: "variable" };
    if ((await VideoEncoder.isConfigSupported(v).catch(() => null))?.supported) return { config: v, quantizer: false };
  }
  throw new Error("this browser can't make H.264 video");
}

/** Draw the image into the frame: fitted, over a blurred fill when the shapes differ. */
function drawFrame(ctx: CanvasRenderingContext2D, img: ImageBitmap, w: number, h: number, zoom: number) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2, -h / 2);
  const fit = Math.min(w / img.width, h / img.height);
  const dw = img.width * fit;
  const dh = img.height * fit;
  if (Math.abs(dw - w) > 1 || Math.abs(dh - h) > 1) {
    const cover = Math.max(w / img.width, h / img.height) * 1.1;
    ctx.filter = "blur(40px) brightness(.9)";
    ctx.drawImage(img, (w - img.width * cover) / 2, (h - img.height * cover) / 2, img.width * cover, img.height * cover);
    ctx.filter = "none";
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.restore();
}

/** Make the MP4. `onProgress` gets 0–1. */
export async function imageToMp4(png: Blob, opts: VideoOptions, onProgress?: (p: number) => void): Promise<Blob> {
  if (!videoSupported()) throw new Error("video needs Chrome or Edge");
  const img = await createImageBitmap(png);
  const { w, h } = videoDims(img.width, img.height, opts.size);
  const { config, quantizer } = await pickConfig(w, h);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false })!;

  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: "avc", width: w, height: h, frameRate: FPS }, fastStart: "in-memory" });
  let failed: unknown = null;
  const encoder = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => (failed = e) });
  encoder.configure(config);

  const frames = Math.round(opts.seconds * FPS);
  const step = 1_000_000 / FPS;
  try {
    for (let i = 0; i < frames; i++) {
      if (failed) throw failed;
      // still: draw once, the same picture for every frame; zoom: 100% → 106% over the clip
      if (opts.motion === "zoom" || i === 0) drawFrame(ctx, img, w, h, opts.motion === "zoom" ? 1 + 0.06 * (i / Math.max(1, frames - 1)) : 1);
      const frame = new VideoFrame(canvas, { timestamp: Math.round(i * step), duration: Math.round(step) });
      const keyFrame = i % (FPS * 2) === 0;
      encoder.encode(frame, quantizer ? ({ keyFrame, avc: { quantizer: QP } } as VideoEncoderEncodeOptions) : { keyFrame });
      frame.close();
      while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 5));
      if (i % 15 === 0) onProgress?.(i / frames);
    }
    await encoder.flush();
    if (failed) throw failed;
  } finally {
    if (encoder.state !== "closed") encoder.close();
    img.close();
  }
  muxer.finalize();
  onProgress?.(1);
  return new Blob([muxer.target.buffer], { type: "video/mp4" });
}
