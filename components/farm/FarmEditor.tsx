'use client';

import React from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import { spawnAnimal } from '@/lib/farm/spawner';

export function FarmEditor() {
  const { state, dispatch } = useFarm();

  const handleSpawnAnimal = (type: 'cow' | 'chicken' | 'pig' | 'sheep') => {
    const costs = { cow: 500, chicken: 100, pig: 300, sheep: 400 };
    const cost = costs[type];

    if (state.money < cost) {
      return; // Can't afford
    }

    const newAnimal = spawnAnimal(type);
    dispatch({ type: 'SPAWN_ANIMAL', payload: newAnimal });
    dispatch({ type: 'UPDATE_STATS', payload: { money: state.money - cost } });
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
    }
  };

  const animalCounts = {
    cow: state.entities.filter(e => e.type === 'cow').length,
    chicken: state.entities.filter(e => e.type === 'chicken').length,
    pig: state.entities.filter(e => e.type === 'pig').length,
    sheep: state.entities.filter(e => e.type === 'sheep').length,
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4 text-white shadow-xl">
      <h2 className="mb-4 text-2xl font-bold text-green-400">🌾 Farm Editor</h2>

      {/* Control Buttons */}
      <div className="mb-6">
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
        </div>
      </div>

      {/* Spawn Animals Section */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">🐄 Buy Animals</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSpawnAnimal('cow')}
            disabled={state.money < 500}
            className="rounded bg-blue-600 px-4 py-2 font-semibold transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            <div>🐄 Cow</div>
            <div className="text-xs">$500 ({animalCounts.cow})</div>
          </button>
          <button
            onClick={() => handleSpawnAnimal('chicken')}
            disabled={state.money < 100}
            className="rounded bg-orange-600 px-4 py-2 font-semibold transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            <div>🐔 Chicken</div>
            <div className="text-xs">$100 ({animalCounts.chicken})</div>
          </button>
          <button
            onClick={() => handleSpawnAnimal('pig')}
            disabled={state.money < 300}
            className="rounded bg-pink-600 px-4 py-2 font-semibold transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            <div>🐷 Pig</div>
            <div className="text-xs">$300 ({animalCounts.pig})</div>
          </button>
          <button
            onClick={() => handleSpawnAnimal('sheep')}
            disabled={state.money < 400}
            className="rounded bg-gray-600 px-4 py-2 font-semibold transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            <div>🐑 Sheep</div>
            <div className="text-xs">$400 ({animalCounts.sheep})</div>
          </button>
        </div>
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
                <button
                  onClick={() =>
                    dispatch({
                      type: 'SELL_RESOURCE',
                      payload: {
                        resource: resource as keyof typeof state.resources,
                        amount: 1,
                      },
                    })
                  }
                  disabled={amount < 1}
                  className="rounded bg-green-600 px-2 py-1 text-xs hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  Sell ${price}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
