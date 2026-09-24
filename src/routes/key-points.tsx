import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { MentorAvatar } from "@/components/mentor-avatar";
import { Input } from "@/components/ui/input";
import { EmptyState, Page, PageHeader } from "@/components/page";
import { mentorColor, mentorships, sessionLabel, sessionWhen } from "@/content";
import { cn, plural } from "@/lib/utils";

export const Route = createFileRoute("/key-points")({
  head: () => ({ meta: [{ title: "All key points · Mentor Notes" }] }),
  component: KeyPointsPage,
});

function KeyPointsPage() {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState<string>("all");
  const query = q.trim().toLowerCase();

  const sessions = mentorships
    .filter((m) => only === "all" || m.slug === only)
    .flatMap((m) => m.sessions.map((s) => ({ m, s })));
  const groups = sessions
    .map(({ m, s }) => ({ m, s, points: (s.keyPoints ?? []).filter((p) => !query || p.toLowerCase().includes(query)) }))
    .filter((g) => g.points.length > 0);
  const total = mentorships.reduce((n, m) => n + m.sessions.reduce((k, s) => k + (s.keyPoints?.length ?? 0), 0), 0);

  return (
    <Page>
      <PageHeader
        eyebrow="Revision"
        title="All key points"
        description={`${plural(total, "key point")} across every mentorship. Read them before the market opens.`}
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {[{ slug: "all", name: "All" }, ...mentorships].map((m) => (
            <button
              key={m.slug}
              type="button"
              onClick={() => setOnly(m.slug)}
              aria-pressed={only === m.slug}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                only === m.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" className="pl-9" placeholder="Search key points…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {groups.length === 0 && (
          <EmptyState className="xl:col-span-2">
            {total ? `No key points match "${q}".` : "No key points yet. They appear here as sessions are added."}
          </EmptyState>
        )}
        {groups.map(({ m, s, points }) => (
          <section key={`${m.slug}/${s.slug}`} className="card-elevated rounded-2xl border border-border bg-card p-5">
            <Link
              to="/mentorships/$mentorship/$session"
              params={{ mentorship: m.slug, session: s.slug }}
              className="group flex items-center gap-3"
            >
              <MentorAvatar m={m} className="h-8 w-8 text-xs" />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">
                  {m.name} · <b style={{ color: mentorColor(m) }}>{sessionLabel(s)}</b> · {sessionWhen(s)}
                </span>
                <span className="block truncate font-display font-semibold group-hover:underline">{s.title}</span>
              </span>
            </Link>
            <ul className="mt-4 space-y-2">
              {points.map((p) => (
                <li
                  key={p}
                  className="rounded-lg border-l-[3px] bg-secondary/60 py-2 pl-3.5 pr-3 text-[15px] leading-relaxed"
                  style={{ borderLeftColor: mentorColor(m) }}
                >
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Page>
  );
}
