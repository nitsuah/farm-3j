'use client';
import { useMemo, useRef } from 'react';
import type React from 'react';

import {
  BARN_POS,
  BUILDING_COSTS,
  BUILDING_MAX_HP,
  ENEMY_BARN_POS,
  GRID_SIZE,
} from '../game/constants';
import { INITIAL_TILES } from '../game/map';
import { aStar } from '../game/pathfinding';
import type { RTSGameContext } from './context';
import { type BotCommands, type BotSnapshot } from './useBotController';
import { makeWorker } from './useRTSGameState';

/**
 * Produces the stable BotCommands object consumed by useBotController.
 * The memo deps are intentionally empty — all closure values are stable refs
 * or setters that never change identity after mount.
 */
export function useBotCommands(
  ctx: RTSGameContext,
  buildingIdRef: React.MutableRefObject<number>,
  botSnapshotRef: React.MutableRefObject<BotSnapshot | null>
): BotCommands {
  const {
    goldMinesRef,
    treesRef,
    stoneNodesRef,
    placedBuildingsRef,
    setWorkers,
    setResources,
    setPlacedBuildings,
    setTrainingQueue,
    tiles,
  } = ctx;

  // Monotonically-increasing counter avoids O(n) max scan inside state setters.
  // Start at 10_000 to avoid collisions with player worker IDs (typically 1–10).
  const nextWorkerIdRef = useRef(10_000);

  return useMemo<BotCommands>(
    () => ({
      orderGather: (workerId, resourceType, resourceIdx) => {
        const nodes =
          resourceType === 'gold'
            ? goldMinesRef.current
            : resourceType === 'tree'
              ? treesRef.current
              : stoneNodesRef.current;
        const node = nodes[resourceIdx];
        if (!node) return;
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            const dest = { x: node.x, y: node.y };
            const path = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              dest
            );
            return {
              ...w,
              movingTo: path[0] ?? dest,
              path: path.slice(1),
              gathering: { type: resourceType, idx: resourceIdx },
              attacking: null,
              state: 'moving' as const,
              selected: false,
            };
          })
        );
      },

      orderAttack: (workerId, target) => {
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            return {
              ...w,
              attacking: target,
              gathering: null,
              movingTo: null,
              path: [],
              state: 'attacking' as const,
              selected: false,
            };
          })
        );
      },

      orderMove: (workerId, tx, ty) => {
        setWorkers(ws =>
          ws.map(w => {
            if (w.id !== workerId || w.hp <= 0) return w;
            const dest = { x: tx, y: ty };
            const path = aStar(
              INITIAL_TILES,
              { x: Math.round(w.x), y: Math.round(w.y) },
              dest
            );
            return {
              ...w,
              movingTo: path[0] ?? dest,
              path: path.slice(1),
              attacking: null,
              gathering: null,
              state: 'moving' as const,
              selected: false,
            };
          })
        );
      },

      buildAt: (type, tx, ty) => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        const cost = BUILDING_COSTS[type];
        if (!cost) return false;
        if (tx < 0 || ty < 0 || tx >= GRID_SIZE || ty >= GRID_SIZE)
          return false;
        if (
          snap.resources.gold < cost.gold ||
          snap.resources.lumber < cost.lumber ||
          snap.resources.stone < cost.stone
        )
          return false;
        const occupied =
          (tx === BARN_POS.x && ty === BARN_POS.y) ||
          (tx === ENEMY_BARN_POS.x && ty === ENEMY_BARN_POS.y) ||
          tiles[tx]?.[ty] === 'water' ||
          tiles[tx]?.[ty] === 'tree' ||
          tiles[tx]?.[ty] === 'rock' ||
          placedBuildingsRef.current.some(b => b.x === tx && b.y === ty) ||
          treesRef.current.some(
            t => t.x === tx && t.y === ty && t.amount > 0
          ) ||
          goldMinesRef.current.some(
            m => m.x === tx && m.y === ty && m.amount > 0
          ) ||
          stoneNodesRef.current.some(
            s => s.x === tx && s.y === ty && s.amount > 0
          );
        if (occupied) return false;
        setResources(r => ({
          ...r,
          gold: r.gold - cost.gold,
          lumber: r.lumber - cost.lumber,
          stone: r.stone - cost.stone,
        }));
        setPlacedBuildings(bs => [
          ...bs,
          {
            id: buildingIdRef.current++,
            type,
            x: tx,
            y: ty,
            hp: 1,
            maxHp: BUILDING_MAX_HP[type] ?? 100,
            constructing: true,
            constructedAt: Date.now(),
          },
        ]);
        return true;
      },

      trainFarmer: () => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        if (
          snap.resources.gold < 30 ||
          snap.resources.food >= snap.resources.foodCap
        )
          return false;
        if (!snap.farmhouse.built) return false;
        setResources(r => ({ ...r, gold: r.gold - 30, food: r.food + 1 }));
        const newId = nextWorkerIdRef.current++;
        setWorkers(ws => [...ws, makeWorker(newId, BARN_POS.x, BARN_POS.y)]);
        return true;
      },

      trainSwordsman: () => {
        const snap = botSnapshotRef.current;
        if (!snap) return false;
        if (
          snap.resources.gold < 50 ||
          snap.resources.food >= snap.resources.foodCap
        )
          return false;
        setResources(r => ({ ...r, gold: r.gold - 50, food: r.food + 1 }));
        setTrainingQueue(q => [...q, { type: 'swordsman' }]);
        return true;
      },
    }),
    // deps intentionally empty — botCommands is stable (all closure values are
    // stable refs / setters that never change identity after mount)
    []
  );
}
