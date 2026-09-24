import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { NotebookPen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingBlock, Page, PageHeader } from "@/components/page";
import { MentorDot, MentorTag } from "@/components/mentor-tag";
import { mentorColor, parseKeyNotes } from "@/lib/mentorship";
import { useMentors, useNotes } from "@/lib/queries";
import { prettyDate, weekday } from "@/lib/dates";
import { errorMessage, excerpt, plural } from "@/lib/utils";

/** mentor: a mentorship id, or "none" for sessions without one */
export const Route = createFileRoute("/_app/notes/")({
  validateSearch: (s: Record<string, unknown>): { mentor?: string } => ({
    mentor: typeof s.mentor === "string" && s.mentor ? s.mentor : undefined,
  }),
  component: NotesPage,
});

function NotesPage() {
  const { mentor: filter } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [q, setQ] = useState("");
  const { data: mentors = [] } = useMentors();
  const notesQ = useNotes();

  const byId = useMemo(() => new Map(mentors.map((m) => [m.id, m])), [mentors]);
  const current = filter && filter !== "none" ? byId.get(filter) : undefined;

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (notesQ.data ?? []).filter((n) => {
      if (filter === "none" && n.mentor_id) return false;
      if (filter && filter !== "none" && n.mentor_id !== filter) return false;
      if (!query) return true;
      return [n.title, n.summary, n.session_date, prettyDate(n.session_date), ...parseKeyNotes(n.key_notes)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [notesQ.data, filter, q]);

  const keyCount = list.reduce((n, x) => n + parseKeyNotes(x.key_notes).length, 0);

  return (
    <Page>
      <PageHeader
        eyebrow={current ? (current.mentor ? `Mentorship · ${current.mentor}` : "Mentorship") : "All mentorships"}
        title={
          current ? (
            <span className="flex items-center gap-3">
              <MentorDot color={current.color} className="h-3.5 w-3.5" />
              {current.name}
            </span>
          ) : filter === "none" ? (
            "Sessions without a mentorship"
          ) : (
            "Session notes"
          )
        }
        description={current?.about || `${plural(list.length, "session")} · ${plural(keyCount, "key point")}`}
        actions={
          <Button className="gap-1.5" asChild>
            <Link to="/notes/new" search={current ? { mentor: current.id } : {}}>
              <NotebookPen className="h-4 w-4" /> New session
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-64">
          <Select
            value={filter ?? "all"}
            onValueChange={(v) => navigate({ search: v === "all" ? {} : { mentor: v } })}
          >
            <SelectTrigger aria-label="Filter by mentorship">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All mentorships</SelectItem>
              {mentors.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2">
                    <MentorDot color={m.color} className="h-2 w-2" />
                    {m.name}
                  </span>
                </SelectItem>
              ))}
              <SelectItem value="none">No mentorship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            className="pl-9"
            placeholder="Search titles, notes and key points…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {notesQ.isLoading && <LoadingBlock />}
        {notesQ.error && <EmptyState>Couldn't load sessions: {errorMessage(notesQ.error)}</EmptyState>}
        {!notesQ.isLoading && !notesQ.error && list.length === 0 && (
          <EmptyState>
            {q ? (
              <>No sessions match “{q}”.</>
            ) : (
              <>
                No sessions yet.{" "}
                <Link
                  to="/notes/new"
                  search={current ? { mentor: current.id } : {}}
                  className="font-medium text-accent hover:underline"
                >
                  Write today's notes
                </Link>
                .
              </>
            )}
          </EmptyState>
        )}

        {list.map((n) => {
          const m = n.mentor_id ? byId.get(n.mentor_id) : undefined;
          const keys = parseKeyNotes(n.key_notes);
          return (
            <Link
              key={n.id}
              to="/notes/$id"
              params={{ id: n.id }}
              className="card-elevated relative block overflow-hidden rounded-2xl border border-border bg-card p-5 pl-6 transition-colors hover:border-accent"
            >
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ backgroundColor: m ? mentorColor(m.color) : "var(--color-border)" }}
              />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display font-semibold">{prettyDate(n.session_date)}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{weekday(n.session_date)}</span>
                <span className="flex-1" />
                {!current && <MentorTag mentor={m} />}
                {keys.length > 0 && (
                  <span className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    {plural(keys.length, "key point")}
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-semibold leading-snug">{n.title}</h3>
              {n.summary && <p className="mt-1 text-sm text-muted-foreground">{excerpt(n.summary, 240)}</p>}
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
