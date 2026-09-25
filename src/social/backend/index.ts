import { localBackend } from "./local";
import type { SocialBackend } from "./types";

/**
 * The one place that decides where Social Media data is stored.
 * To move to Supabase: add supabase.ts implementing SocialBackend and switch this line
 * (see README.md in this folder).
 */
export const backend: SocialBackend = localBackend;

export type { LibraryItem, SavedPost, SavedPostMeta, SocialBackend } from "./types";
