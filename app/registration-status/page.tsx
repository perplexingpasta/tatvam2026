"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { registrationFAQs } from "@/lib/faqData";

// Types matching the API response
type EventRegistrationDetail = {
  eventId: string;
  indianName: string;
  englishName: string;
  category: string;
  type: "solo" | "group";
  venue: string | null;
  schedule: string | null;
  eventDate: string | null;
  eventTime: string | null;
  fee: number;
  pricingType: string;
  teamName: string | null;
  participantNames: string[];
};

type DelegateMember = {
  delegateId: string;
  name: string;
  collegeName: string;
  delegateTier: string;
  isJSSMC?: boolean;
  paymentStatus?: string;
};

type DelegateInfo = {
  delegateId: string;
  name: string;
  email: string;
  collegeName: string;
  delegateTier: string;
  teamId: string | null;
  isJSSMC: boolean;
  paymentStatus: string;
  registeredEventIds: string[];
  createdAt: string;
};

type TeamInfo = {
  teamId: string;
  teamName: string;
  leadDelegateId: string;
  memberDelegateIds: string[];
  members: DelegateMember[];
};

type ApiResponse = {
  success: boolean;
  lookupType?: "delegate" | "team";
  delegate?: DelegateInfo;
  team?: TeamInfo | null;
  soloEvents?: EventRegistrationDetail[];
  teamEvents?: EventRegistrationDetail[];
  error?: string;
  message?: string;
};

// SVG Icons
const SearchIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const Spinner = () => (
  <svg
    className="animate-spin w-5 h-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const DocumentIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const CopyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

function CopyableText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className="inline-flex items-center gap-1 cursor-pointer font-mono text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors relative"
      onClick={handleCopy}
      title="Click to copy"
    >
      {text}
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied && (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          Copied!
        </span>
      )}
    </span>
  );
}

function PaymentBadge({ status }: { status?: string }) {
  if (status === "verified") {
    return (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded inline-block">
        Payment Verified
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded inline-block">
        Payment Rejected
      </span>
    );
  }
  return (
    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded inline-block">
      Payment Pending
    </span>
  );
}

function PaymentExplanation({ status }: { status?: string }) {
  if (status === "verified") {
    return (
      <p className="text-xs text-green-700 mt-1">
        Your payment has been verified. You&apos;re all set!
      </p>
    );
  }
  if (status === "rejected") {
    return (
      <p className="text-xs text-red-700 mt-1">
        There was an issue with your payment. Please contact our team using the
        details below.
      </p>
    );
  }
  return (
    <p className="text-xs text-yellow-700 mt-1">
      Our team is verifying your payment. This usually takes 24–48 hours.
    </p>
  );
}

function getTierName(tier: string) {
  if (tier === "tier1") return process.env.NEXT_PUBLIC_TIER_1_NAME || "Tier 1";
  if (tier === "tier2") return process.env.NEXT_PUBLIC_TIER_2_NAME || "Tier 2";
  if (tier === "tier3") return process.env.NEXT_PUBLIC_TIER_3_NAME || "Tier 3";
  return tier;
}

