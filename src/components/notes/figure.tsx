import { useEffect, useState, type ReactNode } from "react";
import { ImageOff, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

/** "s01/ib.png" → "/screenshots/s01/ib.png"; absolute paths and URLs pass through. */
export function screenshotUrl(src: string) {
  return /^(https?:)?\//.test(src) ? src : `/screenshots/${src}`;
}

/**
 * A screenshot with a caption. Click to open it full screen.
 * `src` is relative to public/screenshots unless it starts with / or http.
 */
export function Figure({
  src,
  alt,
  caption,
  width = "full",
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  /** full = column width, md = narrower for tall or small images */
  width?: "full" | "md";
}) {
  const url = screenshotUrl(src);
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <figure className={cn("my-6", width === "md" && "mx-auto max-w-lg")}>
      {broken ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-10 text-center text-sm text-muted-foreground">
          <ImageOff className="h-6 w-6" />
          <span>
            Screenshot not found: <code className="font-mono text-xs">public{url}</code>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block w-full overflow-hidden rounded-xl border border-border bg-card card-elevated"
          aria-label={`Enlarge: ${alt}`}
        >
          <img src={url} alt={alt} loading="lazy" onError={() => setBroken(true)} className="block h-auto w-full" />
          <span className="absolute right-2 top-2 rounded-md bg-foreground/70 p-1.5 text-background opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" />
          </span>
        </button>
      )}
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/85 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-background/15 p-2 text-background hover:bg-background/25"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={url} alt={alt} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
        </div>
      )}
    </figure>
  );
}

/** A screenshot with numbered markers placed on top, explained in a list below. */
export function AnnotatedFigure({
  src,
  alt,
  caption,
  marks,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  /** x / y are percentages of the image width / height */
  marks: { x: number; y: number; text: ReactNode }[];
}) {
  const [broken, setBroken] = useState(false);
  return (
    <figure className="my-6">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card card-elevated">
        {broken ? (
          <div className="flex min-h-48 items-center justify-center p-6 text-sm text-muted-foreground">
            Screenshot not found: <code className="ml-1 font-mono text-xs">public{screenshotUrl(src)}</code>
          </div>
        ) : (
          <img src={screenshotUrl(src)} alt={alt} onError={() => setBroken(true)} className="block h-auto w-full" />
        )}
        {marks.map((m, i) => (
          <span
            key={i}
            data-noindex
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-xs font-bold text-white ring-2 ring-white shadow"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            {i + 1}
          </span>
        ))}
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
      <ol className="mt-3 space-y-1.5">
        {marks.map((m, i) => (
          <li key={i} className="flex gap-2.5 text-[15px]">
            <span data-noindex className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-white">
              {i + 1}
            </span>
            <span>{m.text}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
