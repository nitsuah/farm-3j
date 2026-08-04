/**
 * Pure computation functions for wave spawning.
 * These are extracted from useWaveSpawner.tsx to enable unit testing
 * without requiring a full React hook environment.
 */

import { GRUNT_MAX_HP } from '../game/constants';
import type { PlacedBuilding } from '../game/types';

/**
 * Computes the HP of a grunt for the given wave number and difficulty multiplier.
 * Scales linearly: base HP + 10 per wave (after wave 1), then multiplied by difficulty.
 */
export function computeGruntHp(wave: number, diffHpMult: number): number {
  return Math.round((GRUNT_MAX_HP + (wave - 1) * 10) * diffHpMult);
}

/**
 * Computes the base number of grunts to spawn this wave (before flanking).
 * Doubles on every 3rd wave as a "double assault".
 */
export function computeGruntCount(wave: number): number {
  const baseCount = Math.min(6, 1 + Math.floor(wave / 5));
  return wave % 3 === 0 ? baseCount + 2 : baseCount;
}

/**
 * Builds a Set of "x,y" strings representing all placed wall tiles.
 * Used to block pathfinding through walls.
 */
export function buildWallSet(buildings: PlacedBuilding[]): Set<string> {
  return new Set(
    buildings.filter(b => b.type === 'wall').map(b => `${b.x},${b.y}`)
  );
}
