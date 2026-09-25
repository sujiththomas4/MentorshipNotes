import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Copy, Download, Instagram, Star, Wand2 } from "lucide-react";
import { Page } from "@/components/page";
import { cn } from "@/lib/utils";
import { BV_COLORS, BV_PRIMARY, BV_VARIANTS } from "@/branding/bethlehem-valley";
import { BvStudio } from "@/branding/bv-studio";

export const Route = createFileRoute("/branding/bethlehem-valley")({
  head: () => ({ meta: [{ title: "Bethlehem Valley · Branding" }] }),
  component: BethlehemValleyPage,
});

const FOREST = "#0B3D24";
const DEEP = "#063A20";
const GOLD = "#D4AF37";
const WARM = "#E2B94B";
const IVORY = "#F7F3E8";

const STAGES = [
  { id: "forest", label: "Forest", css: `radial-gradient(circle at 50% 35%, #14583a, ${DEEP})` },
  { id: "ivory", label: "Ivory", css: IVORY },
  { id: "white", label: "White", css: "#ffffff" },
  { id: "black", label: "Black", css: "#0b0b0b" },
  {
    id: "checker",
    label: "Transparent",
    css: "repeating-conic-gradient(#d9d9d9 0% 25%, #ffffff 0% 50%) 50% / 20px 20px",
  },
] as const;

