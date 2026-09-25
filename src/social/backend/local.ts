import { fromPortable, toPortable } from "./assets";
import { addLibraryImage, removeLibraryImage } from "./local-library-server";
import { loadPlannerFile, savePlannerFile } from "./local-planner-server";
import { getSavedPost, listSavedPosts, removeSavedPost, writeSavedPost } from "./local-posts-server";
import type { LibraryItem, SavedPost, SavedPostMeta, SocialBackend } from "./types";

/*
 * Local backend: files in this project, read and written through the dev server's functions.
 * Works while `npm run dev` runs on this computer.
 */

const ASSET_URL = "/social/posts/assets/";
const LIBRARY_MANIFEST = "/social/instagram/bethlehem-valley/library/library.json";

export const localBackend: SocialBackend = {
  label: "this computer (project folder)",

  async loadPlanner() {
    return (await loadPlannerFile()).json;
  },
  async savePlanner(json) {
    await savePlannerFile({ data: { json } });
  },

  async listPosts() {
    return JSON.parse((await listSavedPosts()).json) as SavedPostMeta[];
  },
  async getPost(key) {
    const { json } = await getSavedPost({ data: { key } });
    if (!json) return null;
    const post = JSON.parse(json) as SavedPost;
    return { ...post, data: await fromPortable(post.data, (name) => ASSET_URL + name) };
  },
  async savePost(post, preview) {
    const { data, files } = await toPortable(post.data, ASSET_URL);
    const { json } = await writeSavedPost({
      data: { key: post.key, templateId: post.templateId, date: post.date, time: post.time, dataJson: JSON.stringify(data), assets: files, preview: preview ?? null },
    });
    return JSON.parse(json) as SavedPostMeta;
  },
  async deletePost(key) {
    await removeSavedPost({ data: { key } });
  },

  async listLibrary() {
    const r = await fetch(LIBRARY_MANIFEST, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j.items) ? (j.items as LibraryItem[]) : [];
  },
  async addLibraryImage(label, dataUrl) {
    return addLibraryImage({ data: { label, dataUrl } });
  },
  async removeLibraryImage(id) {
    await removeLibraryImage({ data: { id } });
  },
};
