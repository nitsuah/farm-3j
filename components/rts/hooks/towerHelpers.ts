/**
 * Pure computation functions for tower combat.
 * Extracted from useTowerCombat.tsx for unit testability.
 */

import {
  WATCHTOWER_ATTACK_RANGE,
  WATCHTOWER_DAMAGE,
  WATCHTOWER_GUARD_DAMAGE_BONUS,
  WATCHTOWER_GARRISON_DAMAGE_PER,
  WATCHTOWER_GUARD_RANGE_BONUS,
  WATCHTOWER_GARRISON_RANGE_PER,
} from '../game/constants';
import { tileDist } from '../game/map';

/**
 * Returns the nearest unit within range of the given tower position,
 * or null if none are in range.
 */
export function findNearestInRange<
  T extends { x: number; y: number; hp: number },
>(units: T[], tx: number, ty: number, range: number): T | null {
  const inRange = units.filter(
    u => u.hp > 0 && tileDist(u.x, u.y, tx, ty) <= range
  );
  if (inRange.length === 0) return null;
  return inRange.reduce((best, u) =>
    tileDist(u.x, u.y, tx, ty) < tileDist(best.x, best.y, tx, ty) ? u : best
  );
}

/**
 * Computes the damage dealt per shot by a watchtower, factoring in
 * whether Guard Tower research is active and how many units are garrisoned.
 */
export function computeWatchtowerDamage(
  isGuard: boolean,
  garrisonCount: number
): number {
  return (
    (isGuard
      ? WATCHTOWER_DAMAGE + WATCHTOWER_GUARD_DAMAGE_BONUS
      : WATCHTOWER_DAMAGE) +
    garrisonCount * WATCHTOWER_GARRISON_DAMAGE_PER
  );
}

/**
 * Computes the attack range of a watchtower, factoring in
 * Guard Tower research and garrison bonus.
 */
export function computeWatchtowerRange(
  isGuard: boolean,
  garrisonCount: number
): number {
  return (
    (isGuard
      ? WATCHTOWER_ATTACK_RANGE + WATCHTOWER_GUARD_RANGE_BONUS
      : WATCHTOWER_ATTACK_RANGE) +
    garrisonCount * WATCHTOWER_GARRISON_RANGE_PER
  );
}
