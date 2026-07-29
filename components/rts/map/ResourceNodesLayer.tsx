import React from 'react';

import type { WorkerState } from '../game/types';
import { TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';
import type { BuildingType, ResourceNode } from '../game/types';
import { isoBox } from './isoBox';

interface ResourceNodesLayerProps {
  buildMode: BuildingType | null;
  commandMove: (
    targetX: number,
    targetY: number,
    gathering?: WorkerState['gathering'],
    attacking?: WorkerState['attacking']
  ) => void;
  goldMines: ResourceNode[];
  stoneNodes: ResourceNode[];
  trees: ResourceNode[];
}

export const ResourceNodesLayer: React.FC<ResourceNodesLayerProps> = ({
  buildMode,
  commandMove,
  goldMines,
  stoneNodes,
  trees,
}) => {
  return (
    <>
      {/* Stone nodes — isometric rock formation */}
      {stoneNodes.map(({ x, y, amount }, idx) => {
        if (!amount) return null;
        const { isoX, isoY } = tileToSvg(x, y);
        const ts = TILE_SIZE;
        const cx = isoX + ts;
        return (
          <g
            key={`stone-${idx}`}
            style={{ cursor: 'pointer' }}
            onContextMenu={e => {
              e.preventDefault();
              if (buildMode) return;
              commandMove(x, y, { type: 'stone', idx });
            }}
          >
            {isoBox(
              isoX,
              isoY,
              14,
              '#94a3b8',
              '#64748b',
              '#475569',
              '#334155',
              1.5
            )}
            {/* Rock highlights — smaller boulder on top */}
            <ellipse
              cx={cx - 10}
              cy={isoY - 4}
              rx={12}
              ry={8}
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <ellipse
              cx={cx + 12}
              cy={isoY - 2}
              rx={9}
              ry={6}
              fill="#b0bec5"
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <text
              x={cx}
              y={isoY - 12}
              textAnchor="middle"
              fontSize="12"
              pointerEvents="none"
            >
              🪨
            </text>
            {/* Resource bar */}
            <rect
              x={cx - 24}
              y={isoY - 26}
              width={48}
              height={5}
              fill="#1e293b"
              rx={2}
            />
            <rect
              x={cx - 24}
              y={isoY - 26}
              width={48 * (amount / 100)}
              height={5}
              fill="#94a3b8"
              rx={2}
            />
          </g>
        );
      })}

      {/* Trees */}
      {trees.map(({ x, y, amount }, idx) => {
        if (!amount) return null;
        const { isoX, isoY } = tileToSvg(x, y);
        return (
          <g
            key={`tree-${idx}`}
            style={{ cursor: 'pointer', opacity: amount < 20 ? 0.5 : 1 }}
            onContextMenu={e => {
              e.preventDefault();
              if (buildMode) return;
              commandMove(x, y, { type: 'tree', idx });
            }}
          >
            <ellipse
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + 10}
              rx={18}
              ry={28}
              fill="#166534"
              stroke="#052e16"
              strokeWidth={3}
            />
            <rect
              x={isoX + TILE_SIZE / 2 - 6}
              y={isoY + 28}
              width={12}
              height={18}
              fill="#78350f"
            />
            <rect
              x={isoX + TILE_SIZE / 2 - 18}
              y={isoY - 16}
              width={36}
              height={5}
              fill="#052e16"
            />
            <rect
              x={isoX + TILE_SIZE / 2 - 18}
              y={isoY - 16}
              width={36 * (amount / 50)}
              height={5}
              fill="#bbf7d0"
            />
          </g>
        );
      })}

      {/* Gold mines — isometric 3D mine shaft entrance */}
      {goldMines.map((mine, mineIdx) => {
        if (!mine.amount) return null;
        const { x, y, amount } = mine;
        const { isoX, isoY } = tileToSvg(x, y);
        const ts = TILE_SIZE;
        const cx = isoX + ts;
        return (
          <g
            key={`gold-mine-${mineIdx}`}
            style={{ cursor: 'pointer' }}
            onContextMenu={e => {
              e.preventDefault();
              if (buildMode) return;
              commandMove(x, y, { type: 'gold', idx: mineIdx });
            }}
          >
            {/* Mine structure */}
            {isoBox(
              isoX,
              isoY,
              20,
              '#fbbf24',
              '#d97706',
              '#f59e0b',
              '#92400e',
              2
            )}
            {/* Dark mine entrance hole on the left face */}
            <polygon
              points={`${isoX + 12},${isoY + ts / 2 - 4} ${isoX + ts / 2},${isoY + ts - 6} ${isoX + ts / 2},${isoY + ts} ${isoX + 12},${isoY + ts / 2}`}
              fill="#1c1917"
              opacity={0.7}
            />
            {/* Pickaxe icon on top */}
            <text
              x={cx}
              y={isoY - 8}
              textAnchor="middle"
              fontSize="14"
              pointerEvents="none"
            >
              ⛏️
            </text>
            {/* Gold ore glints on top face */}
            <circle
              cx={cx - 8}
              cy={isoY - 14}
              r={3}
              fill="#fde047"
              opacity={0.8}
            />
            <circle
              cx={cx + 6}
              cy={isoY - 18}
              r={2}
              fill="#fef08a"
              opacity={0.9}
            />
            <circle
              cx={cx + 16}
              cy={isoY - 12}
              r={2.5}
              fill="#fde047"
              opacity={0.75}
            />
            {/* Resource bar */}
            <rect
              x={cx - 28}
              y={isoY - 32}
              width={56}
              height={5}
              fill="#78350f"
              rx={2}
            />
            <rect
              x={cx - 28}
              y={isoY - 32}
              width={56 * (amount / 250)}
              height={5}
              fill="#fde68a"
              rx={2}
            />
          </g>
        );
      })}
    </>
  );
};
