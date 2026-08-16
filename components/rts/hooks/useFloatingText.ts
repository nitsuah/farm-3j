import { useCallback, useEffect, useRef, useState } from 'react';

import { TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';
import type { FloatingText } from '../game/types';

// Floating combat-text state and the addFloatingText callback extracted from RTSMap.
// Manages the timed array of on-screen labels (+gold, damage numbers, etc.).
export function useFloatingText() {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatingTextIdRef = useRef(1);
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setFloatingTexts(ts => {
        if (ts.length === 0) return ts; // avoid new empty array reference every 100ms
        const filtered = ts.filter(t => now - t.createdAt < 1200);
        return filtered.length === ts.length ? ts : filtered;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const addFloatingText = useCallback(
    (tileX: number, tileY: number, text: string, color: string) => {
      const { isoX, isoY } = tileToSvg(tileX, tileY);
      setFloatingTexts(ts => [
        ...ts,
        {
          id: floatingTextIdRef.current++,
          x: isoX + TILE_SIZE / 2 + (Math.random() * 20 - 10),
          y: isoY + 10,
          text,
          color,
          createdAt: Date.now(),
        },
      ]);
    },
    []
  );

  return { floatingTexts, addFloatingText };
}
