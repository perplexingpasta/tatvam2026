export interface FAQItem {
  question: string;
  answer: string;
}

export const registrationFAQs: FAQItem[] = [
  {
    question: "What is the difference between JSSMC and External registration?",
    answer:
      "JSSMC registration is exclusively for students currently enrolled at JSS Medical College and requires no registration fee. External registration is for students from other colleges, who must purchase a delegate tier to participate in the fest.",
  },
  {
    question: "How do I register as a team?",
    answer:
      "If you're registering with friends, simply click the '+ Add Member' button during the registration process to add their details. When adding multiple members, you will be prompted to provide a Team Name. The first person listed automatically becomes the Team Lead.",
  },
  {
    question: "Can I change my delegate tier after registering?",
    answer:
      "No, once your registration is submitted and the payment is being processed, you cannot manually change your tier. If you need to upgrade your tier, please contact our support team directly before your payment is verified.",
  },
  {
    question: "Why hasn't my payment been verified yet?",
    answer:
      "Payment verification is done manually by our finance team to ensure accuracy. This process usually takes between 24 and 48 hours. You can check the 'Check Status' page at any time to see if your status has been updated.",
  },
  {
    question: "What should I do if I enter the wrong UTR number?",
    answer:
      "If your payment is rejected due to an incorrect UTR number, your registration status will show as 'Payment Rejected'. You will need to reach out to our registrations team with your Delegate ID or Email to have it manually corrected.",
  },
];

export const contactFAQs: FAQItem[] = [
  {
    question: "How quickly do you respond to email inquiries?",
    answer: "Our team actively monitors the contact inbox during business hours. You can generally expect a response within 12 to 24 hours.",
  },
  {
    question: "Who should I contact regarding sponsorship opportunities?",
    answer: "For all sponsorship, partnership, and marketing inquiries, please contact the lead organizers listed above directly via phone or WhatsApp.",
  },
  {
    question: "Is there a physical help desk during the fest?",
    answer: "Yes! During the festival dates, we will have a dedicated help desk located near the main entrance to assist with ID badges, event locations, and general queries.",
  },
  {
    question: "Can I get a refund if I can no longer attend?",
    answer: "Unfortunately, delegate kits and event registrations are strictly non-refundable and non-transferable under any circumstances.",
  },
  {
    question: "Where can I find the latest updates?",
    answer: "We post all major announcements, schedule changes, and event highlights on our official Instagram page. Make sure to follow us using the link below!",
  },
];
