import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as admin from "firebase-admin";
import { eventsCatalogue } from "../lib/eventsCatalogue";
import { sportsCatalogue } from "../lib/sportsCatalogue";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const db = admin.firestore();

async function seedEvents() {
  console.log("Starting to seed events...");
  
  const ALL_EVENTS = [...eventsCatalogue, ...sportsCatalogue];
  
  try {
    const eventsRef = db.collection("events");
    
    // Delete existing events
    const snapshot = await eventsRef.get();
    if (!snapshot.empty) {
      console.log(`Deleting ${snapshot.size} existing events...`);
      const deleteBatch = db.batch();
      snapshot.docs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log("Existing events deleted.");
    }

    // Seed new events
    const seedBatch = db.batch();
    ALL_EVENTS.forEach((event, index) => {
      const docRef = eventsRef.doc(event.eventId);
      seedBatch.set(docRef, event);
      console.log(`Seeding ${index + 1}/${ALL_EVENTS.length}: ${event.indianName} (${event.eventDomain})...`);
    });

    await seedBatch.commit();
    console.log(`✅ Seeded ${ALL_EVENTS.length} events (${eventsCatalogue.length} cultural + ${sportsCatalogue.length} sports) successfully!`);
  } catch (error) {
    console.error("Error seeding events:", error);
  } finally {
    process.exit();
  }
}

seedEvents();
