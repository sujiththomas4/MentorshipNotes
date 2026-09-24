import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, EmptyState, LoadingBlock, Page, PageHeader } from "@/components/page";
import { MentorDot, MentorTag } from "@/components/mentor-tag";
import { supabase } from "@/integrations/supabase/client";
import { mentorColor, type KeyNote } from "@/lib/mentorship";
import { qk, useKeyNotes, useMentors, useNotes } from "@/lib/queries";
import { prettyDate, shortDate } from "@/lib/dates";
import { cn, errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_app/key-notes")({
  component: KeyNotesPage,
});

function KeyNotesPage() {
  const queryClient = useQueryClient();
  const { data: mentors = [] } = useMentors();
  const { data: sessions = [] } = useNotes();
  const keyNotesQ = useKeyNotes();
  const notes = keyNotesQ.data ?? [];

  const [text, setText] = useState("");
  const [mentorId, setMentorId] = useState("none");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const byId = useMemo(() => new Map(mentors.map((m) => [m.id, m])), [mentors]);
  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);
  const isGeneral = (n: KeyNote) => !n.mentor_id || !byId.has(n.mentor_id);

  const chips: [string, string, number][] = [
    ["all", "All", notes.length],
    ["pinned", "Pinned", notes.filter((n) => n.pinned).length],
    ["general", "General", notes.filter(isGeneral).length],
    ...mentors.map((m): [string, string, number] => [m.id, m.name, notes.filter((n) => n.mentor_id === m.id).length]),
  ];

  const list = notes.filter((n) => {
    if (filter === "pinned" && !n.pinned) return false;
    if (filter === "general" && !isGeneral(n)) return false;
    if (!["all", "pinned", "general"].includes(filter) && n.mentor_id !== filter) return false;
    return !q.trim() || n.text.toLowerCase().includes(q.trim().toLowerCase());
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: qk.keyNotes });

  async function add() {
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    const { error } = await supabase.from("key_notes").insert({ text: t, mentor_id: mentorId === "none" ? null : mentorId });
    setBusy(false);
    if (error) return toast.error(error.message);
    setText("");
    refresh();
  }

  async function patch(id: string, fields: Partial<KeyNote>) {
    const { error } = await supabase.from("key_notes").update(fields).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("key_notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  }

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow="Personal"
        title="My Key Notes"
        description="Your own takeaways: rules you want to follow, mistakes to avoid, things to try. Link each one to a mentorship or keep it general. Pin the ones you want to see first."
      />

      <Card className="mt-6">
        <Textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") add();
          }}
          placeholder="Write a key note…"
          aria-label="New key note"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-60">
            <Select value={mentorId} onValueChange={setMentorId}>
              <SelectTrigger aria-label="Link to mentorship">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General (no mentorship)</SelectItem>
                {mentors.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      <MentorDot color={m.color} className="h-2 w-2" />
                      {m.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="flex-1" />
          <span className="hidden text-xs text-muted-foreground sm:inline">Ctrl+Enter to add</span>
          <Button onClick={add} disabled={busy || !text.trim()}>
            Add note
          </Button>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {chips.map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              filter === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {label} · {count}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" className="pl-9" placeholder="Search your key notes…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-4 space-y-3">
        {keyNotesQ.isLoading && <LoadingBlock />}
        {keyNotesQ.error && (
          <EmptyState>
            Couldn't load key notes: {errorMessage(keyNotesQ.error)}. If the table is missing, run the SQL migration.
          </EmptyState>
        )}
        {!keyNotesQ.isLoading && !keyNotesQ.error && list.length === 0 && (
          <EmptyState>
            {notes.length
              ? "No notes match this filter."
              : "No key notes yet. Write one above, or star a key point inside any session."}
          </EmptyState>
        )}
        {list.map((n) => {
          const m = n.mentor_id ? byId.get(n.mentor_id) : undefined;
          const source = n.source_note_id ? sessionById.get(n.source_note_id) : undefined;
          return (
            <NoteCard
              key={n.id}
              note={n}
              accent={m ? mentorColor(m.color) : undefined}
              tag={<MentorTag mentor={m} fallback={n.from_mentor_name ?? "General"} />}
              source={
                source && (
                  <Link to="/notes/$id" params={{ id: source.id }} className="hover:underline">
                    from session {shortDate(source.session_date)}
                  </Link>
                )
              }
              onPin={() => patch(n.id, { pinned: !n.pinned })}
              onSave={(t) => patch(n.id, { text: t })}
              onDelete={() => remove(n.id)}
            />
          );
        })}
      </div>
    </Page>
  );
}

function NoteCard(props: {
  note: KeyNote;
  accent?: string;
  tag: ReactNode;
  source?: ReactNode;
  onPin: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
}) {
  const { note } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);

  return (
    <article
      className={cn(
        "card-elevated rounded-xl border border-border border-l-[3px] bg-card px-4 pb-2.5 pt-3.5",
        note.pinned && "bg-secondary/60",
      )}
      style={{ borderLeftColor: props.accent ?? "var(--color-border)" }}
    >
      {editing ? (
        <>
          <Textarea rows={4} value={draft} autoFocus onChange={(e) => setDraft(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (draft.trim()) props.onSave(draft.trim());
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft(note.text);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed">{note.text}</p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {props.tag}
        <span>{prettyDate(note.created_at.slice(0, 10))}</span>
        {props.source}
        <span className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 gap-1 px-2", note.pinned && "text-chart-5")}
          onClick={props.onPin}
          aria-pressed={note.pinned}
        >
          <Star className="h-3.5 w-3.5" fill={note.pinned ? "currentColor" : "none"} />
          {note.pinned ? "Pinned" : "Pin"}
        </Button>
        {!editing && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
        <ConfirmDialog
          title="Delete this key note?"
          onConfirm={props.onDelete}
          trigger={
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          }
        />
      </div>
    </article>
  );
}
