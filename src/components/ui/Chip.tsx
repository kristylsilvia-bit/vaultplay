import { cn } from '@/lib/cn';

export interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  as?: 'button' | 'span';
}

/** A filter/tag pill. Renders as a button (interactive) or span (static). */
export function Chip({ active = false, as = 'button', className, children, ...props }: ChipProps) {
  const cls = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ease-spring',
    active
      ? 'bg-brand-gradient text-white shadow-sm'
      : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground',
    as === 'button' &&
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95',
    className,
  );
  if (as === 'span') {
    return (
      <span className={cls} {...(props as React.HTMLAttributes<HTMLSpanElement>)}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
