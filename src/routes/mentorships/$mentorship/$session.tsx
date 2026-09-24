import { useRef } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { KeyPoints } from "@/components/notes";
import { TocAside } from "@/components/toc";
import { SessionBadges } from "@/components/mentor-avatar";
import { RecordingCard } from "@/components/recording-card";
import { getMentorship, getSession, mentorColor, neighbours, sessionLabel, sessionWhen } from "@/content";
import { useToc } from "@/lib/use-toc";

export const Route = createFileRoute("/mentorships/$mentorship/$session")({
  beforeLoad: ({ params }) => {
    if (!getSession(params.mentorship, params.session)) throw notFound();
  },
  head: ({ params }) => {
    const s = getSession(params.mentorship, params.session);
    return { meta: [{ title: s ? `${sessionLabel(s)}: ${s.title} · Mentor Notes` : "Session" }] };
  },
  component: SessionPage,
});

function SessionPage() {
  const params = Route.useParams();
  const m = getMentorship(params.mentorship)!;
  const s = getSession(params.mentorship, params.session)!;
  const color = mentorColor(m);
  const { prev, next } = neighbours(s);
  const body = useRef<HTMLDivElement>(null);
  const toc = useToc(body, `${m.slug}/${s.slug}`);
  const Content = s.Content;

  return (
    <div className="w-full px-4 py-8 md:px-8 xl:px-12">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/mentorships/$mentorship" params={{ mentorship: m.slug }} className="hover:text-foreground">
          {m.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{sessionLabel(s)}</span>
      </nav>

      <header
        className="relative mt-4 overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl md:px-10"
        style={{
          background: `radial-gradient(50% 120% at 100% 0%, color-mix(in oklch, ${color} 55%, transparent), transparent 60%), linear-gradient(120deg, oklch(0.25 0.065 262), color-mix(in oklch, ${color} 40%, oklch(0.25 0.065 262)))`,
        }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-lg bg-white px-2.5 py-1 font-display font-bold" style={{ color }}>
            {sessionLabel(s)}
          </span>
          {s.date && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 ring-1 ring-white/15">
              <CalendarDays className="h-3.5 w-3.5" /> {sessionWhen(s)}
            </span>
          )}
          <SessionBadges s={s} onDark />
          {s.module && <span className="rounded-lg bg-white/10 px-2.5 py-1 ring-1 ring-white/15">{s.module}</span>}
        </div>
        <h1 className="mt-4 max-w-5xl font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">{s.title}</h1>
        <p className="mt-3 max-w-4xl text-white/80 md:text-lg">{s.summary}</p>
        {s.tags && s.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {s.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-3 py-0.5 text-xs ring-1 ring-white/15">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {s.recording && <RecordingCard recording={s.recording} color={color} />}

      <div className="mt-8 flex gap-10">
        <article className="min-w-0 flex-1">
          <div ref={body} className="note-prose">
            <Content />
          </div>

          {s.keyPoints && s.keyPoints.length > 0 && (
            <section className="card-elevated mt-12 rounded-2xl border border-border bg-card p-5 md:p-7">
              <h2 id="key-points" data-toc className="flex scroll-mt-24 items-center gap-2 font-display text-xl font-semibold">
                <Star className="h-5 w-5" style={{ color }} /> Key points to remember
              </h2>
              <KeyPoints title="" items={s.keyPoints} />
            </section>
          )}

          {(prev || next) && (
            <nav className="mt-8 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link
                  to="/mentorships/$mentorship/$session"
                  params={{ mentorship: m.slug, session: prev.slug }}
                  className="card-elevated flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm hover:border-accent"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      {sessionLabel(prev)} · {sessionWhen(prev)}
                    </span>
                    <span className="block truncate font-display font-semibold">{prev.title}</span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to="/mentorships/$mentorship/$session"
                  params={{ mentorship: m.slug, session: next.slug }}
                  className="card-elevated flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 text-right text-sm hover:border-accent"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      {sessionLabel(next)} · {sessionWhen(next)}
                    </span>
                    <span className="block truncate font-display font-semibold">{next.title}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              )}
            </nav>
          )}
        </article>

        <TocAside items={toc} color={color} />
      </div>
    </div>
  );
}
