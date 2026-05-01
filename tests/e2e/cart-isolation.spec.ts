import { test, expect } from '@playwright/test';

test.describe('Cart Isolation across Domains', () => {
  test('should keep merch, cultural, and sports carts completely isolated', async ({ page }) => {
    // 1. Go to Merch page and set up the merch cart in local storage
    // We are simulating adding an item to the cart to bypass navigating the full UI
    // which might change in the future.
    await page.goto('/merch');
    await page.evaluate(() => {
      localStorage.setItem('merchCart', JSON.stringify([
        {
          unitId: 'test-unit-1',
          itemId: 'jersey',
          itemName: 'Official Jersey',
          price: 499,
          attributes: { size: 'L' }
        }
      ]));
    });

    // Verify it's in the UI (assuming cart count or similar is shown, 
    // or just checking local storage persistence across navigation)
    
    // 2. Navigate to Cultural events
    await page.goto('/events');
    
    // Inject something into eventsCart
    await page.evaluate(() => {
      localStorage.setItem('eventsCart', JSON.stringify([
        {
          eventId: 'swar-leela',
          eventName: 'Solo Eastern Singing',
          eventType: 'solo',
          eventFee: 150
        }
      ]));
    });

    // 3. Navigate to Sports
    await page.goto('/sports');
    
    // Verify local storage keys haven't overwritten each other
    const carts = await page.evaluate(() => {
      return {
        merch: JSON.parse(localStorage.getItem('merchCart') || '[]'),
        events: JSON.parse(localStorage.getItem('eventsCart') || '[]'),
        sports: JSON.parse(localStorage.getItem('sportsCart') || '[]')
      };
    });

    // Assertions
    expect(carts.merch).toHaveLength(1);
    expect(carts.merch[0].itemId).toBe('jersey');
    
    expect(carts.events).toHaveLength(1);
    expect(carts.events[0].eventId).toBe('swar-leela');
    
    expect(carts.sports).toHaveLength(0); // Sports cart should be empty as we didn't add anything
  });
});
