import React from 'react';

import type { WorkerState } from '../game/types';
import { BARN_POS, PLAYER_BARN_MAX_HP, TILE_SIZE } from '../game/constants';
import { svgToTile, tileDist, tileToSvg } from '../game/map';
import type { BuildingType, EnemyGrunt } from '../game/types';
import { HpBar } from './HpBar';
import { isoBox } from './isoBox';
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

export const PlayerBarnLayer: React.FC<PlayerBarnLayerProps> = React.memo(
  ({
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

        {/* Player barn — isometric 3D box */}
        {(() => {
          const { isoX, isoY } = tileToSvg(BARN_POS.x, BARN_POS.y);
          const hpPct = playerBarnHp / PLAYER_BARN_MAX_HP;
          const hasGarrison = garrisoned.length > 0;
          const barnUnderFire = enemyGrunts.some(
            g => tileDist(g.x, g.y, BARN_POS.x, BARN_POS.y) <= 4
          );
          const lastStand = hpPct < 0.25;
          const barnDamaged = hpPct < 0.5;
          const ts = TILE_SIZE;
          const h = 38;
          // isoBox tile corners
          const lx = isoX,
            ly = isoY + ts / 2;
          const rx2 = isoX + 2 * ts,
            ry2 = isoY + ts / 2;
          const bx2 = isoX + ts,
            by2 = isoY + ts;
          const tx2 = isoX + ts,
            ty2 = isoY;
          // Roof ridge sits above the top face
          const roofH = 16;
          const ridgeLx = (lx + tx2) / 2,
            ridgeLy = (ly - h + ty2 - h) / 2 - roofH;
          const ridgeRx = (tx2 + rx2) / 2,
            ridgeRy = (ty2 - h + ry2 - h) / 2 - roofH;
          const sw = lastStand ? 3 : hasGarrison ? 2.5 : 1.5;
          const stroke = lastStand
            ? '#ef4444'
            : hasGarrison
              ? '#22d3ee'
              : '#92400e';
          const bcx = isoX + ts;
          const bcy = isoY + ts * 0.4;
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
              {/* Attack warning ring */}
              {(lastStand || barnUnderFire) && (
                <polygon
                  points={`${lx},${ly} ${tx2},${ty2} ${rx2},${ry2} ${bx2},${by2}`}
                  fill="none"
                  stroke={lastStand ? '#ef4444' : '#fbbf24'}
                  strokeWidth={lastStand ? 4 : 2}
                  strokeDasharray={lastStand ? '8 4' : '6 3'}
                  opacity={0.7}
                />
              )}
              {/* Main barn walls */}
              {isoBox(
                isoX,
                isoY,
                h,
                '#b45309',
                '#fef3c7',
                '#fde68a',
                stroke,
                sw
              )}
              {/* Gable roof — left slope (NW face, viewer-facing) */}
              <polygon
                points={`${lx},${ly - h} ${bx2},${by2 - h} ${ridgeLx + (ridgeRx - ridgeLx) / 2},${(ridgeLy + ridgeRy) / 2 - 2}`}
                fill="#7c2d12"
                stroke={stroke}
                strokeWidth={sw * 0.8}
              />
              {/* Gable roof — right slope (SE face) */}
              <polygon
                points={`${bx2},${by2 - h} ${rx2},${ry2 - h} ${ridgeLx + (ridgeRx - ridgeLx) / 2},${(ridgeLy + ridgeRy) / 2 - 2}`}
                fill="#9a3412"
                stroke={stroke}
                strokeWidth={sw * 0.8}
              />
              {/* Barn label */}
              <text
                x={isoX + ts}
                y={isoY - h + 12}
                textAnchor="middle"
                fontSize="16"
                pointerEvents="none"
              >
                🏚️
              </text>
              {/* Barn name tag */}
              <text
                x={isoX + ts}
                y={isoY - h - roofH - 4}
                textAnchor="middle"
                fontSize="9"
                fill={lastStand ? '#fca5a5' : '#fde68a'}
                fontWeight="bold"
                pointerEvents="none"
              >
                {lastStand ? '⚔ LAST STAND!' : 'HOME BARN'}
              </text>
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
                  labelText=""
                  labelColor="#ef4444"
                  labelY={isoY - h - roofH - 4}
                />
              )}
              {/* HP bar */}
              <HpBar
                x={isoX - 4}
                y={isoY - h - roofH - 16}
                width={ts * 2 + 8}
                height={6}
                hpPct={hpPct}
                fill={
                  hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444'
                }
                rx={3}
              />
              {/* Garrison badge */}
              {hasGarrison && (
                <>
                  <circle
                    cx={isoX + ts * 2 - 10}
                    cy={isoY - h + 8}
                    r={10}
                    fill="#0c4a6e"
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                    pointerEvents="none"
                  />
                  <text
                    x={isoX + ts * 2 - 10}
                    y={isoY - h + 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#7dd3fc"
                    fontWeight="bold"
                    pointerEvents="none"
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
  }
);
