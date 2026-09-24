/** Shown when .env has no Supabase URL / key yet. */
export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <p className="eyebrow">Setup</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Connect Supabase</h1>
      <p className="mt-3 text-muted-foreground">
        The app needs your Supabase project's URL and public key before it can sign you in.
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
        <li>
          Copy <code className="rounded bg-secondary px-1.5 py-0.5">.env.example</code> to{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5">.env</code> in the project folder.
        </li>
        <li>
          Fill in <code className="rounded bg-secondary px-1.5 py-0.5">VITE_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5">VITE_SUPABASE_PUBLISHABLE_KEY</code> from Supabase →
          Project Settings → API.
        </li>
        <li>
          Run <code className="rounded bg-secondary px-1.5 py-0.5">supabase/migrations/0001_mentor_notes.sql</code> in
          the Supabase SQL Editor.
        </li>
        <li>
          Stop and restart <code className="rounded bg-secondary px-1.5 py-0.5">npm run dev</code>.
        </li>
      </ol>
    </div>
  );
}
