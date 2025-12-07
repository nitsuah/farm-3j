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
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'components/ui/**', // Generated shadcn/ui components
      ],
      // Set coverage thresholds - start conservative and increase over time
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
