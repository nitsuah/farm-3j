import { describe, it, expect } from 'vitest';

import { GRID_SIZE, TILE_SIZE } from '../constants';
import { makeTiles, tileDist, tileToSvg } from '../map';
import { aStar } from '../pathfinding';
import type { TileType } from '../types';

// Complements map.test.ts and pathfinding.test.ts with exact-value, boundary,
// and path-validity (contiguity / optimality / no-path) assertions.

function makeGrid(fill: TileType = 'grass'): TileType[][] {
  return Array.from(
    { length: GRID_SIZE },
    () => Array(GRID_SIZE).fill(fill) as TileType[]
  );
}

/** Every step (including start to first waypoint) moves at most 1 tile per axis. */
function isContiguous(
  start: { x: number; y: number },
  path: { x: number; y: number }[]
): boolean {
  let prev = start;
  for (const p of path) {
    if (Math.abs(p.x - prev.x) > 1 || Math.abs(p.y - prev.y) > 1) return false;
    prev = p;
  }
  return true;
}

describe('tileDist (exact values)', () => {
  it('is zero for the same tile at the grid corners', () => {
    const n = GRID_SIZE - 1;
    expect(tileDist(0, 0, 0, 0)).toBe(0);
    expect(tileDist(n, n, n, n)).toBe(0);
  });

  it('measures the full grid diagonal corner to corner', () => {
    const n = GRID_SIZE - 1;
    expect(tileDist(0, 0, n, n)).toBeCloseTo(n * Math.SQRT2);
  });

  it('measures the full grid edge', () => {
    expect(tileDist(0, 0, GRID_SIZE - 1, 0)).toBe(GRID_SIZE - 1);
  });

  it('handles fractional (sub-tile) coordinates', () => {
    expect(tileDist(0.5, 0.5, 3.5, 4.5)).toBeCloseTo(5);
  });

  it('satisfies the triangle inequality', () => {
    const ab = tileDist(0, 0, 3, 4);
    const bc = tileDist(3, 4, 6, 4);
    const ac = tileDist(0, 0, 6, 4);
    expect(ac).toBeLessThanOrEqual(ab + bc + 1e-9);
  });
});

describe('tileToSvg (exact values)', () => {
  const originX = (GRID_SIZE * TILE_SIZE) / 2 + TILE_SIZE;

  it('maps tile (0,0) to the iso origin offset', () => {
    expect(tileToSvg(0, 0)).toEqual({ isoX: originX, isoY: TILE_SIZE / 2 });
  });

  it('moves one TILE_SIZE in isoX and half a TILE_SIZE in isoY per +tx', () => {
    const a = tileToSvg(4, 7);
    const b = tileToSvg(5, 7);
    expect(b.isoX - a.isoX).toBe(TILE_SIZE);
    expect(b.isoY - a.isoY).toBe(TILE_SIZE / 2);
  });

  it('moves -TILE_SIZE in isoX and +half a TILE_SIZE in isoY per +ty', () => {
    const a = tileToSvg(4, 7);
    const b = tileToSvg(4, 8);
    expect(b.isoX - a.isoX).toBe(-TILE_SIZE);
    expect(b.isoY - a.isoY).toBe(TILE_SIZE / 2);
  });

  it('puts diagonal tiles (tx === ty) on the vertical centre line', () => {
    expect(tileToSvg(3, 3).isoX).toBe(originX);
    expect(tileToSvg(GRID_SIZE - 1, GRID_SIZE - 1).isoX).toBe(originX);
  });

  it('places the four grid corners at the iso diamond extremes', () => {
    const n = GRID_SIZE - 1;
    expect(tileToSvg(n, 0).isoX).toBe(originX + n * TILE_SIZE);
    expect(tileToSvg(0, n).isoX).toBe(originX - n * TILE_SIZE);
    expect(tileToSvg(n, n)).toEqual({
      isoX: originX,
      isoY: n * TILE_SIZE + TILE_SIZE / 2,
    });
  });

  it('is symmetric: swapping tx and ty mirrors isoX around the centre line', () => {
    const a = tileToSvg(2, 9);
    const b = tileToSvg(9, 2);
    expect(a.isoY).toBe(b.isoY);
    expect(a.isoX + b.isoX).toBe(2 * originX);
  });
});

