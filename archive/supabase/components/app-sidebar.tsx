import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpenText,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMentors } from "@/lib/queries";
import { MentorDot } from "@/components/mentor-tag";
import { cn } from "@/lib/utils";

type Props = {
  onSignOut: () => void;
  /** called after any link is followed (closes the mobile drawer) */
  onNavigate?: () => void;
};

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
const activeClass = "bg-sidebar-accent font-medium text-sidebar-accent-foreground";

export function AppSidebar({ onSignOut, onNavigate }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as { mentor?: string };
  const { data: mentors = [] } = useMentors();

  const activeMentor = pathname.replace(/\/$/, "") === "/notes" ? search.mentor : undefined;
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <BookOpenText className="h-4.5 w-4.5" />
        </div>
        <span className="font-display text-base font-semibold text-sidebar-foreground">Mentor Notes</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div>
          <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
            Navigate
          </p>
          <div className="space-y-0.5">
            <Link to="/" onClick={onNavigate} className={cn(itemClass, isActive("/") && activeClass)}>
              <LayoutDashboard className="h-4 w-4" /> Home
            </Link>
            <Link
              to="/notes"
              onClick={onNavigate}
              className={cn(itemClass, isActive("/notes") && !activeMentor && pathname !== "/notes/new" && activeClass)}
            >
              <NotebookPen className="h-4 w-4" /> Session notes
            </Link>
            <Link to="/key-notes" onClick={onNavigate} className={cn(itemClass, isActive("/key-notes") && activeClass)}>
              <Star className="h-4 w-4" /> My Key Notes
            </Link>
            <Link to="/desk" onClick={onNavigate} className={cn(itemClass, isActive("/desk") && activeClass)}>
              <TrendingUp className="h-4 w-4" /> Trading Desk
            </Link>
            <Link to="/mentors" onClick={onNavigate} className={cn(itemClass, isActive("/mentors") && activeClass)}>
              <Users className="h-4 w-4" /> Mentorships
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
            Mentorships
          </p>
          <div className="space-y-0.5">
            {mentors.length === 0 && (
              <p className="px-2.5 py-1.5 text-xs text-sidebar-foreground/60">
                No mentorships yet.{" "}
                <Link to="/mentors" onClick={onNavigate} className="underline underline-offset-2">
                  Add one
                </Link>
              </p>
            )}
            {mentors.map((m) => (
              <Link
                key={m.id}
                to="/notes"
                search={{ mentor: m.id }}
                onClick={onNavigate}
                className={cn(itemClass, activeMentor === m.id && activeClass)}
              >
                <MentorDot color={m.color} />
                <span className="truncate">{m.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button type="button" onClick={onSignOut} className={itemClass}>
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
