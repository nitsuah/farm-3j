import React from 'react';

import { TILE_SIZE, WARCHIEF_STOMP_RADIUS, WARLORD_WAR_CRY_RADIUS } from '../game/constants';
import { HpBar } from './HpBar';
import { tileToSvg } from '../game/map';
import type { EnemyTroll, EnemyWarchief, EnemyWarlord } from '../game/types';

interface EnemyEliteLayerProps {
  anySelected: boolean;
  enemyTrolls: EnemyTroll[];
  enemyWarchiefs: EnemyWarchief[];
  enemyWarlords: EnemyWarlord[];
  fogVisible: boolean[][];
  handleAttackTroll: (trollId: number, e: React.MouseEvent) => void;
  handleAttackWarchief: (warchiefId: number, e: React.MouseEvent) => void;
  handleAttackWarlord: (warlordId: number, e: React.MouseEvent) => void;
}

export const EnemyEliteLayer: React.FC<EnemyEliteLayerProps> = ({
  anySelected,
  enemyTrolls,
  enemyWarchiefs,
  enemyWarlords,
  fogVisible,
  handleAttackTroll,
  handleAttackWarchief,
  handleAttackWarlord,
}) => {
  return (
    <>
      {/* Enemy Troll Archers */}
      {enemyTrolls
        .filter(t => t.hp > 0 && fogVisible[Math.round(t.x)]?.[Math.round(t.y)])
        .map(t => {
          const { isoX, isoY } = tileToSvg(t.x, t.y);
          const hp = t.hp / t.maxHp;
          return (
            <g
              key={`troll-${t.id}`}
              style={{ cursor: anySelected ? 'crosshair' : 'default' }}
              onContextMenu={e => handleAttackTroll(t.id, e)}
            >
              {/* Body */}
              <ellipse
                cx={isoX + TILE_SIZE / 2}
                cy={isoY + 24}
                rx={9}
                ry={12}
                fill={t.state === 'attacking' ? '#16a34a' : '#15803d'}
                stroke="#14532d"
                strokeWidth={2}
              />
              {/* Head — big troll head */}
              <circle
                cx={isoX + TILE_SIZE / 2}
                cy={isoY + 10}
                r={9}
                fill="#4ade80"
                stroke="#14532d"
                strokeWidth={1.5}
              />
              {/* Tusks */}
              <line
                x1={isoX + TILE_SIZE / 2 - 5}
                y1={isoY + 16}
                x2={isoX + TILE_SIZE / 2 - 7}
                y2={isoY + 20}
                stroke="#fde68a"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={isoX + TILE_SIZE / 2 + 5}
                y1={isoY + 16}
                x2={isoX + TILE_SIZE / 2 + 7}
                y2={isoY + 20}
                stroke="#fde68a"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* Bow */}
              <path
                d={`M${isoX + TILE_SIZE / 2 + 12},${isoY + 8} Q${isoX + TILE_SIZE / 2 + 22},${isoY + 15} ${isoX + TILE_SIZE / 2 + 12},${isoY + 22}`}
                fill="none"
                stroke="#92400e"
                strokeWidth={2.5}
              />
              {/* Arrow */}
              <line
                x1={isoX + TILE_SIZE / 2 + 12}
                y1={isoY + 15}
                x2={isoX + TILE_SIZE / 2 - 2}
                y2={isoY + 15}
                stroke="#d97706"
                strokeWidth={1.5}
              />
              {/* Attack range ring when attacking */}
              {t.state === 'attacking' && (
                <circle
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 20}
                  r={30}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.4}
                />
              )}
              {/* Label */}
              <text
                x={isoX + TILE_SIZE / 2}
                y={isoY - 4}
                textAnchor="middle"
                fontSize="8"
                fill="#86efac"
                fontWeight="bold"
              >
                TROLL
              </text>
              {/* HP bar */}
              <HpBar x={isoX + TILE_SIZE / 2 - 16} y={isoY - 10} width={32} height={4} hpPct={hp} fill="#22c55e" />
            </g>
          );
        })}

      {/* Enemy Warchiefs */}
      {enemyWarchiefs
        .filter(
          wc2 =>
            wc2.hp > 0 && fogVisible[Math.round(wc2.x)]?.[Math.round(wc2.y)]
        )
        .map(wc2 => {
          const { isoX, isoY } = tileToSvg(wc2.x, wc2.y);
          const hp = wc2.hp / wc2.maxHp;
          const cx = isoX + TILE_SIZE / 2;
          const stomping = wc2.state === 'stomping';
          return (
            <g
              key={`warchief-${wc2.id}`}
              style={{ cursor: anySelected ? 'crosshair' : 'default' }}
              onContextMenu={e => handleAttackWarchief(wc2.id, e)}
            >
              {/* Stomp shockwave ring */}
              {stomping && (
                <circle
                  cx={cx}
                  cy={isoY + 22}
                  r={WARCHIEF_STOMP_RADIUS * TILE_SIZE * 0.5}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="7 3"
                  opacity={0.65}
                />
              )}
              {/* Heavy armored body */}
              <ellipse
                cx={cx}
                cy={isoY + 27}
                rx={14}
                ry={16}
                fill={stomping ? '#b91c1c' : '#7f1d1d'}
                stroke="#450a0a"
                strokeWidth={2.5}
              />
              {/* Shoulder armor plates */}
              <ellipse
                cx={cx - 14}
                cy={isoY + 18}
                rx={7}
                ry={5}
                fill="#374151"
                stroke="#1f2937"
                strokeWidth={1.5}
              />
              <ellipse
                cx={cx + 14}
                cy={isoY + 18}
                rx={7}
                ry={5}
                fill="#374151"
                stroke="#1f2937"
                strokeWidth={1.5}
              />
              {/* Head */}
              <circle
                cx={cx}
                cy={isoY + 10}
                r={9}
                fill="#fbbf24"
                stroke="#78350f"
                strokeWidth={2}
              />
              {/* Crown */}
              <polygon
                points={`${cx - 9},${isoY + 3} ${cx - 6},${isoY - 3} ${cx},${isoY + 1} ${cx + 6},${isoY - 3} ${cx + 9},${isoY + 3}`}
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth={1.5}
              />
              {/* Crown gems */}
              <circle cx={cx - 6} cy={isoY - 3} r={2} fill="#ef4444" />
              <circle cx={cx} cy={isoY + 1} r={2} fill="#22d3ee" />
              <circle cx={cx + 6} cy={isoY - 3} r={2} fill="#ef4444" />
              {/* Eyes */}
              <circle cx={cx - 3} cy={isoY + 10} r={2} fill="#1c1917" />
              <circle cx={cx + 3} cy={isoY + 10} r={2} fill="#1c1917" />
              {/* Battle axe */}
              <line
                x1={cx + 14}
                y1={isoY + 6}
                x2={cx + 14}
                y2={isoY + 40}
                stroke="#6b7280"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <ellipse
                cx={cx + 20}
                cy={isoY + 10}
                rx={8}
                ry={6}
                fill="#9ca3af"
                stroke="#374151"
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={isoY - 9}
                textAnchor="middle"
                fontSize="9"
                fill="#fbbf24"
                fontWeight="bold"
              >
                👑 WARCHIEF
              </text>
              <HpBar x={cx - 22} y={isoY - 15} width={44} height={4} hpPct={hp} fill="#ef4444" />
            </g>
          );
        })}
      {/* Enemy Warlords (wave 20+ boss) */}
      {enemyWarlords
        .filter(
          wl =>
            wl.hp > 0 && fogVisible[Math.round(wl.x)]?.[Math.round(wl.y)]
        )
        .map(wl => {
          const { isoX, isoY } = tileToSvg(wl.x, wl.y);
          const hp = wl.hp / wl.maxHp;
          const cx = isoX + TILE_SIZE / 2;
          const now = Date.now();
          const warCryActive = now - wl.lastWarCryAt < 3000;
          return (
            <g
              key={`warlord-${wl.id}`}
              style={{ cursor: anySelected ? 'crosshair' : 'default' }}
              onContextMenu={e => handleAttackWarlord(wl.id, e)}
            >
              {/* War Cry aura ring */}
              {warCryActive && (
                <circle
                  cx={cx}
                  cy={isoY + 25}
                  r={WARLORD_WAR_CRY_RADIUS * TILE_SIZE * 0.5}
                  fill="rgba(168,85,247,0.08)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  opacity={0.7}
                />
              )}
              {/* Massive armored body */}
              <ellipse
                cx={cx}
                cy={isoY + 30}
                rx={17}
                ry={20}
                fill={wl.state === 'attacking' ? '#6d28d9' : '#4c1d95'}
                stroke="#2e1065"
                strokeWidth={3}
              />
              {/* Shoulder plates — bigger than warchief */}
              <ellipse cx={cx - 18} cy={isoY + 19} rx={9} ry={6} fill="#1e1b4b" stroke="#312e81" strokeWidth={2} />
              <ellipse cx={cx + 18} cy={isoY + 19} rx={9} ry={6} fill="#1e1b4b" stroke="#312e81" strokeWidth={2} />
              {/* Chest plate */}
              <rect
                x={cx - 10}
                y={isoY + 18}
                width={20}
                height={18}
                rx={3}
                fill="#3730a3"
                stroke="#1e1b4b"
                strokeWidth={1.5}
              />
              {/* Head — larger, horned war helm */}
              <circle cx={cx} cy={isoY + 9} r={11} fill="#c4b5fd" stroke="#4c1d95" strokeWidth={2.5} />
              {/* War helm visor */}
              <rect x={cx - 8} y={isoY + 8} width={16} height={6} rx={2} fill="#3730a3" stroke="#1e1b4b" strokeWidth={1} />
              {/* Helm horns */}
              <polygon
                points={`${cx - 9},${isoY + 3} ${cx - 12},${isoY - 8} ${cx - 6},${isoY + 1}`}
                fill="#7c3aed"
                stroke="#4c1d95"
                strokeWidth={1}
              />
              <polygon
                points={`${cx + 9},${isoY + 3} ${cx + 12},${isoY - 8} ${cx + 6},${isoY + 1}`}
                fill="#7c3aed"
                stroke="#4c1d95"
                strokeWidth={1}
              />
              {/* Eyes — glowing purple */}
              <circle cx={cx - 3.5} cy={isoY + 10} r={2.5} fill="#a855f7" />
              <circle cx={cx + 3.5} cy={isoY + 10} r={2.5} fill="#a855f7" />
              {/* Great sword */}
              <line x1={cx + 17} y1={isoY + 2} x2={cx + 17} y2={isoY + 48} stroke="#94a3b8" strokeWidth={5} strokeLinecap="round" />
              <polygon
                points={`${cx + 11},${isoY + 6} ${cx + 23},${isoY + 6} ${cx + 17},${isoY - 6}`}
                fill="#e2e8f0"
                stroke="#64748b"
                strokeWidth={1.5}
              />
              {/* Shield */}
              <ellipse cx={cx - 18} cy={isoY + 26} rx={7} ry={10} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={2} />
              <line x1={cx - 18} y1={isoY + 16} x2={cx - 18} y2={isoY + 36} stroke="#3b82f6" strokeWidth={1.5} opacity={0.5} />
              {/* Label */}
              <text
                x={cx}
                y={isoY - 13}
                textAnchor="middle"
                fontSize="9"
                fill="#c4b5fd"
                fontWeight="bold"
              >
                ⚔ WARLORD
              </text>
              <HpBar x={cx - 26} y={isoY - 19} width={52} height={5} hpPct={hp} fill="#a855f7" />
            </g>
          );
        })}
    </>
  );
};
