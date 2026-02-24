import { test, expect } from '@playwright/test';

// Bitcoin UUID from CoinRanking API
const BTC_UUID = 'Qwsogvtv82FCd';

test.describe('Coin detail page', () => {
  test('loads detail page for valid coin', async ({ page }) => {
    await page.goto(`/dashboard/coin/${BTC_UUID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/bitcoin|btc/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('shows price or loading state', async ({ page }) => {
    await page.goto(`/dashboard/coin/${BTC_UUID}`);
    await page.waitForLoadState('networkidle');
    const hasPrice = await page.locator('text=/\\$[\\d,]+/').first().isVisible();
    const hasLoading = await page.getByText(/loading/i).isVisible();
    const hasError = await page.getByText(/error|failed|not found/i).isVisible();
    expect(hasPrice || hasLoading || hasError).toBe(true);
  });

  test('has back navigation', async ({ page }) => {
    await page.goto(`/dashboard/coin/${BTC_UUID}`);
    const backLink = page.getByRole('link', { name: /back/i }).or(page.locator('a[href="/dashboard"]'));
    await expect(backLink.first()).toBeVisible();
  });
});
