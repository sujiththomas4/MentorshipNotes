import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, LoadingBlock, Page, PageHeader, SectionHeader } from "@/components/page";
import { FrameEditor } from "@/components/desk/frame-editor";
import { LiveNotes } from "@/components/desk/live-notes";
import { DayLog } from "@/components/desk/day-log";
import { Playbook } from "@/components/desk/playbook";
import { prettyDate, todayIso, weekday } from "@/lib/dates";
import { useTradingDay, useTradingDays } from "@/lib/queries";
import { errorMessage, plural } from "@/lib/utils";

export const Route = createFileRoute("/_app/desk")({
  component: DeskPage,
});

const SECTIONS = [
  ["frame", "Frame"],
  ["live", "Live"],
  ["log", "Day log"],
  ["playbook", "Playbook"],
] as const;

function DeskPage() {
  const [date, setDate] = useState(todayIso);
  // bumped after "Clear this day" so the editor starts empty
  const [resetKey, setResetKey] = useState(0);
  const dayQ = useTradingDay(date);
  const daysQ = useTradingDays();
  const days = daysQ.data ?? [];

  function openDate(d: string) {
    setDate(d);
    document.getElementById("frame")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Market Profile · Order Flow · Trading Desk"
        title="Trading Desk"
        description="Previous day's value area sets the frame. The open tells you where you are against it, the first 40 minutes tell you whether it holds, and the next 30 confirm or reject."
        actions={
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <b className="text-foreground">{days.length}</b> {days.length === 1 ? "day" : "days"} logged
          </span>
        }
      />

      <nav className="sticky top-16 z-[5] -mx-4 mt-4 flex gap-2 overflow-x-auto bg-background/85 px-4 py-2 backdrop-blur md:-mx-6 md:px-6">
        {SECTIONS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {label}
          </button>
        ))}
      </nav>

      <section id="frame" className="scroll-mt-32 pt-6">
        <SectionHeader title="Session frame" note={`${weekday(date)}, ${prettyDate(date)}`} />
        {dayQ.isLoading ? (
          <LoadingBlock />
        ) : dayQ.error ? (
          <EmptyState>
            Couldn't load this day: {errorMessage(dayQ.error)}. If the table is missing, run the SQL migration.
          </EmptyState>
        ) : (
          <FrameEditor
            key={`${date}:${resetKey}`}
            date={date}
            initial={dayQ.data ?? null}
            onDateChange={setDate}
            onCleared={() => setResetKey((k) => k + 1)}
          />
        )}
      </section>

      <section id="live" className="scroll-mt-32 pt-10">
        <SectionHeader title="Live trading notes" note={prettyDate(date)} />
        <LiveNotes date={date} />
      </section>

      <section id="log" className="scroll-mt-32 pt-10">
        <SectionHeader title="Day log" note={days.length ? `${plural(days.length, "day")} · newest first` : "samples"} />
        {daysQ.isLoading ? <LoadingBlock /> : <DayLog days={days} activeDate={date} onOpen={openDate} />}
      </section>

      <section id="playbook" className="scroll-mt-32 pt-10">
        <SectionHeader title="Playbook" note="reference · expand as the mentorship goes on" />
        <Playbook />
      </section>
    </Page>
  );
}
