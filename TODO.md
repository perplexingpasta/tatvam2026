how to change any property in currently listed events or add or delete events so that the change is updated everywhere
fix eventpage error


 GET /events 500 in 72s (next.js: 589ms, application-code: 71s)
[browser] Uncaught Error: 14 UNAVAILABLE: No connection established. Last error: Failed to connect (2026-04-30T01:54:48.171Z). Resolution note:
    at EventsPage (app\events\page.tsx:8:61)
   6 |
   7 | export default async function EventsPage() {
>  8 |   const eventsSnapshot = await adminDb.collection("events").get();
     |                                                             ^
   9 |
  10 |   const events = eventsSnapshot.docs.map((doc) => {
  11 |     const data = doc.data();

  

team name or any error should pop up as toast (and inline)
test suite (vitest) via claude ag
make all pages
ask claude ag how to optimise it

fonts woff2
then add schedule
make it say early bird prices
numbers 10 digits shown in subtext. if less or excees toast
for solo events, it should not say lead

reply_to: "yourpersonal@gmail.com"
more emails (delegate confirmation, event confirmation, reminders)
form should be blank after register another

testing
    both solo
    both team registration
    event registration (single and multiple)

use nextjs Link tags
images webp w compression
favicon
dynamic loading
easter egg


DONE
delegate ID displayed on submission screen ✅
set up email template ✅
get domain ✅
connect domain ✅
form field validation and type check ✅
minimum UTR should be 12 ✅
format time of creation in sheets ✅
phone number 10 digits only (only numbers) ✅
formatted time is now AM or PM ✅
connected w github ✅
delegate tier name fix (plat and not tier 2) ✅
when inputting team members in event reg, first one is team lead and the frontend shows that ✅
make sheets sync automatic ✅
updated registration email template to use custom delegate kit names ✅
duplicate email, phone number and college id number validation while registering as a delegate ✅
utr allow letters ✅
college name instead of year of study ✅
replace img w nextjs Image ✅
no teams tab in sheets. all entries in delegates tab ✅
jssmc vs non-jss ✅
switched to vercel hosting ✅
added vercel analytics, speed insights ✅
move team name to the end after last member ✅
make a README for the repo ✅
merch-7b3fc instead RIS-HOO-9182J ✅
merch store implementation complete ✅
large team error on vercel (need image compression on upload) ✅
test stagedupload on vercel ✅
implement events ✅
add solo tag to quizzes ✅
make registrationstatus page ✅
refactor eventregistrations sheets data ✅
image compress and webp for event payment ss ✅

need to ask:
- schedule
- all event desc