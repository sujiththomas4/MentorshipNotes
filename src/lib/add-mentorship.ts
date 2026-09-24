import { createServerFn } from "@tanstack/react-start";

export type NewMentorship = { name: string; mentor: string; about: string; color: number; started: string };

export function mentorshipSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Writes src/content/mentorships/<slug>/mentorship.ts (and an empty sessions folder).
 * Runs on the local dev server; the new folder is picked up like any hand-made one.
 */
export const addMentorship = createServerFn({ method: "POST" })
  .inputValidator((d: NewMentorship) => {
    const name = String(d.name ?? "").trim();
    if (!name || !mentorshipSlug(name)) throw new Error("Give the mentorship a name.");
    return {
      name,
      mentor: String(d.mentor ?? "").trim(),
      about: String(d.about ?? "").trim(),
      color: Number.isInteger(d.color) ? d.color : 0,
      started: /^\d{4}-\d{2}-\d{2}$/.test(d.started) ? d.started : "",
    };
  })
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const slug = mentorshipSlug(data.name);
    const dir = path.join(process.cwd(), "src", "content", "mentorships", slug);
    const exists = await fs.stat(dir).then(
      () => true,
      () => false,
    );
    if (exists) throw new Error(`A mentorship called "${data.name}" already exists.`);

    const q = (s: string) => JSON.stringify(s);
    const lines = [
      `import type { MentorshipMeta } from "@/content";`,
      ``,
      `export const mentorship: MentorshipMeta = {`,
      `  name: ${q(data.name)},`,
      `  mentor: ${q(data.mentor)},`,
      ...(data.about ? [`  about: ${q(data.about)},`] : []),
      `  color: ${data.color},`,
      ...(data.started ? [`  started: ${q(data.started)},`] : []),
      `};`,
    ];

    await fs.mkdir(path.join(dir, "sessions"), { recursive: true });
    await fs.writeFile(path.join(dir, "mentorship.ts"), lines.join("\n") + "\n", "utf8");
    return { slug };
  });
