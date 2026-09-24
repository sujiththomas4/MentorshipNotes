import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, LayoutTemplate } from "lucide-react";
import { Page } from "@/components/page";
import { getPlatform } from "@/social/registry";

export const Route = createFileRoute("/social/$platform/")({
  beforeLoad: ({ params }) => {
    if (!getPlatform(params.platform)?.available) throw notFound();
  },
  head: ({ params }) => ({ meta: [{ title: `${getPlatform(params.platform)?.name ?? ""} templates · Social Media` }] }),
  component: PlatformPage,
});

function PlatformPage() {
  const { platform } = Route.useParams();
  const p = getPlatform(platform)!;
  const Icon = p.icon;
  return (
    <Page>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/social" className="hover:text-foreground">
          Social Media
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{p.name}</span>
      </nav>

      <header className="relative mt-4 overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl md:px-10" style={{ background: p.gradient }}>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <Icon className="h-8 w-8" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">Social Media</p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{p.name} templates</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-white/90">Pick a template, fill in the day's data, and download the post.</p>
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {p.templates.map((t) => (
          <Link
            key={t.id}
            to="/social/$platform/$template"
            params={{ platform: p.id, template: t.id }}
            className="card-elevated group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-xl"
          >
            <div className="bg-[#071422] p-4">
              <div className="overflow-hidden rounded-lg">
                <t.Thumbnail />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="break-all font-mono text-sm font-bold">{t.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <span className="flex-1" />
              <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-mono">{t.size.w} × {t.size.h}</span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-accent">
                  Open editor <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center text-muted-foreground">
          <LayoutTemplate className="h-8 w-8" />
          <p className="font-display font-semibold">More templates coming</p>
          <p className="max-w-56 text-xs">Share a reference image and spec to add the next one.</p>
        </div>
      </div>
    </Page>
  );
}
