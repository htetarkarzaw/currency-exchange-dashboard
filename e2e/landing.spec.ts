import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /track crypto/i })).toBeVisible();
  });

  test('has link to dashboard', async ({ page }) => {
    await page.goto('/');
    const dashboardLink = page.getByRole('link', { name: /open dashboard|view prices|go to dashboard/i }).first();
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  test('navigates to dashboard on CTA click', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /open dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
