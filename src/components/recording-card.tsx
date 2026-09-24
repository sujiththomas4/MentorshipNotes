import { useState } from "react";
import { Check, Copy, ExternalLink, KeyRound, Video } from "lucide-react";
import type { SessionMeta } from "@/content";
import { prettyDate } from "@/lib/dates";

/** The session's class recording: open it, and copy the passcode to paste into Zoom. */
export function RecordingCard({ recording, color }: { recording: NonNullable<SessionMeta["recording"]>; color: string }) {
  const [copied, setCopied] = useState(false);
  const host = (() => {
    try {
      return new URL(recording.url).hostname.replace(/^www\./, "");
    } catch {
      return "recording";
    }
  })();

  function copy() {
    if (!recording.passcode) return;
    navigator.clipboard?.writeText(recording.passcode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="card-elevated mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
        style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, black))` }}
      >
        <Video className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Class recording{recording.date ? ` · ${prettyDate(recording.date)}` : ""}
        </p>
        <p className="font-display text-lg font-semibold">Watch this session again</p>
        {recording.note && <p className="text-sm text-muted-foreground">{recording.note}</p>}
      </div>

      {recording.passcode && (
        <button
          type="button"
          onClick={copy}
          title="Copy passcode"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gold bg-gold/10 px-3 py-2 hover:bg-gold/20"
        >
          <KeyRound className="h-4 w-4 text-gold" />
          <span className="text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copied ? "Copied" : "Passcode · click to copy"}
            </span>
            <span className="font-mono text-base font-bold">{recording.passcode}</span>
          </span>
          {copied ? <Check className="h-4 w-4 text-bull" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
        </button>
      )}

      <a
        href={recording.url}
        target="_blank"
        rel="noreferrer"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        style={{ backgroundColor: color }}
        title={`Opens ${host}${recording.passcode ? " and copies the passcode" : ""}`}
      >
        Open recording <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
