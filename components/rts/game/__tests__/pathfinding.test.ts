import { describe, it, expect } from 'vitest';

import { GRID_SIZE } from '../constants';
import { aStar } from '../pathfinding';
import type { TileType } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeGrid(size = GRID_SIZE, fill: TileType = 'grass'): TileType[][] {
  return Array.from(
    { length: size },
    () => Array(size).fill(fill) as TileType[]
  );
}

// ── aStar ─────────────────────────────────────────────────────────────────────

describe('aStar', () => {
  it('returns an empty path when start equals goal', () => {
    const tiles = makeGrid();
    expect(aStar(tiles, { x: 5, y: 5 }, { x: 5, y: 5 })).toHaveLength(0);
  });

  it('returns a single step for directly adjacent tiles', () => {
    const tiles = makeGrid();
    const result = aStar(tiles, { x: 5, y: 5 }, { x: 5, y: 6 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 5, y: 6 });
  });

  it('path ends at the goal', () => {
    const tiles = makeGrid();
    const result = aStar(tiles, { x: 0, y: 0 }, { x: 10, y: 5 });
    expect(result.at(-1)).toEqual({ x: 10, y: 5 });
  });

  it('path does not include the start tile', () => {
    const tiles = makeGrid();
    const result = aStar(tiles, { x: 3, y: 3 }, { x: 7, y: 7 });
    const hasStart = result.some(p => p.x === 3 && p.y === 3);
    expect(hasStart).toBe(false);
  });

  it('uses diagonal movement (path length ≤ Chebyshev distance)', () => {
    const tiles = makeGrid();
    const result = aStar(tiles, { x: 0, y: 0 }, { x: 4, y: 4 });
    // Chebyshev = max(|4-0|, |4-0|) = 4; diagonals reduce step count
    expect(result.length).toBeLessThanOrEqual(4);
    expect(result.at(-1)).toEqual({ x: 4, y: 4 });
  });

  it('routes around a water wall via an opening', () => {
    const tiles = makeGrid();
    // Vertical wall at x=5, all y except y=0 → opening at top
    for (let y = 1; y < GRID_SIZE; y++) {
      tiles[5]![y] = 'water';
    }
    const result = aStar(tiles, { x: 4, y: 5 }, { x: 6, y: 5 });
    // Should find a path that goes around via y=0
    expect(result.at(-1)).toEqual({ x: 6, y: 5 });
    // Path should not contain any water tile
    const passesWall = result.some(
      p => p.x === 5 && p.y >= 1 && p.y < GRID_SIZE
    );
    expect(passesWall).toBe(false);
  });

  it('falls back to [goal] when fully surrounded by water', () => {
    const tiles = makeGrid();
    // Surround start (3,3) with water on all 8 neighbors
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        tiles[3 + dx]![3 + dy] = 'water';
      }
    }
    const result = aStar(tiles, { x: 3, y: 3 }, { x: 10, y: 10 });
    expect(result).toEqual([{ x: 10, y: 10 }]);
  });

  it('allowPassThroughGoal=true lets path reach a water goal tile', () => {
    const tiles = makeGrid();
    tiles[5]![5] = 'water';
    const result = aStar(tiles, { x: 4, y: 4 }, { x: 5, y: 5 }, true);
    expect(result.at(-1)).toEqual({ x: 5, y: 5 });
  });

  it('allowPassThroughGoal=false cannot reach a water goal (falls back)', () => {
    const tiles = makeGrid();
    // Completely block goal AND surroundings so no path exists
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        tiles[5 + dx]![5 + dy] = 'water';
      }
    }
    // With allowPassThroughGoal=false the goal is impassable → fallback
    const result = aStar(tiles, { x: 3, y: 3 }, { x: 5, y: 5 }, false);
    expect(result).toEqual([{ x: 5, y: 5 }]);
  });

  it('respects extraBlocked — routes around a blocked tile', () => {
    const tiles = makeGrid();
    const blocked = new Set(['5,5']);
    const result = aStar(tiles, { x: 4, y: 4 }, { x: 6, y: 6 }, true, blocked);
    // Should not pass through (5,5)
    expect(result.some(p => p.x === 5 && p.y === 5)).toBe(false);
    expect(result.at(-1)).toEqual({ x: 6, y: 6 });
  });

  it('prefers diagonal when both orthogonal and diagonal are open', () => {
    const tiles = makeGrid();
    const result = aStar(tiles, { x: 0, y: 0 }, { x: 3, y: 3 });
    // Pure diagonal route is 3 steps; orthogonal would be 6
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('every step in the path is within grid bounds', () => {
    const tiles = makeGrid();
    const result = aStar(tiles, { x: 1, y: 1 }, { x: 20, y: 15 });
    for (const p of result) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThan(GRID_SIZE);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThan(GRID_SIZE);
    }
  });

  it('does not throw for an out-of-bounds goal', () => {
    const tiles = makeGrid();
    expect(() => aStar(tiles, { x: 5, y: 5 }, { x: -1, y: -1 })).not.toThrow();
  });

  it('handles a very short path of 2 steps correctly', () => {
    const tiles = makeGrid();
    const result = aStar(tiles, { x: 0, y: 0 }, { x: 0, y: 2 });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ x: 0, y: 1 });
    expect(result[1]).toEqual({ x: 0, y: 2 });
  });
});
