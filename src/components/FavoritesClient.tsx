'use client';

import { Heart } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { VirtualGameGrid } from '@/components/VirtualGameGrid';
import { useHydrated } from '@/lib/hooks';
import { getGame } from '@/lib/games';
import type { Game } from '@/lib/types';
import { useFavorites } from '@/store/favorites';

export function FavoritesClient() {
  const ids = useFavorites((s) => s.ids);
  const clear = useFavorites((s) => s.clear);
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    );
  }

  const favorites = ids.map((id) => getGame(id)).filter((g): g is Game => Boolean(g));

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        description="Tap the heart on any game to save it here for quick access."
        action={
          <a href="/games" className={buttonVariants()}>
            Browse games
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {favorites.length} {favorites.length === 1 ? 'game' : 'games'} saved
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear all
        </Button>
      </div>
      <VirtualGameGrid games={favorites} />
    </div>
  );
}
