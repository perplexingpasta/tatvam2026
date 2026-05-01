"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Event } from "@/types";
import { SportsEventCard } from "./SportsEventCard";
import dynamic from "next/dynamic";

const SportsEventModal = dynamic(() =>
  import("./SportsEventModal").then((mod) => mod.SportsEventModal),
);

const TAGS = [
  "All",
  "Solo",
  "Group",
  "Free",
  "Under ₹300",
  "Large Team",
  "Small Team",
  "Flagship",
];

const getTagSlug = (tagName: string) => {
  if (tagName === "All") return "all";
  if (tagName === "Under ₹300") return "under-300";
  return tagName.toLowerCase().replace(/\s+/g, "-");
};

export function SportsEventsClient({ events }: { events: Event[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        !debouncedQuery || 
        event.indianName.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
        event.englishName.toLowerCase().includes(debouncedQuery.toLowerCase());
      
      let matchesTag = true;
      if (activeTag !== "All") {
        const tagSlug = getTagSlug(activeTag);
        matchesTag = event.tags.includes(tagSlug);
      }

      return matchesSearch && matchesTag;
    });
  }, [events, debouncedQuery, activeTag]);

  const isFilterActive = debouncedQuery.length > 0 || activeTag !== "All";

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-12 py-3.5 border border-zinc-200 rounded-xl leading-5 bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors sm:text-base shadow-sm"
            placeholder="Search by sport name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {debouncedQuery && (
          <p className="text-sm font-medium text-zinc-600 px-1">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'sport' : 'sports'} found
          </p>
        )}

        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide gap-2 mask-edges">
          {TAGS.map(tag => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 "
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {isFilterActive ? (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Search Results</h2>
          </div>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <SportsEventCard key={event.eventId} event={event} onViewDetails={setSelectedEvent} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200 ">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">No sports found</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                No sports found matching your criteria. Try a different search term or clear filters.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveTag("All"); }}
                className="mt-6 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-12">
          <section className="scroll-mt-24">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200 group">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span>🏆</span>
                <span>Sports</span>
                <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                  {filteredEvents.length}
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 origin-top block opacity-100 h-auto">
              {filteredEvents.map(event => (
                <SportsEventCard key={event.eventId} event={event} onViewDetails={setSelectedEvent} />
              ))}
            </div>
          </section>
        </div>
      )}

      {selectedEvent && (
        <SportsEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
