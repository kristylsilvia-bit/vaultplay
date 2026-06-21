# Master Build Prompt — Rebuild the Game Portal (Vercel, ~700 games, from existing files)

> Paste this whole file into Claude Code, running it **inside the folder that already contains the game HTML files and images**. Build in phases. Don't skip the Definition of Done.

---

## 0. Context: what's in this folder (read before doing anything)

This folder is an exported "Vault" of browser games (~735 games). The structure is specific — discover it programmatically, don't assume:

- **~1,468 `.html` files = ~735 games**, each present as a PAIR:
  - **Raw game file** — spaced/title name, e.g. `Among Us.html`, `1 on 1 Soccer.html`. This is the actual game loader. Many load their real assets from **external CDNs** (`cdn.jsdelivr.net/gh/...`), some use **Ruffle** for `.swf` Flash games, some are Unity/Construct exports.
  - **Wrapper file** — lowercase slug name, e.g. `amongus.html`, `1on1soccer.html`. Contains a toolbar + `<iframe id="gameFrame" src="<raw file>.html">`. There are ~735 of these (they contain the string `gameFrame`).
- **~732 thumbnail images** (`.png` / `.jpg` / `.webp`), named by slug, e.g. `amongus.png`.
- **Support files**: `vault.css`, `vault.js`, `style.css`, `file.css`, `shutdown.css`, `box2d.wasm.js`, `data.json`.

### CRITICAL — two things that will break the site if not handled
1. **Shutdown overlay in EVERY file.** Every `.html` contains a block delimited by `<!-- CKV-SHUTDOWN:START ... -->` and `<!-- CKV-SHUTDOWN:END -->` plus a `ckv-locked` script that covers the page and disables play. **You must strip this block (and the `shutdown.css` link and `ckv-locked` logic) from every game HTML file** as part of the build. Verify a game is actually interactive afterward.
2. **External CDN dependency.** ~657 games pull assets from third-party GitHub repos via jsDelivr. Those are outside our control. Do NOT try to inline them. Just preserve the URLs, load the game in an iframe, and make the UI degrade gracefully (loading state + "game failed to load" fallback with a retry) if a CDN 404s.

---

## 1. Goal

Rebuild this into a **production-ready** game portal, deployed on **Vercel**, that:
- Lists **every game** found in the folder (all ~700) in a fast, searchable, filterable catalog.
- Lets users **play each game** in a clean, branded shell (iframe the raw game file).
- Looks like a real, designed product — not a template, not a demo. Apple/Microsoft-tier polish: consistent design tokens, pixel-perfect spacing, light/dark themes, 60fps animation, full responsiveness 320px→4K, zero console errors, no layout shift.

This is a **catalog-driven** build. The games are data. You are building the shell, the catalog generator, and the UI around them — not reimplementing any game.

---

## 2. Tech stack (Vercel-native)

- **Next.js (App Router) + TypeScript** (strict). Deploys to Vercel with zero config.
- **Tailwind CSS** with a custom design-token config (see §5).
- **Framer Motion** for transitions/hover/stagger. **lucide-react** for icons.
- **Zustand** (or React context) for theme + favorites + recently-played, persisted to localStorage.
- Game HTML + images served as **static assets from `/public/games/`**.
- **Fuse.js** (or equivalent) for fuzzy search over the catalog.
- ESLint + Prettier configured and passing. No `any` without a justifying comment.

---

## 3. Phase 1 — Catalog generation script (do this FIRST)

Write `scripts/build-catalog.ts` (run with `tsx`/`ts-node`) that:

1. **Scans this folder** for all `.html` files and all image files.
2. **Identifies games**: treat each **wrapper** file (contains `gameFrame` iframe) as one game; read its `<title>`/`game-name` and the iframe `src` to find the **raw file**. For games that have only a raw file and no wrapper, include them too.
3. **Dedupes** the spaced-raw / slug-wrapper / image triplets into ONE catalog entry per game.
4. **Matches a thumbnail** by slug; if none, generate a placeholder/derive one.
5. **Strips the CKV shutdown block** from every game HTML file it copies (remove everything between `CKV-SHUTDOWN:START` and `CKV-SHUTDOWN:END`, remove the `shutdown.css` link, remove `ckv-locked` class logic). Keep the rest of the game intact.
6. **Copies** the cleaned game HTML, its raw file, support assets (`vault.css`, `style.css`, `box2d.wasm.js`, etc.), and thumbnails into `public/games/`.
7. **Emits `src/data/games.json`** — an array of:
   ```ts
   { id: string; slug: string; title: string; htmlPath: string; thumbnail: string; category: string; tags: string[] }
   ```
   Infer `category`/`tags` from the title where possible (e.g. "Soccer"/"Pool"/"io"/"Flash"); default to "Arcade".
8. Prints a report: total games found, paired vs orphan, missing thumbnails, files with external CDN deps.

The whole rest of the app reads ONLY `games.json` — never hardcode game lists.

---

## 4. Phase 2 — App structure & pages

