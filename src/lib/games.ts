import rawGames from '@/data/games.json';
import type { Game } from './types';

/** The full catalog — the single source of truth for the entire app. */
export const games = rawGames as Game[];

export const totalGames = games.length;
export const playableCount = games.filter((g) => g.playable).length;

const bySlug = new Map<string, Game>(games.map((g) => [g.slug, g]));

export function getGame(slug: string): Game | undefined {
  return bySlug.get(slug);
}

export interface CategoryInfo {
  name: string;
  count: number;
}

/** Categories with counts, most-populated first. */
export const categories: CategoryInfo[] = (() => {
  const counts = new Map<string, number>();
  for (const g of games) counts.set(g.category, (counts.get(g.category) ?? 0) + 1);
  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
})();

export const categoryNames: string[] = categories.map((c) => c.name);

export function gamesInCategory(category: string): Game[] {
  return games.filter((g) => g.category === category);
}

export const featuredGames: Game[] = (() => {
  const flagged = games.filter((g) => g.featured && g.playable);
  if (flagged.length >= 12) return flagged.slice(0, 18);
  // Top up with other playable games so the row always looks full.
  const extra = games.filter((g) => g.playable && !g.featured).slice(0, 18 - flagged.length);
  return [...flagged, ...extra];
})();

/** Other games in the same category (for "More like this"). */
export function relatedGames(game: Game, limit = 12): Game[] {
  return games
    .filter((g) => g.slug !== game.slug && g.category === game.category && g.playable)
    .slice(0, limit);
}
