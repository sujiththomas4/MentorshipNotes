import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ImagePlus } from "lucide-react";
import { Page } from "@/components/page";
import { BRANDS } from "@/branding/brands";
import { PALETTE } from "@/branding/indian-traders";
import { BV_COLORS } from "@/branding/bethlehem-valley";
import { PLATFORMS } from "@/social/registry";

export const Route = createFileRoute("/branding/")({
  head: () => ({ meta: [{ title: "Branding · Mentor Notes" }] }),
  component: BrandingHome,
});

const templateCount = (brand: string) =>
  PLATFORMS.flatMap((p) => p.templates).filter((t) => t.brand === brand).length;

function BrandingHome() {
  return (
    <Page>
      <header className="hero-surface rounded-3xl px-6 py-8 text-white shadow-xl md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
          {BRANDS.length} brands
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-5xl">
          Branding
        </h1>
        <p className="mt-3 max-w-2xl text-white/75 md:text-lg">
          One brand kit per Instagram account: logos, colours and usage rules.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {BRANDS.map((b) => {
          const n = templateCount(b.id);
          return (
            <Link
              key={b.id}
              to={b.page}
              className="card-elevated group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-xl"
            >
              <div
                className="flex h-56 items-center justify-center"
                style={{
                  background: `radial-gradient(80% 90% at 50% 0%, ${b.ui.from}, ${b.ui.to})`,
                }}
              >
                {b.logo ? (
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    className="h-28 w-auto drop-shadow-xl"
                  />
                ) : (
                  <div className="flex h-36 w-36 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-white/30 text-white/70">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Logo coming</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-display text-xl font-bold">{b.name}</p>
                  <p className="text-sm text-muted-foreground">{b.about}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-secondary px-2.5 py-1">
                      {n} Instagram {n === 1 ? "template" : "templates"}
                    </span>
                    {(b.id === "indian-traders" ? PALETTE : BV_COLORS).length ? (
                      <span className="flex gap-1">
                        {(b.id === "indian-traders" ? PALETTE : BV_COLORS).slice(0, 7).map((c) => (
                          <span
                            key={c.hex}
                            className="h-4 w-4 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-muted-foreground">
                        Brand kit: waiting for details
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
