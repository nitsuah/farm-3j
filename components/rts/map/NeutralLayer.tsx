import React from 'react';

import { CREEP_CAMPS, SHRINES, TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';
import type { NeutralCreep } from '../game/types';

interface NeutralLayerProps {
  anySelected: boolean;
  capturedShrines: Set<number>;
  clearedCamps: Set<number>;
  deadGruntPositions: { x: number; y: number; t: number }[];
  fogVisible: boolean[][];
  handleAttackCreep: (creepId: number, e: React.MouseEvent) => void;
  neutralCreeps: NeutralCreep[];
  shrineCapturing: {
    shrineId: number;
    workerId: number;
    startedAt: number;
  } | null;
}

export const NeutralLayer: React.FC<NeutralLayerProps> = React.memo(({
  anySelected,
  capturedShrines,
  clearedCamps,
  deadGruntPositions,
  fogVisible,
  handleAttackCreep,
  neutralCreeps,
  shrineCapturing,
}) => {
  return (
    <>
      {/* Neutral shrines */}
      {SHRINES.map(shrine => {
        const { isoX, isoY } = tileToSvg(shrine.x, shrine.y);
        const captured = capturedShrines.has(shrine.id);
        const channeling = shrineCapturing?.shrineId === shrine.id;
        const progress = channeling
          ? Math.min(
              1,
              (Date.now() - (shrineCapturing?.startedAt ?? 0)) /
                shrine.captureMs
            )
          : 0;
        const isWar = shrine.type === 'war';
        const color = isWar ? '#f97316' : '#4ade80';
        const glow = captured ? (isWar ? '#7c3aed' : '#065f46') : '#1e293b';
        return (
          <g key={`shrine-${shrine.id}`} pointerEvents="none">
            {/* Base platform */}
            <polygon
              points={`${isoX + TILE_SIZE},${isoY + 4} ${isoX + TILE_SIZE * 1.7},${isoY + TILE_SIZE * 0.4} ${isoX + TILE_SIZE},${isoY + TILE_SIZE * 0.75} ${isoX + TILE_SIZE * 0.3},${isoY + TILE_SIZE * 0.4}`}
              fill={captured ? glow : '#334155'}
              stroke={color}
              strokeWidth={captured ? 3 : 1.5}
              opacity={0.9}
            />
            {/* Pillar */}
            <rect
              x={isoX + TILE_SIZE - 8}
              y={isoY + 2}
              width={16}
              height={28}
              fill={captured ? color : '#64748b'}
              stroke={captured ? '#fef3c7' : '#1e293b'}
              strokeWidth={1.5}
              rx={2}
            />
            {/* Flame / glow */}
            <circle
              cx={isoX + TILE_SIZE}
              cy={isoY - 2}
              r={captured ? 10 : 7}
              fill={captured ? color : '#94a3b8'}
              opacity={captured ? 0.9 : 0.5}
            />
            {/* Icon */}
            <text
              x={isoX + TILE_SIZE}
              y={isoY + 3}
              textAnchor="middle"
              fontSize="12"
            >
              {isWar ? '⚔️' : '🌾'}
            </text>
            {/* Label */}
            <text
              x={isoX + TILE_SIZE}
              y={isoY - 14}
              textAnchor="middle"
              fontSize="8"
              fill={captured ? color : '#94a3b8'}
              fontWeight="bold"
            >
              {captured ? '✓ ' : ''}
              {shrine.label}
            </text>
            {/* Channel progress bar */}
            {channeling && (
              <>
                <rect
                  x={isoX + TILE_SIZE * 0.3}
                  y={isoY + TILE_SIZE * 0.8}
                  width={TILE_SIZE * 1.4}
                  height={6}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth={1}
                  rx={3}
                />
                <rect
                  x={isoX + TILE_SIZE * 0.3}
                  y={isoY + TILE_SIZE * 0.8}
                  width={TILE_SIZE * 1.4 * progress}
                  height={6}
                  fill={color}
                  rx={3}
                />
              </>
            )}
          </g>
        );
      })}

      {/* Neutral creep camps */}
      {CREEP_CAMPS.filter(camp => !clearedCamps.has(camp.id)).map(camp => {
        const { isoX, isoY } = tileToSvg(camp.x, camp.y);
        return (
          <g key={`camp-${camp.id}`} pointerEvents="none">
            <ellipse
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + 28}
              rx={28}
              ry={12}
              fill="rgba(88,28,135,0.3)"
            />
            <text
              x={isoX + TILE_SIZE / 2}
              y={isoY - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#c084fc"
              fontWeight="bold"
            >
              ⚠ CAMP +{camp.goldReward}🪙
            </text>
          </g>
        );
      })}
      {/* Neutral creeps */}
      {neutralCreeps.map(c => {
        const { isoX, isoY } = tileToSvg(c.x, c.y);
        const hp = c.hp / c.maxHp;
        return (
          <g
            key={`creep-${c.id}`}
            style={{ cursor: anySelected ? 'crosshair' : 'default' }}
            onContextMenu={e => handleAttackCreep(c.id, e)}
          >
            <circle
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + 18}
              r={15}
              fill={c.state === 'chasing' ? '#7c3aed' : '#581c87'}
              stroke="#3b0764"
              strokeWidth={3}
            />
            <text
              x={isoX + TILE_SIZE / 2}
              y={isoY + 26}
              textAnchor="middle"
              fontSize="13"
            >
              🐗
            </text>
            <rect
              x={isoX + TILE_SIZE / 2 - 13}
              y={isoY - 3}
              width={26}
              height={4}
              fill="#1e293b"
            />
            <rect
              x={isoX + TILE_SIZE / 2 - 13}
              y={isoY - 3}
              width={26 * hp}
              height={4}
              fill="#a855f7"
            />
          </g>
        );
      })}

      {/* Grunt corpses — faded for 8s; Necromancer raise target */}
      {deadGruntPositions
        .filter(p => Date.now() - p.t < 8000 && fogVisible[p.x]?.[p.y])
        .map(p => {
          const { isoX, isoY } = tileToSvg(p.x, p.y);
          const age = (Date.now() - p.t) / 8000;
          return (
            <g
              key={`corpse-${p.t}-${p.x}-${p.y}`}
              pointerEvents="none"
              opacity={0.55 - age * 0.45}
            >
              <ellipse
                cx={isoX + TILE_SIZE / 2}
                cy={isoY + 28}
                rx={16}
                ry={8}
                fill="#374151"
              />
              <text
                x={isoX + TILE_SIZE / 2}
                y={isoY + 32}
                textAnchor="middle"
                fontSize="10"
              >
                💀
              </text>
            </g>
          );
        })}
    </>
  );
});
