'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { GameCard } from '@/components/GameCard';
import type { Game } from '@/lib/types';

/** A horizontally scrolling shelf of games, with desktop arrow controls. */
export function GameRow({ games }: { games: Game[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {games.map((game, i) => (
          <div key={game.slug} className="w-40 shrink-0 snap-start sm:w-44 md:w-48">
            <GameCard game={game} priority={i < 6} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="absolute -left-4 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-background focus-visible:ring-2 focus-visible:ring-ring group-hover/row:opacity-100 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute -right-4 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-background focus-visible:ring-2 focus-visible:ring-ring group-hover/row:opacity-100 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
