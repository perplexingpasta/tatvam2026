"use client";

import { useState } from "react";
import { FAQItem } from "@/lib/faqData";

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 mb-8 px-4 sm:px-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-200">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="transition-all duration-300">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                <span className={`transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isOpen 
                    ? "max-h-[500px] opacity-100" 
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-5 pt-0 text-gray-600 bg-white">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
