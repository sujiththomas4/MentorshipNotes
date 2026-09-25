import { createServerFn } from "@tanstack/react-start";

/*
 * The content planner is saved to src/content/social/planner.json by the local dev server,
 * so the plan lives with the project (the browser keeps a copy as a fallback). Used only by local.ts.
 */

async function file() {
  const path = await import("node:path");
  return { path, dir: path.join(process.cwd(), "src", "content", "social"), name: "planner.json" };
}

/** The saved plan as JSON text, or null when none has been saved yet (or the file cannot be read). */
export const loadPlannerFile = createServerFn({ method: "GET" }).handler(async () => {
  const fs = await import("node:fs/promises");
  const { path, dir, name } = await file();
  try {
    const json = await fs.readFile(path.join(dir, name), "utf8");
    JSON.parse(json); // only hand back valid JSON
    return { json: json as string | null };
  } catch {
    return { json: null as string | null };
  }
});

export const savePlannerFile = createServerFn({ method: "POST" })
  .inputValidator((d: { json: string }) => {
    const json = String(d.json ?? "");
    if (json.length > 2_000_000) throw new Error("The plan is too large to save.");
    JSON.parse(json); // must be valid JSON
    return { json };
  })
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const { path, dir, name } = await file();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), data.json + "\n", "utf8");
    return { ok: true };
  });
