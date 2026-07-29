import React from 'react';

import type { WorkerState } from '../game/types';
import { HERO_SHOUT_RADIUS, TILE_SIZE } from '../game/constants';
import { HpBar } from './HpBar';
import { tileDist, tileToSvg } from '../game/map';
import { Snd } from '../game/sound';
import type { BuildingType } from '../game/types';

interface WorkersLayerProps {
  battleShoutUntil: number;
  buildMode: BuildingType | null;
  deadWorkerPositions: { x: number; y: number; t: number; unitType: string }[];
  fogVisible: boolean[][];
  isDraggingRef: React.RefObject<boolean>;
  setSelectedBuildingId: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedType: React.Dispatch<
    React.SetStateAction<'worker' | 'farmhouse' | 'building' | null>
  >;
  setWorkers: React.Dispatch<React.SetStateAction<WorkerState[]>>;
  workerHitRef: React.RefObject<Map<number, number>>;
  workers: WorkerState[];
}

export const WorkersLayer: React.FC<WorkersLayerProps> = React.memo(
  ({
    battleShoutUntil,
    buildMode,
    deadWorkerPositions,
    fogVisible,
    isDraggingRef,
    setSelectedBuildingId,
    setSelectedType,
    setWorkers,
    workerHitRef,
    workers,
  }) => {
    const heroAlive = workers.find(w => w.unitType === 'hero' && w.hp > 0);

    return (
      <>
        {/* Worker corpses — faint grey for 6s */}
        {deadWorkerPositions
          .filter(p => Date.now() - p.t < 6000 && fogVisible[p.x]?.[p.y])
          .map((p, i) => {
            const { isoX, isoY } = tileToSvg(p.x, p.y);
            const age = (Date.now() - p.t) / 6000;
            const icon =
              p.unitType === 'hero'
                ? '🦸'
                : p.unitType === 'swordsman'
                  ? '⚔️'
                  : p.unitType === 'cavalry'
                    ? '🐴'
                    : '💀';
            return (
              <g key={`wc-${i}`} pointerEvents="none" opacity={0.5 - age * 0.4}>
                <ellipse
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 28}
                  rx={14}
                  ry={7}
                  fill="#6b7280"
                />
                <text
                  x={isoX + TILE_SIZE / 2}
                  y={isoY + 32}
                  textAnchor="middle"
                  fontSize="10"
                >
                  {icon}
                </text>
              </g>
            );
          })}

        {/* Workers */}
        {workers.map(worker => {
          const { isoX, isoY } = tileToSvg(worker.x, worker.y);
          const hp = worker.hp / worker.maxHp;
          const hasMoraleAura =
            heroAlive &&
            worker.unitType !== 'hero' &&
            tileDist(worker.x, worker.y, heroAlive.x, heroAlive.y) <= 3;
          return (
            <g
              key={`worker-${worker.id}`}
              onClick={e => {
                e.stopPropagation();
                if (!isDraggingRef.current && !buildMode) {
                  Snd.select();
                  setSelectedType('worker');
                  setSelectedBuildingId(null);
                  if (e.ctrlKey || e.metaKey) {
                    setWorkers(ws =>
                      ws.map(w =>
                        w.id === worker.id ? { ...w, selected: !w.selected } : w
                      )
                    );
                  } else {
                    setWorkers(ws =>
                      ws.map(w => ({ ...w, selected: w.id === worker.id }))
                    );
                  }
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {hasMoraleAura && (
                <ellipse
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 32}
                  rx={26}
                  ry={12}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                  opacity={0.6}
                />
              )}
              {battleShoutUntil > Date.now() &&
                heroAlive &&
                tileDist(worker.x, worker.y, heroAlive.x, heroAlive.y) <=
                  HERO_SHOUT_RADIUS && (
                  <ellipse
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 32}
                    rx={30}
                    ry={14}
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    opacity={0.85}
                  />
                )}
              {worker.selected && (
                <ellipse
                  cx={isoX + TILE_SIZE / 2}
                  cy={isoY + 32}
                  rx={
                    worker.unitType === 'hero'
                      ? 26
                      : worker.unitType === 'catapult' ||
                          worker.unitType === 'trebuchet'
                        ? 28
                        : 22
                  }
                  ry={10}
                  fill="none"
                  stroke={
                    worker.unitType === 'hero'
                      ? '#fbbf24'
                      : worker.unitType === 'catapult'
                        ? '#ea580c'
                        : worker.unitType === 'trebuchet'
                          ? '#92400e'
                          : worker.unitType === 'swordsman'
                            ? '#f87171'
                            : '#38bdf8'
                  }
                  strokeWidth={3}
                />
              )}
              {!worker.selected &&
                worker.hp > 0 &&
                worker.unitType === 'farmer' &&
                worker.state === 'idle' &&
                !worker.gathering &&
                !worker.attacking &&
                !worker.repairing && (
                  <ellipse
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 32}
                    rx={20}
                    ry={9}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                    opacity={0.7}
                    pointerEvents="none"
                  />
                )}
              {(() => {
                const hit = workerHitRef.current.get(worker.id);
                const age = hit ? Date.now() - hit : 999;
                return age < 200 ? (
                  <ellipse
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 18}
                    rx={20}
                    ry={14}
                    fill="#ef4444"
                    opacity={0.45 * (1 - age / 200)}
                    pointerEvents="none"
                  />
                ) : null;
              })()}
              {worker.holdPosition && (
                <text
                  x={isoX + TILE_SIZE / 2 + 14}
                  y={isoY - 2}
                  textAnchor="middle"
                  fontSize="12"
                >
                  🛡️
                </text>
              )}
              {worker.unitType === 'cavalry' ? (
                <g>
                  {worker.sprinting && (
                    <ellipse
                      cx={isoX + TILE_SIZE / 2}
                      cy={isoY + 22}
                      rx={28}
                      ry={17}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      opacity={0.8}
                    />
                  )}
                  {/* Horse body */}
                  <ellipse
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 22}
                    rx={22}
                    ry={14}
                    fill={
                      worker.state === 'attacking'
                        ? '#b45309'
                        : worker.sprinting
                          ? '#f59e0b'
                          : '#d97706'
                    }
                    stroke="#78350f"
                    strokeWidth={2.5}
                  />
                  {/* Horse head */}
                  <ellipse
                    cx={isoX + TILE_SIZE / 2 + 18}
                    cy={isoY + 12}
                    rx={10}
                    ry={8}
                    fill={
                      worker.state === 'attacking'
                        ? '#b45309'
                        : worker.sprinting
                          ? '#f59e0b'
                          : '#d97706'
                    }
                    stroke="#78350f"
                    strokeWidth={2}
                  />
                  {/* Legs */}
                  <line
                    x1={isoX + TILE_SIZE / 2 - 12}
                    y1={isoY + 30}
                    x2={isoX + TILE_SIZE / 2 - 12}
                    y2={isoY + 44}
                    stroke="#92400e"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                  <line
                    x1={isoX + TILE_SIZE / 2 + 4}
                    y1={isoY + 30}
                    x2={isoX + TILE_SIZE / 2 + 4}
                    y2={isoY + 44}
                    stroke="#92400e"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                  {/* Rider */}
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 4}
                    cy={isoY + 8}
                    r={8}
                    fill="#fbbf24"
                    stroke="#78350f"
                    strokeWidth={2}
                  />
                  <text
                    x={isoX + TILE_SIZE / 2 + 4}
                    y={isoY + 12}
                    textAnchor="middle"
                    fontSize="10"
                  >
                    ⚔️
                  </text>
                  {worker.sprinting && (
                    <text
                      x={isoX + TILE_SIZE / 2 - 18}
                      y={isoY + 8}
                      textAnchor="middle"
                      fontSize="14"
                    >
                      ⚡
                    </text>
                  )}
                </g>
              ) : worker.unitType === 'catapult' ? (
                <g>
                  {/* Catapult frame */}
                  <rect
                    x={isoX + TILE_SIZE / 2 - 20}
                    y={isoY + 6}
                    width={40}
                    height={18}
                    fill="#78350f"
                    stroke="#92400e"
                    strokeWidth={2}
                    rx={3}
                  />
                  {/* Wheels */}
                  <circle
                    cx={isoX + TILE_SIZE / 2 - 14}
                    cy={isoY + 26}
                    r={7}
                    fill="#1c1917"
                    stroke="#92400e"
                    strokeWidth={2}
                  />
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 14}
                    cy={isoY + 26}
                    r={7}
                    fill="#1c1917"
                    stroke="#92400e"
                    strokeWidth={2}
                  />
                  {/* Throwing arm */}
                  <line
                    x1={isoX + TILE_SIZE / 2}
                    y1={isoY + 14}
                    x2={isoX + TILE_SIZE / 2 - 6}
                    y2={isoY - 8}
                    stroke="#a16207"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  {/* Boulder */}
                  <circle
                    cx={isoX + TILE_SIZE / 2 - 8}
                    cy={isoY - 12}
                    r={5}
                    fill="#6b7280"
                    stroke="#374151"
                    strokeWidth={1.5}
                  />
                </g>
              ) : worker.unitType === 'trebuchet' ? (
                <g>
                  {/* Trebuchet base — wider than catapult */}
                  <rect
                    x={isoX + TILE_SIZE / 2 - 26}
                    y={isoY + 10}
                    width={52}
                    height={14}
                    fill="#44231a"
                    stroke="#6b3d2e"
                    strokeWidth={2}
                    rx={2}
                  />
                  {/* Larger wheels */}
                  <circle
                    cx={isoX + TILE_SIZE / 2 - 18}
                    cy={isoY + 28}
                    r={9}
                    fill="#1c1917"
                    stroke="#6b3d2e"
                    strokeWidth={2}
                  />
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 18}
                    cy={isoY + 28}
                    r={9}
                    fill="#1c1917"
                    stroke="#6b3d2e"
                    strokeWidth={2}
                  />
                  {/* Counterweight housing */}
                  <rect
                    x={isoX + TILE_SIZE / 2 - 6}
                    y={isoY + 2}
                    width={12}
                    height={10}
                    fill="#92400e"
                    stroke="#78350f"
                    strokeWidth={1.5}
                    rx={1}
                  />
                  {/* Long arm */}
                  <line
                    x1={isoX + TILE_SIZE / 2}
                    y1={isoY + 6}
                    x2={isoX + TILE_SIZE / 2 + 14}
                    y2={isoY - 18}
                    stroke="#92400e"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                  {/* Sling + projectile */}
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 18}
                    cy={isoY - 22}
                    r={6}
                    fill="#9ca3af"
                    stroke="#374151"
                    strokeWidth={1.5}
                  />
                  <text
                    x={isoX + TILE_SIZE / 2}
                    y={isoY + 44}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#fde68a"
                    fontWeight="bold"
                  >
                    TREBUCHET
                  </text>
                </g>
              ) : (
                <>
                  <circle
                    cx={isoX + TILE_SIZE / 2}
                    cy={isoY + 18}
                    r={worker.unitType === 'hero' ? 22 : 18}
                    fill={
                      worker.unitType === 'hero'
                        ? worker.state === 'attacking'
                          ? '#92400e'
                          : '#78350f'
                        : worker.unitType === 'swordsman'
                          ? worker.state === 'attacking'
                            ? '#dc2626'
                            : '#7f1d1d'
                          : worker.state === 'attacking'
                            ? '#fca5a5'
                            : worker.state === 'gathering'
                              ? '#fde68a'
                              : '#fbbf24'
                    }
                    stroke={
                      worker.unitType === 'hero'
                        ? '#fbbf24'
                        : worker.unitType === 'swordsman'
                          ? '#450a0a'
                          : '#78350f'
                    }
                    strokeWidth={worker.unitType === 'hero' ? 4 : 3}
                  />
                  {worker.unitType === 'hero' && (
                    <g>
                      <polygon
                        points={`${isoX + TILE_SIZE / 2 - 10},${isoY - 6} ${isoX + TILE_SIZE / 2 - 4},${isoY - 16} ${isoX + TILE_SIZE / 2},${isoY - 10} ${isoX + TILE_SIZE / 2 + 4},${isoY - 16} ${isoX + TILE_SIZE / 2 + 10},${isoY - 6}`}
                        fill="#fbbf24"
                        stroke="#b45309"
                        strokeWidth={1.5}
                      />
                      <text
                        x={isoX + TILE_SIZE / 2}
                        y={isoY + 44}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#fde68a"
                        fontWeight="bold"
                      >
                        BARNABAS
                      </text>
                    </g>
                  )}
                  <text
                    x={isoX + TILE_SIZE / 2}
                    y={isoY + 26}
                    textAnchor="middle"
                    fontSize={worker.unitType === 'hero' ? 18 : 16}
                  >
                    {worker.unitType === 'hero'
                      ? '🦸'
                      : worker.unitType === 'swordsman'
                        ? '⚔️'
                        : '👨‍🌾'}
                  </text>
                </>
              )}
              <HpBar
                x={isoX + TILE_SIZE / 2 - 16}
                y={isoY - 4}
                width={32}
                height={4}
                hpPct={hp}
                fill={hp > 0.5 ? '#4ade80' : hp > 0.25 ? '#fbbf24' : '#ef4444'}
                rx={0}
              />
              {worker.level > 0 && (
                <text
                  x={isoX + TILE_SIZE / 2 - 18}
                  y={isoY - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#fbbf24"
                >
                  {'⭐'.repeat(worker.level)}
                </text>
              )}
              {worker.state === 'idle' && worker.unitType === 'farmer' && (
                <g>
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 18}
                    cy={isoY - 8}
                    r={8}
                    fill="#fbbf24"
                    opacity={0.9}
                  />
                  <text
                    x={isoX + TILE_SIZE / 2 + 18}
                    y={isoY - 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#1e293b"
                    fontWeight="bold"
                  >
                    !
                  </text>
                </g>
              )}
              {worker.unitType !== 'farmer' && worker.state === 'idle' && (
                <g>
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 18}
                    cy={isoY - 8}
                    r={8}
                    fill="#fb923c"
                    opacity={0.85}
                  />
                  <text
                    x={isoX + TILE_SIZE / 2 + 18}
                    y={isoY - 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#1e293b"
                    fontWeight="bold"
                  >
                    !
                  </text>
                </g>
              )}
              {worker.group !== null && (
                <>
                  <circle
                    cx={isoX + TILE_SIZE / 2 + 14}
                    cy={isoY + 6}
                    r={9}
                    fill="#1e293b"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                  />
                  <text
                    x={isoX + TILE_SIZE / 2 + 14}
                    y={isoY + 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#fde68a"
                    fontWeight="bold"
                  >
                    {worker.group}
                  </text>
                </>
              )}
              {(worker.carrying.gold > 0 ||
                worker.carrying.lumber > 0 ||
                worker.carrying.stone > 0) && (
                <text
                  x={isoX + TILE_SIZE / 2}
                  y={isoY + 48}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#fde68a"
                >
                  {worker.carrying.gold > 0 ? `🪙${worker.carrying.gold}` : ''}
                  {worker.carrying.lumber > 0
                    ? `🌲${worker.carrying.lumber}`
                    : ''}
                  {worker.carrying.stone > 0
                    ? `🪨${worker.carrying.stone}`
                    : ''}
                </text>
              )}
            </g>
          );
        })}
      </>
    );
  }
);

WorkersLayer.displayName = 'WorkersLayer';
