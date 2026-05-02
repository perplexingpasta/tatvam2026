import { Phone, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { contactFAQs } from "@/lib/faqData";

export const metadata = {
  title: "Contact Us",
};

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Page Heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about registrations, events, or sponsorships? Reach
            out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Contact & Address */}
          <div className="space-y-8">
            {/* Contacts Element */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
                Key Organizers
              </h2>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mt-1">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Rahul Sharma
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 mb-1">
                        Fest Coordinator
                      </p>
                      <a
                        href="tel:+919876543210"
                        className="text-gray-600 hover:text-blue-600 transition-colors block text-sm"
                      >
                        +91 98765 43210
                      </a>
                    </div>
                  </div>
                  <a
                    href="tel:+919876543210"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap text-sm"
                  >
                    Call Now
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mt-1">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Priya Patel
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 mb-1">
                        Registrations Head
                      </p>
                      <a
                        href="tel:+918765432109"
                        className="text-gray-600 hover:text-blue-600 transition-colors block text-sm"
                      >
                        +91 87654 32109
                      </a>
                    </div>
                  </div>
                  <a
                    href="tel:+918765432109"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap text-sm"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>

            {/* Address Element */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full text-red-600 mt-1 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Venue
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      JSS Medical College
                      <br />
                      Sri Shivarathreeshwara Nagara
                      <br />
                      Mysuru, Karnataka 570015
                      <br />
                      India
                    </p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=jss+medical+college,+bannimantap,+mysore,+karnataka,+india"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Map & Important Dates */}
          <div className="space-y-8">
            {/* Map Element */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[250px] lg:h-80 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3897.809187513233!2d76.65651581528652!3d12.33535949127599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf7061d4a6f217%3A0x6837885b525287e5!2sJSS%20Medical%20College!5e0!3m2!1sen!2sin!4v1709230000000!5m2!1sen!2sin"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="JSS Medical College Map"
              ></iframe>
            </div>

            {/* Important Dates Element */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Calendar size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Important Dates
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-gray-700">
                    Early Bird Starts
                  </span>
                  <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-md">
                    Aug 1, 2026
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-gray-700">
                    Registrations Open
                  </span>
                  <span className="text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-md">
                    Sep 15, 2026
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-red-600">
                    Last Date to Register
                  </span>
                  <span className="text-red-700 font-bold bg-red-50 px-3 py-1 rounded-md">
                    Oct 20, 2026
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-purple-700">
                    Festival Dates
                  </span>
                  <span className="text-white font-bold bg-purple-600 px-3 py-1 rounded-md shadow-sm">
                    Nov 5-8, 2026
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                  href="/registration"
                  className="block w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold rounded-lg transition-colors text-center shadow-sm"
                >
                  Register Now!
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-8 border-t border-gray-200">
          <FAQAccordion faqs={contactFAQs} />
        </div>

        {/* Social Media Footer */}
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2 text-center sm:text-left">
              Follow Us
            </h2>
            <p className="text-gray-400 text-center sm:text-left">
              Stay updated with the latest news, announcements, and
              behind-the-scenes content.
            </p>
          </div>
          <a
            href="https://www.instagram.com/tatvam.2026"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-900 px-6 py-4 rounded-xl font-bold transition-transform hover:scale-105 duration-200 shadow-md"
          >
            <InstagramIcon className="text-[#E1306C]" />
            <span>@tatvam.26</span>
          </a>
        </div>
      </div>
    </div>
  );
}
