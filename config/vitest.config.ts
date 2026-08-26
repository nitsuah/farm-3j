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
        // RTS game logic — pure functions, helpers, and the 4 domain hooks.
        // AI tick files (tickWorkers.ts ~3 kloc, others 300-600 loc) are
        // excluded: they require integration-level tests to reach meaningful
        // coverage and are verified by smoke tests in tickEnemyAI.test.ts.
        'components/rts/game/**/*.{ts,tsx}',
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
        // Server-only neon client — requires DATABASE_URL and cannot run in jsdom
        'lib/db.ts',
      ],
      // Coverage thresholds — Phase 2: Core logic + RTS game systems.
      // AI tick files (~7 kloc) are excluded (smoke-tested only).
      // Thresholds reflect the current measured baseline (~30% lines);
      // raised incrementally toward 80% — see METRICS.md.
      thresholds: {
        lines: 28,
        functions: 20,
        branches: 17,
        statements: 28,
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
