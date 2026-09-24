import { CalendarDays, PencilLine, Video } from "lucide-react";
import { initials, mentorColor, type SessionMeta } from "@/content";
import { shortDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Date tile for dated sessions; a video / calendar icon tile otherwise. */
export function SessionTile({
  s,
  color,
  className,
}: {
  s: Pick<SessionMeta, "date" | "kind">;
  color: string;
  className?: string;
}) {
  if (s.date) return <DateTile iso={s.date} color={color} className={className} />;
  const Icon = s.kind === "recorded" ? Video : CalendarDays;
  return (
    <span
      className={cn("flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white", className)}
      style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklch, ${color} 55%, black))` }}
    >
      <Icon className="h-5 w-5" />
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider opacity-85">
        {s.kind === "recorded" ? "Rec" : "No date"}
      </span>
    </span>
  );
}

/** "Recorded" and "Draft" pills. `onDark` for use on the coloured hero bands. */
export function SessionBadges({ s, onDark }: { s: Pick<SessionMeta, "kind" | "status">; onDark?: boolean }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";
  return (
    <>
      {s.kind === "recorded" && (
        <span className={cn(base, onDark ? "bg-white/15 text-white ring-1 ring-white/20" : "bg-violet-500/10 text-violet-700")}>
          <Video className="h-3 w-3" /> Recorded
        </span>
      )}
      {s.status === "draft" && (
        <span className={cn(base, onDark ? "bg-amber-300/20 text-amber-100 ring-1 ring-amber-200/30" : "bg-amber-500/12 text-amber-700")}>
          <PencilLine className="h-3 w-3" /> Draft
        </span>
      )}
    </>
  );
}

/** Calendar-style day + month tile. */
export function DateTile({ iso, color, className }: { iso: string; color: string; className?: string }) {
  const [day, mon] = shortDate(iso).split(" ");
  return (
    <span
      className={cn("flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white", className)}
      style={{ backgroundColor: color }}
    >
      <span className="font-display text-xl font-bold leading-none">{day}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider opacity-80">{mon}</span>
    </span>
  );
}

/** Rounded tile with the mentorship's initials in its colour. */
export function MentorAvatar({ m, className }: { m: { name: string; color: number }; className?: string }) {
  const c = mentorColor(m);
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-white shadow-sm",
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${c}, color-mix(in oklch, ${c} 60%, black))` }}
    >
      {initials(m.name)}
    </span>
  );
}
