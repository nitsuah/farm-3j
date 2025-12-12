import { describe, it, expect } from 'vitest';
import {
  createDefaultTerrain,
  getTerrainColor,
  isWalkable,
  type TerrainType,
} from './terrain';

describe('createDefaultTerrain', () => {
  it('creates terrain grid with correct dimensions', () => {
    const terrain = createDefaultTerrain(20, 20);

    expect(terrain).toHaveLength(20);
    expect(terrain[0]).toHaveLength(20);
  });

  it('creates pond in middle-left area (x: 4-7, y: 8-11)', () => {
    const terrain = createDefaultTerrain(20, 20);

    expect(terrain[8]![4]!.type).toBe('pond');
    expect(terrain[11]![7]!.type).toBe('pond');
    expect(terrain[9]![5]!.type).toBe('pond');
  });

  it('creates dirt paths at x=10 (y: 5-15)', () => {
    const terrain = createDefaultTerrain(20, 20);

    expect(terrain[5]![10]!.type).toBe('dirt');
    expect(terrain[10]![10]!.type).toBe('dirt');
    expect(terrain[15]![10]!.type).toBe('dirt');
  });

  it('creates dirt paths at y=10 (x: 5-15, except pond area)', () => {
    const terrain = createDefaultTerrain(20, 20);

    // y=10 and x >= 5 and x <= 15, but avoid pond area (x: 4-7, y: 8-11)
    expect(terrain[10]![8]!.type).toBe('dirt'); // Outside pond
    expect(terrain[10]![11]!.type).toBe('dirt');
    expect(terrain[10]![15]!.type).toBe('dirt');
  });

  it('defaults to pasture outside special areas', () => {
    const terrain = createDefaultTerrain(20, 20);

    expect(terrain[0]![0]!.type).toBe('pasture');
    expect(terrain[5]![5]!.type).toBe('pasture');
    expect(terrain[19]![19]!.type).toBe('pasture');
  });

  it('sets correct gridX and gridY coordinates', () => {
    const terrain = createDefaultTerrain(10, 10);

    expect(terrain[3]![5]!.gridX).toBe(5);
    expect(terrain[3]![5]!.gridY).toBe(3);
  });

  it('handles small grid dimensions', () => {
    const terrain = createDefaultTerrain(5, 5);

    expect(terrain).toHaveLength(5);
    expect(terrain[0]).toHaveLength(5);
  });

  it('handles large grid dimensions', () => {
    const terrain = createDefaultTerrain(50, 50);

    expect(terrain).toHaveLength(50);
    expect(terrain[0]).toHaveLength(50);
  });
});

describe('getTerrainColor', () => {
  it('returns green-400 for grass', () => {
    expect(getTerrainColor('grass')).toBe('#4ade80');
  });

  it('returns green-500 for pasture', () => {
    expect(getTerrainColor('pasture')).toBe('#22c55e');
  });

  it('returns amber-800 for dirt', () => {
    expect(getTerrainColor('dirt')).toBe('#92400e');
  });

  it('returns blue-500 for pond', () => {
    expect(getTerrainColor('pond')).toBe('#3b82f6');
  });

  it('returns default green-500 for unknown types', () => {
    expect(getTerrainColor('invalid' as TerrainType)).toBe('#22c55e');
  });
});

describe('isWalkable', () => {
  it('returns true for grass', () => {
    expect(isWalkable('grass')).toBe(true);
  });

  it('returns true for pasture', () => {
    expect(isWalkable('pasture')).toBe(true);
  });

  it('returns true for dirt', () => {
    expect(isWalkable('dirt')).toBe(true);
  });

  it('returns false for pond', () => {
    expect(isWalkable('pond')).toBe(false);
  });
});
