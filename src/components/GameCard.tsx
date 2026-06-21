import Link from 'next/link';
import { Play } from 'lucide-react';
import { GameThumb } from '@/components/GameThumb';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { Game } from '@/lib/types';
import { cn } from '@/lib/cn';

interface GameCardProps {
  game: Game;
  priority?: boolean;
  className?: string;
}

const CARD_SIZES =
  '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 240px';

/**
 * A single game in the grid. Hover affordances are pure CSS (transform/opacity) so a
 * 700-card grid stays at 60fps — no per-card JS animation.
 */
export function GameCard({ game, priority = false, className }: GameCardProps) {
  return (
    <Link
      href={`/game/${game.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm outline-none transition-all duration-300 ease-spring',
        'hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <GameThumb
          game={game}
          sizes={CARD_SIZES}
          priority={priority}
          className="transition-transform duration-500 ease-spring group-hover:scale-105"
        />

        {/* Hover wash + play affordance */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow transition-transform duration-300 ease-spring group-hover:scale-100 scale-75">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>

        <div className="absolute right-2.5 top-2.5 z-10">
          <FavoriteButton slug={game.slug} title={game.title} />
        </div>

        {game.featured && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary backdrop-blur-md">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground">
          {game.title}
        </h3>
        <span className="mt-auto text-xs font-medium text-muted-foreground">
          {game.category}
        </span>
      </div>
    </Link>
  );
}
