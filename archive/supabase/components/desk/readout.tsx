import { Card } from "@/components/page";
import {
  acceptance,
  fmt,
  num,
  openLocation,
  targetsFor,
  type DayFields,
  type Tone,
} from "@/lib/market-profile";
import { cn } from "@/lib/utils";

const toneClass: Record<Tone, { border: string; text: string }> = {
  bull: { border: "border-bull", text: "text-bull" },
  bear: { border: "border-bear", text: "text-bear" },
  neu: { border: "border-neutral-tone", text: "text-neutral-tone" },
  gold: { border: "border-gold", text: "text-gold" },
};

function ReadBlock({ k, tone, label, detail }: { k: string; tone: Tone; label: string; detail: string }) {
  return (
    <div className={cn("border-l-[3px] pl-3", toneClass[tone].border)}>
      <p className="eyebrow text-[10px]">{k}</p>
      <p className={cn("mt-0.5 font-display text-base font-semibold leading-snug", toneClass[tone].text)}>{label}</p>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">{detail}</p>
    </div>
  );
}

export function Readout({ frame }: { frame: DayFields }) {
  const loc = openLocation(frame);
  const acc = acceptance(frame);
  const targets = acc ? targetsFor(frame, acc.tone) : [];

  return (
    <Card className="mt-4">
      <p className="eyebrow mb-3">Read-out</p>
      <div className="grid gap-4 md:grid-cols-3">
        <ReadBlock
          k="Open location"
          tone={loc?.tone ?? "gold"}
          label={loc?.label ?? "—"}
          detail={loc?.detail ?? "Enter the previous value area and today's open."}
        />
        <ReadBlock
          k="Acceptance · 40m → 30m"
          tone={acc?.tone ?? "neu"}
          label={acc?.label ?? "—"}
          detail={acc?.detail ?? "Set both closes to get a read."}
        />
        <ReadBlock
          k="Working bias"
          tone={acc?.tone ?? "neu"}
          label={acc?.bias ?? "—"}
          detail={
            acc && loc
              ? `Open ${loc.label.toLowerCase()} → ${acc.bias.toLowerCase()}. Provisional rule set.`
              : "Provisional until the mentorship rules are in."
          }
        />
      </div>

      {targets.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {targets.map(([label, value]) => (
            <span key={label} className="rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-xs tabular-nums">
              {label} <b className="text-gold">{value}</b>
            </span>
          ))}
        </div>
      )}

      <ProfileStrip frame={frame} openLabel={loc?.label} />

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        The bias logic is a working placeholder built on plain acceptance / rejection. It gets replaced with the
        mentorship's decision tree once the rules are written up.
      </p>
    </Card>
  );
}

function ProfileStrip({ frame, openLabel }: { frame: DayFields; openLabel?: string }) {
  const vah = num(frame.vah), poc = num(frame.poc), val = num(frame.val);
  const pdh = num(frame.pdh), pdl = num(frame.pdl), open = num(frame.open);
  if (vah === null || poc === null || val === null) return null;

  type Row = { tag: string; px: number; mark: string; kind: "plain" | "edge" | "poc" };
  const rows: Row[] = [
    ...(pdh !== null ? [{ tag: "PDH", px: pdh, mark: "", kind: "plain" as const }] : []),
    { tag: "VAH", px: vah, mark: "value high", kind: "edge" },
    { tag: "POC", px: poc, mark: "fairest price", kind: "poc" },
    { tag: "VAL", px: val, mark: "value low", kind: "edge" },
    ...(pdl !== null ? [{ tag: "PDL", px: pdl, mark: "", kind: "plain" as const }] : []),
  ];
  rows.sort((a, b) => b.px - a.px);

  return (
    <div className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-secondary/40 font-mono text-xs tabular-nums">
      {rows.map((r) => (
        <div key={r.tag} className={cn("flex items-center gap-3 px-3 py-1.5", r.kind !== "plain" && "bg-gold/10")}>
          <span className="w-10 text-muted-foreground">{r.tag}</span>
          <span className={cn("font-semibold", r.kind === "poc" && "text-bear")}>{fmt(r.px)}</span>
          <span
            className={cn(
              "h-2 min-w-6 flex-1 rounded-sm",
              r.kind === "poc" ? "bg-bear" : r.kind === "edge" ? "bg-gold" : "bg-border",
            )}
          />
          <span className="text-[10.5px] text-muted-foreground">{r.mark}</span>
        </div>
      ))}
      {open !== null && (
        <div className="flex items-center gap-3 px-3 py-1.5">
          <span className="w-10 text-muted-foreground">OPEN</span>
          <span className="font-semibold text-gold">{fmt(open)}</span>
          <span className="h-2 min-w-6 flex-1 rounded-sm bg-gold" />
          <span className="text-[10.5px] text-muted-foreground">{openLabel?.toLowerCase()}</span>
        </div>
      )}
    </div>
  );
}
