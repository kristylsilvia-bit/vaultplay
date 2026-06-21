import Link from 'next/link';
import { categoryIcon } from '@/lib/categoryMeta';
import type { CategoryInfo } from '@/lib/games';

export function CategoryCard({ category }: { category: CategoryInfo }) {
  const Icon = categoryIcon(category.name);
  return (
    <Link
      href={`/games?category=${encodeURIComponent(category.name)}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 ease-spring hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm transition-transform duration-300 ease-spring group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h3 className="truncate font-display font-semibold text-card-foreground">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground">{category.count} games</p>
      </div>
    </Link>
  );
}
