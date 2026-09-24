import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TocAside } from "@/components/toc";
import NoteKit from "@/content/note-kit";
import { MENTOR_COLORS } from "@/content";
import { useToc } from "@/lib/use-toc";

export const Route = createFileRoute("/note-kit")({
  head: () => ({ meta: [{ title: "Note kit · Mentor Notes" }] }),
  component: NoteKitPage,
});

function NoteKitPage() {
  const body = useRef<HTMLDivElement>(null);
  const toc = useToc(body, "note-kit");
  return (
    <div className="w-full px-4 py-8 md:px-8 xl:px-12">
      <header className="hero-surface rounded-3xl px-6 py-8 text-white shadow-xl md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">Reference</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">Note kit</h1>
        <p className="mt-3 max-w-3xl text-white/80 md:text-lg">
          Every building block a session page can use, shown with example data.
        </p>
      </header>
      <div className="mt-8 flex gap-10">
        <article className="min-w-0 flex-1">
          <div ref={body} className="note-prose">
            <NoteKit />
          </div>
        </article>
        <TocAside items={toc} color={MENTOR_COLORS[0]} />
      </div>
    </div>
  );
}
