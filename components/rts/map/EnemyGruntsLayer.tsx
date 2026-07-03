import React from 'react';

import type { WorkerState } from '../game/types';
import { HERO_ITEM_DATA, TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';
import type { DroppedItem, EnemyGrunt, LootCrate } from '../game/types';

interface EnemyGruntsLayerProps {
  anySelected: boolean;
  commandMove: (
    targetX: number,
    targetY: number,
    gathering?: WorkerState['gathering'],
    attacking?: WorkerState['attacking']
  ) => void;
  droppedItems: DroppedItem[];
  enemyGrunts: EnemyGrunt[];
  fogVisible: boolean[][];
  gruntHitRef: React.RefObject<Map<number, number>>;
  handleAttackGrunt: (gruntId: number, e: React.MouseEvent) => void;
  lootCrates: LootCrate[];
}

export const EnemyGruntsLayer: React.FC<EnemyGruntsLayerProps> = ({
  anySelected,
  commandMove,
  droppedItems,
  enemyGrunts,
  fogVisible,
  gruntHitRef,
  handleAttackGrunt,
  lootCrates,
}) => {
  return (
    <>
      {/* Enemy grunts */}
      {enemyGrunts.map(g => {
        if (!fogVisible[Math.round(g.x)]?.[Math.round(g.y)]) return null;
        const { isoX, isoY } = tileToSvg(g.x, g.y);
        const hp = g.hp / g.maxHp;
        return (
          <g
            key={`grunt-${g.id}`}
            style={{ cursor: anySelected ? 'crosshair' : 'default' }}
            onContextMenu={e => handleAttackGrunt(g.id, e)}
          >
            {g.isBoss ? (
              <>
                {/* Boss War Bull — larger, darker, horns */}
                <ellipse
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 22}
                  rx={26}
                  ry={18}
                  fill={g.state === 'attacking' ? '#7f1d1d' : '#991b1b'}
                  stroke="#450a0a"
                  strokeWidth={4}
                />
                {/* Horns */}
                <path
                  d={`M${isoX + TILE_SIZE / 2 - 18},${isoY + 8} Q${isoX + TILE_SIZE / 2 - 28},${isoY - 10} ${isoX + TILE_SIZE / 2 - 14},${isoY + 2}`}
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                <path
                  d={`M${isoX + TILE_SIZE / 2 + 18},${isoY + 8} Q${isoX + TILE_SIZE / 2 + 28},${isoY - 10} ${isoX + TILE_SIZE / 2 + 14},${isoY + 2}`}
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                {/* Eyes */}
                <circle
                  cx={isoX + TILE_SIZE / 2 - 8}
                  cy={isoY + 16}
                  r={4}
                  fill="#dc2626"
                />
                <circle
                  cx={isoX + TILE_SIZE / 2 + 8}
                  cy={isoY + 16}
                  r={4}
                  fill="#dc2626"
                />
                <text
                  x={isoX + TILE_SIZE / 2}
                  y={isoY + 32}
                  textAnchor="middle"
                  fontSize="16"
                >
                  🐂
                </text>
                <text
                  x={isoX + TILE_SIZE / 2}
                  y={isoY - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#fca5a5"
                  fontWeight="bold"
                >
                  WAR BULL
                </text>
                <rect
                  x={isoX + TILE_SIZE / 2 - 20}
                  y={isoY - 5}
                  width={40}
                  height={5}
                  fill="#1e293b"
                  rx={2}
                />
                <rect
                  x={isoX + TILE_SIZE / 2 - 20}
                  y={isoY - 5}
                  width={40 * hp}
                  height={5}
                  fill="#dc2626"
                  rx={2}
                />
              </>
            ) : g.isSkeleton ? (
              <>
                {/* Skeleton grunt — purple-tinted risen dead */}
                <circle
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 18}
                  r={14}
                  fill={g.state === 'attacking' ? '#4c1d95' : '#6d28d9'}
                  stroke="#2e1065"
                  strokeWidth={2}
                />
                <text
                  x={isoX + TILE_SIZE / 2}
                  y={isoY + 26}
                  textAnchor="middle"
                  fontSize="14"
                >
                  💀
                </text>
                <text
                  x={isoX + TILE_SIZE / 2}
                  y={isoY - 5}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#c4b5fd"
                  fontWeight="bold"
                >
                  SKELETON
                </text>
                <rect
                  x={isoX + TILE_SIZE / 2 - 12}
                  y={isoY - 10}
                  width={24}
                  height={4}
                  fill="#1e293b"
                />
                <rect
                  x={isoX + TILE_SIZE / 2 - 12}
                  y={isoY - 10}
                  width={24 * hp}
                  height={4}
                  fill="#a855f7"
                />
              </>
            ) : (
              <>
                {(g.enragedUntil ?? 0) > Date.now() && (
                  <circle
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 18}
                    r={20}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth={3}
                    opacity={0.7}
                  />
                )}
                {(g.poisonedUntil ?? 0) > Date.now() && (
                  <circle
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 18}
                    r={19}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth={2.5}
                    opacity={0.65}
                    strokeDasharray="4 3"
                  />
                )}
                <circle
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 18}
                  r={16}
                  fill={
                    (g.enragedUntil ?? 0) > Date.now()
                      ? '#dc2626'
                      : g.state === 'attacking'
                        ? '#dc2626'
                        : '#f97316'
                  }
                  stroke="#7f1d1d"
                  strokeWidth={3}
                />
                <text
                  x={isoX + TILE_SIZE / 2}
                  y={isoY + 26}
                  textAnchor="middle"
                  fontSize="14"
                >
                  👹
                </text>
                {(g.enragedUntil ?? 0) > Date.now() && (
                  <text
                    x={isoX + TILE_SIZE / 2}
                    y={isoY - 5}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#fca5a5"
                    fontWeight="bold"
                  >
                    BERSERK!
                  </text>
                )}
                <rect
                  x={isoX + TILE_SIZE / 2 - 14}
                  y={isoY - 4}
                  width={28}
                  height={4}
                  fill="#1e293b"
                />
                <rect
                  x={isoX + TILE_SIZE / 2 - 14}
                  y={isoY - 4}
                  width={28 * hp}
                  height={4}
                  fill="#ef4444"
                />
              </>
            )}
            {(() => {
              const hit = gruntHitRef.current.get(g.id);
              const age = hit ? Date.now() - hit : 999;
              return age < 200 ? (
                <circle
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 18}
                  r={g.isBoss ? 26 : 18}
                  fill="#fff"
                  opacity={0.35 * (1 - age / 200)}
                  pointerEvents="none"
                />
              ) : null;
            })()}
          </g>
        );
      })}

      {/* Loot Crates */}
      {lootCrates.map(crate => {
        const { isoX, isoY } = tileToSvg(crate.x, crate.y);
        const label = [
          crate.gold > 0 && `${crate.gold}🪙`,
          crate.lumber > 0 && `${crate.lumber}🌲`,
          crate.stone > 0 && `${crate.stone}🪨`,
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <g
            key={`crate-${crate.id}`}
            style={{ cursor: anySelected ? 'pointer' : 'default' }}
            onContextMenu={e => {
              e.preventDefault();
              commandMove(crate.x, crate.y);
            }}
          >
            {/* Crate body */}
            <rect
              x={isoX + TILE_SIZE / 2 - 12}
              y={isoY + 8}
              width={24}
              height={18}
              fill="#92400e"
              stroke="#fbbf24"
              strokeWidth={2}
              rx={2}
            />
            {/* Cross lines */}
            <line
              x1={isoX + TILE_SIZE / 2 - 12}
              y1={isoY + 17}
              x2={isoX + TILE_SIZE / 2 + 12}
              y2={isoY + 17}
              stroke="#fbbf24"
              strokeWidth={1}
            />
            <line
              x1={isoX + TILE_SIZE / 2}
              y1={isoY + 8}
              x2={isoX + TILE_SIZE / 2}
              y2={isoY + 26}
              stroke="#fbbf24"
              strokeWidth={1}
            />
            {/* Glow pulse */}
            <rect
              x={isoX + TILE_SIZE / 2 - 14}
              y={isoY + 6}
              width={28}
              height={22}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={1.5}
              rx={3}
              opacity={0.5}
            />
            {/* Label */}
            <text
              x={isoX + TILE_SIZE / 2}
              y={isoY + 4}
              textAnchor="middle"
              fontSize="9"
              fill="#fde68a"
              fontWeight="bold"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Dropped hero items */}
      {droppedItems.map(item => {
        const { isoX, isoY } = tileToSvg(item.x, item.y);
        const data = HERO_ITEM_DATA[item.itemId];
        const cx = isoX + TILE_SIZE / 2;
        const cy = isoY + 16;
        return (
          <g key={`drop-${item.id}`} pointerEvents="none">
            <ellipse
              cx={cx}
              cy={cy + 4}
              rx={12}
              ry={6}
              fill="#7c3aed"
              opacity={0.35}
            />
            <text x={cx} y={cy + 2} textAnchor="middle" fontSize="14">
              {data.emoji}
            </text>
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              fontSize="8"
              fill="#c084fc"
              fontWeight="bold"
            >
              {data.name}
            </text>
          </g>
        );
      })}
    </>
  );
};
