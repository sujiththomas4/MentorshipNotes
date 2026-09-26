import { useEffect, useRef } from "react";
import { ClipboardPaste } from "lucide-react";

/*
 * Pasting an image (Snipping Tool, a screenshot, "Copy image" in a browser) instead of
 * uploading a file: Ctrl+V anywhere on the page, or the Paste image button.
 */

const PASTED_NAME = "pasted image";

function imageFrom(items: DataTransferItemList | undefined | null): File | null {
  for (const it of items ? [...items] : []) {
    if (it.kind !== "file" || !it.type.startsWith("image/")) continue;
    const f = it.getAsFile();
    if (f) return new File([f], PASTED_NAME, { type: f.type });
  }
  return null;
}

/** Calls `onImage` when an image is pasted anywhere on the page (text pastes are left alone). */
export function usePasteImage(onImage: (file: File) => void) {
  const cb = useRef(onImage);
  cb.current = onImage;
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = imageFrom(e.clipboardData?.items);
      if (!file) return;
      e.preventDefault();
      cb.current(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);
}

/** Reads an image from the clipboard (the browser may ask for permission once). */
export function PasteImageButton({ onImage, onMsg, className, label = "Paste image" }: { onImage: (file: File) => void; onMsg: (m: string) => void; className?: string; label?: string }) {
  async function paste() {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        onImage(new File([blob], PASTED_NAME, { type }));
        return;
      }
      onMsg("There is no image on the clipboard. Copy one first (e.g. Snipping Tool → Copy), then paste.");
    } catch {
      onMsg("The browser did not allow reading the clipboard. Press Ctrl+V on this page instead.");
    }
  }
  return (
    <button type="button" onClick={paste} className={className} title="Paste a copied image (or press Ctrl+V anywhere on this page)">
      <ClipboardPaste className="h-4 w-4" /> {label}
    </button>
  );
}

export const PASTE_HINT = "Tip: copy an image (Snipping Tool, screenshot, “Copy image”) and press Ctrl+V anywhere on this page.";
