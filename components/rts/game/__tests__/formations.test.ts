import { describe, it, expect } from 'vitest';

import { getFormationOffsets, type FormationKind } from '../formations';

const kinds: FormationKind[] = ['line', 'wedge', 'box'];

describe('getFormationOffsets', () => {
  it('line with 3 units centers around zero', () => {
    expect(getFormationOffsets('line', 3)).toEqual([
      { dx: -1, dy: 0 },
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
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
