import { useEffect } from 'react';

import {
  BARN_POS,
  GARRISON_HEAL_AMOUNT,
  GARRISON_HEAL_MS,
} from '../game/constants';
import { INITIAL_TILES, tileDist } from '../game/map';
import { aStar } from '../game/pathfinding';
import { Snd } from '../game/sound';
import { makeUnit } from '../game/units';
import type { RTSGameContext } from './context';

export function useProduction(ctx: RTSGameContext) {
  const TRAIN_TIME_MS = 8000;
  const {
    addFloatingText,
    barracksTechRef,
    enemyGruntsRef,
    gameOver,
    gameOverRef,
    placedBuildings,
    placedBuildingsRef,
    rallyPointRef,
    setEnemyGrunts,
    setGarrisoned,
    setResources,
    setTrainingProgress,
    setTrainingQueue,
    setWorkers,
    trainingElapsedRef,
    trainingQueueRef,
    trapTriggeredRef,
    upkeepMultRef,
  } = ctx;

  // Training queue drain — tick every 100ms; spawn unit when elapsed >= TRAIN_TIME_MS
  useEffect(() => {
    if (gameOver) return;
    const tick = () => {
      if (gameOverRef.current) return;
      const queue = trainingQueueRef.current;
      if (queue.length === 0) {
        trainingElapsedRef.current = 0;
        setTrainingProgress(0);
        return;
      }
      trainingElapsedRef.current += 100;
      const pct = Math.min(1, trainingElapsedRef.current / TRAIN_TIME_MS);
      setTrainingProgress(pct);
      if (trainingElapsedRef.current < TRAIN_TIME_MS) return;
      trainingElapsedRef.current = 0;
      const first = queue[0];
      if (!first) return;
      const type = first.type;
      setTrainingQueue(q => q.slice(1));
      setWorkers(ws => {
        const newId = Math.max(...ws.map(w => w.id), 0) + 1;
        const rp = rallyPointRef.current;
        const vetBonus = barracksTechRef.current.veteranTraining ? 20 : 0;
        const baseUnit = makeUnit(newId, BARN_POS.x, BARN_POS.y, type);
        const unit =
          vetBonus > 0
            ? {
                ...baseUnit,
                maxHp: baseUnit.maxHp + vetBonus,
                hp: baseUnit.maxHp + vetBonus,
              }
            : baseUnit;
        if (rp) {
          const path = aStar(INITIAL_TILES, BARN_POS, rp);
          return [
            ...ws,
            {
              ...unit,
              movingTo: path[0] ?? rp,
              path: path.slice(1),
              state: 'moving' as const,
            },
          ];
        }
        return [...ws, unit];
      });
      addFloatingText(
        BARN_POS.x,
        BARN_POS.y,
        type === 'swordsman' ? '⚔️ Ready!' : '🐴 Ready!',
        '#4ade80'
      );
      Snd.unitReady();
    };
    const id = window.setInterval(tick, 100);
    return () => clearInterval(id);
  }, [gameOver, addFloatingText]);

  // Spike Trap — deal 20 dmg to any grunt that steps within 0.5 tiles; 30s cooldown per trap
  useEffect(() => {
    if (gameOver) return;
    const TRAP_DAMAGE = 20;
    const TRAP_COOLDOWN_MS = 30000;
    const TRAP_RADIUS = 0.8;
    const checkTraps = () => {
      if (gameOverRef.current) return;
      const traps = placedBuildingsRef.current.filter(
        b => b.type === 'spikeTrap'
      );
      const now = Date.now();
      const grunts = enemyGruntsRef.current;
      traps.forEach(trap => {
        const lastTrigger = trapTriggeredRef.current[trap.id] ?? 0;
        if (now - lastTrigger < TRAP_COOLDOWN_MS) return; // still on cooldown
        const victim = grunts.find(
          g => g.hp > 0 && tileDist(g.x, g.y, trap.x, trap.y) <= TRAP_RADIUS
        );
        if (!victim) return;
        trapTriggeredRef.current[trap.id] = now;
        setEnemyGrunts(gs =>
          gs.map(g =>
            g.id === victim.id
              ? { ...g, hp: Math.max(0, g.hp - TRAP_DAMAGE) }
              : g
          )
        );
        addFloatingText(trap.x, trap.y, `🪤-${TRAP_DAMAGE}`, '#fbbf24');
      });
    };
    const id = window.setInterval(checkTraps, 250);
    return () => clearInterval(id);
  }, [gameOver, addFloatingText]);

  // Windmill passive gold income
  useEffect(() => {
    if (gameOver) return;
    const mills = placedBuildings.filter(b => b.type === 'windmill');
    if (mills.length === 0) return;
    const id = setInterval(() => {
      if (gameOverRef.current) return;
      const income = Math.round(mills.length * 2 * upkeepMultRef.current);
      setResources(r => ({ ...r, gold: r.gold + income }));
      mills.forEach(m =>
        addFloatingText(
          m.x,
          m.y,
          `+${Math.round(income / mills.length)}🪙`,
          '#fde68a'
        )
      );
    }, 5000);
    return () => clearInterval(id);
  }, [placedBuildings, gameOver, addFloatingText]);

  // Garrison heal
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      if (gameOverRef.current) return;
      setGarrisoned(gs => {
        const healed = gs.map(u =>
          u.hp < u.maxHp
            ? { ...u, hp: Math.min(u.maxHp, u.hp + GARRISON_HEAL_AMOUNT) }
            : u
        );
        return healed;
      });
    }, GARRISON_HEAL_MS);
    return () => clearInterval(id);
  }, [gameOver]);
}
