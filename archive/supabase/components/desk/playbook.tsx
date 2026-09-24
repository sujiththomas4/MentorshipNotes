import { Card } from "@/components/page";
import { PLAYBOOK } from "@/lib/market-profile";

function TypeList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map(([name, what]) => (
        <li key={name} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
          <span className="font-display text-sm font-semibold sm:w-48 sm:shrink-0">{name}</span>
          <span className="text-sm leading-relaxed text-muted-foreground">{what}</span>
        </li>
      ))}
    </ul>
  );
}

/** Static reference; grows as the mentorship goes on. */
export function Playbook() {
  return (
    <div className="space-y-4">
      <Card>
        <p className="eyebrow mb-2">Day types</p>
        <TypeList items={PLAYBOOK.dayTypes} />
      </Card>
      <Card>
        <p className="eyebrow mb-2">Opening types</p>
        <TypeList items={PLAYBOOK.openingTypes} />
      </Card>
      <Card>
        <p className="eyebrow mb-2">Terms</p>
        <dl className="grid gap-x-6 sm:grid-cols-2">
          {PLAYBOOK.terms.map(([term, def]) => (
            <div key={term} className="border-t border-border py-2.5">
              <dt className="font-mono text-xs font-semibold text-gold">{term}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{def}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card>
        <p className="eyebrow mb-2">Rules — pending mentorship</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The slot for the actual entry and exit rules: what qualifies an open location, how the 40-minute and
          30-minute closes combine into a day type, where the entry trigger sits, where the stop goes, and how targets
          step from POC to the opposite value edge. This becomes the checklist you run before every trade.
        </p>
      </Card>
    </div>
  );
}
