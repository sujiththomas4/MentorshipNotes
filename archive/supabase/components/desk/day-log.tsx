import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/page";
import { prettyDate, weekday } from "@/lib/dates";
import {
  EXAMPLE_LOG,
  acceptance,
  closeLabel,
  fmt,
  fromRow,
  num,
  openLocation,
  type TradingDay,
} from "@/lib/market-profile";
import { cn } from "@/lib/utils";

const badgeTone = {
  bull: "bg-bull/12 text-bull",
  bear: "bg-bear/12 text-bear",
  neu: "bg-neutral-tone/12 text-neutral-tone",
  gold: "bg-gold/15 text-gold",
};

function Stats({ stats }: { stats: [string, string][] }) {
  return (
    <div className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
      {stats.map(([k, v]) => (
        <div key={k} className="border-t-2 border-border pt-1.5">
          <p className="eyebrow text-[9.5px]">{k}</p>
          <p className="font-mono text-sm tabular-nums">{v}</p>
        </div>
      ))}
    </div>
  );
}

export function DayLog({
  days,
  activeDate,
  onOpen,
}: {
  days: TradingDay[];
  activeDate: string;
  onOpen: (date: string) => void;
}) {
  const [q, setQ] = useState("");

  if (days.length === 0) {
    return (
      <div className="space-y-3">
        {EXAMPLE_LOG.map((x) => (
          <article key={x.id} className="overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/50">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-5 py-3">
              <span className="font-display font-semibold">{x.title}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{x.sub}</span>
              <span className="flex-1" />
              <span className="rounded border border-border px-2 py-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                {x.dayType}
              </span>
            </div>
            <div className="px-5 py-4">
              <Stats stats={x.stats as [string, string][]} />
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{x.notes}</p>
              <Lesson text={x.lesson} />
            </div>
          </article>
        ))}
      </div>
    );
  }

  const query = q.trim().toLowerCase();
  const list = days.filter(
    (d) =>
      !query ||
      [d.notes, d.lesson, d.day_type, d.day, prettyDate(d.day)].join(" ").toLowerCase().includes(query),
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className="pl-9"
          placeholder="Search notes, day types, lessons…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {list.length === 0 && <EmptyState>No days match “{q}”.</EmptyState>}
      <div className="space-y-3">
        {list.map((row) => {
          const d = fromRow(row);
          const loc = openLocation(d);
          const acc = acceptance(d);
          const on = row.day === activeDate;
          return (
            <article
              key={row.day}
              className={cn(
                "card-elevated overflow-hidden rounded-2xl border bg-card",
                on ? "border-accent ring-1 ring-accent" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-5 py-3">
                <span className="font-display font-semibold">{prettyDate(row.day)}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{weekday(row.day)}</span>
                <span className="flex-1" />
                {row.day_type && (
                  <span className="rounded border border-border px-2 py-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    {row.day_type}
                  </span>
                )}
                {(acc || loc) && (
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10.5px] uppercase tracking-wider",
                      badgeTone[(acc ?? loc)!.tone],
                    )}
                  >
                    {acc ? acc.bias : loc!.label}
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={() => onOpen(row.day)} disabled={on}>
                  {on ? "Editing" : "Open"}
                </Button>
              </div>
              <div className="px-5 py-4">
                <Stats
                  stats={[
                    ["POC", fmt(num(d.poc))],
                    ["VAH", fmt(num(d.vah))],
                    ["VAL", fmt(num(d.val))],
                    ["Open", fmt(num(d.open))],
                    ["40m close", closeLabel(d.m40)],
                    ["30m close", closeLabel(d.m30)],
                  ]}
                />
                {d.notes ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{d.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No key notes for this day yet.</p>
                )}
                {d.lesson && <Lesson text={d.lesson} />}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Lesson({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-lg border-l-[3px] border-gold bg-gold/10 px-3.5 py-2.5 text-sm leading-relaxed">
      <span className="eyebrow mb-0.5 block text-[10px] text-gold">Lesson</span>
      {text}
    </div>
  );
}
