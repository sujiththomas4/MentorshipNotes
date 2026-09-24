import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, CircleCheckBig, CircleQuestionMark, ListTodo } from "lucide-react";
import { Page } from "@/components/page";
import { getMentorship, getSession, mentorColor, sessionLabel, type CheckItem } from "@/content";
import { prettyDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mentorships/$mentorship/to-check")({
  beforeLoad: ({ params }) => {
    if (!getMentorship(params.mentorship)) throw notFound();
  },
  head: ({ params }) => ({ meta: [{ title: `To be checked · ${getMentorship(params.mentorship)?.name ?? ""}` }] }),
  component: ToCheckPage,
});

function ToCheckPage() {
  const { mentorship } = Route.useParams();
  const m = getMentorship(mentorship)!;
  const color = mentorColor(m);
  const [filter, setFilter] = useState<"open" | "answered" | "all">("open");
  const open = m.toCheck.filter((c) => c.status === "open");
  const answered = m.toCheck.filter((c) => c.status === "answered");
  const list = filter === "all" ? [...open, ...answered] : filter === "open" ? open : answered;

  return (
    <Page>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/mentorships/$mentorship" params={{ mentorship: m.slug }} className="hover:text-foreground">
          {m.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">To be checked</span>
      </nav>

      <header
        className="relative mt-4 overflow-hidden rounded-3xl px-6 py-8 text-white shadow-xl md:px-10"
        style={{ background: "linear-gradient(120deg, oklch(0.3 0.07 60), oklch(0.45 0.12 70))" }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <ListTodo className="h-7 w-7" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">{m.name}</p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">To be checked</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-white/85 md:text-lg">
          Topics to study later and questions to ask the mentor. When one is answered, it moves to Answered with the
          answer.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-xl bg-white/15 px-4 py-2 ring-1 ring-white/20">
            <b className="font-display text-lg">{open.length}</b> <span className="text-sm text-white/80">open</span>
          </span>
          <span className="rounded-xl bg-white/15 px-4 py-2 ring-1 ring-white/20">
            <b className="font-display text-lg">{answered.length}</b> <span className="text-sm text-white/80">answered</span>
          </span>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap gap-1.5">
        {(
          [
            ["open", `Open · ${open.length}`],
            ["answered", `Answered · ${answered.length}`],
            ["all", `All · ${m.toCheck.length}`],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              filter === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground xl:col-span-2">
            Nothing here yet.
          </p>
        )}
        {list.map((c) => (
          <CheckCard key={c.question} c={c} mentorship={m.slug} color={color} />
        ))}
      </div>
    </Page>
  );
}

function CheckCard({ c, mentorship, color }: { c: CheckItem; mentorship: string; color: string }) {
  const s = c.session ? getSession(mentorship, c.session) : undefined;
  const done = c.status === "answered";
  return (
    <article
      className={cn(
        "card-elevated relative overflow-hidden rounded-2xl border bg-card p-5 pl-6",
        done ? "border-bull/30" : "border-amber-400/40",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", done ? "bg-bull" : "bg-amber-400")} />
      <div className="flex gap-3">
        {done ? (
          <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-bull" />
        ) : (
          <CircleQuestionMark className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-snug">{c.question}</p>
          {c.context && <p className="mt-1.5 text-[15px] text-muted-foreground">{c.context}</p>}
          {c.answer && (
            <p className="mt-3 rounded-xl bg-bull/8 px-3 py-2 text-[15px]">
              <span className="font-semibold text-bull">Answer: </span>
              {c.answer}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {s && (
              <Link
                to="/mentorships/$mentorship/$session"
                params={{ mentorship, session: s.slug }}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-white hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                {sessionLabel(s)} · {s.title}
              </Link>
            )}
            <span>Added {prettyDate(c.added)}</span>
            <span className={cn("font-semibold uppercase tracking-wider", done ? "text-bull" : "text-amber-700")}>
              {done ? "Answered" : "Open"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
