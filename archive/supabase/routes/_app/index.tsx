import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Plus, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, LoadingBlock, Page, SectionHeader } from "@/components/page";
import { MentorTag } from "@/components/mentor-tag";
import { supabase } from "@/integrations/supabase/client";
import { mentorColor, parseKeyNotes, type Mentor, type MentorshipNote } from "@/lib/mentorship";
import { qk, useKeyNotes, useMentors, useNotes, useTradingDays } from "@/lib/queries";
import { prettyDate, shortDate, weekday } from "@/lib/dates";
import { errorMessage, excerpt, plural } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
  component: Home,
});

function Home() {
  const mentorsQ = useMentors();
  const notesQ = useNotes();
  const keyNotesQ = useKeyNotes();
  const daysQ = useTradingDays();
  const mentors = mentorsQ.data ?? [];
  const notes = notesQ.data ?? [];
  const keyNotes = keyNotesQ.data ?? [];
  const days = daysQ.data ?? [];

  const byId = useMemo(() => new Map(mentors.map((m) => [m.id, m])), [mentors]);
  const byMentor = useMemo(() => {
    const map = new Map<string, MentorshipNote[]>();
    for (const n of notes) {
      if (!n.mentor_id) continue;
      map.set(n.mentor_id, [...(map.get(n.mentor_id) ?? []), n]);
    }
    return map;
  }, [notes]);

  const pinned = keyNotes.filter((k) => k.pinned).length;

  return (
    <Page>
      <header className="border-b border-border pb-6">
        <p className="eyebrow mb-2">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Your mentorships</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every mentorship keeps its own day-by-day session notes and key points. Anything you want to keep for
          yourself goes into My Key Notes.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Stat value={mentors.length} label="mentorships" />
          <Stat value={notes.length} label="sessions" />
          <Stat value={keyNotes.length} label="key notes" />
        </div>
      </header>

      <section className="py-8">
        <SectionHeader
          title="Mentorships"
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/mentors">Manage</Link>
            </Button>
          }
        />
        {mentorsQ.isLoading ? (
          <LoadingBlock />
        ) : mentorsQ.error ? (
          <EmptyState>Couldn't load mentorships: {errorMessage(mentorsQ.error)}</EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m) => (
              <MentorCard key={m.id} mentor={m} notes={byMentor.get(m.id) ?? []} />
            ))}
            {mentors.length === 0 && <FirstMentorCard />}
            <Link
              to="/mentors"
              className="flex min-h-40 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Plus className="h-6 w-6" />
              New mentorship
            </Link>
          </div>
        )}
      </section>

      <section className="pb-8">
        <SectionHeader title="Your workspace" />
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceCard
            to="/key-notes"
            icon={<Star className="h-4 w-4" />}
            kicker="Personal"
            title="My Key Notes"
            sub={
              keyNotes.length
                ? `${plural(keyNotes.length, "note")}${pinned ? ` · ${pinned} pinned` : ""}`
                : "Your own takeaways across every mentorship."
            }
            last={keyNotes[0] ? `“${excerpt(keyNotes[0].text, 90)}”` : "Nothing yet. Add your first takeaway."}
          />
          <WorkspaceCard
            to="/desk"
            icon={<TrendingUp className="h-4 w-4" />}
            kicker="Tool"
            title="Trading Desk"
            sub="Session frame, live trading notes and day log for market profile."
            last={
              days.length
                ? `${plural(days.length, "day")} logged · last ${prettyDate(days[0].day)}`
                : "No trading days logged yet."
            }
          />
        </div>
      </section>

      <section className="grid gap-8 pb-8 lg:grid-cols-2">
        <div>
          <SectionHeader
            title="Recent sessions"
            actions={
              <Link to="/notes" className="text-xs font-medium text-accent hover:underline">
                See all
              </Link>
            }
          />
          <Card className="p-0">
            {notes.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                No sessions yet. Use <b>New session</b> at the top after your next class.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {notes.slice(0, 6).map((n) => (
                  <li key={n.id}>
                    <Link to="/notes/$id" params={{ id: n.id }} className="flex gap-4 px-5 py-3.5 hover:bg-secondary/50">
                      <DateCell iso={n.session_date} />
                      <span className="min-w-0 flex-1">
                        <MentorTag mentor={n.mentor_id ? byId.get(n.mentor_id) : null} />
                        <span className="block truncate font-display text-sm font-semibold">{n.title}</span>
                        {n.summary && (
                          <span className="block text-sm text-muted-foreground">{excerpt(n.summary, 120)}</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <SectionHeader
            title="Latest key notes"
            actions={
              <Link to="/key-notes" className="text-xs font-medium text-accent hover:underline">
                See all
              </Link>
            }
          />
          <Card className="p-0">
            {keyNotes.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                No key notes yet. Add them in My Key Notes, or star a key point inside a session.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {keyNotes.slice(0, 5).map((k) => (
                  <li key={k.id}>
                    <Link to="/key-notes" className="flex gap-4 px-5 py-3.5 hover:bg-secondary/50">
                      <DateCell iso={k.created_at.slice(0, 10)} sub={k.pinned ? "★ pinned" : undefined} />
                      <span className="min-w-0 flex-1">
                        <MentorTag
                          mentor={k.mentor_id ? byId.get(k.mentor_id) : null}
                          fallback={k.from_mentor_name ?? "General"}
                        />
                        <span className="block text-sm">{excerpt(k.text, 180)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </Page>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      <b className="font-semibold text-foreground">{value}</b> {label}
    </span>
  );
}

function DateCell({ iso, sub }: { iso: string; sub?: string }) {
  return (
    <span className="w-14 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-foreground/80">
      {shortDate(iso)}
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
        {sub ?? weekday(iso).slice(0, 3)}
      </span>
    </span>
  );
}

function MentorCard({ mentor, notes }: { mentor: Mentor; notes: MentorshipNote[] }) {
  const last = notes[0];
  const keys = notes.reduce((n, x) => n + parseKeyNotes(x.key_notes).length, 0);
  return (
    <Link
      to="/notes"
      search={{ mentor: mentor.id }}
      className="card-elevated group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 pl-6 transition-colors hover:border-accent"
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: mentorColor(mentor.color) }} />
      <span className="eyebrow" style={{ color: mentorColor(mentor.color) }}>
        Mentorship
      </span>
      <span className="mt-1 font-display text-lg font-semibold leading-snug">{mentor.name}</span>
      <span className="text-sm text-muted-foreground">{mentor.mentor || "Mentor not set"}</span>
      <span className="mt-3 flex gap-6">
        <span>
          <span className="eyebrow block text-[10px]">Sessions</span>
          <span className="font-mono text-lg tabular-nums">{notes.length}</span>
        </span>
        <span>
          <span className="eyebrow block text-[10px]">Key points</span>
          <span className="font-mono text-lg tabular-nums">{keys}</span>
        </span>
      </span>
      <span className="mt-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
        {last ? `Last session ${prettyDate(last.session_date)} · ${excerpt(last.title, 40)}` : "No sessions yet"}
      </span>
    </Link>
  );
}

/** One-click setup for the mentorship this notebook started with. */
function FirstMentorCard() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function addMarketProfile() {
    setBusy(true);
    const { error } = await supabase.from("mentors").insert({
      name: "Market Profile",
      mentor: "Dr. Sherlymon Abraham",
      about: "Market profile and order flow: value areas, day types, opening types, acceptance and rejection.",
      color: 0,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: qk.mentors });
    toast.success("Market Profile added");
  }

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-secondary/60 p-5">
      <div>
        <p className="font-display font-semibold">Start with Market Profile?</p>
        <p className="mt-1 text-sm text-muted-foreground">Dr. Sherlymon Abraham's mentorship, ready for today's notes.</p>
      </div>
      <Button size="sm" className="gap-1.5 self-start" onClick={addMarketProfile} disabled={busy}>
        Add it <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function WorkspaceCard(props: {
  to: "/key-notes" | "/desk";
  icon: ReactNode;
  kicker: string;
  title: string;
  sub: string;
  last: string;
}) {
  return (
    <Link
      to={props.to}
      className="card-elevated flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent"
    >
      <span className="eyebrow flex items-center gap-1.5 text-accent">
        {props.icon}
        {props.kicker}
      </span>
      <span className="mt-1 font-display text-lg font-semibold">{props.title}</span>
      <span className="text-sm text-muted-foreground">{props.sub}</span>
      <span className="mt-3 border-t border-border pt-2.5 text-xs text-muted-foreground">{props.last}</span>
    </Link>
  );
}
