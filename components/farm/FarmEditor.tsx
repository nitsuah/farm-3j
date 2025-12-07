'use client';

import React from 'react';
import { useFarm } from '@/lib/farm/FarmContext';
import { spawnAnimal } from '@/lib/farm/spawner';

export function FarmEditor() {
  const { state, dispatch } = useFarm();

  const handleSpawnAnimal = (type: 'cow' | 'chicken' | 'pig' | 'sheep') => {
    const newAnimal = spawnAnimal(type);
    dispatch({ type: 'SPAWN_ANIMAL', payload: newAnimal });
  };

  const handleTogglePause = () => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  };

  const animalCounts = {
    cow: state.entities.filter((e) => e.type === 'cow').length,
    chicken: state.entities.filter((e) => e.type === 'chicken').length,
    pig: state.entities.filter((e) => e.type === 'pig').length,
    sheep: state.entities.filter((e) => e.type === 'sheep').length,
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-green-400">🌾 Farm Editor</h2>

      {/* Control Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Controls</h3>
        <button
          onClick={handleTogglePause}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            state.isPaused
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {state.isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
      </div>

      {/* Spawn Animals Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">🐄 Spawn Animals</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSpawnAnimal('cow')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold transition-colors"
          >
            🐄 Cow ({animalCounts.cow})
          </button>
          <button
            onClick={() => handleSpawnAnimal('chicken')}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-semibold transition-colors"
          >
            🐔 Chicken ({animalCounts.chicken})
          </button>
          <button
            onClick={() => handleSpawnAnimal('pig')}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded font-semibold transition-colors"
          >
            🐷 Pig ({animalCounts.pig})
          </button>
          <button
            onClick={() => handleSpawnAnimal('sheep')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-semibold transition-colors"
          >
            🐑 Sheep ({animalCounts.sheep})
          </button>
        </div>
      </div>

      {/* Stats Display */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold mb-2">📊 Farm Stats</h3>
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
            <span className="font-bold">{state.time.toFixed(1)}:00</span>
          </div>
          <div className="flex justify-between">
            <span>🪵 Fence Health:</span>
            <span className="font-bold text-yellow-400">{state.fenceHealth}%</span>
          </div>
          <div className="flex justify-between">
            <span>❤️ Animal Health:</span>
            <span className="font-bold text-red-400">{state.animalHealth}%</span>
          </div>
          <div className="flex justify-between">
            <span>🐾 Total Animals:</span>
            <span className="font-bold">
              {state.entities.filter((e) => e.velocity && e.velocity > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
