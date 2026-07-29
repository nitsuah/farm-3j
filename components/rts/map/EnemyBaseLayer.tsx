import React from 'react';

import {
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  TILE_SIZE,
} from '../game/constants';
import { tileToSvg } from '../game/map';
import type { EnemyTower } from '../game/types';
import { HpBar } from './HpBar';
import { isoBox } from './isoBox';
import { StructureDamageSmoke } from './StructureDamageSmoke';
import { StructureFireEffect } from './StructureFireEffect';

interface EnemyBaseLayerProps {
  anySelected: boolean;
  enemyBarnHp: number;
  enemyTowers: EnemyTower[];
  enemyWalls: EnemyTower[];
  fogVisible: boolean[][];
  handleAttackEnemyBarn: (e: React.MouseEvent) => void;
  handleAttackEnemyTower: (
    towerId: number,
    tx: number,
    ty: number,
    e: React.MouseEvent
  ) => void;
  handleAttackEnemyWall: (
    wallId: number,
    tx: number,
    ty: number,
    e: React.MouseEvent
  ) => void;
}

export const EnemyBaseLayer: React.FC<EnemyBaseLayerProps> = React.memo(
  ({
    anySelected,
    enemyBarnHp,
    enemyTowers,
    enemyWalls,
    fogVisible,
    handleAttackEnemyBarn,
    handleAttackEnemyTower,
    handleAttackEnemyWall,
  }) => {
    return (
      <>
        {/* Enemy barn */}
        {enemyBarnHp > 0 &&
          (() => {
            const { isoX, isoY } = tileToSvg(
              ENEMY_BARN_POS.x,
              ENEMY_BARN_POS.y
            );
            const hpPct = enemyBarnHp / ENEMY_BARN_MAX_HP;
            const ts = TILE_SIZE;
            const h = 38;
            const roofH = 16;
            const damaged = hpPct < 0.5;
            const critical = hpPct < 0.25;
            const sw = critical ? 3 : 1.5;
            const stroke = critical ? '#fbbf24' : '#ef4444';
            // Tile corner coords (same geometry as isoBox)
            const lx = isoX,
              ly = isoY + ts / 2;
            const rx2 = isoX + 2 * ts,
              ry2 = isoY + ts / 2;
            const bx2 = isoX + ts,
              by2 = isoY + ts;
            // Roof ridge midpoint (gable peak)
            const ridgeMidX = isoX + ts;
            const ridgeMidY = isoY + ts / 4 - h - roofH - 2;
            const cx = isoX + ts;
            const cy = isoY + ts * 0.4;
            const t = (Date.now() / 600) % (2 * Math.PI);
            return (
              <g
                style={{ cursor: 'crosshair' }}
                onContextMenu={handleAttackEnemyBarn}
              >
                {isoBox(
                  isoX,
                  isoY,
                  h,
                  '#450a0a',
                  '#7f1d1d',
                  '#991b1b',
                  stroke,
                  sw
                )}
                {/* Gable roof — left slope */}
                <polygon
                  points={`${lx},${ly - h} ${bx2},${by2 - h} ${ridgeMidX},${ridgeMidY}`}
                  fill="#3b0000"
                  stroke={stroke}
                  strokeWidth={sw * 0.8}
                />
                {/* Gable roof — right slope */}
                <polygon
                  points={`${bx2},${by2 - h} ${rx2},${ry2 - h} ${ridgeMidX},${ridgeMidY}`}
                  fill="#4c0519"
                  stroke={stroke}
                  strokeWidth={sw * 0.8}
                />
                <text
                  x={cx}
                  y={isoY - h + 12}
                  textAnchor="middle"
                  fontSize="16"
                  pointerEvents="none"
                >
                  🏴‍☠️
                </text>
                <text
                  x={cx}
                  y={isoY - h - roofH - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill={critical ? '#fde68a' : '#fca5a5'}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {critical ? '☠ COLLAPSING!' : 'ENEMY BASE'}
                </text>
                {damaged && (
                  <StructureDamageSmoke
                    cx={cx}
                    cy={cy}
                    t={t}
                    colors={['#374151', '#4b5563', '#1f2937']}
                    opacities={[0.6, 0.45, 0.3]}
                  />
                )}
                {critical && (
                  <StructureFireEffect
                    cx={cx}
                    cy={cy}
                    labelText=""
                    labelColor="#fbbf24"
                    labelY={isoY - h - roofH - 4}
                  />
                )}
                <HpBar
                  x={isoX - 4}
                  y={isoY - h - roofH - 16}
                  width={ts * 2 + 8}
                  height={6}
                  hpPct={hpPct}
                  fill={
                    hpPct > 0.5
                      ? '#4ade80'
                      : hpPct > 0.25
                        ? '#fbbf24'
                        : '#ef4444'
                  }
                  rx={3}
                />
              </g>
            );
          })()}

        {/* Archer Tower now rendered by the shared enemy tower loop below (id -1) */}

        {/* Enemy fortress towers (wave 5/10/15) + pre-placed Archer Tower (id -1) */}
        {enemyTowers
          .filter(t => t.hp > 0 && fogVisible[t.x]?.[t.y])
          .map(t => {
            const { isoX, isoY } = tileToSvg(t.x, t.y);
            const hpPct = t.hp / t.maxHp;
            const ts = TILE_SIZE;
            const cx = isoX + ts;
            const isArcher = t.id === -1;
            const h = isArcher ? 56 : 44;
            const topDark = isArcher ? '#1e1b4b' : '#3b0000';
            const leftFill = isArcher ? '#3b0764' : '#7f1d1d';
            const rightFill = isArcher ? '#581c87' : '#991b1b';
            const stroke = isArcher ? '#a21caf' : '#dc2626';
            const accentColor = isArcher ? '#7c3aed' : '#b91c1c';
            const labelColor = isArcher ? '#e879f9' : '#fca5a5';
            const barColor = isArcher ? '#a855f7' : '#ef4444';
            const label = isArcher ? 'ARCHER TOWER' : 'FORTRESS TOWER';
            // Top-face corners (all at height h)
            const topWx = isoX,
              topWy = isoY + ts / 2 - h;
            const topNx = cx,
              topNy = isoY - h;
            const topEx = isoX + 2 * ts,
              topEy = isoY + ts / 2 - h;
            const topSx = cx,
              topSy = isoY + ts - h;
            return (
              <g
                key={`etower-${t.id}`}
                style={{ cursor: 'crosshair' }}
                onContextMenu={e => handleAttackEnemyTower(t.id, t.x, t.y, e)}
              >
                {/* Tower body */}
                {isoBox(isoX, isoY, h, topDark, leftFill, rightFill, stroke, 2)}
                {/* Battlements: 4 small raised blocks at mid-edge positions */}
                {(
                  [
                    [(topWx + topNx) / 2, (topWy + topNy) / 2],
                    [(topNx + topEx) / 2, (topNy + topEy) / 2],
                    [(topWx + topSx) / 2, (topWy + topSy) / 2],
                    [(topSx + topEx) / 2, (topSy + topEy) / 2],
                  ] as [number, number][]
                ).map(([bx, by], i) => (
                  <polygon
                    key={i}
                    points={`${bx - 7},${by} ${bx},${by - 5} ${bx + 7},${by} ${bx},${by + 4}`}
                    fill={accentColor}
                    stroke={stroke}
                    strokeWidth={1}
                  />
                ))}
                {/* Arrow slit on left face */}
                <polygon
                  points={`${isoX + 20},${topWy + 16} ${isoX + 26},${topWy + 10} ${isoX + 32},${topWy + 16} ${isoX + 26},${topWy + 36}`}
                  fill="#0f0a1a"
                  opacity={0.75}
                />
                {/* Spire / flag pole for archer tower */}
                {isArcher && (
                  <>
                    <line
                      x1={cx}
                      y1={topNy}
                      x2={cx}
                      y2={topNy - 20}
                      stroke="#6d28d9"
                      strokeWidth={2}
                    />
                    <polygon
                      points={`${cx},${topNy - 20} ${cx + 14},${topNy - 14} ${cx},${topNy - 8}`}
                      fill="#a855f7"
                    />
                  </>
                )}
                {/* Emoji icon on top face */}
                <text
                  x={cx}
                  y={topNy + 14}
                  textAnchor="middle"
                  fontSize="14"
                  pointerEvents="none"
                >
                  🏹
                </text>
                {/* Label + HP bar */}
                <text
                  x={cx}
                  y={isoY - h - (isArcher ? 24 : 8)}
                  textAnchor="middle"
                  fontSize="8"
                  fill={labelColor}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {label}
                </text>
                <HpBar
                  x={cx - 28}
                  y={isoY - h - (isArcher ? 36 : 20)}
                  width={56}
                  height={5}
                  hpPct={hpPct}
                  fill={barColor}
                />
              </g>
            );
          })}

        {/* Enemy fortification walls — isometric stone wall with battlements */}
        {enemyWalls
          .filter(ew => ew.hp > 0 && fogVisible[ew.x]?.[ew.y])
          .map(ew => {
            const { isoX, isoY } = tileToSvg(ew.x, ew.y);
            const hpPct = ew.hp / ew.maxHp;
            const ts = TILE_SIZE;
            const cx = isoX + ts;
            const h = 18;
            // Front edge of top face (left half, viewer-facing)
            const topWy = isoY + ts / 2 - h;
            const topSy = isoY + ts - h;
            return (
              <g
                key={`ewall-${ew.id}`}
                style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                onContextMenu={e => handleAttackEnemyWall(ew.id, ew.x, ew.y, e)}
              >
                {isoBox(
                  isoX,
                  isoY,
                  h,
                  '#290000',
                  '#450a0a',
                  '#600000',
                  '#7f1d1d',
                  1.5
                )}
                {/* Battlements: 3 merlons along the SW front edge */}
                {[0.2, 0.5, 0.8].map(f => {
                  const mx = isoX + f * ts;
                  const bmy = topWy + f * (topSy - topWy);
                  return (
                    <polygon
                      key={f}
                      points={`${mx - 6},${bmy + 2} ${mx},${bmy - 4} ${mx + 6},${bmy + 2} ${mx},${bmy + 8}`}
                      fill="#7f1d1d"
                      stroke="#991b1b"
                      strokeWidth={1}
                    />
                  );
                })}
                <HpBar
                  x={cx - 20}
                  y={isoY - h - 8}
                  width={40}
                  height={4}
                  hpPct={hpPct}
                  fill="#ef4444"
                />
              </g>
            );
          })}
      </>
    );
  }
);
