/**
 * useEnemyAI — sub-hook for enemy movement and AI decision-making.
 *
 * Extracted from useGameLoop.tsx as part of the large-file componentization.
 * Currently a skeleton placeholder; logic will be migrated from useGameLoop
 * incrementally as tests are added for each extracted piece.
 *
 * Responsibilities (to be filled in):
 *  - Enemy grunt pathfinding and movement steps per animation frame
 *  - Boss behaviour (charge, stun, stomp)
 *  - Warchief war-cry and stomp
 *  - Warlord shield-bash and war-cry
 *  - Shaman healing aura
 *  - Necromancer raise-skeleton
 *  - Witch Doctor hex-cast
 *  - Troll kiting behaviour
 *  - Sapper dash and explosion
 *  - Lurker ambush logic
 *  - Neutral creep patrolling and chasing
 */

import type { RTSGameContext } from './context';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useEnemyAI(_ctx: RTSGameContext): void {
  // TODO: migrate enemy-movement loop from useGameLoop.tsx
}
