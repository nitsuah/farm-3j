import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable globals for easier testing (e.g., describe, it)
    globals: true,
    // Use node environment for server-side testing
    environment: 'node',
    // Include test files
    include: ['src/**/*.{test,spec}.ts'],
    // Exclude files from test
    exclude: ['node_modules', 'dist'],
    // Coverage configuration
    coverage: {
      provider: 'v8', // Use v8 coverage provider
      reporter: ['text', 'json', 'html'], // Generate text, JSON, and HTML reports
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts', // Exclude declaration files
        '.eslintrc.cjs', // Exclude eslint config
        'src/types/', // Exclude type definitions
      ],
      // Set coverage thresholds - adjust as needed
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});