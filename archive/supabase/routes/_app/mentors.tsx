import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, EmptyState, LoadingBlock, Page, PageHeader } from "@/components/page";
import { supabase } from "@/integrations/supabase/client";
import { MENTOR_COLORS, mentorColor, type Mentor } from "@/lib/mentorship";
import { qk, useMentors, useNotes } from "@/lib/queries";
import { cn, errorMessage, plural } from "@/lib/utils";

export const Route = createFileRoute("/_app/mentors")({
  component: MentorsPage,
});

type Draft = { name: string; mentor: string; about: string; color: number };

function MentorsPage() {
  const queryClient = useQueryClient();
  const mentorsQ = useMentors();
  const { data: notes = [] } = useNotes();
  const mentors = mentorsQ.data ?? [];
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const countFor = (id: string) => notes.filter((n) => n.mentor_id === id).length;

  async function create(d: Draft) {
    const { error } = await supabase.from("mentors").insert({
      name: d.name,
      mentor: d.mentor || null,
      about: d.about || null,
      color: d.color,
    });
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: qk.mentors });
    setCreating(false);
    toast.success(`${d.name} added`);
  }

  async function update(id: string, d: Draft) {
    const { error } = await supabase
      .from("mentors")
      .update({ name: d.name, mentor: d.mentor || null, about: d.about || null, color: d.color })
      .eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: qk.mentors });
    setEditingId(null);
    toast.success("Saved");
  }

  async function remove(m: Mentor) {
    try {
      // keep sessions and personal notes, just unlink them
      const r1 = await supabase.from("mentorship_notes").update({ mentor_id: null }).eq("mentor_id", m.id);
      if (r1.error) throw r1.error;
      const r2 = await supabase
        .from("key_notes")
        .update({ mentor_id: null, from_mentor_name: m.name })
        .eq("mentor_id", m.id);
      if (r2.error) throw r2.error;
      const r3 = await supabase.from("mentors").delete().eq("id", m.id);
      if (r3.error) throw r3.error;
      queryClient.invalidateQueries({ queryKey: qk.mentors });
      queryClient.invalidateQueries({ queryKey: qk.notes });
      queryClient.invalidateQueries({ queryKey: qk.keyNotes });
      toast.success(`${m.name} deleted`);
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the mentorship."));
    }
  }

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow="Manage"
        title="Mentorships"
        description="Each mentorship keeps its own sessions and key points. The colour tags its notes everywhere."
        actions={
          !creating && (
            <Button className="gap-1.5" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New mentorship
            </Button>
          )
        }
      />

      <div className="mt-6 space-y-4">
        {creating && (
          <Card>
            <p className="eyebrow mb-4">New mentorship</p>
            <MentorForm
              initial={{ name: "", mentor: "", about: "", color: mentors.length % MENTOR_COLORS.length }}
              submitLabel="Create"
              onSubmit={create}
              onCancel={() => setCreating(false)}
            />
          </Card>
        )}

        {mentorsQ.isLoading && <LoadingBlock />}
        {mentorsQ.error && <EmptyState>Couldn't load mentorships: {errorMessage(mentorsQ.error)}</EmptyState>}
        {!mentorsQ.isLoading && !mentorsQ.error && mentors.length === 0 && !creating && (
          <EmptyState>No mentorships yet. Add the first one to start taking session notes.</EmptyState>
        )}

        {mentors.map((m) =>
          editingId === m.id ? (
            <Card key={m.id}>
              <p className="eyebrow mb-4">Edit mentorship</p>
              <MentorForm
                initial={{
                  name: m.name,
                  mentor: m.mentor ?? "",
                  about: m.about ?? "",
                  color: Number.isInteger(Number(m.color)) ? Number(m.color) : 0,
                }}
                submitLabel="Save"
                onSubmit={(d) => update(m.id, d)}
                onCancel={() => setEditingId(null)}
              />
            </Card>
          ) : (
            <Card key={m.id} className="relative overflow-hidden pl-6">
              <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: mentorColor(m.color) }} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/notes"
                    search={{ mentor: m.id }}
                    className="font-display text-lg font-semibold hover:underline"
                  >
                    {m.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{m.mentor || "Mentor not set"}</p>
                  {m.about && <p className="mt-2 text-sm">{m.about}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{plural(countFor(m.id), "session")}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditingId(m.id)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <ConfirmDialog
                    title={`Delete ${m.name}?`}
                    description="Its sessions and your key notes are kept, but no longer linked to this mentorship."
                    onConfirm={() => remove(m)}
                    trigger={
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive">
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    }
                  />
                </div>
              </div>
            </Card>
          ),
        )}
      </div>
    </Page>
  );
}

function MentorForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  submitLabel: string;
  onSubmit: (d: Draft) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<Draft>(initial);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!d.name.trim()) {
      toast.error("Give the mentorship a name.");
      return;
    }
    setBusy(true);
    await onSubmit({ ...d, name: d.name.trim(), mentor: d.mentor.trim(), about: d.about.trim() });
    setBusy(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="m-name">Name</Label>
          <Input
            id="m-name"
            autoFocus
            value={d.name}
            onChange={(e) => setD({ ...d, name: e.target.value })}
            placeholder="e.g. Options Strategies"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-mentor">Mentor</Label>
          <Input
            id="m-mentor"
            value={d.mentor}
            onChange={(e) => setD({ ...d, mentor: e.target.value })}
            placeholder="Who runs it"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-about">About (optional)</Label>
        <Input
          id="m-about"
          value={d.about}
          onChange={(e) => setD({ ...d, about: e.target.value })}
          placeholder="What it covers, batch, schedule…"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Colour</Label>
        <div className="flex gap-2">
          {MENTOR_COLORS.map((c, i) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${i + 1}`}
              aria-pressed={d.color === i}
              onClick={() => setD({ ...d, color: i })}
              className={cn(
                "h-7 w-7 rounded-full ring-offset-2 ring-offset-card transition",
                d.color === i ? "ring-2 ring-foreground" : "hover:scale-110",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
