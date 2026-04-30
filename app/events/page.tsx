import { adminDb } from "@/lib/firebaseAdmin";
import { Event } from "@/types";
import { EventsClient } from "@/components/EventsClient";

export const metadata = {
  title: "Events",
};

export const revalidate = 60; // Revalidate every minute if necessary

export default async function EventsPage() {
  const eventsSnapshot = await adminDb.collection("events").get();
  
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
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Events</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Fest Name — {process.env.NEXT_PUBLIC_FEST_NAME || "College Fest"}
        </p>
      </div>

      <EventsClient events={events} />
    </div>
  );
}
