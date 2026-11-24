// Nightly "AI user" journeys: happy paths a real player takes, one visual
// baseline per DOM-only screen. Run by .github/workflows/journeys.yml through
// the shared nitsuah/.github journeys harness, which files/dedups/closes
// `bot:journey` issues from the JSON report (contract: journeys/STANDARD.md).
//
// Baselines are Linux-only: generate them in the Playwright Docker image
// (see tests/journeys/README.md). The live game map is never baselined (it
// animates); those steps assert behaviour instead.
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const repoRoot = path.resolve(__dirname, '..') // this package is CommonJS;
const PORT = 3100;

export default defineConfig({
  testDir: path.join(repoRoot, 'tests', 'journeys'),
  outputDir: path.join(repoRoot, 'test-results', 'journeys'),
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{testName}/{arg}{ext}',
  // A missing baseline must fail in CI instead of being written and thrown away.
  updateSnapshots: process.env.CI ? 'none' : 'missing',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0, // pass-on-retry = flaky, not an issue
  timeout: 90_000,
  reporter: [['list'], ['json', { outputFile: path.join(repoRoot, 'journeys-report', 'report.json') }]],
  expect: {
    timeout: 15_000,
    toHaveScreenshot: { maxDiffPixels: 100, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  webServer: {
    command: `pnpm build && pnpm exec next start -p ${PORT}`,
    cwd: repoRoot,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 480_000,
    env: { NEXT_TELEMETRY_DISABLED: '1' },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    colorScheme: 'dark',
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }],
});