function BethlehemValleyPage() {
  const [variant, setVariant] = useState(BV_PRIMARY);
  const [stage, setStage] = useState<(typeof STAGES)[number]["id"]>("forest");
  const stageCss = STAGES.find((s) => s.id === stage)!.css;
  const primary = BV_VARIANTS[BV_PRIMARY];

  function openInStudio(i: number) {
    setVariant(i);
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Page>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/branding" className="hover:text-foreground">
          Branding
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Bethlehem Valley</span>
      </nav>

      {/* hero */}
      <header className="relative mt-4 overflow-hidden rounded-3xl shadow-xl" style={{ background: `radial-gradient(90% 100% at 50% 0%, #1b6b45 0%, ${FOREST} 45%, #041f11 100%)` }}>
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `radial-gradient(40% 50% at 50% 38%, ${WARM}55, transparent 70%)` }} />
        <div className="relative flex flex-wrap items-center justify-center gap-10 px-6 pb-6 pt-10">
          <img src={primary.web} alt="Bethlehem Valley logo" className="h-72 w-72 drop-shadow-[0_18px_30px_rgba(0,0,0,.45)] md:h-80 md:w-80" />
        </div>
        <div className="relative border-t px-6 py-6 text-center md:px-12" style={{ borderColor: `${GOLD}40` }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: WARM }}>
            Farm &amp; plantation
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-5xl" style={{ color: IVORY }}>
            Bethlehem Valley
          </h1>
          <div className="mx-auto mt-3 h-px w-40" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: `${IVORY}bb` }}>
            {BV_VARIANTS.length} logo variants: the round badge (cow, coffee-cherry &ldquo;B&rdquo;, hen and the valley, with the gold ribbon name) and the round emblem without the name. Transparent 1080 × 1080 PNGs.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <a href="#variants" className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: GOLD, color: "#1d1a0c" }}>
              See all variants
            </a>
            <a href="#studio" className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold" style={{ borderColor: `${GOLD}80`, color: IVORY }}>
              <Wand2 className="h-4 w-4" /> Logo studio
            </a>
          </div>
        </div>
      </header>

      {/* variants */}
      <Block id="variants" title="Logo variants" note={`All ${BV_VARIANTS.length}, shown on the background you pick. Click one to open it in the studio.`}>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStage(s.id)}
              aria-pressed={stage === s.id}
              className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium", stage === s.id ? "border-[#0B3D24] bg-[#0B3D24] text-white" : "border-border bg-card hover:bg-secondary")}
            >
              <span className="h-4 w-4 rounded-full ring-1 ring-black/15" style={{ background: s.css }} />
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {BV_VARIANTS.map((v, i) => (
            <div key={v.id} className={cn("card-elevated overflow-hidden rounded-2xl border bg-card", variant === i ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/40" : "border-border")}>
              <button type="button" onClick={() => openInStudio(i)} className="relative block w-full p-6" style={{ background: stageCss }} aria-label={`Open variant ${v.id} in the studio`}>
                <img src={v.web} alt={`Bethlehem Valley logo variant ${v.id}`} className="mx-auto aspect-square w-full max-w-64 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,.3)]" />
                {i === BV_PRIMARY && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: GOLD, color: "#1d1a0c" }}>
                    <Star className="h-3 w-3" /> Default
                  </span>
                )}
              </button>
              <div className="flex items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-display font-semibold">Variant {v.id}</p>
                  <p className="text-xs text-muted-foreground">1080 × 1080 · transparent PNG</p>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openInStudio(i)} title="Open in studio" className="rounded-lg border border-border p-2 hover:bg-secondary">
                    <Wand2 className="h-4 w-4" />
                  </button>
                  <a href={v.logo} download={`bethlehem-valley_v${v.id}_transparent_1080x1080.png`} title="Download PNG" className="rounded-lg border border-border p-2 hover:bg-secondary">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* colours */}
      <Block title="Brand colours" note="From the logo studio. Click a colour to copy its hex code.">
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {BV_COLORS.map((c) => (
            <ColorCard key={c.hex} {...c} />
          ))}
        </div>
      </Block>

      {/* instagram */}
      <Block title="On Instagram" note="The badge is round, so it fits the circular profile photo as it is.">
        <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr]">
          <div className="card-elevated flex flex-wrap items-end gap-8 rounded-2xl border border-border bg-card p-6">
            {[
              { size: 168, label: "Profile page" },
              { size: 64, label: "Stories ring" },
              { size: 32, label: "Feed / comments" },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-2">
                <span
                  className="flex items-center justify-center rounded-full p-[3px]"
                  style={{ background: p.size === 64 ? "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)" : "transparent" }}
                >
                  <span className="flex items-center justify-center overflow-hidden rounded-full bg-white p-[2px]" style={{ width: p.size, height: p.size }}>
                    <img src={p.size > 64 ? primary.web : "/branding/bethlehem-valley/bv-mark.png"} alt="" className="h-full w-full rounded-full object-cover" style={{ background: FOREST }} />
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{p.label}</span>
              </div>
            ))}
          </div>
          <div className="card-elevated rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <Instagram className="h-5 w-5" /> Next for the account
            </p>
            <ul className="mt-3 space-y-2 text-[15px]">
              {[
                "Tell me which variant is the main logo (Variant 01 is used for now)",
                "The Instagram handle",
                "Fonts, if decided",
                "A line about the farm: what you grow, where, and the tone of the account",
                "For each template: a reference design, what changes each time, and the posting days",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: FOREST }} />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/social/$platform"
              params={{ platform: "instagram" }}
              search={{ brand: "bethlehem-valley" }}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
              style={{ color: FOREST }}
            >
              See the Bethlehem Valley template slots →
            </Link>
          </div>
        </div>
      </Block>

      {/* studio */}
      <Block id="studio" title="Logo studio" note="Put any variant on a background (solid, gradient or your own photo), size it for a square post, 4:5 post or story, and export a PNG.">
        <BvStudio variant={variant} onVariant={setVariant} />
      </Block>
    </Page>
  );
}

function ColorCard({ name, hex }: { name: string; hex: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(hex).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="card-elevated overflow-hidden rounded-2xl border border-border bg-card text-left transition-transform hover:-translate-y-0.5"
    >
      <span className="block h-24" style={{ background: hex }} />
      <span className="flex items-center justify-between gap-2 p-3">
        <span>
          <span className="block text-sm font-semibold">{name}</span>
          <span className="font-mono text-xs text-muted-foreground">{hex}</span>
        </span>
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
      </span>
    </button>
  );
}

function Block({ id, title, note, children }: { id?: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
