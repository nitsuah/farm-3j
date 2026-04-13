"use client";

import React, { useState } from 'react';
import { ThreeJSFarmView } from './ThreeJSFarmView';
import { useFarm } from '@/lib/farm/FarmContext';
import { spawnAnimal } from '@/lib/farm/spawner';
import { addNotification } from '@/lib/farm/notifications';
import { GAME_CONFIG } from '@/lib/farm/constants';
import { EditorToolbar, EditorMode } from './EditorToolbar';
import { BuildPanel } from './BuildPanel';
import { AnimalPanel } from './AnimalPanel';
import { BarnPanel } from './BarnPanel';
import { TechTreePanel } from './TechTreePanel';
  // Tech tree state
  const [showTechTree, setShowTechTree] = useState(false);
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>([]);
  // Tech unlock logic
  const handleUnlockTech = (node: any) => {
    // Deduct resources
    const newResources = { ...state.resources };
    Object.entries(node.cost).forEach(([res, amt]) => {
      newResources[res] = (newResources[res] || 0) - amt;
    });
    setUnlockedTechs(list => [...list, node.id]);
    dispatch({ type: 'UPDATE_STATS', payload: { resources: newResources } });
    addNotification(`🔓 Unlocked: ${node.name}`, 'success', 2000);
    // Optionally: node.effect();
  };

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
  // Barn training queue: [{ unit, remaining }]
  const [barnTrainingQueue, setBarnTrainingQueue] = useState<{ unit: any; remaining: number }[]>([]);

  // Simulate training timer
  React.useEffect(() => {
    if (barnTrainingQueue.length === 0) return;
    const timer = setInterval(() => {
      setBarnTrainingQueue(queue => {
        if (queue.length === 0) return queue;
        const [first, ...rest] = queue;
        if (first.remaining <= 1) {
          // Training complete: spawn unit
          const newAnimal = spawnAnimal(first.unit.type);
          dispatch({ type: 'SPAWN_ANIMAL', payload: newAnimal });
          dispatch({ type: 'UPDATE_STATS', payload: { money: state.money } });
          addNotification(`✅ Trained ${first.unit.name} at the Barn!`, 'success', 2000);
          return rest;
        }
        return [{ ...first, remaining: first.remaining - 1 }, ...rest];
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [barnTrainingQueue.length, dispatch, state.money]);

  const handleSpawnAnimal = (type: 'cow' | 'chicken' | 'pig' | 'sheep') => {
    const cost = GAME_CONFIG.ANIMALS[type].price;

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
    <div
      className="rounded-lg bg-gray-800 p-4 text-white shadow-xl"
      suppressHydrationWarning
    >
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
        {/* Show BarnPanel if a Barn is selected for training */}
        {selectedBuildItem?.id === 'barn' && (
          <BarnPanel
            money={state.money}
            onTrain={unit => {
              if (state.money < unit.cost) {
                addNotification(`❌ Not enough money! Need $${unit.cost} to train a ${unit.name}.`, 'error', 3000);
                return;
              }
              setBarnTrainingQueue(queue => [
                ...queue,
                { unit, remaining: unit.trainTime },
              ]);
              dispatch({ type: 'UPDATE_STATS', payload: { money: state.money - unit.cost } });
              addNotification(`🚜 Training ${unit.name} at the Barn...`, 'info', 1500);
            }}
            trainingQueue={barnTrainingQueue}
          />
        )}
        {editorMode === 'select' && (
          <div className="rounded bg-gray-800 p-3 text-xs text-gray-300">
            <p>Click entities to select and move them.</p>
            <p className="mt-1 text-gray-400">Coming soon!</p>
          </div>
        )}
      </div>

      {/* Control Buttons - Compact */}
      <div className="border-t border-gray-700 pt-3">
        <h3 className="mb-2 text-sm font-semibold">Controls</h3>
        <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setShowTechTree(v => !v)}
                      className="rounded bg-blue-700 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-blue-800"
                    >
                      {showTechTree ? '❌ Close Tech Tree' : '🧬 Tech Tree'}
                    </button>
                {/* Tech Tree Panel */}
                {showTechTree && (
                  <div className="mt-4">
                    <TechTreePanel
                      resources={state.resources}
                      onUnlock={handleUnlockTech}
                      unlockedTechs={unlockedTechs}
                    />
                  </div>
                )}
          <button
            onClick={handleTogglePause}
            className={`rounded px-3 py-1.5 text-sm font-semibold transition-colors ${
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
            className="rounded bg-amber-600 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:opacity-50"
          >
            🔧 Repair ($50)
          </button>
          <button
            onClick={handleHealAnimals}
            disabled={state.money < 100 || state.animalHealth >= 100}
            className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:opacity-50"
          >
            💊 Heal ($100)
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="rounded bg-purple-600 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-purple-700"
          >
            {showHelp ? '❌ Close' : '❓ Shortcuts'}
          </button>
        </div>

        {/* Keyboard shortcuts help panel - Compact */}
        {showHelp && (
          <div className="mt-2 rounded-lg bg-gray-950 p-2 text-xs">
            <h4 className="mb-1 text-xs font-semibold text-purple-400">
              ⌨️ Shortcuts
            </h4>
            <ul className="space-y-0.5">
              <li className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px]">
                  Space
                </kbd>
                <span className="text-gray-400">Pause</span>
              </li>
              <li className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px]">
                  R
                </kbd>
                <span className="text-gray-400">Repair</span>
              </li>
              <li className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px]">
                  H
                </kbd>
                <span className="text-gray-400">Heal</span>
              </li>
              <li className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px]">
                  ?
                </kbd>
                <span className="text-gray-400">Tutorial</span>
              </li>
              <li className="flex items-center gap-1">
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px]">
                  Esc
                </kbd>
                <span className="text-gray-400">Cancel</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Isolinear/3D View Toggle */}
      <div className="mt-3">
        <button
          className="mb-2 rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-800"
          onClick={() => setShow3D(v => !v)}
        >
          {show3D ? 'Switch to Classic View' : 'Switch to 3D Isolinear View'}
        </button>
        {show3D && (
          <div className="mb-4">
            <ThreeJSFarmView />
          </div>
        )}
      </div>
      {/* Farm Stats - Compact at bottom */}
      <div className="border-t border-gray-700 pt-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-gray-800 p-2">
            <div className="text-gray-400">Money</div>
            <div className="font-bold text-yellow-400">
              ${state.money.toFixed(0)}
            </div>
          </div>
          <div className="rounded bg-gray-800 p-2">
            <div className="text-gray-400">Day {state.day}</div>
            <div className="font-bold">
              {Math.floor(state.time)}:
              {String(Math.floor((state.time % 1) * 60)).padStart(2, '0')}
            </div>
          </div>
          <div className="rounded bg-gray-800 p-2">
            <div className="text-gray-400">Fence</div>
            <div
              className={`font-bold ${
                state.fenceHealth > 50
                  ? 'text-green-400'
                  : state.fenceHealth > 25
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {state.fenceHealth.toFixed(0)}%
            </div>
          </div>
          <div className="rounded bg-gray-800 p-2">
            <div className="text-gray-400">Animals</div>
            <div className="font-bold text-red-400">
              {state.entities.filter(e => e.velocity && e.velocity > 0).length}
            </div>
          </div>
        </div>
      </div>

      {/* Resources - Compact */}
      <div className="mt-3 border-t border-gray-700 pt-3">
        <h3 className="mb-2 text-sm font-semibold">📦 Resources</h3>
        <div className="space-y-1.5">
          {Object.entries(state.resources).map(([resource, amount]) => {
            const icons = {
              milk: '🥛',
              eggs: '🥚',
              meat: '🥩',
              wool: '🧶',
              hay: '🌾',
              water: '💧',
              tractor: '🚜',
              irrigation: '💦',
            };
            const prices = {
              milk: 10,
              eggs: 5,
              meat: 20,
              wool: 15,
              hay: 2,
              water: 1,
              tractor: 200,
              irrigation: 100,
            };
            const sellable = ['milk', 'eggs', 'meat', 'wool', 'hay', 'water'];
            const icon = icons[resource as keyof typeof icons] || '❓';
            const price = prices[resource as keyof typeof prices] || 0;

            return (
              <div
                key={resource}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1">
                  {icon} <span className="font-semibold">{amount}</span>
                </span>
                {sellable.includes(resource) ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
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
                      className="rounded bg-green-600 px-2 py-0.5 text-[10px] hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:opacity-50"
                    >
                      ${price}
                    </button>
                    <button
                      onClick={() => {
                        const totalPrice = amount * price;
                        dispatch({
                          type: 'SELL_RESOURCE',
                          payload: {
                            resource: resource as keyof typeof state.resources,
                            amount,
                          },
                        });
                        addNotification(
                          `💰 Sold all ${resource} for $${totalPrice}!`,
                          'success',
                          2000
                        );
                      }}
                      disabled={amount < 1}
                      className="rounded bg-green-700 px-2 py-0.5 text-[10px] hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:opacity-50"
                    >
                      All
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
