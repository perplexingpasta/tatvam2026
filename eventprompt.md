Read @PLAN.md fully before writing any code.

We are implementing a new page at /registration-status. A blank page.tsx already exists at app/registration-status/page.tsx.

This page allows anyone to look up their registration details by entering their delegate ID, team ID, or email address. It is purely a read-only lookup page — no editing, no payments, no cart. It has nothing to do with merch orders.

This does NOT affect:
- Any registration API routes
- Any merch files
- Any Sheets sync files
- Any cart or events files


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Do not modify any registration API routes
- Do not modify any merch files
- Do not modify any Sheets sync files
- Do not modify CartProvider or events files
- Do not add any new npm packages
- All Firestore reads in the API route use Admin SDK only
- Never expose phone, collegeIdNumber, collegeIdImageUrl, paymentScreenshotUrl, or utrNumber to the client
- The page must work even if registeredEventIds is an empty array (handle gracefully)
- The page must work even if the events collection has no matching event for a given  (handle with a fallback: show the eventId with "Event details unavailable")
- Rate limit the API endpoint to prevent scraping
- Report completion of each Part explicitly before moving to the next


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART-BY-PART IMPLEMENTATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST complete each part fully, verify it works, and explicitly state "PART N COMPLETE — ALL CHECKS PASSED" before asking me for instructions for the next part.
There are 3 parts in total.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1/3 — NEW API ROUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create app/api/registration-status/route.ts

METHOD: GET
Query parameter: ?query=USER_INPUT

This route detects what type of input was provided and 
queries Firestore accordingly.

INPUT DETECTION LOGIC:
Trim whitespace from the query parameter first, then:

1. If input contains "@" → treat as EMAIL
   - Query delegates collection where email == input
   - Return the matching delegate(s)

2. If input matches regex /^[A-Z]{3}-\d{5}-[A-Z0-9]{5}$/
   (e.g. ADI-28210-KAW5A) → treat as DELEGATE ID
   - Fetch delegates/{input} directly by document ID

3. If input matches regex /^[A-Z]{3}-[A-Z0-9]{7}$/
   (e.g. XOT-HCYAS89) → treat as TEAM ID
   - Fetch teams/{input} directly by document ID
   - Then fetch all delegate documents whose delegateId 
     is in team.memberDelegateIds

