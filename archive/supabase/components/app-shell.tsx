import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, NotebookPen, X } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setDrawerOpen(false), [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    // drop the previous user's cached rows
    queryClient.clear();
    toast("Signed out");
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-sidebar md:block">
        <AppSidebar onSignOut={signOut} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-4 rounded-md p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <AppSidebar onSignOut={signOut} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between gap-3">
            <span className="truncate font-display text-sm font-medium text-muted-foreground">
              {session?.user.email ?? "Mentor Notes"}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1.5" asChild>
                <Link to="/notes/new">
                  <NotebookPen className="h-4 w-4" />
                  <span className="hidden sm:inline">New session</span>
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
