import React from 'react';

import type { WorkerState } from '../game/types';
import { HERO_ITEM_DATA, TILE_SIZE } from '../game/constants';
import { HpBar } from './HpBar';
import { tileToSvg } from '../game/map';
import type {
  DroppedItem,
  EnemyGrunt,
  EnemyLurker,
  LootCrate,
} from '../game/types';

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
  enemyLurkers: EnemyLurker[];
  fogVisible: boolean[][];
  gruntHitRef: React.RefObject<Map<number, number>>;
  handleAttackGrunt: (gruntId: number, e: React.MouseEvent) => void;
  handleAttackLurker: (lurkerId: number, e: React.MouseEvent) => void;
  lootCrates: LootCrate[];
}

export const EnemyGruntsLayer: React.FC<EnemyGruntsLayerProps> = ({
  anySelected,
  commandMove,
  droppedItems,
  enemyGrunts,
  enemyLurkers,
  fogVisible,
  gruntHitRef,
  handleAttackGrunt,
  handleAttackLurker,
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
                <HpBar
                  x={isoX + TILE_SIZE / 2 - 20}
                  y={isoY - 5}
                  width={40}
                  height={5}
                  hpPct={hp}
                  fill="#dc2626"
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
                <HpBar
                  x={isoX + TILE_SIZE / 2 - 12}
                  y={isoY - 10}
                  width={24}
                  height={4}
                  hpPct={hp}
                  fill="#a855f7"
                  rx={0}
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
                <HpBar
                  x={isoX + TILE_SIZE / 2 - 14}
                  y={isoY - 4}
                  width={28}
                  height={4}
                  hpPct={hp}
                  fill="#ef4444"
                  rx={0}
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

      {/* Night Lurkers */}
      {enemyLurkers.map(lk => {
        if (lk.hp <= 0) return null;
        if (!fogVisible[Math.round(lk.x)]?.[Math.round(lk.y)]) return null;
        const { isoX, isoY } = tileToSvg(lk.x, lk.y);
        const cx = isoX + TILE_SIZE / 2;
        const cy = isoY + 20;
        const hpPct = lk.hp / lk.maxHp;
        const isAttacking = lk.state === 'attacking';
        return (
          <g
            key={`lurker-${lk.id}`}
            style={{ cursor: anySelected ? 'crosshair' : 'default' }}
            onContextMenu={e => handleAttackLurker(lk.id, e)}
          >
            {/* Shadow */}
            <ellipse
              cx={cx}
              cy={cy + 8}
              rx={14}
              ry={5}
              fill="#000"
              opacity={0.25}
            />
            {/* Body — sleek dark teal teardrop */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={11}
              ry={14}
              fill={isAttacking ? '#0f766e' : '#115e59'}
              stroke="#042f2e"
              strokeWidth={2}
            />
            {/* Wing-cape left */}
            <path
              d={`M${cx - 8},${cy - 2} Q${cx - 22},${cy - 12} ${cx - 16},${cy + 10}`}
              fill="#134e4a"
              stroke="#042f2e"
              strokeWidth={1.5}
            />
            {/* Wing-cape right */}
            <path
              d={`M${cx + 8},${cy - 2} Q${cx + 22},${cy - 12} ${cx + 16},${cy + 10}`}
              fill="#134e4a"
              stroke="#042f2e"
              strokeWidth={1.5}
            />
            {/* Glowing teal eyes */}
            <circle
              cx={cx - 4}
              cy={cy - 4}
              r={3}
              fill="#2dd4bf"
              opacity={0.9}
            />
            <circle
              cx={cx + 4}
              cy={cy - 4}
              r={3}
              fill="#2dd4bf"
              opacity={0.9}
            />
            {/* Claw marks on attack */}
            {isAttacking && (
              <>
                <line
                  x1={cx - 6}
                  y1={cy + 6}
                  x2={cx - 2}
                  y2={cy + 12}
                  stroke="#5eead4"
                  strokeWidth={1.5}
                />
                <line
                  x1={cx - 3}
                  y1={cy + 5}
                  x2={cx + 1}
                  y2={cy + 11}
                  stroke="#5eead4"
                  strokeWidth={1.5}
                />
                <line
                  x1={cx}
                  y1={cy + 4}
                  x2={cx + 4}
                  y2={cy + 10}
                  stroke="#5eead4"
                  strokeWidth={1.5}
                />
              </>
            )}
            {/* Label */}
            <text
              x={cx}
              y={isoY - 2}
              textAnchor="middle"
              fontSize="7"
              fill="#5eead4"
              fontWeight="bold"
            >
              LURKER
            </text>
            <HpBar
              x={cx - 12}
              y={isoY - 8}
              width={24}
              height={4}
              hpPct={hpPct}
              fill="#0d9488"
              rx={0}
            />
          </g>
        );
      })}

      {/* Loot Crates — isometric 3D wooden chest */}
      {lootCrates.map(crate => {
        const { isoX, isoY } = tileToSvg(crate.x, crate.y);
        // Offset to center a half-size box within the tile
        const ox = isoX + TILE_SIZE / 2;
        const oy = isoY + TILE_SIZE / 4;
        const w = TILE_SIZE; // half-tile-width crate
        const h = 14;
        // Small iso box corners (centered at ox+w/2, oy)
        const lx2 = ox,
          ly2 = oy + w / 4;
        const rx2 = ox + w,
          ry2 = oy + w / 4;
        const bx2 = ox + w / 2,
          by2 = oy + w / 2;
        const tx2 = ox + w / 2,
          ty2 = oy;
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
            {/* Crate left face */}
            <polygon
              points={`${lx2},${ly2 - h} ${bx2},${by2 - h} ${bx2},${by2} ${lx2},${ly2}`}
              fill="#78350f"
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {/* Crate right face */}
            <polygon
              points={`${bx2},${by2 - h} ${rx2},${ry2 - h} ${rx2},${ry2} ${bx2},${by2}`}
              fill="#92400e"
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {/* Crate top — gold lid */}
            <polygon
              points={`${lx2},${ly2 - h} ${tx2},${ty2 - h} ${rx2},${ry2 - h} ${bx2},${by2 - h}`}
              fill="#b45309"
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {/* Chest clasp detail */}
            <circle cx={ox + w / 2} cy={oy - h + 4} r={3} fill="#fbbf24" />
            {/* Glow ring */}
            <polygon
              points={`${lx2},${ly2} ${tx2},${ty2} ${rx2},${ry2} ${bx2},${by2}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={1}
              opacity={0.45}
            />
            {/* Resource label */}
            <text
              x={ox + w / 2}
              y={oy - h - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#fde68a"
              fontWeight="bold"
              pointerEvents="none"
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
