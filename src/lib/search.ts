import Fuse, { type FuseResult } from 'fuse.js';
import { games } from './games';
import type { Game } from './types';

/** Shared fuzzy-search index over the catalog. */
export const fuse = new Fuse(games, {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'category', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
});

export function searchGames(query: string): Game[] {
  const q = query.trim();
  if (!q) return games;
  return fuse.search(q).map((r: FuseResult<Game>) => r.item);
}
