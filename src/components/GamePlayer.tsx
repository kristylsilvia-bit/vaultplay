'use client';

import { AlertTriangle, ExternalLink, Gamepad2, Maximize, Minimize, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { Game } from '@/lib/types';
import { useRecents } from '@/store/recents';

const LOAD_TIMEOUT_MS = 20000;

export function GamePlayer({ game }: { game: Game }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const record = useRecents((s) => s.record);

  // Log the play once on mount (drives "recently played" + "most played").
  useEffect(() => {
    if (game.playable) record(game.slug);
  }, [game.slug, game.playable, record]);

  // If the iframe never signals load, surface a graceful fallback.
  useEffect(() => {
    if (status !== 'loading') return;
    const t = setTimeout(
      () => setStatus((s) => (s === 'loading' ? 'error' : s)),
      LOAD_TIMEOUT_MS,
    );
    return () => clearTimeout(t);
  }, [status, reloadKey]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const reload = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* fullscreen can be blocked; ignore */
    }
  };

  if (!game.playable) {
    return (
      <div className="flex h-[60vh] min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Gamepad2 className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl font-semibold">This game isn’t available</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We couldn’t find a playable file for {game.title}. It may have been hosted
          elsewhere. Browse the catalog for something else to play.
        </p>
        <a href="/games" className={buttonVariants({ variant: 'secondary', className: 'mt-6' })}>
          Find another game
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group/player relative aspect-video max-h-[80vh] min-h-[440px] w-full overflow-hidden rounded-2xl border border-border bg-black shadow-lg"
    >
      {status !== 'error' && (
        <iframe
          key={reloadKey}
          src={game.htmlPath}
          title={game.title}
          onLoad={() => setStatus('ready')}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope; clipboard-write"
          allowFullScreen
        />
      )}

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card">
          <div className="h-10 w-10 animate-spin-slow rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading {game.title}…</p>
        </div>
      )}

      {/* Error / dead-CDN fallback */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Couldn’t load this game</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              It’s taking too long — the game’s host may be temporarily down. Try
              reloading, or open it in a new tab.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reload}>
              <RotateCw className="h-4 w-4" />
              Retry
            </Button>
            <a
              href={game.htmlPath}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'secondary' })}
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </a>
          </div>
        </div>
      )}

      {/* Floating controls */}
      {status !== 'error' && (
        <div
          className={cn(
            'absolute right-3 top-3 flex gap-2 transition-opacity duration-200',
            'opacity-0 focus-within:opacity-100 group-hover/player:opacity-100',
          )}
        >
          <ControlButton label="Reload game" onClick={reload}>
            <RotateCw className="h-[18px] w-[18px]" />
          </ControlButton>
          <ControlButton
            label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="h-[18px] w-[18px]" />
            ) : (
              <Maximize className="h-[18px] w-[18px]" />
            )}
          </ControlButton>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-background focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}