```
app/
  layout.tsx            # ThemeProvider, Navbar, Footer, fonts, metadata
  page.tsx              # Home
  games/page.tsx        # Browse all (search/filter/sort)
  game/[slug]/page.tsx  # Play shell
  favorites/page.tsx
  not-found.tsx         # custom 404
components/             # Button, Card, GameCard, SearchBar, Chip, Toggle, Modal, Toast, Skeleton, EmptyState, ThemeToggle
lib/                    # storage wrapper, search, hooks, cn()
store/                  # theme, favorites, recents
src/data/games.json
public/games/           # cleaned game html + assets + thumbnails
```

### Home `/`
Animated gradient hero + tagline + "Browse all games" CTA. Rows: Featured, Recently played (hidden if empty), Popular categories. Stats strip ("700+ games · free · no signup").

### Browse `/games`
- Responsive grid (1 col mobile → 5+ desktop) of `GameCard`s (thumbnail, title, tags, favorite heart, hover lift).
- **Instant fuzzy search** (debounced, `/` keyboard shortcut to focus, highlights matches).
- **Filter** by category chips, **sort** (A–Z, newest, most-played). State synced to URL query params (shareable).
- **Virtualize or paginate** the grid — 700 cards must scroll at 60fps and not tank Lighthouse. Lazy-load thumbnails.
- Empty state when no results.

### Play `/game/[slug]`
- Branded shell: title, fullscreen toggle, favorite, back button, controls/legend if known.
- The game in an `<iframe>` from `public/games/<htmlPath>`, sized responsively, with a **loading skeleton** and a **"couldn't load this game" fallback + retry** (for dead CDN deps).
- "More like this" row from same category.

### Cross-cutting
Light/dark themes (CSS variables, no FOUC, persisted). Favorites + recently-played in localStorage. Fully responsive + touch friendly. Accessibility: semantic HTML, visible focus, ARIA on widgets, AA contrast, focus-trapped modals. SEO: per-route metadata, Open Graph, favicon, sitemap, manifest. Performance: lazy-load games, optimize images (`next/image`), no CLS, Lighthouse ≥90 across the board.

---

## 5. Design system (where "production-ready" is won)

Tokens in `tailwind.config` + CSS variables, light + dark.

- **Color**: a real, cohesive palette — a primary brand gradient (e.g. violet→fuchsia→cyan, but choose something deliberate), neutral grays with proper contrast, semantic success/warn/error. Gradients used tastefully (hero, primary buttons, active states, card hover glow) — never muddy.
- **Type**: display font for headings + clean body font, self-hosted / `next/font` (no layout shift). Modular scale (12/14/16/18/20/24/32/40/56), consistent line-heights.
- **Spacing/shape**: 4px spacing scale, consistent radii (sm/md/lg/full), layered subtle shadows. Everything on the grid.
- **Motion**: spring hover lifts, route transitions, staggered grid reveal, skeletons. Respect `prefers-reduced-motion`.
- Build a real component kit and a `/styleguide` route showing every component in both themes.

---

## 6. Phase 3 — Vercel deployment

- `next.config.js` set for static assets in `public/`. Ensure game iframes (with external CDN/Ruffle scripts) are allowed: set appropriate headers/CSP that don't block jsDelivr or Ruffle, and `frame-src`/`script-src` accordingly. Iframes must run cross-origin game code.
- Add `vercel.json` if needed (caching headers for `/public/games/`, clean URLs).
- Make `npm run build` generate the catalog (run `build-catalog` in `prebuild`) then build Next. Confirm it builds clean on Vercel.
- Write `README.md` with local dev + deploy steps, and `DECISIONS.md` for choices made.

---

## 7. Definition of Done (don't declare finished until ALL true)

- [ ] `npm run build` runs the catalog generator + Next build with **zero errors**; deploys to Vercel successfully.
- [ ] Catalog contains **every game** in the folder (print the count; it should be ~700+). No duplicate entries from the spaced/slug pairs.
- [ ] **The shutdown overlay is gone** from every served game — games are actually interactive, not locked.
- [ ] Opening any game in `/game/[slug]` loads and plays (or shows the graceful fallback if its external CDN is dead). Spot-check at least 15 games across types (HTML5, Flash/Ruffle, Unity).
- [ ] Search returns correct results instantly; filters + sort + URL sync work; 700-card grid scrolls at 60fps.
- [ ] **Zero console errors/warnings** on every route.
- [ ] Correct at 320 / 768 / 1280 / 1920px. No horizontal scroll, no overflow, no overlap.
- [ ] Light + dark both intentional, no flash, persists.
- [ ] Keyboard nav + visible focus everywhere; modals trap focus.
- [ ] Lighthouse (mobile): Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90.
- [ ] No lorem/placeholder text, no broken thumbnails, no dead internal links.
- [ ] `README.md` + `DECISIONS.md` written.

End with a report: games cataloged, games verified playable, Lighthouse scores, anything deferred and why.

---

## 8. Ground rules
- The games are DATA. Build the shell and the generator; never reimplement a game.
- Everything reads from `games.json`. One source of truth.
- Every spacing/color/radius from the token scale — no raw magic numbers.
- Make it look like a designer and an engineer who respect each other shipped it.
