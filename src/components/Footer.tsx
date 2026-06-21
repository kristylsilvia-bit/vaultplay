import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { playableCount, totalGames } from '@/lib/games';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white">
              <Gamepad2 className="h-5 w-5" />
            </span>
            Game<span className="text-gradient">jet</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            {totalGames}+ browser games, free and instant — no sign-up, no downloads. Just
            pick one and play.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/games" className="transition-colors hover:text-foreground">
                  All games
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="transition-colors hover:text-foreground">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/styleguide" className="transition-colors hover:text-foreground">
                  Style guide
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Catalog</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>{totalGames} games total</li>
              <li>{playableCount} ready to play</li>
              <li>Updated continuously</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Gamejet. Games belong to their respective creators.</p>
          <p>Built with Next.js · Deployed on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
