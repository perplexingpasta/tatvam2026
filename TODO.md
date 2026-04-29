refactor eventregistrations sheets data (per person? maybe js ask claude)
image compress and webp for event payment ss


registration status (via claude)
    I would like to add a page to my web app. It's /registration-status. I have already created a folder with the same name inside the app folder and it contains a blank page.tsx at the moment. The idea is that any user can just input his delegate ID or team ID or email to view all of his registration details. In the placeholder to collect this field have sample entries such as "user@mail.com, ADI-28210-KAW5A, XOT-HCYAS89" for a better UX. The user can also view all the events he has signed up for including their dates, venue and time. The user also sees which teams he's a part of and which team events he's signed up for. If the input email is the team lead's email, then all information pertaining to his team, events he's signed up for including his teammates will be shown. There's a few buttons at the bottom: one to view brochure, one to sign up for more events (/events). The contact of my team member is also given at the bottom in case he wants to modify any field/information since he's not allowed to do it himself. Feel free to give suggestions or ask me questions to make this better.
    Note that this field is not for checking merch order status in any way.
    craft a comprehensive prompt to give to my coding agent (gemini cli). feel free to ask me questions or make suggestions to improve this.


how to change any property in currently listed events or add or delete events so that the change is updated everywhere


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

need to ask:
- schedule
- all event desc