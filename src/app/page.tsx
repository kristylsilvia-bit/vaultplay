import Link from 'next/link';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { SurpriseButton } from '@/components/SurpriseButton';
import { GameRow } from '@/components/GameRow';
import { RecentlyPlayed } from '@/components/RecentlyPlayed';
import { SectionHeading } from '@/components/SectionHeading';
import { CategoryCard } from '@/components/CategoryCard';
import { categories, featuredGames, playableCount, totalGames } from '@/lib/games';

const stats = [
  { value: `${totalGames}+`, label: 'Games' },
  { value: `${playableCount}`, label: 'Playable now' },
  { value: `${categories.length}`, label: 'Categories' },
  { value: 'Free', label: 'No sign-up' },
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-4 md:space-y-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-brand-gradient bg-[length:200%_200%] opacity-[0.10] animate-gradient-pan dark:opacity-[0.18]" />
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-1/30 blur-3xl" />
          <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-brand-3/25 blur-3xl" />
        </div>

        <div className="container flex flex-col items-center py-20 text-center md:py-28">
          <span className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            {totalGames}+ games, ready when you are
          </span>

          <h1 className="max-w-4xl animate-fade-up font-display text-5xl font-extrabold leading-[1.05] tracking-tight [animation-delay:60ms] md:text-6xl">
            Your whole arcade,
            <br />
            <span className="text-gradient">one click away.</span>
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-lg text-muted-foreground [animation-delay:120ms]">
            Hundreds of browser games — arcade, racing, shooters, puzzles and more. No
            downloads, no accounts. Just pick one and play.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:180ms] sm:flex-row">
            <Link href="/games" className={buttonVariants({ size: 'lg' })}>
              Browse all games
              <ArrowRight className="h-5 w-5" />
            </Link>
            <SurpriseButton />
          </div>

          {/* Stats strip */}
          <dl className="mt-16 grid w-full max-w-2xl animate-fade-up grid-cols-2 gap-4 [animation-delay:240ms] sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card/60 px-4 py-5 backdrop-blur"
              >
                <dt className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Recently played (hidden when empty) */}
      <RecentlyPlayed />

      {/* Featured */}
      <section className="container">
        <SectionHeading
          title="Featured games"
          subtitle="Hand-picked favorites to get you started"
          href="/games"
        />
        <GameRow games={featuredGames} />
      </section>

      {/* Categories */}
      <section className="container">
        <SectionHeading title="Browse by category" subtitle="Find exactly what you're in the mood for" href="/games" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <CategoryCard key={c.name} category={c} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-brand-gradient opacity-[0.08]" />
          <Zap className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
            Ready to play?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {totalGames} games and counting. Dive into the full catalog and find your next
            obsession.
          </p>
          <Link
            href="/games"
            className={buttonVariants({ size: 'lg', className: 'mt-7' })}
          >
            Explore the catalog
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
