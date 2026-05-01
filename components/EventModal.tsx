"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Event } from "@/types";
import { useCart } from "./CartProvider";
import { toast } from "sonner";

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(event.eventId);
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

  const handleAddToCart = () => {
    if (!inCart && event.isAvailable) {
      const result = addToCart(event);
      if (result.added) {
        toast.success(`${event.indianName} added to cart`);
      }
    }
  };

  const renderPrice = () => {
    if (event.pricingType === "free" || event.fee === 0) {
      return <span className="text-green-600 font-semibold">Free Entry</span>;
    }
    if (event.pricingType === "per_person") {
      return <span className="font-semibold">₹{event.fee} <span className="text-sm font-normal text-zinc-500 ">per person</span></span>;
    }
    return <span className="font-semibold">₹{event.fee} <span className="text-sm font-normal text-zinc-500 ">total for the team</span></span>;
  };

  const renderTeamSize = () => {
    if (event.type !== "group" || !event.minTeamSize || !event.maxTeamSize) return "Solo";
    
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[8px] p-2 sm:p-4 sm:pt-4 transition-all"
    >
      <div 
        className="bg-white w-full sm:max-w-[600px] rounded-t-3xl sm:rounded-2xl sm:rounded-t-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 fade-in duration-200"
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="relative w-full h-48 sm:h-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6 shrink-0">
            {event.imageUrls && event.imageUrls.length > 0 ? (
               <Image src={event.imageUrls[0]} alt={event.indianName} fill className="object-cover" />
            ) : (
               <h3 className="text-3xl sm:text-4xl font-extrabold text-white text-center drop-shadow-md z-10 break-words line-clamp-3">
                 {event.indianName}
               </h3>
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">
              {event.indianName}
            </h2>
            {event.englishName && event.englishName !== event.indianName && (
              <p className="text-lg text-zinc-500 mb-6 font-medium">
                {event.englishName}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800 capitalize">
                {event.category}
              </span>
              {event.isOnline && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ">
                  Online
                </span>
              )}
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800 capitalize">
                {event.type}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-zinc-50 p-5 rounded-2xl border border-zinc-100 ">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Price</span>
                  <div className="text-zinc-900 ">{renderPrice()}</div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Team Size</span>
                  <div className="text-zinc-900 font-medium">{renderTeamSize()}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Schedule</span>
                  <div className="text-zinc-900 font-medium">
                    {event.schedule || (event.eventDate || event.eventTime ? `${event.eventDate || ''} ${event.eventTime || ''}`.trim() : "TBA")}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Venue</span>
                  <div className="text-zinc-900 font-medium">{event.venue || "TBA"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h4 className="text-lg font-bold text-zinc-900 mb-3">About this Event</h4>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                  {event.description || "Event details coming soon."}
                </p>
              </section>
              
              <section>
                <h4 className="text-lg font-bold text-zinc-900 mb-3">Rules</h4>
                {event.rules && event.rules.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-zinc-600 pl-1 marker:text-zinc-400">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="pl-1 leading-relaxed">{rule}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-600 italic">Rules will be announced soon.</p>
                )}
              </section>
              
              {(event.contactName || event.contactPhone) && (
                <section>
                  <h4 className="text-lg font-bold text-zinc-900 mb-3">Contact</h4>
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex flex-col gap-1 text-sm font-medium">
                    {event.contactName && <span className="text-zinc-900 ">{event.contactName}</span>}
                    {event.contactPhone && <a href={`tel:${event.contactPhone}`} className="text-blue-600 hover:underline inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {event.contactPhone}
                    </a>}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-zinc-200 bg-white shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={inCart || !event.isAvailable}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-base ${
              !event.isAvailable
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200 "
                : inCart
                ? "bg-zinc-100 text-zinc-600 cursor-not-allowed border border-zinc-200 "
                : "bg-black text-white hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg"
            }`}
          >
            {!event.isAvailable ? (
              "Registration Closed"
            ) : inCart ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Already in Cart
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
