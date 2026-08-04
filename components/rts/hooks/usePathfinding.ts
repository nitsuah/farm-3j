/**
 * usePathfinding — sub-hook that re-runs A* paths for workers and enemies
 * when the terrain or buildings change.
 *
 * Extracted from useGameLoop.tsx as part of the large-file componentization.
 * Currently a skeleton placeholder.
 *
 * Responsibilities (to be filled in):
 *  - Recalculate worker paths when buildings are placed or destroyed
 *  - Recalculate enemy paths when walls are built or destroyed
 *  - Attack-move path selection for workers
 *  - Patrol-path step advancement
 *  - Waypoint system (multi-point movement orders)
 */

import type { RTSGameContext } from './context';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function usePathfinding(_ctx: RTSGameContext): void {
  // TODO: migrate pathfinding recalc from useGameLoop.tsx
}
