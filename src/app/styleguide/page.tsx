'use client';

import { Rocket, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/components/ui/Toast';
import { GameCard } from '@/components/GameCard';
import { SearchBar } from '@/components/SearchBar';
import { games } from '@/lib/games';
import { cn } from '@/lib/cn';

const sample = games[0]!;

const swatches = [
  ['Background', 'bg-background border border-border'],
  ['Card', 'bg-card border border-border'],
  ['Muted', 'bg-muted'],
  ['Primary', 'bg-primary'],
  ['Accent', 'bg-accent'],
  ['Secondary', 'bg-secondary'],
  ['Success', 'bg-success'],
  ['Warning', 'bg-warning'],
  ['Error', 'bg-error'],
  ['Brand 1', 'bg-brand-1'],
  ['Brand 2', 'bg-brand-2'],
  ['Brand 3', 'bg-brand-3'],
] as const;

const typeScale = [
  ['Display 6xl', 'font-display text-6xl font-extrabold'],
  ['Display 4xl', 'font-display text-4xl font-bold'],
  ['Heading 2xl', 'font-display text-2xl font-semibold'],
  ['Body lg', 'text-lg'],
  ['Body base', 'text-base'],
  ['Small', 'text-sm text-muted-foreground'],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-10">
      <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function ThemePanel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div
      className={cn(
        theme,
        'space-y-4 rounded-2xl border border-border bg-background p-6 text-foreground',
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {theme} theme
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active>Active</Chip>
        <Chip>Inactive</Chip>
      </div>
      <div className="w-48">
        <GameCard game={sample} />
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  const [toggled, setToggled] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  return (
    <div className="container space-y-10 py-10 md:py-14">
      <header>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> Design system
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">Style guide</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Every primitive in the VaultPlay component kit, built from a single set of design
          tokens. Use the theme toggle in the nav, or compare both themes below.
        </p>
      </header>

      <Section title="Both themes">
        <div className="grid gap-6 md:grid-cols-2">
          <ThemePanel theme="light" />
          <ThemePanel theme="dark" />
        </div>
      </Section>

      <Section title="Color tokens">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map(([name, cls]) => (
            <div key={name}>
              <div className={cn('h-16 w-full rounded-xl shadow-sm', cls)} />
              <p className="mt-2 text-sm font-medium">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-3">
          {typeScale.map(([label, cls]) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
              <span className={cls}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Chips">
        <div className="flex flex-wrap gap-2">
          <Chip active>Arcade</Chip>
          <Chip>Racing</Chip>
          <Chip>Shooter</Chip>
          <Chip>Puzzle</Chip>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="max-w-md space-y-5">
          <SearchBar value={search} onChange={setSearch} />
          <div className="flex items-center gap-3">
            <Toggle checked={toggled} onChange={setToggled} label="Demo toggle" />
            <span className="text-sm text-muted-foreground">
              Switch is {toggled ? 'on' : 'off'}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Feedback">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast('Saved to favorites', 'success')}>
            Show success toast
          </Button>
          <Button variant="secondary" onClick={() => toast('Heads up — something happened')}>
            Show info toast
          </Button>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
        </div>
      </Section>

      <Section title="Skeletons">
        <div className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={Rocket}
          title="Nothing here yet"
          description="This is what an empty state looks like across the app."
          action={<Button variant="secondary">Take an action</Button>}
        />
      </Section>

      <Section title="Game card">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {games.slice(0, 4).map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example modal"
        description="Focus is trapped here. Press Esc or click the backdrop to close."
      >
        <p className="text-sm text-muted-foreground">
          Modals use the same tokens, motion, and focus management as the rest of the app.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setModalOpen(false)}>Got it</Button>
        </div>
      </Modal>
    </div>
  );
}
