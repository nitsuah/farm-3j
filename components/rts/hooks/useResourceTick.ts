/**
 * useResourceTick — sub-hook for passive resource income ticks.
 *
 * Extracted from useGameLoop.tsx as part of the large-file componentization.
 * Currently a skeleton placeholder; logic will be migrated from useGameLoop
 * incrementally.
 *
 * Responsibilities (to be filled in):
 *  - Windmill gold income (every 5 s)
 *  - Lumber Shed gather-speed bonus application
 *  - Granary and farmhouse food-cap recalculation
 *  - Mining Camp and Lumber Shed drop-off bonuses
 *  - Player barn passive regen
 */

import type { RTSGameContext } from './context';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useResourceTick(_ctx: RTSGameContext): void {
  // TODO: migrate resource-tick loop from useGameLoop.tsx
}
