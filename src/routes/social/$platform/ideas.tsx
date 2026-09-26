import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Page } from "@/components/page";
import { getPlatform } from "@/social/registry";
import { IdeasScreen } from "@/social/ideas-ui";

/** Opened from the planner: the topic to scroll to. */
type Search = { idea?: string };

export const Route = createFileRoute("/social/$platform/ideas")({
  validateSearch: (s: Record<string, unknown>): Search => (typeof s.idea === "string" ? { idea: s.idea } : {}),
  beforeLoad: ({ params }) => {
    if (!getPlatform(params.platform)?.available) throw notFound();
  },
  head: ({ params }) => ({ meta: [{ title: `Topic ideas · ${getPlatform(params.platform)?.name ?? ""}` }] }),
  component: IdeasPage,
});

function IdeasPage() {
  const { platform } = Route.useParams();
  const { idea } = Route.useSearch();
  const p = getPlatform(platform)!;
  return (
    <Page>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/social" className="hover:text-foreground">
          Social Media
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/social/$platform" params={{ platform: p.id }} className="hover:text-foreground">
          {p.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Topic ideas</span>
      </nav>
      <IdeasScreen platform={p} focus={idea} />
    </Page>
  );
}
