import { useEffect, useRef } from 'react';

import {
  BARN_POS,
  BARN_VISION,
  GRID_SIZE,
  HERO_ITEM_DATA,
  HERO_MAX_ITEMS,
  VETERAN_HP_BONUS,
  WATCHTOWER_VISION,
  WORKER_VISION,
  XP_TO_LEVEL_1,
  XP_TO_LEVEL_2,
  XP_TO_LEVEL_3,
} from '../game/constants';
import { computeVisible, tileDist } from '../game/map';
import type { RTSGameContext } from './context';
import { tickWorkers } from './ai/tickWorkers';
import { tickEnemyGrunts } from './ai/tickEnemyGrunts';
import { tickEnemySiege } from './ai/tickEnemySiege';
import { tickEnemyShamans } from './ai/tickEnemyShamans';
import { tickEnemyNecromancers } from './ai/tickEnemyNecromancers';
import { tickEnemyWitchDoctors } from './ai/tickEnemyWitchDoctors';
import { tickEnemyWarchiefs } from './ai/tickEnemyWarchiefs';
import { tickEnemyWarlords } from './ai/tickEnemyWarlords';
import { tickEnemyLurkers } from './ai/tickEnemyLurkers';
import { tickEnemyTrolls } from './ai/tickEnemyTrolls';
import { tickEnemySappers } from './ai/tickEnemySappers';
import { tickNeutralCreeps } from './ai/tickNeutralCreeps';

