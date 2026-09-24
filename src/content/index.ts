import type { ComponentType } from "react";
import { prettyDate, shortDate, weekday } from "@/lib/dates";

/*
 * Content lives in files:
 *   mentorships/<mentorship>/mentorship.ts          export const mentorship: MentorshipMeta
 *   mentorships/<mentorship>/sessions/<session>.tsx  export const meta: SessionMeta + default body
 * Folder and file names become the URLs: /mentorships/<mentorship>/<session>.
 */

export type MentorshipMeta = {
  name: string;
  mentor: string;
  about?: string;
  /** index into MENTOR_COLORS */
  color: number;
  /** yyyy-mm-dd */
  started?: string;
};

export type SessionMeta = {
  /** Session 1, 2, 3 … */
  number: number;
  title: string;
  /** yyyy-mm-dd; leave out for recorded reference sessions without a class date */
  date?: string;
  /** live class (default) or a recorded reference video */
  kind?: "live" | "recorded";
  /** draft = notes still being filled in */
  status?: "draft" | "complete";
  /** optional topic group within the mentorship */
  module?: string;
  summary: string;
  tags?: string[];
  /** shown at the end of the page and collected on the Key points page */
  keyPoints?: string[];
  /** link to the class recording, to watch it again */
  recording?: {
    url: string;
    passcode?: string;
    /** yyyy-mm-dd the recording is from */
    date?: string;
    note?: string;
  };
};

/** An open question to check later or ask the mentor. Lives in mentorships/<m>/to-check.ts. */
export type CheckItem = {
  question: string;
  /** what prompted it, or what is known so far */
  context?: string;
  /** session file name (without .tsx) it came from */
  session?: string;
  /** yyyy-mm-dd */
  added: string;
  status: "open" | "answered";
  answer?: string;
};

export type Session = SessionMeta & { slug: string; mentorshipSlug: string; Content: ComponentType };
export type Mentorship = MentorshipMeta & { slug: string; sessions: Session[]; toCheck: CheckItem[] };

export const MENTOR_COLORS = [
  "oklch(0.54 0.09 244)", // azure
  "oklch(0.55 0.11 160)", // green
  "oklch(0.64 0.13 70)", // amber
  "oklch(0.57 0.17 25)", // red
  "oklch(0.52 0.13 300)", // violet
  "oklch(0.56 0.08 200)", // teal
];

export const mentorColor = (m: { color: number }) => MENTOR_COLORS[((m.color % 6) + 6) % 6];

const mentorshipModules = import.meta.glob<{ mentorship: MentorshipMeta }>("./mentorships/*/mentorship.ts", {
  eager: true,
});
const sessionModules = import.meta.glob<{ meta: SessionMeta; default: ComponentType }>(
  "./mentorships/*/sessions/*.tsx",
  { eager: true },
);

const checkModules = import.meta.glob<{ toCheck: CheckItem[] }>("./mentorships/*/to-check.ts", { eager: true });

const allSessions: Session[] = Object.entries(sessionModules).map(([path, mod]) => {
  const [, mentorshipSlug, slug] = path.match(/mentorships\/([^/]+)\/sessions\/([^/]+)\.tsx$/)!;
  return { ...mod.meta, slug, mentorshipSlug, Content: mod.default };
});

export const mentorships: Mentorship[] = Object.entries(mentorshipModules)
  .map(([path, mod]) => {
    const slug = path.match(/mentorships\/([^/]+)\/mentorship\.ts$/)![1];
    const sessions = allSessions
      .filter((s) => s.mentorshipSlug === slug)
      .sort((a, b) => a.number - b.number || (a.date ?? "").localeCompare(b.date ?? ""));
    const toCheck = Object.entries(checkModules).find(([p]) => p.includes(`/${slug}/`))?.[1].toCheck ?? [];
    return { ...mod.mentorship, slug, sessions, toCheck };
  })
  .sort((a, b) => (a.started ?? "").localeCompare(b.started ?? "") || a.name.localeCompare(b.name));

export function getMentorship(slug: string) {
  return mentorships.find((m) => m.slug === slug);
}

export function getSession(mentorshipSlug: string, slug: string) {
  return getMentorship(mentorshipSlug)?.sessions.find((s) => s.slug === slug);
}

/** previous / next session in the same mentorship */
export function neighbours(s: Session) {
  const list = getMentorship(s.mentorshipSlug)?.sessions ?? [];
  const i = list.findIndex((x) => x.slug === s.slug);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 ? list[i + 1] : undefined };
}

export const sessionLabel = (s: { number: number }) => `Session ${s.number}`;

export const keyPointCount = (m: Mentorship) => m.sessions.reduce((n, s) => n + (s.keyPoints?.length ?? 0), 0);

/** newest dated session, else the highest-numbered one */
export const latestSession = (m: Mentorship) =>
  [...m.sessions].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.number - a.number)[0];

/** long: "Wednesday, 9 Sep 2026" · short: "09 Sep"; recorded sessions without a date say so instead */
export function sessionWhen(s: Pick<SessionMeta, "date" | "kind">, style: "long" | "short" = "long") {
  if (s.date) return style === "long" ? `${weekday(s.date)}, ${prettyDate(s.date)}` : shortDate(s.date);
  if (s.kind === "recorded") return style === "long" ? "Recorded session" : "Rec";
  return style === "long" ? "Date not set" : "—";
}

export function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}
