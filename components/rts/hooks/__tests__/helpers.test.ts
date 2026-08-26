import { describe, expect, it } from 'vitest';

import {
  GRUNT_COUNT_BASE,
  GRUNT_COUNT_CAP,
  GRUNT_DOUBLE_ASSAULT_BONUS,
  GRUNT_HP_PER_WAVE,
  GRUNT_MAX_HP,
  WATCHTOWER_ATTACK_RANGE,
  WATCHTOWER_DAMAGE,
  WATCHTOWER_GARRISON_DAMAGE_PER,
  WATCHTOWER_GARRISON_RANGE_PER,
  WATCHTOWER_GUARD_DAMAGE_BONUS,
  WATCHTOWER_GUARD_RANGE_BONUS,
} from '../../game/constants';
import { computeGruntCount, computeGruntHp } from '../spawnHelpers';
import {
  computeWatchtowerDamage,
  computeWatchtowerRange,
  findNearestInRange,
} from '../towerHelpers';

// ── computeGruntHp ────────────────────────────────────────────────────────────

describe('computeGruntHp', () => {
  it('wave 1 with multiplier 1 equals GRUNT_MAX_HP', () => {
    expect(computeGruntHp(1, 1)).toBe(GRUNT_MAX_HP);
  });

  it('wave 2 with multiplier 1 adds one GRUNT_HP_PER_WAVE', () => {
    expect(computeGruntHp(2, 1)).toBe(GRUNT_MAX_HP + GRUNT_HP_PER_WAVE);
  });

  it('wave 5 with multiplier 1 adds 4 × GRUNT_HP_PER_WAVE', () => {
    expect(computeGruntHp(5, 1)).toBe(GRUNT_MAX_HP + 4 * GRUNT_HP_PER_WAVE);
  });

  it('scales by diffHpMult', () => {
    const base = GRUNT_MAX_HP + GRUNT_HP_PER_WAVE; // wave 2
    expect(computeGruntHp(2, 1.5)).toBe(Math.round(base * 1.5));
  });

  it('rounds the result', () => {
    // Pick a multiplier that would produce a fractional value before rounding
    const raw = (GRUNT_MAX_HP + 0 * GRUNT_HP_PER_WAVE) * 1.3; // wave 1, mult 1.3
    expect(computeGruntHp(1, 1.3)).toBe(Math.round(raw));
  });

  it('easy difficulty (0.8 mult) gives lower HP', () => {
    expect(computeGruntHp(1, 0.8)).toBeLessThan(GRUNT_MAX_HP);
  });
});

// ── computeGruntCount ─────────────────────────────────────────────────────────

describe('computeGruntCount', () => {
  it('wave 1 returns base count (no double assault)', () => {
    // wave 1: base = min(CAP, BASE + floor(1/5)) = min(6,1) = 1; not %3
    expect(computeGruntCount(1)).toBe(
      Math.min(GRUNT_COUNT_CAP, GRUNT_COUNT_BASE + Math.floor(1 / 5))
    );
  });

  it('wave 3 includes GRUNT_DOUBLE_ASSAULT_BONUS', () => {
    const base = Math.min(
      GRUNT_COUNT_CAP,
      GRUNT_COUNT_BASE + Math.floor(3 / 5)
    );
    expect(computeGruntCount(3)).toBe(base + GRUNT_DOUBLE_ASSAULT_BONUS);
  });

  it('wave 6 includes GRUNT_DOUBLE_ASSAULT_BONUS', () => {
    const base = Math.min(
      GRUNT_COUNT_CAP,
      GRUNT_COUNT_BASE + Math.floor(6 / 5)
    );
    expect(computeGruntCount(6)).toBe(base + GRUNT_DOUBLE_ASSAULT_BONUS);
  });

  it('wave 4 does not include GRUNT_DOUBLE_ASSAULT_BONUS', () => {
    const base = Math.min(
      GRUNT_COUNT_CAP,
      GRUNT_COUNT_BASE + Math.floor(4 / 5)
    );
    expect(computeGruntCount(4)).toBe(base);
  });

  it('never exceeds GRUNT_COUNT_CAP + GRUNT_DOUBLE_ASSAULT_BONUS', () => {
    for (let w = 1; w <= 50; w++) {
      expect(computeGruntCount(w)).toBeLessThanOrEqual(
        GRUNT_COUNT_CAP + GRUNT_DOUBLE_ASSAULT_BONUS
      );
    }
  });

  it('non-double-assault count is non-decreasing over waves', () => {
    // Skip wave pairs that straddle a double-assault (every 3rd wave gets a bonus),
    // since a non-bonus wave can be lower than the preceding bonus wave.
    for (let w = 1; w < 50; w++) {
      if ((w + 1) % 3 === 0 || w % 3 === 0) continue;
      expect(computeGruntCount(w + 1)).toBeGreaterThanOrEqual(
        computeGruntCount(w)
      );
    }
  });
});

