import type { ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  AtSign,
  CalendarClock,
  ChevronRight,
  ImagePlus,
  Info,
  LayoutTemplate,
  Lightbulb,
  Radio,
  Star,
} from "lucide-react";
import { Page } from "@/components/page";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { BRANDS, type Brand, type BrandId } from "@/branding/brands";
import { useFavourites } from "@/social/favourites";
import { getPlatform, type SocialPlatform } from "@/social/registry";
import { DAY_LONG, useScheduleState, type Weekday } from "@/social/schedule";
import { LiveBadge, ScheduleBlock } from "@/social/schedule-ui";

type Search = { brand?: BrandId };

export const Route = createFileRoute("/social/$platform/")({
  validateSearch: (s: Record<string, unknown>): Search =>
    BRANDS.some((b) => b.id === s.brand) ? { brand: s.brand as BrandId } : {},
  beforeLoad: ({ params }) => {
    if (!getPlatform(params.platform)?.available) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${getPlatform(params.platform)?.name ?? ""} templates · Social Media`,
      },
    ],
  }),
  component: PlatformPage,
});

function PlatformPage() {
  const { platform } = Route.useParams();
  const { brand: only } = Route.useSearch();
  const p = getPlatform(platform)!;
  const Icon = p.icon;
  const sched = useScheduleState();
  const { today, daysFor, liveToday } = sched;
  const live = p.templates.filter((t) => liveToday(t.id));
  const brands = BRANDS.filter((b) => !only || b.id === only);

  return (
    <Page>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/social" className="hover:text-foreground">
          Social Media
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{p.name}</span>
      </nav>

      <header
        className="relative mt-4 overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl md:px-10"
        style={{ background: p.gradient }}
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <Icon className="h-8 w-8" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
              Social Media
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {p.name} templates
            </h1>
          </div>
        </div>
        <div className="absolute right-5 top-5 flex gap-2 md:right-8 md:top-7">
          <Link
            to="/social/$platform/ideas"
            params={{ platform: p.id }}
            title="Topic ideas: ad hoc post and video topics with priority and notes"
            className="inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-left ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#d62976] shadow">
              <Lightbulb className="h-6 w-6" />
            </span>
            <span className="hidden leading-tight lg:block">
              <span className="block font-display text-base font-bold">Topic ideas</span>
              <span className="block text-xs text-white/80">Ad hoc topics · P1–P5 · notes</span>
            </span>
          </Link>
          <Link
            to="/social/$platform/planner"
            params={{ platform: p.id }}
            title="Content planner: calendar, times, recurring and one-off posts"
            className="inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-left ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#d62976] shadow">
              <CalendarClock className="h-6 w-6" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-base font-bold">Content planner</span>
              <span className="block text-xs text-white/80">Calendar · times · what posts when</span>
            </span>
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-white/90">
          {BRANDS.length} accounts: {BRANDS.map((b) => b.name).join(" and ")}.
          Pick a template, fill in the day's data, and download the post.
        </p>
      </header>

      {/* brand switcher */}
      <div
        className="mt-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Account"
      >
        <Tab to={undefined} active={!only} platform={p.id}>
          All accounts <Count n={p.templates.length} />
        </Tab>
        {BRANDS.map((b) => (
          <Tab key={b.id} to={b.id} active={only === b.id} platform={p.id}>
            <BrandMark brand={b} className="h-6 w-6" />
            {b.name}{" "}
            <Count n={p.templates.filter((t) => t.brand === b.id).length} />
          </Tab>
        ))}
      </div>

      {today !== null && (
        <div
          className={cn(
            "mt-4 flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-4",
            live.length
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          <Radio className={cn("h-5 w-5", live.length && "text-emerald-600")} />
          <p className="text-sm">
            <b>Today · {DAY_LONG[today]}:</b>{" "}
            {live.length ? (
              <>
                {live.length} {live.length === 1 ? "post goes" : "posts go"}{" "}
                live —{" "}
                {live.map((t, k) => (
                  <span key={t.id}>
                    {k > 0 && ", "}
                    <Link
                      to="/social/$platform/$template"
                      params={{ platform: p.id, template: t.id }}
                      className="font-semibold underline-offset-2 hover:underline"
                    >
                      {t.title}
                    </Link>{" "}
                    <span className="text-emerald-700/80">
                      ({BRANDS.find((b) => b.id === t.brand)?.name})
                    </span>
                  </span>
                ))}
              </>
            ) : (
              "nothing scheduled."
            )}
          </p>
        </div>
      )}

      {brands.map((b) => (
        <BrandSection
          key={b.id}
          brand={b}
          p={p}
          today={today}
          daysFor={daysFor}
          isCustom={sched.isCustom}
          liveToday={liveToday}
          timeFor={sched.timeFor}
        />
      ))}
    </Page>
  );
}

function Tab({
  to,
  active,
  platform,
  children,
}: {
  to: BrandId | undefined;
  active: boolean;
  platform: string;
  children: ReactNode;
}) {
  return (
    <Link
      to="/social/$platform"
      params={{ platform }}
      search={to ? { brand: to } : {}}
      role="tab"
      aria-selected={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:bg-secondary",
      )}
    >
      {children}
    </Link>
  );
}

/** ⓘ button; the text shows on hover, or on tap / keyboard focus. */
function InfoTip({ text }: { text: string }) {
  return (
    <span className="group/tip relative shrink-0">
      <button
        type="button"
        aria-label="About this template"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Info className="h-4 w-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute right-0 top-full z-30 mt-1 w-72 max-w-[80vw] rounded-xl border border-border bg-popover p-3 text-sm leading-relaxed text-popover-foreground opacity-0 shadow-xl transition-opacity group-focus-within/tip:visible group-focus-within/tip:opacity-100 group-hover/tip:visible group-hover/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

const Count = ({ n }: { n: number }) => (
  <span className="rounded-full bg-black/10 px-1.5 font-mono text-[11px] opacity-80">
    {n}
  </span>
);

function BrandSection({
  brand: b,
  p,
  today,
  daysFor,
  isCustom,
  liveToday,
  timeFor,
}: {
  brand: Brand;
  p: SocialPlatform;
  today: Weekday | null;
  daysFor: ReturnType<typeof useScheduleState>["daysFor"];
  isCustom: (id: string) => boolean;
  liveToday: (id: string) => boolean;
  timeFor: (id: string) => string;
}) {
  const fav = useFavourites();
  // favourites first, then what goes live today, then the registry order
  const rows = p.templates
    .map((t, i) => ({ t, i, days: daysFor(t.id, t.schedule) }))
    .filter((r) => r.t.brand === b.id)
    .map((r) => ({ ...r, live: liveToday(r.t.id), star: fav.isFav(r.t.id) }))
    .sort((a, c) => Number(c.star) - Number(a.star) || Number(c.live) - Number(a.live) || a.i - c.i);

  return (
    <section className="mt-10">
      {/* account header */}
      <div
        className="flex flex-wrap items-center gap-4 rounded-2xl px-5 py-4 text-white shadow"
        style={{
          background: `linear-gradient(120deg, ${b.ui.from}, ${b.ui.to})`,
        }}
      >
        {b.logo ? (
          <img src={b.logo} alt={b.name} className="h-12 w-auto" />
        ) : (
          <BrandMark brand={b} className="h-12 w-12 text-base" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold">{b.name}</h2>
          <p className="text-sm text-white/75">{b.about}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
          <AtSign className="h-3.5 w-3.5" /> {b.handle || "handle not set"}
        </span>
        <Link
          to={b.page}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
        >
          Brand kit →
        </Link>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rows.map(({ t, days, live, star }) => (
          <div
            key={t.id}
            className={cn(
              "card-elevated group relative flex flex-col rounded-2xl border bg-card transition-all hover:z-10 hover:-translate-y-0.5 hover:shadow-xl focus-within:z-10",
              live
                ? "border-emerald-400 ring-2 ring-emerald-400/60"
                : "border-border hover:border-accent",
            )}
          >
            <Link
              to="/social/$platform/$template"
              params={{ platform: p.id, template: t.id }}
              className="relative block rounded-t-[15px] bg-[#071422] p-4"
            >
              <div className="overflow-hidden rounded-lg">
                <t.Thumbnail />
              </div>
              <LiveBadge
                days={days}
                today={today}
                live={live}
                className="absolute left-6 top-6"
              />
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start gap-1">
                <Link
                  to="/social/$platform/$template"
                  params={{ platform: p.id, template: t.id }}
                  className="min-w-0 flex-1 break-all pt-1 font-mono text-sm font-bold hover:text-accent"
                >
                  {t.title}
                </Link>
                <InfoTip text={t.description} />
                <button
                  type="button"
                  onClick={() => fav.toggle(t.id)}
                  aria-pressed={star}
                  aria-label={star ? `Remove ${t.title} from favourites` : `Add ${t.title} to favourites`}
                  title={star ? "Favourite: shown first. Click to remove." : "Add to favourites (shown first)"}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-secondary"
                >
                  <Star className={cn("h-4 w-4", star ? "fill-amber-400 text-amber-500" : "text-muted-foreground")} />
                </button>
              </div>
              <div className="mt-3">
                <ScheduleBlock
                  template={t}
                  days={days}
                  today={today}
                  custom={isCustom(t.id)}
                  time={timeFor(t.id)}
                />
              </div>
              <span className="flex-1" />
              <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-mono">
                  {t.size.w} × {t.size.h}
                </span>
                <Link
                  to="/social/$platform/$template"
                  params={{ platform: p.id, template: t.id }}
                  className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-accent"
                >
                  Open editor{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* empty slots: 3 for a new account, 1 "more coming" otherwise */}
        {(rows.length ? [0] : [1, 2, 3]).map((n) => (
          <div
            key={n}
            className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center text-muted-foreground"
            style={{
              borderColor: rows.length ? undefined : `${b.ui.from}55`,
              background: rows.length ? undefined : `${b.ui.from}0d`,
            }}
          >
            {rows.length ? (
              <LayoutTemplate className="h-8 w-8" />
            ) : (
              <ImagePlus className="h-8 w-8" style={{ color: b.ui.from }} />
            )}
            <p className="font-display font-semibold text-foreground">
              {rows.length
                ? "More templates coming"
                : `${b.name} template ${n}`}
            </p>
            <p className="max-w-60 text-xs">
              {rows.length
                ? "Share a reference image and spec to add the next one."
                : "Waiting for details: share a reference design, the post size and what changes each time."}
            </p>
            {!rows.length && (
              <span className="mt-1 rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px]">
                1080 × 1350 · placeholder
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
