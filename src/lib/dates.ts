import { format, parseISO, isValid } from "date-fns";

export const todayIso = () => format(new Date(), "yyyy-MM-dd");

function safe(iso: string | null | undefined) {
  if (!iso) return null;
  const d = parseISO(iso);
  return isValid(d) ? d : null;
}

/** 23 Sep 2026 */
export function prettyDate(iso: string | null | undefined) {
  const d = safe(iso);
  return d ? format(d, "d MMM yyyy") : (iso ?? "");
}

/** 23 Sep */
export function shortDate(iso: string | null | undefined) {
  const d = safe(iso);
  return d ? format(d, "dd MMM") : (iso ?? "");
}

/** Wednesday */
export function weekday(iso: string | null | undefined) {
  const d = safe(iso);
  return d ? format(d, "EEEE") : "";
}

export const nowTime = () => format(new Date(), "HH:mm");
