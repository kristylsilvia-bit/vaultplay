/**
 * build-catalog.ts — the single source of truth generator.
 *
 * Scans the project root (an exported "Vault" of browser games), figures out which
 * files form a game, strips the CKV shutdown overlay, copies the cleaned game HTML +
 * thumbnails + support assets into public/games/, and emits src/data/games.json.
 *
 * The rest of the app reads ONLY games.json. Run with: `tsx scripts/build-catalog.ts`.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, extname, join } from 'node:path';

const ROOT = process.cwd();
// Raw vault files (game HTML, thumbnails, support assets) live in this folder, kept
// out of the repo root so the root stays tidy and GitHub doesn't truncate the listing.
const SOURCE = join(ROOT, 'game-source');
const PUBLIC_GAMES = join(ROOT, 'public', 'games');
const DATA_DIR = join(ROOT, 'src', 'data');
const DATA_FILE = join(DATA_DIR, 'games.json');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.jfif', '.avif']);
// Local files referenced by some games via relative paths; copy so they resolve.
const SUPPORT_ASSETS = [
  'style.css',
  'file.css',
  'vault.css',
  'vault.js',
  'box2d.wasm.js',
  'box2d.wasm',
];
// Non-game shell/utility HTML pages we never want in the catalog.
const PAGE_BLOCKLIST = new Set([
  'index.html',
  'gamepage.html',
  'home.html',
  'games.html',
  '404.html',
  'privacy.html',
  'about.html',
  'contact.html',
  'shutdown.html',
]);

const SHUTDOWN_RE = /<!--\s*CKV-SHUTDOWN:START[\s\S]*?CKV-SHUTDOWN:END\s*-->/g;
const CDN_RE = /cdn\.jsdelivr\.net|jsdelivr|githack|raw\.githubusercontent|unpkg\.com/i;

interface GameEntry {
  id: string;
  slug: string;
  title: string;
  htmlPath: string; // "/games/<slug>.html", an external URL, or "" if unplayable
  thumbnail: string; // "/games/<slug>.<ext>" or "" (UI renders a placeholder)
  category: string;
  tags: string[];
  external: boolean;
  playable: boolean;
  featured: boolean;
}

function slugify(name: string): string {
  return name
    .replace(/\.html?$/i, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/** Levenshtein distance — used for last-resort fuzzy raw-file resolution. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[m]![n]!;
}

function prettifyTitle(slugOrName: string): string {
  const base = slugOrName.replace(/\.html?$/i, '');
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** Pull the human title out of a wrapper file. */
function extractTitle(html: string, fallbackSlug: string): string {
  const nameMatch = html.match(/class="game-name"[^>]*>([^<]+)</i);
  if (nameMatch?.[1]) return decodeEntities(nameMatch[1]);
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) {
    const t = decodeEntities(titleMatch[1]);
    if (t && !/^google\.com$/i.test(t)) return t;
  }
  return prettifyTitle(fallbackSlug);
}

/**
 * Pull the iframe src out of a wrapper file. Uses a quote backreference so filenames
 * containing an apostrophe (e.g. `Five Nights at Freddy's.html`) are captured whole.
 */
function extractIframeSrc(html: string): string {
  let m = html.match(/id=["']gameFrame["'][^>]*?\ssrc=(["'])([\s\S]*?)\1/i);
  if (!m) m = html.match(/\ssrc=(["'])([\s\S]*?)\1[^>]*?id=["']gameFrame["']/i);
  return m?.[2] ? decodeEntities(m[2]).trim() : '';
}

// ----- category / tag inference -------------------------------------------------

