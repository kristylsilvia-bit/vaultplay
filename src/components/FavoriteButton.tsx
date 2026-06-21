'use client';

import { Heart } from 'lucide-react';
import { useHydrated } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { useFavorites } from '@/store/favorites';
import { useToast } from '@/components/ui/Toast';

interface FavoriteButtonProps {
  slug: string;
  title: string;
  /** "overlay" sits on a game card; "solid" is a standalone control. */
  variant?: 'overlay' | 'solid';
  className?: string;
}

export function FavoriteButton({
  slug,
  title,
  variant = 'overlay',
  className,
}: FavoriteButtonProps) {
  const ids = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const hydrated = useHydrated();
  const { toast } = useToast();
  const active = hydrated && ids.includes(slug);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug);
    toast(active ? `Removed ${title} from favorites` : `Added ${title} to favorites`, 'success');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200 ease-spring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-90',
        variant === 'overlay'
          ? 'h-9 w-9 bg-background/70 text-foreground backdrop-blur-md hover:bg-background'
          : 'h-11 w-11 border border-border bg-background hover:bg-muted',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-[18px] w-[18px] transition-all duration-200',
          active ? 'scale-110 fill-error text-error' : 'text-current',
        )}
      />
    </button>
  );
}
