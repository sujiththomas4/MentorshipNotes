import { createFileRoute, Link } from "@tanstack/react-router";
import { NoteEditor } from "@/components/note-editor";
import { EmptyState, LoadingBlock, Page } from "@/components/page";
import { useNote } from "@/lib/queries";
import { errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_app/notes/edit/$id")({
  component: EditNotePage,
});

function EditNotePage() {
  const { id } = Route.useParams();
  const { data: note, isLoading, error } = useNote(id);

  if (isLoading) return <LoadingBlock />;
  if (error || !note) {
    return (
      <Page>
        <EmptyState>
          {error ? `Couldn't load the session: ${errorMessage(error)}` : "This session doesn't exist any more."}{" "}
          <Link to="/notes" className="font-medium text-accent hover:underline">
            Back to sessions
          </Link>
        </EmptyState>
      </Page>
    );
  }
  // key by id so switching sessions starts a fresh form
  return <NoteEditor key={note.id} note={note} />;
}
