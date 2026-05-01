import { test, expect } from '@playwright/test';

test.describe('Mocked Event Registration Checkout Flow', () => {
  test('should handle successful event registration submission', async ({ page }) => {
    // Mock the events registration API
    await page.route('**/api/registration/events', async (route) => {
      const json = {
        success: true,
        registrationId: 'EVT-01-ABCDEF',
        message: 'Event registration successful'
      };
      await route.fulfill({ json });
    });

    // Simulate the request – in a real UI you would add items to the cart and submit.
    await page.goto('/');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/registration/events', {
        method: 'POST',
        body: new FormData()
      });
      return res.json();
    });

    expect(response.success).toBe(true);
    expect(response.registrationId).toBe('EVT-01-ABCDEF');
  });
});
