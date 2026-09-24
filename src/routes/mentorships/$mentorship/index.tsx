import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, ListTodo, NotebookPen, Star, Video } from "lucide-react";
import { MentorAvatar, SessionBadges, SessionTile } from "@/components/mentor-avatar";
import { Page, SectionHeader } from "@/components/page";
import { getMentorship, keyPointCount, mentorColor, sessionLabel, sessionWhen, type Session } from "@/content";
import { prettyDate } from "@/lib/dates";
import { plural } from "@/lib/utils";

export const Route = createFileRoute("/mentorships/$mentorship/")({
  beforeLoad: ({ params }) => {
    if (!getMentorship(params.mentorship)) throw notFound();
  },
  head: ({ params }) => ({ meta: [{ title: `${getMentorship(params.mentorship)?.name ?? "Mentorship"} · Mentor Notes` }] }),
  component: MentorshipPage,
});

function MentorshipPage() {
  const { mentorship } = Route.useParams();
  const m = getMentorship(mentorship)!;
  const color = mentorColor(m);
  const dated = m.sessions.filter((s) => s.date).map((s) => s.date!).sort();
  const first = dated[0];
  const last = dated[dated.length - 1];
  const recorded = m.sessions.filter((s) => s.kind === "recorded").length;

  // group by module, keeping session order
  const groups: [string, Session[]][] = [];
  for (const s of m.sessions) {
    const name = s.module ?? "";
    const g = groups.find(([k]) => k === name);
    if (g) g[1].push(s);
    else groups.push([name, [s]]);
  }

  return (
    <Page>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{m.name}</span>
      </nav>

      <header
        className="relative mt-4 overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl md:px-10"
        style={{
          background: `radial-gradient(60% 120% at 100% 0%, color-mix(in oklch, ${color} 55%, transparent), transparent 60%), linear-gradient(120deg, oklch(0.25 0.065 262), color-mix(in oklch, ${color} 45%, oklch(0.25 0.065 262)))`,
        }}
      >
        <div className="flex flex-wrap items-center gap-5">
          <MentorAvatar m={m} className="h-16 w-16 rounded-2xl text-xl ring-2 ring-white/25" />
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">Mentorship</p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{m.name}</h1>
            <p className="text-white/75">{m.mentor}</p>
          </div>
        </div>
        {m.about && <p className="mt-5 max-w-3xl text-white/80 md:text-lg">{m.about}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Chip value={String(m.sessions.length)} label={m.sessions.length === 1 ? "session" : "sessions"} />
          <Chip value={String(keyPointCount(m))} label="key points" />
          {recorded > 0 && <Chip value={String(recorded)} label="recorded" />}
          {first && <Chip value={prettyDate(first)} label="first class" />}
          {last && last !== first && <Chip value={prettyDate(last)} label="latest" />}
          {!first && m.started && <Chip value={prettyDate(m.started)} label="started" />}
        </div>
      </header>

      <section className="pt-10">
        {m.sessions.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border bg-card/50 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: color }}>
              <NotebookPen className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold">Session 1 will appear here</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Each session is added from your draft notes and screenshots, and lists here in order.
            </p>
            <Link to="/note-kit" className="mt-4 text-sm font-medium text-accent hover:underline">
              See what a session page can show →
            </Link>
          </div>
        ) : (
          groups.map(([module, list]) => (
            <div key={module || "all"} className="mb-10">
              <SectionHeader title={module || "Sessions"} note={plural(list.length, "session")} />
              <ol className="relative space-y-4 md:pl-8">
                <span className="absolute bottom-4 left-[11px] top-4 hidden w-0.5 rounded bg-border md:block" />
                {list.map((s) => (
                  <li key={s.slug} className="relative">
                    <span
                      className="absolute -left-8 top-7 hidden h-6 w-6 items-center justify-center rounded-full border-4 border-background md:flex"
                      style={{ backgroundColor: color }}
                    />
                    <SessionRow s={s} color={color} mentorship={m.slug} />
                  </li>
                ))}
              </ol>
            </div>
          ))
        )}
        <Link
          to="/mentorships/$mentorship/to-check"
          params={{ mentorship: m.slug }}
          className="card-elevated group flex flex-wrap items-center gap-4 rounded-2xl border-2 border-dashed border-amber-400/60 bg-amber-50/70 p-5 transition-colors hover:border-amber-500"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-400 text-white">
            <ListTodo className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-bold">To be checked</span>
            <span className="block text-sm text-muted-foreground">Topics to study later and questions to ask the mentor.</span>
          </span>
          <span className="rounded-full bg-amber-400/20 px-3 py-1 text-sm font-semibold text-amber-800">
            {m.toCheck.filter((c) => c.status === "open").length} open
          </span>
          <ArrowRight className="h-5 w-5 text-amber-700 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </Page>
  );
}

function Chip({ value, label }: { value: string; label: string }) {
  return (
    <span className="rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/15 backdrop-blur">
      <b className="font-display text-lg font-bold">{value}</b> <span className="text-sm text-white/70">{label}</span>
    </span>
  );
}

function SessionRow({ s, color, mentorship }: { s: Session; color: string; mentorship: string }) {
  return (
    <Link
      to="/mentorships/$mentorship/$session"
      params={{ mentorship, session: s.slug }}
      className="card-elevated group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-xl sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-4 sm:w-64 sm:shrink-0">
        <SessionTile s={s} color={color} />
        <div>
          <p className="font-display text-lg font-bold" style={{ color }}>
            {sessionLabel(s)}
          </p>
          <p className="text-sm text-muted-foreground">{sessionWhen(s)}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <SessionBadges s={s} />
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 sm:border-l sm:border-border sm:pl-5">
        <h3 className="font-display text-lg font-semibold leading-snug">{s.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.summary}</p>
        {s.tags && s.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        {s.recording && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Video className="h-3.5 w-3.5" /> Recording
          </span>
        )}
        {s.keyPoints?.length ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5" /> {plural(s.keyPoints.length, "key point")}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color }}>
          Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
