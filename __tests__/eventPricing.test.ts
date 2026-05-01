import { describe, it, expect } from 'vitest';
import { formatEventPrice, getCartFee, formatTeamSize } from '@/lib/eventPricing';
import { Event } from '@/types';

function createDummyEvent(overrides: Partial<Event>): Event {
  return {
    eventId: "dummy",
    eventDomain: "cultural",
    indianName: "Dummy",
    englishName: "Dummy",
    slug: "dummy",
    category: "assorted",
    description: "",
    shortDescription: "",
    type: "solo",
    pricingType: "per_person",
    fee: 0,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
    isAvailable: true,
    tags: [],
    imageUrls: [],
    venue: null,
    eventDate: null,
    eventTime: null,
    schedule: null,
    rules: [],
    contactName: null,
    contactPhone: null,
    ...overrides,
  };
}

describe('eventPricing', () => {
  describe('formatEventPrice', () => {
    it('formats per_person correctly', () => {
      const event = createDummyEvent({ pricingType: "per_person", fee: 75 });
      expect(formatEventPrice(event)).toBe("₹75/person");
    });

    it('formats flat_total correctly', () => {
      const event = createDummyEvent({ pricingType: "flat_total", fee: 500 });
      expect(formatEventPrice(event)).toBe("₹500 total");
    });

    it('formats free correctly', () => {
      const event = createDummyEvent({ pricingType: "free", fee: 0 });
      expect(formatEventPrice(event)).toBe("Free");
    });
  });

  describe('getCartFee', () => {
    it('returns event.fee unchanged for all pricing types', () => {
      expect(getCartFee(createDummyEvent({ pricingType: "per_person", fee: 75 }))).toBe(75);
      expect(getCartFee(createDummyEvent({ pricingType: "flat_total", fee: 500 }))).toBe(500);
      expect(getCartFee(createDummyEvent({ pricingType: "free", fee: 0 }))).toBe(0);
    });
  });

  describe('formatTeamSize', () => {
    it('returns null for solo events', () => {
      const event = createDummyEvent({ type: "solo", minTeamSize: 1, maxTeamSize: 1 });
      expect(formatTeamSize(event)).toBeNull();
    });

    it('returns range correctly', () => {
      const event = createDummyEvent({ type: "group", minTeamSize: 3, maxTeamSize: 5 });
      expect(formatTeamSize(event)).toBe("3–5 members");
    });

    it('returns exact team size correctly', () => {
      const event = createDummyEvent({ type: "group", minTeamSize: 4, maxTeamSize: 4 });
      expect(formatTeamSize(event)).toBe("Team of 4");
    });

    it('returns null if team sizes are null for a group event', () => {
      const event = createDummyEvent({ type: "group", minTeamSize: null, maxTeamSize: null });
      expect(formatTeamSize(event)).toBeNull();
    });
  });
});
