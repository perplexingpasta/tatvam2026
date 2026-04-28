import { z } from "zod";

// Merch attribute definition (used in catalogue config)
export interface MerchAttributeDef {
  id: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  required: boolean;
  placeholder?: string;
}

// Merch catalogue item (used in catalogue config)
export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  isAvailable: boolean;
  attributes: MerchAttributeDef[];
}

// One customised unit in the cart/order
export const merchCartUnitSchema = z.object({
  unitId: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  price: z.number(),
  attributes: z.record(z.string(), z.string()),
});
export type MerchCartUnit = z.infer<typeof merchCartUnitSchema>;

// Zod schema for validating units in API request
export const merchUnitInputSchema = z.object({
  itemId: z.string().min(1),
  itemName: z.string().min(1),
  price: z.number().positive(),
  attributes: z.record(z.string(), z.string()),
});

// Full order schema
export const merchOrderSchema = z.object({
  orderId: z.string(),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(10),
  units: z.array(merchCartUnitSchema).min(1),
  totalAmount: z.number().positive(),
  utrNumber: z
    .string()
    .regex(/^[A-Za-z0-9]{12,22}$/, "UTR must be 12-22 alphanumeric characters"),
  paymentScreenshotUrl: z.string().url(),
  submittedAt: z.date(),
  merchSheetsSync: z.object({
    status: z.enum(["pending", "synced", "failed", "dead_letter"]),
    retryCount: z.number(),
    lastAttempt: z.date().nullable(),
    lastError: z.string().nullable(),
  }),
});
export type MerchOrder = z.infer<typeof merchOrderSchema>;
