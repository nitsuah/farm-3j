import React from 'react';

import type { FarmhouseAction } from '../RTSUI';
import type { WorkerState } from '../game/types';
import {
  BALLISTA_RANGE,
  BUILDING_EMOJI,
  CONSTRUCTION_MS,
  POISON_TOWER_RANGE,
  TILE_SIZE,
} from '../game/constants';
import { HpBar } from './HpBar';
import { StructureDamageSmoke } from './StructureDamageSmoke';
import { StructureFireEffect } from './StructureFireEffect';
import { tileToSvg } from '../game/map';
import type { PlacedBuilding, Resources } from '../game/types';

interface BuildingsLayerProps {
  anySelected: boolean;
  handleAssistConstruction: (
    buildingId: number,
    bx: number,
    by: number,
    e: React.MouseEvent
  ) => void;
  handleFarmhouseAction: (action: FarmhouseAction) => void;
  handleRepairBuilding: (
    buildingId: number,
    bx: number,
    by: number,
    e: React.MouseEvent
  ) => void;
  handleTowerGarrison: (towerId: number, tx: number, ty: number) => void;
  placedBuildings: PlacedBuilding[];
  resources: Resources;
  selectedBuildingId: number | null;
  setSelectedBuildingId: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
  setWorkers: React.Dispatch<React.SetStateAction<WorkerState[]>>;
  towerGarrison: Record<number, WorkerState[]>;
  trapTriggeredRef: React.RefObject<Record<number, number>>;
  workers: WorkerState[];
}

