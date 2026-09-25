import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, CircleCheck, CircleX, Copy, Download, FileText } from "lucide-react";
import { Page } from "@/components/page";
import { Markdown } from "@/components/markdown";
import { ANATOMY, COLOR_GROUPS, DONTS, INSTAGRAM, VARIANTS, brandFile, type LogoPart, type LogoVariant } from "@/branding/indian-traders";
import { cn } from "@/lib/utils";
import readme from "@/content/branding/logo-readme.md?raw";

export const Route = createFileRoute("/branding/logo")({
  head: () => ({ meta: [{ title: "Logo · Branding" }] }),
  component: LogoPage,
});

const NAVY = "#050b14";

function LogoPage() {
  const [placeVariant, setPlaceVariant] = useState(0);
  const [showReadme, setShowReadme] = useState(false);

  return (
    <Page>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/branding" className="hover:text-foreground">
          Branding
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Indian Traders</span>
      </nav>

      {/* hero */}
      <header className="mt-4 overflow-hidden rounded-3xl shadow-xl" style={{ background: `radial-gradient(80% 90% at 50% 0%, #0d2440, ${NAVY})` }}>
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 px-6 pb-8 pt-12">
          <img src={brandFile(VARIANTS[0].full.file)} alt={VARIANTS[0].name} className="h-64 w-auto drop-shadow-2xl" />
          <img src={brandFile(VARIANTS[1].full.file)} alt={VARIANTS[1].name} className="h-32 w-auto drop-shadow-2xl" />
        </div>
        <div className="border-t border-white/10 px-6 py-6 text-center text-white md:px-12">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Indian Traders logo</h1>
          <p className="mx-auto mt-2 max-w-2xl text-white/70">
            Two locked variants. The PNG files are the master artwork: use them as supplied and scale proportionally.
          </p>
        </div>
      </header>

      {/* variants */}
      <Block title="Locked variants">
        <div className="grid gap-6 xl:grid-cols-2">
          {VARIANTS.map((v, i) => (
            <VariantCard key={v.id} v={v} n={i + 1} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {ANATOMY.map((a) => (
            <span key={a} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm">
              {a}
            </span>
          ))}
        </div>
      </Block>

      {/* colours */}
      <Block title="Colours" note="Reference values only. The PNGs are the source of truth: never recolour the logo in CSS.">
        <div className="grid gap-4 md:grid-cols-3">
          {COLOR_GROUPS.map((g) => (
            <div key={g.name} className="card-elevated rounded-2xl border border-border bg-card p-4">
              <p className="font-display font-semibold">{g.name}</p>
              <div className="mt-3 flex gap-2">
                {g.colors.map((c) => (
                  <Swatch key={c.name + c.hex} {...c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* usage */}
      <Block title="Usage">
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <div className="card-elevated rounded-2xl border border-bull/40 bg-card p-5">
            <p className="font-display text-lg font-bold text-bull">Do</p>
            <ul className="mt-3 space-y-2">
              {[
                "Use the supplied PNG files as the master artwork",
                "Prefer the complete logo for pixel-consistent branding",
                "Scale the whole PNG proportionally",
                "Keep it visually secondary on market cards",
                "Keep it at least 60 px from the canvas edge",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-[15px]">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated rounded-2xl border border-bear/40 bg-card p-5">
            <p className="font-display text-lg font-bold text-bear">Don't</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {DONTS.map((t) => (
                <li key={t} className="flex gap-2 text-[15px]">
                  <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Block>

      {/* instagram placement */}
      <Block title="On Instagram" note="1080 × 1350 px (4:5), sRGB PNG. Suggested starting values, not changes to the artwork.">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <PlacementDiagram v={VARIANTS[placeVariant]} logoWidth={placeVariant === 0 ? INSTAGRAM.vertical : INSTAGRAM.horizontal} />
          <div>
            <div className="flex flex-wrap gap-1.5">
              {VARIANTS.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setPlaceVariant(i)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    placeVariant === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {i === 0 ? "Tricolor Shield" : "Horizontal Shield"}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Spec label="Left" value={`${INSTAGRAM.left} px`} />
              <Spec label="Top" value={`${INSTAGRAM.top} px`} />
              <Spec label="Width" value={`${placeVariant === 0 ? INSTAGRAM.vertical : INSTAGRAM.horizontal} px`} />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed">
              On the Global Market Sentiments cards the logo stays small, top-left, so the market information leads. Height
              is <strong>auto</strong>: set only the width and let the PNG keep its proportions.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-[#071422] p-4 font-mono text-[13px] leading-relaxed text-[#d6e2ec]">
              {`<img src="${VARIANTS[placeVariant].full.file}"
     alt="${VARIANTS[placeVariant].name}"
     style="position:absolute; left:${INSTAGRAM.left}px; top:${INSTAGRAM.top}px;
            width:${placeVariant === 0 ? INSTAGRAM.vertical : INSTAGRAM.horizontal}px; height:auto">`}
            </pre>
          </div>
        </div>
      </Block>

      {/* files */}
      <Block title="Files">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { file: "README.md", name: "README" },
            { file: "assets/logo_spec.json", name: "Logo spec (JSON)" },
            ...VARIANTS.map((v) => ({ file: v.source, name: `${v.id === "tricolor" ? "Vertical" : "Horizontal"} source image` })),
          ].map((d) => (
            <a
              key={d.file}
              href={brandFile(d.file)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm hover:border-accent"
            >
              <FileText className="h-5 w-5 shrink-0 text-accent" />
              <span className="min-w-0">
                <span className="block font-medium">{d.name}</span>
                <span className="block truncate font-mono text-xs text-muted-foreground">{d.file}</span>
              </span>
            </a>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setShowReadme((s) => !s)}
            className="flex w-full items-center justify-between px-5 py-4 text-left font-display font-semibold"
          >
            README.md (full text)
            <ChevronRight className={cn("h-5 w-5 transition-transform", showReadme && "rotate-90")} />
          </button>
          {showReadme && (
            <div className="border-t border-border px-5 py-4">
              <Markdown source={readme} />
            </div>
          )}
        </div>
      </Block>
    </Page>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {note && <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function VariantCard({ v, n }: { v: LogoVariant; n: number }) {
  return (
    <div className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex h-72 items-center justify-center p-8" style={{ backgroundColor: NAVY }}>
        <img src={brandFile(v.full.file)} alt={v.name} className="max-h-full w-auto max-w-full" />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Variant {n}</p>
            <p className="font-display text-lg font-bold">{v.name}</p>
            <p className="text-sm text-muted-foreground">
              {v.layout} · starting width {v.width} px
            </p>
          </div>
          <a
            href={brandFile(v.full.file)}
            download
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" /> Full logo
          </a>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[v.full, v.emblem, v.wordmark].map((p) => (
            <PartTile key={p.file} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PartTile({ p }: { p: LogoPart }) {
  return (
    <a href={brandFile(p.file)} download className="group overflow-hidden rounded-xl border border-border hover:border-accent">
      <span className="flex h-24 items-center justify-center p-3" style={{ backgroundColor: NAVY }}>
        <img src={brandFile(p.file)} alt={p.label} className="max-h-full w-auto max-w-full" />
      </span>
      <span className="flex items-center justify-between gap-1 px-2.5 py-2 text-xs">
        <span>
          <span className="block font-semibold">{p.label}</span>
          <span className="block font-mono text-muted-foreground">{p.size}</span>
          {p.issue && <span className="block font-medium text-amber-700">⚠ {p.issue}</span>}
        </span>
        <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent" />
      </span>
    </a>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-mono text-lg font-semibold">{value}</p>
    </div>
  );
}

/** 1080 × 1350 card to scale, with the chosen logo at its suggested spot. */
function PlacementDiagram({ v, logoWidth }: { v: LogoVariant; logoWidth: number }) {
  const [w, h] = v.full.size.split(" × ").map(Number);
  const logoH = (h / w) * logoWidth;
  const { safe, left, top } = INSTAGRAM;
  return (
    <svg viewBox="0 0 1080 1350" className="block h-auto w-full rounded-2xl shadow-lg" role="img" aria-label="Logo placement on a 1080 by 1350 card">
      <rect width={1080} height={1350} fill="#031321" />
      <rect x={safe} y={safe} width={1080 - 2 * safe} height={1350 - 2 * safe} fill="none" stroke="#54728b" strokeWidth={3} strokeDasharray="14 10" />
      <image href={brandFile(v.full.file)} x={left} y={top} width={logoWidth} height={logoH} />
      <rect x={1080 - safe - 250} y={top + 20} width={250} height={68} rx={16} fill="#061b2b" stroke="#54728b" strokeWidth={2} />
      <text x={1080 - safe - 125} y={top + 64} textAnchor="middle" fill="#b9c7d3" fontFamily="Inter, sans-serif" fontSize={28} fontWeight={600}>
        date chip
      </text>
      <rect x={safe} y={top + logoH + 60} width={1080 - 2 * safe} height={1350 - safe - (top + logoH + 60) - 60} rx={32} fill="#061b2b" stroke="#54728b" strokeWidth={2} />
      <text x={540} y={(top + logoH + 60 + 1350 - safe - 60) / 2} textAnchor="middle" fill="#54728b" fontFamily="Inter, sans-serif" fontSize={40} fontWeight={600}>
        market content
      </text>
      <text x={540} y={1330} textAnchor="middle" fill="#54728b" fontFamily="Inter, sans-serif" fontSize={26}>
        dashed line = {safe} px safe margin
      </text>
    </svg>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(hex).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        })
      }
      className="flex-1 overflow-hidden rounded-xl border border-border text-left"
      title="Copy hex"
    >
      <span className="block h-16" style={{ backgroundColor: hex }} />
      <span className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span>
          <span className="block text-xs font-semibold">{name}</span>
          <span className="block font-mono text-[11px] text-muted-foreground">{hex}</span>
        </span>
        {copied ? <Check className="h-3.5 w-3.5 text-bull" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
      </span>
    </button>
  );
}
