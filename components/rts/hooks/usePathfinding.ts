import {
  BARN_POS,
  BARN_VISION,
  BUILDING_VISION,
  GRID_SIZE,
  WATCHTOWER_VISION,
  WORKER_VISION,
} from '../game/constants';
import { computeVisible } from '../game/map';
import type { RTSGameContext } from './context';

const FOG_UPDATE_INTERVAL_MS = 350;

// Returns a stable tick function called each rAF frame by useGameLoop.
// Internally throttles fog-of-war recomputation to every 350 ms.
export function usePathfinding(ctx: RTSGameContext): () => void {
  const {
    fogExploredRef,
    fogVisibleRef,
    lastFogUpdateRef,
    placedBuildingsRef,
    setFogExplored,
    setFogVisible,
    workersRef,
  } = ctx;

  return () => {
    const now = Date.now();
    if (now - lastFogUpdateRef.current < FOG_UPDATE_INTERVAL_MS) return;
    lastFogUpdateRef.current = now;

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
        r: b.type === 'watchtower' ? WATCHTOWER_VISION : BUILDING_VISION,
      })),
    ]);

    // Only push state when the visible set actually changed
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
  };
}
