import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BrowseClient } from '@/components/BrowseClient';
import { Skeleton } from '@/components/ui/Skeleton';
import { totalGames } from '@/lib/games';

export const metadata: Metadata = {
  title: 'All Games',
  description: `Browse and search all ${totalGames} free browser games. Filter by category and sort to find your next favorite.`,
};

function BrowseFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="flex gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <div className="container py-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          All Games
        </h1>
        <p className="mt-2 text-muted-foreground">
          {totalGames} games to explore — search, filter, and start playing instantly.
        </p>
      </header>
      <Suspense fallback={<BrowseFallback />}>
        <BrowseClient />
      </Suspense>
    </div>
  );
}
