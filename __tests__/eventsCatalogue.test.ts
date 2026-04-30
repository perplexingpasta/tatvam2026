import { describe, it, expect } from 'vitest';
import { generateTags, buildEvent, eventsCatalogue, RawEvent } from '@/lib/eventsCatalogue';
import { eventSchema } from '@/types';

describe('eventsCatalogue', () => {
  describe('generateTags', () => {
    it('generates correct tags for a solo music event', () => {
      const rawEvent: RawEvent = {
        indianName: "Indian",
        englishName: "English",
        slug: "solo-music",
        type: "solo",
        category: "music",
        fee: 75,
        pricingType: "per_person",
        isOnline: false,
        minTeamSize: null,
        maxTeamSize: null,
      };
      const tags = generateTags(rawEvent);
      expect(tags).toContain("solo");
      expect(tags).toContain("under-100");
      expect(tags).toContain("under-300");
      expect(tags).toContain("performing-arts");
      expect(tags).toContain("music");
      expect(tags).not.toContain("group");
      expect(tags).not.toContain("online");
      expect(tags).not.toContain("free");
      expect(tags).not.toContain("large-team");
      expect(tags).not.toContain("small-team");
    });

    it('generates correct tags for a flagship large-team group event', () => {
      const rawEvent: RawEvent = {
        indianName: "Indian",
        englishName: "English",
        slug: "ahaang",
        type: "group",
        category: "music",
        fee: 200,
        pricingType: "per_person",
        isOnline: false,
        minTeamSize: 6,
        maxTeamSize: 10,
      };
      const tags = generateTags(rawEvent);
      expect(tags).toContain("group");
      expect(tags).toContain("large-team");
      expect(tags).toContain("flagship");
      expect(tags).toContain("performing-arts");
      expect(tags).toContain("music");
      expect(tags).toContain("under-300");
      expect(tags).not.toContain("solo");
      expect(tags).not.toContain("small-team");
    });

    it('generates correct tags for a free event', () => {
      const rawEvent: RawEvent = {
        indianName: "Indian",
        englishName: "English",
        slug: "free-event",
        type: "solo",
        category: "assorted",
        fee: 0,
        pricingType: "free",
        isOnline: false,
        minTeamSize: null,
        maxTeamSize: null,
      };
      const tags = generateTags(rawEvent);
      expect(tags).toContain("free");
      expect(tags).toContain("under-100");
      expect(tags).toContain("under-300");
    });

    it('generates correct tags for a gaming event (bgmi-mobile)', () => {
      const rawEvent: RawEvent = {
        indianName: "Indian",
        englishName: "English",
        slug: "bgmi-mobile",
        type: "solo",
        category: "assorted",
        fee: 150,
        pricingType: "per_person",
        isOnline: true,
        minTeamSize: null,
        maxTeamSize: null,
      };
      const tags = generateTags(rawEvent);
      expect(tags).toContain("gaming");
      expect(tags).toContain("flagship");
      expect(tags).toContain("online");
    });
  });

  describe('buildEvent', () => {
    it('sets eventId equal to slug for all exported events', () => {
      eventsCatalogue.forEach(event => {
        expect(event.eventId).toBe(event.slug);
      });
    });

    it('applies defaults correctly to a raw event with no optional fields', () => {
      const rawEvent: RawEvent = {
        indianName: "Indian",
        englishName: "English",
        slug: "test-event",
        type: "solo",
        category: "assorted",
        fee: 100,
        pricingType: "per_person",
        isOnline: false,
        minTeamSize: null,
        maxTeamSize: null,
      };
      const event = buildEvent(rawEvent);
      expect(event.description).toBe("");
      expect(event.shortDescription).toBe("");
      expect(event.imageUrls).toEqual([]);
      expect(event.rules).toEqual([]);
      expect(event.isAvailable).toBe(true);
      expect(event.venue).toBeNull();
      expect(event.contactName).toBeNull();
      expect(event.contactPhone).toBeNull();
    });
  });

  describe('eventsCatalogue integrity', () => {
    it('ensures all events are valid against the Zod schema', () => {
      eventsCatalogue.forEach(event => {
        const result = eventSchema.safeParse(event);
        if (!result.success) {
          console.error(`Validation failed for event ${event.slug}:`, result.error.message);
        }
        expect(result.success).toBe(true);
      });
    });

    it('ensures no duplicate slugs exist in the catalogue', () => {
      const slugs = eventsCatalogue.map(e => e.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    });
  });
});
