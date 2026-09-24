import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/** False until .env has the project URL and key; the app shows setup steps instead. */
export const supabaseConfigured = Boolean(url && key);

export const supabase = createClient(
  url ?? "http://localhost:54321",
  key ?? "missing-key",
  {
    auth: {
      // the session lives in the browser; the server render never sees it
      storage: typeof window === "undefined" ? undefined : window.localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
