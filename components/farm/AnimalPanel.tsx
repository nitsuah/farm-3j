'use client';

import React from 'react';

interface AnimalItem {
  id: string;
  type: 'cow' | 'chicken' | 'pig' | 'sheep';
  name: string;
  icon: string;
  cost: number;
}

const ANIMAL_ITEMS: AnimalItem[] = [
  { id: 'cow', type: 'cow', name: 'Cow', icon: '🐄', cost: 500 },
  { id: 'chicken', type: 'chicken', name: 'Chicken', icon: '🐔', cost: 100 },
  { id: 'pig', type: 'pig', name: 'Pig', icon: '🐷', cost: 300 },
  { id: 'sheep', type: 'sheep', name: 'Sheep', icon: '🐑', cost: 400 },
];

interface AnimalPanelProps {
  money: number;
  onAnimalSelect: (animal: AnimalItem) => void;
  selectedAnimal: AnimalItem | null;
}

export function AnimalPanel({
  money,
  onAnimalSelect,
  selectedAnimal,
}: AnimalPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-300">Animals</h3>
      <div className="grid grid-cols-2 gap-2">
        {ANIMAL_ITEMS.map(animal => {
          const canAfford = money >= animal.cost;
          const isSelected = selectedAnimal?.id === animal.id;

          return (
            <button
              key={animal.id}
              onClick={() => onAnimalSelect(animal)}
              disabled={!canAfford}
              className={`rounded px-3 py-3 text-center transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : canAfford
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'cursor-not-allowed bg-gray-800 text-gray-600'
              }`}
            >
              <div className="text-2xl">{animal.icon}</div>
              <div className="mt-1 text-xs font-semibold">{animal.name}</div>
              <div
                className={`mt-1 text-xs ${
                  canAfford ? 'text-green-400' : 'text-red-400'
                }`}
              >
                ${animal.cost}
              </div>
            </button>
          );
        })}
      </div>
      {selectedAnimal && (
        <div className="mt-4 rounded bg-blue-900/30 p-3 text-xs text-blue-200">
          <p className="font-semibold">
            Click on the grid to place {selectedAnimal.name}
          </p>
          <p className="mt-1 text-blue-300/70">
            Right-click or press Esc to cancel
          </p>
        </div>
      )}
    </div>
  );
}
