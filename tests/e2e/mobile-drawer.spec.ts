import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Navigation Drawer', () => {
  test.use({ viewport: devices['iPhone 13'].viewport });

  test('opens drawer and navigates correctly', async ({ page }) => {
    await page.goto('/');

    // Assume there is a button with aria-label="Open menu" that toggles the drawer
    const drawerToggle = page.getByRole('button', { name: /open menu/i });
    await drawerToggle.click();

    // Verify drawer is visible (e.g., contains a link to "Merch")
    const drawer = page.getByRole('navigation', { name: /mobile drawer/i });
    await expect(drawer).toBeVisible();

    // Click the merch link inside the drawer
    const merchLink = drawer.getByRole('link', { name: /merch/i });
    await merchLink.click();
    await expect(page).toHaveURL(/.*\/merch/);
  });
});
