import { Event } from "../types";

export type RawEvent = Omit<
  Event,
  | "eventId"
  | "description"
  | "shortDescription"
  | "imageUrls"
  | "venue"
  | "eventDate"
  | "eventTime"
  | "schedule"
  | "rules"
  | "contactName"
  | "contactPhone"
  | "isAvailable"
  | "tags"
> & {
  description?: string;
  shortDescription?: string;
  imageUrls?: string[];
  venue?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  schedule?: string | null;
  rules?: string[];
  contactName?: string | null;
  contactPhone?: string | null;
  isAvailable?: boolean;
};

export const generateTags = (event: RawEvent): string[] => {
  const tags = new Set<string>();

  // Always add "solo" or "group" based on type
  if (event.type) tags.add(event.type);

  // Add "online" if isOnline is true
  if (event.isOnline) tags.add("online");

  // Add "free" if pricingType is "free"
  if (event.pricingType === "free") tags.add("free");

  // Add "under-100" if fee < 100
  if (event.fee !== undefined && event.fee < 100) tags.add("under-100");

  // Add "under-300" if fee < 300
  if (event.fee !== undefined && event.fee < 300) tags.add("under-300");

  // Add "large-team" if maxTeamSize >= 6
  if (event.maxTeamSize && event.maxTeamSize >= 6) tags.add("large-team");

  // Add "small-team" if maxTeamSize <= 5 && type is "group"
  if (event.maxTeamSize && event.maxTeamSize <= 5 && event.type === "group")
    tags.add("small-team");

  // Add "flagship"
  const flagshipSlugs = [
    "ahaang",
    "group-dance",
    "streetplay",
    "fashion-main",
    "codm-mobile",
    "bgmi-mobile",
  ];
  if (event.slug && flagshipSlugs.includes(event.slug)) tags.add("flagship");

  // Add "gaming"
  const gamingSlugs = ["fifa-pc", "bgmi-mobile", "codm-mobile"];
  if (event.slug && gamingSlugs.includes(event.slug)) tags.add("gaming");

  // Add "performing-arts"
  if (event.category === "music" || event.category === "dance")
    tags.add("performing-arts");

  // Add "visual-arts"
  if (event.category === "art") tags.add("visual-arts");

  // Add "literary"
  if (event.category === "literary") tags.add("literary");

  // Add "music"
  if (event.category === "music") tags.add("music");

  // Add "dance"
  if (event.category === "dance") tags.add("dance");

  return Array.from(tags);
};

export const buildEvent = (raw: RawEvent): Event => ({
  ...raw,
  eventId: raw.slug,
  description: raw.description ?? "",
  shortDescription: raw.shortDescription ?? "",
  imageUrls: raw.imageUrls ?? [],
  venue: raw.venue ?? null,
  eventDate: raw.eventDate ?? null,
  eventTime: raw.eventTime ?? null,
  schedule: raw.schedule ?? null,
  rules: raw.rules ?? [],
  contactName: raw.contactName ?? null,
  contactPhone: raw.contactPhone ?? null,
  isAvailable: raw.isAvailable ?? true,
  tags: generateTags(raw),
});

