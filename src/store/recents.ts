'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENTS = 24;

interface RecentEntry {
  slug: string;
  /** epoch ms of the most recent play */
  at: number;
  /** total play opens (drives the "most played" sort) */
  count: number;
}

interface RecentsState {
  entries: RecentEntry[];
  record: (slug: string) => void;
  clear: () => void;
}

export const useRecents = create<RecentsState>()(
  persist(
    (set) => ({
      entries: [],
      record: (slug) =>
        set((state) => {
          const existing = state.entries.find((e) => e.slug === slug);
          const rest = state.entries.filter((e) => e.slug !== slug);
          const entry: RecentEntry = {
            slug,
            at: Date.now(),
            count: (existing?.count ?? 0) + 1,
          };
          return { entries: [entry, ...rest].slice(0, MAX_RECENTS) };
        }),
      clear: () => set({ entries: [] }),
    }),
    { name: 'vault-recents' },
  ),
);
