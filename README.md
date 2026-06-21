# Gamejet — Browser Game Portal

A production-ready portal for **700+ browser games**: a fast, searchable, filterable
catalog with a clean branded play shell. Built from an exported "Vault" of game files.

- **Catalog-driven** — every game is data. A build script discovers the games, cleans
  them, and emits a single `games.json`. The whole app reads only that file.
- **Next.js (App Router) + TypeScript (strict)** — deploys to Vercel with zero config.
- **Tailwind design tokens**, light/dark themes (no FOUC), Framer Motion, fuzzy search,
  a window-virtualized 700-card grid, favorites + recently-played (localStorage).

---

## Quick start

```bash
npm install
npm run dev      # runs the catalog generator, then starts Next.js on http://localhost:3000
```

`npm run dev` and `npm run build` both run `scripts/build-catalog.ts` first (via the
`predev` / `prebuild` hooks), so the catalog and `public/games/` are always fresh.

### Scripts

| Command            | What it does                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `npm run catalog`  | Scan the vault, clean game HTML, copy assets, emit `games.json`.     |
| `npm run dev`      | `catalog` → Next dev server.                                          |
| `npm run build`    | `catalog` → `next build` (static-generates every game page).          |
| `npm start`        | Serve the production build.                                           |
| `npm run lint`     | ESLint.                                                               |
| `npm run format`   | Prettier write.                                                       |

---

## How the catalog works

The `game-source/` folder holds the raw vault export:

- **Wrapper files** (`amongus.html`) — contain `<iframe id="gameFrame" src="…">`. One per game.
- **Raw game files** (`Among Us.html`) — the actual loader (HTML5, Ruffle/Flash, Unity, …).
  Most pull assets from third-party CDNs (jsDelivr); those are left as-is.
- **Thumbnails** (`amongus.png`) — named by slug.
- Every file contains a **CKV shutdown overlay** that must be stripped.

`scripts/build-catalog.ts`:

1. Classifies HTML into wrappers vs raw files; reads each wrapper's title + iframe `src`.
2. Resolves the raw file (exact name → slug match → edit-distance for spelling variants).
3. **Strips the `CKV-SHUTDOWN:START…END` block** (which also removes the `shutdown.css`
   link and the `ckv-locked` script) from every copied file.
4. Copies cleaned game HTML (slug-named) + thumbnails + support assets into `public/games/`.
5. Infers `category` / `tags` from the title and engine; matches thumbnails by slug.
6. Prunes stale output, then writes `src/data/games.json` and prints a report.

`public/games/` and `src/data/games.json` are **generated** (git-ignored) — regenerated on
every `dev`/`build`. The raw vault files in `game-source/` are the source of truth.

---

## Deploying to Vercel

1. Push this repository (including the raw game files) to GitHub/GitLab.
2. Import it in Vercel. Framework preset: **Next.js** (auto-detected). No config needed.
3. Vercel runs `npm run build`, which runs the catalog generator (`prebuild`) and then
   `next build`. The generated `public/games/` is served as static assets.
4. (Optional) set `NEXT_PUBLIC_SITE_URL` to your production URL so `sitemap.xml`,
   `robots.txt`, and Open Graph use absolute URLs.

> **CSP note:** games run third-party code (jsDelivr scripts, Ruffle, Unity/Construct,
> embedded SWFs). The app ships a deliberately permissive Content-Security-Policy so game
> iframes work. See [`DECISIONS.md`](./DECISIONS.md).

---

## Project structure

```
game-source/               # raw vault export (game HTML, thumbnails, support assets)
scripts/build-catalog.ts   # the generator (single source of truth)
src/
  app/                     # routes: /, /games, /game/[slug], /favorites, /styleguide, 404
  components/              # GameCard, SearchBar, GamePlayer, Navbar, ui/* primitives …
  lib/                     # cn(), games loader, search, hooks, placeholder
  store/                   # zustand: theme, favorites, recents
  data/games.json          # generated catalog
public/games/              # generated cleaned game HTML + thumbnails + assets
tailwind.config.ts         # design tokens
```

## Tech

Next.js 15 · React 19 · TypeScript (strict) · Tailwind CSS · Framer Motion ·
lucide-react · Zustand · Fuse.js · @tanstack/react-virtual.
