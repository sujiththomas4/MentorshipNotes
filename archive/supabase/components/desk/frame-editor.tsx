import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/page";
import { Readout } from "@/components/desk/readout";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/auth";
import { qk } from "@/lib/queries";
import {
  DAY_TYPES,
  EXAMPLE_DAY,
  fromRow,
  hasLevels,
  toRow,
  type Close,
  type DayFields,
  type LevelKey,
  type TradingDay,
} from "@/lib/market-profile";
import { cn } from "@/lib/utils";

type Props = {
  date: string;
  initial: TradingDay | null;
  onDateChange: (date: string) => void;
  onCleared: () => void;
};

const nativeSelect =
  "h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const LEVELS: { key: LevelKey; label: string; placeholder: string; edge?: "value" | "poc" }[] = [
  { key: "pdh", label: "Prev high (PDH)", placeholder: "24980" },
  { key: "vah", label: "Value area high", placeholder: "24935", edge: "value" },
  { key: "poc", label: "Point of control", placeholder: "24860", edge: "poc" },
  { key: "val", label: "Value area low", placeholder: "24790", edge: "value" },
  { key: "pdl", label: "Prev low (PDL)", placeholder: "24745" },
];

/**
 * Levels, first-hour closes, day notes and lesson for one date. Keeps its own copy of the
 * row and autosaves 700 ms after the last change; mount it with key={date}.
 */
export function FrameEditor({ date, initial, onDateChange, onCleared }: Props) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const [d, setD] = useState<DayFields>(() => fromRow(initial));
  const [dirty, setDirty] = useState(false);
  const [exampleDismissed, setExampleDismissed] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // latest values for the save that runs on unmount
  const latest = useRef(d);
  latest.current = d;
  const pending = useRef(false);
  const chain = useRef<Promise<void>>(Promise.resolve());

  const save = useCallback(() => {
    pending.current = false;
    const row = { user_id: userId, day: date, ...toRow(latest.current), updated_at: new Date().toISOString() };
    // one write at a time, in order
    chain.current = chain.current.then(async () => {
      setStatus("saving");
      const { error } = await supabase.from("trading_days").upsert(row, { onConflict: "user_id,day" });
      if (error) {
        setStatus("error");
        toast.error(`Couldn't save the day: ${error.message}`);
        return;
      }
      queryClient.setQueryData(qk.tradingDay(date), row);
      queryClient.invalidateQueries({ queryKey: qk.tradingDays });
      setStatus("saved");
    });
  }, [date, userId, queryClient]);

  useEffect(() => {
    if (!dirty || !pending.current) return;
    const t = setTimeout(save, 700);
    return () => clearTimeout(t);
  }, [d, dirty, save]);

  // switching date mid-edit still saves what was typed
  useEffect(() => () => {
    if (pending.current) save();
  }, [save]);

  function set<K extends keyof DayFields>(key: K, value: DayFields[K]) {
    pending.current = true;
    setDirty(true);
    setD((prev) => ({ ...prev, [key]: value }));
  }

  async function clearDay() {
    pending.current = false;
    const r1 = await supabase.from("trading_days").delete().eq("day", date);
    const r2 = await supabase.from("live_entries").delete().eq("day", date);
    const error = r1.error ?? r2.error;
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.setQueryData(qk.tradingDay(date), null);
    queryClient.invalidateQueries({ queryKey: qk.tradingDays });
    queryClient.invalidateQueries({ queryKey: qk.live(date) });
    toast.success("Day cleared");
    onCleared();
  }

  const showExample = !initial && !dirty && !exampleDismissed && !hasLevels(d);
  const frame = showExample ? EXAMPLE_DAY : d;

  return (
    <>
      <Card>
        {showExample && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-dashed border-gold bg-gold/10 px-3.5 py-2.5 text-sm">
            <b className="shrink-0 pt-px text-[11px] uppercase tracking-wider text-gold">Example</b>
            <span className="flex-1 text-muted-foreground">
              The read-out below uses placeholder levels so you can see it working. Type your own numbers — nothing is
              saved until you edit a field.
            </span>
            <button
              type="button"
              aria-label="Dismiss example"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setExampleDismissed(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-44 space-y-1.5">
            <Label htmlFor="frame-date" className="eyebrow">
              Session date
            </Label>
            <Input
              id="frame-date"
              type="date"
              value={date}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
            />
          </div>
          <span
            className={cn("text-xs", status === "error" ? "text-destructive" : "text-muted-foreground")}
            aria-live="polite"
          >
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Not saved" : "Saves automatically"}
          </span>
        </div>

        <p className="eyebrow mb-2.5 mt-6">Previous day profile</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {LEVELS.map((l) => (
            <div key={l.key} className="space-y-1.5">
              <Label htmlFor={`lvl-${l.key}`} className="text-xs text-muted-foreground">
                {l.label}
              </Label>
              <Input
                id={`lvl-${l.key}`}
                inputMode="decimal"
                placeholder={l.placeholder}
                value={d[l.key]}
                onChange={(e) => set(l.key, e.target.value)}
                className={cn(
                  "font-mono tabular-nums",
                  l.edge === "value" && "border-l-[3px] border-l-gold",
                  l.edge === "poc" && "border-l-[3px] border-l-bear",
                )}
              />
            </div>
          ))}
        </div>

        <p className="eyebrow mb-2.5 mt-6">Today's open and the first hour</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="lvl-open" className="text-xs text-muted-foreground">
              Open
            </Label>
            <Input
              id="lvl-open"
              inputMode="decimal"
              placeholder="24955"
              value={d.open}
              onChange={(e) => set("open", e.target.value)}
              className="font-mono tabular-nums"
            />
          </div>
          <CloseSelect id="m40" label="40-min candle closed" value={d.m40} onChange={(v) => set("m40", v)} />
          <CloseSelect id="m30" label="Next 30-min closed" value={d.m30} onChange={(v) => set("m30", v)} />
          <div className="space-y-1.5">
            <Label htmlFor="day-type" className="text-xs text-muted-foreground">
              Day type read
            </Label>
            <select
              id="day-type"
              className={nativeSelect}
              value={d.day_type}
              onChange={(e) => set("day_type", e.target.value)}
            >
              <option value="">—</option>
              {DAY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Readout frame={frame} />

      <Card className="mt-4">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="day-notes" className="eyebrow">
              Key notes for the day
            </Label>
            <Textarea
              id="day-notes"
              rows={4}
              value={d.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="What set up, what the profile was telling you, what you acted on."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="day-lesson" className="eyebrow">
              Lesson / rule to carry forward
            </Label>
            <Textarea
              id="day-lesson"
              rows={2}
              value={d.lesson}
              onChange={(e) => set("lesson", e.target.value)}
              placeholder="One line you want to see again tomorrow."
            />
          </div>
          <div className="flex justify-end">
            <ConfirmDialog
              title="Clear this day?"
              description="Removes the levels, notes, lesson and every live note for this date."
              confirmLabel="Clear day"
              onConfirm={clearDay}
              trigger={
                <Button variant="outline" size="sm">
                  Clear this day
                </Button>
              }
            />
          </div>
        </div>
      </Card>
    </>
  );
}

function CloseSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: Close | "";
  onChange: (v: Close | "") => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <select
        id={id}
        className={nativeSelect}
        value={value}
        onChange={(e) => onChange(e.target.value as Close | "")}
      >
        <option value="">—</option>
        <option value="above">Above VAH</option>
        <option value="inside">Inside value</option>
        <option value="below">Below VAL</option>
      </select>
    </div>
  );
}
