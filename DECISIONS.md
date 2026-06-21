# Engineering decisions

Why the build is shaped the way it is. Context: an exported "Vault" of ~735 browser games
(wrapper + raw-file + thumbnail triplets), every file carrying a shutdown overlay, most
games loading assets from third-party CDNs.

## Catalog generation

- **One generator, one source of truth.** `scripts/build-catalog.ts` is the only thing
  that knows about the vault's file layout. It emits `src/data/games.json`; every page
  reads only that. No game list is ever hardcoded.
- **Wrapper = one game.** Files containing `id="gameFrame"` are the canonical game list
  (735). The wrapper gives us the human title (`game-name`/`<title>`) and the iframe `src`
  → the raw loader. This naturally dedupes the spaced-raw / slug-wrapper / image triplets.
- **Raw-file resolution is layered.** Exact `src` filename → slugified-name match →
  conservative substring match → Levenshtein distance ≤ 2. The fuzzy steps recovered real
  games whose wrapper/file names disagreed (`Five Nights at Freddy's`, US/UK spelling of
  "Neighbor/Neighbour", "Tony Hawk**s**" vs "Tony Hawk"). 737 / 739 resolve to a playable
  file; the 2 that don't (`Only Up`, `Shark Game`) have no source file in the export and
  fall back to the graceful "unavailable" state.
- **Apostrophes bit us once.** The first iframe-`src` regex stopped at `'`, truncating
  filenames like `Five Nights at Freddy's.html`. Fixed by matching with a quote
  backreference. Worth recording because it silently dropped 10 games.
- **Slug-named output.** Each raw file is copied to `public/games/<slug>.html` (not its
  spaced name) for clean URLs and to avoid space/encoding issues in iframe `src`. Relative
  asset references inside games resolve against `/games/`, so support files
  (`style.css`, `box2d.wasm.js`, …) are copied there too.
- **Incremental + prune.** Copies skip unchanged files (mtime check) so re-runs on every
  `dev`/`build` are fast; a prune pass removes stale output when slugs change between runs.
- **Generated artifacts are git-ignored.** `public/games/` and `games.json` are rebuilt by
  the `prebuild` hook on Vercel, so they never go stale in the repo. The raw vault files
  *are* committed — they're the input the generator needs at build time.

## The shutdown overlay

- Every file wraps its overlay in a self-contained `<!-- CKV-SHUTDOWN:START … END -->`
  block (verified: 1468/1468, zero stray `shutdown.css` / `ckv-locked` references outside
  it). So a single regex strip removes the overlay, its critical CSS, the `shutdown.css`
  link, and the locking script in one shot — and leaves the game intact.

## Security / CSP — the central trade-off

A game portal must execute untrusted third-party code: jsDelivr-hosted scripts, the Ruffle
Flash emulator, Unity/Construct exports, embedded `.swf` via `<object>/<embed>`, and a few
games hosted on external origins (Netlify/Vercel). That is fundamentally at odds with a
tight CSP.

**Decision:** ship a deliberately permissive CSP (`script-src 'self' 'unsafe-inline'
'unsafe-eval' https: blob: data:`, `frame-src https:`, `object-src https:`, etc.) rather
than break games. Mitigations that remain in place: `X-Content-Type-Options: nosniff`,
`Referrer-Policy`, scoped `Permissions-Policy`, and same-origin serving of the cleaned game
HTML. Games are **not** sandboxed — Ruffle/Unity are finicky and these are the user's own
archived files; compatibility was prioritized over isolation. Revisit if ever serving
untrusted user-submitted games.

## Removing ads (two very different cases)

The catalog generator strips ads alongside the shutdown overlay (`cleanGameHtml`), but
only the parts that are safe to remove:

- **Standalone display ads — removed.** Google AdSense (`<ins class="adsbygoogle">`, the
  `googlesyndication`/`pagead2` loader, the canonical `(adsbygoogle = …).push({})` call),
  ad-network loader scripts (doubleclick, amazon-adsystem, adnxs, adsterra, …), ad-domain
  resource-hint `<link>`s, and the obfuscated "sidebar ad" injector (id `sidebarad1/2`)
  found in one game. These are pure advertising — removing them can't break a game.
- **Game-launcher monetization SDKs — left in place.** GameMonetize, GameDistribution
  (`GD_OPTIONS`), CrazyGames, and AdinPlay (`aiptag`/`aipPlayer`) are *not* removed,
  because the game boots through them. e.g. Granny calls `createUnityInstance` inside the
  GameMonetize SDK script's `onload`; deleting the SDK means the game never starts. These
  networks also gate ads by registered domain, so on a fresh deployment they typically
  skip ads and just fire the start callback — i.e. the games tend to run ad-free anyway.

Two deliberate non-actions: `_0x…` obfuscated **game code** (CircloO 2, Dadish 3, Google
Feud, War The Knights) is left untouched — only the one obfuscated *ad injector* is
removed; and `googletagmanager`/`gtag` is **analytics, not ads**, so it stays (it also
happens to be a substring of "googletag", which is why a naive scan over-reports it).

## App architecture

- **Next.js App Router + SSG.** `generateStaticParams` pre-renders all 739 game pages, so
  play pages are static and instant. Home/browse/favorites are static too.
- **Window virtualization** (`@tanstack/react-virtual`) for the 700+ card grid — only
  visible rows mount, keeping scroll at 60fps and Lighthouse healthy. Column count is
  responsive via `ResizeObserver`.
- **CSS-only card hover** (transform/opacity), not per-card Framer Motion, so a large grid
  doesn't drop frames. Framer Motion is reserved for route-level/section flourishes,
  modals, toasts, and the theme-toggle icon.
- **State:** Zustand for favorites + recents (persisted via `persist`); theme is a small
  Zustand store backed by a plain `localStorage` key so a render-blocking inline script can
  set the theme class **before first paint** (no FOUC). Components that read persisted
  state gate on a `useHydrated()` flag to avoid hydration mismatches.
- **Design tokens.** All color/radius/shadow/type live in `tailwind.config.ts` +
  CSS variables (HSL channel triples for opacity support), with light/dark + an explicit
  `.light` scope so the `/styleguide` can show both themes side-by-side.

## Thumbnails

- Matched by slug; `.jfif` is normalized to `.jpg` (it's JPEG) so `next/image` is happy.
- 16 games have no thumbnail → a deterministic gradient + initials placeholder (stable per
  slug), so there are never broken images.

## Known deferrals

- **2 unplayable games** (`Only Up`, `Shark Game`) — no source file exists in the export;
  they render the graceful "unavailable" state. Listed for completeness.
- **Dead-CDN detection is best-effort.** We can't reliably detect a cross-origin asset
  404 inside a same-origin iframe, so the play shell uses a load-timeout → retry / open-in-
  new-tab fallback rather than guaranteed per-asset error detection.
- **Category inference is heuristic** (title + engine keywords), defaulting to "Arcade".
  Good enough for filtering; not hand-curated for all 739 games.
