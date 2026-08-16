import type React from 'react';
import type { EnemyLurker } from '../../game/types';
import {
  BARN_POS,
  LURKER_ATTACK_MS,
  LURKER_DAMAGE,
  LURKER_GOLD_REWARD,
  LURKER_SPEED,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import type { RTSGameContext } from '../context';

export function tickLurkers(
  ctx: RTSGameContext,
  dt: number,
  lurkerKillCountRef: React.RefObject<number>
): void {
  const {
    lurkerAttackTimeoutsRef,
    placedBuildingsRef,
    workersRef,
    barnDmgThisWaveRef,
    setEnemyLurkers,
    setResources,
    setKillCount,
    setPlayerBarnHp,
    addFloatingText,
    addDmgLog,
    setWorkers,
    onAchievement,
  } = ctx;

  // Update Enemy Lurkers (fast flankers — chase nearest worker or march to barn)
  setEnemyLurkers((lks: EnemyLurker[]) => {
    const alive = lks.filter(lk => lk.hp > 0);
    const killed = lks.filter(lk => lk.hp <= 0);
    killed.forEach(lk => {
      lurkerKillCountRef.current += 1;
      if (lurkerKillCountRef.current >= 10) onAchievement('lurker_slayer');
      setResources(r => ({ ...r, gold: r.gold + LURKER_GOLD_REWARD }));
      setKillCount(k => k + 1);
      addFloatingText(
        Math.round(lk.x),
        Math.round(lk.y),
        `+${LURKER_GOLD_REWARD}🪙`,
        '#34d399'
      );
    });
    return alive.map(lk => {
      // Find nearest alive worker
      const nearestWorker = workersRef.current
        .filter(w => w.hp > 0)
        .reduce<(typeof workersRef.current)[0] | null>(
          (best, w) =>
            !best ||
            tileDist(lk.x, lk.y, w.x, w.y) <
              tileDist(lk.x, lk.y, best.x, best.y)
              ? w
              : best,
          null
        );
      const distToWorker = nearestWorker
        ? tileDist(lk.x, lk.y, nearestWorker.x, nearestWorker.y)
        : 999;
      const distToBarn = tileDist(lk.x, lk.y, BARN_POS.x, BARN_POS.y);

      // Attack nearest worker when adjacent
      if (nearestWorker && distToWorker <= 1.2) {
        if (!lurkerAttackTimeoutsRef.current[lk.id]) {
          const wid = nearestWorker.id;
          const capturedWX = Math.round(nearestWorker.x),
            capturedWY = Math.round(nearestWorker.y);
          const capturedLkId = lk.id;
          lurkerAttackTimeoutsRef.current[capturedLkId] = window.setTimeout(
            () => {
              delete lurkerAttackTimeoutsRef.current[capturedLkId];
              setWorkers(ws =>
                ws.map(w => {
                  if (w.id !== wid || w.hp <= 0) return w;
                  addFloatingText(
                    capturedWX,
                    capturedWY,
                    `-${LURKER_DAMAGE}`,
                    '#99f6e4'
                  );
                  return { ...w, hp: Math.max(0, w.hp - LURKER_DAMAGE) };
                })
              );
            },
            LURKER_ATTACK_MS
          );
        }
        return { ...lk, state: 'attacking' as const };
      }

      // Attack barn when adjacent (use negative id to avoid collision with worker-attack keys)
      if (distToBarn <= 1.2) {
        const barnKey = -lk.id;
        if (!lurkerAttackTimeoutsRef.current[barnKey]) {
          lurkerAttackTimeoutsRef.current[barnKey] = window.setTimeout(() => {
            delete lurkerAttackTimeoutsRef.current[barnKey];
            addDmgLog('🦇 Night Lurker', LURKER_DAMAGE);
            barnDmgThisWaveRef.current += LURKER_DAMAGE;
            setPlayerBarnHp(hp => Math.max(0, hp - LURKER_DAMAGE));
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `-${LURKER_DAMAGE}🏰`,
              '#99f6e4'
            );
          }, LURKER_ATTACK_MS);
        }
        return { ...lk, state: 'attacking' as const };
      }

      // Chase nearest worker if within 5 tiles, else march to barn
      const chaseTarget =
        nearestWorker && distToWorker <= 5
          ? {
              x: Math.round(nearestWorker.x),
              y: Math.round(nearestWorker.y),
            }
          : null;
      const dest = chaseTarget ?? BARN_POS;

      if (lk.movingTo) {
        const dx = lk.movingTo.x - lk.x,
          dy = lk.movingTo.y - lk.y;
        const distLK = Math.sqrt(dx * dx + dy * dy);
        if (distLK < 0.1) {
          const next = lk.path[0] ?? null;
          return {
            ...lk,
            x: lk.movingTo.x,
            y: lk.movingTo.y,
            movingTo: next,
            path: lk.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...lk,
          x: lk.x + (dx / distLK) * Math.min(LURKER_SPEED * dt, distLK),
          y: lk.y + (dy / distLK) * Math.min(LURKER_SPEED * dt, distLK),
          state: 'moving' as const,
        };
      }
      // Need new path — pathfind around walls
      const wallSetLK = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const pLK = aStar(
        INITIAL_TILES,
        { x: Math.round(lk.x), y: Math.round(lk.y) },
        dest,
        true,
        wallSetLK
      );
      return { ...lk, movingTo: pLK[0] ?? dest, path: pLK.slice(1) };
    });
  });
}