function EventCard({ event }: { event: EventRegistrationDetail }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-gray-900 text-lg leading-tight">
            {event.indianName}
          </h4>
          {event.englishName && (
            <p className="text-sm text-gray-900">{event.englishName}</p>
          )}
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap ml-2">
          {event.category}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-4 grow">
        <div>
          <span className="text-gray-900 block text-xs uppercase tracking-wider mb-0.5">
            Schedule
          </span>
          <span className="font-medium text-gray-800">
            {event.eventDate && event.eventTime
              ? `${event.eventDate} at ${event.eventTime}`
              : event.schedule
                ? new Date(event.schedule).toLocaleString()
                : "Date TBA"}
          </span>
        </div>
        <div>
          <span className="text-gray-900 block text-xs uppercase tracking-wider mb-0.5">
            Venue
          </span>
          <span className="font-medium text-gray-800">
            {event.venue || "Venue TBA"}
          </span>
        </div>
        <div>
          <span className="text-gray-900 block text-xs uppercase tracking-wider mb-0.5">
            Fee
          </span>
          <span className="font-medium text-gray-800">
            {event.pricingType === "free" || event.fee === 0
              ? "Free"
              : event.pricingType === "per_person"
                ? `₹${event.fee}/person`
                : `₹${event.fee} total`}
          </span>
        </div>
      </div>

      {event.type === "group" && (
        <div className="mt-4 pt-3 border-t">
          {event.teamName && (
            <p className="text-sm font-medium mb-2 text-gray-800">
              Team: {event.teamName}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {event.participantNames.map((name, idx) => (
              <span
                key={idx}
                className="bg-gray-100 border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationStatusPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Please enter a valid email address, delegate ID, or team ID.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/registration-status?query=${encodeURIComponent(trimmedQuery)}`,
      );
      const data: ApiResponse = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many searches. Please wait a moment and try again.");
        } else {
          setError(
            data.message || data.error || "An error occurred during lookup.",
          );
        }
      } else if (data.success) {
        setResult(data);
      } else {
        setError(data.message || "Unknown error occurred.");
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to connect to the server. Please check your internet connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setResult(null);
    setError(null);
  };

  // Derived state for input hint
  const trimmedQuery = query.trim();
  let inputHint = "Enter your email, delegate ID, or team ID";
  if (trimmedQuery.length > 0) {
    if (trimmedQuery.includes("@")) {
      inputHint = "Searching by email address";
    } else if (/^[A-Z]{3}-\d{5}-[A-Z0-9]{5}$/.test(trimmedQuery)) {
      inputHint = "Searching by delegate ID";
    } else if (/^[A-Z]{3}-[A-Z0-9]{7}$/.test(trimmedQuery)) {
      inputHint = "Searching by team ID";
    }
  }

  // STATE 1: Search Input
  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
        <div className="w-full max-w-2xl text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Registration Status
          </h1>
          <p className="text-lg text-gray-600">
            Look up your delegate registration, team details, and event
            registrations
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-4 rounded-lg border text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-shadow"
                  placeholder="e.g. user@mail.com, ADI-28210-KAW5A, XOT-HCYAS89"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner /> Searching...
                  </>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            <div className="flex justify-between items-start px-1">
              <p className="text-sm text-gray-900 italic">{inputHint}</p>
            </div>
{error && (
  <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm font-medium border border-red-100">
    {error}
  </div>
)}
</form>
</div>
<FAQAccordion faqs={registrationFAQs} />
</div>
);
}

return (
  // STATE 2: Results Display
  const hasNoEvents =
    (!result.soloEvents || result.soloEvents.length === 0) &&
    (!result.teamEvents || result.teamEvents.length === 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto" ref={resultsRef}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Registration Details
          </h1>
          <button
            onClick={handleReset}
            className="text-blue-600 hover:text-blue-800 font-medium underline text-sm md:text-base"
          >
            Search Again
          </button>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {/* DELEGATE LOOKUP */}
          {result.lookupType === "delegate" && result.delegate && (
            <>
              {/* Delegate Profile Card */}
              <section className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {result.delegate.name}
                    </h2>
                    <div className="text-gray-900 flex flex-wrap items-center gap-3 mb-4">
                      <CopyableText text={result.delegate.delegateId} />
                      {result.delegate.isJSSMC && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          JSSMC Student
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left md:text-right mt-2 md:mt-0 bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0">
                    <p className="text-sm text-gray-900 mb-1 md:mb-0">
                      Registered On
                    </p>
                    <p className="font-medium text-gray-900">
                      {new Date(result.delegate.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <p className="text-sm text-gray-900 mb-1">College</p>
                    <p className="font-medium text-gray-900">
                      {result.delegate.collegeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 mb-1">
                      Registration Tier
                    </p>
                    <p className="font-medium text-gray-900">
                      {getTierName(result.delegate.delegateTier)}
                    </p>
                  </div>
                  {result.delegate.teamId && (
                    <div className="text-gray-900">
                      <p className="text-sm text-gray-900 mb-1">Team ID</p>
                      <CopyableText text={result.delegate.teamId} />
                    </div>
                  )}
                  <div className="sm:col-span-2 md:col-span-3 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-900 mb-2">Payment Status</p>
                    <div>
                      <PaymentBadge status={result.delegate.paymentStatus} />
                      <PaymentExplanation
                        status={result.delegate.paymentStatus}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Team Details */}
              {result.team && (
                <section className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Your Team — {result.team.teamName}
                    </h3>
                    <CopyableText text={result.team.teamId} />
                  </div>
                  <div className="overflow-x-auto -mx-6 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-6 sm:px-4 py-3 sm:rounded-tl-lg">
                              Member
                            </th>
                            <th className="px-6 sm:px-4 py-3">Delegate ID</th>
                            <th className="px-6 sm:px-4 py-3">College</th>
                            <th className="px-6 sm:px-4 py-3 sm:rounded-tr-lg">
                              Tier
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.team.members.map((member) => (
                            <tr
                              key={member.delegateId}
                              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                            >
                              <td className="px-6 sm:px-4 py-3 font-medium text-gray-900">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {member.name}
                                  {member.delegateId ===
                                    result.team?.leadDelegateId && (
                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                      Team Lead
                                    </span>
                                  )}
                                  {member.delegateId ===
                                    result.delegate?.delegateId && (
                                    <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                      You
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 sm:px-4 py-3">
                                <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                  {member.delegateId}
                                </span>
                              </td>
                              <td className="px-6 sm:px-4 py-3 text-gray-600">
                                {member.collegeName}
                              </td>
                              <td className="px-6 sm:px-4 py-3 text-gray-600">
                                {getTierName(member.delegateTier)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {/* Registered Events */}
              <section className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Registered Events
                </h3>

                {hasNoEvents ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-600 mb-4 text-lg">
                      You haven&apos;t registered for any events yet.
                    </p>
                    <Link
                      href="/events"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <CalendarIcon /> Browse Events &rarr;
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">
                        Solo Registrations
                      </h4>
                      {!result.soloEvents || result.soloEvents.length === 0 ? (
                        <p className="text-gray-900 italic bg-gray-50 p-4 rounded-lg">
                          You have not registered for any solo events yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.soloEvents.map((event, idx) => (
                            <EventCard key={idx} event={event} />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">
                        Team Registrations
                      </h4>
                      {!result.teamEvents || result.teamEvents.length === 0 ? (
                        <p className="text-gray-900 italic bg-gray-50 p-4 rounded-lg">
                          You have not registered for any team events yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.teamEvents.map((event, idx) => (
                            <EventCard key={idx} event={event} />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>
            </>
          )}

          {/* TEAM LOOKUP */}
          {result.lookupType === "team" && result.team && (
            <>
              <section className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                  {result.team.teamName}
                </h2>
                <div className="flex items-center gap-4 mb-5">
                  <CopyableText text={result.team.teamId} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 inline-block w-full md:w-auto">
                  <p className="text-gray-600 text-sm mb-1 uppercase tracking-wider font-semibold">
                    Team Lead
                  </p>
                  <p className="font-medium text-lg text-gray-900">
                    {result.team.members.find(
                      (m) => m.delegateId === result.team?.leadDelegateId,
                    )?.name || "Unknown"}
                  </p>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Team Members
                </h3>
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 sm:px-4 py-3 sm:rounded-tl-lg">
                            Member
                          </th>
                          <th className="px-6 sm:px-4 py-3">Delegate ID</th>
                          <th className="px-6 sm:px-4 py-3">College</th>
                          <th className="px-6 sm:px-4 py-3 sm:rounded-tr-lg">
                            Payment Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.team.members.map((member) => (
                          <tr
                            key={member.delegateId}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="px-6 sm:px-4 py-4 font-medium text-gray-900">
                              <div className="flex items-center gap-2 flex-wrap">
                                {member.name}
                                {member.delegateId ===
                                  result.team?.leadDelegateId && (
                                  <span className="bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                    Team Lead
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 sm:px-4 py-4">
                              <CopyableText text={member.delegateId} />
                            </td>
                            <td className="px-6 sm:px-4 py-4 text-gray-600">
                              {member.collegeName}
                            </td>
                            <td className="px-6 sm:px-4 py-4">
                              <PaymentBadge status={member.paymentStatus} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Team Event Registrations
                </h3>
                {!result.teamEvents || result.teamEvents.length === 0 ? (
                  <p className="text-gray-900 italic bg-gray-50 p-6 rounded-lg text-center border border-dashed border-gray-200">
                    This team has not registered for any events yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.teamEvents.map((event, idx) => (
                      <EventCard key={idx} event={event} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* BOTTOM SECTION (Shown for all valid lookups) */}
          <section className="pt-8 border-t mt-4 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#"
                // TODO: Replace with actual brochure URL
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <DocumentIcon /> View Brochure
              </a>
              <Link
                href="/events"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <CalendarIcon /> Register for More Events
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
              <h4 className="text-lg font-bold text-blue-900 mb-2">
                Need to modify your details?
              </h4>
              <p className="text-blue-800 mb-5 text-sm md:text-base">
                If you need to update any of your registration information,
                please contact our registrations team directly. We&apos;ll be
                happy to help.
              </p>
              <div className="bg-white px-5 py-4 rounded-lg border border-blue-200 font-medium text-gray-800 inline-block shadow-sm">
                {/* TODO: Fill in actual contact details */}
                <span className="font-bold">
                  [REGISTRATIONS_TEAM_CONTACT_NAME]
                </span>{" "}
                —{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                  [PHONE_NUMBER]
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-4 font-medium">
                * You cannot modify registrations yourself for security reasons
              </p>
            </div>

            <div className="text-center pb-8">
              <button
                onClick={handleReset}
                className="text-gray-900 hover:text-gray-900 font-medium underline text-sm transition-colors"
              >
                Start a New Search
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
