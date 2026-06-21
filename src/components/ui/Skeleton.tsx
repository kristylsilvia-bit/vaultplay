import { cn } from '@/lib/cn';

/** A shimmering placeholder block used while content loads. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent',
        className,
      )}
      {...props}
    />
  );
}
