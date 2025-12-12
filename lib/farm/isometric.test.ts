import { describe, it, expect } from 'vitest';
import {
  gridToScreen,
  screenToGrid,
  isValidGridPosition,
  calculateZIndex,
  GRID_CONFIG,
} from './isometric';

describe('Isometric Utilities', () => {
  describe('Grid Configuration', () => {
    it('has correct tile dimensions', () => {
      expect(GRID_CONFIG.TILE_WIDTH).toBe(64);
      expect(GRID_CONFIG.TILE_HEIGHT).toBe(32);
    });

    it('has 20x20 grid', () => {
      expect(GRID_CONFIG.GRID_ROWS).toBe(20);
      expect(GRID_CONFIG.GRID_COLS).toBe(20);
    });

    it('has offset for centering', () => {
      expect(GRID_CONFIG.OFFSET_X).toBe(400);
      expect(GRID_CONFIG.OFFSET_Y).toBe(100);
    });
  });

  describe('gridToScreen', () => {
    it('converts origin grid to screen coordinates', () => {
      const result = gridToScreen(0, 0);

      expect(result.screenX).toBe(GRID_CONFIG.OFFSET_X);
      expect(result.screenY).toBe(GRID_CONFIG.OFFSET_Y);
    });

    it('converts grid position to isometric screen coordinates', () => {
      const result = gridToScreen(1, 0);

      // Moving +1 in gridX moves right by TILE_WIDTH/2
      expect(result.screenX).toBe(GRID_CONFIG.OFFSET_X + 32);
      expect(result.screenY).toBe(GRID_CONFIG.OFFSET_Y + 16);
    });

    it('handles negative grid coordinates', () => {
      const result = gridToScreen(-1, -1);

      expect(result.screenX).toBe(GRID_CONFIG.OFFSET_X);
      expect(result.screenY).toBe(GRID_CONFIG.OFFSET_Y - 32);
    });

    it('converts center of grid', () => {
      const result = gridToScreen(10, 10);

      // At grid center, should be at screen offset (since 10-10 = 0)
      expect(result.screenX).toBe(GRID_CONFIG.OFFSET_X);
      expect(result.screenY).toBe(GRID_CONFIG.OFFSET_Y + 320); // (10+10) * 16
    });
  });

  describe('screenToGrid', () => {
    it('converts screen origin back to grid', () => {
      const result = screenToGrid(GRID_CONFIG.OFFSET_X, GRID_CONFIG.OFFSET_Y);

      expect(result.gridX).toBe(0);
      expect(result.gridY).toBe(0);
    });

    it('converts screen coordinates to grid', () => {
      const screen = gridToScreen(5, 3);
      const grid = screenToGrid(screen.screenX, screen.screenY);

      expect(grid.gridX).toBe(5);
      expect(grid.gridY).toBe(3);
    });

    it('floors grid coordinates', () => {
      // Test with coordinates that would result in fractional grid values
      const result = screenToGrid(
        GRID_CONFIG.OFFSET_X + 20,
        GRID_CONFIG.OFFSET_Y + 20
      );

      expect(Number.isInteger(result.gridX)).toBe(true);
      expect(Number.isInteger(result.gridY)).toBe(true);
    });

    it('handles screen coordinates outside grid', () => {
      const result = screenToGrid(0, 0);

      expect(typeof result.gridX).toBe('number');
      expect(typeof result.gridY).toBe('number');
    });
  });

  describe('Roundtrip Conversion', () => {
    it('grid -> screen -> grid preserves coordinates', () => {
      const originalGridX = 8;
      const originalGridY = 12;

      const screen = gridToScreen(originalGridX, originalGridY);
      const grid = screenToGrid(screen.screenX, screen.screenY);

      expect(grid.gridX).toBe(originalGridX);
      expect(grid.gridY).toBe(originalGridY);
    });

    it('works for multiple grid positions', () => {
      const positions = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 15 },
        { x: 19, y: 19 },
      ];

      positions.forEach(pos => {
        const screen = gridToScreen(pos.x, pos.y);
        const grid = screenToGrid(screen.screenX, screen.screenY);

        expect(grid.gridX).toBe(pos.x);
        expect(grid.gridY).toBe(pos.y);
      });
    });
  });

  describe('isValidGridPosition', () => {
    it('returns true for valid positions', () => {
      expect(isValidGridPosition(0, 0)).toBe(true);
      expect(isValidGridPosition(10, 10)).toBe(true);
      expect(isValidGridPosition(19, 19)).toBe(true);
    });

    it('returns false for negative coordinates', () => {
      expect(isValidGridPosition(-1, 0)).toBe(false);
      expect(isValidGridPosition(0, -1)).toBe(false);
      expect(isValidGridPosition(-5, -5)).toBe(false);
    });

    it('returns false for out of bounds coordinates', () => {
      expect(isValidGridPosition(20, 10)).toBe(false);
      expect(isValidGridPosition(10, 20)).toBe(false);
      expect(isValidGridPosition(25, 25)).toBe(false);
    });

    it('handles boundary positions', () => {
      expect(isValidGridPosition(0, 19)).toBe(true);
      expect(isValidGridPosition(19, 0)).toBe(true);
      expect(isValidGridPosition(0, 20)).toBe(false);
      expect(isValidGridPosition(20, 0)).toBe(false);
    });
  });

  describe('calculateZIndex', () => {
    it('calculates z-index for depth sorting', () => {
      expect(calculateZIndex(0, 0)).toBe(0);
      expect(calculateZIndex(5, 5)).toBe(10);
      expect(calculateZIndex(10, 10)).toBe(20);
    });

    it('higher grid positions have higher z-index', () => {
      const z1 = calculateZIndex(5, 5);
      const z2 = calculateZIndex(10, 10);

      expect(z2).toBeGreaterThan(z1);
    });

    it('same total coordinates have same z-index', () => {
      expect(calculateZIndex(3, 7)).toBe(calculateZIndex(7, 3));
      expect(calculateZIndex(0, 10)).toBe(calculateZIndex(10, 0));
    });

    it('creates proper ordering for isometric view', () => {
      // Objects further "back" (lower gridX+gridY) should have lower z-index
      const back = calculateZIndex(0, 0);
      const middle = calculateZIndex(5, 5);
      const front = calculateZIndex(10, 10);

      expect(back).toBeLessThan(middle);
      expect(middle).toBeLessThan(front);
    });
  });
});
