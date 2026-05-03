# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation Routing >> should navigate to correct base pages from header
- Location: tests\e2e\navigation.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
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
    - generic [ref=e25]:
      - generic [ref=e26]:
        - heading "Tatvam 2026 Merch Store" [level=1] [ref=e27]
        - link "Merch Cart" [ref=e28] [cursor=pointer]:
          - /url: /merch/cart
          - img [ref=e29]
      - generic [ref=e31]:
        - generic [ref=e32]:
          - img "Official Fest Jersey" [ref=e34]
          - generic [ref=e35]:
            - generic [ref=e36]:
              - heading "Official Fest Jersey" [level=3] [ref=e37]
              - generic [ref=e38]: ₹499
            - paragraph [ref=e39]: Premium sports jersey for the ultimate fest experience.
            - button "Customise & Add to Cart" [ref=e41]
        - generic [ref=e42]:
          - img "Signature Hoodie" [ref=e44]
          - generic [ref=e45]:
            - generic [ref=e46]:
              - heading "Signature Hoodie" [level=3] [ref=e47]
              - generic [ref=e48]: ₹899
            - paragraph [ref=e49]: Cozy oversized hoodie perfect for the evening events.
            - button "Customise & Add to Cart" [ref=e51]
        - generic [ref=e52]:
          - img "Varsity Jacket" [ref=e54]
          - generic [ref=e55]:
            - generic [ref=e56]:
              - heading "Varsity Jacket" [level=3] [ref=e57]
              - generic [ref=e58]: ₹1299
            - paragraph [ref=e59]: Classic college varsity jacket with premium embroidery.
            - button "Customise & Add to Cart" [ref=e61]
  - contentinfo [ref=e62]:
    - generic [ref=e63]:
      - 'heading "Last date to register: 1 June 2026!" [level=2] [ref=e65]'
      - generic [ref=e66]:
        - generic [ref=e67]:
          - heading "Quick Links" [level=3] [ref=e68]
          - list [ref=e69]:
            - listitem [ref=e70]:
              - link "Registration" [ref=e71] [cursor=pointer]:
                - /url: /registration
            - listitem [ref=e72]:
              - link "Events" [ref=e73] [cursor=pointer]:
                - /url: /events
            - listitem [ref=e74]:
              - link "Sports" [ref=e75] [cursor=pointer]:
                - /url: /sports
            - listitem [ref=e76]:
              - link "Schedule" [ref=e77] [cursor=pointer]:
                - /url: /schedule
            - listitem [ref=e78]:
              - link "Contact" [ref=e79] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e80]:
          - heading "Contact Info" [level=3] [ref=e81]
          - generic [ref=e82]:
            - generic [ref=e83]:
              - img [ref=e84]
              - generic [ref=e86]:
                - paragraph [ref=e87]: Rahul Sharma
                - link "+91 98765 43210" [ref=e88] [cursor=pointer]:
                  - /url: tel:+919876543210
            - generic [ref=e89]:
              - img [ref=e90]
              - generic [ref=e92]:
                - paragraph [ref=e93]: Priya Patel
                - link "+91 87654 32109" [ref=e94] [cursor=pointer]:
                  - /url: tel:+918765432109
            - generic [ref=e95]:
              - img [ref=e96]
              - paragraph [ref=e99]:
                - text: JSS Medical College
                - text: Sri Shivarathreeshwara Nagara
                - text: Mysuru, Karnataka 570015
            - generic [ref=e100]:
              - img [ref=e101]
              - paragraph [ref=e103]:
                - text: "Festival Dates:"
                - text: Nov 5-8, 2026
      - generic [ref=e104]:
        - img "Tatvam Logo" [ref=e106]
        - generic [ref=e107]:
          - heading "TATVAM" [level=1] [ref=e108]
          - paragraph [ref=e109]: "2026"
        - paragraph [ref=e110]: © TATVAM 2026. All rights reserved.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e116] [cursor=pointer]:
    - img [ref=e117]
  - alert [ref=e120]
```