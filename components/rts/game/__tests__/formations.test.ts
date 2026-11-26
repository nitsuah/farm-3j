import { describe, it, expect } from 'vitest';

import {
  getFormationOffsets,
  getFormationTargets,
  type FormationKind,
  type TilePoint,
} from '../formations';

const kinds: FormationKind[] = ['line', 'wedge', 'box'];

describe('getFormationOffsets', () => {
  it('line with 3 units centers around zero', () => {
    expect(getFormationOffsets('line', 3)).toEqual([
      { dx: -1, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
    ]);
  });

  it('line with 4 units places the extra unit on the positive side', () => {
    expect(getFormationOffsets('line', 4)).toEqual([
      { dx: -1, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 2, dy: 0 },
    ]);
  });

  it('box with 5 units leaves a partial final row', () => {
    expect(getFormationOffsets('box', 5)).toEqual([
      { dx: -1, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: 1 },
    ]);
  });

  it('wedge with 5 units leaves a partial final row', () => {
    expect(getFormationOffsets('wedge', 5)).toEqual([
      { dx: 0, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
      { dx: -2, dy: 2 },
      { dx: 0, dy: 2 },
    ]);
  });

  it('box with 4 units creates 2x2 grid', () => {
    expect(getFormationOffsets('box', 4)).toEqual([
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ]);
  });

  it('wedge with 3 units creates first two rows', () => {
    expect(getFormationOffsets('wedge', 3)).toEqual([
      { dx: 0, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
    ]);
  });

  it('returns empty array for count 0', () => {
    for (const kind of kinds) {
      expect(getFormationOffsets(kind, 0)).toEqual([]);
    }
  });

  it('returns empty array for negative count', () => {
    for (const kind of kinds) {
      expect(getFormationOffsets(kind, -2)).toEqual([]);
    }
  });

  it('returns exactly count entries with all distinct dx,dy pairs for counts 1..20', () => {
    for (const kind of kinds) {
      for (let count = 1; count <= 20; count++) {
        const offsets = getFormationOffsets(kind, count);
        expect(offsets).toHaveLength(count);
        const seen = new Set<string>();
        for (const o of offsets) {
          const key = `${o.dx},${o.dy}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      }
    }
  });
});

describe('getFormationTargets', () => {
  const anchor: TilePoint = { x: 10, y: 10 };
  const gridSize = 25;

  it('line with 3 units centers around anchor', () => {
    const targets = getFormationTargets('line', anchor, 3, gridSize);
    expect(targets).toEqual([
      { x: 9, y: 10 },
      { x: 10, y: 10 },
      { x: 11, y: 10 },
    ]);
  });

  it('clamps negative coordinates at grid edge (anchor 0,0 with 3-unit line)', () => {
    const targets = getFormationTargets('line', { x: 0, y: 0 }, 3, gridSize);
    expect(targets.map(t => t.x)).toEqual([0, 0, 1]);
    expect(targets.map(t => t.y)).toEqual([0, 0, 0]);
  });

  it('clamps a line exactly at the far grid edge', () => {
    expect(getFormationTargets('line', { x: 24, y: 24 }, 3, gridSize)).toEqual([
      { x: 23, y: 24 },
      { x: 24, y: 24 },
      { x: 24, y: 24 },
    ]);
  });

  it('box of 4 at bottom-right corner (24,24) stays within 0..24', () => {
    const targets = getFormationTargets('box', { x: 24, y: 24 }, 4, gridSize);
    for (const t of targets) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(24);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThanOrEqual(24);
    }
  });

  it('count 0 returns empty array', () => {
    for (const kind of kinds) {
      expect(getFormationTargets(kind, anchor, 0, gridSize)).toEqual([]);
    }
  });

  it('length always equals count for each kind', () => {
    for (const kind of kinds) {
      for (let count = 1; count <= 20; count++) {
        expect(getFormationTargets(kind, anchor, count, gridSize)).toHaveLength(
          count
        );
      }
    }
  });
});
