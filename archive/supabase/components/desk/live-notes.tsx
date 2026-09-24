import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, Spinner } from "@/components/page";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/auth";
import { nowTime } from "@/lib/dates";
import { LIVE_TAGS, type LiveTag } from "@/lib/market-profile";
import { qk, useLiveEntries } from "@/lib/queries";
import { cn } from "@/lib/utils";

const tagClass: Record<LiveTag, string> = {
  read: "bg-neutral-tone/12 text-neutral-tone",
  level: "bg-gold/15 text-gold",
  entry: "bg-bull/12 text-bull",
  exit: "bg-bear/12 text-bear",
  mistake: "bg-bear/12 text-bear",
};

/** Timestamped notes during the session, filed under the desk's date. */
export function LiveNotes({ date }: { date: string }) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useLiveEntries(date);
  const [text, setText] = useState("");
  const [tag, setTag] = useState<LiveTag>("read");
  const [busy, setBusy] = useState(false);

  async function add() {
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    const { error } = await supabase.from("live_entries").insert({ user_id: userId, day: date, ts: nowTime(), tag, text: t });
    setBusy(false);
    if (error) return toast.error(error.message);
    setText("");
    queryClient.invalidateQueries({ queryKey: qk.live(date) });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("live_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: qk.live(date) });
  }

  return (
    <Card>
      <Textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") add();
        }}
        placeholder="What is the market doing right now? Level touched, absorption seen, why you took or skipped the trade…"
        aria-label="Live note"
      />
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {LIVE_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
              tag === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
        <span className="flex-1" />
        <Button onClick={add} disabled={busy || !text.trim()}>
          Stamp note
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-4 flex justify-center">
          <Spinner />
        </div>
      ) : entries.length === 0 ? (
        <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
          Nothing stamped for this date. Notes are timestamped as you add them.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {entries.map((e) => (
            <li key={e.id} className="flex gap-3 py-3">
              <span className="w-12 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-muted-foreground">{e.ts}</span>
              <div className="min-w-0 flex-1">
                <span className={cn("mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", tagClass[e.tag] ?? tagClass.read)}>
                  {e.tag}
                </span>
                <p className="whitespace-pre-wrap break-words">{e.text}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(e.id)}
                aria-label="Delete note"
                className="self-start rounded p-1 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
