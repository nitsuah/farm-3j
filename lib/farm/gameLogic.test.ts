import { describe, it, expect } from 'vitest';
import {
  GRID_SIZE,
  CELL_SIZE,
  toGridCoords,
  toPercentCoords,
  isInBounds,
  checkFenceCollision,
  getFenceBounds,
  getDistance,
  checkCollision,
  moveTowards,
  updateAnimalNeeds,
  findNearestTrough,
  canFeedFromTrough,
  feedAnimal,
} from './gameLogic';
import { Entity } from './types';

describe('GameLogic', () => {
  describe('Grid Conversion Functions', () => {
    it('converts percentage to grid coordinates correctly', () => {
      const result = toGridCoords(50, 50);
      expect(result.gridX).toBe(10); // 50 / 5 = 10
      expect(result.gridY).toBe(10);
    });

    it('converts grid edges correctly', () => {
      const topLeft = toGridCoords(0, 0);
      expect(topLeft.gridX).toBe(0);
      expect(topLeft.gridY).toBe(0);

      const bottomRight = toGridCoords(95, 95);
      expect(bottomRight.gridX).toBe(19); // 95 / 5 = 19
      expect(bottomRight.gridY).toBe(19);
    });

    it('converts grid coordinates to percentage correctly', () => {
      const result = toPercentCoords(10, 10);
      expect(result.x).toBe(52.5); // 10 * 5 + 2.5
      expect(result.y).toBe(52.5);
    });

    it('centers percentage coordinates in grid cells', () => {
      const result = toPercentCoords(0, 0);
      expect(result.x).toBe(2.5); // Center of first cell
      expect(result.y).toBe(2.5);
    });
  });

  describe('Bounds Checking', () => {
    it('returns true for positions within bounds', () => {
      expect(isInBounds(50, 50)).toBe(true);
      expect(isInBounds(10, 80)).toBe(true);
      expect(isInBounds(90, 20)).toBe(true);
    });

    it('returns false for positions at boundaries', () => {
      expect(isInBounds(0, 50)).toBe(false);
      expect(isInBounds(100, 50)).toBe(false);
      expect(isInBounds(50, 0)).toBe(false);
      expect(isInBounds(50, 100)).toBe(false);
    });

    it('returns false for positions outside bounds', () => {
      expect(isInBounds(4.9, 50)).toBe(false);
      expect(isInBounds(95.1, 50)).toBe(false);
      expect(isInBounds(50, 4.9)).toBe(false);
      expect(isInBounds(50, 95.1)).toBe(false);
    });

    it('allows positions at boundary edges (5 and 95)', () => {
      expect(isInBounds(5, 50)).toBe(true);
      expect(isInBounds(95, 50)).toBe(true);
      expect(isInBounds(50, 5)).toBe(true);
      expect(isInBounds(50, 95)).toBe(true);
    });
  });

  describe('Fence Bounds', () => {
    it('returns correct fence boundaries', () => {
      const bounds = getFenceBounds();
      expect(bounds.minX).toBe(15); // 3 * 5
      expect(bounds.maxX).toBe(85); // 17 * 5
      expect(bounds.minY).toBe(15);
      expect(bounds.maxY).toBe(85);
    });

    it('fence bounds create inner perimeter', () => {
      const bounds = getFenceBounds();
      expect(bounds.maxX - bounds.minX).toBe(70); // Inner area width
      expect(bounds.maxY - bounds.minY).toBe(70); // Inner area height
    });
  });

  describe('Fence Collision Detection', () => {
    const mockAnimal: Entity = {
      id: 'test-cow',
      type: 'cow',
      x: 50,
      y: 50,
    };

    it('detects collision with nearby fence', () => {
      const fences: Entity[] = [
        {
          id: 'fence-1',
          type: 'fence',
          x: 52,
          y: 52,
          gridX: 10,
          gridY: 10,
        },
      ];

      const collision = checkFenceCollision(mockAnimal, fences);
      expect(collision).toBeTruthy();
      expect(collision?.id).toBe('fence-1');
    });

    it('returns null when no fences nearby', () => {
      const fences: Entity[] = [
        {
          id: 'fence-1',
          type: 'fence',
          x: 10,
          y: 10,
          gridX: 2,
          gridY: 2,
        },
      ];

      const collision = checkFenceCollision(mockAnimal, fences);
      expect(collision).toBeNull();
    });

    it('handles fences without grid coordinates', () => {
      const fences: Entity[] = [
        {
          id: 'fence-1',
          type: 'fence',
          x: 50,
          y: 50,
        },
      ];

      const collision = checkFenceCollision(mockAnimal, fences);
      expect(collision).toBeNull();
    });

    it('returns first collision when multiple fences near', () => {
      const fences: Entity[] = [
        {
          id: 'fence-1',
          type: 'fence',
          x: 51,
          y: 51,
          gridX: 10,
          gridY: 10,
        },
        {
          id: 'fence-2',
          type: 'fence',
          x: 52,
          y: 52,
          gridX: 10,
          gridY: 10,
        },
      ];

      const collision = checkFenceCollision(mockAnimal, fences);
      expect(collision).toBeTruthy();
      expect(collision?.id).toBe('fence-1');
    });
  });

  describe('Distance Calculation', () => {
    it('calculates distance between two entities', () => {
      const entity1: Entity = { id: '1', type: 'cow', x: 0, y: 0 };
      const entity2: Entity = { id: '2', type: 'cow', x: 3, y: 4 };

      const distance = getDistance(entity1, entity2);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('returns 0 for entities at same position', () => {
      const entity1: Entity = { id: '1', type: 'cow', x: 50, y: 50 };
      const entity2: Entity = { id: '2', type: 'cow', x: 50, y: 50 };

      const distance = getDistance(entity1, entity2);
      expect(distance).toBe(0);
    });

    it('calculates distance with floating point coordinates', () => {
      const entity1: Entity = { id: '1', type: 'cow', x: 10.5, y: 20.5 };
      const entity2: Entity = { id: '2', type: 'cow', x: 11.5, y: 21.5 };

      const distance = getDistance(entity1, entity2);
      expect(distance).toBeCloseTo(Math.sqrt(2), 2);
    });
  });

  describe('Collision Detection', () => {
    it('detects collision when entities are close', () => {
      const entity1: Entity = { id: '1', type: 'cow', x: 50, y: 50 };
      const entity2: Entity = { id: '2', type: 'cow', x: 52, y: 52 };

      const collision = checkCollision(entity1, entity2, 5);
      expect(collision).toBe(true);
    });

    it('no collision when entities are far apart', () => {
      const entity1: Entity = { id: '1', type: 'cow', x: 10, y: 10 };
      const entity2: Entity = { id: '2', type: 'cow', x: 50, y: 50 };

      const collision = checkCollision(entity1, entity2, 5);
      expect(collision).toBe(false);
    });

    it('respects custom threshold', () => {
      const entity1: Entity = { id: '1', type: 'cow', x: 50, y: 50 };
      const entity2: Entity = { id: '2', type: 'cow', x: 58, y: 50 };

      expect(checkCollision(entity1, entity2, 5)).toBe(false);
      expect(checkCollision(entity1, entity2, 10)).toBe(true);
    });

    it('collision at exact threshold distance', () => {
      const entity1: Entity = { id: '1', type: 'cow', x: 0, y: 0 };
      const entity2: Entity = { id: '2', type: 'cow', x: 3, y: 4 };

      // Distance is exactly 5
      expect(checkCollision(entity1, entity2, 5)).toBe(false); // < threshold
      expect(checkCollision(entity1, entity2, 5.1)).toBe(true); // >= threshold
    });
  });

  describe('Movement Functions', () => {
    it('moves towards target in correct direction', () => {
      const result = moveTowards(0, 0, 10, 0, 5);

      expect(result.x).toBeGreaterThan(0);
      expect(result.y).toBe(0); // No Y movement
      expect(result.x).toBeLessThanOrEqual(5); // Should not overshoot speed
    });

    it('does not overshoot target', () => {
      const result = moveTowards(0, 0, 2, 0, 5);

      expect(result.x).toBe(2); // Should reach target exactly
      expect(result.y).toBe(0);
    });

    it('moves diagonally correctly', () => {
      const result = moveTowards(0, 0, 10, 10, 5);

      // Should move towards (10, 10) but not exceed speed of 5
      expect(result.x).toBeGreaterThan(0);
      expect(result.y).toBeGreaterThan(0);

      const distance = Math.sqrt(result.x ** 2 + result.y ** 2);
      expect(distance).toBeLessThanOrEqual(5.1); // Small margin for floating point
    });

    it('stays put when already at target', () => {
      const result = moveTowards(10, 10, 10, 10, 5);

      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
    });

    it('handles negative coordinates', () => {
      const result = moveTowards(10, 10, -10, -10, 5);

      expect(result.x).toBeLessThan(10);
      expect(result.y).toBeLessThan(10);
    });
  });

  describe('Constants', () => {
    it('has correct grid size', () => {
      expect(GRID_SIZE).toBe(20);
    });

    it('has correct cell size', () => {
      expect(CELL_SIZE).toBe(5);
    });

    it('grid and cell sizes create 100% coverage', () => {
      expect(GRID_SIZE * CELL_SIZE).toBe(100);
    });
  });
});

// Import additional functions for Phase 2 testing
import { wander, updateTime, shouldAdvanceDay } from './gameLogic';

describe('GameLogic - Advanced Functions', () => {
  describe('Wander Behavior', () => {
    it('moves animal in current direction', () => {
      const result = wander(50, 50, 0, 1, 1);

      expect(result.x).not.toBe(50);
      expect(result.hitFence).toBe(false);
    });

    it('bounces off boundaries', () => {
      // Position near right edge, moving right
      const result = wander(94, 50, 0, 5, 1);

      expect(result.x).toBeLessThanOrEqual(95);
    });

    it('uses custom fence bounds when provided', () => {
      const fenceBounds = {
        minX: 15,
        maxX: 85,
        minY: 15,
        maxY: 85,
      };

      const result = wander(14, 50, Math.PI, 2, 1, fenceBounds);

      expect(result.x).toBeGreaterThanOrEqual(fenceBounds.minX);
      expect(result.hitFence).toBe(true);
    });

    it('stays within bounds after movement', () => {
      const result = wander(50, 50, 0, 10, 1);

      expect(result.x).toBeGreaterThanOrEqual(5);
      expect(result.x).toBeLessThanOrEqual(95);
      expect(result.y).toBeGreaterThanOrEqual(5);
      expect(result.y).toBeLessThanOrEqual(95);
    });
  });

  describe('Time Progression', () => {
    it('advances time based on delta', () => {
      const newTime = updateTime(10, 1);
      expect(newTime).toBeGreaterThan(10);
    });

    it('wraps around to 0 after 24 hours', () => {
      const newTime = updateTime(23.5, 10);
      expect(newTime).toBeLessThan(24);
      expect(newTime).toBeGreaterThanOrEqual(0);
    });

    it('returns time with 2 decimal precision', () => {
      const newTime = updateTime(10.123456, 1);
      const decimals = newTime.toString().split('.')[1];
      expect(decimals ? decimals.length : 0).toBeLessThanOrEqual(2);
    });
  });

  describe('Day Advancement', () => {
    it('detects day change when time wraps', () => {
      expect(shouldAdvanceDay(23.5, 0.5)).toBe(true);
    });

    it('does not advance day during normal time progression', () => {
      expect(shouldAdvanceDay(10, 11)).toBe(false);
      expect(shouldAdvanceDay(5, 10)).toBe(false);
    });

    it('handles midnight boundary', () => {
      expect(shouldAdvanceDay(23.9, 0.1)).toBe(true);
    });
  });
});

describe('updateAnimalNeeds', () => {
  it('returns null for non-animal entities', () => {
    const fence = { id: '1', type: 'fence' as const, x: 50, y: 50 };
    expect(updateAnimalNeeds(fence, 10)).toBeNull();
  });

  it('initializes needs with defaults when not set', () => {
    const cow = {
      id: '1',
      type: 'cow' as const,
      x: 50,
      y: 50,
      lastNeedUpdate: 0,
    };
    const result = updateAnimalNeeds(cow, 1); // 1 hour elapsed

    expect(result).not.toBeNull();
    // Should initialize hunger to 0 and happiness to 100, then update
    expect(result!.hunger).toBeGreaterThan(0);
    expect(result!.happiness).toBeLessThan(100);
  });

  it('returns null if not enough time has passed', () => {
    const cow = {
      id: '1',
      type: 'cow' as const,
      x: 50,
      y: 50,
      hunger: 10,
      happiness: 90,
      lastNeedUpdate: 10,
    };
    const result = updateAnimalNeeds(cow, 10.05);

    expect(result).toBeNull();
  });

  it('increases hunger over time', () => {
    const cow = {
      id: '1',
      type: 'cow' as const,
      x: 50,
      y: 50,
      hunger: 10,
      happiness: 90,
      lastNeedUpdate: 0,
    };
    const result = updateAnimalNeeds(cow, 1);

    expect(result).not.toBeNull();
    expect(result!.hunger).toBeGreaterThan(10);
  });

  it('decreases happiness over time', () => {
    const pig = {
      id: '1',
      type: 'pig' as const,
      x: 50,
      y: 50,
      hunger: 10,
      happiness: 90,
      lastNeedUpdate: 0,
    };
    const result = updateAnimalNeeds(pig, 1);

    expect(result).not.toBeNull();
    expect(result!.happiness).toBeLessThan(90);
  });

  it('happiness decays faster when hungry', () => {
    const hungryChicken = {
      id: '1',
      type: 'chicken' as const,
      x: 50,
      y: 50,
      hunger: 80,
      happiness: 90,
      lastNeedUpdate: 0,
    };
    const result = updateAnimalNeeds(hungryChicken, 1);

    expect(result).not.toBeNull();
    expect(result!.happiness).toBeLessThan(90); // Should decay from 90
  });

  it('caps hunger at 100', () => {
    const sheep = {
      id: '1',
      type: 'sheep' as const,
      x: 50,
      y: 50,
      hunger: 95,
      happiness: 50,
      lastNeedUpdate: 0,
    };
    const result = updateAnimalNeeds(sheep, 10);

    expect(result!.hunger).toBe(100);
  });

  it('caps happiness at 0', () => {
    const cow = {
      id: '1',
      type: 'cow' as const,
      x: 50,
      y: 50,
      hunger: 90,
      happiness: 5,
      lastNeedUpdate: 0,
    };
    const result = updateAnimalNeeds(cow, 10);

    expect(result!.happiness).toBe(0);
  });
});

describe('findNearestTrough', () => {
  it('returns null when no troughs available', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50 };
    expect(findNearestTrough(animal, [])).toBeNull();
  });

  it('returns null when all troughs are empty', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50 };
    const troughs = [
      { id: '2', type: 'trough' as const, x: 40, y: 40, foodLevel: 0 },
      { id: '3', type: 'trough' as const, x: 60, y: 60, foodLevel: 0 },
    ];
    expect(findNearestTrough(animal, troughs)).toBeNull();
  });

  it('returns nearest trough with food', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50 };
    const troughs = [
      { id: '2', type: 'trough' as const, x: 40, y: 40, foodLevel: 10 },
      { id: '3', type: 'trough' as const, x: 55, y: 55, foodLevel: 20 },
    ];
    const nearest = findNearestTrough(animal, troughs);
    expect(nearest!.id).toBe('3');
  });

  it('ignores non-trough entities', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50 };
    const entities = [
      { id: '2', type: 'fence' as const, x: 40, y: 40 },
      { id: '3', type: 'trough' as const, x: 60, y: 60, foodLevel: 10 },
    ];
    const nearest = findNearestTrough(animal, entities);
    expect(nearest!.id).toBe('3');
  });
});

