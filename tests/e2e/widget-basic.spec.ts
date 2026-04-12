import { test, expect } from '@playwright/test';

test('widget loads and shows greeting + options', async ({ page }) => {
  await page.goto('/');

  const launcher = page.getByRole('button', { name: /open chat/i });
  await expect(launcher).toBeVisible();

  await launcher.click();

  await expect(page.getByText(/choose your persona/i)).toBeVisible();

  await page.getByRole('button', { name: /the expert/i }).click();

  await expect(page.getByText(/you're now chatting with/i)).toBeVisible();

  await expect(page.getByRole('button', { name: /What can Kaal do/i })).toBeVisible();
});

