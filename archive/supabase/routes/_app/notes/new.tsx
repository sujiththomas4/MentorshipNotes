import { createFileRoute } from "@tanstack/react-router";
import { NoteEditor } from "@/components/note-editor";

export const Route = createFileRoute("/_app/notes/new")({
  validateSearch: (s: Record<string, unknown>): { mentor?: string } => ({
    mentor: typeof s.mentor === "string" && s.mentor ? s.mentor : undefined,
  }),
  component: NewNotePage,
});

function NewNotePage() {
  const { mentor } = Route.useSearch();
  return <NoteEditor defaultMentorId={mentor} />;
}
