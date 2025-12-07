'use client';

import React from 'react';
import Link from 'next/link';
import { FarmProvider } from '@/lib/farm/FarmContext';
import { FarmCanvas } from '@/components/farm/FarmCanvas';
import { FarmEditor } from '@/components/farm/FarmEditor';

export default function FarmPage() {
  return (
    <FarmProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-4">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🌾 Harvest Haven Farm - Interactive Demo
            </h1>
            <p className="text-gray-300">
              Phase 1 MVP: Basic entity spawning and movement simulation
            </p>
          </div>
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-180px)]">
          {/* Farm Canvas - Takes up most space */}
          <div className="lg:col-span-3 h-full">
            <FarmCanvas />
          </div>

          {/* Editor Panel - Sidebar */}
          <div className="lg:col-span-1">
            <FarmEditor />
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-4 text-center text-gray-400 text-sm">
          <p>
            Built with Next.js, React Context, and requestAnimationFrame • See{' '}
            <code className="bg-gray-700 px-2 py-1 rounded">docs/FARM-TYCOON.md</code> for
            architecture details
          </p>
        </footer>
      </div>
    </FarmProvider>
  );
}
