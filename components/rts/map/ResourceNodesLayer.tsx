import React from 'react';

import type { WorkerState } from '../RTSUI';
import { TILE_SIZE } from '../game/constants';
import { tileToSvg } from '../game/map';
import type { BuildingType, ResourceNode } from '../game/types';

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

export function ResourceNodesLayer({
  buildMode,
  commandMove,
  goldMines,
  stoneNodes,
  trees,
}: ResourceNodesLayerProps) {
  return (
    <>
      {/* Stone nodes */}
      {stoneNodes.map(({ x, y, amount }, idx) => {
        if (!amount) return null;
        const { isoX, isoY } = tileToSvg(x, y);
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
            <ellipse
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + 28}
              rx={22}
              ry={16}
              fill="#94a3b8"
              stroke="#475569"
              strokeWidth={3}
            />
            <ellipse
              cx={isoX + TILE_SIZE / 2 - 10}
              cy={isoY + 22}
              rx={14}
              ry={10}
              fill="#cbd5e1"
              stroke="#64748b"
              strokeWidth={2}
            />
            <text
              x={isoX + TILE_SIZE / 2}
              y={isoY + 46}
              textAnchor="middle"
              fontSize="13"
            >
              🪨
            </text>
            <rect
              x={isoX + TILE_SIZE / 2 - 20}
              y={isoY + 4}
              width={40}
              height={5}
              fill="#1e293b"
            />
            <rect
              x={isoX + TILE_SIZE / 2 - 20}
              y={isoY + 4}
              width={40 * (amount / 100)}
              height={5}
              fill="#94a3b8"
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

      {/* Gold mines */}
      {goldMines.map((mine, mineIdx) => {
        if (!mine.amount) return null;
        const { x, y, amount } = mine;
        const { isoX, isoY } = tileToSvg(x, y);
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
            <ellipse
              cx={isoX + TILE_SIZE / 2}
              cy={isoY + 24}
              rx={28}
              ry={20}
              fill="#fde68a"
              stroke="#b45309"
              strokeWidth={4}
            />
            <text
              x={isoX + TILE_SIZE / 2}
              y={isoY + 32}
              textAnchor="middle"
              fontSize="16"
            >
              ⛏️
            </text>
            <rect
              x={isoX + TILE_SIZE / 2 - 28}
              y={isoY + 8}
              width={56}
              height={5}
              fill="#a16207"
            />
            <rect
              x={isoX + TILE_SIZE / 2 - 28}
              y={isoY + 8}
              width={56 * (amount / 250)}
              height={5}
              fill="#fde68a"
            />
          </g>
        );
      })}
    </>
  );
}
