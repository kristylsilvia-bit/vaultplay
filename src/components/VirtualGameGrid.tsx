'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from 'react';
import { GameCard } from '@/components/GameCard';
import type { Game } from '@/lib/types';

const GAP = 16; // matches Tailwind gap-4

function columnsForWidth(width: number): number {
  if (width < 420) return 2;
  if (width < 640) return 3;
  if (width < 900) return 4;
  if (width < 1200) return 5;
  return 6;
}

/**
 * Window-virtualized responsive grid. Only the visible rows mount, so the full
 * 700+ card catalog scrolls at 60fps and never tanks Lighthouse.
 */
export function VirtualGameGrid({ games }: { games: Game[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const update = () => {
      setWidth(el.clientWidth);
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const cols = width ? columnsForWidth(width) : 4;
  const cardWidth = width ? (width - GAP * (cols - 1)) / cols : 0;
  // image (4:3) + title/meta block + row gap
  const rowHeight = cardWidth ? Math.round(cardWidth * 0.75 + 78 + GAP) : 320;
  const rowCount = Math.ceil(games.length / cols);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight,
    overscan: 4,
    scrollMargin,
  });

  // Re-measure when layout-affecting inputs change.
  useEffect(() => {
    virtualizer.measure();
  }, [rowHeight, cols, rowCount, virtualizer]);

  return (
    <div ref={parentRef}>
      <div
        style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const start = row.index * cols;
          const rowGames = games.slice(start, start + cols);
          return (
            <div
              key={row.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: GAP,
                paddingBottom: GAP,
              }}
            >
              {rowGames.map((game, i) => (
                <GameCard
                  key={game.slug}
                  game={game}
                  priority={row.index === 0 && i < cols}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
