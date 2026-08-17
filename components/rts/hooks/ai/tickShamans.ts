import {
  BARN_POS,
  SHAMAN_GOLD_REWARD,
  SHAMAN_HEAL_AMOUNT,
  SHAMAN_HEAL_MS,
  SHAMAN_HEAL_RADIUS,
  SHAMAN_SPEED,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import type { RTSGameContext } from '../context';

export function tickShamans(ctx: RTSGameContext, dt: number): void {
  const {
    enemyGruntsRef,
    shamanHealTimersRef,
    placedBuildingsRef,
    setEnemyShamans,
    setEnemyGrunts,
    setResources,
    addFloatingText,
  } = ctx;

  // Update Shamans
  setEnemyShamans(ss => {
    const alive = ss.filter(s => s.hp > 0);
    const killed = ss.filter(s => s.hp <= 0);
    if (killed.length > 0) {
      killed.forEach(s => {
        setResources(res => ({
          ...res,
          gold: res.gold + SHAMAN_GOLD_REWARD,
        }));
        addFloatingText(
          Math.round(s.x),
          Math.round(s.y),
          `+${SHAMAN_GOLD_REWARD}🪙`,
          '#fbbf24'
        );
      });
    }
    return alive.map(s => {
      // Find nearest injured grunt within heal radius to follow
      const injuredGrunts = enemyGruntsRef.current.filter(
        g => g.hp > 0 && g.hp < g.maxHp
      );
      const nearInjured = injuredGrunts.sort(
        (a, b2) => tileDist(s.x, s.y, a.x, a.y) - tileDist(s.x, s.y, b2.x, b2.y)
      )[0];
      if (nearInjured) {
        const d = tileDist(s.x, s.y, nearInjured.x, nearInjured.y);
        if (d <= SHAMAN_HEAL_RADIUS) {
          // In range — heal nearby grunts
          if (!shamanHealTimersRef.current[s.id]) {
            const sid = s.id;
            shamanHealTimersRef.current[sid] = window.setTimeout(() => {
              delete shamanHealTimersRef.current[sid];
              setEnemyGrunts(gs =>
                gs.map(g => {
                  if (
                    g.hp <= 0 ||
                    tileDist(s.x, s.y, g.x, g.y) > SHAMAN_HEAL_RADIUS
                  )
                    return g;
                  const newHp = Math.min(g.maxHp, g.hp + SHAMAN_HEAL_AMOUNT);
                  if (newHp > g.hp)
                    addFloatingText(
                      Math.round(g.x),
                      Math.round(g.y),
                      `🧙+${SHAMAN_HEAL_AMOUNT}`,
                      '#86efac'
                    );
                  return { ...g, hp: newHp };
                })
              );
            }, SHAMAN_HEAL_MS);
          }
          return { ...s, state: 'healing' as const };
        }
        // Move toward injured grunt
        const dx = nearInjured.x - s.x,
          dy = nearInjured.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return {
          ...s,
          x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist),
          y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist),
          state: 'moving' as const,
        };
      }
      // No injured grunts — follow nearest grunt toward barn
      if (s.movingTo) {
        const dx = s.movingTo.x - s.x,
          dy = s.movingTo.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) {
          const next = s.path[0] ?? null;
          return {
            ...s,
            x: s.movingTo.x,
            y: s.movingTo.y,
            movingTo: next,
            path: s.path.slice(1),
            state: 'moving' as const,
          };
        }
        return {
          ...s,
          x: s.x + (dx / dist) * Math.min(SHAMAN_SPEED * dt, dist),
          y: s.y + (dy / dist) * Math.min(SHAMAN_SPEED * dt, dist),
        };
      }
      const wallSetS = new Set(
        placedBuildingsRef.current
          .filter(b => b.type === 'wall')
          .map(b => `${b.x},${b.y}`)
      );
      const p = aStar(
        INITIAL_TILES,
        { x: Math.round(s.x), y: Math.round(s.y) },
        BARN_POS,
        true,
        wallSetS
      );
      return { ...s, movingTo: p[0] ?? BARN_POS, path: p.slice(1) };
    });
  });
}
