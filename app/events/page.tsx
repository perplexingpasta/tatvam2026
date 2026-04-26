import { adminDb } from "@/lib/firebaseAdmin";
import { Event } from "@/types";
import { EventCard } from "@/components/EventCard";

export const revalidate = 60; // Revalidate every minute if necessary

export default async function EventsPage() {
  const eventsSnapshot = await adminDb.collection("events").get();
  
  const events = eventsSnapshot.docs.map((doc) => {
    const data = doc.data();
    
    return {
      eventId: data.eventId,
      name: data.name,
      description: data.description,
      type: data.type,
      minTeamSize: data.minTeamSize ?? null,
      maxTeamSize: data.maxTeamSize ?? null,
      fee: data.fee,
      schedule: data.schedule ? data.schedule.toDate() : null,
      venue: data.venue ?? null,
    } as Event;
  });

  const soloEvents = events.filter((e) => e.type === "solo");
  const groupEvents = events.filter((e) => e.type === "group");

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Events</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Browse and add events to your cart. You can register for multiple events at once.
        </p>
      </div>

      <div className="space-y-16">
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold border-b pb-2">Solo Events</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Individual competitions to showcase your skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {soloEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
            {soloEvents.length === 0 && (
              <p className="text-zinc-500 italic col-span-full">No solo events found.</p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold border-b pb-2">Group Events</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Team up with your friends and compete together.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
            {groupEvents.length === 0 && (
              <p className="text-zinc-500 italic col-span-full">No group events found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
