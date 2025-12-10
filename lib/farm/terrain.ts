/**
 * Terrain system for grid-based farm layout
 */

export type TerrainType = 'grass' | 'dirt' | 'pond' | 'pasture';

export interface TerrainTile {
  gridX: number;
  gridY: number;
  type: TerrainType;
}

/**
 * Initialize a default terrain grid
 */
export function createDefaultTerrain(
  rows: number,
  cols: number
): TerrainTile[][] {
  const terrain: TerrainTile[][] = [];

  for (let y = 0; y < rows; y++) {
    terrain[y] = [];
    for (let x = 0; x < cols; x++) {
      // Create a pond in the middle-left area
      if (x >= 4 && x <= 7 && y >= 8 && y <= 11) {
        terrain[y]![x] = { gridX: x, gridY: y, type: 'pond' };
      }
      // Create some dirt paths
      else if (
        (x === 10 && y >= 5 && y <= 15) ||
        (y === 10 && x >= 5 && x <= 15)
      ) {
        terrain[y]![x] = { gridX: x, gridY: y, type: 'dirt' };
      }
      // Default to pasture
      else {
        terrain[y]![x] = { gridX: x, gridY: y, type: 'pasture' };
      }
    }
  }

  return terrain;
}

/**
 * Get terrain color based on type
 */
export function getTerrainColor(type: TerrainType): string {
  switch (type) {
    case 'grass':
      return '#4ade80'; // green-400
    case 'pasture':
      return '#22c55e'; // green-500
    case 'dirt':
      return '#92400e'; // amber-800
    case 'pond':
      return '#3b82f6'; // blue-500
    default:
      return '#22c55e';
  }
}

/**
 * Check if terrain type is walkable
 */
export function isWalkable(type: TerrainType): boolean {
  return type !== 'pond';
}
