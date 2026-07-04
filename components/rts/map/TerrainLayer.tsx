import React from 'react';

import type { WorkerState } from '../game/types';
import { GRID_SIZE, SHRINES, TILE_SIZE } from '../game/constants';
import { INITIAL_TILES, tileToSvg } from '../game/map';
import { aStar } from '../game/pathfinding';
import type { BuildingType, LootCrate, TileType } from '../game/types';

interface TerrainLayerProps {
  addFloatingText: (
    tileX: number,
    tileY: number,
    text: string,
    color: string
  ) => void;
  anySelected: boolean;
  attackMoveMode: boolean;
  attackMoveModeRef: React.RefObject<boolean>;
  buildMode: BuildingType | null;
  capturedShrines: Set<number>;
  commandMove: (
    targetX: number,
    targetY: number,
    gathering?: WorkerState['gathering'],
    attacking?: WorkerState['attacking']
  ) => void;
  commandQueueMove: (targetX: number, targetY: number) => void;
  lootCrates: LootCrate[];
  patrolMode: boolean;
  patrolModeRef: React.RefObject<boolean>;
  selectedType: 'worker' | 'farmhouse' | 'building' | null;
  setAttackMoveMode: React.Dispatch<React.SetStateAction<boolean>>;
  setPatrolMode: React.Dispatch<React.SetStateAction<boolean>>;
  setRallyPoint: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  setShrineCapturing: React.Dispatch<
    React.SetStateAction<{
      shrineId: number;
      workerId: number;
      startedAt: number;
    } | null>
  >;
  setWorkers: React.Dispatch<React.SetStateAction<WorkerState[]>>;
  tiles: TileType[][];
  workers: WorkerState[];
}

export const TerrainLayer: React.FC<TerrainLayerProps> = ({
  addFloatingText,
  anySelected,
  attackMoveMode,
  attackMoveModeRef,
  buildMode,
  capturedShrines,
  commandMove,
  commandQueueMove,
  lootCrates,
  patrolMode,
  patrolModeRef,
  selectedType,
  setAttackMoveMode,
  setPatrolMode,
  setRallyPoint,
  setShrineCapturing,
  setWorkers,
  tiles,
  workers,
}) => {
  return (
    <>
      {/* Tiles */}
      {[...Array(GRID_SIZE)].map((_, i) =>
        [...Array(GRID_SIZE)].map((_, j) => {
          const { isoX, isoY } = tileToSvg(i, j);
          let fill = '#14532d';
          if (tiles[i]?.[j] === 'dirt') fill = '#92400e';
          if (tiles[i]?.[j] === 'water') fill = '#1d4ed8';
          if (tiles[i]?.[j] === 'rock') fill = '#475569';
          if (tiles[i]?.[j] === 'tree') fill = '#166534';
          const pts = [
            [isoX, isoY + TILE_SIZE / 2],
            [isoX + TILE_SIZE, isoY],
            [isoX + TILE_SIZE * 2, isoY + TILE_SIZE / 2],
            [isoX + TILE_SIZE, isoY + TILE_SIZE],
          ]
            .map(p => p.join(','))
            .join(' ');
          return (
            <polygon
              key={`tile-${i}-${j}`}
              points={pts}
              fill={fill}
              stroke="#1e293b"
              strokeWidth={1.5}
              onContextMenu={e => {
                e.preventDefault();
                if (buildMode) return;
                if (selectedType === 'farmhouse') {
                  setRallyPoint({ x: i, y: j });
                  return;
                }
                if (!anySelected) return;
                if (patrolModeRef.current) {
                  const dest = { x: i, y: j };
                  setWorkers(ws =>
                    ws.map(w => {
                      if (!w.selected) return w;
                      const a = { x: Math.round(w.x), y: Math.round(w.y) };
                      const p = aStar(INITIAL_TILES, a, dest);
                      return {
                        ...w,
                        patrol: { a, b: dest, heading: 'b' },
                        movingTo: p[0] ?? dest,
                        path: p.slice(1),
                        gathering: null,
                        attacking: null,
                        repairing: null,
                        state: 'moving',
                      };
                    })
                  );
                  setPatrolMode(false);
                  return;
                }
                if (attackMoveModeRef.current) {
                  const dest = { x: i, y: j };
                  setWorkers(ws =>
                    ws.map(w => {
                      if (
                        !w.selected ||
                        w.unitType === 'farmer' ||
                        w.unitType === 'catapult' ||
                        w.unitType === 'trebuchet'
                      )
                        return w;
                      const a = { x: Math.round(w.x), y: Math.round(w.y) };
                      const p = aStar(INITIAL_TILES, a, dest);
                      return {
                        ...w,
                        attackMove: true,
                        attackMoveTarget: dest,
                        movingTo: p[0] ?? dest,
                        path: p.slice(1),
                        gathering: null,
                        attacking: null,
                        repairing: null,
                        patrol: null,
                        state: 'moving',
                      };
                    })
                  );
                  setAttackMoveMode(false);
                  return;
                }
                if (e.shiftKey && anySelected) {
                  commandQueueMove(i, j);
                  return;
                }
                // Loot crate: right-click to send farmers to collect
                const crateOnTile = lootCrates.find(
                  c => Math.round(c.x) === i && Math.round(c.y) === j
                );
                if (crateOnTile && anySelected) {
                  commandMove(i, j);
                  return;
                }
                // Shrine: right-click to send one worker to channel
                const shrineOnTile = SHRINES.find(
                  s => s.x === i && s.y === j && !capturedShrines.has(s.id)
                );
                if (shrineOnTile && anySelected) {
                  const selectedWorkers = workers.filter(
                    w =>
                      w.selected &&
                      w.hp > 0 &&
                      (w.unitType === 'farmer' ||
                        w.unitType === 'swordsman' ||
                        w.unitType === 'hero')
                  );
                  if (selectedWorkers.length > 0) {
                    const channeler = selectedWorkers[0]!;
                    commandMove(i, j);
                    setShrineCapturing({
                      shrineId: shrineOnTile.id,
                      workerId: channeler.id,
                      startedAt: Date.now(),
                    });
                    addFloatingText(i, j, '⏳ Capturing...', '#a78bfa');
                  }
                  return;
                }
                commandMove(i, j);
              }}
              style={{
                cursor: buildMode
                  ? 'crosshair'
                  : patrolMode
                    ? 'crosshair'
                    : attackMoveMode
                      ? 'crosshair'
                      : anySelected || selectedType === 'farmhouse'
                        ? 'pointer'
                        : undefined,
              }}
            />
          );
        })
      )}
    </>
  );
};
