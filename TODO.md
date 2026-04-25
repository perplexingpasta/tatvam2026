form field validation and type check
    utr max limit (22)

Here is the exact breakdown of how your registration form handles this:

  1. Client-Side (Frontend - app/registration/page.tsx)
   * Typechecking: We are using a manually defined TypeScript type Member to ensure the component's state hook (const [members, setMembers] = useState<Member[]>) strictly conforms to the expected data shape. 
   * Form Validation: The frontend currently relies on manual JavaScript validation. 
       * The validateStep1() function checks if any required string fields are empty or if the collegeIdImage file is missing.
       * It checks that a teamName is provided if the user adds 2 or more members.
       * File inputs manually enforce an absolute 10MB size limit and strictly check the MIME type (image/jpeg, image/png, image/jpg) the moment a user selects an image.

  2. Server-Side (Backend API - app/api/registration/delegate/route.ts)
   * Strict Validation & Typechecking: We are using Zod, a robust schema validation library, to strictly protect the backend route. Even if someone bypasses the frontend, the server enforces the rules.
   * The memberSchema explicitly requires that:
       * Emails are actual, valid email formats (z.string().email()).
       * Phone numbers are at least 10 characters long (z.string().min(10)).
       * Names and College ID numbers are not empty strings.
       * Tiers precisely match the allowed enum values ("tier1" | "tier2" | "tier3").
   * The server explicitly re-verifies the file size (<10MB) and exact MIME types of the File buffers before ever trying to upload them to Cloudinary.

  Potential UX Improvement
  Right now, the client-side validation is fairly rudimentary. For example, a user could type "abc" as their email. The frontend validateStep1 would accept it because it's not empty, but when they submit the form,
  the backend Zod schema would reject it and throw a red API error at the very end of the process.

  If you'd like, I can refactor the frontend to use React Hook Form paired with the @hookform/resolvers/zod package. This allows us to share the exact same Zod schema on both the client and the server, giving
  users instant, red inline error messages (e.g., "Invalid email address") while they are typing, rather than waiting for an API failure! 



reply_to: "yourpersonal@gmail.com"
cloduinary too less?
what is Your registration has been submitted and is pending verification?

make sports page
test suite
toast notifs
more emails (delegate confirmation, event confirmation, reminders)
easter egg

form should be blank after register another
replace img w next Image

delegate ID displayed on submission screen ✅
set up email template ✅
get domain ✅
connect domain ✅