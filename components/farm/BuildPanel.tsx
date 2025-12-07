'use client';

import React from 'react';

interface BuildItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  type: 'fence' | 'trough' | 'structure';
}

const BUILD_ITEMS: BuildItem[] = [
  {
    id: 'fence-h',
    name: 'Horizontal Fence',
    icon: '━',
    cost: 10,
    type: 'fence',
  },
  { id: 'fence-v', name: 'Vertical Fence', icon: '┃', cost: 10, type: 'fence' },
  { id: 'trough', name: 'Trough', icon: '🪣', cost: 50, type: 'structure' },
];

interface BuildPanelProps {
  money: number;
  onItemSelect: (item: BuildItem) => void;
  selectedItem: BuildItem | null;
}

export function BuildPanel({
  money,
  onItemSelect,
  selectedItem,
}: BuildPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-300">Structures</h3>
      <div className="space-y-2">
        {BUILD_ITEMS.map(item => {
          const canAfford = money >= item.cost;
          const isSelected = selectedItem?.id === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item)}
              disabled={!canAfford}
              className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : canAfford
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'cursor-not-allowed bg-gray-800 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>
                  <span className="mr-2 text-lg">{item.icon}</span>
                  {item.name}
                </span>
                <span
                  className={`text-xs ${
                    canAfford ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  ${item.cost}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {selectedItem && (
        <div className="mt-4 rounded bg-blue-900/30 p-3 text-xs text-blue-200">
          <p className="font-semibold">
            Click on the grid to place {selectedItem.name}
          </p>
          <p className="mt-1 text-blue-300/70">
            Right-click or press Esc to cancel
          </p>
        </div>
      )}
    </div>
  );
}
