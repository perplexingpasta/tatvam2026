# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: merch-checkout.mock.spec.ts >> Mocked Merch Checkout Flow >> should handle successful merch order submission
- Location: tests\e2e\merch-checkout.mock.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.evaluate: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - link "Tatvam 2026" [ref=e5] [cursor=pointer]:
          - /url: /
        - navigation [ref=e6]:
          - link "Home" [ref=e7] [cursor=pointer]:
            - /url: /
          - link "Events" [ref=e8] [cursor=pointer]:
            - /url: /events
          - link "Sports" [ref=e9] [cursor=pointer]:
            - /url: /sports
          - link "Registration" [ref=e10] [cursor=pointer]:
            - /url: /registration
          - link "Check Status" [ref=e11] [cursor=pointer]:
            - /url: /registration-status
          - link "Merch" [ref=e12] [cursor=pointer]:
            - /url: /merch
          - link "About" [ref=e13] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e14] [cursor=pointer]:
            - /url: /contact
          - link "Schedule" [ref=e15] [cursor=pointer]:
            - /url: /schedule
      - button "Open header menu" [ref=e18]:
        - img [ref=e19]
  - main [ref=e24]:
    - main [ref=e29]:
      - generic [ref=e30]:
        - heading "Tatvam 2026" [level=1] [ref=e31]
        - paragraph [ref=e32]: The Annual Cultural Fest of JSS Medical College
      - generic [ref=e33]:
        - link "Delegate Registration Register as a delegate to participate in events and get your official fest ID. Get Started" [ref=e34] [cursor=pointer]:
          - /url: /registration
          - img [ref=e36]
          - heading "Delegate Registration" [level=3] [ref=e39]
          - paragraph [ref=e40]: Register as a delegate to participate in events and get your official fest ID.
          - generic [ref=e41]:
            - text: Get Started
            - img [ref=e42]
        - link "Explore Events Browse our exciting lineup of cultural, literary, and performing arts events. View Schedule" [ref=e44] [cursor=pointer]:
          - /url: /events
          - img [ref=e46]
          - heading "Explore Events" [level=3] [ref=e48]
          - paragraph [ref=e49]: Browse our exciting lineup of cultural, literary, and performing arts events.
          - generic [ref=e50]:
            - text: View Schedule
            - img [ref=e51]
        - link "Merch Store Grab your official Tatvam 2026 merchandise, including t-shirts and hoodies. Shop Now" [ref=e53] [cursor=pointer]:
          - /url: /merch
          - img [ref=e55]
          - heading "Merch Store" [level=3] [ref=e58]
          - paragraph [ref=e59]: Grab your official Tatvam 2026 merchandise, including t-shirts and hoodies.
          - generic [ref=e60]:
            - text: Shop Now
            - img [ref=e61]
        - link "Sports Events Participate in exciting sports events and showcase your athletic prowess. View Sports" [ref=e63] [cursor=pointer]:
          - /url: /sports
          - img [ref=e65]
          - heading "Sports Events" [level=3] [ref=e71]
          - paragraph [ref=e72]: Participate in exciting sports events and showcase your athletic prowess.
          - generic [ref=e73]:
            - text: View Sports
            - img [ref=e74]
  - contentinfo [ref=e76]:
    - generic [ref=e77]:
      - 'heading "Last date to register: 1 June 2026!" [level=2] [ref=e79]'
      - generic [ref=e80]:
        - generic [ref=e81]:
          - heading "Quick Links" [level=3] [ref=e82]
          - list [ref=e83]:
            - listitem [ref=e84]:
              - link "Registration" [ref=e85] [cursor=pointer]:
                - /url: /registration
            - listitem [ref=e86]:
              - link "Events" [ref=e87] [cursor=pointer]:
                - /url: /events
            - listitem [ref=e88]:
              - link "Sports" [ref=e89] [cursor=pointer]:
                - /url: /sports
            - listitem [ref=e90]:
              - link "Schedule" [ref=e91] [cursor=pointer]:
                - /url: /schedule
            - listitem [ref=e92]:
              - link "Contact" [ref=e93] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e94]:
          - heading "Contact Info" [level=3] [ref=e95]
          - generic [ref=e96]:
            - generic [ref=e97]:
              - img [ref=e98]
              - generic [ref=e100]:
                - paragraph [ref=e101]: Rahul Sharma
                - link "+91 98765 43210" [ref=e102] [cursor=pointer]:
                  - /url: tel:+919876543210
            - generic [ref=e103]:
              - img [ref=e104]
              - generic [ref=e106]:
                - paragraph [ref=e107]: Priya Patel
                - link "+91 87654 32109" [ref=e108] [cursor=pointer]:
                  - /url: tel:+918765432109
            - generic [ref=e109]:
              - img [ref=e110]
              - paragraph [ref=e113]:
                - text: JSS Medical College
                - text: Sri Shivarathreeshwara Nagara
                - text: Mysuru, Karnataka 570015
            - generic [ref=e114]:
              - img [ref=e115]
              - paragraph [ref=e117]:
                - text: "Festival Dates:"
                - text: Nov 5-8, 2026
      - generic [ref=e118]:
        - img "Tatvam Logo" [ref=e120]
        - generic [ref=e121]:
          - heading "TATVAM" [level=1] [ref=e122]
          - paragraph [ref=e123]: "2026"
        - paragraph [ref=e124]: © TATVAM 2026. All rights reserved.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e130] [cursor=pointer]:
    - img [ref=e131]
  - alert [ref=e134]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Mocked Merch Checkout Flow', () => {
  4  |   test('should handle successful merch order submission', async ({ page }) => {
  5  |     // Mock the merch order API
  6  |     await page.route('**/api/merch/order', async (route) => {
  7  |       const json = {
  8  |         success: true,
  9  |         orderId: 'MERCH-ABC123',
  10 |         message: 'Order placed successfully'
  11 |       };
  12 |       await route.fulfill({ json });
  13 |     });
  14 | 
  15 |     // Simulate request – in UI you'd fill the form and submit.
  16 |     await page.goto('/');
> 17 |     const response = await page.evaluate(async () => {
     |                                 ^ Error: page.evaluate: Test timeout of 30000ms exceeded.
  18 |       const res = await fetch('/api/merch/order', {
  19 |         method: 'POST',
  20 |         body: new FormData()
  21 |       });
  22 |       return res.json();
  23 |     });
  24 | 
  25 |     expect(response.success).toBe(true);
  26 |     expect(response.orderId).toBe('MERCH-ABC123');
  27 |   });
  28 | });
  29 | 
```