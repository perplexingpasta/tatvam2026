"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SCHEDULE, ScheduleEvent } from "@/lib/scheduleData";
import { ScheduleEventModal } from "@/components/ScheduleEventModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/types";

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState<string>(() => {
    // Check current day on mount
    if (typeof window === "undefined") return "day-zero"; // SSR fallback

    const today = new Date();
    const active = SCHEDULE.find((d) => {
      const dDate = new Date(d.date);
      return (
        dDate.getFullYear() === today.getFullYear() &&
        dDate.getMonth() === today.getMonth() &&
        dDate.getDate() === today.getDate()
      );
    });
    return active ? active.id : "day-zero";
  });
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedScheduleEvent, setSelectedScheduleEvent] =
    useState<ScheduleEvent | null>(null);
  const [selectedScheduleTime, setSelectedScheduleTime] = useState<
    string | null
  >(null);
  const [now, setNow] = useState<Date | null>(() => {
    if (typeof window === "undefined") return null;
    return new Date();
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const fetchedEvents = eventsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          eventId: doc.id,
        })) as Event[];
        setAllEvents(fetchedEvents);
        setEventsError(false);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEventsError(true);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const openModal = (scheduleEvent: ScheduleEvent, scheduleTime: string) => {
    if (scheduleEvent.type === "general" || !scheduleEvent.eventId) return;
    setSelectedEventId(scheduleEvent.eventId);
    setSelectedScheduleEvent(scheduleEvent);
    setSelectedScheduleTime(scheduleTime);
  };

  const closeModal = () => {
    setSelectedEventId(null);
    setSelectedScheduleEvent(null);
    setSelectedScheduleTime(null);
  };

  const currentDay =
    SCHEDULE.find((d) => d.id === activeDay) ||
    SCHEDULE.find((d) => d.id === "day-zero") ||
    SCHEDULE[0];

  const groupedSlots = React.useMemo(() => {
    const slotsByTime: Record<string, (typeof currentDay.slots)[0]> = {};
    currentDay.slots.forEach((slot) => {
      if (!slotsByTime[slot.timeStart]) {
        slotsByTime[slot.timeStart] = { ...slot, events: [...slot.events] };
      } else {
        slotsByTime[slot.timeStart].events.push(...slot.events);
      }
    });
    return Object.values(slotsByTime).sort((a, b) =>
      a.timeStart.localeCompare(b.timeStart),
    );
  }, [currentDay]);

  const isSlotNow = (
    slotTimeStart: string,
    nextSlotTimeStart: string | null,
    dayDateStr: string,
  ) => {
    if (!now) return false;
    const dayDate = new Date(dayDateStr);
    if (
      now.getFullYear() === dayDate.getFullYear() &&
      now.getMonth() === dayDate.getMonth() &&
      now.getDate() === dayDate.getDate()
    ) {
      const currentHrs = now.getHours();
      const currentMins = now.getMinutes();
      const currentStr = `${currentHrs.toString().padStart(2, "0")}:${currentMins.toString().padStart(2, "0")}`;

      if (nextSlotTimeStart) {
        return currentStr >= slotTimeStart && currentStr < nextSlotTimeStart;
      } else {
        return currentStr >= slotTimeStart && currentStr <= "23:59";
      }
    }
    return false;
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "music":
        return "🎵";
      case "dance":
        return "💃";
      case "drama":
        return "🎬";
      case "art":
        return "🎨";
      case "quiz":
        return "🧠";
      case "literary":
        return "📚";
      case "assorted":
        return "🎭";
      case "sports":
        return "🏆";
      default:
        return "⭐";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-12 pb-6 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">
          Event Schedule
        </h1>
        <p className="text-zinc-500 font-medium">
          {process.env.NEXT_PUBLIC_FEST_NAME || "Tatvam 2026"}
        </p>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 px-4 pb-6 text-xs font-semibold text-zinc-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-50 border border-green-200"></div>
          <span>Competitive Event</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-200"></div>
          <span>Special Event</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-50 border border-zinc-200"></div>
          <span>General Event</span>
        </div>
      </div>

      {/* Sticky Tab Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex w-max min-w-full sm:justify-center p-2">
            {SCHEDULE.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`px-5 py-2.5 rounded-full flex flex-col items-center min-w-25 transition-all duration-200 ${
                  activeDay === day.id
                    ? "bg-zinc-900 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span className="font-bold text-sm whitespace-nowrap">
                  {day.label}
                </span>
                <span
                  className={`text-[10px] mt-0.5 ${activeDay === day.id ? "text-zinc-300" : "text-zinc-400"}`}
                >
                  {day.date}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="max-w-3xl mx-auto px-4 py-8 pb-12 overflow-hidden">
        <div className="relative">
          {/* Vertical Connector Line */}
          <div className="absolute left-18 sm:left-22 top-4 bottom-4 w-px bg-zinc-200"></div>

          <div
            key={activeDay}
            className="space-y-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out"
          >
            {groupedSlots.map((slot, sIdx) => {
              const parts = slot.time.split(" – ");
              const startTime = parts[0];
              const endTime = parts.length > 1 ? parts[1] : "";

              const nextSlot = groupedSlots[sIdx + 1];
              const isNow = isSlotNow(
                slot.timeStart,
                nextSlot?.timeStart || null,
                currentDay.date,
              );

              return (
                <div key={sIdx} className="flex group">
                  {/* Time column */}
                  <div className="w-16 sm:w-20 shrink-0 text-right pr-4 pt-1 pb-4 relative z-10 flex flex-col">
                    {isNow && (
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1 animate-pulse flex items-center justify-end gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>{" "}
                        Now
                      </span>
                    )}
                    <span
                      className={`text-xs sm:text-sm font-bold ${isNow ? "text-green-700" : "text-zinc-900"}`}
                    >
                      {startTime}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-zinc-500">
                      {endTime ? `– ${endTime}` : ""}
                    </span>
                  </div>

                  {/* Dot */}
                  <div
                    className={`relative z-10 shrink-0 w-4 h-4 rounded-full border-[3px] border-white ring-1 mt-1.5 mr-4 transition-colors shadow-sm ${isNow ? "bg-green-500 ring-green-200" : "bg-zinc-300 ring-zinc-200 group-hover:bg-zinc-500"}`}
                  ></div>

                  {/* Events column */}
                  <div className="flex-1 space-y-3 pb-2 pt-0.5 min-w-0">
                    {slot.events.map((event, eIdx) => {
                      const bgClass =
                        event.color === "green"
                          ? "bg-green-50/60 hover:bg-green-50 border-green-200"
                          : event.color === "yellow"
                            ? "bg-amber-50/60 hover:bg-amber-50 border-amber-200"
                            : "bg-white hover:bg-zinc-50 border-zinc-200";
                      const borderLeftColor =
                        event.color === "green"
                          ? "border-l-green-400"
                          : event.color === "yellow"
                            ? "border-l-amber-400"
                            : "border-l-zinc-300";
                      const isClickable = event.type !== "general";

                      return (
                        <div
                          key={eIdx}
                          onClick={() =>
                            isClickable && openModal(event, slot.time)
                          }
                          className={`
                            relative rounded-xl border ${borderLeftColor} border-l-4 ${bgClass} 
                            p-4 shadow-sm transition-all
                            ${isClickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]" : ""}
                          `}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-zinc-900 text-base sm:text-lg leading-tight mb-1 truncate">
                                {event.name}
                              </h3>
                              <div className="flex items-center text-xs font-medium text-zinc-500">
                                <span className="flex items-center gap-1 truncate">
                                  <svg
                                    className="w-3.5 h-3.5 shrink-0"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  <span className="truncate">
                                    {event.venue}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div
                              className="text-xl shrink-0 opacity-80"
                              title={event.category || "General"}
                            >
                              {getCategoryIcon(event.category)}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                            <div>
                              {event.notes && (
                                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600 border border-zinc-200 shadow-sm">
                                  {event.notes}
                                </span>
                              )}
                            </div>
                            {isClickable && (
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-0.5 group-hover/card:text-blue-700 shrink-0">
                                Register{" "}
                                <svg
                                  className="w-3 h-3"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cross-links */}
      <div className="max-w-3xl mx-auto px-4 pb-24 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/events"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl transition-colors"
        >
          Browse All Cultural Events{" "}
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Link>
        <Link
          href="/sports"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl transition-colors"
        >
          Browse Sports Events{" "}
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Link>
      </div>

      {/* Modal */}
      {selectedEventId && selectedScheduleEvent && selectedScheduleTime && (
        <ScheduleEventModal
          event={allEvents.find((e) => e.eventId === selectedEventId) || null}
          scheduleEvent={selectedScheduleEvent}
          scheduleTime={selectedScheduleTime}
          isLoading={eventsLoading}
          hasError={eventsError}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
