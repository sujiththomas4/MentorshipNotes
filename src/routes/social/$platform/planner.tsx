import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Page } from "@/components/page";
import { getPlatform } from "@/social/registry";
import { PlannerScreen } from "@/social/planner-ui";

export const Route = createFileRoute("/social/$platform/planner")({
  beforeLoad: ({ params }) => {
    if (!getPlatform(params.platform)?.available) throw notFound();
  },
  head: ({ params }) => ({ meta: [{ title: `Content planner · ${getPlatform(params.platform)?.name ?? ""}` }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const { platform } = Route.useParams();
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
        <span className="text-foreground">Planner</span>
      </nav>
      <PlannerScreen platform={p} />
    </Page>
  );
}
