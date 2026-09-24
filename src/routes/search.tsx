import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, CircleQuestionMark, CornerDownRight, Search, Star, X } from "lucide-react";
import { Page } from "@/components/page";
import { mentorColor, mentorships, sessionLabel, sessionWhen, type Mentorship, type Session } from "@/content";
import { cn } from "@/lib/utils";

/*
 * Full-text search. Session bodies are React components, so the page renders every
 * session once into a hidden container, then reads the text of each section from the DOM.
 */

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
  }),
  head: () => ({ meta: [{ title: "Search · Mentor Notes" }] }),
  component: SearchPage,
});

type SectionDoc = { id: string; title: string; text: string; html: string };
type SessionDoc = { m: Mentorship; s: Session; sections: SectionDoc[] };

const ALL = mentorships.flatMap((m) => m.sessions.map((s) => ({ m, s })));

function SearchPage() {
  const { q: urlQ = "" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [q, setQ] = useState(urlQ);
  const [docs, setDocs] = useState<SessionDoc[] | null>(null);
  const hidden = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // read every rendered session into plain text + HTML per section
  useEffect(() => {
    const root = hidden.current;
    if (!root) return;
    const out: SessionDoc[] = [];
    root.querySelectorAll<HTMLElement>("[data-doc]").forEach((wrap) => {
      const [mSlug, sSlug] = wrap.dataset.doc!.split("/");
      const hit = ALL.find((x) => x.m.slug === mSlug && x.s.slug === sSlug);
      if (!hit) return;
      const sections: SectionDoc[] = [];
      const secEls = Array.from(wrap.querySelectorAll<HTMLElement>("section.note-section"));
      // anything outside a section (e.g. the stat tiles at the top) is the overview
      const overview = wrap.cloneNode(true) as HTMLElement;
      overview.querySelectorAll("section.note-section").forEach((e) => e.remove());
      const ov = toText(overview);
      if (ov) sections.push({ id: "", title: "Overview", text: ov, html: cleanHtml(overview) });
      for (const sec of secEls) {
        const h = sec.querySelector("h2");
        const body = sec.cloneNode(true) as HTMLElement;
        body.querySelector("h2")?.remove();
        sections.push({ id: h?.id ?? "", title: h?.textContent?.trim() ?? "Section", text: toText(body), html: cleanHtml(body) });
      }
      out.push({ ...hit, sections });
    });
    setDocs(out);
  }, []);

  useEffect(() => input.current?.focus(), []);

  // keep ?q= in the URL (debounced) so a search can be reopened
  useEffect(() => {
    const t = setTimeout(() => navigate({ search: q.trim() ? { q: q.trim() } : {}, replace: true }), 300);
    return () => clearTimeout(t);
  }, [q, navigate]);

  const terms = useMemo(() => tokenize(q), [q]);
  const results = useMemo(() => (docs && terms.length ? runSearch(docs, terms) : []), [docs, terms]);
  const checks = useMemo(
    () =>
      terms.length
        ? mentorships.flatMap((m) =>
            m.toCheck.filter((c) => matchesAll(`${c.question} ${c.context ?? ""} ${c.answer ?? ""}`, terms)).map((c) => ({ m, c })),
          )
        : [],
    [terms],
  );
  const total = results.reduce((n, r) => n + r.hits.length + r.keyPoints.length, 0) + checks.length;

  return (
    <Page>
      <header className="hero-surface rounded-3xl px-6 py-8 text-white shadow-xl md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">Search</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">Find anything in your notes</h1>
        <p className="mt-2 max-w-2xl text-white/75">
          Searches every session, topic, key point, caption and the To be checked list. Results show the session, the
          topic, and the full section.
        </p>
        <div className="relative mt-6 max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={input}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. selling tail, VAL, tick size, Wyckoff…"
            className="h-14 w-full rounded-2xl border-0 bg-white pl-12 pr-12 text-lg text-foreground shadow-lg outline-none ring-2 ring-transparent placeholder:text-muted-foreground focus:ring-accent"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {terms.length > 0 && docs && (
          <p className="mt-3 text-sm text-white/75">
            {total === 0 ? "No matches" : `${total} ${total === 1 ? "match" : "matches"}`} in{" "}
            {results.length} {results.length === 1 ? "session" : "sessions"}
            {checks.length > 0 && " and To be checked"}
          </p>
        )}
      </header>

      {/* hidden render of every session, read once to build the index */}
      <div ref={hidden} className="hidden" aria-hidden>
        {ALL.map(({ m, s }) => (
          <div key={`${m.slug}/${s.slug}`} data-doc={`${m.slug}/${s.slug}`}>
            <s.Content />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {!docs && <p className="text-sm text-muted-foreground">Preparing search…</p>}
        {docs && terms.length === 0 && <Browse docs={docs} />}
        {docs && terms.length > 0 && total === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-muted-foreground">
            Nothing matches “{q.trim()}”. Try fewer or different words.
          </p>
        )}

        {results.map((r) => (
          <SessionResult key={`${r.doc.m.slug}/${r.doc.s.slug}`} r={r} terms={terms} />
        ))}

        {checks.length > 0 && (
          <section className="card-elevated overflow-hidden rounded-2xl border border-amber-400/50 bg-card">
            <div className="flex items-center gap-3 border-b border-border bg-amber-50/70 px-5 py-3">
              <CircleQuestionMark className="h-5 w-5 text-amber-600" />
              <p className="font-display font-semibold">To be checked</p>
              <span className="text-xs text-muted-foreground">{checks.length} matching</span>
            </div>
            <ul className="divide-y divide-border">
              {checks.map(({ m, c }) => (
                <li key={c.question} className="px-5 py-3">
                  <Link to="/mentorships/$mentorship/to-check" params={{ mentorship: m.slug }} className="font-medium hover:underline">
                    <Hl text={c.question} terms={terms} />
                  </Link>
                  {c.context && (
                    <p className="text-sm text-muted-foreground">
                      <Hl text={c.context} terms={terms} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Page>
  );
}

/* ---------- search ---------- */

type Hit = { sec: SectionDoc; count: number; snippets: string[]; inTitle: boolean };
type Result = { doc: SessionDoc; hits: Hit[]; keyPoints: string[] };

function tokenize(q: string) {
  return q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** Matches a term at the start of a word: "tail" finds "tail", "tails", not "retailers". */
function termRe(terms: string[], flags = "giu") {
  return new RegExp(`(?<![\\p{L}\\p{N}])(${terms.map(escapeRe).join("|")})`, flags);
}

function matchesAll(text: string, terms: string[]) {
  return terms.every((term) => termRe([term], "iu").test(text));
}

function countAll(text: string, terms: string[]) {
  return [...text.matchAll(termRe(terms))].length;
}

function runSearch(docs: SessionDoc[], terms: string[]): Result[] {
  const out: Result[] = [];
  for (const doc of docs) {
    const hits: Hit[] = [];
    for (const sec of doc.sections) {
      const hay = `${sec.title} ${sec.text}`;
      if (!matchesAll(hay, terms)) continue;
      hits.push({
        sec,
        count: countAll(sec.text, terms),
        snippets: makeSnippets(sec.text, terms),
        inTitle: terms.some((t) => termRe([t], "iu").test(sec.title)),
      });
    }
    const keyPoints = (doc.s.keyPoints ?? []).filter((k) => matchesAll(k, terms));
    const metaHit = matchesAll(`${doc.s.title} ${doc.s.summary} ${(doc.s.tags ?? []).join(" ")}`, terms);
    if (hits.length || keyPoints.length || metaHit) out.push({ doc, hits, keyPoints });
  }
  return out;
}

/** Up to 3 short windows of text around the matches. */
function makeSnippets(text: string, terms: string[], max = 3) {
  const positions = [...text.matchAll(termRe(terms))].map((m) => m.index!);
  const out: string[] = [];
  let lastEnd = -1;
  for (const p of positions) {
    if (p < lastEnd) continue;
    let start = Math.max(0, p - 90);
    let end = Math.min(text.length, p + 140);
    // snap to word boundaries
    if (start > 0) start = text.indexOf(" ", start) + 1 || start;
    const sp = text.lastIndexOf(" ", end);
    if (end < text.length && sp > p) end = sp;
    out.push(`${start > 0 ? "… " : ""}${text.slice(start, end).trim()}${end < text.length ? " …" : ""}`);
    lastEnd = end;
    if (out.length >= max) break;
  }
  return out;
}

/* ---------- DOM helpers ---------- */

function toText(el: HTMLElement) {
  const c = el.cloneNode(true) as HTMLElement;
  c.querySelectorAll("svg, button, script, style, [data-noindex]").forEach((e) => e.remove());
  // keep word breaks between blocks
  c.querySelectorAll("p, li, h3, dt, dd, td, th, figcaption, div").forEach((e) => e.append(" "));
  return (c.textContent ?? "").replace(/\s+/g, " ").trim();
}

function cleanHtml(el: HTMLElement) {
  const c = el.cloneNode(true) as HTMLElement;
  c.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id"));
  c.querySelectorAll("button").forEach((e) => e.setAttribute("tabindex", "-1"));
  return c.innerHTML;
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Text with every term wrapped in <mark>. */
function Hl({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const parts = text.split(termRe(terms));
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-gold/35 px-0.5 text-foreground">
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** The section's full HTML with the terms highlighted in its text. */
function FullSection({ html, terms }: { html: string; terms: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !terms.length) return;
    const re = termRe(terms);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest("svg, mark") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      const text = node.data;
      re.lastIndex = 0;
      if (!re.test(text)) continue;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0;
      for (const m of text.matchAll(re)) {
        frag.append(text.slice(last, m.index));
        const mark = document.createElement("mark");
        mark.className = "rounded bg-gold/40 px-0.5 text-foreground";
        mark.textContent = m[0];
        frag.append(mark);
        last = m.index! + m[0].length;
      }
      frag.append(text.slice(last));
      node.replaceWith(frag);
    }
  }, [html, terms]);
  return <div ref={ref} className="note-prose pointer-events-none select-text" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------- results ---------- */

function SessionHeader({ m, s, right }: { m: Mentorship; s: Session; right?: ReactNode }) {
  const color = mentorColor(m);
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4" style={{ background: `color-mix(in srgb, ${color} 8%, white)` }}>
      <span className="rounded-lg px-2.5 py-1 font-display text-sm font-bold text-white" style={{ backgroundColor: color }}>
        {sessionLabel(s)}
      </span>
      <div className="min-w-0 flex-1">
        <Link
          to="/mentorships/$mentorship/$session"
          params={{ mentorship: m.slug, session: s.slug }}
          className="block truncate font-display text-lg font-semibold hover:underline"
        >
          {s.title}
        </Link>
        <p className="text-xs text-muted-foreground">
          {m.name} · {sessionWhen(s)}
          {s.kind === "recorded" && s.date ? " · Recorded" : ""}
        </p>
      </div>
      {right}
    </div>
  );
}

function SessionResult({ r, terms }: { r: Result; terms: string[] }) {
  const { m, s } = r.doc;
  const n = r.hits.length + r.keyPoints.length;
  return (
    <section className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
      <SessionHeader
        m={m}
        s={s}
        right={
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {n === 0 ? "title / summary" : `${r.hits.length} ${r.hits.length === 1 ? "topic" : "topics"}${r.keyPoints.length ? ` · ${r.keyPoints.length} key point${r.keyPoints.length === 1 ? "" : "s"}` : ""}`}
          </span>
        }
      />
      <div className="divide-y divide-border">
        {r.hits.map((h) => (
          <TopicHit key={h.sec.title} m={m} s={s} h={h} terms={terms} />
        ))}
        {r.keyPoints.length > 0 && (
          <div className="px-5 py-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Star className="h-3.5 w-3.5" /> Key points
            </p>
            <ul className="mt-2 space-y-1.5">
              {r.keyPoints.map((k) => (
                <li key={k} className="rounded-lg border-l-[3px] border-accent bg-secondary/60 py-1.5 pl-3 pr-2 text-[15px]">
                  <Hl text={k} terms={terms} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function TopicHit({ m, s, h, terms }: { m: Mentorship; s: Session; h: Hit; terms: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <CornerDownRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic</span>
        <span className="font-display text-base font-semibold">
          <Hl text={h.sec.title} terms={terms} />
        </span>
        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          {h.count} {h.count === 1 ? "match" : "matches"}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-secondary"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          {open ? "Hide full section" : "Show full section"}
        </button>
        <Link
          to="/mentorships/$mentorship/$session"
          params={{ mentorship: m.slug, session: s.slug }}
          hash={h.sec.id || undefined}
          className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Open in session
        </Link>
      </div>

      {!open && h.snippets.length > 0 && (
        <div className="mt-2 space-y-1.5 pl-6">
          {h.snippets.map((sn, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
              <Hl text={sn} terms={terms} />
            </p>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-3 rounded-2xl border border-border bg-background/60 p-4 md:p-5">
          <FullSection key={terms.join(" ")} html={h.sec.html} terms={terms} />
        </div>
      )}
    </div>
  );
}

/** With no query: every session and its topics, as a browsable index. */
function Browse({ docs }: { docs: SessionDoc[] }) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Type to search, or browse all topics below.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {docs.map(({ m, s, sections }) => (
          <section key={`${m.slug}/${s.slug}`} className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
            <SessionHeader m={m} s={s} />
            <ul className="flex flex-wrap gap-1.5 p-4">
              {sections
                .filter((x) => x.id)
                .map((x) => (
                  <li key={x.id}>
                    <Link
                      to="/mentorships/$mentorship/$session"
                      params={{ mentorship: m.slug, session: s.slug }}
                      hash={x.id}
                      className={cn("inline-block rounded-full border border-border px-3 py-1 text-sm hover:border-accent hover:text-accent")}
                    >
                      {x.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
