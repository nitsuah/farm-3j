'use client';

import React, { useState } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import { spawnAnimal } from '@/lib/farm/spawner';
import { addNotification } from '@/lib/farm/notifications';
import { EditorToolbar, EditorMode } from './EditorToolbar';
import { BuildPanel } from './BuildPanel';
import { AnimalPanel } from './AnimalPanel';

interface FarmEditorProps {
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  selectedBuildItem: any;
  onBuildItemChange: (item: any) => void;
  selectedAnimal: any;
  onAnimalChange: (animal: any) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
}

export function FarmEditor({
  editorMode,
  onEditorModeChange,
  selectedBuildItem,
  onBuildItemChange,
  selectedAnimal,
  onAnimalChange,
  showGrid,
  onShowGridChange,
}: FarmEditorProps) {
  const { state, dispatch } = useFarm();
  const [showHelp, setShowHelp] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);

  const handleSpawnAnimal = (type: 'cow' | 'chicken' | 'pig' | 'sheep') => {
    const costs = { cow: 500, chicken: 100, pig: 300, sheep: 400 };
    const cost = costs[type];

    if (state.money < cost) {
      addNotification(
        `❌ Not enough money! Need $${cost} to buy a ${type}.`,
        'error',
        3000
      );
      return;
    }

    const newAnimal = spawnAnimal(type);
    dispatch({ type: 'SPAWN_ANIMAL', payload: newAnimal });
    dispatch({ type: 'UPDATE_STATS', payload: { money: state.money - cost } });
    addNotification(`✅ Purchased ${type} for $${cost}!`, 'success', 2000);
  };

  const handleTogglePause = () => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  };

  const handleRepairFences = () => {
    if (state.money >= 50 && state.fenceHealth < 100) {
      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          fenceHealth: Math.min(100, state.fenceHealth + 20),
          money: state.money - 50,
        },
      });
      addNotification('🔧 Fences repaired!', 'success', 2000);
    }
  };

  const handleHealAnimals = () => {
    if (state.money >= 100 && state.animalHealth < 100) {
      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          animalHealth: Math.min(100, state.animalHealth + 30),
          money: state.money - 100,
        },
      });
      addNotification('💊 Animals healed!', 'success', 2000);
    }
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4 text-white shadow-xl">
      <h2 className="mb-4 text-2xl font-bold text-green-400">🌾 Farm Editor</h2>

      {/* Editor Mode Toolbar */}
      <div className="mb-6">
        <EditorToolbar
          mode={editorMode}
          onModeChange={mode => {
            onEditorModeChange(mode);
            onBuildItemChange(null);
            onAnimalChange(null);
          }}
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={setAnimationSpeed}
        />
      </div>

      {/* Grid Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={e => onShowGridChange(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Show Grid Overlay
        </label>
      </div>

      {/* Mode-specific content */}
      <div className="mb-6">
        {editorMode === 'build' && (
          <BuildPanel
            money={state.money}
            onItemSelect={onBuildItemChange}
            selectedItem={selectedBuildItem}
          />
        )}
        {editorMode === 'animals' && (
          <AnimalPanel
            money={state.money}
            onAnimalSelect={onAnimalChange}
            selectedAnimal={selectedAnimal}
          />
        )}
        {editorMode === 'select' && (
          <div className="rounded bg-gray-700/50 p-4 text-sm text-gray-300">
            <p>Click on entities to select and move them.</p>
            <p className="mt-2 text-xs text-gray-400">
              This feature is coming soon!
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="mb-6 border-t border-gray-700 pt-4">
        <h3 className="mb-2 text-lg font-semibold">Controls</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleTogglePause}
            className={`rounded px-4 py-2 font-semibold transition-colors ${
              state.isPaused
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {state.isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={handleRepairFences}
            disabled={state.money < 50 || state.fenceHealth >= 100}
            className="rounded bg-amber-600 px-4 py-2 font-semibold transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            🔧 Repair Fences ($50)
          </button>
          <button
            onClick={handleHealAnimals}
            disabled={state.money < 100 || state.animalHealth >= 100}
            className="rounded bg-red-600 px-4 py-2 font-semibold transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            💊 Heal Animals ($100)
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="rounded bg-purple-600 px-4 py-2 font-semibold transition-colors hover:bg-purple-700"
          >
            {showHelp ? '❌ Hide Help' : '❓ Keyboard Shortcuts'}
          </button>
        </div>

        {/* Keyboard shortcuts help panel */}
        {showHelp && (
          <div className="mt-4 rounded-lg bg-gray-900 p-4 text-sm">
            <h4 className="mb-2 font-semibold text-purple-400">
              ⌨️ Keyboard Shortcuts
            </h4>
            <ul className="space-y-1">
              <li>
                <kbd className="rounded bg-gray-700 px-2 py-1">Space</kbd> or{' '}
                <kbd className="rounded bg-gray-700 px-2 py-1">P</kbd> -
                Pause/Resume
              </li>
              <li>
                <kbd className="rounded bg-gray-700 px-2 py-1">R</kbd> - Repair
                Fences ($50)
              </li>
              <li>
                <kbd className="rounded bg-gray-700 px-2 py-1">H</kbd> - Heal
                Animals ($100)
              </li>
              <li>
                <kbd className="rounded bg-gray-700 px-2 py-1">?</kbd> - Show
                Tutorial
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Stats Display */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="mb-2 text-lg font-semibold">📊 Farm Stats</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>💰 Money:</span>
            <span className="font-bold text-green-400">${state.money}</span>
          </div>
          <div className="flex justify-between">
            <span>📅 Day:</span>
            <span className="font-bold">{state.day}</span>
          </div>
          <div className="flex justify-between">
            <span>🕐 Time:</span>
            <span className="font-bold">
              {Math.floor(state.time)}:
              {String(Math.floor((state.time % 1) * 60)).padStart(2, '0')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>🪵 Fence Health:</span>
            <span className="font-bold text-yellow-400">
              {state.fenceHealth}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>❤️ Animal Health:</span>
            <span className="font-bold text-red-400">
              {state.animalHealth}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>🐾 Total Animals:</span>
            <span className="font-bold">
              {state.entities.filter(e => e.velocity && e.velocity > 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="mt-4 border-t border-gray-700 pt-4">
        <h3 className="mb-2 text-lg font-semibold">📦 Resources</h3>
        <div className="space-y-2">
          {Object.entries(state.resources).map(([resource, amount]) => {
            const icons = { milk: '🥛', eggs: '🥚', meat: '🥩', wool: '🧶' };
            const prices = { milk: 10, eggs: 5, meat: 20, wool: 15 };
            const icon = icons[resource as keyof typeof icons];
            const price = prices[resource as keyof typeof prices];

            return (
              <div
                key={resource}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {icon} {resource.charAt(0).toUpperCase() + resource.slice(1)}:{' '}
                  {amount}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const prices = { milk: 10, eggs: 5, meat: 20, wool: 15 };
                      const price = prices[resource as keyof typeof prices];
                      dispatch({
                        type: 'SELL_RESOURCE',
                        payload: {
                          resource: resource as keyof typeof state.resources,
                          amount: 1,
                        },
                      });
                      addNotification(
                        `💰 Sold ${resource} for $${price}!`,
                        'success',
                        2000
                      );
                    }}
                    disabled={amount < 1}
                    className="rounded bg-green-600 px-2 py-1 text-xs hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                  >
                    Sell ${price}
                  </button>
                  <button
                    onClick={() => {
                      const prices = { milk: 10, eggs: 5, meat: 20, wool: 15 };
                      const price = prices[resource as keyof typeof prices];
                      const totalPrice = amount * price;
                      dispatch({
                        type: 'SELL_RESOURCE',
                        payload: {
                          resource: resource as keyof typeof state.resources,
                          amount: amount,
                        },
                      });
                      addNotification(
                        `💰 Sold all ${resource} for $${totalPrice}!`,
                        'success',
                        2000
                      );
                    }}
                    disabled={amount < 1}
                    className="rounded bg-blue-600 px-2 py-1 text-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                  >
                    Sell All
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
