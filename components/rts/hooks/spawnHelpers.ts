/**
 * Pure computation functions for wave spawning.
 * These are extracted from useWaveSpawner.tsx to enable unit testing
 * without requiring a full React hook environment.
 */

import {
  GRUNT_MAX_HP,
  GRUNT_HP_PER_WAVE,
  GRUNT_COUNT_CAP,
  GRUNT_COUNT_BASE,
  GRUNT_DOUBLE_ASSAULT_BONUS,
} from '../game/constants';

/**
 * Computes the HP of a grunt for the given wave number and difficulty multiplier.
 * Scales linearly: base HP + 10 per wave (after wave 1), then multiplied by difficulty.
 */
export function computeGruntHp(wave: number, diffHpMult: number): number {
  return Math.round(
    (GRUNT_MAX_HP + (wave - 1) * GRUNT_HP_PER_WAVE) * diffHpMult
  );
}

/**
 * Computes the base number of grunts to spawn this wave (before flanking).
 * Adds GRUNT_DOUBLE_ASSAULT_BONUS on every 3rd wave as a "double assault".
 */
export function computeGruntCount(wave: number): number {
  const baseCount: number = Math.min(
    GRUNT_COUNT_CAP,
    GRUNT_COUNT_BASE + Math.floor(wave / 5)
  );
  return wave % 3 === 0 ? baseCount + GRUNT_DOUBLE_ASSAULT_BONUS : baseCount;
}
