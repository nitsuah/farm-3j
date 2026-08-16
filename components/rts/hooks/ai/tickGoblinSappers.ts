import type React from 'react';
import {
  BARN_POS,
  SAPPER_EXPLODE_DAMAGE,
  SAPPER_EXPLODE_RADIUS,
  SAPPER_GOLD_REWARD,
  SAPPER_SPEED,
  SAPPER_XP_REWARD,
  VETERAN_HP_BONUS,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
} from '../../game/constants';
import { INITIAL_TILES, tileDist } from '../../game/map';
import { aStar } from '../../game/pathfinding';
import { ENEMY_VOICELINES, Snd, pickAck } from '../../game/sound';
import type { RTSGameContext } from '../context';

export function tickGoblinSappers(
  ctx: RTSGameContext,
  dt: number,
  sapperWarnedRef: React.RefObject<Set<number>>
): void {
  const {
    sapperKillCountRef,
    placedBuildingsRef,
    setEnemySappers,
    setResources,
    setPlacedBuildings,
    setPlayerBarnHp,
    setGameOver,
    setWorkers,
    addFloatingText,
    addDmgLog,
    onAchievement,
  } = ctx;

  // Update Goblin Sappers
  setEnemySappers(ss => {
    const alive = ss.filter(s => !s.exploded && s.hp > 0);
    const killed = ss.filter(s => !s.exploded && s.hp <= 0);
    killed.forEach(s => {
      sapperKillCountRef.current += 1;
      if (sapperKillCountRef.current >= 5) onAchievement('sapper_slayer');
      setResources(r => ({ ...r, gold: r.gold + SAPPER_GOLD_REWARD }));
      addFloatingText(
        Math.round(s.x),
        Math.round(s.y),
        `+${SAPPER_GOLD_REWARD}🪙 💥Defused!`,
        '#fbbf24'
      );
    });
    return alive
      .map(s => {
        const distToTarget = tileDist(s.x, s.y, s.targetX, s.targetY);
        // Proximity warning when sapper closes within 4 tiles — shown once per sapper
        if (distToTarget < 4 && !sapperWarnedRef.current.has(s.id)) {
          sapperWarnedRef.current.add(s.id);
          addFloatingText(
            Math.round(s.x),
            Math.round(s.y),
            pickAck(ENEMY_VOICELINES.sapper_incoming ?? []),
            '#fbbf24'
          );
          Snd.sapperTick();
        }
        // Explode on reaching target
        if (distToTarget < 0.8) {
          addFloatingText(
            Math.round(s.x),
            Math.round(s.y),
            '💥 BOOM!',
            '#f97316'
          );
          // Damage all buildings in radius
          setPlacedBuildings(bs =>
            bs.map(b => {
              const d = tileDist(b.x, b.y, s.x, s.y);
              if (d > SAPPER_EXPLODE_RADIUS) return b;
              const newHp = Math.max(0, b.hp - SAPPER_EXPLODE_DAMAGE);
              addFloatingText(b.x, b.y, `-${SAPPER_EXPLODE_DAMAGE}`, '#ef4444');
              return { ...b, hp: newHp };
            })
          );
          // Damage player barn if in range
          if (
            tileDist(s.x, s.y, BARN_POS.x, BARN_POS.y) <= SAPPER_EXPLODE_RADIUS
          ) {
            addDmgLog('💣 Goblin Sapper', SAPPER_EXPLODE_DAMAGE);
            setPlayerBarnHp(hp => {
              const nHp = Math.max(0, hp - SAPPER_EXPLODE_DAMAGE);
              if (nHp <= 0) setGameOver('defeat');
              return nHp;
            });
            addFloatingText(
              BARN_POS.x,
              BARN_POS.y,
              `-${SAPPER_EXPLODE_DAMAGE}`,
              '#ef4444'
            );
          }
          // Damage workers in radius
          setWorkers(ws =>
            ws.map(w => {
              if (tileDist(w.x, w.y, s.x, s.y) > SAPPER_EXPLODE_RADIUS)
                return w;
              addFloatingText(
                Math.round(w.x),
                Math.round(w.y),
                `-${SAPPER_EXPLODE_DAMAGE}`,
                '#fca5a5'
              );
              return {
                ...w,
                hp: Math.max(0, w.hp - SAPPER_EXPLODE_DAMAGE),
              };
            })
          );
          // XP reward to nearby attackers
          setWorkers(ws2 =>
            ws2.map(u => {
              if (!u.attacking || u.attacking.targetType !== 'sapper') return u;
              const xpGain = SAPPER_XP_REWARD;
              const newXp = u.xp + xpGain;
              const newLevel =
                newXp >= XP_TO_LEVEL_3
                  ? 3
                  : newXp >= XP_TO_LEVEL_2
                    ? 2
                    : newXp >= XP_TO_LEVEL_1
                      ? 1
                      : 0;
              if (newLevel > u.level) {
                addFloatingText(
                  Math.round(u.x),
                  Math.round(u.y),
                  `⭐ Level ${newLevel}!`,
                  '#fbbf24'
                );
                return {
                  ...u,
                  xp: newXp,
                  level: newLevel,
                  maxHp: u.maxHp + VETERAN_HP_BONUS,
                  hp: Math.min(
                    u.hp + VETERAN_HP_BONUS,
                    u.maxHp + VETERAN_HP_BONUS
                  ),
                  attacking: null,
                  state: 'idle' as const,
                };
              }
              return {
                ...u,
                xp: newXp,
                attacking: null,
                state: 'idle' as const,
              };
            })
          );
          return { ...s, exploded: true };
        }
        // Move toward target
        if (s.movingTo) {
          const dx = s.movingTo.x - s.x,
            dy = s.movingTo.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.1) {
            const next = s.path[0] ?? null;
            if (!next)
              return {
                ...s,
                x: s.movingTo.x,
                y: s.movingTo.y,
                movingTo: null,
                path: [],
              };
            return {
              ...s,
              x: s.movingTo.x,
              y: s.movingTo.y,
              movingTo: next,
              path: s.path.slice(1),
            };
          }
          return {
            ...s,
            x: s.x + (dx / dist) * Math.min(SAPPER_SPEED * dt, dist),
            y: s.y + (dy / dist) * Math.min(SAPPER_SPEED * dt, dist),
          };
        }
        const wallSetSp = new Set(
          placedBuildingsRef.current
            .filter(b => b.type === 'wall')
            .map(b => `${b.x},${b.y}`)
        );
        const p = aStar(
          INITIAL_TILES,
          { x: Math.round(s.x), y: Math.round(s.y) },
          { x: s.targetX, y: s.targetY },
          true,
          wallSetSp
        );
        return {
          ...s,
          movingTo: p[0] ?? { x: s.targetX, y: s.targetY },
          path: p.slice(1),
        };
      })
      .filter(s => !s.exploded);
  });
}
