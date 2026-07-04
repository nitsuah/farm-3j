import React from 'react';

import {
  ENEMY_BARN_MAX_HP,
  ENEMY_BARN_POS,
  TILE_SIZE,
} from '../game/constants';
import { tileToSvg } from '../game/map';
import type { EnemyTower } from '../game/types';

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

export const EnemyBaseLayer: React.FC<EnemyBaseLayerProps> = ({
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
          const { isoX, isoY } = tileToSvg(ENEMY_BARN_POS.x, ENEMY_BARN_POS.y);
          const hpPct = enemyBarnHp / ENEMY_BARN_MAX_HP;
          const cx = isoX + TILE_SIZE / 2;
          const cy = isoY + TILE_SIZE * 0.3;
          const t = (Date.now() / 600) % (2 * Math.PI);
          const damaged = hpPct < 0.5;
          const critical = hpPct < 0.25;
          return (
            <g
              style={{ cursor: 'crosshair' }}
              onContextMenu={handleAttackEnemyBarn}
            >
              <rect
                x={isoX}
                y={isoY}
                width={TILE_SIZE}
                height={TILE_SIZE}
                fill="#7f1d1d"
                stroke={critical ? '#fbbf24' : '#ef4444'}
                strokeWidth={critical ? 8 : 6}
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
                fill="#991b1b"
                stroke="#dc2626"
                strokeWidth={4}
              />
              <text x={cx} y={isoY + 44} textAnchor="middle" fontSize="22">
                🏴‍☠️
              </text>
              {damaged && (
                <g pointerEvents="none">
                  <circle
                    cx={cx - 8}
                    cy={cy - 18 - Math.sin(t) * 4}
                    r={6}
                    fill="#374151"
                    opacity={0.6}
                  />
                  <circle
                    cx={cx + 6}
                    cy={cy - 28 - Math.sin(t + 1) * 5}
                    r={5}
                    fill="#4b5563"
                    opacity={0.45}
                  />
                  <circle
                    cx={cx}
                    cy={cy - 38 - Math.sin(t + 2) * 3}
                    r={4}
                    fill="#1f2937"
                    opacity={0.3}
                  />
                </g>
              )}
              {critical && (
                <g pointerEvents="none">
                  <ellipse
                    cx={cx}
                    cy={cy - 4}
                    rx={9}
                    ry={6}
                    fill="#f97316"
                    opacity={0.85}
                  />
                  <ellipse
                    cx={cx - 5}
                    cy={cy - 2}
                    rx={5}
                    ry={4}
                    fill="#dc2626"
                    opacity={0.75}
                  />
                  <ellipse
                    cx={cx + 5}
                    cy={cy - 2}
                    rx={5}
                    ry={4}
                    fill="#ef4444"
                    opacity={0.7}
                  />
                  <ellipse
                    cx={cx}
                    cy={cy - 14}
                    rx={5}
                    ry={10}
                    fill="#fbbf24"
                    opacity={0.9}
                  />
                  <ellipse
                    cx={cx}
                    cy={cy - 18}
                    rx={3}
                    ry={6}
                    fill="#fef08a"
                    opacity={0.8}
                  />
                  <text
                    x={cx}
                    y={isoY - 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#fbbf24"
                    fontWeight="bold"
                  >
                    ☠ COLLAPSING!
                  </text>
                </g>
              )}
              <rect
                x={isoX - 8}
                y={isoY - 14}
                width={TILE_SIZE + 16}
                height={8}
                fill="#1e293b"
                rx={4}
              />
              <rect
                x={isoX - 8}
                y={isoY - 14}
                width={(TILE_SIZE + 16) * hpPct}
                height={8}
                fill={
                  hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#ef4444'
                }
                rx={4}
              />
              <text
                x={cx}
                y={isoY - 18}
                textAnchor="middle"
                fontSize="11"
                fill="#fca5a5"
                fontWeight="bold"
              >
                ENEMY
              </text>
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
              <rect
                x={isoX + TILE_SIZE / 4}
                y={isoY - 58}
                width={TILE_SIZE / 2}
                height={5}
                fill="#1e293b"
                rx={2}
              />
              <rect
                x={isoX + TILE_SIZE / 4}
                y={isoY - 58}
                width={(TILE_SIZE / 2) * hpPct}
                height={5}
                fill={barColor}
                rx={2}
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
              <rect
                x={isoX + 8}
                y={isoY - 2}
                width={TILE_SIZE - 16}
                height={5}
                fill="#1e293b"
                rx={2}
              />
              <rect
                x={isoX + 8}
                y={isoY - 2}
                width={(TILE_SIZE - 16) * hpPct}
                height={5}
                fill="#ef4444"
                rx={2}
              />
            </g>
          );
        })}
    </>
  );
};
