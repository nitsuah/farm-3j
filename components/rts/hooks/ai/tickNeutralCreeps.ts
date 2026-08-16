import type { HeroItemId, WorkerState } from '../../game/types';
import {
  CREEP_AGGRO_RANGE,
  CREEP_ATTACK_MS,
  CREEP_CAMPS,
  CREEP_DAMAGE,
  CREEP_LEASH_RANGE,
  CREEP_SPEED,
  HERO_ITEM_DATA,
} from '../../game/constants';
import { tileDist } from '../../game/map';
import type { RTSGameContext } from '../context';

export function tickNeutralCreeps(ctx: RTSGameContext, dt: number): void {
  const {
    creepAttackTimeoutsRef,
    blacksmithUpgradesRef,
    dropItemIdRef,
    campClearedAtRef,
    workersRef,
    setNeutralCreeps,
    setClearedCamps,
    setResources,
    setDroppedItems,
    setWorkers,
    addFloatingText,
  } = ctx;

  // Update neutral creeps
  setNeutralCreeps(creeps => {
    const alive = creeps.filter(c => c.hp > 0);
    const killed = creeps.filter(c => c.hp <= 0);
    if (killed.length > 0) {
      // Check if any camp is now fully cleared
      CREEP_CAMPS.forEach(camp => {
        const campAlive = alive.filter(c => c.campId === camp.id);
        if (
          campAlive.length === 0 &&
          killed.some(c => c.campId === camp.id)
        ) {
          setClearedCamps(s => {
            if (s.has(camp.id)) return s;
            const n = new Set(s);
            n.add(camp.id);
            return n;
          });
          campClearedAtRef.current[camp.id] = Date.now();
          setResources(r => ({ ...r, gold: r.gold + camp.goldReward }));
          addFloatingText(
            camp.x,
            camp.y,
            `+${camp.goldReward}🪙 Camp!`,
            '#fbbf24'
          );
          if (Math.random() < 0.65) {
            const pool: HeroItemId[] = [
              'boots_speed',
              'battle_sword',
              'shield_pendant',
              'healing_potion',
            ];
            const pick = pool[Math.floor(Math.random() * pool.length)]!;
            setDroppedItems(ds => [
              ...ds,
              {
                id: dropItemIdRef.current++,
                itemId: pick,
                x: camp.x,
                y: camp.y + 1,
              },
            ]);
            addFloatingText(
              camp.x,
              camp.y,
              `📦 ${HERO_ITEM_DATA[pick].emoji} Item!`,
              '#c084fc'
            );
          }
        }
      });
      killed.forEach(c => {
        if (creepAttackTimeoutsRef.current[c.id]) {
          clearTimeout(creepAttackTimeoutsRef.current[c.id]);
          delete creepAttackTimeoutsRef.current[c.id];
        }
      });
    }
    return alive.map(c => {
      const workers2 = workersRef.current;
      // Leash: if too far from home, return
      const distHome = tileDist(c.x, c.y, c.homeX, c.homeY);
      if (distHome > CREEP_LEASH_RANGE) {
        return {
          ...c,
          state: 'returning' as const,
          targetWorkerId: null,
          x:
            c.x +
            ((c.homeX - c.x) / distHome) *
              Math.min(CREEP_SPEED * dt, distHome),
          y:
            c.y +
            ((c.homeY - c.y) / distHome) *
              Math.min(CREEP_SPEED * dt, distHome),
        };
      }
      // Aggro nearest worker in range
      const aggro = workers2.reduce<WorkerState | null>((best, w) => {
        const d = tileDist(c.x, c.y, w.x, w.y);
        if (d > CREEP_AGGRO_RANGE) return best;
        if (!best || d < tileDist(c.x, c.y, best.x, best.y)) return w;
        return best;
      }, null);
      if (aggro) {
        const distW = tileDist(c.x, c.y, aggro.x, aggro.y);
        if (distW <= 1.4) {
          if (!creepAttackTimeoutsRef.current[c.id]) {
            const wid = aggro.id;
            const capturedX = Math.round(aggro.x),
              capturedY = Math.round(aggro.y);
            creepAttackTimeoutsRef.current[c.id] = window.setTimeout(() => {
              delete creepAttackTimeoutsRef.current[c.id];
              const creepDmg = Math.max(
                1,
                CREEP_DAMAGE - blacksmithUpgradesRef.current.ironHide * 2
              );
              setWorkers(ws2 =>
                ws2.map(w2 =>
                  w2.id === wid
                    ? { ...w2, hp: Math.max(0, w2.hp - creepDmg) }
                    : w2
                )
              );
              addFloatingText(
                capturedX,
                capturedY,
                `-${creepDmg}`,
                '#a855f7'
              );
            }, CREEP_ATTACK_MS);
          }
          return {
            ...c,
            state: 'chasing' as const,
            targetWorkerId: aggro.id,
          };
        }
        const dx2 = aggro.x - c.x,
          dy2 = aggro.y - c.y;
        const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        return {
          ...c,
          state: 'chasing' as const,
          targetWorkerId: aggro.id,
          x: c.x + (dx2 / d2) * Math.min(CREEP_SPEED * dt, d2),
          y: c.y + (dy2 / d2) * Math.min(CREEP_SPEED * dt, d2),
        };
      }
      // Return home if no aggro
      if (c.state === 'chasing' || c.state === 'returning') {
        if (distHome < 0.15)
          return {
            ...c,
            state: 'idle' as const,
            targetWorkerId: null,
            x: c.homeX,
            y: c.homeY,
          };
        const dx3 = c.homeX - c.x,
          dy3 = c.homeY - c.y;
        const d3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
        return {
          ...c,
          state: 'returning' as const,
          targetWorkerId: null,
          x: c.x + (dx3 / d3) * Math.min(CREEP_SPEED * dt, d3),
          y: c.y + (dy3 / d3) * Math.min(CREEP_SPEED * dt, d3),
        };
      }
      return c;
    });
  });
}
