'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FarmProvider } from '@/lib/farm/FarmContext';
import { FarmCanvas } from '@/components/farm/FarmCanvas';
import { FarmEditor } from '@/components/farm/FarmEditor';
import { NotificationSystem } from '@/components/farm/NotificationSystem';
import { FarmNotificationWatcher } from '@/components/farm/FarmNotificationWatcher';
import { TutorialOverlay } from '@/components/farm/TutorialOverlay';
import { KeyboardControls } from '@/components/farm/KeyboardControls';
import { GridInteraction } from '@/components/farm/GridInteraction';
import type { EditorMode } from '@/components/farm/EditorToolbar';

export default function FarmPage() {
  const [editorMode, setEditorMode] = useState<EditorMode>('select');
  const [selectedBuildItem, setSelectedBuildItem] = useState<{
    id: string;
    name: string;
    cost: number;
  } | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<{
    id: string;
    type: 'cow' | 'chicken' | 'pig' | 'sheep';
    name: string;
    cost: number;
  } | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  const handleItemPlaced = () => {
    setSelectedBuildItem(null);
    setSelectedAnimal(null);
  };

  return (
    <FarmProvider>
      <NotificationSystem />
      <FarmNotificationWatcher />
      <TutorialOverlay />
      <KeyboardControls />
      <div
        className="fixed inset-0 overflow-hidden bg-gradient-to-b from-sky-200 to-green-100 dark:from-gray-900 dark:to-gray-800"
        suppressHydrationWarning
      >
        {/* Fullscreen farm game - header hidden */}
        <div className="flex h-full">
          {/* Main canvas area */}
          <div className="relative flex-1">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
              <div className="rounded-lg bg-black/70 px-4 py-2 backdrop-blur-sm">
                <h1 className="text-xl font-bold text-white">
                  🌾 Harvest Haven Farm
                </h1>
              </div>
              <Link
                href="/"
                className="rounded-lg bg-green-600/90 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-green-700"
              >
                ← Home
              </Link>
            </div>

            {/* Farm Canvas - Fullscreen */}
            <div className="relative h-full w-full">
              <FarmCanvas showGrid={showGrid} />
              <GridInteraction
                mode={editorMode}
                selectedBuildItem={selectedBuildItem}
                selectedAnimal={selectedAnimal}
                onItemPlaced={handleItemPlaced}
                showGrid={showGrid}
              />
            </div>
          </div>

          {/* Compact Editor Sidebar */}
          <div
            className="h-full w-80 shrink-0 overflow-y-auto border-l border-gray-700 bg-gray-900/95 backdrop-blur-sm"
            suppressHydrationWarning
          >
            <FarmEditor
              editorMode={editorMode}
              onEditorModeChange={setEditorMode}
              selectedBuildItem={selectedBuildItem}
              onBuildItemChange={setSelectedBuildItem}
              selectedAnimal={selectedAnimal}
              onAnimalChange={setSelectedAnimal}
              showGrid={showGrid}
              onShowGridChange={setShowGrid}
            />
          </div>
        </div>
      </div>
    </FarmProvider>
  );
}