4. If none of the above patterns match → return 400:
   { success: false, error: "invalid_input", 
     message: "Please enter a valid email address, 
     delegate ID, or team ID." }

PRIVACY RULES — NEVER return these fields to the client:
- phone
- collegeIdImageUrl
- paymentScreenshotUrl
- utrNumber
- collegeIdNumber

SAFE FIELDS to return for each delegate:
- delegateId
- name
- email
- collegeName
- delegateTier
- teamId
- isJSSMC
- paymentStatus
- registeredEventIds
- createdAt

RESPONSE SHAPE:

For EMAIL or DELEGATE ID lookup (single delegate found):
```typescript
{
  success: true,
  lookupType: "delegate",
  delegate: {
    delegateId: string,
    name: string,
    email: string,
    collegeName: string,
    delegateTier: string,
    teamId: string | null,
    isJSSMC: boolean,
    paymentStatus: string,
    registeredEventIds: string[],
    createdAt: string, // ISO string
  },
  team: {           // null if delegate has no teamId
    teamId: string,
    teamName: string,
    leadDelegateId: string,
    memberDelegateIds: string[],
    members: Array<{  // safe fields only for teammates
      delegateId: string,
      name: string,
      collegeName: string,
      delegateTier: string,
    }>
  } | null,
  soloEvents: EventRegistrationDetail[],
  teamEvents: EventRegistrationDetail[],
}
```

For TEAM ID lookup:
```typescript
{
  success: true,
  lookupType: "team",
  team: {
    teamId: string,
    teamName: string,
    leadDelegateId: string,
    memberDelegateIds: string[],
    members: Array<{
      delegateId: string,
      name: string,
      collegeName: string,
      delegateTier: string,
      isJSSMC: boolean,
      paymentStatus: string,
    }>
  },
  teamEvents: EventRegistrationDetail[],
}
```

EventRegistrationDetail shape:
```typescript
interface EventRegistrationDetail {
  eventId: string,
  indianName: string,
  englishName: string,
  category: string,
  type: "solo" | "group",
  venue: string | null,
  schedule: string | null,
  eventDate: string | null,
  eventTime: string | null,
  fee: number,
  pricingType: string,
  teamName: string | null, // for group events
  participantNames: string[], // names of all participants
}
```

FETCHING EVENT DETAILS:
For each eventId in registeredEventIds, fetch the event 
document from the events Firestore collection to get 
indianName, englishName, category, venue, schedule, 
eventDate, eventTime, fee, pricingType.

To determine solo vs team events and get participant names:
- Query eventRegistrations collection where 
  participantDelegateIds array-contains the delegateId
- For each matching eventRegistration, find the cartItem 
  whose participantDelegateIds includes this delegate
- If cartItem.eventType === "solo": add to soloEvents
- If cartItem.eventType === "group": add to teamEvents,
  fetch names of all participants from delegates collection

For team ID lookup:
- Only return teamEvents (events where the team participated)
- Query eventRegistrations where any member's delegateId 
  appears in participantDelegateIds

ERROR RESPONSES:
- No delegate found for email: 
  { success: false, error: "not_found_email",
    message: "No delegate found with this email address." }
- No delegate found for delegate ID:
  { success: false, error: "not_found_delegate",
    message: "No delegate found with ID [input]." }
- No team found for team ID:
  { success: false, error: "not_found_team",
    message: "No team found with ID [input]." }
- Missing query parameter:
  { success: false, error: "missing_query",
    message: "Please enter a delegate ID, team ID, 
    or email address." }
- Server error: 500 with generic message

SECURITY:
- Rate limit this endpoint: max 10 requests per IP 
  per minute using the same in-memory pattern as 
  /api/delegates/lookup
- Never expose the rate limiter warning in the response
- All Firestore reads use Admin SDK only

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2/3 — PAGE IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement app/registration-status/page.tsx as a client 
component ("use client").

The page has two states:
STATE 1: Search input (initial state)
STATE 2: Results display

━━━━━━━━━━━━━━━━━━━━
STATE 1 — SEARCH INPUT
━━━━━━━━━━━━━━━━━━━━

Layout:
- Page title: "Registration Status"
- Subtitle: "Look up your delegate registration, 
  team details, and event registrations"
- A single search input field:
  - Placeholder: "e.g. user@mail.com, ADI-28210-KAW5A, 
    XOT-HCYAS89"
  - Large, prominent input — full width on mobile
  - Pressing Enter triggers search
  - "Search" button beside the input triggers search
- Loading indicator: spinner inside or beside the Search 
  button while API call is in progress
- Inline error message below the input if:
  - Input is empty on submit
  - API returns any error (show the error message from 
    the response)
  - Rate limit hit: "Too many searches. Please wait 
    a moment and try again."
- "Search Again" link/button appears below results 
  to return to STATE 1 and clear results

━━━━━━━━━━━━━━━━━━━━
STATE 2 — RESULTS DISPLAY
━━━━━━━━━━━━━━━━━━━━

The results section renders differently based on 
lookupType returned by the API.

─── DELEGATE LOOKUP RESULT ───────────────────────────

SECTION A — Delegate Profile Card:
Show a card with:
- Name (large, prominent)
- Delegate ID (monospace font, copyable — clicking copies 
  to clipboard with a brief "Copied!" tooltip)
- College name
- Delegate tier name (resolve tier1/tier2/tier3 to 
  display name using NEXT_PUBLIC_TIER_1_NAME etc.)
- "JSSMC Student" badge if isJSSMC is true
- Payment status badge:
  * pending_verification: yellow badge "Payment Pending"
  * verified: green badge "Payment Verified"
  * rejected: red badge "Payment Rejected"
- Team ID (if present, monospace, copyable) with label 
  "Team ID"
- Registration date (formatted as DD MMM YYYY)

SECTION B — Team Details (only if delegate has a team):
Show a card titled "Your Team — [teamName]":
- Team ID (monospace, copyable)
- "Team Lead" badge next to the lead member's name
- List of all team members showing:
  * Name
  * Delegate ID (monospace)
  * College name
  * Delegate tier name
  * "You" badge next to the current delegate

SECTION C — Registered Events:
Show two subsections:

SUBSECTION 1 — "Solo Registrations":
If soloEvents is empty: show "You have not registered 
for any solo events yet."
If not empty: show event cards for each solo event.

SUBSECTION 2 — "Team Registrations":
If teamEvents is empty: show "You have not registered 
for any team events yet."
If not empty: show event cards for each team event, 
including the team name and list of participant names.

EVENT CARD (used in both subsections):
Each event card shows:
- Indian name (primary)
- English name (secondary, muted)
- Category badge
- Schedule: eventDate + eventTime, or "Date TBA" if null
- Venue: venue value, or "Venue TBA" if null
- Fee display (use pricingType to format correctly):
  * free: "Free"
  * per_person: "₹[fee]/person"
  * flat_total: "₹[fee] total"
- For team events: "Team: [teamName]" and participant 
  names listed as small chips/badges

─── TEAM LOOKUP RESULT ───────────────────────────────

SECTION A — Team Card:
- Team name (large heading)
- Team ID (monospace, copyable)
- "Team Lead: [lead member name]" line

SECTION B — Team Members:
List all members showing:
- Name
- Delegate ID (monospace)
- College name
- "Team Lead" badge for lead member
- Payment status badge per member

SECTION C — Team Events:
Title: "Team Event Registrations"
If no team events: "This team has not registered for 
any events yet."
Otherwise: same event card format as above.

━━━━━━━━━━━━━━━━━━━━
BOTTOM SECTION (shown in STATE 2 only, below all results)
━━━━━━━━━━━━━━━━━━━━

Show these three elements at the bottom of the results:

1. ACTION BUTTONS (side by side on desktop, stacked on 
   mobile):
   
   Button A: "View Brochure"
   - Opens a PDF or link in a new tab
   - Use a placeholder href="#" for now with a comment:
     // TODO: Replace with actual brochure URL
   - Icon: document/PDF icon
   
   Button B: "Register for More Events"
   - Links to /events
   - Icon: calendar/events icon

2. NEED HELP? SECTION:
   A card or box with:
   - Title: "Need to modify your details?"
   - Body: "If you need to update any of your registration 
     information, please contact our registrations team 
     directly. We'll be happy to help."
   - Contact details placeholder:
     [REGISTRATIONS_TEAM_CONTACT_NAME] — [PHONE_NUMBER]
     Add a comment: // TODO: Fill in actual contact details
   - "Cannot modify registrations yourself for security 
     reasons" note in small text

3. "Search Again" button:
   - Clicking returns to STATE 1 and clears all results

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3/3 — UX REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Mobile-first layout — all cards stack vertically on 
   mobile, side by side on larger screens where appropriate

2. Loading state — show a spinner/skeleton while the API 
   call is in progress. Disable the Search button during 
   loading to prevent double requests.

3. Copyable IDs — delegate IDs and team IDs should be 
   copyable via click. Show a brief "Copied!" tooltip 
   that auto-dismisses after 1.5 seconds. Use the 
   Clipboard API:
   navigator.clipboard.writeText(id)

4. Smooth transition — when results appear, scroll the 
   page to the top of the results section smoothly:
   resultsRef.current?.scrollIntoView({ behavior: 'smooth' })

5. Input trimming — always trim whitespace from the 
   input before sending to the API

6. Input auto-detection hint — as the user types, show 
   a small hint below the input detecting what they're 
   typing:
   - Contains "@": "Searching by email address"
   - Matches delegate ID pattern: "Searching by delegate ID"
   - Matches team ID pattern: "Searching by team ID"
   - Otherwise: "Enter your email, delegate ID, or team ID"
   This hint updates in real time as the user types.

7. Empty registered events — if a delegate has no events 
   registered at all (both soloEvents and teamEvents are 
   empty), show a friendly prompt:
   "You haven't registered for any events yet. 
   [Browse Events →] to sign up."
   Where [Browse Events →] links to /events

8. Payment status explanation — below the payment status 
   badge, show a small explanatory note:
   * pending_verification: "Our team is verifying your 
     payment. This usually takes 24–48 hours."
   * verified: "Your payment has been verified. 
     You're all set!"
   * rejected: "There was an issue with your payment. 
     Please contact our team using the details below."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After implementing, perform ALL of these:

1. Run npx tsc --noEmit — zero errors required.

2. Test with a real delegate ID from your Firestore:
   - Go to /registration-status
   - Enter a delegate ID you created during testing
   - Click Search
   - Confirm loading spinner appears then results show
   - Confirm delegate profile card shows correct details
   - Confirm payment status badge is correct colour
   - Confirm registered events appear (or empty state 
     if none registered)
   - Confirm delegate ID is copyable

3. Test with email address:
   - Enter the email of a delegate you registered
   - Confirm same result as delegate ID lookup

4. Test with team ID (register a team first if needed):
   - Enter a team ID
   - Confirm team card shows all members
   - Confirm team lead badge appears on correct member
   - Confirm all member delegate IDs are correct

5. Test error states:
   - Enter a fake delegate ID like "AAA-00000-XXXXX"
   - Confirm specific error: "No delegate found with 
     ID AAA-00000-XXXXX."
   - Enter a fake email "fake@fake.com"
   - Confirm specific error: "No delegate found with 
     this email address."
   - Enter a fake team ID "AAA-BBBBBBB"
   - Confirm specific error: "No team found with 
     ID AAA-BBBBBBB."
   - Enter gibberish like "hello world"
   - Confirm specific error about invalid format

6. Test input detection hints:
   - Type "test@" — hint shows "Searching by email address"
   - Type "ADI-28" — hint shows "Searching by delegate ID"
   - Type "XOT-HC" — hint shows "Searching by team ID"
   - Type "hello" — hint shows generic message

7. Test copyable IDs:
   - Click a delegate ID — "Copied!" tooltip appears
   - Paste elsewhere — correct ID pasted

8. Test action buttons:
   - "Register for More Events" navigates to /events
   - "View Brochure" opens a new tab (placeholder for now)

9. Test "Search Again":
   - Click "Search Again" — results clear, input shown
   - Input field is focused and empty

10. Mobile verification (Chrome DevTools → iPhone):
    - Search input full width
    - Results cards stack vertically
    - Action buttons stack vertically
    - All text readable without horizontal scroll
    - Copyable IDs work on mobile













----

Read @PLAN.md fully before writing any code.

We are rebuilding the /events page and its underlying data with real event data for the fest. This involves:
1. A new events catalogue with complete event data
2. An updated seed script to populate Firestore
3. A rebuilt /events page with categories, search, tags, collapsible sections, and event modals
4. Updated CartProvider to handle the new event data shape

This does NOT affect:
- /cart page (event registration payment flow)
- /api/registration/events route
- Any delegate registration files
- Any merch files
- Any Sheets sync files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Do not modify /cart/page.tsx
- Do not modify /api/registration/events/route.ts
- Do not modify any delegate registration files
- Do not modify any merch files
- Do not modify any Sheets sync files
- Do not add any new npm packages
- The /events page must remain a React Server Component at the top level — client interactivity is in child components only
- Search and filtering must be client-side only — no additional Firestore queries after initial page load
- All 33 events must be seeded with eventId === slug
- Report completion of each Part explicitly before moving to the next

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART-BY-PART IMPLEMENTATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST complete each part fully, verify it works, and explicitly state "PART N COMPLETE — ALL CHECKS PASSED" before asking me for instructions for the next part.
There are 7 parts in total.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1/7 — EVENT DATA TYPES & SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update the event schema in types/index.ts to replace the existing eventSchema with this expanded version:

```typescript
export type EventCategory =
  | "music"
  | "dance"
  | "assorted"
  | "quiz"
  | "drama"
  | "art"
  | "literary";

export type PricingType = "per_person" | "flat_total" | "free";

export type EventTag =
  | "solo"
  | "group"
  | "online"
  | "large-team"      // teams of 6+
  | "small-team"      // teams of 2-5
  | "free"
  | "under-100"       // fee < ₹100 per person or total
  | "under-300"       // fee < ₹300
  | "flagship"        // major events (battle of bands, group 
                      // dance, street play, fashion main)
  | "gaming"
  | "performing-arts"
  | "visual-arts"
  | "literary"
  | "music"
  | "dance";

export const eventSchema = z.object({
  eventId: z.string(),
  indianName: z.string(),        // e.g. "Swar Leela"
  englishName: z.string(),       // e.g. "Solo Eastern Singing"
  slug: z.string(),              // url-safe, e.g. "swar-leela"
  category: z.enum([
    "music", "dance", "assorted", "quiz", 
    "drama", "art", "literary"
  ]),
  description: z.string(),       // full description, can be 
                                 // empty string for now
  shortDescription: z.string(), // shown on card, 1-2 sentences
  type: z.enum(["solo", "group"]),
  pricingType: z.enum(["per_person", "flat_total", "free"]),
  fee: z.number(),               // 0 if free. Per person if 
                                 // per_person, total if flat_total
  minTeamSize: z.number().nullable(),
  maxTeamSize: z.number().nullable(),
  isOnline: z.boolean(),
  isAvailable: z.boolean(),      // false = registration closed
  tags: z.array(z.string()),
  imageUrls: z.array(z.string()), // empty array for now
  venue: z.string().nullable(),
  eventDate: z.string().nullable(),  // ISO date string or null
  eventTime: z.string().nullable(),  // e.g. "10:00 AM" or null
  schedule: z.string().nullable(),   // combined display string
                                     // e.g. "Day 1, 10:00 AM"
  rules: z.array(z.string()),        // empty array for now
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
});

export type Event = z.infer<typeof eventSchema>;
```

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — EVENTS CATALOGUE & SEED SCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create /lib/eventsCatalogue.ts with ALL events defined below. This is the source of truth for the seed script.

PRICING RULES:
- pricingType: "per_person" → fee field = price per person
- pricingType: "flat_total" → fee field = total price for 
  the whole team regardless of size
- pricingType: "free" → fee field = 0

TAG RULES — assign tags automatically based on event data:
- Always add "solo" or "group" based on type
- Add "online" if isOnline is true
- Add "free" if pricingType is "free"
- Add "under-100" if fee < 100 (for per_person) or 
  fee < 100 (for flat_total)
- Add "under-300" if fee < 300 per person or total
- Add "large-team" if maxTeamSize >= 6
- Add "small-team" if maxTeamSize <= 5 and type is "group"
- Add "flagship" for: ahaang, group dance, street play, 
  fashion main event, CODM, BGMI
- Add "gaming" for: fifa, bgmi, codm
- Add "performing-arts" for all music and dance events
- Add "visual-arts" for all art events
- Add "literary" for all literary events
- Add "music" for all music events
- Add "dance" for all dance events

SLUG FORMAT: lowercase, spaces replaced with hyphens, special characters removed. Indian name takes priority for slug if it's distinctive.
Examples: "swar-leela", "jugalbandi", "natyanjali", "face-off", "reflections", "sapientia", "escape-room"

ALL EVENTS:

─── MUSIC ────────────────────────────────────

1. indianName: "Swar Leela"
   englishName: "Solo Eastern Singing"
   slug: "swar-leela"
   category: "music"
   type: "solo"
   pricingType: "per_person"
   fee: 75
   minTeamSize: null, maxTeamSize: null
   isOnline: false

2. indianName: "Solo Western Singing"
   englishName: "Solo Western Singing"
   slug: "solo-western-singing"
   category: "music"
   type: "solo"
   pricingType: "per_person"
   fee: 75
   minTeamSize: null, maxTeamSize: null
   isOnline: false

3. indianName: "Jugalbandi"
   englishName: "Duet Vocals"
   slug: "jugalbandi"
   category: "music"
   type: "group"
   pricingType: "flat_total"
   fee: 150
   minTeamSize: 2, maxTeamSize: 2
   isOnline: false

4. indianName: "Ahaang"
   englishName: "Battle of Bands"
   slug: "ahaang"
   category: "music"
   type: "group"
   pricingType: "flat_total"
   fee: 1199
   minTeamSize: 3, maxTeamSize: 12
   isOnline: false
   tags: include "flagship"

5. indianName: "Tarang"
   englishName: "Instrumental Solo"
   slug: "tarang"
   category: "music"
   type: "solo"
   pricingType: "free"
   fee: 0
   minTeamSize: null, maxTeamSize: null
   isOnline: true

─── DANCE ────────────────────────────────────

6. indianName: "Natyanjali"
   englishName: "Solo Classical Dance"
   slug: "natyanjali"
   category: "dance"
   type: "solo"
   pricingType: "per_person"
   fee: 75
   minTeamSize: null, maxTeamSize: null
   isOnline: false

7. indianName: "Solo Non-Classical Dance"
   englishName: "Solo Non-Classical Dance"
   slug: "solo-non-classical-dance"
   category: "dance"
   type: "solo"
   pricingType: "per_person"
   fee: 75
   minTeamSize: null, maxTeamSize: null
   isOnline: false

8. indianName: "Face Off"
   englishName: "Face Off"
   slug: "face-off"
   category: "dance"
   type: "solo"
   pricingType: "per_person"
   fee: 75
   minTeamSize: null, maxTeamSize: null
   isOnline: false

9. indianName: "Reflections"
   englishName: "Reflections"
   slug: "reflections"
   category: "dance"
   type: "group"
   pricingType: "per_person"
   fee: 75
   minTeamSize: 2, maxTeamSize: 10
   isOnline: false

10. indianName: "Group Dance"
    englishName: "Group Dance"
    slug: "group-dance"
    category: "dance"
    type: "group"
    pricingType: "flat_total"
    fee: 799
    minTeamSize: 6, maxTeamSize: 16
    isOnline: false
    tags: include "flagship", "large-team"

─── ASSORTED ─────────────────────────────────

11. indianName: "Sapientia"
    englishName: "Sapientia"
    slug: "sapientia"
    category: "assorted"
    type: "group"
    pricingType: "flat_total"
    fee: 150
    minTeamSize: 2, maxTeamSize: 2
    isOnline: false

12. indianName: "Escape Room"
    englishName: "Escape Room"
    slug: "escape-room"
    category: "assorted"
    type: "group"
    pricingType: "per_person"
    fee: 99
    minTeamSize: 2, maxTeamSize: 6
    isOnline: false

13. indianName: "Fashion — Main Event"
    englishName: "Fashion Main Event"
    slug: "fashion-main"
    category: "assorted"
    type: "group"
    pricingType: "flat_total"
    fee: 1299
    minTeamSize: 12, maxTeamSize: 20
    isOnline: false
    tags: include "flagship", "large-team"

14. indianName: "Twin Vogue"
    englishName: "Twin Vogue"
    slug: "twin-vogue"
    category: "assorted"
    type: "group"
    pricingType: "flat_total"
    fee: 199
    minTeamSize: 2, maxTeamSize: 2
    isOnline: false

15. indianName: "FIFA (PC)"
    englishName: "FIFA PC Gaming"
    slug: "fifa-pc"
    category: "assorted"
    type: "solo"
    pricingType: "per_person"
    fee: 150
    minTeamSize: null, maxTeamSize: null
    isOnline: false
    tags: include "gaming"

16. indianName: "BGMI (Mobile)"
    englishName: "BGMI Mobile Gaming"
    slug: "bgmi-mobile"
    category: "assorted"
    type: "group"
    pricingType: "flat_total"
    fee: 399
    minTeamSize: 4, maxTeamSize: 5
    isOnline: false
    tags: include "gaming", "flagship"
    NOTE: 4 players + 1 substitute. Store maxTeamSize: 5

17. indianName: "CODM (Mobile)"
    englishName: "CODM Mobile Gaming"
    slug: "codm-mobile"
    category: "assorted"
    type: "group"
    pricingType: "flat_total"
    fee: 499
    minTeamSize: 5, maxTeamSize: 6
    isOnline: false
    tags: include "gaming", "flagship"
    NOTE: 5 players + 1 substitute. Store maxTeamSize: 6

─── QUIZ ─────────────────────────────────────

18. indianName: "General Quiz"
    englishName: "General Quiz"
    slug: "general-quiz"
    category: "quiz"
    type: "group"
    pricingType: "per_person"
    fee: 75
    minTeamSize: 1, maxTeamSize: 3
    isOnline: false
    NOTE: min 1 means can be solo or up to 3. Store as 
    type: "group" with minTeamSize: 1 so the cart page 
    handles it as a group event but allows single participant.

19. indianName: "Mela Quiz"
    englishName: "Mela Quiz"
    slug: "mela-quiz"
    category: "quiz"
    type: "group"
    pricingType: "per_person"
    fee: 75
    minTeamSize: 1, maxTeamSize: 2
    isOnline: false
    NOTE: Same as above — min 1, max 2.

─── DRAMA ────────────────────────────────────

20. indianName: "Streetplay"
    englishName: "Street Play"
    slug: "streetplay"
    category: "drama"
    type: "group"
    pricingType: "flat_total"
    fee: 799
    minTeamSize: 8, maxTeamSize: 12
    isOnline: false
    tags: include "flagship", "large-team"

21. indianName: "Mono Act"
    englishName: "Mono Act"
    slug: "mono-act"
    category: "drama"
    type: "solo"
    pricingType: "per_person"
    fee: 75
    minTeamSize: null, maxTeamSize: null
    isOnline: false

22. indianName: "Dramathon"
    englishName: "Dramathon"
    slug: "dramathon"
    category: "drama"
    type: "group"
    pricingType: "flat_total"
    fee: 199
    minTeamSize: 2, maxTeamSize: 4
    isOnline: false

23. indianName: "Mad Ads"
    englishName: "Mad Ads"
    slug: "mad-ads"
    category: "drama"
    type: "group"
    pricingType: "flat_total"
    fee: 150
    minTeamSize: 3, maxTeamSize: 5
    isOnline: true

─── ART ──────────────────────────────────────

24. indianName: "Art Attack"
    englishName: "Art Attack"
    slug: "art-attack"
    category: "art"
    type: "group"
    pricingType: "flat_total"
    fee: 299
    minTeamSize: 3, maxTeamSize: 6
    isOnline: false

25. indianName: "Tote Bag Painting"
    englishName: "Tote Bag Painting"
    slug: "tote-bag-painting"
    category: "art"
    type: "group"
    pricingType: "flat_total"
    fee: 150
    minTeamSize: 2, maxTeamSize: 2
    isOnline: false

26. indianName: "Face Painting"
    englishName: "Face Painting"
    slug: "face-painting"
    category: "art"
    type: "solo"
    pricingType: "per_person"
    fee: 99
    minTeamSize: null, maxTeamSize: null
    isOnline: false

27. indianName: "Relay Painting"
    englishName: "Relay Painting"
    slug: "relay-painting"
    category: "art"
    type: "group"
    pricingType: "flat_total"
    fee: 299
    minTeamSize: 4, maxTeamSize: 4
    isOnline: false

28. indianName: "Duotone"
    englishName: "Duotone"
    slug: "duotone"
    category: "art"
    type: "solo"
    pricingType: "per_person"
    fee: 75
    minTeamSize: null, maxTeamSize: null
    isOnline: false

─── LITERARY ─────────────────────────────────

29. indianName: "Shipwreck"
    englishName: "Shipwreck"
    slug: "shipwreck"
    category: "literary"
    type: "solo"
    pricingType: "per_person"
    fee: 75
    minTeamSize: null, maxTeamSize: null
    isOnline: false

30. indianName: "JAM"
    englishName: "Just A Minute"
    slug: "jam"
    category: "literary"
    type: "solo"
    pricingType: "per_person"
    fee: 75
    minTeamSize: null, maxTeamSize: null
    isOnline: false

31. indianName: "Debate"
    englishName: "Debate"
    slug: "debate"
    category: "literary"
    type: "group"
    pricingType: "flat_total"
    fee: 150
    minTeamSize: 2, maxTeamSize: 2
    isOnline: false

32. indianName: "Lit Marathon"
    englishName: "Literary Marathon"
    slug: "lit-marathon"
    category: "literary"
    type: "group"
    pricingType: "flat_total"
    fee: 299
    minTeamSize: 4, maxTeamSize: 4
    isOnline: false

33. indianName: "Poetry"
    englishName: "Poetry"
    slug: "poetry"
    category: "literary"
    type: "solo"
    pricingType: "free"
    fee: 0
    minTeamSize: null, maxTeamSize: null
    isOnline: true

─────────────────────────────────────────────

For ALL events set these fields to placeholder values:
- description: "" (empty string — developer fills later)
- shortDescription: "" (empty string)
- imageUrls: [] (empty array)
- venue: null
- eventDate: null
- eventTime: null
- schedule: null
- rules: [] (empty array)
- contactName: null
- contactPhone: null
- isAvailable: true

The eventId must be the same as the slug for consistency.
Example: eventId: "swar-leela"

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3/7 — UPDATE SEED SCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update scripts/seedEvents.ts to:
1. Import EVENTS_CATALOGUE from /lib/eventsCatalogue.ts
2. Delete ALL existing documents in the events collection first before seeding (to prevent duplicates from old seed data)
3. Write all 33 events as Firestore documents using eventId as the document ID
4. Log progress: "Seeding [n]/33: [indianName]..."
5. Log "✅ Seeded 33 events successfully" on completion

Run the seed script after implementing:
npx ts-node --project tsconfig.scripts.json scripts/seedEvents.ts

Verify in Firebase console that all 33 events exist in the events collection before proceeding.

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4/7 — UPDATE CartProvider
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update components/CartProvider.tsx to handle the new event data shape.

The cart item stored in context must include these fields from the event (needed on /cart page for display and delegate ID verification):

```typescript
interface CartItem {
  eventId: string;
  indianName: string;
  englishName: string;
  type: "solo" | "group";
  pricingType: "per_person" | "flat_total" | "free";
  fee: number;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  category: EventCategory;
}
```

Update addToCart to:
1. Check if eventId already exists in cart — if yes, do 
   NOT add and return { added: false, reason: "already_in_cart" }
2. If not in cart, add the item and return 
   { added: true }

The "already in cart" feedback is handled in the UI (EventCard shows "Already in Cart" state).

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5/7 — REBUILD /events PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rebuild app/events/page.tsx as a React Server Component.

Fetch all events from Firestore using Admin SDK on the server. Pass events to client components as props.

Page layout (top to bottom):

1. PAGE HEADER
   - Title: "Events"
   - Subtitle: "Fest Name — [NEXT_PUBLIC_FEST_NAME]"

2. SEARCH BAR
   - Full width search input
   - Placeholder: "Search by event name..."
   - Searches across both indianName and englishName 
     (case insensitive)
   - Search is client-side (filter already-loaded events)
   - Debounced by 200ms to avoid excessive re-renders
   - Show result count when search is active: 
     "X events found"
   - Clear button (×) appears when search has input

3. TAG FILTER BAR
   - Horizontally scrollable row of tag pills
   - Tags to show (in this order):
     All | Solo | Group | Online | Free | Under ₹100 | 
     Under ₹300 | Small Team | Large Team | Flagship | 
     Gaming | Performing Arts | Visual Arts | Literary
   - "All" is selected by default
   - Clicking a tag filters events to show only events 
     with that tag
   - Only ONE tag can be active at a time
   - Active tag pill has distinct styling (filled/highlighted)
   - When a tag is active AND search is active, both 
     filters apply (AND logic — event must match both)

4. CATEGORY SECTIONS
   Display events grouped in this order:
   Music | Dance | Assorted | Quiz | Drama | Art | Literary
   
   Each category section:
   - Category header with icon and name (e.g. 🎵 Music Events)
   - Collapse/expand toggle button beside the header
     (chevron icon, rotates on collapse)
   - All categories start EXPANDED by default
   - Smooth collapse animation (CSS transition)
   - When collapsed: only header row visible, events hidden
   - Event cards in a responsive grid:
     mobile: 1 column
     tablet (md): 2 columns
     desktop (lg): 3 columns
   - Cards stack vertically on mobile

   CATEGORY ICONS:
   Music: 🎵  Dance: 💃  Assorted: 🎭
   Quiz: 🧠  Drama: 🎬  Art: 🎨  Literary: 📚

   WHEN SEARCH OR TAG FILTER IS ACTIVE:
   - Ignore category grouping entirely
   - Show a flat list of matching events under a 
     "Search Results" heading
   - Show empty state if no matches: 
     "No events found for '[query]'. Try a different 
     search term or clear filters."

5. EVENT CARD (component: components/EventCard.tsx)

   Card displays:
   - Indian name (primary, larger font)
   - English name (secondary, smaller, muted)
   - Category badge
   - "Online" badge if isOnline is true (blue badge)
   - Price display:
     * Free: "Free" in green
     * Per person: "₹[fee]/person"
     * Flat total: "₹[fee] total"
   - Team size display (for group events only):
     * Fixed team: "Team of [n]"
     * Range: "[min]–[max] members"
   - Tags as small pills (show max 3 tags, rest hidden)
   - Schedule/date if available, "TBA" if null
   - Venue if available, "TBA" if null
   - "View Details" button → opens event modal
   - "Add to Cart" button:
     * If event not in cart: primary button "Add to Cart"
     * If event in cart: secondary/muted button 
       "✓ Added to Cart" (disabled, not clickable)
     * If isAvailable is false: "Registration Closed" 
       (disabled)
   - Cards have hover effect (subtle shadow/scale)
   - Entire card is clickable to open modal (not just button)

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6/7 — EVENT DETAIL MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create components/EventModal.tsx (client component)

The modal opens when user clicks an event card or "View Details" button.

MODAL BEHAVIOUR:
- Background becomes blurred (backdrop-filter: blur(8px))
  with a dark overlay (bg-black/50)
- Modal has rounded corners (rounded-2xl or rounded-3xl)
- Clicking OUTSIDE the modal closes it
- Pressing Escape key closes it
- Modal is scrollable internally if content is tall
- Smooth open/close animation (fade + scale)
- On mobile: modal takes full screen width with small 
  horizontal margin, positioned near bottom 
  (like a bottom sheet but with rounded top corners)
- On desktop: centered modal, max-width 600px

MODAL CONTENT (top to bottom):
1. Close button (×) in top right corner
2. Image gallery:
   - If imageUrls is empty: show a placeholder gradient 
     with the Indian event name centered
   - If imageUrls has items: show first image full width,
     thumbnail strip below for multiple images
3. Indian name (large heading)
4. English name (subtitle, muted)
5. Badges row: category | Online (if applicable) | 
   type (Solo/Group)
6. Price section:
   - Free: "Free Entry" in green
   - Per person: "₹[fee] per person"
   - Flat total: "₹[fee] total for the team"
7. Team size (for group events):
   - "Team of [n]" for fixed size
   - "[min] to [max] members" for range
   - For BGMI/CODM: "4 players + 1 substitute" / 
     "5 players + 1 substitute"
8. Schedule section: date, time, venue (show "TBA" if null)
9. Description (show placeholder text if empty: 
   "Event details coming soon.")
10. Rules list (show placeholder if empty:
    "Rules will be announced soon.")
11. Contact (show if contactName is not null)
12. "Add to Cart" button (full width, same logic as card):
    - "Add to Cart" if not in cart
    - "✓ Already in Cart" if in cart (disabled)
    - "Registration Closed" if isAvailable false

IMPORTANT: clicking outside the modal (on the backdrop) must close it. Implement using:
```typescript
const backdropRef = useRef<HTMLDivElement>(null);
const handleBackdropClick = (e: React.MouseEvent) => {
  if (e.target === backdropRef.current) onClose();
};
```

When you're done with this part implementation, report to me and await instructions for the next part. Verify & test part implementation after you're finished.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7/7 — PRICE DISPLAY HELPER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create lib/eventPricing.ts with helper functions:

```typescript
// Returns a display string for the event price
export function formatEventPrice(event: Event): string {
  if (event.pricingType === "free") return "Free";
  if (event.pricingType === "per_person") 
    return `₹${event.fee}/person`;
  if (event.pricingType === "flat_total") 
    return `₹${event.fee} total`;
  return "";
}

// Returns the fee to store in the cart item
// For cart display and payment calculation
export function getCartFee(event: Event): number {
  return event.fee; // always store raw fee, 
  // display logic handles per_person vs flat_total
}

// Returns a human-readable team size string
export function formatTeamSize(event: Event): string | null {
  if (event.type === "solo") return null;
  if (!event.minTeamSize || !event.maxTeamSize) return null;
  if (event.minTeamSize === event.maxTeamSize) 
    return `Team of ${event.minTeamSize}`;
  return `${event.minTeamSize}–${event.maxTeamSize} members`;
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Run npx tsc --noEmit — zero errors required.

2. Run seed script and verify in Firebase console:
   - Exactly 33 documents in events collection
   - Check "swar-leela" document has all fields
   - Check "ahaang" has tags including "flagship"
   - Check "tarang" has isOnline: true and fee: 0
   - Check "group-dance" has pricingType: "flat_total"

3. Go to http://localhost:3000/events:
   - All 7 category sections visible and expanded
   - All 33 events appear across categories
   - Each card shows Indian name, English name, price, 
     category badge
   - "Online" badge visible on Tarang, Mad Ads, Poetry
   - "Free" shown in green on Tarang and Poetry

4. Test collapse/expand:
   - Click collapse button on Music section
   - Music events hide with smooth animation
   - Click again — events reappear
   - Other sections unaffected

5. Test search:
   - Type "swar" — only Swar Leela appears
   - Type "singing" — Solo Eastern and Western Singing appear
   - Type "natyanjali" — Natyanjali appears (Indian name search)
   - Clear search — all events reappear in categories
   - Type something with no match — empty state message shown

6. Test tag filters:
   - Click "Online" — only Tarang, Mad Ads, Poetry shown
   - Click "Free" — only Tarang and Poetry shown
   - Click "Gaming" — FIFA, BGMI, CODM shown
   - Click "Flagship" — Ahaang, Group Dance, Street Play, 
     Fashion Main, BGMI, CODM shown
   - Click "All" — resets to show everything

7. Test search + tag combined:
   - Click "Group" tag, then type "dance" in search
   - Only group dance events matching "dance" appear

8. Test event modal:
   - Click any event card
   - Modal opens with blur background
   - All fields visible (placeholders for empty fields)
   - Click outside modal — modal closes
   - Press Escape — modal closes
   - Modal is scrollable if content overflows

9. Test "Add to Cart":
   - Click "Add to Cart" on Swar Leela
   - Button changes to "✓ Added to Cart" on the card
   - Cart icon count increments
   - Open Swar Leela modal — button shows "✓ Already in Cart"
   - Try adding Swar Leela again — blocked, button stays 
     as "✓ Added to Cart"
   - Add a group event (e.g. Jugalbandi) — cart count 
     increments to 2

10. Mobile verification (Chrome DevTools → iPhone viewport):
    - Events page loads correctly
    - Cards stack in single column
    - Tag filter bar scrolls horizontally
    - Modal opens as bottom-sheet style
    - Modal content is scrollable
    - Collapse buttons are easily tappable

11. Verify /cart page still works:
    - Add events to cart from /events
    - Go to /cart — events appear correctly
    - Delegate ID verification still works
    - No regressions




























































I have finally gotten the real events list for this upcoming college fest. It's:


As you can see, each event field will have an unique eventID, indian name, an english name, a short description, price (either per person or in total), team members specification, minimumTeamSize and maximumTeamSize, event schedule (time and date), event image, venue, type of event (solo/group) and tags (solo/group, >4 members, <₹300 price, etc. add more relevant tags per your discretion for a better user experience) Each event should have all these fields even though they might be blank for now, I'll fill it in later. On the /events page, since it's a card based layout, users will only see both the event names, their tags, dates, time and venue. When they click on any event, a new page opens up (/events/event-name) and there they see the entire description and imahges (if any). From there they can add the event to the cart


Also, currently on /events we are categorising events by either solo or group, change that to these categories as above (drama, art, literary, music events, etc.).
The events should appear in card based formats and stack vertically on mobile device. Also, add a small collapse button beside the category names. So, if the user clicks on the collapse button near the music events section, the entire section collapses and the user can view the next section such as dance events.


Also on the same /events page, there should be a robust search functionality which lets user search in for the event by either its indian or english name. Just below the search bar should be tags so that the users can immediately filter out results based on specific tags (all the events will have the relevant tag attribute). These tags could be something like solo, group, >4 members, <₹300 price, etc.


I want something quite similar to this but with added functionality: https://vagus-sammscrithi-2026.vercel.app/sammscrithi


claude's questions
- seed events in firestore unlike merch catalogue which is hard-coded
- Open a modal/drawer on the same page but make it so that if the user clicks anywhere outside the modal, the modal closes. This modal will have the additional detail regarding the event including the images, description, etc. Users can add the event to the cart from over here as well. Make the modal have rounded corners and the background should become blur when the modal is shown on the screen. Optimize entire layout for mobile devices.

