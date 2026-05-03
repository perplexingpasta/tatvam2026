# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-drawer.spec.ts >> Mobile Navigation Drawer >> opens drawer and navigates correctly
- Location: tests\e2e\mobile-drawer.spec.ts:6:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /open menu/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Tatvam 2026" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e6]:
        - link "Register" [ref=e7] [cursor=pointer]:
          - /url: /registration
        - button "Open header menu" [ref=e9]:
          - img [ref=e10]
        - button "Open menu" [ref=e14]:
          - img [ref=e15]
  - navigation "Mobile drawer" [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e19]: Tatvam 2026
      - button "Close mobile menu" [ref=e20]:
        - img [ref=e21]
    - navigation "Mobile menu" [ref=e24]:
      - link "Home" [ref=e25] [cursor=pointer]:
        - /url: /
        - img [ref=e26]
        - text: Home
      - link "Events" [ref=e29] [cursor=pointer]:
        - /url: /events
        - img [ref=e30]
        - text: Events
      - link "Sports" [ref=e32] [cursor=pointer]:
        - /url: /sports
        - img [ref=e33]
        - text: Sports
      - link "Registration" [ref=e39] [cursor=pointer]:
        - /url: /registration
        - img [ref=e40]
        - text: Registration
      - link "Check Status" [ref=e43] [cursor=pointer]:
        - /url: /registration-status
        - img [ref=e44]
        - text: Check Status
      - link "Merch" [ref=e47] [cursor=pointer]:
        - /url: /merch
        - img [ref=e48]
        - text: Merch
      - link "About" [ref=e51] [cursor=pointer]:
        - /url: /about
        - img [ref=e52]
        - text: About
      - link "Contact" [ref=e54] [cursor=pointer]:
        - /url: /contact
        - img [ref=e55]
        - text: Contact
      - link "Schedule" [ref=e57] [cursor=pointer]:
        - /url: /schedule
        - img [ref=e58]
        - text: Schedule
  - main [ref=e61]:
    - main [ref=e66]:
      - generic [ref=e67]:
        - heading "Tatvam 2026" [level=1] [ref=e68]
        - paragraph [ref=e69]: The Annual Cultural Fest of JSS Medical College
      - generic [ref=e70]:
        - link "Delegate Registration Register as a delegate to participate in events and get your official fest ID. Get Started" [ref=e71] [cursor=pointer]:
          - /url: /registration
          - img [ref=e73]
          - heading "Delegate Registration" [level=3] [ref=e76]
          - paragraph [ref=e77]: Register as a delegate to participate in events and get your official fest ID.
          - generic [ref=e78]:
            - text: Get Started
            - img [ref=e79]
        - link "Explore Events Browse our exciting lineup of cultural, literary, and performing arts events. View Schedule" [ref=e81] [cursor=pointer]:
          - /url: /events
          - img [ref=e83]
          - heading "Explore Events" [level=3] [ref=e85]
          - paragraph [ref=e86]: Browse our exciting lineup of cultural, literary, and performing arts events.
          - generic [ref=e87]:
            - text: View Schedule
            - img [ref=e88]
        - link "Merch Store Grab your official Tatvam 2026 merchandise, including t-shirts and hoodies. Shop Now" [ref=e90] [cursor=pointer]:
          - /url: /merch
          - img [ref=e92]
          - heading "Merch Store" [level=3] [ref=e95]
          - paragraph [ref=e96]: Grab your official Tatvam 2026 merchandise, including t-shirts and hoodies.
          - generic [ref=e97]:
            - text: Shop Now
            - img [ref=e98]
        - link "Sports Events Participate in exciting sports events and showcase your athletic prowess. View Sports" [ref=e100] [cursor=pointer]:
          - /url: /sports
          - img [ref=e102]
          - heading "Sports Events" [level=3] [ref=e108]
          - paragraph [ref=e109]: Participate in exciting sports events and showcase your athletic prowess.
          - generic [ref=e110]:
            - text: View Sports
            - img [ref=e111]
  - contentinfo [ref=e113]:
    - generic [ref=e114]:
      - 'heading "Last date to register: 1 June 2026!" [level=2] [ref=e116]'
      - generic [ref=e117]:
        - generic [ref=e118]:
          - heading "Quick Links" [level=3] [ref=e119]
          - list [ref=e120]:
            - listitem [ref=e121]:
              - link "Registration" [ref=e122] [cursor=pointer]:
                - /url: /registration
            - listitem [ref=e123]:
              - link "Events" [ref=e124] [cursor=pointer]:
                - /url: /events
            - listitem [ref=e125]:
              - link "Sports" [ref=e126] [cursor=pointer]:
                - /url: /sports
            - listitem [ref=e127]:
              - link "Schedule" [ref=e128] [cursor=pointer]:
                - /url: /schedule
            - listitem [ref=e129]:
              - link "Contact" [ref=e130] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e131]:
          - heading "Contact Info" [level=3] [ref=e132]
          - generic [ref=e133]:
            - generic [ref=e134]:
              - img [ref=e135]
              - generic [ref=e137]:
                - paragraph [ref=e138]: Rahul Sharma
                - link "+91 98765 43210" [ref=e139] [cursor=pointer]:
                  - /url: tel:+919876543210
            - generic [ref=e140]:
              - img [ref=e141]
              - generic [ref=e143]:
                - paragraph [ref=e144]: Priya Patel
                - link "+91 87654 32109" [ref=e145] [cursor=pointer]:
                  - /url: tel:+918765432109
            - generic [ref=e146]:
              - img [ref=e147]
              - paragraph [ref=e150]:
                - text: JSS Medical College
                - text: Sri Shivarathreeshwara Nagara
                - text: Mysuru, Karnataka 570015
            - generic [ref=e151]:
              - img [ref=e152]
              - paragraph [ref=e154]:
                - text: "Festival Dates:"
                - text: Nov 5-8, 2026
      - generic [ref=e155]:
        - img "Tatvam Logo" [ref=e157]
        - generic [ref=e158]:
          - heading "TATVAM" [level=1] [ref=e159]
          - paragraph [ref=e160]: "2026"
        - paragraph [ref=e161]: © TATVAM 2026. All rights reserved.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e167] [cursor=pointer]:
    - img [ref=e168]
  - alert [ref=e171]
```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.describe('Mobile Navigation Drawer', () => {
  4  |   test.use({ viewport: devices['iPhone 13'].viewport });
  5  | 
  6  |   test('opens drawer and navigates correctly', async ({ page }) => {
  7  |     await page.goto('/');
  8  | 
  9  |     // Assume there is a button with aria-label="Open menu" that toggles the drawer
  10 |     const drawerToggle = page.getByRole('button', { name: /open menu/i });
> 11 |     await drawerToggle.click();
     |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  12 | 
  13 |     // Verify drawer is visible (e.g., contains a link to "Merch")
  14 |     const drawer = page.getByRole('navigation', { name: /mobile drawer/i });
  15 |     await expect(drawer).toBeVisible();
  16 | 
  17 |     // Click the merch link inside the drawer
  18 |     const merchLink = drawer.getByRole('link', { name: /merch/i });
  19 |     await merchLink.click();
  20 |     await expect(page).toHaveURL(/.*\/merch/);
  21 |   });
  22 | });
  23 | 
```