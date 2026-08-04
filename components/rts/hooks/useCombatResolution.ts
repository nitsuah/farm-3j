/**
 * useCombatResolution — sub-hook for melee combat resolution between units.
 *
 * Extracted from useGameLoop.tsx as part of the large-file componentization.
 * Currently a skeleton placeholder.
 *
 * Responsibilities (to be filled in):
 *  - Worker melee attacks vs grunts / enemy barn / enemy towers / walls
 *  - Grunt melee attacks vs player barn / workers / buildings
 *  - Catapult AoE splash
 *  - Trebuchet long-range barrage
 *  - Cavalry trample damage
 *  - Swordsman charge ability
 *  - Hero Rallying Cry, Battle Shout, Earthquake
 *  - Death and loot-crate spawning
 */

import type { RTSGameContext } from './context';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useCombatResolution(_ctx: RTSGameContext): void {
  // TODO: migrate combat-resolution loop from useGameLoop.tsx
}
