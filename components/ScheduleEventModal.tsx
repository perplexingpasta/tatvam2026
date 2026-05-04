"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Event } from "@/types";
import { useCart } from "./CartProvider";
import { useSportsCart } from "./SportsCartProvider";
import { ScheduleEvent } from "@/lib/scheduleData";
import { toast } from "sonner";

interface ScheduleEventModalProps {
  event: Event | null; // null if still loading or error
  scheduleEvent: ScheduleEvent;
  scheduleTime: string;
  isLoading: boolean;
  hasError: boolean;
  onClose: () => void;
}

export function ScheduleEventModal({
  event,
  scheduleEvent,
  scheduleTime,
  isLoading,
  hasError,
  onClose,
}: ScheduleEventModalProps) {
  const { addToCart, isInCart } = useCart();
  const { sportsCart, addToSportsCart } = useSportsCart();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const isSports = scheduleEvent.type === "sports";
  const inCart = isSports
    ? sportsCart.some((i) => i.eventId === scheduleEvent.eventId)
    : scheduleEvent.eventId
      ? isInCart(scheduleEvent.eventId)
      : false;

  const fallbackEvent: Event = {
    eventId: scheduleEvent.eventId!,
    eventDomain: isSports ? "sports" : "cultural",
    indianName: scheduleEvent.name,
    englishName: scheduleEvent.name,
    slug: scheduleEvent.eventId!,
    category: (scheduleEvent.category as Event["category"]) || "assorted",
    description: "",
    shortDescription: "",
    type: "solo",
    pricingType: "free",
    fee: 0,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
    isAvailable: true,
    tags: [],
    imageUrls: [],
    venue: scheduleEvent.venue,
    eventDate: null,
    eventTime: scheduleTime,
    schedule: scheduleTime,
    rules: [],
    contactName: null,
    contactPhone: null,
  };

  const eventToAdd = event || (hasError ? fallbackEvent : null);
  const isAvailable = event ? event.isAvailable : true; // assume available if loading/error

  const handleAddToCart = () => {
    if (!eventToAdd) return;
    if (!inCart && isAvailable) {
      if (isSports) {
        const result = addToSportsCart(eventToAdd);
        if (result.added) {
          toast.success(`${eventToAdd.indianName} added to sports cart`);
        }
      } else {
        const result = addToCart(eventToAdd);
        if (result.added) {
          toast.success(`${eventToAdd.indianName} added to cart`);
        }
      }
    }
  };

  const renderPrice = () => {
    if (!event) return null;
    if (event.pricingType === "free" || event.fee === 0) {
      return <span className="text-green-600 font-semibold">Free Entry</span>;
    }
    if (event.pricingType === "per_person") {
      return (
        <span className="font-semibold">
          ₹{event.fee}{" "}
          <span className="text-sm font-normal text-zinc-500">per person</span>
        </span>
      );
    }
    return (
      <span className="font-semibold">
        ₹{event.fee}{" "}
        <span className="text-sm font-normal text-zinc-500">
          total for the team
        </span>
      </span>
    );
  };

  const renderTeamSize = () => {
    if (!event) return null;
    if (event.type !== "group" || !event.minTeamSize || !event.maxTeamSize)
      return "Solo";

    if (event.slug === "bgmi-mobile") return "4 players + 1 substitute";
    if (event.slug === "codm-mobile") return "5 players + 1 substitute";

    if (event.minTeamSize === event.maxTeamSize) {
      return `Team of ${event.minTeamSize}`;
    }
    return `${event.minTeamSize} to ${event.maxTeamSize} members`;
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 sm:pt-4 transition-all"
    >
      <div className="bg-white w-full sm:max-w-150 rounded-t-3xl sm:rounded-2xl sm:rounded-t-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="relative w-full h-48 sm:h-64 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6 shrink-0">
            {event?.imageUrls && event.imageUrls.length > 0 ? (
              <Image
                src={event.imageUrls[0]}
                alt={scheduleEvent.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white text-center drop-shadow-md z-10 wrap-break-word line-clamp-3">
                {scheduleEvent.name}
              </h3>
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">
              {scheduleEvent.name}
            </h2>
            {event?.englishName && event.englishName !== scheduleEvent.name && (
              <p className="text-lg text-zinc-500 mb-6 font-medium">
                {event.englishName}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-8">
              {scheduleEvent.category && (
                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800 capitalize">
                  {scheduleEvent.category}
                </span>
              )}
              {event?.isOnline && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Online
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Price
                  </span>
                  {isLoading ? (
                    <div className="h-5 bg-zinc-200 animate-pulse rounded w-1/2 mt-1"></div>
                  ) : (
                    <div className="text-zinc-900">
                      {hasError ? "TBA" : renderPrice()}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Team Size
                  </span>
                  {isLoading ? (
                    <div className="h-5 bg-zinc-200 animate-pulse rounded w-1/3 mt-1"></div>
                  ) : (
                    <div className="text-zinc-900 font-medium">
                      {hasError ? "TBA" : renderTeamSize()}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Schedule
                  </span>
                  <div className="text-zinc-900 font-medium">
                    {scheduleTime}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Venue
                  </span>
                  <div className="text-zinc-900 font-medium">
                    {scheduleEvent.venue}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {isLoading ? (
                <>
                  <section>
                    <h4 className="text-lg font-bold text-zinc-900 mb-3">
                      About this Event
                    </h4>
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-200 animate-pulse rounded w-full"></div>
                      <div className="h-4 bg-zinc-200 animate-pulse rounded w-5/6"></div>
                      <div className="h-4 bg-zinc-200 animate-pulse rounded w-4/6"></div>
                    </div>
                  </section>
                  <section>
                    <h4 className="text-lg font-bold text-zinc-900 mb-3">
                      Rules
                    </h4>
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-200 animate-pulse rounded w-full"></div>
                      <div className="h-4 bg-zinc-200 animate-pulse rounded w-3/4"></div>
                    </div>
                  </section>
                </>
              ) : hasError ? (
                <section>
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                    <p className="font-medium">
                      Event details temporarily unavailable.
                    </p>
                    <p className="text-sm mt-1 opacity-80">
                      You can still add this event to your cart. Check your cart
                      to verify prices later.
                    </p>
                  </div>
                </section>
              ) : (
                <>
                  <section>
                    <h4 className="text-lg font-bold text-zinc-900 mb-3">
                      About this Event
                    </h4>
                    <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                      {event?.description || "Event details coming soon."}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-lg font-bold text-zinc-900 mb-3">
                      Rules
                    </h4>
                    {event?.rules && event.rules.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-zinc-600 pl-1 marker:text-zinc-400">
                        {event.rules.map((rule, idx) => (
                          <li key={idx} className="pl-1 leading-relaxed">
                            {rule}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-zinc-600 italic">
                        Rules will be announced soon.
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-zinc-200 bg-white shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={inCart || !isAvailable || isLoading}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-base ${
              isLoading
                ? "bg-zinc-100 text-zinc-400 cursor-wait border border-zinc-200"
                : !isAvailable
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                  : inCart
                    ? "bg-zinc-100 text-zinc-600 cursor-not-allowed border border-zinc-200"
                    : "bg-black text-white hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
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
                Loading Event...
              </span>
            ) : !isAvailable ? (
              "Registration Closed"
            ) : inCart ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Already in Cart
              </>
            ) : isSports ? (
              "Add to Sports Cart"
            ) : (
              "Add to Cultural Events Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
