import { adminDb } from "@/lib/firebaseAdmin";
import { Event } from "@/types";
import dynamic from "next/dynamic";
import Link from "next/link";

const SportsEventsClient = dynamic(() =>
  import("@/components/SportsEventsClient").then((mod) => mod.SportsEventsClient)
);

export const metadata = {
  title: "Sports Events",
};

export const revalidate = 60; // Revalidate every minute if necessary

export default async function SportsEventsPage() {
  const eventsSnapshot = await adminDb.collection("events").where("eventDomain", "==", "sports").get();
  
  const events = eventsSnapshot.docs.map((doc) => {
    const data = doc.data();
    
    return {
      eventId: data.eventId,
      indianName: data.indianName,
      englishName: data.englishName,
      slug: data.slug,
      category: data.category,
      description: data.description,
      shortDescription: data.shortDescription,
      type: data.type,
      pricingType: data.pricingType,
      fee: data.fee,
      minTeamSize: data.minTeamSize ?? null,
      maxTeamSize: data.maxTeamSize ?? null,
      isOnline: data.isOnline ?? false,
      isAvailable: data.isAvailable ?? true,
      tags: data.tags ?? [],
      imageUrls: data.imageUrls ?? [],
      venue: data.venue ?? null,
      eventDate: data.eventDate ?? null,
      eventTime: data.eventTime ?? null,
      schedule: data.schedule ?? null,
      rules: data.rules ?? [],
      contactName: data.contactName ?? null,
      contactPhone: data.contactPhone ?? null,
    } as Event;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <Link href="/events" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-colors">
          Looking for cultural events? <span aria-hidden="true">&rarr;</span> Browse Cultural Events
        </Link>
      </div>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Sports Events</h1>
        <p className="text-lg text-zinc-600 ">
          {process.env.NEXT_PUBLIC_FEST_NAME || "College Fest"} — Sports
        </p>
      </div>

      <SportsEventsClient events={events} />
    </div>
  );
}
