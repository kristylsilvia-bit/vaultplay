import type { Metadata } from 'next';
import { FavoritesClient } from '@/components/FavoritesClient';

export const metadata: Metadata = {
  title: 'Favorites',
  description: 'Your saved games, all in one place.',
};

export default function FavoritesPage() {
  return (
    <div className="container py-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Your favorites
        </h1>
        <p className="mt-2 text-muted-foreground">
          Games you’ve saved, ready to jump back into.
        </p>
      </header>
      <FavoritesClient />
    </div>
  );
}
