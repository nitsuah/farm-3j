import { describe, it, expect } from 'vitest';
import { computeGruntHp, computeGruntCount } from '../spawnHelpers';
import { getWallTileSet } from '../../game/mapSelectors';
import type { PlacedBuilding } from '../../game/types';
import {
  GRUNT_MAX_HP,
  GRUNT_HP_PER_WAVE,
  GRUNT_DOUBLE_ASSAULT_BONUS,
} from '../../game/constants';

describe('computeGruntHp', () => {
  it('returns base HP on wave 1 with no difficulty multiplier', () => {
    expect(computeGruntHp(1, 1)).toBe(GRUNT_MAX_HP);
  });

  it('increases HP by GRUNT_HP_PER_WAVE per wave', () => {
    expect(computeGruntHp(2, 1)).toBe(GRUNT_MAX_HP + GRUNT_HP_PER_WAVE);
    expect(computeGruntHp(5, 1)).toBe(GRUNT_MAX_HP + 4 * GRUNT_HP_PER_WAVE);
    expect(computeGruntHp(10, 1)).toBe(GRUNT_MAX_HP + 9 * GRUNT_HP_PER_WAVE);
  });

  it('applies difficulty multiplier', () => {
    const wave3Base = GRUNT_MAX_HP + 2 * GRUNT_HP_PER_WAVE; // wave 3 → +2 ticks
    expect(computeGruntHp(3, 1.5)).toBe(Math.round(wave3Base * 1.5));
    expect(computeGruntHp(1, 2)).toBe(GRUNT_MAX_HP * 2);
  });

  it('rounds the result', () => {
    // With a multiplier that produces a decimal
    const result = computeGruntHp(1, 1.3);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(Math.round(GRUNT_MAX_HP * 1.3));
  });

  it('returns 0 HP when diffHpMult is 0 — documents formula boundary', () => {
    expect(computeGruntHp(1, 0)).toBe(0);
  });
});

describe('computeGruntCount', () => {
  it('returns 1 on wave 1 (base: 1 + floor(1/5) = 1, no double)', () => {
    expect(computeGruntCount(1)).toBe(1);
  });

  it('wave 0 hits the every-3rd-wave bonus (0 % 3 === 0) — documents known edge case', () => {
    // Wave counter is always ≥1 in the game; this documents the formula boundary
    expect(computeGruntCount(0)).toBe(1 + GRUNT_DOUBLE_ASSAULT_BONUS); // base=1, bonus fires
  });

  it('returns base + GRUNT_DOUBLE_ASSAULT_BONUS on every 3rd wave', () => {
    // Wave 3: base = min(6, 1 + floor(3/5)) = 1, count = 1 + bonus
    expect(computeGruntCount(3)).toBe(1 + GRUNT_DOUBLE_ASSAULT_BONUS);
    // Wave 6: base = min(6, 1 + 1) = 2, count = 2 + bonus
    expect(computeGruntCount(6)).toBe(2 + GRUNT_DOUBLE_ASSAULT_BONUS);
  });

  it('scales base count with wave number', () => {
    // Wave 5: base = min(6, 1 + 1) = 2, not divisible by 3 → 2
    expect(computeGruntCount(5)).toBe(2);
    // Wave 10: base = min(6, 1 + 2) = 3, not divisible by 3 → 3
    expect(computeGruntCount(10)).toBe(3);
    // Wave 25: base = min(6, 1 + 5) = 6, not divisible by 3 → 6
    expect(computeGruntCount(25)).toBe(6);
  });

  it('caps base count at GRUNT_COUNT_CAP', () => {
    // Wave 30: base hits cap, divisible by 3 → cap + bonus
    expect(computeGruntCount(30)).toBe(6 + GRUNT_DOUBLE_ASSAULT_BONUS);
    // Wave 100: base = cap, not divisible by 3
    expect(computeGruntCount(100)).toBe(6);
  });
});

describe('getWallTileSet', () => {
  const makeBuilding = (
    id: number,
    type: PlacedBuilding['type'],
    x: number,
    y: number,
    constructing: boolean = false
  ): PlacedBuilding => ({
    id,
    type,
    x,
    y,
    hp: 100,
    maxHp: 100,
    constructing,
  });

  it('returns an empty set for an empty buildings array', () => {
    expect(getWallTileSet([]).size).toBe(0);
  });

  it('returns an empty set when there are no walls', () => {
    const buildings = [makeBuilding(1, 'farmhouse', 5, 5)];
    expect(getWallTileSet(buildings).size).toBe(0);
  });

  it('includes completed walls', () => {
    const buildings = [
      makeBuilding(1, 'wall', 3, 4),
      makeBuilding(2, 'wall', 7, 2),
    ];
    const set = getWallTileSet(buildings);
    expect(set.size).toBe(2);
    expect(set.has('3,4')).toBe(true);
    expect(set.has('7,2')).toBe(true);
  });

  it('includes walls that are still constructing (pathfinding still blocks)', () => {
    const buildings = [makeBuilding(1, 'wall', 5, 5, true)];
    // The original code includes all walls regardless of constructing state
    const set = getWallTileSet(buildings);
    expect(set.has('5,5')).toBe(true);
  });

  it('excludes non-wall buildings', () => {
    const buildings = [
      makeBuilding(1, 'farmhouse', 1, 1),
      makeBuilding(2, 'barracks', 2, 2),
      makeBuilding(3, 'wall', 3, 3),
    ];
    const set = getWallTileSet(buildings);
    expect(set.size).toBe(1);
    expect(set.has('3,3')).toBe(true);
  });
});