describe('aStar (path validity)', () => {
  it('returns an optimal diagonal-then-straight path on open ground', () => {
    const start = { x: 2, y: 2 };
    const result = aStar(makeGrid(), start, { x: 7, y: 4 });
    // 2 diagonals + 3 straights = 5 steps (Chebyshev distance)
    expect(result).toHaveLength(5);
    expect(result.at(-1)).toEqual({ x: 7, y: 4 });
    expect(isContiguous(start, result)).toBe(true);
  });

  it('finds a straight line along the map edge', () => {
    const start = { x: 0, y: 0 };
    const result = aStar(makeGrid(), start, { x: 0, y: GRID_SIZE - 1 });
    expect(result).toHaveLength(GRID_SIZE - 1);
    expect(result.every(p => p.x === 0)).toBe(true);
  });

  it('crosses the whole map corner to corner in GRID_SIZE-1 diagonal steps', () => {
    const start = { x: 0, y: 0 };
    const result = aStar(makeGrid(), start, {
      x: GRID_SIZE - 1,
      y: GRID_SIZE - 1,
    });
    expect(result).toHaveLength(GRID_SIZE - 1);
    expect(isContiguous(start, result)).toBe(true);
  });

  it('produces a contiguous, water-free path around an obstacle', () => {
    const tiles = makeGrid();
    // Horizontal water bar from x=3..9 at y=5, forcing a detour
    for (let x = 3; x <= 9; x++) tiles[x]![5] = 'water';
    const start = { x: 6, y: 3 };
    const result = aStar(tiles, start, { x: 6, y: 7 });
    expect(result.at(-1)).toEqual({ x: 6, y: 7 });
    expect(isContiguous(start, result)).toBe(true);
    expect(result.every(p => tiles[p.x]![p.y] !== 'water')).toBe(true);
    // Detour must be longer than the 4-step straight line
    expect(result.length).toBeGreaterThan(4);
  });

  it('treats tree and rock tiles as passable (only water blocks)', () => {
    const tiles = makeGrid();
    tiles[5]![5] = 'tree';
    tiles[5]![6] = 'rock';
    // Water walls on both sides make a one-tile corridor, so the only short route crosses both tiles
    for (let y = 3; y <= 8; y++) {
      tiles[4]![y] = 'water';
      tiles[6]![y] = 'water';
    }
    const result = aStar(tiles, { x: 5, y: 4 }, { x: 5, y: 7 });
    expect(result).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
    ]);
  });

  it('returns [goal] when the goal is walled off by water (no path)', () => {
    const tiles = makeGrid();
    // Ring of water around (12,12); goal inside, start outside
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx !== 0 || dy !== 0) tiles[12 + dx]![12 + dy] = 'water';
      }
    }
    const result = aStar(tiles, { x: 0, y: 0 }, { x: 12, y: 12 });
    expect(result).toEqual([{ x: 12, y: 12 }]);
  });

  it('returns [goal] when a full water wall splits the map', () => {
    const tiles = makeGrid();
    for (let y = 0; y < GRID_SIZE; y++) tiles[12]![y] = 'water';
    const result = aStar(tiles, { x: 2, y: 2 }, { x: 20, y: 20 });
    expect(result).toEqual([{ x: 20, y: 20 }]);
  });

  it('can start from every corner and never steps outside the grid', () => {
    const n = GRID_SIZE - 1;
    for (const start of [
      { x: 0, y: 0 },
      { x: n, y: 0 },
      { x: 0, y: n },
      { x: n, y: n },
    ]) {
      const result = aStar(makeGrid(), start, { x: 12, y: 12 });
      expect(result.at(-1)).toEqual({ x: 12, y: 12 });
      for (const p of result) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThan(GRID_SIZE);
        expect(p.y).toBeLessThan(GRID_SIZE);
      }
    }
  });

  it('lets the goal through even when the goal itself is in extraBlocked', () => {
    const blocked = new Set(['6,6']);
    const result = aStar(
      makeGrid(),
      { x: 5, y: 5 },
      { x: 6, y: 6 },
      true,
      blocked
    );
    expect(result).toEqual([{ x: 6, y: 6 }]);
  });

  it('is deterministic for identical inputs', () => {
    const tiles = makeTiles();
    const a = aStar(tiles, { x: 3, y: 3 }, { x: 20, y: 20 });
    const b = aStar(tiles, { x: 3, y: 3 }, { x: 20, y: 20 });
    expect(a).toEqual(b);
  });

  it('navigates the real generated map without crossing water', () => {
    const tiles = makeTiles();
    const start = { x: 4, y: 4 };
    const goal = { x: 20, y: 20 };
    const result = aStar(tiles, start, goal);
    expect(result.at(-1)).toEqual(goal);
    expect(isContiguous(start, result)).toBe(true);
    expect(result.every(p => tiles[p.x]![p.y] !== 'water')).toBe(true);
  });
});
