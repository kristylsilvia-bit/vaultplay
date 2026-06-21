'use client';

import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { games } from '@/lib/games';

const playable = games.filter((g) => g.playable);

export function SurpriseButton() {
  const router = useRouter();
  const surprise = () => {
    const pick = playable[Math.floor(Math.random() * playable.length)];
    if (pick) router.push(`/game/${pick.slug}`);
  };
  return (
    <Button variant="secondary" size="lg" onClick={surprise}>
      <Shuffle className="h-5 w-5" />
      Surprise me
    </Button>
  );
}
