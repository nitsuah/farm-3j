/**
 * Isometric coordinate transformation utilities
 * Converts between screen coordinates and isometric grid coordinates
 */

export interface GridCoordinates {
  gridX: number;
  gridY: number;
}

export interface ScreenCoordinates {
  screenX: number;
  screenY: number;
}

export const GRID_CONFIG = {
  TILE_WIDTH: 64, // Width of isometric tile in pixels
  TILE_HEIGHT: 32, // Height of isometric tile in pixels
  GRID_ROWS: 20,
  GRID_COLS: 20,
  OFFSET_X: 400, // Center the grid on screen
  OFFSET_Y: 50,
};

/**
 * Convert grid coordinates to screen coordinates (isometric projection)
 */
export function gridToScreen(gridX: number, gridY: number): ScreenCoordinates {
  const screenX =
    (gridX - gridY) * (GRID_CONFIG.TILE_WIDTH / 2) + GRID_CONFIG.OFFSET_X;
  const screenY =
    (gridX + gridY) * (GRID_CONFIG.TILE_HEIGHT / 2) + GRID_CONFIG.OFFSET_Y;

  return { screenX, screenY };
}

/**
 * Convert screen coordinates to grid coordinates
 */
export function screenToGrid(
  screenX: number,
  screenY: number
): GridCoordinates {
  const relX = screenX - GRID_CONFIG.OFFSET_X;
  const relY = screenY - GRID_CONFIG.OFFSET_Y;

  const gridX =
    relX / (GRID_CONFIG.TILE_WIDTH / 2) + relY / (GRID_CONFIG.TILE_HEIGHT / 2);
  const gridY =
    relY / (GRID_CONFIG.TILE_HEIGHT / 2) - relX / (GRID_CONFIG.TILE_WIDTH / 2);

  return {
    gridX: Math.floor(gridX / 2),
    gridY: Math.floor(gridY / 2),
  };
}

/**
 * Check if grid coordinates are within bounds
 */
export function isValidGridPosition(gridX: number, gridY: number): boolean {
  return (
    gridX >= 0 &&
    gridX < GRID_CONFIG.GRID_COLS &&
    gridY >= 0 &&
    gridY < GRID_CONFIG.GRID_ROWS
  );
}

/**
 * Calculate z-index for proper depth sorting in isometric view
 */
export function calculateZIndex(gridX: number, gridY: number): number {
  return gridX + gridY;
}

/**
 * Get percentage-based position from grid coordinates (for current entity system)
 */
export function gridToPercent(
  gridX: number,
  gridY: number
): {
  x: number;
  y: number;
} {
  const { screenX, screenY } = gridToScreen(gridX, gridY);
  // Assuming canvas is 1200x800
  return {
    x: (screenX / 1200) * 100,
    y: (screenY / 800) * 100,
  };
}

/**
 * Snap entity position to nearest grid tile
 */
export function snapToGrid(x: number, y: number): { x: number; y: number } {
  // Convert percentage to screen coords (assuming 1200x800 canvas)
  const screenX = (x / 100) * 1200;
  const screenY = (y / 100) * 800;

  // Convert to grid and back to get snapped position
  const { gridX, gridY } = screenToGrid(screenX, screenY);
  return gridToPercent(gridX, gridY);
}
