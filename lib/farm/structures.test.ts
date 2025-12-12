import { describe, it, expect } from 'vitest';
import { createFence, createTrough, createFencePerimeter } from './structures';
import { GAME_CONFIG } from './constants';

describe('createFence', () => {
  it('creates fence with correct type and position', () => {
    const fence = createFence(5, 10);

    expect(fence.type).toBe('fence');
    expect(fence.gridX).toBe(5);
    expect(fence.gridY).toBe(10);
  });

  it('creates horizontal fence by default', () => {
    const fence = createFence(5, 10);

    expect(fence.orientation).toBe('horizontal');
    expect(fence.width).toBe(60);
    expect(fence.height).toBe(10);
  });

  it('creates vertical fence when specified', () => {
    const fence = createFence(5, 10, 'vertical');

    expect(fence.orientation).toBe('vertical');
    expect(fence.width).toBe(10);
    expect(fence.height).toBe(60);
  });

  it('sets health to 100', () => {
    const fence = createFence(5, 10);
    expect(fence.health).toBe(100);
  });

  it('generates ID with correct format', () => {
    const fence = createFence(5, 10);

    expect(fence.id).toContain('fence-5-10');
    expect(fence.id).toMatch(/^fence-5-10-\d+$/);
  });

  it('converts grid position to percentage coordinates', () => {
    const fence = createFence(5, 10);

    expect(fence.x).toBeDefined();
    expect(fence.y).toBeDefined();
    expect(typeof fence.x).toBe('number');
    expect(typeof fence.y).toBe('number');
  });
});

describe('createTrough', () => {
  it('creates trough with correct type and position', () => {
    const trough = createTrough(8, 12);

    expect(trough.type).toBe('trough');
    expect(trough.gridX).toBe(8);
    expect(trough.gridY).toBe(12);
  });

  it('sets dimensions correctly', () => {
    const trough = createTrough(8, 12);

    expect(trough.width).toBe(40);
    expect(trough.height).toBe(30);
  });

  it('starts with full food level', () => {
    const trough = createTrough(8, 12);

    expect(trough.foodLevel).toBe(GAME_CONFIG.TROUGH_CAPACITY);
  });

  it('generates ID with correct format', () => {
    const trough = createTrough(8, 12);

    expect(trough.id).toContain('trough-8-12');
    expect(trough.id).toMatch(/^trough-8-12-\d+$/);
  });

  it('converts grid position to percentage coordinates', () => {
    const trough = createTrough(8, 12);

    expect(trough.x).toBeDefined();
    expect(trough.y).toBeDefined();
    expect(typeof trough.x).toBe('number');
    expect(typeof trough.y).toBe('number');
  });
});

describe('createFencePerimeter', () => {
  it('returns an array of fences', () => {
    const fences = createFencePerimeter();

    expect(Array.isArray(fences)).toBe(true);
    expect(fences.length).toBeGreaterThan(0);
    expect(fences.every(f => f.type === 'fence')).toBe(true);
  });

  it('creates top horizontal fences', () => {
    const fences = createFencePerimeter();
    const topFences = fences.filter(
      f => f.gridY === 2 && f.orientation === 'horizontal'
    );

    expect(topFences.length).toBe(16); // x from 2 to 17 inclusive
    expect(
      topFences.every(
        f => f.gridX !== undefined && f.gridX >= 2 && f.gridX <= 17
      )
    ).toBe(true);
  });

  it('creates bottom horizontal fences', () => {
    const fences = createFencePerimeter();
    const bottomFences = fences.filter(
      f => f.gridY === 17 && f.orientation === 'horizontal'
    );

    expect(bottomFences.length).toBe(16);
    expect(
      bottomFences.every(
        f => f.gridX !== undefined && f.gridX >= 2 && f.gridX <= 17
      )
    ).toBe(true);
  });

  it('creates left vertical fences', () => {
    const fences = createFencePerimeter();
    const leftFences = fences.filter(
      f => f.gridX === 2 && f.orientation === 'vertical'
    );

    expect(leftFences.length).toBe(14); // y from 3 to 16 inclusive
    expect(
      leftFences.every(
        f => f.gridY !== undefined && f.gridY >= 3 && f.gridY <= 16
      )
    ).toBe(true);
  });

  it('creates right vertical fences', () => {
    const fences = createFencePerimeter();
    const rightFences = fences.filter(
      f => f.gridX === 17 && f.orientation === 'vertical'
    );

    expect(rightFences.length).toBe(14);
    expect(
      rightFences.every(
        f => f.gridY !== undefined && f.gridY >= 3 && f.gridY <= 16
      )
    ).toBe(true);
  });

  it('creates complete perimeter with correct total count', () => {
    const fences = createFencePerimeter();

    // Top: 16, Bottom: 16, Left: 14, Right: 14 = 60 total
    expect(fences.length).toBe(60);
  });

  it('all fences have health set to 100', () => {
    const fences = createFencePerimeter();

    expect(fences.every(f => f.health === 100)).toBe(true);
  });
});