export const BuildingsLayer: React.FC<BuildingsLayerProps> = ({
  anySelected,
  handleAssistConstruction,
  handleFarmhouseAction,
  handleRepairBuilding,
  handleTowerGarrison,
  placedBuildings,
  resources,
  selectedBuildingId,
  setSelectedBuildingId,
  setSelectedType,
  setWorkers,
  towerGarrison,
  trapTriggeredRef,
  workers,
}) => {
  return (
    <>
      {/* Placed buildings */}
      {placedBuildings.map(b => {
        const { isoX, isoY } = tileToSvg(b.x, b.y);
        // Show scaffold during construction
        if (b.constructing) {
          const now2 = Date.now();
          const elapsed = now2 - (b.constructedAt ?? now2);
          const assistCount = workers.filter(
            w => w.assistBuildId === b.id && w.hp > 0
          ).length;
          const speedMult = 1 + assistCount * 0.4;
          const progress = Math.min(1, (elapsed * speedMult) / CONSTRUCTION_MS);
          return (
            <g
              key={`building-${b.id}`}
              style={{ cursor: anySelected ? 'pointer' : 'default' }}
              onContextMenu={e => handleAssistConstruction(b.id, b.x, b.y, e)}
            >
              {/* Scaffold base */}
              <rect
                x={isoX + TILE_SIZE * 0.15}
                y={isoY + 2}
                width={TILE_SIZE * 1.7}
                height={TILE_SIZE * 0.75}
                fill="#78350f"
                stroke="#92400e"
                strokeWidth={2}
                rx={3}
                opacity={0.6}
                strokeDasharray="6 3"
              />
              {/* Vertical poles */}
              {[0.2, 0.5, 0.8].map(f => (
                <line
                  key={f}
                  x1={isoX + TILE_SIZE * (0.15 + f * 1.7)}
                  y1={isoY + 2}
                  x2={isoX + TILE_SIZE * (0.15 + f * 1.7)}
                  y2={isoY + TILE_SIZE * 0.77}
                  stroke="#d97706"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              ))}
              {/* Horizontal planks */}
              {[0.3, 0.6].map(f => (
                <line
                  key={f}
                  x1={isoX + TILE_SIZE * 0.15}
                  y1={isoY + TILE_SIZE * f}
                  x2={isoX + TILE_SIZE * 1.85}
                  y2={isoY + TILE_SIZE * f}
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              ))}
              {/* Building icon faint */}
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.5}
                textAnchor="middle"
                fontSize="18"
                opacity={0.4}
              >
                {BUILDING_EMOJI[b.type]}
              </text>
              {/* Label + worker badge */}
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 6}
                textAnchor="middle"
                fontSize="8"
                fill="#fbbf24"
                fontWeight="bold"
              >
                🔨 Building…{assistCount > 0 ? ` ×${assistCount + 1}` : ''}
              </text>
              {/* Progress bar — color shifts green→yellow when assisted */}
              <rect
                x={isoX + TILE_SIZE * 0.15}
                y={isoY + TILE_SIZE * 0.8}
                width={TILE_SIZE * 1.7}
                height={5}
                fill="#1e293b"
                rx={2}
              />
              <rect
                x={isoX + TILE_SIZE * 0.15}
                y={isoY + TILE_SIZE * 0.8}
                width={TILE_SIZE * 1.7 * progress}
                height={5}
                fill={assistCount > 0 ? '#facc15' : '#4ade80'}
                rx={2}
              />
              {/* Hint */}
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.97}
                textAnchor="middle"
                fontSize="6"
                fill="#94a3b8"
              >
                {anySelected ? 'RMB: assist' : 'RMB: cancel (50% refund)'}
              </text>
            </g>
          );
        }
        if (b.type === 'wall') {
          const wallIsDamaged = b.hp < b.maxHp;
          const canUpgradeThisWall =
            !b.upgraded && resources.gold >= 50 && resources.stone >= 20;
          const wallCtxMenu =
            wallIsDamaged && anySelected
              ? (e: React.MouseEvent) => handleRepairBuilding(b.id, b.x, b.y, e)
              : canUpgradeThisWall
                ? (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFarmhouseAction(`upgradeWall:${b.id}`);
                  }
                : undefined;
          return (
            <g
              key={`building-${b.id}`}
              style={{ cursor: wallCtxMenu ? 'pointer' : 'default' }}
              onContextMenu={wallCtxMenu}
            >
              {b.upgraded ? (
                <>
                  {/* Stone wall look */}
                  <rect
                    x={isoX + TILE_SIZE / 6}
                    y={isoY + TILE_SIZE * 0.1}
                    width={TILE_SIZE * 1.7}
                    height={TILE_SIZE * 0.6}
                    fill="#64748b"
                    stroke={wallIsDamaged ? '#f97316' : '#1e293b'}
                    strokeWidth={wallIsDamaged ? 3 : 2}
                    rx={2}
                  />
                  <line
                    x1={isoX + TILE_SIZE / 6}
                    y1={isoY + TILE_SIZE * 0.37}
                    x2={isoX + TILE_SIZE * 1.83}
                    y2={isoY + TILE_SIZE * 0.37}
                    stroke="#374151"
                    strokeWidth={1}
                  />
                  <line
                    x1={isoX + TILE_SIZE * 0.7}
                    y1={isoY + TILE_SIZE * 0.1}
                    x2={isoX + TILE_SIZE * 0.7}
                    y2={isoY + TILE_SIZE * 0.37}
                    stroke="#374151"
                    strokeWidth={1}
                  />
                  <line
                    x1={isoX + TILE_SIZE * 1.3}
                    y1={isoY + TILE_SIZE * 0.37}
                    x2={isoX + TILE_SIZE * 1.3}
                    y2={isoY + TILE_SIZE * 0.7}
                    stroke="#374151"
                    strokeWidth={1}
                  />
                  {canUpgradeThisWall && (
                    <text
                      x={isoX + TILE_SIZE}
                      y={isoY - 5}
                      textAnchor="middle"
                      fontSize="7"
                      fill="#94a3b8"
                    >
                      🪨 Upgrade 50🪙20🪨
                    </text>
                  )}
                  <text
                    x={isoX + TILE_SIZE}
                    y={isoY + TILE_SIZE * 0.85}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#94a3b8"
                  >
                    STONE
                  </text>
                </>
              ) : (
                <>
                  {[0.15, 0.5, 0.85].map(f => (
                    <rect
                      key={f}
                      x={isoX + TILE_SIZE * 2 * f - 5}
                      y={isoY + TILE_SIZE * 0.05}
                      width={10}
                      height={TILE_SIZE * 0.55}
                      fill="#78350f"
                      stroke="#451a03"
                      strokeWidth={2}
                      rx={2}
                    />
                  ))}
                  <rect
                    x={isoX + TILE_SIZE / 6}
                    y={isoY + TILE_SIZE * 0.18}
                    width={TILE_SIZE * 1.7}
                    height={10}
                    fill="#a16207"
                    stroke={wallIsDamaged ? '#f97316' : '#451a03'}
                    strokeWidth={wallIsDamaged ? 3 : 2}
                    rx={3}
                  />
                  <rect
                    x={isoX + TILE_SIZE / 6}
                    y={isoY + TILE_SIZE * 0.33}
                    width={TILE_SIZE * 1.7}
                    height={10}
                    fill="#92400e"
                    stroke="#451a03"
                    strokeWidth={2}
                    rx={3}
                  />
                  {canUpgradeThisWall && (
                    <text
                      x={isoX + TILE_SIZE}
                      y={isoY - 5}
                      textAnchor="middle"
                      fontSize="7"
                      fill="#a16207"
                    >
                      🪨 Upgrade 50🪙20🪨
                    </text>
                  )}
                </>
              )}
            </g>
          );
        }
        if (b.type === 'windmill') {
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              <rect
                x={isoX + TILE_SIZE * 0.3}
                y={isoY}
                width={TILE_SIZE * 1.4}
                height={TILE_SIZE * 0.75}
                fill="#fef9c3"
                stroke="#b45309"
                strokeWidth={3}
                rx={8}
              />
              <line
                x1={isoX + TILE_SIZE}
                y1={isoY - 6}
                x2={isoX + TILE_SIZE}
                y2={isoY - 30}
                stroke="#6b7280"
                strokeWidth={4}
              />
              <line
                x1={isoX + TILE_SIZE - 14}
                y1={isoY - 18}
                x2={isoX + TILE_SIZE + 14}
                y2={isoY - 18}
                stroke="#6b7280"
                strokeWidth={4}
              />
              <circle
                cx={isoX + TILE_SIZE}
                cy={isoY - 18}
                r={5}
                fill="#374151"
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.52}
                textAnchor="middle"
                fontSize="20"
              >
                💨
              </text>
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 34}
                textAnchor="middle"
                fontSize="9"
                fill="#fde68a"
                fontWeight="bold"
              >
                +2🪙/5s
              </text>
            </g>
          );
        }
        if (b.type === 'market') {
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              <rect
                x={isoX + TILE_SIZE * 0.1}
                y={isoY - 2}
                width={TILE_SIZE * 1.8}
                height={TILE_SIZE * 0.82}
                fill="#fef3c7"
                stroke="#d97706"
                strokeWidth={3}
                rx={5}
              />
              {/* Awning */}
              <rect
                x={isoX + TILE_SIZE * 0.1}
                y={isoY - 2}
                width={TILE_SIZE * 1.8}
                height={12}
                fill="#d97706"
                stroke="none"
                rx={3}
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.5}
                textAnchor="middle"
                fontSize="20"
              >
                🏪
              </text>
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#78350f"
                fontWeight="bold"
              >
                MARKET
              </text>
            </g>
          );
        }
        if (b.type === 'siegeWorkshop') {
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              <rect
                x={isoX + TILE_SIZE * 0.15}
                y={isoY}
                width={TILE_SIZE * 1.7}
                height={TILE_SIZE * 0.8}
                fill="#292524"
                stroke="#ea580c"
                strokeWidth={3}
                rx={5}
              />
              <rect
                x={isoX + TILE_SIZE * 0.15}
                y={isoY}
                width={TILE_SIZE * 1.7}
                height={9}
                fill="#1c1917"
                stroke="none"
              />
              {/* Gear decoration */}
              <circle
                cx={isoX + TILE_SIZE * 0.55}
                cy={isoY + TILE_SIZE * 0.42}
                r={12}
                fill="none"
                stroke="#ea580c"
                strokeWidth={3}
              />
              <circle
                cx={isoX + TILE_SIZE * 0.55}
                cy={isoY + TILE_SIZE * 0.42}
                r={5}
                fill="#ea580c"
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.52}
                textAnchor="middle"
                fontSize="22"
              >
                ⚙️
              </text>
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#fed7aa"
                fontWeight="bold"
              >
                SIEGE WORKSHOP
              </text>
            </g>
          );
        }
        if (b.type === 'barracks') {
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              <rect
                x={isoX + TILE_SIZE * 0.2}
                y={isoY - 4}
                width={TILE_SIZE * 1.6}
                height={TILE_SIZE * 0.85}
                fill="#1c1917"
                stroke="#dc2626"
                strokeWidth={3}
                rx={6}
              />
              <rect
                x={isoX + TILE_SIZE * 0.2}
                y={isoY - 4}
                width={TILE_SIZE * 1.6}
                height={8}
                fill="#292524"
                stroke="none"
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.5}
                textAnchor="middle"
                fontSize="22"
              >
                ⚔️
              </text>
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#fca5a5"
                fontWeight="bold"
              >
                BARRACKS
              </text>
            </g>
          );
        }
        if (b.type === 'stable') {
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              {/* Stable body - brown barn with dark roof */}
              <rect
                x={isoX + TILE_SIZE * 0.1}
                y={isoY}
                width={TILE_SIZE * 1.8}
                height={TILE_SIZE * 0.8}
                fill="#92400e"
                stroke="#78350f"
                strokeWidth={3}
                rx={4}
              />
              {/* Roof ridge */}
              <rect
                x={isoX + TILE_SIZE * 0.1}
                y={isoY}
                width={TILE_SIZE * 1.8}
                height={10}
                fill="#451a03"
                stroke="none"
                rx={3}
              />
              {/* Door */}
              <rect
                x={isoX + TILE_SIZE * 0.8}
                y={isoY + TILE_SIZE * 0.35}
                width={18}
                height={28}
                fill="#1c1917"
                stroke="#78350f"
                strokeWidth={1.5}
                rx={2}
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.52}
                textAnchor="middle"
                fontSize="20"
              >
                🐴
              </text>
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#fde68a"
                fontWeight="bold"
              >
                STABLE
              </text>
            </g>
          );
        }
        if (b.type === 'granary') {
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              {/* Round silo body */}
              <ellipse
                cx={isoX + TILE_SIZE * 0.55}
                cy={isoY + TILE_SIZE * 0.42}
                rx={22}
                ry={28}
                fill="#fef9c3"
                stroke="#b45309"
                strokeWidth={3}
              />
              <ellipse
                cx={isoX + TILE_SIZE * 0.55}
                cy={isoY + TILE_SIZE * 0.12}
                rx={22}
                ry={8}
                fill="#fde68a"
                stroke="#b45309"
                strokeWidth={2}
              />
              {/* Roof cap */}
              <ellipse
                cx={isoX + TILE_SIZE * 0.55}
                cy={isoY + TILE_SIZE * 0.12 - 7}
                rx={22}
                ry={7}
                fill="#b45309"
              />
              {/* Second silo */}
              <ellipse
                cx={isoX + TILE_SIZE * 1.1}
                cy={isoY + TILE_SIZE * 0.48}
                rx={16}
                ry={22}
                fill="#fef3c7"
                stroke="#b45309"
                strokeWidth={2}
              />
              <ellipse
                cx={isoX + TILE_SIZE * 1.1}
                cy={isoY + TILE_SIZE * 0.26}
                rx={16}
                ry={6}
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth={1.5}
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#78350f"
                fontWeight="bold"
              >
                GRANARY
              </text>
              <text
                x={isoX + TILE_SIZE}
                y={isoY + 4}
                textAnchor="middle"
                fontSize="8"
                fill="#92400e"
              >
                +8 pop
              </text>
            </g>
          );
        }
        if (b.type === 'blacksmith') {
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              {/* Stone base */}
              <rect
                x={isoX + TILE_SIZE * 0.15}
                y={isoY + 4}
                width={TILE_SIZE * 1.7}
                height={TILE_SIZE * 0.76}
                fill="#374151"
                stroke="#dc2626"
                strokeWidth={3}
                rx={4}
              />
              {/* Chimney */}
              <rect
                x={isoX + TILE_SIZE * 0.35}
                y={isoY - 18}
                width={14}
                height={24}
                fill="#1f2937"
                stroke="#4b5563"
                strokeWidth={2}
                rx={2}
              />
              {/* Smoke puff */}
              <circle
                cx={isoX + TILE_SIZE * 0.35 + 7}
                cy={isoY - 22}
                r={5}
                fill="#6b7280"
                opacity={0.7}
              />
              <circle
                cx={isoX + TILE_SIZE * 0.35 + 2}
                cy={isoY - 28}
                r={4}
                fill="#4b5563"
                opacity={0.5}
              />
              <text
                x={isoX + TILE_SIZE}
                y={isoY + TILE_SIZE * 0.52}
                textAnchor="middle"
                fontSize="22"
              >
                🔨
              </text>
              <text
                x={isoX + TILE_SIZE}
                y={isoY + 2}
                textAnchor="middle"
                fontSize="9"
                fill="#fca5a5"
                fontWeight="bold"
              >
                BLACKSMITH
              </text>
            </g>
          );
        }
        if (b.type === 'spikeTrap') {
          const lastTrigger = trapTriggeredRef.current[b.id] ?? 0;
          const isArmed =
            lastTrigger === 0 || Date.now() - lastTrigger >= 30000;
          const cx2 = isoX + TILE_SIZE / 2;
          const cy2 = isoY + TILE_SIZE * 0.5;
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              {/* Base stone plate */}
              <ellipse
                cx={cx2}
                cy={cy2 + 4}
                rx={28}
                ry={12}
                fill={isArmed ? '#78350f' : '#44403c'}
                stroke={isArmed ? '#451a03' : '#292524'}
                strokeWidth={2}
              />
              {isArmed ? (
                <>
                  {/* Spike tips */}
                  {[-14, -7, 0, 7, 14].map((dx, i) => (
                    <polygon
                      key={i}
                      points={`${cx2 + dx},${cy2 - 16} ${cx2 + dx - 5},${cy2 + 4} ${cx2 + dx + 5},${cy2 + 4}`}
                      fill="#fbbf24"
                      stroke="#b45309"
                      strokeWidth={1.5}
                    />
                  ))}
                  <text
                    x={cx2}
                    y={cy2 - 20}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#fde68a"
                    fontWeight="bold"
                  >
                    ARMED
                  </text>
                </>
              ) : (
                <>
                  {/* Flat exhausted look */}
                  {[-14, -7, 0, 7, 14].map((dx, i) => (
                    <polygon
                      key={i}
                      points={`${cx2 + dx},${cy2 - 4} ${cx2 + dx - 5},${cy2 + 4} ${cx2 + dx + 5},${cy2 + 4}`}
                      fill="#6b7280"
                      stroke="#4b5563"
                      strokeWidth={1}
                    />
                  ))}
                  <text
                    x={cx2}
                    y={cy2 - 8}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#9ca3af"
                  >
                    REARM
                  </text>
                </>
              )}
            </g>
          );
        }
        if (b.type === 'ballista') {
          const cx2 = isoX + TILE_SIZE / 2;
          const cy2 = isoY + TILE_SIZE * 0.4;
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              {/* Stone platform */}
              <rect
                x={isoX + TILE_SIZE * 0.2}
                y={cy2 + 2}
                width={TILE_SIZE * 1.6}
                height={14}
                fill="#475569"
                stroke="#1e293b"
                strokeWidth={2}
                rx={3}
              />
              {/* Ballista frame */}
              <rect
                x={cx2 - 18}
                y={cy2 - 10}
                width={36}
                height={14}
                fill="#44231a"
                stroke="#6b3d2e"
                strokeWidth={2}
                rx={2}
              />
              {/* Bow arms */}
              <path
                d={`M${cx2 - 18},${cy2 - 4} Q${cx2 - 32},${cy2 - 22} ${cx2 - 18},${cy2 - 10}`}
                fill="none"
                stroke="#92400e"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <path
                d={`M${cx2 + 18},${cy2 - 4} Q${cx2 + 32},${cy2 - 22} ${cx2 + 18},${cy2 - 10}`}
                fill="none"
                stroke="#92400e"
                strokeWidth={3}
                strokeLinecap="round"
              />
              {/* Bolt */}
              <line
                x1={cx2 - 16}
                y1={cy2 - 3}
                x2={cx2 + 24}
                y2={cy2 - 3}
                stroke="#6b7280"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <polygon
                points={`${cx2 + 24},${cy2 - 6} ${cx2 + 32},${cy2 - 3} ${cx2 + 24},${cy2}`}
                fill="#9ca3af"
              />
              <text
                x={cx2}
                y={isoY - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#fbbf24"
                fontWeight="bold"
              >
                BALLISTA
              </text>
              <text
                x={cx2}
                y={isoY + 4}
                textAnchor="middle"
                fontSize="7"
                fill="#94a3b8"
              >
                {BALLISTA_RANGE}🎯 pierce
              </text>
            </g>
          );
        }
        if (b.type === 'poisonTower') {
          const cx2 = isoX + TILE_SIZE / 2;
          const cy2 = isoY + TILE_SIZE * 0.4;
          return (
            <g key={`building-${b.id}`} pointerEvents="none">
              {/* Stone base */}
              <rect
                x={isoX + TILE_SIZE * 0.25}
                y={cy2 + 4}
                width={TILE_SIZE * 1.5}
                height={12}
                fill="#374151"
                stroke="#1e293b"
                strokeWidth={2}
                rx={3}
              />
              {/* Vat body */}
              <ellipse
                cx={cx2}
                cy={cy2}
                rx={18}
                ry={14}
                fill="#166534"
                stroke="#14532d"
                strokeWidth={2.5}
              />
              {/* Poison bubbles */}
              <circle
                cx={cx2 - 6}
                cy={cy2 - 4}
                r={3}
                fill="#4ade80"
                opacity={0.8}
              />
              <circle
                cx={cx2 + 5}
                cy={cy2 - 7}
                r={2}
                fill="#22c55e"
                opacity={0.7}
              />
              <circle
                cx={cx2 + 2}
                cy={cy2 + 2}
                r={4}
                fill="#86efac"
                opacity={0.6}
              />
              {/* Pipe/spout */}
              <line
                x1={cx2 + 16}
                y1={cy2 - 6}
                x2={cx2 + 28}
                y2={cy2 - 16}
                stroke="#15803d"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <circle
                cx={cx2 + 28}
                cy={cy2 - 17}
                r={4}
                fill="#4ade80"
                stroke="#166534"
                strokeWidth={1.5}
              />
              {/* Range ring hint */}
              <circle
                cx={cx2}
                cy={cy2}
                r={POISON_TOWER_RANGE * TILE_SIZE * 0.18}
                fill="none"
                stroke="#4ade80"
                strokeWidth={0.8}
                strokeDasharray="4 4"
                opacity={0.2}
              />
              <text
                x={cx2}
                y={isoY - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#4ade80"
                fontWeight="bold"
              >
                ☠️ POISON
              </text>
            </g>
          );
        }
        const colors: Record<string, { fill: string; stroke: string }> = {
          farmhouse: { fill: '#fef3c7', stroke: '#92400e' },
          lumberShed: { fill: '#a16207', stroke: '#78350f' },
          watchtower: { fill: '#64748b', stroke: '#1e293b' },
        };
        const c = colors[b.type] ?? { fill: '#374151', stroke: '#1f2937' };
        const isDamaged = b.hp < b.maxHp;
        const isTower = b.type === 'watchtower';
        const tgCount = isTower ? (towerGarrison[b.id] ?? []).length : 0;
        const canGarrisonTower = isTower && anySelected && tgCount < 3;
        const onCtxMenu =
          isDamaged && anySelected
            ? (e: React.MouseEvent) => handleRepairBuilding(b.id, b.x, b.y, e)
            : canGarrisonTower
              ? (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTowerGarrison(b.id, b.x, b.y);
                }
              : undefined;
        return (
          <g
            key={`building-${b.id}`}
            style={{
              cursor:
                (isDamaged || canGarrisonTower) && anySelected
                  ? 'pointer'
                  : 'default',
            }}
            onContextMenu={onCtxMenu}
          >
            <rect
              x={isoX + TILE_SIZE / 4}
              y={isoY}
              width={TILE_SIZE * 1.5}
              height={TILE_SIZE * 0.8}
              fill={c.fill}
              stroke={
                isDamaged ? '#f97316' : tgCount > 0 ? '#22d3ee' : c.stroke
              }
              strokeWidth={isDamaged ? 4 : 3}
              rx={8}
            />
            <text
              x={isoX + TILE_SIZE}
              y={isoY + TILE_SIZE / 2}
              textAnchor="middle"
              fontSize="22"
            >
              {BUILDING_EMOJI[b.type]}
            </text>
            {isDamaged && (
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 18}
                textAnchor="middle"
                fontSize="9"
                fill="#f97316"
                fontWeight="bold"
              >
                🔧 REPAIR
              </text>
            )}
            {isTower && tgCount > 0 && (
              <text
                x={isoX + TILE_SIZE}
                y={isoY - 18}
                textAnchor="middle"
                fontSize="9"
                fill="#22d3ee"
                fontWeight="bold"
              >
                👥×{tgCount}
              </text>
            )}
          </g>
        );
      })}

      {/* Building HP bars — only shown when damaged */}
      {placedBuildings
        .filter(b => b.hp < b.maxHp && b.hp > 0)
        .map(b => {
          const { isoX, isoY } = tileToSvg(b.x, b.y);
          const pct = b.hp / b.maxHp;
          return (
            <g key={`bhp-${b.id}`} pointerEvents="none">
              <HpBar
                x={isoX + TILE_SIZE * 0.1}
                y={isoY - 14}
                width={TILE_SIZE * 1.8}
                height={6}
                hpPct={pct}
                fill={pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#ef4444'}
                rx={3}
              />
            </g>
          );
        })}

      {/* Building selection rings + click targets */}
      {placedBuildings
        .filter(b => b.hp > 0 && !b.constructing && b.type !== 'wall')
        .map(b => {
          const { isoX, isoY } = tileToSvg(b.x, b.y);
          const isSel = selectedBuildingId === b.id;
          return (
            <g key={`bsel-${b.id}`}>
              {isSel && (
                <rect
                  x={isoX + TILE_SIZE * 0.05}
                  y={isoY - 6}
                  width={TILE_SIZE * 1.9}
                  height={TILE_SIZE * 0.92}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  strokeDasharray="5 2"
                  rx={7}
                  opacity={0.9}
                  pointerEvents="none"
                />
              )}
              <rect
                x={isoX + TILE_SIZE * 0.05}
                y={isoY - 6}
                width={TILE_SIZE * 1.9}
                height={TILE_SIZE * 0.92}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedBuildingId(b.id);
                  setSelectedType('building');
                  setWorkers(ws => ws.map(w => ({ ...w, selected: false })));
                }}
              />
            </g>
          );
        })}

      {/* Fire effects on critically damaged buildings (<25% HP) */}
      {placedBuildings
        .filter(b => b.hp > 0 && b.hp / b.maxHp < 0.25)
        .map(b => {
          const { isoX, isoY } = tileToSvg(b.x, b.y);
          const cx = isoX + TILE_SIZE;
          const cy = isoY + TILE_SIZE * 0.3;
          const t = (Date.now() / 600) % (2 * Math.PI);
          return (
            <React.Fragment key={`fire-${b.id}`}>
              <StructureDamageSmoke
                cx={cx}
                cy={cy}
                t={t}
                colors={['#374151', '#4b5563', '#1f2937']}
                opacities={[0.55, 0.4, 0.25]}
              />
              <StructureFireEffect cx={cx} cy={cy} />
            </React.Fragment>
          );
        })}
    </>
  );
};
