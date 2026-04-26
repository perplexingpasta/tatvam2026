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
  yearOfStudy: z.string(),
  collegeIdNumber: z.string().min(1, "College ID Number is required"),
  collegeIdImageUrl: z.string().url(),
  delegateTier: delegateTierSchema,
  tierPrice: z.number(),
  teamId: z.string().nullable(),
  paymentScreenshotUrl: z.string().url(),
  utrNumber: z.string().regex(/^\d{12,22}$/, "UTR Number must be between 12 and 22 digits"),
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
  utrNumber: z.string().regex(/^\d{12,22}$/, "UTR Number must be between 12 and 22 digits"),
  paymentStatus: paymentStatusSchema,
  submittedAt: z.date(),
  sheetsSync: sheetsSyncSchema,
});

export type EventRegistration = z.infer<typeof eventRegistrationSchema>;

export const eventSchema = z.object({
  eventId: z.string(),
  name: z.string(),
  description: z.string(),
  type: eventTypeSchema,
  minTeamSize: z.number().nullable(),
  maxTeamSize: z.number().nullable(),
  fee: z.number(),
  schedule: z.date().nullable(),
  venue: z.string().nullable(),
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
