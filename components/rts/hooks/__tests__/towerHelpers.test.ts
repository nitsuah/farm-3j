import { describe, it, expect } from 'vitest';
import {
  findNearestInRange,
  computeWatchtowerDamage,
  computeWatchtowerRange,
} from '../towerHelpers';
import {
  WATCHTOWER_DAMAGE,
  WATCHTOWER_ATTACK_RANGE,
} from '../../game/constants';

// Minimal unit type for findNearestInRange tests
interface TestUnit {
  x: number;
  y: number;
  hp: number;
}

const createTestUnit = (x: number, y: number, hp = 10): TestUnit => ({
  x,
  y,
  hp,
});

describe('findNearestInRange', () => {
  it('returns null when unit list is empty', () => {
    expect(findNearestInRange<TestUnit>([], 5, 5, 3)).toBeNull();
  });

  it('returns null when no units are within range', () => {
    const units = [createTestUnit(10, 10), createTestUnit(0, 0)];
    // Tower at (5,5), range 1 — neither unit qualifies
    expect(findNearestInRange(units, 5, 5, 1)).toBeNull();
  });

  it('returns the single unit that is in range', () => {
    const a = createTestUnit(5, 6); // 1 tile away from (5,5)
    const b = createTestUnit(0, 0); // out of range
    expect(findNearestInRange([a, b], 5, 5, 2)).toBe(a);
  });

  it('returns the closest unit when multiple are in range', () => {
    const close = createTestUnit(5, 6); // 1 tile from (5,5)
    const far = createTestUnit(5, 8); // 3 tiles from (5,5)
    expect(findNearestInRange([far, close], 5, 5, 5)).toBe(close);
  });

  it('ignores dead units (hp <= 0)', () => {
    const dead = createTestUnit(5, 6, 0); // 1 tile, but dead
    const alive = createTestUnit(5, 7); // 2 tiles, alive
    expect(findNearestInRange([dead, alive], 5, 5, 5)).toBe(alive);
  });

  it('returns null when only dead units are in range', () => {
    const dead = createTestUnit(5, 6, 0);
    expect(findNearestInRange([dead], 5, 5, 5)).toBeNull();
  });

  it('respects the range boundary exactly', () => {
    // tileDist is Euclidean: sqrt((dx)^2 + (dy)^2)
    const atEdge = createTestUnit(5 + 3, 5); // sqrt(9) = 3 → exactly on boundary
    const justOutside = createTestUnit(5 + 4, 5); // sqrt(16) = 4 → outside range 3
    expect(findNearestInRange([atEdge, justOutside], 5, 5, 3)).toBe(atEdge);
  });

  it('uses Euclidean not Manhattan distance for range check', () => {
    // Euclidean: sqrt(3^2 + 4^2) = 5 — inside range 5.1
    // Manhattan: 3 + 4 = 7 — would be outside range 5.1
    const diagonal = createTestUnit(5 + 3, 5 + 4);
    expect(findNearestInRange([diagonal], 5, 5, 5.1)).toBe(diagonal);
  });

  it('returns first unit in array when two are equidistant (tie-breaking)', () => {
    const first = createTestUnit(5, 8); // 3 tiles from (5,5)
    const second = createTestUnit(5, 2); // 3 tiles from (5,5)
    expect(findNearestInRange([first, second], 5, 5, 5)).toBe(first);
  });

  it('filters units with negative HP (overkill)', () => {
    const overkilled = createTestUnit(5, 6, -10);
    const alive = createTestUnit(5, 7);
    expect(findNearestInRange([overkilled, alive], 5, 5, 5)).toBe(alive);
  });
});

describe('computeWatchtowerDamage', () => {
  it('returns base damage for a regular tower with no garrison', () => {
    expect(computeWatchtowerDamage(false, 0)).toBe(WATCHTOWER_DAMAGE);
  });

  it('adds 7 damage when Guard Tower research is active', () => {
    expect(computeWatchtowerDamage(true, 0)).toBe(WATCHTOWER_DAMAGE + 7);
  });

  it('adds 4 damage per garrisoned unit', () => {
    expect(computeWatchtowerDamage(false, 3)).toBe(WATCHTOWER_DAMAGE + 12);
  });

  it('stacks Guard Tower bonus and garrison bonus', () => {
    expect(computeWatchtowerDamage(true, 2)).toBe(WATCHTOWER_DAMAGE + 7 + 8);
  });
});

describe('computeWatchtowerRange', () => {
  it('returns base range for a regular tower with no garrison', () => {
    expect(computeWatchtowerRange(false, 0)).toBe(WATCHTOWER_ATTACK_RANGE);
  });

  it('adds 1 to range when Guard Tower research is active', () => {
    expect(computeWatchtowerRange(true, 0)).toBe(WATCHTOWER_ATTACK_RANGE + 1);
  });

  it('adds 0.5 range per garrisoned unit', () => {
    expect(computeWatchtowerRange(false, 4)).toBe(WATCHTOWER_ATTACK_RANGE + 2);
  });

  it('produces fractional range with odd garrison count', () => {
    expect(computeWatchtowerRange(false, 1)).toBe(
      WATCHTOWER_ATTACK_RANGE + 0.5
    );
  });

  it('stacks Guard Tower bonus and garrison range bonus', () => {
    expect(computeWatchtowerRange(true, 2)).toBe(
      WATCHTOWER_ATTACK_RANGE + 1 + 1
    );
  });
});
