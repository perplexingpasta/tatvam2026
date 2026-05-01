# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: header-drawer-conflict.spec.ts >> Header Dropdown and Mobile Drawer Interaction >> opening the header dropdown closes the mobile drawer (if open)
- Location: tests\e2e\header-drawer-conflict.spec.ts:6:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /open header menu/i })
    - locator resolved to <button aria-expanded="false" aria-label="Open header menu" class="relative p-2 rounded-md hover:bg-zinc-100 transition-colors">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="md:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-100"></div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="flex items-center justify-between p-4 border-b border-zinc-100">…</div> from <div role="navigation" aria-label="Mobile drawer" class="md:hidden fixed inset-y-0 left-0 z-[110] w-4/5 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out translate-x-0">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="flex items-center justify-between p-4 border-b border-zinc-100">…</div> from <div role="navigation" aria-label="Mobile drawer" class="md:hidden fixed inset-y-0 left-0 z-[110] w-4/5 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out translate-x-0">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Tatvam 2026" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e6]:
        - button "Open header menu" [ref=e8]:
          - img [ref=e9]
        - button "Open menu" [active] [ref=e13]:
          - img [ref=e14]
  - navigation "Mobile drawer" [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]: Tatvam 2026
      - button "Close mobile menu" [ref=e19]:
        - img [ref=e20]
    - navigation "Mobile menu" [ref=e23]:
      - link "Home" [ref=e24] [cursor=pointer]:
        - /url: /
        - img [ref=e25]
        - text: Home
      - link "Events" [ref=e28] [cursor=pointer]:
        - /url: /events
        - img [ref=e29]
        - text: Events
      - link "Sports" [ref=e31] [cursor=pointer]:
        - /url: /sports
        - img [ref=e32]
        - text: Sports
      - link "Registration" [ref=e38] [cursor=pointer]:
        - /url: /registration
        - img [ref=e39]
        - text: Registration
      - link "Check Status" [ref=e42] [cursor=pointer]:
        - /url: /registration-status
        - img [ref=e43]
        - text: Check Status
      - link "Merch" [ref=e46] [cursor=pointer]:
        - /url: /merch
        - img [ref=e47]
        - text: Merch
      - link "About" [ref=e50] [cursor=pointer]:
        - /url: /about
        - img [ref=e51]
        - text: About
      - link "Contact" [ref=e53] [cursor=pointer]:
        - /url: /contact
        - img [ref=e54]
        - text: Contact
      - link "Schedule" [ref=e56] [cursor=pointer]:
        - /url: /schedule
        - img [ref=e57]
        - text: Schedule
  - main [ref=e60]:
    - main [ref=e65]:
      - generic [ref=e66]:
        - heading "Tatvam 2026" [level=1] [ref=e67]
        - paragraph [ref=e68]: The Annual Cultural Fest of JSS Medical College
      - generic [ref=e69]:
        - link "Delegate Registration Register as a delegate to participate in events and get your official fest ID. Get Started" [ref=e70] [cursor=pointer]:
          - /url: /registration
          - img [ref=e72]
          - heading "Delegate Registration" [level=3] [ref=e75]
          - paragraph [ref=e76]: Register as a delegate to participate in events and get your official fest ID.
          - generic [ref=e77]:
            - text: Get Started
            - img [ref=e78]
        - link "Explore Events Browse our exciting lineup of cultural, literary, and performing arts events. View Schedule" [ref=e80] [cursor=pointer]:
          - /url: /events
          - img [ref=e82]
          - heading "Explore Events" [level=3] [ref=e84]
          - paragraph [ref=e85]: Browse our exciting lineup of cultural, literary, and performing arts events.
          - generic [ref=e86]:
            - text: View Schedule
            - img [ref=e87]
        - link "Merch Store Grab your official Tatvam 2026 merchandise, including t-shirts and hoodies. Shop Now" [ref=e89] [cursor=pointer]:
          - /url: /merch
          - img [ref=e91]
          - heading "Merch Store" [level=3] [ref=e94]
          - paragraph [ref=e95]: Grab your official Tatvam 2026 merchandise, including t-shirts and hoodies.
          - generic [ref=e96]:
            - text: Shop Now
            - img [ref=e97]
        - link "Sports Events Participate in exciting sports events and showcase your athletic prowess. View Sports" [ref=e99] [cursor=pointer]:
          - /url: /sports
          - img [ref=e101]
          - heading "Sports Events" [level=3] [ref=e107]
          - paragraph [ref=e108]: Participate in exciting sports events and showcase your athletic prowess.
          - generic [ref=e109]:
            - text: View Sports
            - img [ref=e110]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e117] [cursor=pointer]:
    - img [ref=e118]
  - alert [ref=e121]
```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.describe('Header Dropdown and Mobile Drawer Interaction', () => {
  4  |   test.use({ viewport: devices['iPhone 13'].viewport });
  5  | 
  6  |   test('opening the header dropdown closes the mobile drawer (if open)', async ({ page }) => {
  7  |     await page.goto('/');
  8  | 
  9  |     // Open mobile drawer first (using the same toggle as in mobile-drawer test)
  10 |     const drawerToggle = page.getByRole('button', { name: /open menu/i });
  11 |     await drawerToggle.click();
  12 |     const drawer = page.getByRole('navigation', { name: /mobile drawer/i });
  13 |     await expect(drawer).toBeVisible();
  14 | 
  15 |     // Now click the header dropdown toggle (assume it has aria-label "Open header menu")
  16 |     const headerToggle = page.getByRole('button', { name: /open header menu/i });
> 17 |     await headerToggle.click();
     |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 | 
  19 |     // Drawer should be hidden after header dropdown opens
  20 |     await expect(drawer).toBeHidden();
  21 |   });
  22 | });
  23 | 
```