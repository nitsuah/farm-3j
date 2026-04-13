"use client";

import * as React from "react";
import { useState } from "react";
import type { FC } from "react";
import { TECH_TREE, TechNode } from "@/lib/farm/techTree";


export interface TechTreePanelProps {
  resources: Record<string, number>;
  onUnlock: (node: TechNode) => void;
  unlockedTechs: string[];
}

export const TechTreePanel: FC<TechTreePanelProps> = ({ resources, onUnlock, unlockedTechs }) => {
  const [selected, setSelected] = useState<TechNode | null>(null);

  const canUnlock = (node: TechNode) => {
    if (unlockedTechs.includes(node.id)) return false;
    if (node.prerequisites.some(pr => !unlockedTechs.includes(pr))) return false;
    return Object.entries(node.cost).every(([res, amt]) => (resources[res] || 0) >= amt);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-300">Tech Tree</h3>
      <div className="space-y-2">
        {TECH_TREE.map(node => (
          <div key={node.id} className="rounded bg-gray-800 p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300">{node.name}</span>
              {unlockedTechs.includes(node.id) ? (
                <span className="text-green-400">Unlocked</span>
              ) : canUnlock(node) ? (
                <button
                  className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                  onClick={() => onUnlock(node)}
                >
                  Unlock
                </button>
              ) : (
                <span className="text-gray-400">Locked</span>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-300">{node.description}</div>
            <div className="mt-1 text-xs text-yellow-200">
              Cost: {Object.entries(node.cost).map(([res, amt]) => `${amt} ${res}`).join(", ")}
            </div>
            {node.prerequisites.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                Prereq: {node.prerequisites.map(pr => TECH_TREE.find(t => t.id === pr)?.name).join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
