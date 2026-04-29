// types/index.ts
import { z } from "zod";

export const delegateTierSchema = z.enum(["tier1", "tier2", "tier3"]);

export const paymentStatusSchema = z.enum(["pending_verification", "verified", "rejected"]);

export const sheetsSyncSchema = z.object({
  status: z.enum(["pending", "synced", "failed"]),
  retryCount: z.number(),
  lastAttempt: z.date().nullable(), // Will be converted to/from Firestore Timestamp
  lastError: z.string().nullable(),
});

export const delegateSchema = z.object({
  delegateId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  collegeName: z.string(),
  isJSSMC: z.boolean(),
  collegeIdNumber: z.string().min(1, "College ID Number is required"),
  collegeIdImageUrl: z.string().url(),
  delegateTier: delegateTierSchema,
  tierPrice: z.number(),
  teamId: z.string().nullable(),
  paymentScreenshotUrl: z.string().url(),
  utrNumber: z.string().regex(/^[A-Za-z0-9]{12,22}$/, "UTR Number must be 12-22 alphanumeric characters"),
  paymentStatus: paymentStatusSchema,
  registeredEventIds: z.array(z.string()),
  createdAt: z.date(), // Timestamp in Firestore
  sheetsSync: sheetsSyncSchema,
});

export type Delegate = z.infer<typeof delegateSchema>;

export const teamSchema = z.object({
  teamId: z.string(),
  teamName: z.string().min(1, "Team Name is required"),
  memberDelegateIds: z.array(z.string()),
  leadDelegateId: z.string(),
  createdAt: z.date(),
});

export type Team = z.infer<typeof teamSchema>;

export const eventTypeSchema = z.enum(["solo", "group"]);

export const cartItemSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  eventType: eventTypeSchema,
  participantDelegateIds: z.array(z.string()),
  teamId: z.string().nullable(),
  eventFee: z.number(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const eventRegistrationSchema = z.object({
  registrationId: z.string(),
  cartItems: z.array(cartItemSchema),
  totalAmount: z.number(),
  paymentScreenshotUrl: z.string().url(),
  utrNumber: z.string().regex(/^[A-Za-z0-9]{12,22}$/, "UTR Number must be 12-22 alphanumeric characters"),
  paymentStatus: paymentStatusSchema,
  submittedAt: z.date(),
  sheetsSync: sheetsSyncSchema,
});

export type EventRegistration = z.infer<typeof eventRegistrationSchema>;

export type EventCategory =
  | "music"
  | "dance"
  | "assorted"
  | "quiz"
  | "drama"
  | "art"
  | "literary";

export type PricingType = "per_person" | "flat_total" | "free";

export type EventTag =
  | "solo"
  | "group"
  | "online"
  | "large-team"      // teams of 6+
  | "small-team"      // teams of 2-5
  | "free"
  | "under-100"       // fee < ₹100 per person or total
  | "under-300"       // fee < ₹300
  | "flagship"        // major events (battle of bands, group 
                      // dance, street play, fashion main)
  | "gaming"
  | "performing-arts"
  | "visual-arts"
  | "literary"
  | "music"
  | "dance";

export const eventSchema = z.object({
  eventId: z.string(),
  indianName: z.string(),        // e.g. "Swar Leela"
  englishName: z.string(),       // e.g. "Solo Eastern Singing"
  slug: z.string(),              // url-safe, e.g. "swar-leela"
  category: z.enum([
    "music", "dance", "assorted", "quiz", 
    "drama", "art", "literary"
  ]),
  description: z.string(),       // full description, can be 
                                 // empty string for now
  shortDescription: z.string(), // shown on card, 1-2 sentences
  type: z.enum(["solo", "group"]),
  pricingType: z.enum(["per_person", "flat_total", "free"]),
  fee: z.number(),               // 0 if free. Per person if 
                                 // per_person, total if flat_total
  minTeamSize: z.number().nullable(),
  maxTeamSize: z.number().nullable(),
  isOnline: z.boolean(),
  isAvailable: z.boolean(),      // false = registration closed
  tags: z.array(z.string()),
  imageUrls: z.array(z.string()), // empty array for now
  venue: z.string().nullable(),
  eventDate: z.string().nullable(),  // ISO date string or null
  eventTime: z.string().nullable(),  // e.g. "10:00 AM" or null
  schedule: z.string().nullable(),   // combined display string
                                     // e.g. "Day 1, 10:00 AM"
  rules: z.array(z.string()),        // empty array for now
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
});

export type Event = z.infer<typeof eventSchema>;

export const sheetsRetryQueueSchema = z.object({
  type: z.enum(["delegate", "eventRegistration"]),
  referenceId: z.string(),
  payload: z.any(),
  retryCount: z.number(),
  nextRetryAt: z.date(),
  lastError: z.string(),
  createdAt: z.date(),
});

export type SheetsRetryQueue = z.infer<typeof sheetsRetryQueueSchema>;
