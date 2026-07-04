import React from 'react';

import {
  ARCHER_TOWER_RANGE,
  BALLISTA_RANGE,
  BARN_POS,
  BARN_DEFENSE_RANGE,
  BUILDING_EMOJI,
  DEMOLISHER_FIRE_RANGE,
  ENEMY_TOWER_RANGE,
  FROST_TOWER_RANGE,
  GRID_SIZE,
  POISON_TOWER_RANGE,
  TILE_SIZE,
  TROLL_ATTACK_RANGE,
  WARCHIEF_STOMP_RADIUS,
  WATCHTOWER_ATTACK_RANGE,
} from '../game/constants';
import { tileToSvg } from '../game/map';
import type {
  BuildingType,
  EnemySiege,
  EnemyTower,
  EnemyTroll,
  EnemyWarchief,
  PlacedBuilding,
} from '../game/types';

const TOWER_COLORS: Partial<Record<BuildingType, string>> = {
  watchtower: '#94a3b8',
  frostTower: '#93c5fd',
  ballista: '#fbbf24',
  poisonTower: '#86efac',
};

const GHOST_RANGES: Partial<
  Record<BuildingType, { r: number; color: string }>
> = {
  watchtower: { r: WATCHTOWER_ATTACK_RANGE, color: '#94a3b8' },
  frostTower: { r: FROST_TOWER_RANGE, color: '#93c5fd' },
  ballista: { r: BALLISTA_RANGE, color: '#fbbf24' },
  poisonTower: { r: POISON_TOWER_RANGE, color: '#86efac' },
};

interface OverlayRingsLayerProps {
  buildMode: BuildingType | null;
  enemySiege: EnemySiege[];
  enemyTowers: EnemyTower[];
  enemyTrolls: EnemyTroll[];
  enemyWarchiefs: EnemyWarchief[];
  fogVisible: boolean[][];
  ghostTile: { x: number; y: number } | null;
  guardTowerResearched: boolean;
  isTileOccupied: (x: number, y: number) => boolean;
  placedBuildings: PlacedBuilding[];
}

