import { useCallback, useEffect, useRef, useState } from 'react';

import { TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';
import type { Projectile } from '../game/types';

// Projectile system (flying arrows/rocks/ice bolts) and the move-target ring,
// extracted from RTSMap. Manages their state and exposes addProjectile and
// setMoveRing for callers.
export function useProjectiles() {
  // Projectile system — flying arrows/rocks/ice bolts
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const projIdRef = useRef(0);
  // Move-target ring — flashes at right-click destination like WC3/AoE
  const [moveRing, setMoveRing] = useState<{
    svgX: number;
    svgY: number;
    born: number;
  } | null>(null);
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setProjectiles(ps =>
        ps.filter(p => now - p.createdAt < p.duration + 100)
      );
      if (moveRing && now - moveRing.born > 700) setMoveRing(null);
    }, 200);
    return () => clearInterval(id);
  }, []);
  const addProjectile = useCallback(
    (
      fromTX: number,
      fromTY: number,
      toTX: number,
      toTY: number,
      type: Projectile['type'],
      duration: number
    ) => {
      const { isoX: fx, isoY: fy } = tileToSvg(fromTX, fromTY);
      const { isoX: tx2, isoY: ty2 } = tileToSvg(toTX, toTY);
      setProjectiles(ps => [
        ...ps,
        {
          id: projIdRef.current++,
          fx: fx + TILE_SIZE / 2,
          fy: fy + TILE_SIZE / 4,
          tx: tx2 + TILE_SIZE / 2,
          ty: ty2 + TILE_SIZE / 4,
          type,
          createdAt: Date.now(),
          duration,
        },
      ]);
    },
    []
  );

  return { projectiles, addProjectile, moveRing, setMoveRing };
}
