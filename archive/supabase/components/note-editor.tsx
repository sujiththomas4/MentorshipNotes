import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MentorDot } from "@/components/mentor-tag";
import { supabase } from "@/integrations/supabase/client";
import type { MentorshipNote } from "@/lib/mentorship";
import { parseKeyNotes } from "@/lib/mentorship";
import { useMentors, qk } from "@/lib/queries";
import { todayIso } from "@/lib/dates";
import { errorMessage } from "@/lib/utils";

type Props = {
  note?: MentorshipNote | null;
  /** preselected mentorship for a new session (from ?mentor=) */
  defaultMentorId?: string;
};

export function NoteEditor({ note, defaultMentorId }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!note;

  const [date, setDate] = useState(note?.session_date ?? todayIso());
  const [mentorId, setMentorId] = useState<string>(note?.mentor_id ?? defaultMentorId ?? "none");
  const [title, setTitle] = useState(note?.title ?? "");
  const [summary, setSummary] = useState(note?.summary ?? "");
  const [keyNotes, setKeyNotes] = useState<string[]>(() => {
    const parsed = note ? parseKeyNotes(note.key_notes) : [];
    return parsed.length ? parsed : [""];
  });
  const [saving, setSaving] = useState(false);

  const { data: mentors = [] } = useMentors();

  function updateKeyNote(index: number, value: string) {
    setKeyNotes((prev) => prev.map((k, i) => (i === index ? value : k)));
  }
  function addKeyNote() {
    setKeyNotes((prev) => [...prev, ""]);
  }
  function removeKeyNote(index: number) {
    setKeyNotes((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)));
  }

  async function save() {
    if (!title.trim()) {
      toast.error("Add a title for this session.");
      return;
    }
    setSaving(true);
    const payload = {
      session_date: date,
      mentor_id: mentorId === "none" ? null : mentorId,
      title: title.trim(),
      summary: summary.trim() || null,
      key_notes: keyNotes.map((k) => k.trim()).filter(Boolean),
    };

    try {
      if (isEdit && note) {
        const { error } = await supabase.from("mentorship_notes").update(payload).eq("id", note.id);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: qk.notes });
        queryClient.invalidateQueries({ queryKey: qk.note(note.id) });
        toast.success("Session updated");
        navigate({ to: "/notes/$id", params: { id: note.id } });
      } else {
        const { data: created, error } = await supabase
          .from("mentorship_notes")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: qk.notes });
        toast.success("Session saved");
        if (created) navigate({ to: "/notes/$id", params: { id: created.id as string } });
        else navigate({ to: "/notes" });
      }
    } catch (err) {
      toast.error(errorMessage(err, "Could not save the session."));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!note) return;
    const { error } = await supabase.from("mentorship_notes").delete().eq("id", note.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: qk.notes });
    queryClient.invalidateQueries({ queryKey: qk.keyNotes });
    toast.success("Session deleted");
    navigate({ to: "/notes" });
  }

  function cancel() {
    if (note) navigate({ to: "/notes/$id", params: { id: note.id } });
    else navigate({ to: "/notes", search: mentorId !== "none" ? { mentor: mentorId } : {} });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit session" : "New session"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit ? "Update the details and key takeaways." : "Capture what you learned today."}
          </p>
        </div>
        {isEdit && (
          <ConfirmDialog
            title="Delete this session?"
            description="The notes and key points go for good. Key points you starred stay in My Key Notes."
            onConfirm={remove}
            trigger={
              <Button variant="ghost" size="sm" className="gap-1.5 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            }
          />
        )}
      </div>

      <div className="card-elevated mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date">Session date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Mentorship</Label>
            <Select value={mentorId} onValueChange={setMentorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mentorship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No mentorship</SelectItem>
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
        </div>

        {mentors.length === 0 && (
          <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
            You haven't added a mentorship yet. You can still save the session and assign it later.
          </p>
        )}

        <div className="mt-5 space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Value area acceptance and rejection"
          />
        </div>

        <div className="mt-5 space-y-1.5">
          <Label htmlFor="summary">Day notes</Label>
          <Textarea
            id="summary"
            rows={9}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Everything covered in this session: concepts, chart examples, questions asked, homework."
          />
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <Label>Key points</Label>
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-accent" onClick={addKeyNote}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The few takeaways you most want to remember. Star them later to copy them into My Key Notes.
          </p>
          <div className="space-y-2">
            {keyNotes.map((k, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-accent">•</span>
                <Input
                  value={k}
                  onChange={(e) => updateKeyNote(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyNote();
                    }
                  }}
                  placeholder="Key takeaway"
                  aria-label={`Key point ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => removeKeyNote(i)}
                  aria-label="Remove key point"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={cancel}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Save session"}
        </Button>
      </div>
    </div>
  );
}
