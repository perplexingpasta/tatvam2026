import { test, expect, devices } from '@playwright/test';

test.describe('Header Dropdown and Mobile Drawer Interaction', () => {
  test.use({ viewport: devices['iPhone 13'].viewport });

  test('opening the header dropdown closes the mobile drawer (if open)', async ({ page }) => {
    await page.goto('/');

    // Open mobile drawer first (using the same toggle as in mobile-drawer test)
    const drawerToggle = page.getByRole('button', { name: /open menu/i });
    await drawerToggle.click();
    const drawer = page.getByRole('navigation', { name: /mobile drawer/i });
    await expect(drawer).toBeVisible();

    // Now click the header dropdown toggle (assume it has aria-label "Open header menu")
    const headerToggle = page.getByRole('button', { name: /open header menu/i });
    await headerToggle.click();

    // Drawer should be hidden after header dropdown opens
    await expect(drawer).toHaveClass(/.*-translate-x-full.*/);
  });
});
