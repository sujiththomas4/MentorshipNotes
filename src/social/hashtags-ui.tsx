import { useEffect, useState } from "react";
import { Check, ChevronDown, Copy, Hash, Plus, RotateCcw, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HASHTAGS, HASHTAG_LIMIT, normalizeTag, type HashtagSet } from "@/social/hashtags";

/*
 * Hashtags card above a template's editor: pick tags (the recommended ones start selected),
 * add your own, copy them for the Instagram caption. Choices are kept per template in this browser.
 */

type Saved = { selected: string[]; custom: string[] };

const key = (id: string) => `social:hashtags:${id}`;

function load(id: string, set: HashtagSet): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(key(id)) || "null") as Saved | null;
    if (raw && Array.isArray(raw.selected) && Array.isArray(raw.custom)) return raw;
  } catch {
    /* ignore */
  }
  return { selected: set.picks, custom: [] };
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers / no permission: copy through a hidden textarea
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function HashtagPanel({ templateId }: { templateId: string }) {
  const set = HASHTAGS[templateId];
  const [state, setState] = useState<Saved>({ selected: set?.picks ?? [], custom: [] });
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!set) return;
    setState(load(templateId, set));
    setReady(true);
  }, [templateId, set]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key(templateId), JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, ready, templateId]);

  if (!set) return null;
  const { selected, custom } = state;
  const over = selected.length > HASHTAG_LIMIT;
  const toggle = (t: string) =>
    setState((s) => ({ ...s, selected: s.selected.includes(t) ? s.selected.filter((x) => x !== t) : [...s.selected, t] }));
  function addCustom() {
    // "#a #b" or "a, b" = several tags; "Bethlehem Valley" = one tag (#bethlehemvalley)
    const tags = draft.split(/[,#]+/).map(normalizeTag).filter(Boolean);
    if (!tags.length) return;
    setState((s) => ({
      custom: [...new Set([...s.custom, ...tags])],
      selected: [...new Set([...s.selected, ...tags])],
    }));
    setDraft("");
  }
  async function copy() {
    if (!selected.length) return;
    if (await copyText(selected.join(" "))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const chip = (t: string, removable = false) => {
    const on = selected.includes(t);
    return (
      <span key={t} className="inline-flex">
        <button
          type="button"
          onClick={() => toggle(t)}
          aria-pressed={on}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs transition-colors",
            removable && "rounded-r-none border-r-0",
            on ? "border-emerald-600 bg-emerald-600 text-white" : "border-border bg-card text-foreground hover:border-emerald-600/60",
          )}
        >
          {on && <Check className="h-3 w-3" />}
          {t}
        </button>
        {removable && (
          <button
            type="button"
            aria-label={`Remove ${t}`}
            onClick={() => setState((s) => ({ custom: s.custom.filter((x) => x !== t), selected: s.selected.filter((x) => x !== t) }))}
            className={cn("rounded-r-full border px-1.5", on ? "border-emerald-600 bg-emerald-600 text-white" : "border-border bg-card text-muted-foreground hover:text-foreground")}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
  };

  return (
    <section className="card-elevated rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
          <Hash className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-tight">Hashtags</p>
          <p className="text-sm text-muted-foreground">
            Tap to pick, then copy into the caption. Instagram allows up to {HASHTAG_LIMIT} per post.
          </p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", over ? "bg-amber-100 text-amber-900" : "bg-secondary text-muted-foreground")}>
          {selected.length} / {HASHTAG_LIMIT} selected
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={!selected.length}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
          {open ? "Hide" : "More tags"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {/* selected, in copy order */}
      <div className="mt-4 flex min-h-8 flex-wrap items-center gap-1.5 rounded-xl bg-secondary/60 p-2.5">
        {selected.length ? selected.map((t) => chip(t)) : <span className="px-1 text-sm text-muted-foreground">Nothing selected. Open More tags to pick some.</span>}
      </div>
      {over && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-800">
          <TriangleAlert className="h-4 w-4 shrink-0" /> More than {HASHTAG_LIMIT} selected: Instagram may reject or ignore the extra tags. Untick a few before copying.
        </p>
      )}

      {open && (
        <div className="mt-5 space-y-4">
          {set.groups.map((g) => (
            <div key={g.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
                {g.note && <span className="ml-2 font-normal normal-case tracking-normal">{g.note}</span>}
              </p>
              <div className="flex flex-wrap gap-1.5">{g.tags.map((t) => chip(t))}</div>
            </div>
          ))}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your own <span className="ml-2 font-normal normal-case tracking-normal">e.g. your account's tag or a place</span>
            </p>
            {custom.length > 0 && <div className="mb-2 flex flex-wrap gap-1.5">{custom.map((t) => chip(t, true))}</div>}
            <form
              className="flex max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addCustom();
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="#bethlehemvalley  (several: #one #two)"
                aria-label="Add your own hashtag"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
              <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>
          </div>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, selected: set.picks }))}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Back to the recommended {set.picks.length}
          </button>
        </div>
      )}
    </section>
  );
}