const rawEvents: RawEvent[] = [
  // --- MUSIC ---
  {
    indianName: "Swar Leela",
    englishName: "Solo Eastern Singing",
    slug: "swar-leela",
    category: "music",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },

  //   {
  //   indianName: "Swar Leela",
  //   englishName: "Solo Eastern Singing",
  //   slug: "swar-leela",
  //   category: "music",
  //   type: "solo",
  //   pricingType: "per_person",
  //   fee: 75,
  //   // Add these:
  //   description: "A soulful competition for classical and semi-classical eastern vocals.",
  //   imageUrls: ["https://example.com/image1.webp"],
  //   venue: "Main Auditorium",
  //   contactName: "John Doe",
  //   contactPhone: "9876543210"
  // },

  // to create more events, just add an object but make sure to keep the event-id field unique
  // run this after making all changes so that firestore is also updated accordingly: npx tsx scripts/seedEvents.ts
  // Always use WebP image URLs for the imageUrls parameter to ensure the fastest page load times, as we discussed earlier!

  {
    indianName: "Solo Western Singing",
    englishName: "Solo Western Singing",
    slug: "solo-western-singing",
    category: "music",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "Jugalbandi",
    englishName: "Duet Vocals",
    slug: "jugalbandi",
    category: "music",
    type: "group",
    pricingType: "flat_total",
    fee: 150,
    minTeamSize: 2,
    maxTeamSize: 2,
    isOnline: false,
  },
  {
    indianName: "Ahaang",
    englishName: "Battle of Bands",
    slug: "ahaang",
    category: "music",
    type: "group",
    pricingType: "flat_total",
    fee: 1199,
    minTeamSize: 3,
    maxTeamSize: 12,
    isOnline: false,
  },
  {
    indianName: "Tarang",
    englishName: "Instrumental Solo",
    slug: "tarang",
    category: "music",
    type: "solo",
    pricingType: "free",
    fee: 0,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: true,
  },

  // --- DANCE ---
  {
    indianName: "Natyanjali",
    englishName: "Solo Classical Dance",
    slug: "natyanjali",
    category: "dance",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "Solo Non-Classical Dance",
    englishName: "Solo Non-Classical Dance",
    slug: "solo-non-classical-dance",
    category: "dance",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "Face Off",
    englishName: "Face Off",
    slug: "face-off",
    category: "dance",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "Reflections",
    englishName: "Reflections",
    slug: "reflections",
    category: "dance",
    type: "group",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: 2,
    maxTeamSize: 10,
    isOnline: false,
  },
  {
    indianName: "Group Dance",
    englishName: "Group Dance",
    slug: "group-dance",
    category: "dance",
    type: "group",
    pricingType: "flat_total",
    fee: 799,
    minTeamSize: 6,
    maxTeamSize: 16,
    isOnline: false,
  },

  // --- ASSORTED ---
  {
    indianName: "Sapientia",
    englishName: "Sapientia",
    slug: "sapientia",
    category: "assorted",
    type: "group",
    pricingType: "flat_total",
    fee: 150,
    minTeamSize: 2,
    maxTeamSize: 2,
    isOnline: false,
  },
  {
    indianName: "Escape Room",
    englishName: "Escape Room",
    slug: "escape-room",
    category: "assorted",
    type: "group",
    pricingType: "per_person",
    fee: 99,
    minTeamSize: 2,
    maxTeamSize: 6,
    isOnline: false,
  },
  {
    indianName: "Fashion — Main Event",
    englishName: "Fashion Main Event",
    slug: "fashion-main",
    category: "assorted",
    type: "group",
    pricingType: "flat_total",
    fee: 1299,
    minTeamSize: 12,
    maxTeamSize: 20,
    isOnline: false,
  },
  {
    indianName: "Twin Vogue",
    englishName: "Twin Vogue",
    slug: "twin-vogue",
    category: "assorted",
    type: "group",
    pricingType: "flat_total",
    fee: 199,
    minTeamSize: 2,
    maxTeamSize: 2,
    isOnline: false,
  },
  {
    indianName: "FIFA (PC)",
    englishName: "FIFA PC Gaming",
    slug: "fifa-pc",
    category: "assorted",
    type: "solo",
    pricingType: "per_person",
    fee: 150,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "BGMI (Mobile)",
    englishName: "BGMI Mobile Gaming",
    slug: "bgmi-mobile",
    category: "assorted",
    type: "group",
    pricingType: "flat_total",
    fee: 399,
    minTeamSize: 4,
    maxTeamSize: 5,
    isOnline: false,
  },
  {
    indianName: "CODM (Mobile)",
    englishName: "CODM Mobile Gaming",
    slug: "codm-mobile",
    category: "assorted",
    type: "group",
    pricingType: "flat_total",
    fee: 499,
    minTeamSize: 5,
    maxTeamSize: 6,
    isOnline: false,
  },

  // --- QUIZ ---
  {
    indianName: "General Quiz",
    englishName: "General Quiz",
    slug: "general-quiz",
    category: "quiz",
    type: "group",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: 1,
    maxTeamSize: 3,
    isOnline: false,
  },
  {
    indianName: "Mela Quiz",
    englishName: "Mela Quiz",
    slug: "mela-quiz",
    category: "quiz",
    type: "group",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: 1,
    maxTeamSize: 2,
    isOnline: false,
  },

  // --- DRAMA ---
  {
    indianName: "Streetplay",
    englishName: "Street Play",
    slug: "streetplay",
    category: "drama",
    type: "group",
    pricingType: "flat_total",
    fee: 799,
    minTeamSize: 8,
    maxTeamSize: 12,
    isOnline: false,
  },
  {
    indianName: "Mono Act",
    englishName: "Mono Act",
    slug: "mono-act",
    category: "drama",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "Dramathon",
    englishName: "Dramathon",
    slug: "dramathon",
    category: "drama",
    type: "group",
    pricingType: "flat_total",
    fee: 199,
    minTeamSize: 2,
    maxTeamSize: 4,
    isOnline: false,
  },
  {
    indianName: "Mad Ads",
    englishName: "Mad Ads",
    slug: "mad-ads",
    category: "drama",
    type: "group",
    pricingType: "flat_total",
    fee: 150,
    minTeamSize: 3,
    maxTeamSize: 5,
    isOnline: true,
  },

  // --- ART ---
  {
    indianName: "Art Attack",
    englishName: "Art Attack",
    slug: "art-attack",
    category: "art",
    type: "group",
    pricingType: "flat_total",
    fee: 299,
    minTeamSize: 3,
    maxTeamSize: 6,
    isOnline: false,
  },
  {
    indianName: "Tote Bag Painting",
    englishName: "Tote Bag Painting",
    slug: "tote-bag-painting",
    category: "art",
    type: "group",
    pricingType: "flat_total",
    fee: 150,
    minTeamSize: 2,
    maxTeamSize: 2,
    isOnline: false,
  },
  {
    indianName: "Face Painting",
    englishName: "Face Painting",
    slug: "face-painting",
    category: "art",
    type: "solo",
    pricingType: "per_person",
    fee: 99,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "Relay Painting",
    englishName: "Relay Painting",
    slug: "relay-painting",
    category: "art",
    type: "group",
    pricingType: "flat_total",
    fee: 299,
    minTeamSize: 4,
    maxTeamSize: 4,
    isOnline: false,
  },
  {
    indianName: "Duotone",
    englishName: "Duotone",
    slug: "duotone",
    category: "art",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },

  // --- LITERARY ---
  {
    indianName: "Shipwreck",
    englishName: "Shipwreck",
    slug: "shipwreck",
    category: "literary",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "JAM",
    englishName: "Just A Minute",
    slug: "jam",
    category: "literary",
    type: "solo",
    pricingType: "per_person",
    fee: 75,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: false,
  },
  {
    indianName: "Debate",
    englishName: "Debate",
    slug: "debate",
    category: "literary",
    type: "group",
    pricingType: "flat_total",
    fee: 150,
    minTeamSize: 2,
    maxTeamSize: 2,
    isOnline: false,
  },
  {
    indianName: "Lit Marathon",
    englishName: "Literary Marathon",
    slug: "lit-marathon",
    category: "literary",
    type: "group",
    pricingType: "flat_total",
    fee: 299,
    minTeamSize: 4,
    maxTeamSize: 4,
    isOnline: false,
  },
  {
    indianName: "Poetry",
    englishName: "Poetry",
    slug: "poetry",
    category: "literary",
    type: "solo",
    pricingType: "free",
    fee: 0,
    minTeamSize: null,
    maxTeamSize: null,
    isOnline: true,
  },
];

export const eventsCatalogue: Event[] = rawEvents.map(buildEvent);
