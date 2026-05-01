export type ScheduleEventType = 
  | "cultural"    // registerable cultural event
  | "sports"      // registerable sports event  
  | "general"     // non-registerable fest event 
                  // (Inauguration, Batch Dance, etc.)

export type ScheduleColor =
  | "green"   // open competitive events
  | "yellow"  // special/flagship events
  | "white"   // general fest events

export interface ScheduleEvent {
  name: string;           // display name shown on card
  venue: string;          // e.g. "JSSCPM Audi"
  type: ScheduleEventType;
  color: ScheduleColor;
  eventId: string | null; // slug from Firestore events 
                          // collection if registerable,
                          // null for general events
  category: string | null; // e.g. "music", "dance", null 
                            // for general
  notes: string | null;   // e.g. "Prelims", "Finals", 
                          // "Online" — shown as small badge
}

export interface ScheduleSlot {
  time: string;           // e.g. "9:00 AM – 11:00 AM"
  timeStart: string;      // 24hr for sorting, e.g. "09:00"
  events: ScheduleEvent[];
}

export interface ScheduleDay {
  id: string;             // "day-zero", "day-one", etc.
  label: string;          // "Day Zero", "Day One", etc.
  date: string;           // e.g. "15 May 2025" 
                          // (fill with placeholder for now)
  slots: ScheduleSlot[];
}

