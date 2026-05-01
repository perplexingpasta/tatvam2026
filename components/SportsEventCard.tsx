"use client";

import { Event } from "@/types";
import { useSportsCart } from "./SportsCartProvider";
import { toast } from "sonner";

interface SportsEventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
}

export function SportsEventCard({ event, onViewDetails }: SportsEventCardProps) {
  const { sportsCart, addToSportsCart } = useSportsCart();
  const inCart = sportsCart.some(item => item.eventId === event.eventId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inCart && event.isAvailable) {
      const result = addToSportsCart(event);
      if (result.added) {
        toast.success(`${event.indianName} added to cart`);
      }
    }
  };

  const renderPrice = () => {
    if (event.pricingType === "free" || event.fee === 0) {
      return <span className="text-green-600 font-semibold">Free</span>;
    }
    if (event.pricingType === "per_person") {
      return <span className="font-semibold">₹{event.fee}<span className="text-xs font-normal text-zinc-500">/person</span></span>;
    }
    return <span className="font-semibold">₹{event.fee}<span className="text-xs font-normal text-zinc-500"> total</span></span>;
  };

  const renderTeamSize = () => {
    if (event.type !== "group" || !event.minTeamSize || !event.maxTeamSize) return null;
    if (event.minTeamSize === event.maxTeamSize) {
      return <span>Team of {event.minTeamSize}</span>;
    }
    return <span>{event.minTeamSize}–{event.maxTeamSize} members</span>;
  };

  return (
    <div 
      onClick={() => onViewDetails(event)}
      className="group flex flex-col border border-zinc-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3 gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 leading-tight">
            {event.indianName}
          </h3>
          {event.englishName && event.englishName !== event.indianName && (
            <p className="text-sm text-zinc-500 mt-0.5">
              {event.englishName}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 capitalize">
            {event.category}
          </span>
          {event.isOnline && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ">
              Online
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mb-4">
        {event.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600 ">
            {tag.replace(/-/g, ' ')}
          </span>
        ))}
        {event.tags.length > 3 && (
          <span className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600 ">
            +{event.tags.length - 3}
          </span>
        )}
      </div>

      <div className="mt-auto space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">Price</span>
            {renderPrice()}
          </div>
          {event.type === "group" && (
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500">Team Size</span>
              <span className="font-medium text-zinc-700 ">{renderTeamSize()}</span>
            </div>
          )}
          <div className="flex flex-col col-span-2 sm:col-span-1">
            <span className="text-xs text-zinc-500">Schedule</span>
            <span className="font-medium text-zinc-700 truncate" title={event.schedule || "TBA"}>
              {event.schedule || "TBA"}
            </span>
          </div>
          <div className="flex flex-col col-span-2 sm:col-span-1">
            <span className="text-xs text-zinc-500">Venue</span>
            <span className="font-medium text-zinc-700 truncate" title={event.venue || "TBA"}>
              {event.venue || "TBA"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-zinc-100 ">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(event);
            }}
            className="flex-1 py-2 px-3 rounded-lg font-medium text-sm border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            View Details
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={inCart || !event.isAvailable}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5 ${
              !event.isAvailable
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : inCart
                ? "bg-zinc-100 text-zinc-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-zinc-800 "
            }`}
          >
            {!event.isAvailable ? (
              "Closed"
            ) : inCart ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                In Cart
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
