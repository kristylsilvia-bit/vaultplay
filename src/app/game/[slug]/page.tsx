import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';
import { GamePlayer } from '@/components/GamePlayer';
import { GameRow } from '@/components/GameRow';
import { SectionHeading } from '@/components/SectionHeading';
import { Chip } from '@/components/ui/Chip';
import { games, getGame, relatedGames } from '@/lib/games';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: 'Game not found' };
  return {
    title: `Play ${game.title}`,
    description: `Play ${game.title} free online — ${game.category}. Instant, no download, right in your browser.`,
    openGraph: {
      title: `Play ${game.title} · Gamejet`,
      description: `Play ${game.title} free online, instantly in your browser.`,
      images: game.thumbnail ? [{ url: game.thumbnail }] : undefined,
    },
  };
}

export default async function GamePage({ params }: Params) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const related = relatedGames(game);

  return (
    <div className="container py-6 md:py-8">
      <Link
        href="/games"
        className="mb-5 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" />
        All games
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {game.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip as="span" active>
              {game.category}
            </Chip>
            {game.tags
              .filter((t) => t !== game.category)
              .map((tag) => (
                <Chip as="span" key={tag}>
                  {tag}
                </Chip>
              ))}
          </div>
        </div>
        <FavoriteButton slug={game.slug} title={game.title} variant="solid" />
      </div>

      <GamePlayer game={game} />

      <p className="mt-4 text-sm text-muted-foreground">
        Tip: use your mouse and keyboard to play. Click{' '}
        <span className="font-medium text-foreground">fullscreen</span> for the best
        experience. Some games load assets from third-party hosts — if one doesn’t start,
        hit reload.
      </p>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            title="More like this"
            subtitle={`More ${game.category} games`}
            href={`/games?category=${encodeURIComponent(game.category)}`}
          />
          <GameRow games={related} />
        </section>
      )}
    </div>
  );
}
