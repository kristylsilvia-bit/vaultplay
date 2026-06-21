import Image from 'next/image';
import { initials, placeholderGradient } from '@/lib/placeholder';
import type { Game } from '@/lib/types';
import { cn } from '@/lib/cn';

interface GameThumbProps {
  game: Pick<Game, 'slug' | 'title' | 'thumbnail'>;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** A game's cover image, with a deterministic gradient fallback when missing. */
export function GameThumb({ game, sizes, priority = false, className }: GameThumbProps) {
  if (game.thumbnail) {
    return (
      <Image
        src={game.thumbnail}
        alt={`${game.title} cover art`}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center', className)}
      style={{ backgroundImage: placeholderGradient(game.slug) }}
      role="img"
      aria-label={`${game.title} cover art`}
    >
      <span className="font-display text-3xl font-bold text-white/90 drop-shadow">
        {initials(game.title)}
      </span>
    </div>
  );
}
