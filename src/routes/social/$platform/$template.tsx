import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Page } from "@/components/page";
import { getPlatform, getTemplate } from "@/social/registry";
import { useScheduleState } from "@/social/schedule";
import { LiveBadge, ScheduleInline } from "@/social/schedule-ui";
import { HashtagPanel } from "@/social/hashtags-ui";
import { PlanBar, PlanSessionProvider } from "@/social/saved-posts";

/** Opened from the content planner: which planned post this editor is working on. */
type Search = { plan?: string; date?: string; time?: string };

export const Route = createFileRoute("/social/$platform/$template")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(typeof s.plan === "string" ? { plan: s.plan } : {}),
    ...(typeof s.date === "string" ? { date: s.date } : {}),
    ...(typeof s.time === "string" ? { time: s.time } : {}),
  }),
  beforeLoad: ({ params }) => {
    if (!getTemplate(params.platform, params.template)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [{ title: `${params.template} · Social Media` }],
  }),
  component: TemplatePage,
});

function TemplatePage() {
  const { platform, template } = Route.useParams();
  const p = getPlatform(platform)!;
  const t = getTemplate(platform, template)!;
  const Icon = p.icon;
  const { today, daysFor, liveToday } = useScheduleState();
  const days = daysFor(t.id, t.schedule);
  return (
    <PlanSessionProvider>
      <Page>
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/social" className="hover:text-foreground">
            Social Media
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            to="/social/$platform"
            params={{ platform: p.id }}
            className="hover:text-foreground"
          >
            {p.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-mono text-foreground">{t.title}</span>
        </nav>

        <header className="mt-4 flex items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow"
            style={{ background: p.gradient }}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-all font-mono text-2xl font-bold">
                {t.title}
              </h1>
              <ScheduleInline days={days} today={today} />
              <LiveBadge days={days} today={today} live={liveToday(t.id)} />
            </div>
            <p className="text-sm text-muted-foreground">
              {t.description} · {t.size.label}
            </p>
          </div>
        </header>

        <PlanBar platform={p.id} />

        <div className="mt-6">
          <HashtagPanel key={t.id} templateId={t.id} />
        </div>

        <div className="mt-6">
          <t.Editor />
        </div>
      </Page>
    </PlanSessionProvider>
  );
}
