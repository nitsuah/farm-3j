import { useEffect } from 'react';

import type { RTSGameContext } from './context';
import { useCombatResolution } from './useCombatResolution';
import { useEnemyAI } from './useEnemyAI';
import { usePathfinding } from './usePathfinding';
import { useResourceTick } from './useResourceTick';

export function useGameLoop(ctx: RTSGameContext) {
  const tickCombat = useCombatResolution(ctx);
  const tickResources = useResourceTick(ctx);
  const tickEnemyAI = useEnemyAI(ctx);
  const tickFog = usePathfinding(ctx);

  const {
    animationRef,
    attackTimeoutsRef,
    buildingRepairTimeoutsRef,
    creepAttackTimeoutsRef,
    gatherTimeoutsRef,
    gameSpeedRef,
    gruntAttackTimeoutsRef,
    prevTimeRef,
    repairTimeoutsRef,
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

      try {
        tickCombat(dt);
        tickResources(dt);
        tickEnemyAI(dt);
        tickFog();
      } catch (err) {
        reportError(err);
      } finally {
        animationRef.current = requestAnimationFrame(animate);
      }
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
