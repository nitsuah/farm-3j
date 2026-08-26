import { describe, it, expect } from 'vitest';

import { GRID_SIZE } from '../constants';
import {
  computeVisible,
  makeTiles,
  svgToTile,
  tileDist,
  tileToSvg,
} from '../map';

// ── tileDist ──────────────────────────────────────────────────────────────────

describe('tileDist', () => {
  it('returns 0 for identical points', () => {
    expect(tileDist(3, 4, 3, 4)).toBe(0);
    expect(tileDist(0, 0, 0, 0)).toBe(0);
  });

  it('returns 1 for horizontally adjacent tiles', () => {
    expect(tileDist(0, 0, 1, 0)).toBe(1);
    expect(tileDist(5, 3, 6, 3)).toBe(1);
  });

  it('returns 1 for vertically adjacent tiles', () => {
    expect(tileDist(0, 0, 0, 1)).toBe(1);
    expect(tileDist(4, 7, 4, 8)).toBe(1);
  });

  it('returns Euclidean distance for a 3-4-5 triple', () => {
    expect(tileDist(0, 0, 3, 4)).toBeCloseTo(5);
    expect(tileDist(0, 0, 4, 3)).toBeCloseTo(5);
  });

  it('returns sqrt(2) for a unit diagonal', () => {
    expect(tileDist(0, 0, 1, 1)).toBeCloseTo(Math.SQRT2);
    expect(tileDist(10, 10, 11, 11)).toBeCloseTo(Math.SQRT2);
  });

  it('is symmetric', () => {
    const d = tileDist(2, 7, 5, 3);
    expect(d).toBeCloseTo(tileDist(5, 3, 2, 7));
  });

  it('handles negative coordinates', () => {
    expect(tileDist(-3, -4, 0, 0)).toBeCloseTo(5);
  });
});

// ── tileToSvg / svgToTile round-trip ─────────────────────────────────────────

describe('tileToSvg', () => {
  it('returns numeric isoX and isoY', () => {
    const { isoX, isoY } = tileToSvg(0, 0);
    expect(typeof isoX).toBe('number');
    expect(typeof isoY).toBe('number');
  });

  it('produces different positions for different tiles', () => {
    const a = tileToSvg(0, 0);
    const b = tileToSvg(1, 0);
    expect(a.isoX).not.toBe(b.isoX);
  });

  it('isoX increases as tx increases (moving right along x-axis)', () => {
    const { isoX: x0 } = tileToSvg(5, 0);
    const { isoX: x1 } = tileToSvg(6, 0);
    expect(x1).toBeGreaterThan(x0);
  });

  it('isoX decreases as ty increases (moving right along y-axis)', () => {
    const { isoX: x0 } = tileToSvg(5, 0);
    const { isoX: x1 } = tileToSvg(5, 1);
    expect(x1).toBeLessThan(x0);
  });

  it('isoY increases as both tx and ty increase', () => {
    const { isoY: y0 } = tileToSvg(0, 0);
    const { isoY: y1 } = tileToSvg(1, 1);
    expect(y1).toBeGreaterThan(y0);
  });
});

describe('svgToTile', () => {
  it('round-trips tileToSvg for (0, 0)', () => {
    const { isoX, isoY } = tileToSvg(0, 0);
    const { tx, ty } = svgToTile(isoX, isoY);
    expect(tx).toBe(0);
    expect(ty).toBe(0);
  });

  it('round-trips tileToSvg for (12, 3)', () => {
    const { isoX, isoY } = tileToSvg(12, 3);
    const { tx, ty } = svgToTile(isoX, isoY);
    expect(tx).toBe(12);
    expect(ty).toBe(3);
  });

  it('round-trips tileToSvg for the last tile', () => {
    const { isoX, isoY } = tileToSvg(GRID_SIZE - 1, GRID_SIZE - 1);
    const { tx, ty } = svgToTile(isoX, isoY);
    expect(tx).toBe(GRID_SIZE - 1);
    expect(ty).toBe(GRID_SIZE - 1);
  });

  it('round-trips for several on-grid points', () => {
    const pts: [number, number][] = [
      [0, 0],
      [5, 10],
      [0, GRID_SIZE - 1],
      [GRID_SIZE - 1, 0],
      [10, 10],
    ];
    for (const [tx, ty] of pts) {
      const iso = tileToSvg(tx, ty);
      const back = svgToTile(iso.isoX, iso.isoY);
      expect(back.tx).toBe(tx);
      expect(back.ty).toBe(ty);
    }
  });
});

// ── computeVisible ────────────────────────────────────────────────────────────

