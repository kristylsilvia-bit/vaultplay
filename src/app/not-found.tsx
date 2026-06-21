import Link from 'next/link';
import { Gamepad2, Home, Search } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 -z-10 bg-brand-gradient opacity-20 blur-3xl" />
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-gradient text-white shadow-glow">
          <Gamepad2 className="h-10 w-10" />
        </span>
      </div>
      <p className="font-display text-6xl font-extrabold tracking-tight text-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
        Game over — page not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This level doesn’t exist. The link may be broken, or the game moved. Let’s get you
        back in the action.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants()}>
          <Home className="h-5 w-5" />
          Back home
        </Link>
        <Link href="/games" className={buttonVariants({ variant: 'secondary' })}>
          <Search className="h-5 w-5" />
          Browse games
        </Link>
      </div>
    </div>
  );
}
