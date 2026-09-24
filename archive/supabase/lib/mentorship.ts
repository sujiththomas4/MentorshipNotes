export type Mentor = {
  id: string;
  name: string;
  /** palette index (0-5) or any CSS colour, depending on how the row was created */
  color: number | string | null;
  mentor?: string | null;
  about?: string | null;
  created_at?: string;
};

export type MentorshipNote = {
  id: string;
  session_date: string;
  mentor_id: string | null;
  title: string;
  summary: string | null;
  key_notes: unknown;
  created_at?: string;
};

export type KeyNote = {
  id: string;
  text: string;
  mentor_id: string | null;
  source_note_id: string | null;
  from_mentor_name: string | null;
  pinned: boolean;
  created_at: string;
};

export const MENTOR_COLORS = [
  "oklch(0.54 0.09 244)", // azure
  "oklch(0.55 0.11 160)", // green
  "oklch(0.64 0.13 70)", // amber
  "oklch(0.57 0.17 25)", // red
  "oklch(0.52 0.13 300)", // violet
  "oklch(0.56 0.08 200)", // teal
];

export function mentorColor(color: Mentor["color"] | undefined) {
  if (color === null || color === undefined || color === "") return MENTOR_COLORS[0];
  const n = Number(color);
  if (Number.isInteger(n)) return MENTOR_COLORS[((n % 6) + 6) % 6];
  return String(color);
}

/** key_notes may arrive as text[], a JSON string, or newline-separated text. */
export function parseKeyNotes(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v ?? "").trim()).filter(Boolean);
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parseKeyNotes(parsed);
    } catch {
      /* not JSON */
    }
    return s.split(/\r?\n/).map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  }
  return [];
}
