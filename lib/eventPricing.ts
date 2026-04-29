import { Event } from "@/types";

// Returns a display string for the event price
export function formatEventPrice(event: Event): string {
  if (event.pricingType === "free") return "Free";
  if (event.pricingType === "per_person") 
    return `₹${event.fee}/person`;
  if (event.pricingType === "flat_total") 
    return `₹${event.fee} total`;
  return "";
}

// Returns the fee to store in the cart item
// For cart display and payment calculation
export function getCartFee(event: Event): number {
  return event.fee; // always store raw fee, 
  // display logic handles per_person vs flat_total
}

// Returns a human-readable team size string
export function formatTeamSize(event: Event): string | null {
  if (event.type === "solo") return null;
  if (!event.minTeamSize || !event.maxTeamSize) return null;
  if (event.minTeamSize === event.maxTeamSize) 
    return `Team of ${event.minTeamSize}`;
  return `${event.minTeamSize}–${event.maxTeamSize} members`;
}
