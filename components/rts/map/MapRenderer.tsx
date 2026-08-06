/**
 * MapRenderer — thin shell for the isometric SVG game view.
 *
 * Extracted from RTSMap.tsx as part of the large-file componentization.
 * Currently a skeleton; the isometric rendering logic (tiles, units, buildings,
 * projectiles, fog-of-war, floating text) lives in RTSMap.tsx and will be
 * migrated here incrementally.
 *
 * Planned responsibilities:
 *  - Isometric coordinate transforms (tileToSvg, svgToTile)
 *  - Terrain layer (TilesLayer)
 *  - Resource node layer (trees, gold mines, stone)
 *  - Buildings layer (BuildingsLayer)
 *  - Unit layer (workers, enemies)
 *  - Projectile layer (arrows, bolts, rocks)
 *  - Floating text overlays
 *  - Fog-of-war mask
 *  - Drag-select rectangle
 *  - Rally point indicator
 */

import React from 'react';

import { GRID_SIZE, TILE_SIZE } from '../game/constants';

/** Placeholder prop type — will expand as logic is migrated from RTSMap.tsx. */
export interface MapRendererProps {
  className?: string;
}

/**
 * Renders the isometric SVG game view.
 * @see RTSMap.tsx for the current rendering implementation.
 */
export const MapRenderer: React.FC<MapRendererProps> = ({ className }) => {
  // TODO: migrate isometric rendering logic from RTSMap.tsx
  return (
    <svg
      className={className}
      viewBox={`0 0 ${GRID_SIZE * TILE_SIZE * 2 + 200} ${GRID_SIZE * TILE_SIZE + 200}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* placeholder — real content migrated from RTSMap.tsx */}
    </svg>
  );
};
