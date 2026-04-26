import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
// This requires the FIREBASE_* env variables to be set in the environment where this runs
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

const sampleEvents = [
  {
    eventId: "E_CODE_01",
    name: "Hackathon",
    description: "A 24-hour coding marathon to build innovative solutions.",
    type: "group",
    minTeamSize: 2,
    maxTeamSize: 4,
    fee: 1000,
    schedule: admin.firestore.Timestamp.fromDate(
      new Date("2024-05-15T09:00:00Z"),
    ),
    venue: "Main Auditorium",
  },
  {
    eventId: "E_DESIGN_01",
    name: "UI/UX Design Challenge",
    description:
      "Design a user-friendly interface for a given problem statement.",
    type: "solo",
    minTeamSize: null,
    maxTeamSize: null,
    fee: 300,
    schedule: admin.firestore.Timestamp.fromDate(
      new Date("2024-05-16T10:00:00Z"),
    ),
    venue: "Design Lab 1",
  },
  {
    eventId: "E_GAMING_01",
    name: "Valorant Tournament",
    description: "5v5 tactical shooter tournament.",
    type: "group",
    minTeamSize: 5,
    maxTeamSize: 5,
    fee: 1500,
    schedule: admin.firestore.Timestamp.fromDate(
      new Date("2024-05-17T09:00:00Z"),
    ),
    venue: "Gaming Arena",
  },
];

async function seedEvents() {
  console.log("Starting to seed events...");
  const batch = db.batch();

  sampleEvents.forEach((event) => {
    const docRef = db.collection("events").doc(event.eventId);
    batch.set(docRef, event);
  });

  try {
    await batch.commit();
    console.log("Successfully seeded events!");
  } catch (error) {
    console.error("Error seeding events:", error);
  }
}

seedEvents();