// ── findNearestInRange ────────────────────────────────────────────────────────

describe('findNearestInRange', () => {
  it('returns null when no units provided', () => {
    expect(findNearestInRange([], 5, 5, 3)).toBeNull();
  });

  it('returns null when all units are out of range', () => {
    const units = [
      { x: 0, y: 0, hp: 10 },
      { x: 20, y: 20, hp: 10 },
    ];
    expect(findNearestInRange(units, 5, 5, 1)).toBeNull();
  });

  it('returns null when units are in range but hp ≤ 0', () => {
    const units = [{ x: 5, y: 5, hp: 0 }];
    expect(findNearestInRange(units, 5, 5, 3)).toBeNull();
  });

  it('returns the only in-range unit', () => {
    const unit = { x: 5, y: 6, hp: 10 };
    expect(findNearestInRange([unit], 5, 5, 2)).toBe(unit);
  });

  it('returns the nearest of two in-range units', () => {
    const near = { x: 5, y: 6, hp: 10 };
    const far = { x: 5, y: 8, hp: 10 };
    expect(findNearestInRange([far, near], 5, 5, 5)).toBe(near);
  });

  it('ignores dead units even when closer', () => {
    const dead = { x: 5, y: 6, hp: 0 };
    const alive = { x: 5, y: 8, hp: 10 };
    expect(findNearestInRange([dead, alive], 5, 5, 5)).toBe(alive);
  });

  it('respects the range parameter exactly', () => {
    // Unit at distance 3; range=3 → included, range=2 → excluded
    const unit = { x: 5, y: 8, hp: 10 }; // tileDist from (5,5) to (5,8) = 3
    expect(findNearestInRange([unit], 5, 5, 3)).toBe(unit);
    expect(findNearestInRange([unit], 5, 5, 2)).toBeNull();
  });
});

// ── computeWatchtowerDamage ───────────────────────────────────────────────────

describe('computeWatchtowerDamage', () => {
  it('base damage when isGuard=false and no garrison', () => {
    expect(computeWatchtowerDamage(false, 0)).toBe(WATCHTOWER_DAMAGE);
  });

  it('adds WATCHTOWER_GUARD_DAMAGE_BONUS when isGuard=true', () => {
    expect(computeWatchtowerDamage(true, 0)).toBe(
      WATCHTOWER_DAMAGE + WATCHTOWER_GUARD_DAMAGE_BONUS
    );
  });

  it('adds WATCHTOWER_GARRISON_DAMAGE_PER per garrisoned unit', () => {
    expect(computeWatchtowerDamage(false, 3)).toBe(
      WATCHTOWER_DAMAGE + 3 * WATCHTOWER_GARRISON_DAMAGE_PER
    );
  });

  it('stacks guard bonus and garrison bonus', () => {
    expect(computeWatchtowerDamage(true, 2)).toBe(
      WATCHTOWER_DAMAGE +
        WATCHTOWER_GUARD_DAMAGE_BONUS +
        2 * WATCHTOWER_GARRISON_DAMAGE_PER
    );
  });
});

// ── computeWatchtowerRange ────────────────────────────────────────────────────

describe('computeWatchtowerRange', () => {
  it('base range when isGuard=false and no garrison', () => {
    expect(computeWatchtowerRange(false, 0)).toBe(WATCHTOWER_ATTACK_RANGE);
  });

  it('adds WATCHTOWER_GUARD_RANGE_BONUS when isGuard=true', () => {
    expect(computeWatchtowerRange(true, 0)).toBe(
      WATCHTOWER_ATTACK_RANGE + WATCHTOWER_GUARD_RANGE_BONUS
    );
  });

  it('adds WATCHTOWER_GARRISON_RANGE_PER per garrisoned unit', () => {
    expect(computeWatchtowerRange(false, 4)).toBe(
      WATCHTOWER_ATTACK_RANGE + 4 * WATCHTOWER_GARRISON_RANGE_PER
    );
  });

  it('stacks guard and garrison range bonuses', () => {
    expect(computeWatchtowerRange(true, 2)).toBe(
      WATCHTOWER_ATTACK_RANGE +
        WATCHTOWER_GUARD_RANGE_BONUS +
        2 * WATCHTOWER_GARRISON_RANGE_PER
    );
  });
});
