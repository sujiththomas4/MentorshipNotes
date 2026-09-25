import { useState } from "react";
import { Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { imageToMp4, videoDims, videoSupported, type VideoMotion, type VideoSize } from "@/social/video";

/*
 * "Download video" under a post preview: the post as an MP4 for Reels. `getPng` makes the
 * post's PNG at full size (the same one Download PNG saves); the video is built from it.
 */

const SECONDS = [5, 7, 10, 15, 30];
const pill = "rounded-md px-2.5 py-1 text-xs font-medium";

function Pills<V extends string | number>({ value, onChange, options }: { value: V; onChange: (v: V) => void; options: [V, string][] }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg bg-secondary p-1">
      {options.map(([v, label]) => (
        <button key={String(v)} type="button" onClick={() => onChange(v)} aria-pressed={value === v} className={cn(pill, value === v ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function VideoDownload({ getPng, fileBase, w, h, onMsg }: { getPng: () => Promise<Blob>; fileBase: string; w: number; h: number; onMsg: (s: string) => void }) {
  const [seconds, setSeconds] = useState(10);
  const [size, setSize] = useState<VideoSize>("post");
  const [motion, setMotion] = useState<VideoMotion>("still");
  const [progress, setProgress] = useState<number | null>(null);
  const isReelShape = Math.abs(w / h - 9 / 16) < 0.01;
  const out = videoDims(w, h, isReelShape ? "post" : size);

  async function make() {
    setProgress(0);
    onMsg("Creating video…");
    try {
      const png = await getPng();
      const mp4 = await imageToMp4(png, { seconds, size: isReelShape ? "post" : size, motion }, setProgress);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(mp4);
      a.download = `${fileBase}${out.h !== h ? "_reel" : ""}_${seconds}s.mp4`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      onMsg(`Saved ${seconds}-second ${out.w} × ${out.h} MP4 (${(mp4.size / 1024 / 1024).toFixed(1)} MB).`);
    } catch (e) {
      onMsg(`Couldn't create the video: ${e instanceof Error ? e.message : String(e)}. Chrome or Edge work best.`);
    } finally {
      setProgress(null);
    }
  }

  if (!videoSupported()) return <p className="mt-3 text-xs text-muted-foreground">Video download needs Chrome or Edge.</p>;
  return (
    <div className="mt-3 space-y-2 rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="w-14">Length</span>
        <Pills value={seconds} onChange={setSeconds} options={SECONDS.map((s) => [s, `${s}s`])} />
      </div>
      {!isReelShape && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="w-14">Size</span>
          <Pills
            value={size}
            onChange={setSize}
            options={[
              ["post", `Post ${w} × ${h}`],
              ["reel", "Reel 1080 × 1920"],
            ]}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="w-14">Motion</span>
        <Pills
          value={motion}
          onChange={setMotion}
          options={[
            ["still", "Still"],
            ["zoom", "Slow zoom"],
          ]}
        />
      </div>
      <button
        type="button"
        onClick={make}
        disabled={progress !== null}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0A3A20] px-4 py-2.5 font-display font-bold text-[#0A3A20] hover:bg-[#0A3A20]/5 disabled:opacity-60 dark:border-[#8FC18F] dark:text-[#8FC18F]"
      >
        {progress !== null ? <Loader2 className="h-5 w-5 animate-spin" /> : <Film className="h-5 w-5" />}
        {progress !== null ? `Creating video… ${Math.round(progress * 100)}%` : `Download video (MP4, ${seconds}s)`}
      </button>
      <p className="text-xs text-muted-foreground">
        {size === "reel" && !isReelShape ? "The post sits in the middle over a blurred copy of itself. " : ""}
        Silent H.264 MP4; add music in Instagram.
      </p>
    </div>
  );
}
