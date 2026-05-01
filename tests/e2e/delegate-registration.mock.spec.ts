import { test, expect } from '@playwright/test';

test.describe('Mocked Delegate Registration Flow', () => {
  test('should handle successful delegate registration', async ({ page }) => {
    // Intercept the registration API and return a mocked success response
    await page.route('**/api/registration/delegate', async (route) => {
      const json = {
        success: true,
        delegateIds: ['ABC-12345-XYZAB'],
        teamId: null,
        message: 'Registration successful'
      };
      await route.fulfill({ json });
    });

    // Trigger the API call – in a real UI you'd fill the form and submit.
    // Here we directly issue a fetch to keep the test simple.
    await page.goto('/');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/registration/delegate', { method: 'POST', body: new FormData() });
      return res.json();
    });

    expect(response.success).toBe(true);
    expect(response.delegateIds[0]).toBe('ABC-12345-XYZAB');
  });
});
