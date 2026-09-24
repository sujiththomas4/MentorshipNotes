# Mentor Notes (React)

Static, local notes for trading mentorships (starting with Dr. Sherlymon Abraham's Market Profile):
each mentorship has its sessions in order (Session 1, 2, 3 …) with dates, charts, screenshots and
key points. No database or login; everything lives in this folder.

Stack: React 19, TanStack Start + Router (file routes), Tailwind CSS 4, Radix, lucide icons.

## Run

```
npm install
npm run dev
```

Open http://localhost:8080.

## Screens

| Route | Screen |
|---|---|
| `/` | Mentorship cards, **New mentorship**, recent sessions |
| `/mentorships/<m>` | One mentorship: its sessions in order with dates |
| `/mentorships/<m>/<session>` | One session page |
| `/search` | Full-text search (Ctrl+K): results by session → topic, with the full section on demand |
| `/mentorships/<m>/to-check` | To be checked: open questions and topics to study (from `to-check.ts`) |
| `/key-points` | Every key point, filterable by mentorship, searchable |
| `/note-kit` | Reference: every building block with example data |

## Content

```
src/content/mentorships/<mentorship>/mentorship.ts          name, mentor, about, colour, started
src/content/mentorships/<mentorship>/sessions/<session>.tsx  one file per session
public/screenshots/<mentorship>/<session>/                  images for that session
```

- **New mentorship** (home page or the + in the sidebar) writes the `mentorship.ts` file for you
  through a server function. This only works while `npm run dev` is running locally.
- A session file exports `meta: SessionMeta` (number, title, optional date, kind `live` /
  `recorded`, status `draft` / `complete`, module, summary, tags, keyPoints) and a default
  component with the body. Folder and file names become the URL.

## Building blocks (`@/components/notes`)

| Component | Use |
|---|---|
| `Section` | Top-level heading; builds the "On this page" list |
| `Callout` | `note`, `tip`, `rule`, `warning`, `risk`, `definition` boxes |
| `MentorQuote`, `Hl` | A quote from the mentor; inline highlight (optionally bull/bear) |
| `ProfileChart` | TPO letter profile; works out POC, 70% value area, IB and single prints |
| `MiniProfile`, `ShapeGallery` | Small profile-shape sketches (normal, p, b, trend, double, custom) |
| `LevelMap` | Price ladder: levels, zones and markers (e.g. open vs. yesterday's value) |
| `Scenarios` | "If … → …" cards, coloured bull/bear/neutral |
| `Compare`, `Terms`, `Steps`, `Flow` | Tables, glossary, numbered steps, arrow chains |
| `Columns`, `Panel` | Side-by-side boxes |
| `IconGrid`, `StatStrip`, `IconBubble` | Icon cards and big-number tiles |
| `Glossary` | Term cards with icon, abbreviation, definition and example |
| `Checklist` | Tick list with a progress bar |
| `Pending` | "To be added" placeholder for notes or screenshots still to come |
| `Figure`, `AnnotatedFigure` | Screenshots (click to enlarge); numbered markers on a screenshot |

## Layout

```
src/
  content/                 index.ts (registry), note-kit.tsx, mentorships/
  components/notes/        the building blocks above
  components/              app-shell, app-sidebar, add-mentorship-dialog, mentor-avatar, toc, page, ui/
  lib/add-mentorship.ts    server function behind New mentorship
  routes/                  /, /mentorships/$mentorship, /mentorships/$mentorship/$session, /key-points, /note-kit
archive/supabase/          the earlier Supabase version (login, editable notes, trading desk, SQL);
                           not built, kept for later
```
