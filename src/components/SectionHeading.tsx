import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeading({ title, subtitle, href, linkLabel = 'See all' }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 rounded-lg text-sm font-medium text-primary transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
