// Fixture for the nightly journeys: the production build served by
// `next start` (see config/playwright.journeys.config.ts), the cloud-save API
// stubbed (no database in CI), and web fonts blocked so text renders in the
// installed fallback font.
import type { Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';

export { expect };
export { step } from './journey';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route =>
      route.abort()
    );
    // Saves live in localStorage; the cloud copy (/api/saves, /api/highscores) is fire-and-forget.
    await page.route(/\/api\/(saves|highscores)(\?|$)/, route =>
      // No cloud copy exists (GET 404, as for a new device); writes succeed like production.
      route.request().method() === 'GET'
        ? route.fulfill({ status: 404, json: { error: 'no cloud save' } })
        : route.fulfill({ status: 200, json: { ok: true } })
    );
    await use(page);
  },
});

/** Collect uncaught page errors; the journey asserts the list is empty at the end. */
export function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`${e.message}\n${e.stack ?? ''}`));
  return errors;
}

/** Let fonts and CSS transitions finish before a baseline. */
export async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}
