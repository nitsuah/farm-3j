import type { EnemyGrunt } from '../../game/types';
import {
  BARN_POS,
  GRUNT_MAX_HP,
  NECROMANCER_GOLD_REWARD,
  NECROMANCER_RAISE_MS,
  NECROMANCER_RAISE_RADIUS,
  NECROMANCER_SPEED,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import type { RTSGameContext } from '../context';

export function tickNecromancers(ctx: RTSGameContext, dt: number): void {
  const {
    deadGruntPositionsRef,
    necromancerRaiseTimersRef,
    gruntIdRef,
    placedBuildingsRef,
    setEnemyNecromancers,
    setEnemyGrunts,
    setResources,
    setDeadGruntPositions,
    addFloatingText,
  } = ctx;

  // Update Necromancers
  setEnemyNecromancers(ns => {
    const alive = ns.filter(n => n.hp > 0);
    const killed = ns.filter(n => n.hp <= 0);
    if (killed.length > 0) {
      killed.forEach(n => {
        setResources(r => ({
          ...r,
          gold: r.gold + NECROMANCER_GOLD_REWARD,
        }));
        addFloatingText(
          Math.round(n.x),
          Math.round(n.y),
          `+${NECROMANCER_GOLD_REWARD}🪙`,
          '#fbbf24'
        );
      });
    }
    return alive.map(n => {
      // Look for a recent dead grunt position within raise radius
      const now = Date.now();
      const nearCorpse = deadGruntPositionsRef.current.find(
        p =>
          now - p.t < 20000 &&
          tileDist(n.x, n.y, p.x, p.y) <= NECROMANCER_RAISE_RADIUS
      );
      if (nearCorpse) {
        if (!necromancerRaiseTimersRef.current[n.id]) {
          const nid = n.id;
          const cx2 = nearCorpse.x;
          const cy2 = nearCorpse.y;
          necromancerRaiseTimersRef.current[nid] = window.setTimeout(() => {
            delete necromancerRaiseTimersRef.current[nid];
            // Consume the corpse and spawn a skeleton grunt (half HP)
            setDeadGruntPositions(prev =>
              prev.filter(p => !(p.x === cx2 && p.y === cy2))
            );
            const skeletonHp = Math.round(GRUNT_MAX_HP * 0.5);
            const wallSetN = new Set(
              placedBuildingsRef.current
                .filter(b => b.type === 'wall')
                .map(b => `${b.x},${b.y}`)
            );
            const skPath = aStar(
              INITIAL_TILES,
              { x: cx2, y: cy2 },
              BARN_POS,
              true,
              wallSetN
            );
            const skeleton: EnemyGrunt = {
              id: gruntIdRef.current++,
              x: cx2,
              y: cy2,
              hp: skeletonHp,
              maxHp: skeletonHp,
              movingTo: skPath[0] ?? BARN_POS,
              path: skPath.slice(1),
              state: 'moving',
              isSkeleton: true,
            };
            setEnemyGrunts(gs => [...gs, skeleton]);
            addFloatingText(cx2, cy2, '💀 RAISED!', '#a855f7');
          }, NECROMANCER_RAISE_MS);
        }
        return { ...n, state: 'raising' as const };
      }
      // Move toward nearest corpse or follow grunts toward barn
      const nearestCorpse = deadGruntPositionsRef.current
        .filter(p => now - p.t < 20000)
        .sort(
          (a, b2) =>
            tileDist(n.x, n.y, a.x, a.y) - tileDist(n.x, n.y, b2.x, b2.y)
        )[0];
      const moveDest = nearestCorpse
        ? { x: nearestCorpse.x, y: nearestCorpse.y }
        : BARN_POS;
      if (n.movingTo) {
        const dx2 = n.movingTo.x - n.x,
          dy2 = n.movingTo.y - n.y;
        const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (d2 < 0.1) {
          const next2 = n.path[0] ?? null;
          return {
            ...n,
            x: n.movingTo.x,
            y: n.movingTo.y,
            movingTo: next2,
            path: n.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...n,
          x: n.x + (dx2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2),
          y: n.y + (dy2 / d2) * Math.min(NECROMANCER_SPEED * dt, d2),
        };
      }
      const wallSetN2 = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const p2 = aStar(
        INITIAL_TILES,
        { x: Math.round(n.x), y: Math.round(n.y) },
        moveDest,
        true,
        wallSetN2
      );
      return { ...n, movingTo: p2[0] ?? moveDest, path: p2.slice(1) };
    });
  });
}
