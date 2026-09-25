/*
 * The social-media data backend: everything the Social Media section saves.
 * Today: `local` (files in this project, written by the dev server). Later: a Supabase
 * implementation of the same interface (see README.md in this folder). Nothing outside
 * src/social/backend talks to storage directly.
 */

/** A planned post saved ahead of its day (the editor's data for one calendar occurrence). */
export type SavedPostMeta = {
  /** the planner occurrence key: "<slotId>@<yyyy-mm-dd>" or "once:<id>" */
  key: string;
  templateId: string;
  /** yyyy-mm-dd the post is planned for */
  date: string;
  /** "HH:MM" or "" */
  time: string;
  /** ISO timestamp of the last save */
  savedAt: string;
  /** small preview image URL, or null */
  preview: string | null;
};
export type SavedPost = SavedPostMeta & {
  /** the editor's data; photos are portable "asset:<file>" references (see assets.ts) */
  data: unknown;
};

export type LibraryItem = { id: string; label: string; src: string; builtin?: boolean; added?: string };

export interface SocialBackend {
  /** where the data lives, for messages ("this computer" / "the cloud") */
  readonly label: string;

  /* content planner (one JSON document) */
  loadPlanner(): Promise<string | null>;
  savePlanner(json: string): Promise<void>;

  /* saved posts */
  listPosts(): Promise<SavedPostMeta[]>;
  getPost(key: string): Promise<SavedPost | null>;
  /** `data` may contain data: URLs; they are stored as assets. `preview` is a data URL. */
  savePost(post: { key: string; templateId: string; date: string; time: string; data: unknown }, preview?: string | null): Promise<SavedPostMeta>;
  deletePost(key: string): Promise<void>;

  /* Bethlehem Valley image library (header photos) */
  listLibrary(): Promise<LibraryItem[]>;
  addLibraryImage(label: string, dataUrl: string): Promise<LibraryItem>;
  removeLibraryImage(id: string): Promise<void>;
}
