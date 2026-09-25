import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Check, CircleDashed, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { backend, type SavedPostMeta } from "@/social/backend";
import { svgToPngBlob } from "@/social/export";
import { bvPngBlob } from "@/social/instagram/bethlehem-valley/shared";
import { fmtTime, parseIso, updatePlanner, usePlanner } from "@/social/planner";
import { DAY_LONG } from "@/social/schedule";

/*
 * Posts prepared ahead of their day. The planner links to an editor with
 * ?plan=<occurrence key>&date=<yyyy-mm-dd>&time=<HH:MM>; the editor then works on that
 * post (its own browser draft, loaded from / saved to the backend) and the Save-to-plan bar
 * on the template page saves it with a small preview.
 */

const EVENT = "social-saved-posts-change";
const notify = () => window.dispatchEvent(new Event(EVENT));

/** All saved posts by occurrence key (refreshed after every save / delete). */
export function useSavedPosts() {
  const [map, setMap] = useState<Map<string, SavedPostMeta>>(new Map());
  useEffect(() => {
    const load = () =>
      backend
        .listPosts()
        .then((list) => setMap(new Map(list.map((m) => [m.key, m]))))
        .catch(() => {});
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, []);
  return map;
}

export async function deleteSavedPost(key: string) {
  await backend.deletePost(key);
  notify();
}

export type PlanContext = { key: string; date: string; time: string; templateId: string };

/** The planned post this page is for (from ?plan=…&date=…&time=…), or null. */
export function usePlanContext(): PlanContext | null {
  const loc = useRouterState({ select: (s) => ({ search: s.location.search as Record<string, unknown>, path: s.location.pathname }) });
  const key = typeof loc.search.plan === "string" ? loc.search.plan : "";
  const date = typeof loc.search.date === "string" ? loc.search.date : "";
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const time = typeof loc.search.time === "string" ? loc.search.time : "";
  const templateId = loc.path.replace(/\/$/, "").split("/").pop() ?? "";
  return { key, date, time, templateId };
}

/* ---------- session shared by the editor (data) and the Save-to-plan bar ---------- */

type PlanSession = {
  plan: PlanContext;
  loading: boolean;
  saved: SavedPostMeta | null;
  dirty: boolean;
  save: () => Promise<void>;
};
const Ctx = createContext<{ session: PlanSession | null; setSession: (s: PlanSession | null) => void } | null>(null);

export function PlanSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PlanSession | null>(null);
  return <Ctx.Provider value={{ session, setSession }}>{children}</Ctx.Provider>;
}

function writeDraft(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // large photos may not fit in browser storage: keep the rest (saved posts keep the photos)
    try {
      localStorage.setItem(key, JSON.stringify(data, (_k, v) => (typeof v === "string" && v.startsWith("data:") ? "" : v)));
    } catch {
      /* storage unavailable */
    }
  }
}
const readDraft = (key: string): Record<string, unknown> | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

/**
 * An editor's post data, kept in this browser. Normally the template's usual draft
 * (`storeKey`); opened from the planner, the planned post's own draft, starting from its saved
 * version (or from the usual draft for a new one). Save goes through the backend.
 */
