reply_to: "yourpersonal@gmail.com"
make sports page
test suite
toast notifs
more emails (delegate confirmation, event confirmation, reminders)
form should be blank after register another

use nextjs Link tags
fonts woff2
images webp w compression
favicon
dynamic loading
easter egg
make a README for the repo
cloudinary too less?
what changes do i need to make when deploying it on my custom domain in production 

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


need to ask
- delegate prices
- delegate kit names
- schedule
- all event names, their prices and desc


Read @plan.md fully before continuing.
i would like to implement one major change in the code. the thing is students from my college (JSS Medical College) don't have to pay anything for delegate registration while non-JSS students do have to pay money to purchase delegate registration. So I want you to implement a radio checkbox in the delegate registration form after name, email and phone number to check whether the user is a JSSMC student or a student from a different college.
If a user checks the "JSSMC" radio button, then the college name gets pre-poulated with "JSS Medical College" in the data sent to the database (in the form, the college name field will be not editable by the user) and instead of "process to payment", the button now reads "register" since the JSSMC students don't have to pay anything but they do have to register themselves and get their unique code generated. Also this means that code generation happens right after they press "register" without every going to the payment screen. They should also receive the registration confirmation email. These JSSMC students are entitled to the highest delegate tier (tier 3) by default and aren't given an option to select any delegate tier.
If a user checks the "Other College", then a new field pops up to collect the college's name. And the rest of the process is the same as it is now i.e. user will proceed to the payment screen, make their payment and then submit and then get their unique code generated.
Note that event registration is the same for both JSS and non-JSS students, that is both have to pay the same amount.
Thus i think the best idea would be to have 2 cards on the /registration page. one card is for JSSMC students and the other card will be for non-JSSMC students. that way can be segregated early on.
Note:
- Teams can only be either consist of all JSSMC students or of all non-JSSMC students.
- JSSMC students still need to upload their college ID image as proof
- have a boolean (isJSSMC) in the firestore in delegate collection
Propose a plan to implement this. Ensure no existing functionality is broken.