import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { KeyNote, Mentor, MentorshipNote } from "@/lib/mentorship";
import type { LiveEntry, TradingDay } from "@/lib/market-profile";

export const qk = {
  mentors: ["mentors"] as const,
  notes: ["notes"] as const,
  note: (id: string) => ["note", id] as const,
  keyNotes: ["key-notes"] as const,
  tradingDays: ["trading-days"] as const,
  tradingDay: (day: string) => ["trading-day", day] as const,
  live: (day: string) => ["live", day] as const,
};

export function useMentors() {
  return useQuery<Mentor[]>({
    queryKey: qk.mentors,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Mentor[];
    },
  });
}

export function useNotes() {
  return useQuery<MentorshipNote[]>({
    queryKey: qk.notes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentorship_notes")
        .select("*")
        .order("session_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MentorshipNote[];
    },
  });
}

export function useNote(id: string) {
  return useQuery<MentorshipNote | null>({
    queryKey: qk.note(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentorship_notes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as MentorshipNote | null;
    },
  });
}

export function useKeyNotes() {
  return useQuery<KeyNote[]>({
    queryKey: qk.keyNotes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("key_notes")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as KeyNote[];
    },
  });
}

export function useTradingDays() {
  return useQuery<TradingDay[]>({
    queryKey: qk.tradingDays,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trading_days")
        .select("*")
        .order("day", { ascending: false })
        .limit(400);
      if (error) throw error;
      return (data ?? []) as TradingDay[];
    },
  });
}

export function useTradingDay(day: string) {
  return useQuery<TradingDay | null>({
    queryKey: qk.tradingDay(day),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trading_days")
        .select("*")
        .eq("day", day)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as TradingDay | null;
    },
    // the editor keeps its own copy once open; don't refetch under it
    staleTime: Infinity,
  });
}

export function useLiveEntries(day: string) {
  return useQuery<LiveEntry[]>({
    queryKey: qk.live(day),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_entries")
        .select("*")
        .eq("day", day)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LiveEntry[];
    },
  });
}
