import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { Spinner } from "@/components/page";
import { supabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** Signed-in layout: every page under here needs a session. */
export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { session, loading } = useAuth();

  if (!supabaseConfigured) return <SetupNotice />;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
