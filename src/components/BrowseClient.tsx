'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { VirtualGameGrid } from '@/components/VirtualGameGrid';
import { categories, games as allGames, totalGames } from '@/lib/games';
import { searchGames } from '@/lib/search';
import { useDebounced } from '@/lib/hooks';
import { useRecents } from '@/store/recents';
import type { Game, SortKey } from '@/lib/types';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
  { value: 'category', label: 'Category' },
  { value: 'played', label: 'Most played' },
];

export function BrowseClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const [category, setCategory] = useState(() => params.get('category') ?? 'All');
  const [sort, setSort] = useState<SortKey>(() => {
    const s = params.get('sort');
    return SORTS.some((x) => x.value === s) ? (s as SortKey) : 'az';
  });

  const debouncedQuery = useDebounced(query, 200);
  const recents = useRecents((s) => s.entries);

  // Keep the URL in sync so views are shareable / bookmarkable.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (debouncedQuery) sp.set('q', debouncedQuery);
    if (category !== 'All') sp.set('category', category);
    if (sort !== 'az') sp.set('sort', sort);
    const qs = sp.toString();
    router.replace(qs ? `/games?${qs}` : '/games', { scroll: false });
  }, [debouncedQuery, category, sort, router]);

  const results = useMemo<Game[]>(() => {
    let list = debouncedQuery ? searchGames(debouncedQuery) : allGames;
    if (category !== 'All') list = list.filter((g) => g.category === category);

    const playCount = new Map(recents.map((r) => [r.slug, r.count]));
    const sorted = [...list];
    switch (sort) {
      case 'az':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'category':
        sorted.sort(
          (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
        );
        break;
      case 'played':
        sorted.sort(
          (a, b) =>
            (playCount.get(b.slug) ?? 0) - (playCount.get(a.slug) ?? 0) ||
            a.title.localeCompare(b.title),
        );
        break;
    }
    return sorted;
  }, [debouncedQuery, category, sort, recents]);

  const reset = () => {
    setQuery('');
    setCategory('All');
    setSort('az');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <SearchBar
          value={query}
          onChange={setQuery}
          shortcut
          placeholder={`Search ${totalGames} games…`}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-muted-foreground">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-12 rounded-xl border border-border bg-card px-3 pr-8 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category filters */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={category === 'All'} onClick={() => setCategory('All')}>
          All
          <span className="opacity-60">{totalGames}</span>
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.name}
            active={category === c.name}
            onClick={() => setCategory(c.name)}
          >
            {c.name}
            <span className="opacity-60">{c.count}</span>
          </Chip>
        ))}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {results.length === totalGames
          ? `Showing all ${totalGames} games`
          : `${results.length} ${results.length === 1 ? 'game' : 'games'}`}
        {category !== 'All' && ` in ${category}`}
        {debouncedQuery && ` for “${debouncedQuery}”`}
      </p>

      {results.length > 0 ? (
        <VirtualGameGrid games={results} />
      ) : (
        <EmptyState
          icon={SearchX}
          title="No games found"
          description="Try a different search term or clear your filters."
          action={
            <Button variant="secondary" onClick={reset}>
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  );
}
