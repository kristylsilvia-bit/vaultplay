import {
  BrainCircuit,
  Car,
  Compass,
  Crosshair,
  Footprints,
  Gamepad2,
  Ghost,
  type LucideIcon,
  Puzzle,
  Spade,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from 'lucide-react';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Arcade: Gamepad2,
  Racing: Car,
  Shooter: Crosshair,
  Horror: Ghost,
  Puzzle: Puzzle,
  Adventure: Compass,
  Platformer: Footprints,
  Strategy: BrainCircuit,
  'Board & Card': Spade,
  Casual: Sparkles,
  Multiplayer: Users,
  Sports: Trophy,
  Action: Swords,
  io: Target,
};

export function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICON[name] ?? Gamepad2;
}