export function useGameLoop(ctx: RTSGameContext) {
  const lurkerKillCountRef = useRef(0);
  const sapperWarnedRef = useRef<Set<number>>(new Set());
  const {
    addFloatingText,
    animationRef,
    attackTimeoutsRef,
    buildingRepairTimeoutsRef,
    creepAttackTimeoutsRef,
    deadWorkerIdsRef,
    droppedItemsRef,
    enemyTowersRef,
    enemyWallsRef,
    fogExploredRef,
    fogVisibleRef,
    gatherTimeoutsRef,
    gameSpeedRef,
    gruntAttackTimeoutsRef,
    heroItemsRef,
    lastFogUpdateRef,
    pendingPickupRef,
    placedBuildingsRef,
    prevTimeRef,
    repairTimeoutsRef,
    setDeadWorkerPositions,
    setDroppedItems,
    setEnemyTowers,
    setEnemyWalls,
    setFogExplored,
    setFogVisible,
    setHeroItems,
    setResources,
    setWorkers,
    workersRef,
  } = ctx;

  // Animation loop
  useEffect(() => {
    function animate(timestamp: number) {
      // When paused, skip all game-state updates to avoid 60fps React re-renders
      if (gameSpeedRef.current === 0) {
        prevTimeRef.current = null; // reset so we get a clean delta on resume
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const deltaTime =
        prevTimeRef.current !== null
          ? (timestamp - prevTimeRef.current) / 1000
          : 1 / 60;
      const dt = Math.min(deltaTime, 0.1) * gameSpeedRef.current;
      prevTimeRef.current = timestamp;

      // Hero item auto-pickup (must run outside setWorkers updater to avoid nested setState)
      const heroForPickup = workersRef.current.find(
        w => w.unitType === 'hero' && w.hp > 0
      );
      if (heroForPickup) {
        const nearItem = droppedItemsRef.current.find(
          d =>
            !pendingPickupRef.current.has(d.id) &&
            tileDist(d.x, d.y, heroForPickup.x, heroForPickup.y) <= 1.0
        );
        if (nearItem) {
          const data = HERO_ITEM_DATA[nearItem.itemId];
          if (nearItem.itemId === 'tome_xp') {
            pendingPickupRef.current.add(nearItem.id);
            setWorkers(ws2 =>
              ws2.map(u => {
                if (u.unitType !== 'hero') return u;
                const newXp = u.xp + 80;
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
                  };
                }
                return { ...u, xp: newXp };
              })
            );
            addFloatingText(
              Math.round(heroForPickup.x),
              Math.round(heroForPickup.y),
              `📖 +80 XP!`,
              '#c084fc'
            );
            setDroppedItems(ds => {
              pendingPickupRef.current.delete(nearItem.id);
              return ds.filter(d => d.id !== nearItem.id);
            });
          } else if (heroItemsRef.current.length < HERO_MAX_ITEMS) {
            pendingPickupRef.current.add(nearItem.id);
            setHeroItems(hi => [
              ...hi,
              { id: nearItem.id, itemId: nearItem.itemId },
            ]);
            setDroppedItems(ds => {
              pendingPickupRef.current.delete(nearItem.id);
              return ds.filter(d => d.id !== nearItem.id);
            });
            addFloatingText(
              Math.round(heroForPickup.x),
              Math.round(heroForPickup.y),
              `${data.emoji} ${data.name}!`,
              '#c084fc'
            );
          }
        }
      }

      // Update workers — compute food loss from ref to avoid setState-inside-updater
      const deadWorkerCount = workersRef.current.filter(w => w.hp <= 0).length;
      if (deadWorkerCount > 0)
        setResources(r => ({
          ...r,
          food: Math.max(0, r.food - deadWorkerCount),
        }));
      setWorkers(ws => tickWorkers(ws, ctx, dt));

      // Detect newly dead workers and record corpse positions
      {
        const now = Date.now();
        const newlyDead = workersRef.current.filter(
          w => w.hp <= 0 && !deadWorkerIdsRef.current.has(w.id)
        );
        if (newlyDead.length > 0) {
          newlyDead.forEach(w => deadWorkerIdsRef.current.add(w.id));
          setDeadWorkerPositions(prev => [
            ...prev.filter(p => now - p.t < 8000),
            ...newlyDead.map(w => ({
              x: Math.round(w.x),
              y: Math.round(w.y),
              t: now,
              unitType: w.unitType,
            })),
          ]);
        }
      }

      // Detect destroyed enemy walls and award loot
      {
        const destroyed = enemyWallsRef.current.filter(ew => ew.hp <= 0);
        if (destroyed.length > 0) {
          setEnemyWalls(ews => ews.filter(ew => ew.hp > 0));
          destroyed.forEach(ew => {
            const gold = 15;
            setResources(r => ({ ...r, gold: r.gold + gold }));
            addFloatingText(ew.x, ew.y, `🧱 +${gold}🪙`, '#fbbf24');
          });
        }
      }
      // Detect destroyed enemy towers, award loot, clean up dead entries
      {
        const destroyed = enemyTowersRef.current.filter(t => t.hp <= 0);
        if (destroyed.length > 0) {
          setEnemyTowers(ts => ts.filter(t => t.hp > 0));
          destroyed.forEach(t => {
            const gold = t.id === -1 ? 40 : 25;
            setResources(r => ({ ...r, gold: r.gold + gold }));
            addFloatingText(t.x, t.y, `🏰 +${gold}🪙`, '#fbbf24');
          });
        }
      }

      // Enemy AI ticks
      tickEnemyGrunts(ctx, dt);
      tickEnemySiege(ctx, dt);
      tickEnemyShamans(ctx, dt);
      tickEnemyNecromancers(ctx, dt);
      tickEnemyWitchDoctors(ctx, dt);
      tickEnemyWarchiefs(ctx, dt);
      tickEnemyWarlords(ctx, dt);
      tickEnemyLurkers(ctx, dt, lurkerKillCountRef);
      tickEnemyTrolls(ctx, dt);
      tickEnemySappers(ctx, dt, sapperWarnedRef);
      tickNeutralCreeps(ctx, dt);

      // Fog of war update — throttled to every 350ms to avoid per-frame state churn
      const nowFog = Date.now();
      if (nowFog - lastFogUpdateRef.current >= 350) {
        lastFogUpdateRef.current = nowFog;
        const newVisible = computeVisible([
          { x: BARN_POS.x, y: BARN_POS.y, r: BARN_VISION },
          ...workersRef.current.map(w => ({
            x: Math.round(w.x),
            y: Math.round(w.y),
            r: WORKER_VISION,
          })),
          ...placedBuildingsRef.current.map(b => ({
            x: b.x,
            y: b.y,
            r: b.type === 'watchtower' ? WATCHTOWER_VISION : 2,
          })),
        ]);
        // Check if visible set changed
        let visChanged = false;
        const prevVis = fogVisibleRef.current;
        outer: for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (!!newVisible[i]?.[j] !== !!prevVis[i]?.[j]) {
              visChanged = true;
              break outer;
            }
          }
        }
        if (visChanged) {
          fogVisibleRef.current = newVisible;
          setFogVisible(newVisible);
          // Also expand explored fog
          const prevExp = fogExploredRef.current;
          let expChanged = false;
          const nextExp = prevExp.map((row, i) =>
            row.map((v, j) => {
              if (!v && newVisible[i]?.[j]) {
                expChanged = true;
                return true;
              }
              return v;
            })
          );
          if (expChanged) {
            fogExploredRef.current = nextExp;
            setFogExplored(nextExp);
          }
        }
      }

      // Workers can also attack creeps (already tracked via attackTimeoutsRef for grunt targets)
      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      Object.values(gatherTimeoutsRef.current).forEach(clearTimeout);
      Object.values(attackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(gruntAttackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(repairTimeoutsRef.current).forEach(clearTimeout);
      Object.values(creepAttackTimeoutsRef.current).forEach(clearTimeout);
      Object.values(buildingRepairTimeoutsRef.current).forEach(clearTimeout);
      gatherTimeoutsRef.current = {};
      attackTimeoutsRef.current = {};
      gruntAttackTimeoutsRef.current = {};
      repairTimeoutsRef.current = {};
      creepAttackTimeoutsRef.current = {};
      buildingRepairTimeoutsRef.current = {};
    };
  }, []);
}
