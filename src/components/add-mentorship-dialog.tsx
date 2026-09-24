import { useState, type FormEvent, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MENTOR_COLORS, getMentorship } from "@/content";
import { addMentorship, mentorshipSlug } from "@/lib/add-mentorship";
import { cn, errorMessage } from "@/lib/utils";

/** Opens a form that creates src/content/mentorships/<slug>/ and then opens the new mentorship. */
export function AddMentorshipDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mentor, setMentor] = useState("");
  const [about, setAbout] = useState("");
  const [started, setStarted] = useState("");
  const [color, setColor] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const slug = mentorshipSlug(name);
  const taken = !!slug && !!getMentorship(slug);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await addMentorship({ data: { name, mentor, about, color, started } });
      // full load so the new folder is read fresh on server and client
      window.location.assign(`/mentorships/${res.slug}`);
    } catch (err) {
      setError(errorMessage(err, "Could not add the mentorship."));
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">New mentorship</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Creates a folder for it under <code className="font-mono text-xs">src/content/mentorships</code>.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="m-name">Name</Label>
              <Input id="m-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Order Flow" />
              {taken && <p className="text-xs text-destructive">A mentorship with this name already exists.</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="m-mentor">Mentor</Label>
                <Input id="m-mentor" value={mentor} onChange={(e) => setMentor(e.target.value)} placeholder="Who teaches it" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-started">Started on</Label>
                <Input id="m-started" type="date" value={started} onChange={(e) => setStarted(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-about">About</Label>
              <Textarea id="m-about" rows={3} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="What the mentorship covers" />
            </div>
            <div className="space-y-1.5">
              <Label>Colour</Label>
              <div className="flex gap-2">
                {MENTOR_COLORS.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(i)}
                    aria-label={`Colour ${i + 1}`}
                    aria-pressed={color === i}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-card transition",
                      color === i && "ring-2 ring-foreground/60",
                    )}
                    style={{ backgroundColor: c }}
                  >
                    {color === i && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={busy || !slug || taken}>
                {busy ? "Adding…" : "Add mentorship"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
