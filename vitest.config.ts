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
    setupFiles: ['./vitest.setup.ts'],
    // Include test files in app, components, lib, and hooks directories
    include: ['**/*.{test,spec}.{ts,tsx}'],
    // Exclude files from test
    exclude: ['node_modules', '.next', 'out', 'dist'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['lib/**/*.{ts,tsx}'],
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
        'components/**', // Exclude UI components from coverage (Phase 1)
        'app/**', // Exclude Next.js pages (Phase 1)
      ],
      // Set coverage thresholds - Phase 1: Core logic only
      thresholds: {
        lines: 40,
        functions: 48,
        branches: 37,
        statements: 41,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
