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

test('lead capture form works', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('#kaal-chatbot-widget-host');

  // Open the chat widget
  await page.click('#kaal-chatbot-widget-host button');
  
  // Select a persona
  await page.click('text=Consultant');

  // Send a message that triggers lead capture
  await page.fill('textarea', 'I want to request a demo');
  await page.click('button[type="submit"]');

  // Wait for lead capture form to appear
  await page.waitForSelector('input[placeholder*="Your name"]');

  // Fill out the form
  await page.fill('input[placeholder*="Your name"]', 'Test User');
  await page.fill('input[placeholder*="Your email"]', 'test@example.com');
  await page.fill('input[placeholder*="Your phone"]', '1234567890');
  await page.fill('textarea[placeholder*="Your query"]', 'I am interested in a demo');

  // Submit the form
  await page.click('button[type="submit"]');

  // Check for success message
  await expect(page.locator('text=Thank you')).toBeVisible();
});

test('error handling works', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('#kaal-chatbot-widget-host');

  // Open the chat widget
  await page.click('#kaal-chatbot-widget-host button');
  
  // Select a persona
  await page.click('text=Expert');

  // Send an empty message (should not submit)
  const textarea = page.locator('textarea');
  await textarea.fill('');
  await page.click('button[type="submit"]');
  
  // Message should not appear
  await expect(page.locator('.user-message')).not.toBeVisible();
});
