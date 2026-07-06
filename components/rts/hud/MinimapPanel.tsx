import React, { useMemo } from 'react';

import { BARN_POS, ENEMY_BARN_POS, GRID_SIZE } from '../game/constants';
import type {
  EnemyGrunt,
  EnemyWarchief,
  EnemyWarlord,
  EnemyTroll,
  EnemySapper,
  EnemyShaman,
  EnemySiege,
  PlacedBuilding,
  TileType,
  WorkerState,
} from '../game/types';

interface MinimapPanelProps {
  enemyGrunts: EnemyGrunt[];
  enemySappers: EnemySapper[];
  enemyShamans: EnemyShaman[];
  enemySiege: EnemySiege[];
  enemyTrolls: EnemyTroll[];
  enemyWarchiefs: EnemyWarchief[];
  enemyWarlords: EnemyWarlord[];
  fogExplored: boolean[][];
  fogVisible: boolean[][];
  placedBuildings: PlacedBuilding[];
  tiles: TileType[][];
  workers: WorkerState[];
}

const SIZE = 160;
const CELL = SIZE / GRID_SIZE; // 6.4px per tile

const TILE_COLOR: Record<TileType, string> = {
  grass: '#4ade80',
  dirt:  '#d97706',
  water: '#38bdf8',
  tree:  '#166534',
  rock:  '#6b7280',
};

export const MinimapPanel: React.FC<MinimapPanelProps> = React.memo(({
  enemyGrunts,
  enemySappers,
  enemyShamans,
  enemySiege,
  enemyTrolls,
  enemyWarchiefs,
  enemyWarlords,
  fogExplored,
  fogVisible,
  placedBuildings,
  tiles,
  workers,
}) => {
  // Build terrain path strings — only rebuilds if tiles change (never after init)
  const terrainRects = useMemo(() => {
    const rects: React.ReactNode[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const t = tiles[i]?.[j] ?? 'grass';
        rects.push(
          <rect
            key={`${i}-${j}`}
            x={i * CELL}
            y={j * CELL}
            width={CELL + 0.5}
            height={CELL + 0.5}
            fill={TILE_COLOR[t]}
          />
        );
      }
    }
    return rects;
  }, [tiles]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 52,
        right: 8,
        zIndex: 30,
        background: 'rgba(10,12,24,0.92)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6,
        padding: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.7)',
        pointerEvents: 'none',
      }}
    >
      <svg width={SIZE} height={SIZE} style={{ display: 'block' }}>
        {/* Terrain base */}
        {terrainRects}

        {/* Fog — dark = unexplored, dim = explored but not visible */}
        {Array.from({ length: GRID_SIZE }, (_, i) =>
          Array.from({ length: GRID_SIZE }, (_, j) => {
            if (fogVisible[i]?.[j]) return null;
            return (
              <rect
                key={`fog-${i}-${j}`}
                x={i * CELL}
                y={j * CELL}
                width={CELL + 0.5}
                height={CELL + 0.5}
                fill={fogExplored[i]?.[j] ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.85)'}
              />
            );
          })
        )}

        {/* Player buildings */}
        {placedBuildings.map(b => (
          fogExplored[b.x]?.[b.y] ? (
            <rect
              key={`mb-${b.id}`}
              x={b.x * CELL + 1}
              y={b.y * CELL + 1}
              width={CELL - 1}
              height={CELL - 1}
              fill="#60a5fa"
              rx={1}
            />
          ) : null
        ))}

        {/* Player barn */}
        <rect
          x={BARN_POS.x * CELL}
          y={BARN_POS.y * CELL}
          width={CELL + 1}
          height={CELL + 1}
          fill="#fbbf24"
          rx={1}
        />

        {/* Enemy barn */}
        {fogExplored[ENEMY_BARN_POS.x]?.[ENEMY_BARN_POS.y] && (
          <rect
            x={ENEMY_BARN_POS.x * CELL}
            y={ENEMY_BARN_POS.y * CELL}
            width={CELL + 1}
            height={CELL + 1}
            fill="#ef4444"
            rx={1}
          />
        )}

        {/* Player units */}
        {workers.filter(w => w.hp > 0).map(w => (
          <circle
            key={`mw-${w.id}`}
            cx={w.x * CELL + CELL / 2}
            cy={w.y * CELL + CELL / 2}
            r={w.unitType === 'hero' ? 3 : 2}
            fill={w.unitType === 'hero' ? '#fbbf24' : w.unitType === 'swordsman' ? '#f87171' : '#4ade80'}
          />
        ))}

        {/* Enemy units — only show if explored */}
        {enemyGrunts.filter(e => e.hp > 0 && fogVisible[Math.round(e.x)]?.[Math.round(e.y)]).map(e => (
          <circle key={`mg-${e.id}`} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={1.5} fill="#ef4444" />
        ))}
        {enemyWarchiefs.filter(e => e.hp > 0 && fogVisible[Math.round(e.x)]?.[Math.round(e.y)]).map(e => (
          <circle key={`mwc-${e.id}`} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={2.5} fill="#f59e0b" />
        ))}
        {enemyWarlords.filter(e => e.hp > 0 && fogVisible[Math.round(e.x)]?.[Math.round(e.y)]).map(e => (
          <circle key={`mwl-${e.id}`} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={3} fill="#dc2626" />
        ))}
        {enemyTrolls.filter(e => e.hp > 0 && fogVisible[Math.round(e.x)]?.[Math.round(e.y)]).map(e => (
          <circle key={`mt-${e.id}`} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={2} fill="#86efac" />
        ))}
        {enemySappers.filter(e => e.hp > 0 && !e.exploded && fogVisible[Math.round(e.x)]?.[Math.round(e.y)]).map(e => (
          <circle key={`ms-${e.id}`} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={2} fill="#fb923c" />
        ))}
        {enemyShamans.filter(e => e.hp > 0 && fogVisible[Math.round(e.x)]?.[Math.round(e.y)]).map(e => (
          <circle key={`msh-${e.id}`} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={2} fill="#c084fc" />
        ))}
        {enemySiege.filter(e => e.hp > 0 && fogVisible[Math.round(e.x)]?.[Math.round(e.y)]).map(e => (
          <circle key={`msi-${e.id}`} cx={e.x * CELL + CELL / 2} cy={e.y * CELL + CELL / 2} r={2.5} fill="#fcd34d" />
        ))}

        {/* Border */}
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      </svg>
      <div style={{ textAlign: 'center', fontSize: 9, color: '#475569', marginTop: 1, letterSpacing: 1 }}>
        MINIMAP
      </div>
    </div>
  );
});

MinimapPanel.displayName = 'MinimapPanel';
