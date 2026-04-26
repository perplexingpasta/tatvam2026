"use client";

import { Event } from "@/types";
import { useCart } from "./CartProvider";

export function EventCard({ event }: { event: Event }) {
  const { addToCart, isInCart, removeFromCart } = useCart();
  const inCart = isInCart(event.eventId);

  return (
    <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{event.name}</h3>
          <div className="flex gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
              {event.type}
            </span>
            <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              ₹{event.fee}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 flex-grow">
        {event.description}
      </p>

      {event.type === "group" && (event.minTeamSize || event.maxTeamSize) && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 font-medium bg-zinc-50 dark:bg-zinc-900 p-2 rounded-md">
          Team Size: {event.minTeamSize}{event.maxTeamSize && event.maxTeamSize !== event.minTeamSize ? ` - ${event.maxTeamSize}` : ''}
        </div>
      )}

      {inCart ? (
        <button
          onClick={() => removeFromCart(event.eventId)}
          className="w-full py-2.5 px-4 rounded-lg font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Added to Cart (Click to Remove)
        </button>
      ) : (
        <button
          onClick={() => addToCart(event)}
          className="w-full py-2.5 px-4 rounded-lg font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
