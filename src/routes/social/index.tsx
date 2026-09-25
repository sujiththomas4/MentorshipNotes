import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Radio } from "lucide-react";
import { Page } from "@/components/page";
import { PLATFORMS } from "@/social/registry";
import { DAY_LONG, formatDays, useScheduleState } from "@/social/schedule";

export const Route = createFileRoute("/social/")({
  head: () => ({ meta: [{ title: "Social Media · Mentor Notes" }] }),
  component: SocialHome,
});

function SocialHome() {
  return (
    <Page>
      <header className="hero-surface rounded-3xl px-6 py-8 text-white shadow-xl md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">Indian Traders</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-5xl">Social Media</h1>
        <p className="mt-3 max-w-2xl text-white/75 md:text-lg">
          Fill in the day's inputs, preview the post, and download a ready-to-upload image. No image generator needed.
        </p>
      </header>

      <TodayPosts />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const body = (
            <>
              <div className="flex h-32 items-center justify-center" style={{ background: p.gradient }}>
                <Icon className="h-14 w-14 text-white drop-shadow" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-display text-lg font-bold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.available ? `${p.templates.length} ${p.templates.length === 1 ? "template" : "templates"}` : "Coming soon"}
                  </p>
                </div>
                {p.available && <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />}
              </div>
            </>
          );
          return p.available ? (
            <Link
              key={p.id}
              to="/social/$platform"
              params={{ platform: p.id }}
              className="card-elevated group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {body}
            </Link>
          ) : (
            <div key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-dashed border-border bg-card/60 opacity-60 grayscale">
              {body}
            </div>
          );
        })}
      </div>
    </Page>
  );
}

/** Templates scheduled for today across all platforms, plus the week's plan. */
function TodayPosts() {
  const { today, daysFor, liveToday } = useScheduleState();
  if (today === null) return null;
  const all = PLATFORMS.filter((p) => p.available).flatMap((p) => p.templates.map((t) => ({ p, t, days: daysFor(t.id, t.schedule) })));
  const live = all.filter((r) => liveToday(r.t.id));
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Radio className="h-5 w-5 text-emerald-600" /> Today · {DAY_LONG[today]}
        </h2>
        <span className="text-sm text-muted-foreground">
          {live.length ? `${live.length} ${live.length === 1 ? "post goes" : "posts go"} live today` : "Nothing scheduled today"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {all.map(({ p, t, days }) => {
          const on = liveToday(t.id);
          const Icon = p.icon;
          return (
            <Link
              key={t.id}
              to="/social/$platform/$template"
              params={{ platform: p.id, template: t.id }}
              className={
                "flex items-center gap-3 rounded-xl border p-3 transition-colors " +
                (on ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100" : "border-border opacity-70 hover:opacity-100")
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: p.gradient }}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{t.title}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" /> {formatDays(days)}
                </span>
              </span>
              {on ? (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">Live today</span>
              ) : (
                <span className="text-[11px] text-muted-foreground">Not today</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
