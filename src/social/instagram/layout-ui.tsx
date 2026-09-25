import { cn } from "@/lib/utils";
import { IG_FORMATS, type IgFormat, type IgLayout, type IgTheme } from "./layout";

/* "Format & layout" panel for the SVG (Indian Traders) editors, laid out like the Bethlehem Valley one. */

export function LayoutPanel({
  value,
  onChange,
  themes,
  header = "Show header (logo, date)",
  footer = "Show footer",
  note,
}: {
  value: IgLayout;
  onChange: (l: IgLayout) => void;
  themes: IgTheme[];
  header?: string;
  footer?: string;
  note?: string;
}) {
  const up = (p: Partial<IgLayout>) => onChange({ ...value, ...p });
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">Format &amp; layout</h2>
      {note && <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4 inline-flex flex-wrap gap-1 rounded-xl bg-secondary p-1">
        {(Object.keys(IG_FORMATS) as IgFormat[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => up({ format: f })}
            aria-pressed={value.format === f}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", value.format === f ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {IG_FORMATS[f].label}
          </button>
        ))}
      </div>
      <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Colour theme</p>
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => up({ theme: t.id })}
            aria-pressed={value.theme === t.id}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold",
              value.theme === t.id ? "border-foreground" : "border-border hover:border-muted-foreground/40",
            )}
          >
            <span className="flex overflow-hidden rounded-md">
              {t.swatch.map((c) => (
                <span key={c} className="h-6 w-4" style={{ background: c }} />
              ))}
            </span>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        {(
          [
            ["showHeader", header],
            ["showFooter", footer],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={value[k]} onChange={(e) => up({ [k]: e.target.checked })} className="h-4 w-4 accent-[#0A3A20]" />
            {label}
          </label>
        ))}
      </div>
      {(!value.showHeader || !value.showFooter || value.format === "story") && (
        <p className="mt-2 text-xs text-muted-foreground">The content spreads out to fill the page.</p>
      )}
    </section>
  );
}
