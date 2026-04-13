"use client";

import React, { useState } from "react";
import { GAME_CONFIG } from "@/lib/farm/constants";

interface TrainableUnit {
  id: string;
  type: "cow" | "chicken" | "pig";
  name: string;
  icon: string;
  cost: number;
  trainTime: number; // seconds
}

const TRAINABLE_UNITS: TrainableUnit[] = [
  { id: "cow", type: "cow", name: "Cow", icon: "🐄", cost: 500, trainTime: 5 },
  { id: "chicken", type: "chicken", name: "Chicken", icon: "🐔", cost: 100, trainTime: 2 },
  { id: "pig", type: "pig", name: "Pig", icon: "🐷", cost: 300, trainTime: 4 },
];

interface BarnPanelProps {
  money: number;
  onTrain: (unit: TrainableUnit) => void;
  trainingQueue: { unit: TrainableUnit; remaining: number }[];
}

export const BarnPanel: React.FC<BarnPanelProps> = ({ money, onTrain, trainingQueue }) => {
  const [selectedUnit, setSelectedUnit] = useState<TrainableUnit | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-300">Barn: Train Units</h3>
      <div className="grid grid-cols-3 gap-2">
        {TRAINABLE_UNITS.map(unit => {
          const canAfford = money >= unit.cost;
          return (
            <button
              key={unit.id}
              onClick={() => setSelectedUnit(unit)}
              disabled={!canAfford}
              className={`rounded px-3 py-3 text-center transition-colors ${
                canAfford ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "cursor-not-allowed bg-gray-800 text-gray-600"
              }`}
            >
              <div className="text-2xl">{unit.icon}</div>
              <div className="mt-1 text-xs font-semibold">{unit.name}</div>
              <div className={`mt-1 text-xs ${canAfford ? "text-green-400" : "text-red-400"}`}>${unit.cost}</div>
              <div className="text-[10px] text-blue-300">{unit.trainTime}s</div>
            </button>
          );
        })}
      </div>
      {selectedUnit && (
        <div className="mt-4 rounded bg-blue-900/30 p-3 text-xs text-blue-200">
          <p className="font-semibold">Train {selectedUnit.name}?</p>
          <button
            className="mt-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
            onClick={() => {
              onTrain(selectedUnit);
              setSelectedUnit(null);
            }}
            disabled={money < selectedUnit.cost}
          >
            Confirm (${selectedUnit.cost})
          </button>
          <button
            className="ml-2 rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-800"
            onClick={() => setSelectedUnit(null)}
          >
            Cancel
          </button>
        </div>
      )}
      {trainingQueue.length > 0 && (
        <div className="mt-4 rounded bg-yellow-900/30 p-3 text-xs text-yellow-200">
          <p className="font-semibold">Training Queue</p>
          <ul className="mt-1 space-y-1">
            {trainingQueue.map((item, idx) => (
              <li key={idx}>
                {item.unit.icon} {item.unit.name} - {item.remaining}s
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};