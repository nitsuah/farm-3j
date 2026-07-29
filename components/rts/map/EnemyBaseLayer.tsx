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
                {isoBox(isoX, isoY, h, '#450a0a', '#7f1d1d', '#991b1b', stroke, sw)}
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
            const isArcher = t.id === -1;
            const fill1 = isArcher ? '#3b0764' : '#7f1d1d';
            const fill2 = isArcher ? '#581c87' : '#991b1b';
            const fill3 = isArcher ? '#7c3aed' : '#b91c1c';
            const stroke1 = isArcher ? '#a21caf' : '#dc2626';
            const stroke2 = isArcher ? '#a855f7' : '#ef4444';
            const label = isArcher ? 'ARCHER' : 'TOWER';
            const labelColor = isArcher ? '#e879f9' : '#fca5a5';
            const barColor = isArcher ? '#a855f7' : '#ef4444';
            return (
              <g
                key={`etower-${t.id}`}
                style={{ cursor: 'crosshair' }}
                onContextMenu={e => handleAttackEnemyTower(t.id, t.x, t.y, e)}
              >
                {isArcher ? (
                  <>
                    <rect
                      x={isoX + TILE_SIZE / 4}
                      y={isoY - 8}
                      width={TILE_SIZE * 1.5}
                      height={TILE_SIZE * 0.85}
                      fill={fill1}
                      stroke={stroke1}
                      strokeWidth={3}
                      rx={5}
                    />
                    <rect
                      x={isoX + TILE_SIZE / 2 - 5}
                      y={isoY - 34}
                      width={10}
                      height={30}
                      fill={fill2}
                      stroke={stroke2}
                      strokeWidth={2}
                    />
                    <rect
                      x={isoX + TILE_SIZE / 2 - 14}
                      y={isoY - 42}
                      width={10}
                      height={14}
                      fill={fill3}
                      stroke={stroke2}
                      strokeWidth={2}
                    />
                    <rect
                      x={isoX + TILE_SIZE / 2 + 4}
                      y={isoY - 42}
                      width={10}
                      height={14}
                      fill={fill3}
                      stroke={stroke2}
                      strokeWidth={2}
                    />
                  </>
                ) : (
                  <>
                    <rect
                      x={isoX + TILE_SIZE / 4}
                      y={isoY}
                      width={TILE_SIZE / 2}
                      height={TILE_SIZE * 0.8}
                      fill={fill1}
                      stroke={stroke1}
                      strokeWidth={3}
                      rx={4}
                    />
                    <rect
                      x={isoX + TILE_SIZE / 4 - 6}
                      y={isoY - 8}
                      width={TILE_SIZE / 2 + 12}
                      height={16}
                      fill={fill2}
                      stroke={stroke2}
                      strokeWidth={2}
                      rx={3}
                    />
                    <rect
                      x={isoX + TILE_SIZE / 4 + 2}
                      y={isoY - 20}
                      width={8}
                      height={14}
                      fill={fill3}
                      stroke={stroke2}
                      strokeWidth={1.5}
                    />
                    <rect
                      x={isoX + TILE_SIZE / 2 + 2}
                      y={isoY - 20}
                      width={8}
                      height={14}
                      fill={fill3}
                      stroke={stroke2}
                      strokeWidth={1.5}
                    />
                  </>
                )}
                <text
                  x={isoX + TILE_SIZE}
                  y={isoY + 38}
                  textAnchor="middle"
                  fontSize="16"
                >
                  🏹
                </text>
                <text
                  x={isoX + TILE_SIZE}
                  y={isoY - 48}
                  textAnchor="middle"
                  fontSize="8"
                  fill={labelColor}
                  fontWeight="bold"
                >
                  {label}
                </text>
                <HpBar
                  x={isoX + TILE_SIZE / 4}
                  y={isoY - 58}
                  width={TILE_SIZE / 2}
                  height={5}
                  hpPct={hpPct}
                  fill={barColor}
                />
              </g>
            );
          })}

        {/* Enemy fortification walls */}
        {enemyWalls
          .filter(ew => ew.hp > 0 && fogVisible[ew.x]?.[ew.y])
          .map(ew => {
            const { isoX, isoY } = tileToSvg(ew.x, ew.y);
            const hpPct = ew.hp / ew.maxHp;
            return (
              <g
                key={`ewall-${ew.id}`}
                style={{ cursor: anySelected ? 'crosshair' : 'default' }}
                onContextMenu={e => handleAttackEnemyWall(ew.id, ew.x, ew.y, e)}
              >
                <rect
                  x={isoX + 8}
                  y={isoY + 10}
                  width={TILE_SIZE - 16}
                  height={TILE_SIZE * 0.6}
                  fill="#450a0a"
                  stroke="#7f1d1d"
                  strokeWidth={3}
                  rx={2}
                />
                {[0.25, 0.5, 0.75].map(f => (
                  <rect
                    key={f}
                    x={isoX + 8 + f * (TILE_SIZE - 16) - 4}
                    y={isoY + 4}
                    width={8}
                    height={12}
                    fill="#7f1d1d"
                    stroke="#991b1b"
                    strokeWidth={1.5}
                    rx={1}
                  />
                ))}
                <HpBar
                  x={isoX + 8}
                  y={isoY - 2}
                  width={TILE_SIZE - 16}
                  height={5}
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
