'use client';

import React, { useState } from 'react';

export type EditorMode = 'select' | 'build' | 'animals';

interface EditorToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
}

export function EditorToolbar({
  mode,
  onModeChange,
  animationSpeed,
  onAnimationSpeedChange,
}: EditorToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="space-y-2">
        <button
          onClick={() => onModeChange('build')}
          className={`w-full rounded px-4 py-2 text-left font-semibold transition-colors ${
            mode === 'build'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🏗️ Build
        </button>
        <button
          onClick={() => onModeChange('animals')}
          className={`w-full rounded px-4 py-2 text-left font-semibold transition-colors ${
            mode === 'animals'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🐄 Animals
        </button>
        <button
          onClick={() => onModeChange('select')}
          className={`w-full rounded px-4 py-2 text-left font-semibold transition-colors ${
            mode === 'select'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🖱️ Move/Select
        </button>
      </div>

      {/* Animation Speed Slider */}
      <div className="space-y-2 border-t border-gray-700 pt-4">
        <label className="text-sm font-semibold text-gray-300">
          Animation Speed
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={animationSpeed}
          onChange={e => onAnimationSpeedChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-400">
          {animationSpeed.toFixed(1)}x
        </div>
      </div>
    </div>
  );
}
