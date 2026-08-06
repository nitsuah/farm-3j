import { describe, it, expect } from 'vitest';
import {
  computeGruntHp,
  computeGruntCount,
  buildWallSet,
} from '../spawnHelpers';
import type { PlacedBuilding } from '../../game/types';
import { GRUNT_MAX_HP } from '../../game/constants';

describe('computeGruntHp', () => {
  it('returns base HP on wave 1 with no difficulty multiplier', () => {
    expect(computeGruntHp(1, 1)).toBe(GRUNT_MAX_HP);
  });

  it('increases HP by 10 per wave', () => {
    expect(computeGruntHp(2, 1)).toBe(GRUNT_MAX_HP + 10);
    expect(computeGruntHp(5, 1)).toBe(GRUNT_MAX_HP + 40);
    expect(computeGruntHp(10, 1)).toBe(GRUNT_MAX_HP + 90);
  });

  it('applies difficulty multiplier', () => {
    const wave3Base = GRUNT_MAX_HP + 20; // wave 3 → +2*10
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
    expect(computeGruntCount(0)).toBe(3); // base=1, +2 bonus fires
  });

  it('returns base + 2 on every 3rd wave', () => {
    // Wave 3: base = min(6, 1 + floor(3/5)) = 1, count = 1 + 2 = 3
    expect(computeGruntCount(3)).toBe(3);
    // Wave 6: base = min(6, 1 + 1) = 2, count = 2 + 2 = 4
    expect(computeGruntCount(6)).toBe(4);
  });

  it('scales base count with wave number', () => {
    // Wave 5: base = min(6, 1 + 1) = 2, not divisible by 3 → 2
    expect(computeGruntCount(5)).toBe(2);
    // Wave 10: base = min(6, 1 + 2) = 3, not divisible by 3 → 3
    expect(computeGruntCount(10)).toBe(3);
    // Wave 25: base = min(6, 1 + 5) = 6, not divisible by 3 → 6
    expect(computeGruntCount(25)).toBe(6);
  });

  it('caps base count at 6', () => {
    // Wave 30: base = min(6, 1 + 6) = 6, divisible by 3 → 8
    expect(computeGruntCount(30)).toBe(8);
    // Wave 100: base = min(6, 1 + 20) = 6
    expect(computeGruntCount(100)).toBe(6);
  });
});

describe('buildWallSet', () => {
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
    expect(buildWallSet([]).size).toBe(0);
  });

  it('returns an empty set when there are no walls', () => {
    const buildings = [makeBuilding(1, 'farmhouse', 5, 5)];
    expect(buildWallSet(buildings).size).toBe(0);
  });

  it('includes completed walls', () => {
    const buildings = [
      makeBuilding(1, 'wall', 3, 4),
      makeBuilding(2, 'wall', 7, 2),
    ];
    const set = buildWallSet(buildings);
    expect(set.size).toBe(2);
    expect(set.has('3,4')).toBe(true);
    expect(set.has('7,2')).toBe(true);
  });

  it('includes walls that are still constructing (pathfinding still blocks)', () => {
    const buildings = [makeBuilding(1, 'wall', 5, 5, true)];
    // The original code includes all walls regardless of constructing state
    const set = buildWallSet(buildings);
    expect(set.has('5,5')).toBe(true);
  });

  it('excludes non-wall buildings', () => {
    const buildings = [
      makeBuilding(1, 'farmhouse', 1, 1),
      makeBuilding(2, 'barracks', 2, 2),
      makeBuilding(3, 'wall', 3, 3),
    ];
    const set = buildWallSet(buildings);
    expect(set.size).toBe(1);
    expect(set.has('3,3')).toBe(true);
  });
});
