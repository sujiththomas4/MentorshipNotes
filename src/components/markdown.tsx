import type { ReactNode } from "react";
import { CircleCheck, Square } from "lucide-react";

/*
 * Small Markdown renderer for the brand documents: headings, paragraphs, bullet and
 * numbered lists, task lists, fenced code, **bold** and `code`. Enough for our own files;
 * not a general-purpose parser.
 */

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    out.push(
      t.startsWith("**") ? (
        <strong key={i++}>{t.slice(2, -2)}</strong>
      ) : (
        <code key={i++} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.85em]">
          {t.slice(1, -1)}
        </code>
      ),
    );
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key++} className="my-4 overflow-x-auto rounded-xl bg-[#071422] p-4 font-mono text-[13px] leading-relaxed text-[#d6e2ec]">
          {code.join("\n")}
        </pre>,
      );
      continue;
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const cls =
        level === 1
          ? "mt-2 font-display text-2xl font-bold"
          : level === 2
            ? "mt-8 border-t border-border pt-5 font-display text-xl font-semibold first:mt-0 first:border-0 first:pt-0"
            : "mt-5 font-display text-lg font-semibold";
      blocks.push(
        <p key={key++} className={cls}>
          {inline(h[2])}
        </p>,
      );
      i++;
      continue;
    }

    if (/^\s*(- |\d+\. )/.test(line)) {
      const items: { text: string; task?: boolean; done?: boolean }[] = [];
      const ordered = /^\s*\d+\. /.test(line);
      while (i < lines.length && /^\s*(- |\d+\. )/.test(lines[i])) {
        const t = lines[i].replace(/^\s*(- |\d+\. )/, "");
        const task = /^\[( |x)\]\s/i.exec(t);
        items.push(task ? { text: t.slice(4), task: true, done: task[1].toLowerCase() === "x" } : { text: t });
        i++;
      }
      const isTask = items.every((x) => x.task);
      blocks.push(
        isTask ? (
          <ul key={key++} className="my-3 grid gap-1.5 sm:grid-cols-2">
            {items.map((it, j) => (
              <li key={j} className="flex items-start gap-2 text-[15px]">
                {it.done ? <CircleCheck className="mt-0.5 h-4 w-4 text-bull" /> : <Square className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                <span>{inline(it.text)}</span>
              </li>
            ))}
          </ul>
        ) : ordered ? (
          <ol key={key++} className="my-3 list-decimal space-y-1 pl-6 text-[15px] marker:text-accent">
            {items.map((it, j) => (
              <li key={j}>{inline(it.text)}</li>
            ))}
          </ol>
        ) : (
          <ul key={key++} className="my-3 list-disc space-y-1 pl-6 text-[15px] marker:text-accent">
            {items.map((it, j) => (
              <li key={j}>{inline(it.text)}</li>
            ))}
          </ul>
        ),
      );
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|```|\s*- |\s*\d+\. )/.test(lines[i])) para.push(lines[i++]);
    blocks.push(
      <p key={key++} className="my-3 text-[15px] leading-relaxed">
        {inline(para.join(" "))}
      </p>,
    );
  }

  return <div>{blocks}</div>;
}
