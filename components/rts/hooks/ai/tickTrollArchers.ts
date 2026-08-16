import {
  BARN_POS,
  GRID_SIZE,
  TROLL_ATTACK_MS,
  TROLL_ATTACK_RANGE,
  TROLL_DAMAGE,
  TROLL_GOLD_REWARD,
  TROLL_KITE_RANGE,
  TROLL_SPEED,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import type { RTSGameContext } from '../context';

export function tickTrollArchers(ctx: RTSGameContext, dt: number): void {
  const {
    trollAttackTimersRef,
    placedBuildingsRef,
    workersRef,
    gameOverRef,
    enemyTrollsRef,
    setEnemyTrolls,
    setResources,
    setPlayerBarnHp,
    setGameOver,
    addFloatingText,
    addDmgLog,
    addProjectile,
    setWorkers,
  } = ctx;

  // Update enemy Troll Archers
  setEnemyTrolls(ts => {
    const alive = ts.filter(t => t.hp > 0);
    const killed = ts.filter(t => t.hp <= 0);
    killed.forEach(t => {
      setResources(r => ({ ...r, gold: r.gold + TROLL_GOLD_REWARD }));
      addFloatingText(
        Math.round(t.x),
        Math.round(t.y),
        `+${TROLL_GOLD_REWARD}🪙`,
        '#fbbf24'
      );
    });
    return alive.map(t => {
      // Find nearest player unit within attack range
      const nearestWorker = workersRef.current
        .filter(w => w.hp > 0)
        .sort(
          (a, b2) =>
            tileDist(t.x, t.y, a.x, a.y) - tileDist(t.x, t.y, b2.x, b2.y)
        )[0];
      const distToWorker = nearestWorker
        ? tileDist(t.x, t.y, nearestWorker.x, nearestWorker.y)
        : 999;

      if (distToWorker <= TROLL_ATTACK_RANGE) {
        // Fire arrows at nearest worker
        if (!trollAttackTimersRef.current[t.id]) {
          const tid = t.id,
            twx = Math.round(nearestWorker!.x),
            twy = Math.round(nearestWorker!.y),
            wid = nearestWorker!.id;
          const capturedTX = Math.round(t.x),
            capturedTY = Math.round(t.y);
          trollAttackTimersRef.current[tid] = window.setTimeout(() => {
            delete trollAttackTimersRef.current[tid];
            addProjectile(capturedTX, capturedTY, twx, twy, 'arrow', 600);
            setWorkers(ws =>
              ws.map(w => {
                if (w.id !== wid || w.hp <= 0) return w;
                addFloatingText(twx, twy, `-${TROLL_DAMAGE}`, '#fca5a5');
                return { ...w, hp: Math.max(0, w.hp - TROLL_DAMAGE) };
              })
            );
          }, TROLL_ATTACK_MS);
        }
        // Kite: if worker is getting close, back away
        if (distToWorker < TROLL_KITE_RANGE) {
          const dx = t.x - nearestWorker!.x,
            dy = t.y - nearestWorker!.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = Math.max(
            0,
            Math.min(GRID_SIZE - 1, t.x + (dx / dist) * TROLL_SPEED * dt)
          );
          const ny = Math.max(
            0,
            Math.min(GRID_SIZE - 1, t.y + (dy / dist) * TROLL_SPEED * dt)
          );
          return {
            ...t,
            x: nx,
            y: ny,
            movingTo: null,
            path: [],
            state: 'kiting' as const,
          };
        }
        return { ...t, state: 'attacking' as const };
      }

      // March toward barn but stop at attack range
      const distToBarn = tileDist(t.x, t.y, BARN_POS.x, BARN_POS.y);
      if (distToBarn <= TROLL_ATTACK_RANGE) {
        // Fire at barn if no worker target
        if (!trollAttackTimersRef.current[t.id]) {
          const tid = t.id;
          const capturedTX2 = Math.round(t.x),
            capturedTY2 = Math.round(t.y);
          trollAttackTimersRef.current[tid] = window.setTimeout(() => {
            delete trollAttackTimersRef.current[tid];
            if (gameOverRef.current) return;
            if (!enemyTrollsRef.current.find(tr => tr.id === tid && tr.hp > 0))
              return;
            addProjectile(
              capturedTX2,
              capturedTY2,
              BARN_POS.x,
              BARN_POS.y,
              'arrow',
              700
            );
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `🏹-${TROLL_DAMAGE}`,
              '#fca5a5'
            );
            addDmgLog('🏹 Troll Archer', TROLL_DAMAGE);
            setPlayerBarnHp(hp => {
              const nHp = Math.max(0, hp - TROLL_DAMAGE);
              if (nHp <= 0) setGameOver('defeat');
              return nHp;
            });
          }, TROLL_ATTACK_MS);
        }
        return { ...t, state: 'attacking' as const };
      }

      if (t.movingTo) {
        const dx = t.movingTo.x - t.x,
          dy = t.movingTo.y - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = t.path[0] ?? null;
          return {
            ...t,
            x: t.movingTo.x,
            y: t.movingTo.y,
            movingTo: next,
            path: t.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...t,
          x: t.x + (dx / dist) * Math.min(TROLL_SPEED * dt, dist),
          y: t.y + (dy / dist) * Math.min(TROLL_SPEED * dt, dist),
        };
      }
      const wallSetT = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const p = aStar(
        INITIAL_TILES,
        { x: Math.round(t.x), y: Math.round(t.y) },
        BARN_POS,
        true,
        wallSetT
      );
      return {
        ...t,
        movingTo: p[0] ?? BARN_POS,
        path: p.slice(1),
        state: 'moving' as const,
      };
    });
  });
}
