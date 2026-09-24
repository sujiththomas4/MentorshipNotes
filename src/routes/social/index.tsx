import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Page } from "@/components/page";
import { PLATFORMS } from "@/social/registry";

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
