import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('loads and shows title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /currency exchange/i })).toBeVisible();
  });

  test('shows refresh button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });

  test('shows either coin table or empty state or loading', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const hasTable = await page.locator('table').isVisible();
    const hasEmptyState = await page.getByText(/no coins yet/i).isVisible();
    const hasLoading = await page.getByText(/loading/i).isVisible();
    expect(hasTable || hasEmptyState || hasLoading).toBe(true);
  });

  test('has search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by symbol or name/i)).toBeVisible();
  });

  test('has filters button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible();
  });

  test('can open filters panel', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click();
    await expect(page.getByText(/tiers/i)).toBeVisible();
    await expect(page.getByText(/order by/i)).toBeVisible();
  });

  test('table has expected columns when data loaded', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(page.getByRole('columnheader', { name: /#/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /coin/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /price/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /market cap/i })).toBeVisible();
    }
  });

  test('clicking coin row navigates to detail page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await expect(page).toHaveURL(/\/dashboard\/coin\//);
    }
  });
});
