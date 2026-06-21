'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  ids: string[];
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (slug) =>
        set((state) => ({
          ids: state.ids.includes(slug)
            ? state.ids.filter((id) => id !== slug)
            : [slug, ...state.ids],
        })),
      isFavorite: (slug) => get().ids.includes(slug),
      clear: () => set({ ids: [] }),
    }),
    { name: 'vault-favorites' },
  ),
);