export const OverlayRingsLayer: React.FC<OverlayRingsLayerProps> = ({
  buildMode,
  enemySiege,
  enemyTowers,
  enemyTrolls,
  enemyWarchiefs,
  fogVisible,
  ghostTile,
  guardTowerResearched,
  isTileOccupied,
  placedBuildings,
}) => {
  return (
    <>
      {/* Build ghost */}
      {/* Warchief stomp radius — always shown as threat indicator */}
      {enemyWarchiefs
        .filter(
          wc => wc.hp > 0 && fogVisible[Math.round(wc.x)]?.[Math.round(wc.y)]
        )
        .map(wc => {
          const { isoX, isoY } = tileToSvg(wc.x, wc.y);
          return (
            <ellipse
              key={`warchief-range-${wc.id}`}
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + TILE_SIZE / 4}
              rx={WARCHIEF_STOMP_RADIUS * TILE_SIZE}
              ry={(WARCHIEF_STOMP_RADIUS * TILE_SIZE) / 2}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              opacity={0.35}
              pointerEvents="none"
            />
          );
        })}

      {/* Enemy unit range rings — troll archers, demolishers, enemy towers */}
      {enemyTrolls
        .filter(t => t.hp > 0 && fogVisible[t.x]?.[t.y])
        .map(t => {
          const { isoX, isoY } = tileToSvg(t.x, t.y);
          return (
            <ellipse
              key={`troll-range-${t.id}`}
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + TILE_SIZE / 4}
              rx={TROLL_ATTACK_RANGE * TILE_SIZE}
              ry={(TROLL_ATTACK_RANGE * TILE_SIZE) / 2}
              fill="none"
              stroke="#f97316"
              strokeWidth={1}
              strokeDasharray="5 3"
              opacity={0.3}
              pointerEvents="none"
            />
          );
        })}
      {enemySiege
        .filter(r => r.hp > 0 && fogVisible[r.x]?.[r.y])
        .map(r => {
          const { isoX, isoY } = tileToSvg(r.x, r.y);
          return (
            <ellipse
              key={`demo-range-${r.id}`}
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + TILE_SIZE / 4}
              rx={DEMOLISHER_FIRE_RANGE * TILE_SIZE}
              ry={(DEMOLISHER_FIRE_RANGE * TILE_SIZE) / 2}
              fill="none"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 3"
              opacity={0.3}
              pointerEvents="none"
            />
          );
        })}
      {enemyTowers
        .filter(t => t.hp > 0 && fogVisible[t.x]?.[t.y])
        .map(t => {
          const { isoX, isoY } = tileToSvg(t.x, t.y);
          const r = t.id === -1 ? ARCHER_TOWER_RANGE : ENEMY_TOWER_RANGE;
          return (
            <ellipse
              key={`etower-range-${t.id}`}
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + TILE_SIZE / 4}
              rx={r * TILE_SIZE}
              ry={(r * TILE_SIZE) / 2}
              fill="none"
              stroke="#a855f7"
              strokeWidth={1}
              strokeDasharray="5 3"
              opacity={0.25}
              pointerEvents="none"
            />
          );
        })}
      {/* Player barn defense range ring */}
      {(() => {
        const { isoX, isoY } = tileToSvg(BARN_POS.x, BARN_POS.y);
        return (
          <ellipse
            cx={isoX + TILE_SIZE / 2}
            cy={isoY + TILE_SIZE / 4}
            rx={BARN_DEFENSE_RANGE * TILE_SIZE}
            ry={(BARN_DEFENSE_RANGE * TILE_SIZE) / 2}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={1}
            strokeDasharray="5 3"
            opacity={0.2}
            pointerEvents="none"
          />
        );
      })()}

      {/* Tower range rings — faint ellipses for all built defensive towers */}
      {(() => {
        const TOWER_RANGES: Partial<Record<BuildingType, number>> = {
          watchtower: guardTowerResearched
            ? WATCHTOWER_ATTACK_RANGE + 1
            : WATCHTOWER_ATTACK_RANGE,
          frostTower: FROST_TOWER_RANGE,
          ballista: BALLISTA_RANGE,
          poisonTower: POISON_TOWER_RANGE,
        };
        return placedBuildings
          .filter(
            b =>
              b.hp > 0 && !b.constructing && TOWER_RANGES[b.type] !== undefined
          )
          .map(b => {
            const r = TOWER_RANGES[b.type]!;
            const { isoX, isoY } = tileToSvg(b.x, b.y);
            const cx = isoX + TILE_SIZE,
              cy = isoY + TILE_SIZE / 2;
            return (
              <ellipse
                key={`range-${b.id}`}
                cx={cx}
                cy={cy}
                rx={r * TILE_SIZE}
                ry={(r * TILE_SIZE) / 2}
                fill="none"
                stroke={TOWER_COLORS[b.type] ?? '#94a3b8'}
                strokeWidth={1.5}
                strokeDasharray="6 4"
                opacity={0.25}
                pointerEvents="none"
              />
            );
          });
      })()}

      {buildMode &&
        ghostTile &&
        ghostTile.x >= 0 &&
        ghostTile.y >= 0 &&
        ghostTile.x < GRID_SIZE &&
        ghostTile.y < GRID_SIZE &&
        (() => {
          const valid = !isTileOccupied(ghostTile.x, ghostTile.y);
          const { isoX, isoY } = tileToSvg(ghostTile.x, ghostTile.y);
          const pts = [
            [isoX, isoY + TILE_SIZE / 2],
            [isoX + TILE_SIZE, isoY],
            [isoX + TILE_SIZE * 2, isoY + TILE_SIZE / 2],
            [isoX + TILE_SIZE, isoY + TILE_SIZE],
          ]
            .map(p => p.join(','))
            .join(' ');
          // Show range ring for tower placements
          const ghostRange = GHOST_RANGES[buildMode];
          const gcx = isoX + TILE_SIZE,
            gcy = isoY + TILE_SIZE / 2;
          return (
            <g pointerEvents="none">
              {ghostRange && (
                <ellipse
                  cx={gcx}
                  cy={gcy}
                  rx={ghostRange.r * TILE_SIZE}
                  ry={(ghostRange.r * TILE_SIZE) / 2}
                  fill={`${ghostRange.color}15`}
                  stroke={ghostRange.color}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  opacity={0.7}
                />
              )}
              <polygon
                points={pts}
                fill={valid ? 'rgba(74,222,128,0.35)' : 'rgba(239,68,68,0.35)'}
                stroke={valid ? '#4ade80' : '#ef4444'}
                strokeWidth={3}
                strokeDasharray="8 4"
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE / 2 + 10}
                textAnchor="middle"
                fontSize="28"
                opacity={0.85}
              >
                {BUILDING_EMOJI[buildMode]}
              </text>
            </g>
          );
        })()}
    </>
  );
};
