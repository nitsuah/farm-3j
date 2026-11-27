import { test, expect, step, settle, trackPageErrors } from './farm3j';

test(
  'player opens the RTS from its landing page and starts a new game',
  {
    tag: ['@feature:farm-rts-new-game'],
  },
  async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto('/rtsfarm');
    await settle(page);

    await step(
      page,
      'see the RTS landing page and the play button',
      async () => {
        await expect(
          page.getByRole('heading', { level: 1, name: 'PG Farms RTS' })
        ).toBeVisible();
        await expect(
          page.getByRole('link', { name: /Play Now/ }).first()
        ).toHaveAttribute('href', '/rtsfarm/play');
      },
      { screenshot: false }
    );

    await step(
      page,
      'open the game and see three empty save slots',
      async () => {
        await page
          .getByRole('link', { name: /Play Now/ })
          .first()
          .click();
        await expect(page).toHaveURL(/\/rtsfarm\/play$/);
        await expect(page.getByText('Choose a save slot')).toBeVisible();
        await expect(page.getByText('Empty slot')).toHaveCount(3);
        await settle(page);
      },
      { docs: 'save-slots' }
    );

    await step(
      page,
      'pick slot 1 and see the difficulty choices',
      async () => {
        await page
          .getByRole('button', { name: /New Game/ })
          .first()
          .click();
        await expect(
          page.getByRole('heading', { name: 'Select Difficulty' })
        ).toBeVisible();
        await expect(page.getByText('Slot 1 — new game')).toBeVisible();
        await settle(page);
      },
      { docs: 'difficulty-select' }
    );

    await step(
      page,
      'start on Easy and see the game HUD',
      async () => {
        await page.getByRole('button', { name: /Easy/ }).click();
        // A first game opens Quick Start; dismiss it like a player would.
        await page.getByRole('button', { name: 'Got it' }).click();
        await expect(page.locator('svg').first()).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Save game' })
        ).toBeVisible();
      },
      { screenshot: false }
    );

    expect(errors, 'uncaught page errors while starting a game').toEqual([]);
  }
);

test(
  'player saves a game and continues it from the slot picker',
  {
    tag: ['@feature:save-slots'],
  },
  async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto('/rtsfarm/play');

    await step(
      page,
      'start a new game on Normal in slot 1 and save it',
      async () => {
        await page
          .getByRole('button', { name: /New Game/ })
          .first()
          .click();
        await page.getByRole('button', { name: /Normal/ }).click();
        await page.getByRole('button', { name: 'Got it' }).click();
        const save = page.getByRole('button', { name: 'Save game' });
        await save.click();
        await expect(save).toHaveText('✓');
      },
      { screenshot: false }
    );

    await step(
      page,
      'reload and see slot 1 filled with a Continue button',
      async () => {
        await page.reload();
        await expect(page.getByText('Choose a save slot')).toBeVisible();
        await expect(page.getByText(/^Wave \d+$/)).toBeVisible();
        await expect(page.getByText('Empty slot')).toHaveCount(2);
        await expect(
          page.getByRole('button', { name: /Continue/ })
        ).toBeVisible();
      },
      { screenshot: false }
    );

    await step(
      page,
      'continue the saved game',
      async () => {
        // Change one stable value in the saved slot so Continue can prove it restores state (the reload above autosaved, so edit after it).
        await page.evaluate(() => {
          const key = 'farm3j_rts_v2_slot0';
          const save = JSON.parse(localStorage.getItem(key) ?? '{}');
          save.resources.gold = 777;
          localStorage.setItem(key, JSON.stringify(save));
        });

        await page.getByRole('button', { name: /Continue/ }).click();
        await expect(
          page.getByRole('button', { name: 'Save game' })
        ).toBeVisible();
        // The marker gold only appears if the save was loaded, not a fresh game.
        // The marker value, however the counter decorates it (icon, spacing).
        await expect(page.getByText(/(^|\D)777(\D|$)/).first()).toBeVisible();
      },
      { screenshot: false }
    );

    expect(errors, 'uncaught page errors while continuing a game').toEqual([]);
  }
);
