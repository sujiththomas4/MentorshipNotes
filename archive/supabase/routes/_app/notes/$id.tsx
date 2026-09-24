import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, LoadingBlock, Page } from "@/components/page";
import { MentorTag } from "@/components/mentor-tag";
import { supabase } from "@/integrations/supabase/client";
import { mentorColor, parseKeyNotes } from "@/lib/mentorship";
import { qk, useKeyNotes, useMentors, useNote, useNotes } from "@/lib/queries";
import { prettyDate, weekday } from "@/lib/dates";
import { cn, errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_app/notes/$id")({
  component: NoteDetail,
});

function NoteDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const noteQ = useNote(id);
  const { data: mentors = [] } = useMentors();
  const { data: allNotes = [] } = useNotes();
  const { data: keyNotes = [] } = useKeyNotes();
  const note = noteQ.data;

  // previous / next session in the same mentorship (list is newest first)
  const siblings = useMemo(
    () => (note ? allNotes.filter((n) => n.mentor_id === note.mentor_id) : []),
    [allNotes, note],
  );
  const idx = siblings.findIndex((n) => n.id === id);
  const newer = idx > 0 ? siblings[idx - 1] : undefined;
  const older = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;

  if (noteQ.isLoading) return <LoadingBlock />;
  if (noteQ.error || !note) {
    return (
      <Page>
        <EmptyState>
          {noteQ.error ? `Couldn't load the session: ${errorMessage(noteQ.error)}` : "This session doesn't exist any more."}{" "}
          <Link to="/notes" className="font-medium text-accent hover:underline">
            Back to sessions
          </Link>
        </EmptyState>
      </Page>
    );
  }

  const mentor = note.mentor_id ? mentors.find((m) => m.id === note.mentor_id) : undefined;
  const keys = parseKeyNotes(note.key_notes);
  const savedFor = (text: string) => keyNotes.find((k) => k.source_note_id === note.id && k.text === text);

  async function toggleStar(text: string) {
    const saved = savedFor(text);
    const { error } = saved
      ? await supabase.from("key_notes").delete().eq("id", saved.id)
      : await supabase.from("key_notes").insert({ text, mentor_id: note!.mentor_id, source_note_id: note!.id });
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: qk.keyNotes });
    toast.success(saved ? "Removed from My Key Notes" : "Saved to My Key Notes");
  }

  return (
    <Page className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
          <Link to="/notes" search={mentor ? { mentor: mentor.id } : {}}>
            <ArrowLeft className="h-4 w-4" /> {mentor ? mentor.name : "All sessions"}
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link to="/notes/edit/$id" params={{ id: note.id }}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </Button>
      </div>

      <article className="card-elevated relative mt-4 overflow-hidden rounded-2xl border border-border bg-card p-6 pl-7 md:p-8 md:pl-9">
        <span
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundColor: mentor ? mentorColor(mentor.color) : "var(--color-border)" }}
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <MentorTag mentor={mentor} />
          <span className="text-xs text-muted-foreground">
            {weekday(note.session_date)}, {prettyDate(note.session_date)}
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">{note.title}</h1>

        {note.summary ? (
          <div className="mt-5 whitespace-pre-wrap leading-relaxed">{note.summary}</div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">No day notes for this session.</p>
        )}

        {keys.length > 0 && (
          <section className="mt-8">
            <p className="eyebrow mb-3">Key points</p>
            <ul className="space-y-2">
              {keys.map((k, i) => {
                const on = !!savedFor(k);
                return (
                  <li
                    key={`${i}-${k}`}
                    className="flex items-start gap-3 rounded-lg border-l-[3px] border-accent bg-secondary/70 py-2.5 pl-3.5 pr-2"
                  >
                    <span className="flex-1 whitespace-pre-wrap">{k}</span>
                    <button
                      type="button"
                      onClick={() => toggleStar(k)}
                      title={on ? "Saved in My Key Notes (click to remove)" : "Save to My Key Notes"}
                      aria-label={on ? "Remove from My Key Notes" : "Save to My Key Notes"}
                      aria-pressed={on}
                      className={cn(
                        "rounded p-1 transition-colors",
                        on ? "text-chart-5" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Star className="h-4 w-4" fill={on ? "currentColor" : "none"} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">Star a key point to copy it into My Key Notes.</p>
          </section>
        )}
      </article>

      {(older || newer) && (
        <Card className="mt-4 flex items-center justify-between gap-3 p-3">
          {older ? (
            <Link to="/notes/$id" params={{ id: older.id }} className="flex min-w-0 items-center gap-1.5 text-sm hover:underline">
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">{prettyDate(older.session_date)} · {older.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link to="/notes/$id" params={{ id: newer.id }} className="flex min-w-0 items-center gap-1.5 text-right text-sm hover:underline">
              <span className="truncate">{prettyDate(newer.session_date)} · {newer.title}</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </Card>
      )}
    </Page>
  );
}