export function usePlannedDraft<T>(storeKey: string, init: () => T, merge: (raw: Record<string, unknown> | null) => T) {
  const plan = usePlanContext();
  const ctx = useContext(Ctx);
  const draftKey = plan ? `social:plan-draft:${plan.key}` : storeKey;
  const [data, setData] = useState<T>(init);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<{ meta: SavedPostMeta | null; json: string | null }>({ meta: null, json: null });
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    let alive = true;
    setReady(false);
    (async () => {
      const local = readDraft(draftKey);
      if (plan) {
        let post = null;
        try {
          post = await backend.getPost(plan.key);
        } catch {
          /* backend unavailable: the browser draft still works */
        }
        if (!alive) return;
        const savedData = post ? merge(post.data as Record<string, unknown>) : null;
        const { data: _d, ...meta } = post ?? { data: null };
        void _d;
        setSaved({ meta: post ? (meta as SavedPostMeta) : null, json: savedData ? JSON.stringify(savedData) : null });
        if (local) setData(merge(local));
        else if (savedData) setData(savedData);
        else {
          // a new planned post starts from the usual draft, dated for its planned day
          const base = merge(readDraft(storeKey)) as T & { date?: unknown };
          if (typeof base.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(base.date)) base.date = plan.date;
          setData(base);
        }
      } else setData(merge(local));
      setReady(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    if (ready) writeDraft(draftKey, data);
  }, [data, ready, draftKey]);

  const dirty = !!plan && ready && JSON.stringify(data) !== saved.json;

  async function save() {
    if (!plan) return;
    const preview = await capturePreview().catch(() => null);
    const meta = await backend.savePost({ key: plan.key, templateId: plan.templateId, date: plan.date, time: plan.time, data: dataRef.current }, preview);
    // reload so uploaded photos become stored files instead of large inline images
    const fresh = await backend.getPost(plan.key);
    const clean = fresh ? merge(fresh.data as Record<string, unknown>) : dataRef.current;
    setData(clean);
    setSaved({ meta, json: JSON.stringify(clean) });
    notify();
  }

  const saveRef = useRef(save);
  saveRef.current = save;
  const setSession = ctx?.setSession;
  useEffect(() => {
    if (!setSession) return;
    setSession(plan ? { plan, loading: !ready, saved: saved.meta, dirty, save: () => saveRef.current() } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSession, plan?.key, plan?.date, plan?.time, ready, saved.meta, dirty]);
  useEffect(() => () => setSession?.(null), [setSession]);

  return { data, setData, ready, plan };
}

/**
 * Small preview (WebP, 360 px wide) of the element marked data-plan-preview: a Bethlehem Valley
 * post (.canvas) or an SVG artwork.
 */
async function capturePreview(): Promise<string | null> {
  const box = document.querySelector<HTMLElement>("[data-plan-preview]");
  if (!box) return null;
  const canvasEl = box.querySelector<HTMLElement>(".canvas");
  const svg = box.querySelector<SVGSVGElement>("svg");
  let blob: Blob;
  if (canvasEl) blob = await bvPngBlob(canvasEl, canvasEl.offsetWidth, canvasEl.offsetHeight);
  else if (svg) {
    const vb = svg.viewBox.baseVal;
    blob = await svgToPngBlob(svg, vb.width || 1080, vb.height || 1350);
  } else return null;
  const bmp = await createImageBitmap(blob);
  const w = 360;
  const h = Math.round((bmp.height / bmp.width) * w);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  return c.toDataURL("image/webp", 0.8);
}

/* ---------- the bar on the template page ---------- */

const niceDate = (iso: string) => {
  const d = parseIso(iso);
  return `${DAY_LONG[d.getDay()]}, ${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`;
};

export function PlanBar({ platform }: { platform: string }) {
  const ctx = useContext(Ctx);
  const planner = usePlanner();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const s = ctx?.session;
  if (!s) return null;
  const posted = planner.posted.includes(s.plan.key);
  const status = s.loading ? "Loading…" : s.saved ? (s.dirty ? "Saved · unsaved changes" : "Saved") : "Not saved yet";
  async function onSave() {
    if (!s) return;
    setBusy(true);
    setMsg("");
    try {
      await s.save();
      setMsg(`Saved to the plan (${backend.label}).`);
    } catch (e) {
      setMsg(`Couldn't save: ${e instanceof Error ? e.message : "error"}. Is the dev server running?`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-violet-300 bg-violet-50 px-5 py-4 text-violet-950">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
        <CalendarClock className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold leading-tight">
          Planned post · {niceDate(s.plan.date)}
          {s.plan.time && ` · ${fmtTime(s.plan.time)}`}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              s.saved && !s.dirty ? "bg-emerald-600 text-white" : s.saved ? "bg-amber-200 text-amber-950" : "bg-white text-violet-800 ring-1 ring-violet-300",
            )}
          >
            {s.saved && !s.dirty ? <Check className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
            {status}
          </span>
          {s.saved && <span className="text-xs text-violet-800/80">last saved {new Date(s.saved.savedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
          {msg && <span className="text-xs">{msg}</span>}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onSave} disabled={busy || s.loading} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-violet-800 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save to plan
        </button>
        <button
          type="button"
          onClick={() => updatePlanner((p) => ({ ...p, posted: posted ? p.posted.filter((k) => k !== s.plan.key) : [...p.posted, s.plan.key] }))}
          className={cn("inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold", posted ? "bg-emerald-600 text-white" : "bg-white text-violet-900 ring-1 ring-violet-300 hover:bg-violet-100")}
        >
          <Check className="h-4 w-4" /> {posted ? "Posted" : "Mark as posted"}
        </button>
        <Link to="/social/$platform/planner" params={{ platform }} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-900 ring-1 ring-violet-300 hover:bg-violet-100">
          <ArrowLeft className="h-4 w-4" /> Planner
        </Link>
      </div>
    </section>
  );
}
