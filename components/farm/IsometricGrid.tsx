'use client';

import React, { useMemo } from 'react';
import {
  GRID_CONFIG,
  gridToScreen,
  calculateZIndex,
} from '@/lib/farm/isometric';
import { createDefaultTerrain, getTerrainColor } from '@/lib/farm/terrain';

interface IsometricGridProps {
  showGrid?: boolean;
}

export const IsometricGrid = React.memo(function IsometricGrid({
  showGrid = false,
}: IsometricGridProps) {
  const terrain = useMemo(
    () => createDefaultTerrain(GRID_CONFIG.GRID_ROWS, GRID_CONFIG.GRID_COLS),
    []
  );

  return (
    <div className="absolute inset-0">
      {/* Render terrain tiles */}
      {terrain.map((row, y) =>
        row.map((tile, x) => {
          const { screenX, screenY } = gridToScreen(x, y);
          const color = getTerrainColor(tile.type);
          const zIndex = calculateZIndex(x, y);

          return (
            <div
              key={`tile-${x}-${y}`}
              className="absolute"
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                width: `${GRID_CONFIG.TILE_WIDTH}px`,
                height: `${GRID_CONFIG.TILE_HEIGHT}px`,
                transform: 'translateX(-50%)',
                zIndex: zIndex,
              }}
            >
              {/* Isometric tile shape */}
              <svg
                width={GRID_CONFIG.TILE_WIDTH}
                height={GRID_CONFIG.TILE_HEIGHT}
                viewBox={`0 0 ${GRID_CONFIG.TILE_WIDTH} ${GRID_CONFIG.TILE_HEIGHT}`}
                style={{ overflow: 'visible' }}
              >
                <polygon
                  points={`${GRID_CONFIG.TILE_WIDTH / 2},0 ${
                    GRID_CONFIG.TILE_WIDTH
                  },${GRID_CONFIG.TILE_HEIGHT / 2} ${
                    GRID_CONFIG.TILE_WIDTH / 2
                  },${GRID_CONFIG.TILE_HEIGHT} 0,${
                    GRID_CONFIG.TILE_HEIGHT / 2
                  }`}
                  fill={color}
                  stroke={showGrid ? '#000' : 'none'}
                  strokeWidth={showGrid ? '1' : '0'}
                  opacity={tile.type === 'pond' ? 0.8 : 0.9}
                />
                {/* Add subtle texture for grass/pasture */}
                {(tile.type === 'grass' || tile.type === 'pasture') && (
                  <>
                    <circle
                      cx={GRID_CONFIG.TILE_WIDTH / 2 - 8}
                      cy={GRID_CONFIG.TILE_HEIGHT / 2 - 2}
                      r="1"
                      fill="#16a34a"
                      opacity="0.6"
                    />
                    <circle
                      cx={GRID_CONFIG.TILE_WIDTH / 2 + 10}
                      cy={GRID_CONFIG.TILE_HEIGHT / 2 + 3}
                      r="1"
                      fill="#16a34a"
                      opacity="0.5"
                    />
                    <circle
                      cx={GRID_CONFIG.TILE_WIDTH / 2}
                      cy={GRID_CONFIG.TILE_HEIGHT / 2 + 5}
                      r="1"
                      fill="#15803d"
                      opacity="0.4"
                    />
                  </>
                )}
                {/* Add ripple effect for pond */}
                {tile.type === 'pond' && (
                  <ellipse
                    cx={GRID_CONFIG.TILE_WIDTH / 2}
                    cy={GRID_CONFIG.TILE_HEIGHT / 2}
                    rx="12"
                    ry="6"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                )}
              </svg>
            </div>
          );
        })
      )}

      {/* Grid overlay (optional) */}
      {showGrid && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: GRID_CONFIG.GRID_ROWS }).map((_, y) =>
            Array.from({ length: GRID_CONFIG.GRID_COLS }).map((_, x) => {
              const { screenX, screenY } = gridToScreen(x, y);
              return (
                <div
                  key={`grid-${x}-${y}`}
                  className="absolute text-[8px] text-white/50"
                  style={{
                    left: `${screenX}px`,
                    top: `${screenY}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                  }}
                >
                  {x},{y}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});