describe('canFeedFromTrough', () => {
  it('returns false if trough is too far', () => {
    const animal = { id: '1', type: 'cow' as const, x: 10, y: 10 };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 90,
      y: 90,
      foodLevel: 10,
    };
    expect(canFeedFromTrough(animal, trough)).toBe(false);
  });

  it('returns false if trough is empty', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50 };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 52,
      y: 52,
      foodLevel: 0,
    };
    expect(canFeedFromTrough(animal, trough)).toBe(false);
  });

  it('returns true if trough is close and has food', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50 };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 52,
      y: 52,
      foodLevel: 10,
    };
    expect(canFeedFromTrough(animal, trough)).toBe(true);
  });
});

describe('feedAnimal', () => {
  it('returns null if animal cannot feed from trough', () => {
    const animal = { id: '1', type: 'cow' as const, x: 10, y: 10, hunger: 50 };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 90,
      y: 90,
      foodLevel: 10,
    };
    expect(feedAnimal(animal, trough)).toBeNull();
  });

  it('reduces animal hunger when feeding', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50, hunger: 50 };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 52,
      y: 52,
      foodLevel: 20,
    };
    const result = feedAnimal(animal, trough);

    expect(result).not.toBeNull();
    expect(result!.animal.hunger).toBeLessThan(50);
  });

  it('reduces trough food level when feeding', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50, hunger: 50 };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 52,
      y: 52,
      foodLevel: 20,
    };
    const result = feedAnimal(animal, trough);

    expect(result!.trough.foodLevel).toBeLessThan(20);
  });

  it('increases animal happiness when feeding', () => {
    const animal = {
      id: '1',
      type: 'cow' as const,
      x: 50,
      y: 50,
      hunger: 50,
      happiness: 50,
    };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 52,
      y: 52,
      foodLevel: 20,
    };
    const result = feedAnimal(animal, trough);

    expect(result!.animal.happiness).toBeGreaterThan(50);
  });

  it('sets isFeeding flag to true', () => {
    const animal = { id: '1', type: 'cow' as const, x: 50, y: 50, hunger: 50 };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 52,
      y: 52,
      foodLevel: 20,
    };
    const result = feedAnimal(animal, trough);

    expect(result!.animal.isFeeding).toBe(true);
  });

  it('caps happiness at 100', () => {
    const animal = {
      id: '1',
      type: 'cow' as const,
      x: 50,
      y: 50,
      hunger: 50,
      happiness: 95,
    };
    const trough = {
      id: '2',
      type: 'trough' as const,
      x: 52,
      y: 52,
      foodLevel: 20,
    };
    const result = feedAnimal(animal, trough);

    expect(result!.animal.happiness).toBe(100);
  });
});