const CATEGORY_RULES: ReadonlyArray<[RegExp, string]> = [
  [/(\.io\b|\bio\b|agar|slither|paper\.io|diep|zombs|\bhole\b|surviv)/i, 'io'],
  [/\b(soccer|football|basketball|tennis|golf|pool|billiard|snooker|baseball|hockey|bowling|boxing|fifa|nba|nfl|dunk|volley|cricket|darts|skate|skateboard|surf)\b/i, 'Sports'],
  [/\b(race|racing|racer|drift|kart|car|cars|drive|driving|traffic|parking|moto|motox|bmx|bike|wheel|rally|nascar|formula|highway|truck|stunt|drag|speed|road|rider)\b/i, 'Racing'],
  [/\b(shoot|shooter|shooting|gun|guns|sniper|war|combat|strike|fps|krunker|shell|forces|commando|swat|tank|warfare|paintball|archer|archery|blast|bullet)\b/i, 'Shooter'],
  [/\b(zombie|zombies|horror|scary|creepy|granny|fnaf|fnae|nightmare|slender|backrooms|evil|dead|haunt|neighbour|neighbor)\b/i, 'Horror'],
  [/\b(fight|fighting|ninja|samurai|sword|hero|stickman|stick|brawl|smash|kombat|kung|warrior|slash|knight|assassin|battle|fury|rage|attack)\b/i, 'Action'],
  [/\b(puzzle|2048|sudoku|match|blocks|block|tetris|mahjong|solitaire|cube|merge|jigsaw|connect|crossword|hexa|sort|brain|logic|flow|fill|word|number)\b/i, 'Puzzle'],
  [/\b(adventure|quest|escape|story|journey|explore|rpg|dungeon|legend|zelda|mario|sonic|world|island|temple)\b/i, 'Adventure'],
  [/\b(jump|jumping|run|running|runner|hook|parkour|platform|climb|hop|dash|fall|rush|surfers|surfer)\b/i, 'Platformer'],
  [/\b(tower\s?defense|\btd\b|strategy|idle|clicker|tycoon|kingdom|empire|defense|defence|sim|simulator|builder|merchant|miner|mining|factory|farm\s?city)\b/i, 'Strategy'],
  [/\b(chess|checkers|card|cards|uno|poker|board|domino|backgammon|ludo|bingo|solitaire|spades|hearts)\b/i, 'Board & Card'],
  [/\b(cooking|cook|chef|dress|makeup|salon|baby|color|coloring|draw|drawing|paint|pet|candy|bubble|jewel|fruit|farm|fish|cat|dog|princess|cake|pizza|food)\b/i, 'Casual'],
  [/\b(2\s?player|1\s?on\s?1|1v1|two\s?player|2player|multiplayer)\b/i, 'Multiplayer'],
];

function inferCategory(title: string): string {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(title)) return cat;
  return 'Arcade';
}

function inferTags(title: string, rawHtml: string, category: string): string[] {
  const tags = new Set<string>([category]);
  if (/ruffle|\.swf\b/i.test(rawHtml)) tags.add('Flash');
  if (/unityloader|unity\b|\.unity3d\b|build\/.*\.wasm/i.test(rawHtml)) tags.add('Unity');
  if (/\b3d\b/i.test(title) || /three\.js|babylon/i.test(rawHtml)) tags.add('3D');
  if (/\b(2\s?player|1\s?on\s?1|1v1|two\s?player|2player)\b/i.test(title)) tags.add('2 Player');
  if (/\b(html5|construct|phaser|godot)\b/i.test(rawHtml) && !tags.has('Flash')) {
    tags.add('HTML5');
  }
  // Ensure at least 2 tags for visual balance.
  if (tags.size < 2) tags.add('Browser');
  return Array.from(tags).slice(0, 4);
}

// A small curated set of well-known titles to seed the "Featured" row when present.
const FEATURED_SLUGS = new Set([
  'amongus', 'slope', 'subwaysurfers', '1v1lol', 'retrobowl', 'minecraft',
  'geometrydash', 'cookieclicker', 'tetris', 'paperio2', 'rocketleague',
  'basketballstars', 'moto x3m', 'motox3m', 'crossyroad', 'flappybird',
  'getawayshootout', 'happywheels', 'eaglercraft', 'driftboss', 'tunnelrush',
  'snowrider3d', 'stickmanhook', 'doodlejump', 'fireboyandwatergirl', 'bitlife',
]);

// ----- main ---------------------------------------------------------------------

