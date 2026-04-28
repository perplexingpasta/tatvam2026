Let's create a store on /merch. I want to display the item's images, title, description, etc. exactly like an online store. As far as personal detail collection is concerned, let's just embed a google form directly inside this store. This google form will also support the payment upload screenshot and UTR number field. All the information from this google form gets saved in a google sheet so that later on my team can verify his payment status, call him to confirm his personalised details and fulfil the order.

i probably will only have 3-4 merch items such as hoodies, jerseys, and varsity jackets. each will have 3-5 personalized attributes which will need input from the user. 




test both team registration
test even registration


as far as the merch store is concerned, is it a better idea to integrate shopify or any other third-party store instead of creating a store from scratch? as i mentioned i probably will only have 3-4 merch items such as hoodies, jerseys, and varsity jackets. each will have 3-5 personalized attributes which will need input from the user. i want to display the item, let the user fill in his info, pay only via qr code followed by uploading the screenshot to the website and everything gets saved in a google sheet so that later on my team can verify his payment status, call him to confirm his personalised details and fulfil the order.
Make a new Firestore collection: merchItems for the catalogue and a new Firestore collection: merchOrders for purchases

Note:
- anyone can purchase the merch without needing to register himself as a delegate
- a user can buy as many quantities of merch as he wishes. have a "buy another" button at the bottom of the input details form so that the user can customize the another one differently if he wishes because a user usually buys jackets for himself and his family customised to each
- i will manage the inventory directly from the code itself so basically if we want to change the image of an item, i'll swap the local image in the directory and then commit the changes. same thing for any text
- different merch items will have different attributes


in this web app, i wish to create another page displaying event merch. i will upload images and users can select each item that they wish and it will be added to their cart. since each item is custom made, users have to input attributes such as their name, jersey number, batch year, etc. as for the payment, they have to scan a different QR code, and then upload the screenshot and write down the UTR number for the same. These details of custom instructions and purchase will all be saved in a new google sheet (different from the tatvam 2026 - registrations one). i don't want you to implement anything, i just wanna discuss how you'd suggest we go about implementing this. also feel free to ask questions or make suggestions to enhance this idea of mine
note:
    anyone can purchase merch without registering as a delegate
    dynamically manage the merch catalogue so nothing is hard-coded
    different merch items have different custom attributes
    a buyer cannot order multiple quantities of the same item. For example, 2 jerseys with different names and numbers? each individual can only order one
    buyer identity: name, contact, email, college ID number
    order confirmation email
    Merch cart persistence using localstorage
    Add an orderStatus field
    If you have limited stock per size, add a stock map to each merch item
    Merch-only page visibility



complete events
then add schedule

then registration status
    I would like to add a page to my web app. It's /registration-status. I have already created a folder with the same name inside the app folder and it contains a blank page.tsx at the moment. The idea is that any user can just input his delegate ID or team ID or email to view all of his registration details. In the placeholder to collect this field have sample entries such as "user@mail.com, ADI-28210-KAW5A, XOT-HCYAS89" for a better UX. The user can also view all the events he has signed up for including their dates, venue and time. The user also sees which teams he's a part of and which team events he's signed up for. There's a few buttons at the bottom: one to view brochure, one to sign up for more events (/events). The contact of my team member is also given at the bottom in case he wants to modify any field/information since he's not allowed to do it himself. Feel free to give suggestions or ask me questions to make this better.

team name or any error should pop up as toast
numbers 10 digits shown in subtext. if less or excees toast
for solo events, it should not say lead
read @PLAN.md before we continue. as you can see that currently we are sending delegateId in the event registrations data for the google sheets along with a bunch of other fields. that's great but can you make it so that along with the delegateID, the delegateName also goes with that in bracket    

reply_to: "yourpersonal@gmail.com"
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