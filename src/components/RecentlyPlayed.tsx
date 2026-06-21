'use client';

import { useHydrated } from '@/lib/hooks';
import { getGame } from '@/lib/games';
import { useRecents } from '@/store/recents';
import { GameRow } from '@/components/GameRow';
import { SectionHeading } from '@/components/SectionHeading';
import type { Game } from '@/lib/types';

/** Recently-played shelf. Renders nothing until there's history (and after hydration). */
export function RecentlyPlayed() {
  const entries = useRecents((s) => s.entries);
  const hydrated = useHydrated();

  if (!hydrated) return null;

  const recentGames = entries
    .map((e) => getGame(e.slug))
    .filter((g): g is Game => Boolean(g));

  if (recentGames.length === 0) return null;

  return (
    <section className="container">
      <SectionHeading title="Jump back in" subtitle="Your recently played games" />
      <GameRow games={recentGames} />
    </section>
  );
}
