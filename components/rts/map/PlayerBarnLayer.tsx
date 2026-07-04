import React from 'react';

import type { WorkerState } from '../game/types';
import { BARN_POS, PLAYER_BARN_MAX_HP, TILE_SIZE } from '../game/constants';
import { svgToTile, tileDist, tileToSvg } from '../game/map';
import type { BuildingType, EnemyGrunt } from '../game/types';
import { HpBar } from './HpBar';
import { StructureDamageSmoke } from './StructureDamageSmoke';
import { StructureFireEffect } from './StructureFireEffect';

interface PlayerBarnLayerProps {
  anySelected: boolean;
  buildMode: BuildingType | null;
  clientToSvg: (cx: number, cy: number) => DOMPoint | null;
  enemyGrunts: EnemyGrunt[];
  fogVisible: boolean[][];
  garrisoned: WorkerState[];
  handleGarrison: () => void;
  playerBarnHp: number;
  rallyPoint: { x: number; y: number } | null;
  selectedType: 'worker' | 'farmhouse' | 'building' | null;
  setRallyPoint: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  setSelectedBuildingId: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
  setWorkers: React.Dispatch<React.SetStateAction<WorkerState[]>>;
}

export const PlayerBarnLayer: React.FC<PlayerBarnLayerProps> = React.memo(({
  anySelected,
  buildMode,
  clientToSvg,
  enemyGrunts,
  fogVisible,
  garrisoned,
  handleGarrison,
  playerBarnHp,
  rallyPoint,
  selectedType,
  setRallyPoint,
  setSelectedBuildingId,
  setSelectedType,
  setWorkers,
}) => {
  return (
    <>
      {/* Rally point flag */}
      {rallyPoint &&
        fogVisible[rallyPoint.x]?.[rallyPoint.y] &&
        (() => {
          const { isoX, isoY } = tileToSvg(rallyPoint.x, rallyPoint.y);
          return (
            <g pointerEvents="none">
              <line
                x1={isoX + TILE_SIZE / 2}
                y1={isoY + TILE_SIZE / 2}
                x2={isoX + TILE_SIZE / 2}
                y2={isoY - 20}
                stroke="#38bdf8"
                strokeWidth={2}
              />
              <polygon
                points={`${isoX + TILE_SIZE / 2},${isoY - 20} ${isoX + TILE_SIZE / 2 + 14},${isoY - 12} ${isoX + TILE_SIZE / 2},${isoY - 4}`}
                fill="#38bdf8"
              />
            </g>
          );
        })()}

      {/* Player barn */}
      {(() => {
        const { isoX, isoY } = tileToSvg(BARN_POS.x, BARN_POS.y);
        const hpPct = playerBarnHp / PLAYER_BARN_MAX_HP;
        const hasGarrison = garrisoned.length > 0;
        const barnUnderFire = enemyGrunts.some(
          g => tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) <= 4
        );
        const lastStand = hpPct < 0.25;
        const barnDamaged = hpPct < 0.5;
        const bcx = isoX + TILE_SIZE / 2;
        const bcy = isoY + TILE_SIZE * 0.3;
        const bt = (Date.now() / 600) % (2 * Math.PI);
        return (
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (!buildMode) {
                setSelectedType('farmhouse');
                setSelectedBuildingId(null);
                setWorkers(ws => ws.map(w => ({ ...w, selected: false })));
              }
            }}
            onContextMenu={e => {
              e.preventDefault();
              if (anySelected && selectedType === 'worker') {
                handleGarrison();
                return;
              }
              if (selectedType === 'farmhouse') {
                const coords = clientToSvg(e.clientX, e.clientY);
                if (coords) {
                  const { tx, ty } = svgToTile(coords.x, coords.y);
                  setRallyPoint({ x: tx, y: ty });
                }
              }
            }}
          >
            {lastStand && (
              <circle
                cx={isoX + TILE_SIZE / 2}
                cy={isoY + TILE_SIZE / 2}
                r={TILE_SIZE * 0.9}
                fill="none"
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="6 3"
                opacity={0.7}
              />
            )}
            {barnUnderFire && (
              <circle
                cx={isoX + TILE_SIZE / 2}
                cy={isoY + TILE_SIZE / 2}
                r={TILE_SIZE * 0.7}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="4 3"
                opacity={0.5}
              />
            )}
            <rect
              x={isoX}
              y={isoY}
              width={TILE_SIZE}
              height={TILE_SIZE}
              fill="#fde68a"
              stroke={
                lastStand ? '#ef4444' : hasGarrison ? '#22d3ee' : '#b45309'
              }
              strokeWidth={lastStand ? 7 : hasGarrison ? 5 : 6}
              rx={12}
            />
            <polygon
              points={[
                [isoX, isoY],
                [isoX + TILE_SIZE / 2, isoY - 32],
                [isoX + TILE_SIZE, isoY],
              ]
                .map(p => p.join(','))
                .join(' ')}
              fill="#b91c1c"
              stroke="#7f1d1d"
              strokeWidth={4}
            />
            <text
              x={isoX + TILE_SIZE / 2}
              y={isoY + 44}
              textAnchor="middle"
              fontSize="22"
            >
              🏚️
            </text>
            {!lastStand && (
              <text
                x={isoX + TILE_SIZE / 2}
                y={isoY - 20}
                textAnchor="middle"
                fontSize="11"
                fill="#ef4444"
                fontWeight="bold"
              />
            )}
            {barnDamaged && !lastStand && (
              <StructureDamageSmoke
                cx={bcx}
                cy={bcy}
                t={bt}
                colors={['#374151', '#6b7280', '#9ca3af']}
                opacities={[0.55, 0.4, 0.25]}
              />
            )}
            {lastStand && (
              <StructureFireEffect
                cx={bcx}
                cy={bcy}
                labelText="⚔ LAST STAND!"
                labelColor="#ef4444"
                labelY={isoY - 20}
              />
            )}
            <HpBar
              x={isoX - 8}
              y={isoY - 14}
              width={TILE_SIZE + 16}
              height={8}
              hpPct={hpPct}
              fill={hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444'}
              rx={4}
            />
            {hasGarrison && (
              <>
                <circle
                  cx={isoX + TILE_SIZE - 6}
                  cy={isoY + 10}
                  r={10}
                  fill="#0c4a6e"
                  stroke="#22d3ee"
                  strokeWidth={2}
                />
                <text
                  x={isoX + TILE_SIZE - 6}
                  y={isoY + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#7dd3fc"
                  fontWeight="bold"
                >
                  {garrisoned.length}
                </text>
              </>
            )}
          </g>
        );
      })()}
    </>
  );
});