function build(): void {
  console.log('▶ build-catalog: scanning', SOURCE);
  mkdirSync(PUBLIC_GAMES, { recursive: true });
  mkdirSync(DATA_DIR, { recursive: true });

  const entries = readdirSync(SOURCE, { withFileTypes: true });
  const htmlFiles = entries
    .filter((e) => e.isFile() && /\.html?$/i.test(e.name))
    .map((e) => e.name);
  const imageFiles = entries
    .filter((e) => e.isFile() && IMAGE_EXTS.has(extname(e.name).toLowerCase()))
    .map((e) => e.name);

  const htmlSet = new Set(htmlFiles);

  // Index images by slugified basename for matching.
  const imageBySlug = new Map<string, string>();
  for (const img of imageFiles) {
    const s = slugify(basename(img, extname(img)));
    if (s && !imageBySlug.has(s)) imageBySlug.set(s, img);
  }

  // Classify HTML: wrappers contain the gameFrame iframe.
  const wrappers: string[] = [];
  const rawCandidates: string[] = [];
  const wrapperContent = new Map<string, string>();
  for (const f of htmlFiles) {
    const content = readFileSync(join(SOURCE, f), 'utf8');
    if (/id=["']gameFrame["']/i.test(content)) {
      wrappers.push(f);
      wrapperContent.set(f, content);
    } else {
      rawCandidates.push(f);
    }
  }

  // Index raw (non-wrapper) files by slug for name-mismatch fallback resolution.
  const rawBySlug = new Map<string, string>();
  for (const f of rawCandidates) {
    const s = slugify(f);
    if (s && !rawBySlug.has(s)) rawBySlug.set(s, f);
  }

  const games: GameEntry[] = [];
  const usedSlugs = new Set<string>();
  const referencedRaw = new Set<string>();
  // Every filename the catalog expects to live in public/games; anything else is pruned.
  const expected = new Set<string>(SUPPORT_ASSETS);
  const report = {
    wrappers: wrappers.length,
    localPlayable: 0,
    external: 0,
    missing: 0,
    orphanRaw: 0,
    missingThumb: 0,
    cdnDeps: 0,
    copiedHtml: 0,
    copiedImg: 0,
    nameResolvedByFallback: 0,
  };
  const missingList: string[] = [];

  const uniqueSlug = (base: string): string => {
    let s = base || 'game';
    let i = 2;
    while (usedSlugs.has(s)) s = `${base}-${i++}`;
    usedSlugs.add(s);
    return s;
  };

  const stripAndCopyHtml = (sourceName: string, slug: string): boolean => {
    const src = join(SOURCE, sourceName);
    const dest = join(PUBLIC_GAMES, `${slug}.html`);
    expected.add(`${slug}.html`);
    try {
      if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) {
        return true; // incremental: up to date
      }
      const cleaned = readFileSync(src, 'utf8').replace(SHUTDOWN_RE, '');
      writeFileSync(dest, cleaned, 'utf8');
      report.copiedHtml++;
      return true;
    } catch (err) {
      console.warn(`  ! failed to copy ${sourceName}:`, (err as Error).message);
      return false;
    }
  };

  const copyThumb = (slug: string, title: string): string => {
    const match =
      imageBySlug.get(slug) ?? imageBySlug.get(slugify(title)) ?? undefined;
    if (!match) {
      report.missingThumb++;
      return '';
    }
    // Normalize .jfif (really jpeg) so next/image is happy.
    const ext = extname(match).toLowerCase();
    const outExt = ext === '.jfif' ? '.jpg' : ext;
    const dest = join(PUBLIC_GAMES, `${slug}${outExt}`);
    expected.add(`${slug}${outExt}`);
    try {
      const src = join(SOURCE, match);
      if (!existsSync(dest) || statSync(dest).mtimeMs < statSync(src).mtimeMs) {
        copyFileSync(src, dest);
        report.copiedImg++;
      }
      return `/games/${slug}${outExt}`;
    } catch {
      report.missingThumb++;
      return '';
    }
  };

  for (const wrapper of wrappers) {
    const content = wrapperContent.get(wrapper) ?? '';
    const slug = uniqueSlug(slugify(wrapper));
    const title = extractTitle(content, wrapper);
    const rawSrc = extractIframeSrc(content);

    let htmlPath = '';
    let external = false;
    let playable = false;
    let rawForInference = '';

    if (/^https?:\/\//i.test(rawSrc)) {
      htmlPath = rawSrc;
      external = true;
      playable = true;
      report.external++;
    } else {
      // Resolve the local raw file: exact name → slug match → contains match.
      let resolved = '';
      if (rawSrc && htmlSet.has(rawSrc)) {
        resolved = rawSrc;
      } else {
        const wantSlug = slugify(wrapper);
        if (rawBySlug.has(wantSlug)) {
          resolved = rawBySlug.get(wantSlug)!;
          report.nameResolvedByFallback++;
        } else {
          // conservative contains-match
          for (const [rs, rf] of rawBySlug) {
            if (rs.length > 4 && (rs.includes(wantSlug) || wantSlug.includes(rs))) {
              resolved = rf;
              report.nameResolvedByFallback++;
              break;
            }
          }
          // last resort: closest raw slug within a small edit distance (spelling variants)
          if (!resolved && wantSlug.length >= 6) {
            let best = '';
            let bestD = 3;
            for (const [rs, rf] of rawBySlug) {
              if (Math.abs(rs.length - wantSlug.length) > 2) continue;
              const d = editDistance(rs, wantSlug);
              if (d < bestD) {
                bestD = d;
                best = rf;
              }
            }
            if (best) {
              resolved = best;
              report.nameResolvedByFallback++;
            }
          }
        }
      }

      if (resolved) {
        referencedRaw.add(resolved);
        rawForInference = readFileSync(join(SOURCE, resolved), 'utf8');
        if (CDN_RE.test(rawForInference)) report.cdnDeps++;
        if (stripAndCopyHtml(resolved, slug)) {
          htmlPath = `/games/${slug}.html`;
          playable = true;
          report.localPlayable++;
        }
      } else {
        report.missing++;
        missingList.push(`${wrapper} -> "${rawSrc}"`);
      }
    }

    const category = inferCategory(title);
    const tags = inferTags(title, rawForInference, category);
    const thumbnail = copyThumb(slug, title);

    games.push({
      id: slug,
      slug,
      title,
      htmlPath,
      thumbnail,
      category,
      tags,
      external,
      playable,
      featured: FEATURED_SLUGS.has(slug),
    });
  }

  // Orphan raw games: real game files with no wrapper pointing at them.
  for (const raw of rawCandidates) {
    if (referencedRaw.has(raw)) continue;
    if (PAGE_BLOCKLIST.has(raw.toLowerCase())) continue;
    const content = readFileSync(join(SOURCE, raw), 'utf8');
    // Heuristic: must look like a game (embed/iframe/canvas/ruffle/unity), not a page.
    if (!/(ruffle|\.swf\b|<canvas|unityloader|<embed|<object|<iframe|new\s+Phaser)/i.test(content)) {
      continue;
    }
    const slug = uniqueSlug(slugify(raw));
    const title = prettifyTitle(raw);
    if (CDN_RE.test(content)) report.cdnDeps++;
    let htmlPath = '';
    let playable = false;
    if (stripAndCopyHtml(raw, slug)) {
      htmlPath = `/games/${slug}.html`;
      playable = true;
      report.localPlayable++;
    }
    const category = inferCategory(title);
    const tags = inferTags(title, content, category);
    const thumbnail = copyThumb(slug, title);
    report.orphanRaw++;
    games.push({
      id: slug,
      slug,
      title,
      htmlPath,
      thumbnail,
      category,
      tags,
      external: false,
      playable,
      featured: FEATURED_SLUGS.has(slug),
    });
  }

  // Copy support assets so relative references inside games resolve.
  for (const asset of SUPPORT_ASSETS) {
    const src = join(SOURCE, asset);
    if (!existsSync(src)) continue;
    const dest = join(PUBLIC_GAMES, asset);
    if (!existsSync(dest) || statSync(dest).mtimeMs < statSync(src).mtimeMs) {
      copyFileSync(src, dest);
    }
  }

  // Prune stale files from earlier runs (slugs can change between runs).
  let pruned = 0;
  for (const f of readdirSync(PUBLIC_GAMES)) {
    if (!expected.has(f)) {
      try {
        rmSync(join(PUBLIC_GAMES, f), { force: true });
        pruned++;
      } catch {
        /* ignore */
      }
    }
  }

  // Stable, friendly ordering: alphabetical by title.
  games.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

  writeFileSync(DATA_FILE, `${JSON.stringify(games, null, 2)}\n`, 'utf8');

  // ----- report -----
  const categoryCounts = games.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + 1;
    return acc;
  }, {});

  console.log('\n──────────── CATALOG REPORT ────────────');
  console.log(`Games cataloged:        ${games.length}`);
  console.log(`  from wrappers:        ${report.wrappers}`);
  console.log(`  orphan raw games:     ${report.orphanRaw}`);
  console.log(`Playable (local):       ${report.localPlayable}`);
  console.log(`Playable (external URL):${report.external}`);
  console.log(`Unresolved / missing:   ${report.missing}`);
  console.log(`Name-resolved fallback: ${report.nameResolvedByFallback}`);
  console.log(`Missing thumbnails:     ${report.missingThumb} (placeholder shown)`);
  console.log(`Games with CDN deps:    ${report.cdnDeps}`);
  console.log(`HTML written this run:  ${report.copiedHtml}`);
  console.log(`Images copied this run: ${report.copiedImg}`);
  console.log(`Stale files pruned:     ${pruned}`);
  console.log('\nBy category:');
  for (const [cat, n] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(16)} ${n}`);
  }
  if (missingList.length) {
    console.log('\nUnresolved games (will show graceful fallback):');
    for (const m of missingList) console.log(`  - ${m}`);
  }
  console.log(`\n✔ wrote ${DATA_FILE}`);
  console.log('────────────────────────────────────────\n');
}

build();
