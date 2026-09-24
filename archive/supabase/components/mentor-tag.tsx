import type { Mentor } from "@/lib/mentorship";
import { mentorColor } from "@/lib/mentorship";
import { cn } from "@/lib/utils";

export function MentorDot({ color, className }: { color: Mentor["color"] | undefined; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: mentorColor(color) }}
    />
  );
}

/** Coloured dot + mentorship name; "General" when the note has no mentorship. */
export function MentorTag({ mentor, fallback = "General" }: { mentor?: Mentor | null; fallback?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {mentor ? (
        <MentorDot color={mentor.color} className="h-2 w-2" />
      ) : (
        <span className="inline-block h-2 w-2 rounded-full bg-border" />
      )}
      <span style={mentor ? { color: mentorColor(mentor.color) } : undefined}>
        {mentor ? mentor.name : fallback}
      </span>
    </span>
  );
}
