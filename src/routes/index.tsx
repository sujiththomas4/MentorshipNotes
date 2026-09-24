import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { AddMentorshipDialog } from "@/components/add-mentorship-dialog";
import { MentorAvatar, SessionBadges, SessionTile } from "@/components/mentor-avatar";
import { Page, SectionHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import {
  getMentorship,
  keyPointCount,
  latestSession,
  mentorColor,
  mentorships,
  sessionLabel,
  sessionWhen,
  type Mentorship,
} from "@/content";
import { prettyDate } from "@/lib/dates";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const sessionTotal = mentorships.reduce((n, m) => n + m.sessions.length, 0);
  const keyTotal = mentorships.reduce((n, m) => n + keyPointCount(m), 0);
  const recent = mentorships
    .flatMap((m) => m.sessions)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.number - a.number)
    .slice(0, 6);

  return (
    <Page>
      <header className="hero-surface relative overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl md:px-10 md:py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">Your mentorships</h1>
        <p className="mt-3 max-w-2xl text-white/75 md:text-lg">
          Every mentorship keeps its sessions in order: Session 1, 2, 3… each with its date, charts, screenshots and
          key points.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <HeroStat value={mentorships.length} label={mentorships.length === 1 ? "mentorship" : "mentorships"} />
          <HeroStat value={sessionTotal} label={sessionTotal === 1 ? "session" : "sessions"} />
          <HeroStat value={keyTotal} label={keyTotal === 1 ? "key point" : "key points"} />
          <span className="flex-1" />
          <AddMentorshipDialog
            trigger={
              <Button className="gap-1.5 bg-white text-primary shadow-lg hover:bg-white/90">
                <Plus className="h-4 w-4" /> New mentorship
              </Button>
            }
          />
        </div>
      </header>

      <section className="pt-10">
        <SectionHeader title="Mentorships" note={`${mentorships.length} active`} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {mentorships.map((m) => (
            <MentorshipCard key={m.slug} m={m} />
          ))}
          <AddMentorshipDialog
            trigger={
              <button
                type="button"
                className="group flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/40 p-6 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-accent/10">
                  <Plus className="h-6 w-6" />
                </span>
                <span className="font-display text-base font-semibold">New mentorship</span>
                <span className="max-w-56 text-center text-xs">Add another course or mentor to keep notes for.</span>
              </button>
            }
          />
        </div>
      </section>

      {recent.length > 0 && (
        <section className="pt-10">
          <SectionHeader title="Recent sessions" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((s) => {
              const m = getMentorship(s.mentorshipSlug)!;
              return (
                <Link
                  key={`${m.slug}/${s.slug}`}
                  to="/mentorships/$mentorship/$session"
                  params={{ mentorship: m.slug, session: s.slug }}
                  className="card-elevated flex gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-accent"
                >
                  <SessionTile s={s} color={mentorColor(m)} />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {m.name} · {sessionLabel(s)} <SessionBadges s={s} />
                    </span>
                    <span className="block truncate font-display font-semibold">{s.title}</span>
                    <span className="line-clamp-1 text-sm text-muted-foreground">{s.summary}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </Page>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <span className="rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/15 backdrop-blur">
      <b className="font-display text-xl font-bold">{value}</b>{" "}
      <span className="text-sm text-white/70">{label}</span>
    </span>
  );
}

function MentorshipCard({ m }: { m: Mentorship }) {
  const color = mentorColor(m);
  const last = latestSession(m);
  return (
    <Link
      to="/mentorships/$mentorship"
      params={{ mentorship: m.slug }}
      className="card-elevated group flex min-h-64 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-xl"
    >
      <span
        className="relative flex items-center gap-3 px-5 pb-4 pt-5"
        style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${color} 16%, white), transparent 85%)` }}
      >
        <MentorAvatar m={m} className="h-12 w-12 rounded-xl text-base" />
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-bold leading-tight">{m.name}</span>
          <span className="block truncate text-sm text-muted-foreground">{m.mentor || "Mentor not set"}</span>
        </span>
      </span>

      <span className="flex flex-1 flex-col px-5 pb-5">
        {m.about && <span className="line-clamp-2 text-sm text-muted-foreground">{m.about}</span>}

        <span className="mt-4 grid grid-cols-3 gap-2">
          <Metric label="Sessions" value={String(m.sessions.length)} />
          <Metric label="Points" value={String(keyPointCount(m))} />
          <Metric label="Last" value={last ? sessionWhen(last, "short") : "—"} />
        </span>

        <span className="mt-4 flex flex-wrap gap-1">
          {m.sessions.slice(0, 16).map((s) => (
            <span
              key={s.slug}
              title={`${sessionLabel(s)}: ${s.title} · ${sessionWhen(s)}`}
              className="flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-[10px] font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {s.number}
            </span>
          ))}
          {m.sessions.length === 0 && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> No sessions yet
            </span>
          )}
        </span>

        <span className="min-h-4 flex-1" />
        <span className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{last ? `Latest: ${sessionLabel(last)} · ${sessionWhen(last)}` : m.started ? `Started ${prettyDate(m.started)}` : "Ready for Session 1"}</span>
          <span className="flex items-center gap-1 font-medium" style={{ color }}>
            Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0 rounded-xl bg-secondary/70 px-2.5 py-2">
      <span className="block truncate text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="block whitespace-nowrap font-display text-base font-semibold tabular-nums">{value}</span>
    </span>
  );
}