describe('computeVisible', () => {
  it('returns a GRID_SIZE×GRID_SIZE boolean grid', () => {
    const result = computeVisible([]);
    expect(result.length).toBe(GRID_SIZE);
    expect(result[0]!.length).toBe(GRID_SIZE);
  });

  it('all cells are false when no sources are provided', () => {
    const result = computeVisible([]);
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        expect(result[i]![j]).toBe(false);
      }
    }
  });

  it('marks the source tile itself as visible', () => {
    const result = computeVisible([{ x: 5, y: 7, r: 0 }]);
    expect(result[5]![7]).toBe(true);
  });

  it('marks tiles within radius as visible', () => {
    const result = computeVisible([{ x: 5, y: 5, r: 1 }]);
    expect(result[5]![5]).toBe(true);
    expect(result[5]![6]).toBe(true);
    expect(result[5]![4]).toBe(true);
    expect(result[6]![5]).toBe(true);
    expect(result[4]![5]).toBe(true);
  });

  it('leaves tiles outside radius invisible', () => {
    const result = computeVisible([{ x: 5, y: 5, r: 1 }]);
    expect(result[5]![8]).toBe(false);
    expect(result[0]![0]).toBe(false);
    expect(result[10]![10]).toBe(false);
  });

  it('uses Euclidean distance: tile at exactly r is visible', () => {
    // r=2: tile at (5,7) is exactly 2 away → visible; (5,8) is 3 away → not
    const result = computeVisible([{ x: 5, y: 5, r: 2 }]);
    expect(result[5]![7]).toBe(true);
    expect(result[5]![8]).toBe(false);
  });

  it('unions multiple source regions', () => {
    const result = computeVisible([
      { x: 2, y: 2, r: 1 },
      { x: 20, y: 20, r: 1 },
    ]);
    expect(result[2]![2]).toBe(true);
    expect(result[20]![20]).toBe(true);
    // Tiles between the two sources should be invisible
    expect(result[11]![11]).toBe(false);
  });

  it('a large radius can cover the entire grid', () => {
    const result = computeVisible([{ x: 12, y: 12, r: GRID_SIZE }]);
    let anyFalse = false;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!result[i]![j]) {
          anyFalse = true;
          break;
        }
      }
    }
    expect(anyFalse).toBe(false);
  });
});

// ── makeTiles ─────────────────────────────────────────────────────────────────

describe('makeTiles', () => {
  it('returns a GRID_SIZE×GRID_SIZE array', () => {
    const tiles = makeTiles();
    expect(tiles.length).toBe(GRID_SIZE);
    for (const row of tiles) {
      expect(row.length).toBe(GRID_SIZE);
    }
  });

  it('every cell is a valid TileType', () => {
    const valid = new Set(['grass', 'dirt', 'water', 'tree', 'rock']);
    for (const row of makeTiles()) {
      for (const tile of row) {
        expect(valid.has(tile)).toBe(true);
      }
    }
  });

  it('player corner water lake is water (i 0-2, j 6-9)', () => {
    const tiles = makeTiles();
    expect(tiles[0]![6]).toBe('water');
    expect(tiles[1]![8]).toBe('water');
    expect(tiles[2]![9]).toBe('water');
  });

  it('enemy corner water lake is water (i 6-9, j 0-2)', () => {
    const tiles = makeTiles();
    expect(tiles[6]![0]).toBe('water');
    expect(tiles[8]![1]).toBe('water');
    expect(tiles[9]![2]).toBe('water');
  });

  it('dirt path column j=8 is dirt (where not overridden by water or trees)', () => {
    const tiles = makeTiles();
    for (let i = 0; i < GRID_SIZE; i++) {
      const t = tiles[i]![8];
      // rows 13–14 have tree clusters that override the dirt path
      if (t !== 'water' && t !== 'tree') {
        expect(t).toBe('dirt');
      }
    }
  });

  it('dirt path row i=12 is dirt (where not overridden by water or rocks)', () => {
    const tiles = makeTiles();
    for (let j = 0; j < GRID_SIZE; j++) {
      const t = tiles[12]![j];
      // cols 6–7 have rock clusters that override the dirt path
      if (t !== 'water' && t !== 'rock') {
        expect(t).toBe('dirt');
      }
    }
  });

  it('diagonal path (i===j, 4≤i≤20) is dirt where not water/tree/rock', () => {
    const tiles = makeTiles();
    for (let k = 4; k <= 20; k++) {
      const tile = tiles[k]![k];
      if (tile !== 'water' && tile !== 'tree' && tile !== 'rock') {
        expect(tile).toBe('dirt');
      }
    }
  });

  it('produces deterministic results on every call', () => {
    const a = makeTiles();
    const b = makeTiles();
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        expect(a[i]![j]).toBe(b[i]![j]);
      }
    }
  });
});