export const SCHEDULE: ScheduleDay[] = [
  {
    id: "day-zero",
    label: "Day Zero",
    date: "14 May 2026",
    slots: [
      {
        time: "2:00 PM – 3:00 PM",
        timeStart: "14:00",
        events: [
          {
            name: "Inauguration",
            venue: "Reception",
            type: "general",
            color: "white",
            eventId: null,
            category: null,
            notes: null
          }
        ]
      },
      {
        time: "3:00 PM – 5:30 PM",
        timeStart: "15:00",
        events: [
          {
            name: "Batch Dance",
            venue: "Vrikshangana",
            type: "general",
            color: "white",
            eventId: null,
            category: null,
            notes: null
          }
        ]
      },
      {
        time: "6:00 PM – 8:30 PM",
        timeStart: "18:00",
        events: [
          {
            name: "Ethnic Walk",
            venue: "JSSMC Audi",
            type: "general",
            color: "white",
            eventId: null,
            category: null,
            notes: null
          },
          {
            name: "Fremitus Performance",
            venue: "JSSMC Audi",
            type: "general",
            color: "white",
            eventId: null,
            category: null,
            notes: null
          }
        ]
      }
    ]
  },
  {
    id: "day-one",
    label: "Day One",
    date: "15 May 2026",
    slots: [
      {
        time: "9:00 AM – 11:00 AM",
        timeStart: "09:00",
        events: [
          {
            name: "Face Painting",
            venue: "SLS Gallery",
            type: "cultural",
            color: "green",
            eventId: "face-painting",
            category: "art",
            notes: null
          },
          {
            name: "Solo Classical Dance",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "green",
            eventId: "natyanjali",
            category: "dance",
            notes: null
          },
          {
            name: "Solo Western Singing",
            venue: "JSSMC Audi",
            type: "cultural",
            color: "green",
            eventId: "solo-western-singing",
            category: "music",
            notes: null
          },
          {
            name: "Mono Act",
            venue: "JSSDCH Audi",
            type: "cultural",
            color: "green",
            eventId: "mono-act",
            category: "drama",
            notes: null
          }
        ]
      },
      {
        time: "11:00 AM – 1:00 PM",
        timeStart: "11:00",
        events: [
          {
            name: "Mela Quiz",
            venue: "Gallery 6, JSSMC",
            type: "cultural",
            color: "white",
            eventId: "mela-quiz",
            category: "quiz",
            notes: null
          },
          {
            name: "Jugalbandi",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "green",
            eventId: "jugalbandi",
            category: "music",
            notes: null
          },
          {
            name: "Relay Painting",
            venue: "SLS Gallery",
            type: "cultural",
            color: "green",
            eventId: "relay-painting",
            category: "art",
            notes: null
          }
        ]
      },
      {
        time: "2:00 PM – 4:00 PM",
        timeStart: "14:00",
        events: [
          {
            name: "Fashion Walk",
            venue: "JSSMC Audi",
            type: "cultural",
            color: "green",
            eventId: "fashion-main",
            category: "assorted",
            notes: null
          }
        ]
      },
      {
        time: "5:00 PM – 8:00 PM",
        timeStart: "17:00",
        events: [
          {
            name: "Escape Room",
            venue: "FMT",
            type: "cultural",
            color: "white",
            eventId: "escape-room",
            category: "assorted",
            notes: null
          }
        ]
      }
    ]
  },
  {
    id: "day-two",
    label: "Day Two",
    date: "16 May 2026",
    slots: [
      {
        time: "9:00 AM – 1:00 PM",
        timeStart: "09:00",
        events: [
          {
            name: "Sapientia",
            venue: "JSSDCH Audi",
            type: "cultural",
            color: "white",
            eventId: "sapientia",
            category: "assorted",
            notes: null
          }
        ]
      },
      {
        time: "9:00 AM – 11:00 AM",
        timeStart: "09:00",
        events: [
          {
            name: "Face Off",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "green",
            eventId: "face-off",
            category: "dance",
            notes: null
          },
          {
            name: "Shipwreck",
            venue: "SLS Audi",
            type: "cultural",
            color: "white",
            eventId: "shipwreck",
            category: "literary",
            notes: null
          }
        ]
      },
      {
        time: "11:00 AM – 1:00 PM",
        timeStart: "11:00",
        events: [
          {
            name: "Debate",
            venue: "JSSMC Audi",
            type: "cultural",
            color: "white",
            eventId: "debate",
            category: "literary",
            notes: "Prelims"
          },
          {
            name: "Reflections",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "green",
            eventId: "reflections",
            category: "dance",
            notes: null
          },
          {
            name: "Duotone",
            venue: "SLS Gallery",
            type: "cultural",
            color: "green",
            eventId: "duotone",
            category: "art",
            notes: null
          }
        ]
      },
      {
        time: "1:00 PM – 2:00 PM",
        timeStart: "13:00",
        events: [
          {
            name: "Debate",
            venue: "JSSMC Audi",
            type: "cultural",
            color: "white",
            eventId: "debate",
            category: "literary",
            notes: "Finals"
          }
        ]
      },
      {
        time: "2:00 PM – 4:00 PM",
        timeStart: "14:00",
        events: [
          {
            name: "Dramathon",
            venue: "JSSDCH Audi",
            type: "cultural",
            color: "white",
            eventId: "dramathon",
            category: "drama",
            notes: null
          },
          {
            name: "General Quiz",
            venue: "Gallery 6, JSSMC",
            type: "cultural",
            color: "white",
            eventId: "general-quiz",
            category: "quiz",
            notes: null
          },
          {
            name: "Solo Non-Classical Dance",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "green",
            eventId: "solo-non-classical-dance",
            category: "dance",
            notes: null
          }
        ]
      },
      {
        time: "5:00 PM – 8:00 PM",
        timeStart: "17:00",
        events: [
          {
            name: "Battle of Bands",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "green",
            eventId: "ahaang",
            category: "music",
            notes: null
          }
        ]
      },
      {
        time: "9:00 AM – 1:00 PM",
        timeStart: "09:00",
        events: [
          {
            name: "Lit Marathon",
            venue: "Gallery 5, JSSMC",
            type: "cultural",
            color: "yellow",
            eventId: "lit-marathon",
            category: "literary",
            notes: null
          }
        ]
      },
      {
        time: "9:00 PM – 4:00 PM",
        timeStart: "21:00",
        events: [
          {
            name: "Escape Room",
            venue: "FMT",
            type: "cultural",
            color: "white",
            eventId: "escape-room",
            category: "assorted",
            notes: null
          }
        ]
      }
    ]
  },
  {
    id: "day-three",
    label: "Day Three",
    date: "17 May 2026",
    slots: [
      {
        time: "9:00 AM – 12:00 PM",
        timeStart: "09:00",
        events: [
          {
            name: "Swar Leela",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "white",
            eventId: "swar-leela",
            category: "music",
            notes: "Classical & Non-Classical"
          }
        ]
      },
      {
        time: "9:00 AM – 11:00 AM",
        timeStart: "09:00",
        events: [
          {
            name: "Streetplay",
            venue: "Vrikshangana",
            type: "cultural",
            color: "green",
            eventId: "streetplay",
            category: "drama",
            notes: null
          },
          {
            name: "Art Attack",
            venue: "SLS Gallery",
            type: "cultural",
            color: "green",
            eventId: "art-attack",
            category: "art",
            notes: null
          },
          {
            name: "Twin Vogue",
            venue: "JSSMC Audi",
            type: "cultural",
            color: "green",
            eventId: "twin-vogue",
            category: "assorted",
            notes: null
          }
        ]
      },
      {
        time: "11:00 AM – 1:00 PM",
        timeStart: "11:00",
        events: [
          {
            name: "JAM",
            venue: "SLS Audi",
            type: "cultural",
            color: "white",
            eventId: "jam",
            category: "literary",
            notes: null
          }
        ]
      },
      {
        time: "2:00 PM – 4:00 PM",
        timeStart: "14:00",
        events: [
          {
            name: "Group Dance",
            venue: "JSSCPM Audi",
            type: "cultural",
            color: "green",
            eventId: "group-dance",
            category: "dance",
            notes: null
          },
          {
            name: "Tote Bag Painting",
            venue: "SLS Gallery",
            type: "cultural",
            color: "green",
            eventId: "tote-bag-painting",
            category: "art",
            notes: null
          }
        ]
      },
      {
        time: "5:00 PM – 8:00 PM",
        timeStart: "17:00",
        events: [
          {
            name: "ProShow",
            venue: "JSSMC Audi",
            type: "general",
            color: "yellow",
            eventId: null,
            category: null,
            notes: null
          }
        ]
      },
      {
        time: "9:00 AM – 1:00 PM",
        timeStart: "09:00",
        events: [
          {
            name: "Lit Marathon",
            venue: "Gallery 5, JSSMC",
            type: "cultural",
            color: "yellow",
            eventId: "lit-marathon",
            category: "literary",
            notes: null
          }
        ]
      },
      {
        time: "9:00 PM – 4:00 PM",
        timeStart: "21:00",
        events: [
          {
            name: "Escape Room",
            venue: "FMT",
            type: "cultural",
            color: "white",
            eventId: "escape-room",
            category: "assorted",
            notes: null
          }
        ]
      }
    ]
  }
];

export function getEventById(eventId: string): ScheduleEvent | null {
  for (const day of SCHEDULE) {
    for (const slot of day.slots) {
      for (const event of slot.events) {
        if (event.eventId === eventId) {
          return event;
        }
      }
    }
  }
  return null;
}
