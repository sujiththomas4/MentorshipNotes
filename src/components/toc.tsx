import { cn } from "@/lib/utils";

/** Sticky "On this page" list for wide screens; items come from useToc. */
export function TocAside({ items, color }: { items: { id: string; text: string; active: boolean }[]; color: string }) {
  if (items.length < 2) return null;
  return (
    <aside className="hidden w-60 shrink-0 xl:block">
      <div className="card-elevated sticky top-6 rounded-2xl border border-border bg-card p-4">
        <p className="eyebrow mb-3">On this page</p>
        <ul className="space-y-0.5 text-sm">
          {items.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={cn(
                  "block rounded-lg px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  h.active && "bg-secondary font-medium text-foreground",
                )}
                style={h.active ? { boxShadow: `inset 3px 0 0 ${color}` } : undefined}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
