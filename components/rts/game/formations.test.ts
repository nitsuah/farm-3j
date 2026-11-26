import { describe, expect, it } from 'vitest';
import { getFormationOffsets, getFormationTargets } from './formations';

describe('formation helpers', () => {
  it('returns no offsets for non-positive counts', () => {
    expect(getFormationOffsets('line', 0)).toEqual([]);
    expect(getFormationOffsets('wedge', -2)).toEqual([]);
    expect(getFormationOffsets('box', 0)).toEqual([]);
  });

  it('centers odd and even line formations consistently', () => {
    expect(getFormationOffsets('line', 3)).toEqual([
      { dx: -1, dy: 0 }, { dx: 0, dy: 0 }, { dx: 1, dy: 0 },
    ]);
    expect(getFormationOffsets('line', 4)).toEqual([
      { dx: -1, dy: 0 }, { dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 },
    ]);
  });

  it('fills box rows without adding extra units', () => {
    expect(getFormationOffsets('box', 5)).toEqual([
      { dx: -1, dy: 0 }, { dx: 0, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: 1 }, { dx: 0, dy: 1 },
    ]);
  });

  it('builds a partial final wedge row symmetrically', () => {
    expect(getFormationOffsets('wedge', 5)).toEqual([
      { dx: 0, dy: 0 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
      { dx: -2, dy: 2 }, { dx: 0, dy: 2 },
    ]);
  });

  it('clamps every target to the grid at both edges', () => {
    expect(getFormationTargets('line', { x: 0, y: 0 }, 3, 5)).toEqual([
      { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
    ]);
    expect(getFormationTargets('line', { x: 4, y: 4 }, 3, 5)).toEqual([
      { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 4 },
    ]);
  });
});
