import { test, expect } from '@playwright/test';

test.describe('Mocked Merch Checkout Flow', () => {
  test('should handle successful merch order submission', async ({ page }) => {
    // Mock the merch order API
    await page.route('**/api/merch/order', async (route) => {
      const json = {
        success: true,
        orderId: 'MERCH-ABC123',
        message: 'Order placed successfully'
      };
      await route.fulfill({ json });
    });

    // Simulate request – in UI you'd fill the form and submit.
    await page.goto('/');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/merch/order', {
        method: 'POST',
        body: new FormData()
      });
      return res.json();
    });

    expect(response.success).toBe(true);
    expect(response.orderId).toBe('MERCH-ABC123');
  });
});
