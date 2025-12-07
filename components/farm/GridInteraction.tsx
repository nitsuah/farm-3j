'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import {
  screenToGrid,
  isValidGridPosition,
  gridToPercent,
} from '@/lib/farm/isometric';
import { spawnAnimal } from '@/lib/farm/spawner';
import { createFence, createTrough } from '@/lib/farm/structures';
import { addNotification } from '@/lib/farm/notifications';

interface GridInteractionProps {
  mode: 'select' | 'build' | 'animals';
  selectedBuildItem: any;
  selectedAnimal: any;
  onItemPlaced: () => void;
  showGrid: boolean;
}

export function GridInteraction({
  mode,
  selectedBuildItem,
  selectedAnimal,
  onItemPlaced,
  showGrid,
}: GridInteractionProps) {
  const { state, dispatch } = useFarm();
  const [hoverGrid, setHoverGrid] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const { gridX, gridY } = screenToGrid(screenX, screenY);

      if (!isValidGridPosition(gridX, gridY)) return;

      // Handle animal placement
      if (mode === 'animals' && selectedAnimal) {
        const costs: Record = {
          cow: 500,
          chicken: 100,
          pig: 300,
          sheep: 400,
        };
        const cost = costs[selectedAnimal.type];

        if (state.money < cost) {
          addNotification(
            `❌ Not enough money! Need $${cost} to buy a ${selectedAnimal.type}.`,
            'error',
            3000
          );
          return;
        }

        const newAnimal = spawnAnimal(selectedAnimal.type);
        const { x, y } = gridToPercent(gridX, gridY);

        dispatch({
          type: 'SPAWN_ANIMAL',
          payload: { ...newAnimal, x, y, gridX, gridY },
        });
        dispatch({
          type: 'UPDATE_STATS',
          payload: { money: state.money - cost },
        });
        addNotification(
          `✅ Purchased ${selectedAnimal.type} for $${cost}!`,
          'success',
          2000
        );
        onItemPlaced();
      }

      // Handle structure placement
      if (mode === 'build' && selectedBuildItem) {
        const cost = selectedBuildItem.cost;

        if (state.money < cost) {
          addNotification(`❌ Not enough money! Need $${cost}.`, 'error', 3000);
          return;
        }

        let newStructure;
        if (selectedBuildItem.id === 'fence-h') {
          newStructure = createFence(gridX, gridY, 'horizontal');
        } else if (selectedBuildItem.id === 'fence-v') {
          newStructure = createFence(gridX, gridY, 'vertical');
        } else if (selectedBuildItem.id === 'trough') {
          newStructure = createTrough(gridX, gridY);
        }

        if (newStructure) {
          dispatch({ type: 'SPAWN_STATIC', payload: newStructure });
          dispatch({
            type: 'UPDATE_STATS',
            payload: { money: state.money - cost },
          });
          addNotification(
            `✅ Placed ${selectedBuildItem.name} for $${cost}!`,
            'success',
            2000
          );
          onItemPlaced();
        }
      }
    },
    [
      mode,
      selectedBuildItem,
      selectedAnimal,
      state.money,
      dispatch,
      onItemPlaced,
    ]
  );

  const handleCanvasHover = useCallback(
    (event: React.MouseEvent) => {
      if (!showGrid && mode === 'select') return;

      const rect = event.currentTarget.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const { gridX, gridY } = screenToGrid(screenX, screenY);

      if (isValidGridPosition(gridX, gridY)) {
        setHoverGrid({ x: gridX, y: gridY });
      } else {
        setHoverGrid(null);
      }
    },
    [showGrid, mode]
  );

  const handleCanvasLeave = useCallback(() => {
    setHoverGrid(null);
  }, []);

  // Handle Escape key to cancel placement
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onItemPlaced();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onItemPlaced]);

  // Show cursor indicator
  const cursorClass =
    mode === 'animals' && selectedAnimal
      ? 'cursor-pointer'
      : mode === 'build' && selectedBuildItem
        ? 'cursor-crosshair'
        : mode === 'select'
          ? 'cursor-move'
          : 'cursor-default';

  return (
    <div
      className={`absolute inset-0 ${cursorClass}`}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasHover}
      onMouseLeave={handleCanvasLeave}
      style={{ zIndex: 100 }}
    >
      {/* Hover indicator */}
      {hoverGrid && (mode === 'animals' || mode === 'build') && (
        <div
          className="pointer-events-none absolute h-16 w-16 rounded border-2 border-dashed border-white bg-white/20"
          style={{
            left: `${(gridToPercent(hoverGrid.x, hoverGrid.y).x / 100) * 100}%`,
            top: `${(gridToPercent(hoverGrid.x, hoverGrid.y).y / 100) * 100}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}
