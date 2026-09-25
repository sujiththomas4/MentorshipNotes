# Social Media data backend

Everything the Social Media section saves goes through `backend` (`index.ts`), an object
implementing `SocialBackend` (`types.ts`). Nothing else reads or writes storage directly, so
moving to Supabase means adding one implementation and switching one line.

| Data | Used by | Today (local) |
| --- | --- | --- |
| Content planner (recurring slots, one-off posts, skips / moves, posted ticks) | `planner.ts` | `src/content/social/planner.json` |
| Saved posts (a planned day's post, prepared ahead) | `saved-posts.tsx` | `src/content/social/posts/<date>/<key>.json` |
| Photos inside saved posts | `assets.ts` | `public/social/posts/assets/<sha1>.<ext>` |
| Saved-post previews (360 px WebP) | `saved-posts.tsx` | `public/social/posts/previews/<key>-<stamp>.webp` |
| Bethlehem Valley image library (header photos) | `image-library.tsx` | `public/social/instagram/bethlehem-valley/library/` + `library.json` |

The local backend (`local.ts`) calls the dev server's functions (`local-*-server.ts`), so it
works on this computer while `npm run dev` runs. Browser-only state stays in localStorage:
working drafts (`social:<templateId>`, `social:plan-draft:<key>`), hashtag picks, a copy of the
planner (`social:planner`).

## Data formats

**Planner** (`planner.json`): `{ version: 1, recurringFrom, slots[], oneOffs[], changes[], posted[] }`,
see the types at the top of `src/social/planner.ts`. Occurrence keys (used by saved posts and
`posted`) are `"<slotId>@<yyyy-mm-dd>"` for a recurring slot (the date it originally belongs to,
kept when moved) and `"once:<id>"` for a one-off post. A template's default days use the slot
id `default:<templateId>`.

**Saved post** (one file per planned occurrence):

```json
{
  "schema": 1,
  "key": "mugt…@2026-09-28",
  "templateId": "Instagram_BV_FarmTip",
  "date": "2026-09-28",
  "time": "18:00",
  "savedAt": "2026-09-25T11:02:33.000Z",
  "preview": "/social/posts/previews/mugt…-lx3a.webp",
  "data": { "…": "the editor's data exactly as its Save post (.json) would write it" }
}
```

Photos in `data` are stored as **portable references** `"asset:<sha1>.<ext>"`, never as a
local path: `assets.ts` turns uploaded images into files on save and references back into URLs on
load. The same JSON therefore works with any storage. Other image paths in `data` point at files
shipped with the app (`/branding/…`, `/social/instagram/…` including the image library).

## Moving to Supabase (plan)

1. **Project & auth.** Create a Supabase project; sign-in for one user (email magic link is
   enough). `@supabase/supabase-js` is already a dependency; the earlier Supabase version of the
   app is kept in `archive/supabase/` for reference.
2. **Tables** (all rows owned by the signed-in user, RLS: `owner = auth.uid()`):

   ```sql
   create table social_planner (
     owner uuid primary key default auth.uid(),
     doc jsonb not null,
     updated_at timestamptz default now()
   );
   create table social_posts (
     owner uuid not null default auth.uid(),
     key text not null,
     template_id text not null,
     date date not null,
     time text not null default '',
     data jsonb not null,
     preview_path text,
     saved_at timestamptz default now(),
     primary key (owner, key)
   );
   create table social_library (
     owner uuid not null default auth.uid(),
     id text not null,
     label text not null,
     path text not null,
     added date default current_date,
     primary key (owner, id)
   );
   ```

3. **Storage**: one private bucket `social`, folders `assets/<sha1>.<ext>`,
   `previews/<key>.webp`, `library/<file>`; read through signed URLs (or a public bucket if the
   posts are not private).
4. **`supabase.ts`**: implement `SocialBackend` with the client. `getPost` resolves
   `asset:` references with the bucket URL (`fromPortable(data, name => signedUrl("assets/" + name))`);
   `savePost` runs `toPortable(data, <bucket assets URL prefix>)` and uploads the returned files
   (skip names that already exist). Then set `backend = supabaseBackend` in `index.ts`.
5. **Copy the local data once** (a small Node script run with the service key):
   `planner.json` → `social_planner.doc`; each `src/content/social/posts/*/*.json` →
   `social_posts` row (+ its preview); every file in `public/social/posts/assets/` → `assets/`;
   `library.json` items + files → `social_library` / `library/` (rewrite each item's `src` to
   the bucket path, and the same library paths inside saved posts' `data`).
6. **Hosting**: to open saved posts from a phone the app must also be deployed (the `public/`
   folder, fonts and built-in images ship with it). Server functions `local-*-server.ts` are then
   unused and can be removed.

Nothing in the editors, planner or calendar changes for any of these steps.
