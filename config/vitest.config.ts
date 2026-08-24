/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    // Enable globals for easier testing (e.g., describe, it, expect)
    globals: true,
    // Use jsdom for React component testing
    environment: 'jsdom',
    // Setup files to run before tests
    setupFiles: ['./config/vitest.setup.ts'],
    // Include test files in app, components, lib, and hooks directories
    include: [
      'app/**/*.{test,spec}.{ts,tsx}',
      'lib/**/*.{test,spec}.{ts,tsx}',
      'components/**/*.{test,spec}.{ts,tsx}',
    ],
    // Exclude files from test
    exclude: ['node_modules', '.next', 'out', 'dist', '.claude'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/**/*.{ts,tsx}',
        // RTS game logic — pure functions and AI tick helpers
        'components/rts/game/**/*.{ts,tsx}',
        'components/rts/hooks/ai/**/*.{ts,tsx}',
        'components/rts/hooks/spawnHelpers.ts',
        'components/rts/hooks/towerHelpers.ts',
        'components/rts/hooks/useCombatResolution.ts',
        'components/rts/hooks/useResourceTick.ts',
        'components/rts/hooks/usePathfinding.ts',
        'components/rts/hooks/useEnemyAI.ts',
      ],
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/coverage/**',
        // Exclude Next.js pages, UI-only components, sound, persistence
        'app/**',
        'components/rts/game/sound.ts',
        'components/rts/game/persistence.ts',
        'components/rts/game/achievements.ts',
      ],
      // Set coverage thresholds — Phase 2: Core logic + RTS game systems
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@/*': path.resolve(__dirname, '../*'),
      '@': path.resolve(__dirname, '..'),
    },
  },
});
