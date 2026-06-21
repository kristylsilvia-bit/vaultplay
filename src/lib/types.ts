/** A single catalog entry, as emitted by scripts/build-catalog.ts. */
export interface Game {
  id: string;
  slug: string;
  title: string;
  /** "/games/<slug>.html", an external URL, or "" when no playable file exists. */
  htmlPath: string;
  /** "/games/<slug>.<ext>" or "" (UI renders a deterministic placeholder). */
  thumbnail: string;
  category: string;
  tags: string[];
  external: boolean;
  playable: boolean;
  featured: boolean;
}

export type SortKey = 'az' | 'za' | 'category' | 'played';
