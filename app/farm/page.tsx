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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-4">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">
              🌾 Harvest Haven Farm - Interactive Demo
            </h1>
            <p className="text-gray-300">
              Phase 1 MVP: Basic entity spawning and movement simulation
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"
          >
            ← Back to Home
          </Link>
        </header>

        {/* Main Content */}
        <div className="grid h-[calc(100vh-180px)] grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Farm Canvas - Takes up most space */}
          <div className="relative h-full overflow-hidden lg:col-span-3">
            <div
              className="relative"
              style={{ width: '1200px', height: '800px', margin: '0 auto' }}
            >
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

          {/* Editor Panel - Sidebar */}
          <div className="lg:col-span-1">
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

        {/* Footer Info */}
        <footer className="mt-4 text-center text-sm text-gray-400">
          <p>
            Built with Next.js, React Context, and requestAnimationFrame • See{' '}
            <code className="rounded bg-gray-700 px-2 py-1">
              docs/FARM-TYCOON.md
            </code>{' '}
            for architecture details
          </p>
        </footer>
      </div>
    </FarmProvider>
  );
}
