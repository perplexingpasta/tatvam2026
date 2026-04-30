import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

interface FirestoreTimestamp {
  toDate: () => Date;
}

interface CartItem {
  eventId: string;
  eventName?: string;
  eventType?: "solo" | "group";
  participantDelegateIds?: string[];
  teamId?: string | null;
  eventFee?: number;
}

interface DelegateData {
  delegateId: string;
  name: string;
  email: string;
  collegeName: string;
  delegateTier: string;
  teamId: string | null;
  isJSSMC: boolean;
  paymentStatus: string;
  registeredEventIds: string[];
  createdAt: string; // we'll convert it early
}

interface TeamData {
  teamId: string;
  teamName: string;
  leadDelegateId: string;
  memberDelegateIds: string[];
}

interface EventData {
  name?: string;
  indianName?: string;
  englishName?: string;
  description?: string;
  category?: string;
  type?: "solo" | "group";
  venue?: string | null;
  schedule?: FirestoreTimestamp | string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  fee?: number;
  pricingType?: string;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || !query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_query",
          message: "Please enter a delegate ID, team ID, or email address.",
        },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    let lookupType: "email" | "delegate" | "team" | null = null;

    if (trimmedQuery.includes("@")) {
      lookupType = "email";
    } else if (/^[A-Z]{3}-\d{5}-[A-Z0-9]{5}$/.test(trimmedQuery)) {
      lookupType = "delegate";
    } else if (/^[A-Z]{3}-[A-Z0-9]{7}$/.test(trimmedQuery)) {
      lookupType = "team";
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_input",
          message: "Please enter a valid email address, delegate ID, or team ID.",
        },
        { status: 400 }
      );
    }

    let mainDelegateData: DelegateData | null = null;
    let teamDocData: TeamData | null = null;
    const teamMembers: DelegateData[] = [];

    const mapToDelegateData = (id: string, data: FirebaseFirestore.DocumentData): DelegateData => ({
      delegateId: id,
      name: data.name || "",
      email: data.email || "",
      collegeName: data.collegeName || "",
      delegateTier: data.delegateTier || "",
      teamId: data.teamId || null,
      isJSSMC: !!data.isJSSMC,
      paymentStatus: data.paymentStatus || "pending_verification",
      registeredEventIds: data.registeredEventIds || [],
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
    });

    const mapToTeamData = (id: string, data: FirebaseFirestore.DocumentData): TeamData => ({
      teamId: id,
      teamName: data.teamName || "",
      leadDelegateId: data.leadDelegateId || "",
      memberDelegateIds: data.memberDelegateIds || [],
    });

    // 1. Fetch main entity
    if (lookupType === "email") {
      const snapshot = await adminDb
        .collection("delegates")
        .where("email", "==", trimmedQuery)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          {
            success: false,
            error: "not_found_email",
            message: "No delegate found with this email address.",
          },
          { status: 404 }
        );
      }
      mainDelegateData = mapToDelegateData(snapshot.docs[0].id, snapshot.docs[0].data());
    } else if (lookupType === "delegate") {
      const doc = await adminDb.collection("delegates").doc(trimmedQuery).get();
      if (!doc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: "not_found_delegate",
            message: `No delegate found with ID ${trimmedQuery}.`,
          },
          { status: 404 }
        );
      }
      const data = doc.data();
      if (data) {
          mainDelegateData = mapToDelegateData(doc.id, data);
      }
    } else if (lookupType === "team") {
      const doc = await adminDb.collection("teams").doc(trimmedQuery).get();
      if (!doc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: "not_found_team",
            message: `No team found with ID ${trimmedQuery}.`,
          },
          { status: 404 }
        );
      }
      const data = doc.data();
      if (data) {
          teamDocData = mapToTeamData(doc.id, data);
      }
    }

    // 2. Fetch associated team or members
    if (mainDelegateData && mainDelegateData.teamId) {
      const doc = await adminDb.collection("teams").doc(mainDelegateData.teamId).get();
      if (doc.exists) {
        const data = doc.data();
        if (data) {
            teamDocData = mapToTeamData(doc.id, data);
        }
      }
    }

    if (teamDocData && teamDocData.memberDelegateIds && teamDocData.memberDelegateIds.length > 0) {
      const memberIds = teamDocData.memberDelegateIds;
      for (let i = 0; i < memberIds.length; i += 30) {
        const chunk = memberIds.slice(i, i + 30);
        const membersSnap = await adminDb
          .collection("delegates")
          .where("__name__", "in", chunk)
          .get();
        membersSnap.forEach((d) => {
          teamMembers.push(mapToDelegateData(d.id, d.data()));
        });
      }
    }

    // 3. Fetch event registrations
    let allCartItems: CartItem[] = [];
    if ((lookupType === "email" || lookupType === "delegate") && mainDelegateData) {
      const targetDelegateId = mainDelegateData.delegateId;
      const regsSnap = await adminDb
        .collection("eventRegistrations")
        .where("participantDelegateIds", "array-contains", targetDelegateId)
        .get();

      regsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.cartItems && Array.isArray(data.cartItems)) {
          data.cartItems.forEach((item: CartItem) => {
            if (
              item.participantDelegateIds &&
              item.participantDelegateIds.includes(targetDelegateId)
            ) {
              allCartItems.push(item);
            }
          });
        }
      });
    } else if (lookupType === "team" && teamDocData) {
      const memberIds = teamDocData.memberDelegateIds || [];
      if (memberIds.length > 0) {
        const uniqueRegistrationDocs = new Map<string, FirebaseFirestore.DocumentData>();
        for (let i = 0; i < memberIds.length; i += 10) {
          const chunk = memberIds.slice(i, i + 10);
          const regsSnap = await adminDb
            .collection("eventRegistrations")
            .where("participantDelegateIds", "array-contains-any", chunk)
            .get();
          regsSnap.forEach((doc) => {
            uniqueRegistrationDocs.set(doc.id, doc.data());
          });
        }

        for (const data of uniqueRegistrationDocs.values()) {
          if (data.cartItems && Array.isArray(data.cartItems)) {
            data.cartItems.forEach((item: CartItem) => {
              if (
                item.participantDelegateIds &&
                item.participantDelegateIds.some((id: string) => memberIds.includes(id)) &&
                item.eventType === "group"
              ) {
                allCartItems.push(item);
              }
            });
          }
        }
      }
    }

    // Deduplicate cartItems
    const uniqueCartItemsMap = new Map<string, CartItem>();
    allCartItems.forEach((item) => {
      const key = `${item.eventId}-${(item.participantDelegateIds || [])
        .slice()
        .sort()
        .join(",")}`;
      if (!uniqueCartItemsMap.has(key)) {
        uniqueCartItemsMap.set(key, item);
      }
    });
    allCartItems = Array.from(uniqueCartItemsMap.values());

    // 4. Resolve Participant Names
    const allParticipantIds = new Set<string>();
    allCartItems.forEach((item) => {
      (item.participantDelegateIds || []).forEach((id: string) => allParticipantIds.add(id));
    });

    const participantNamesMap = new Map<string, string>();
    if (allParticipantIds.size > 0) {
      const ids = Array.from(allParticipantIds);
      const refs = ids.map((id) => adminDb.collection("delegates").doc(id));
      for (let i = 0; i < refs.length; i += 100) {
        const chunk = refs.slice(i, i + 100);
        const snaps = await adminDb.getAll(...chunk);
        snaps.forEach((s) => {
          if (s.exists) {
            participantNamesMap.set(s.id, s.data()?.name || "Unknown");
          }
        });
      }
    }

    // 5. Resolve Event Details & Team Names
    const eventIdsToFetch = new Set<string>();
    const teamIdsToFetch = new Set<string>();

    allCartItems.forEach((item) => {
      eventIdsToFetch.add(item.eventId);
      if (item.teamId && (!teamDocData || teamDocData.teamId !== item.teamId)) {
        teamIdsToFetch.add(item.teamId);
      }
    });

    const eventsMap = new Map<string, EventData>();
    if (eventIdsToFetch.size > 0) {
      const ids = Array.from(eventIdsToFetch);
      const refs = ids.map((id) => adminDb.collection("events").doc(id));
      for (let i = 0; i < refs.length; i += 100) {
        const chunk = refs.slice(i, i + 100);
        const snaps = await adminDb.getAll(...chunk);
        snaps.forEach((s) => {
          if (s.exists) {
            eventsMap.set(s.id, s.data() as EventData);
          }
        });
      }
    }

    const teamsMap = new Map<string, string>();
    if (teamDocData) {
      teamsMap.set(teamDocData.teamId, teamDocData.teamName);
    }
    if (teamIdsToFetch.size > 0) {
      const ids = Array.from(teamIdsToFetch);
      const refs = ids.map((id) => adminDb.collection("teams").doc(id));
      for (let i = 0; i < refs.length; i += 100) {
        const chunk = refs.slice(i, i + 100);
        const snaps = await adminDb.getAll(...chunk);
        snaps.forEach((s) => {
          if (s.exists) teamsMap.set(s.id, s.data()?.teamName || "Unknown Team");
        });
      }
    }

    // 6. Map to Response Shape
    const soloEvents: Record<string, unknown>[] = [];
    const teamEvents: Record<string, unknown>[] = [];

    allCartItems.forEach((item) => {
      const eventData = eventsMap.get(item.eventId);

      let scheduleStr: string | null = null;
      if (eventData?.schedule) {
        if (typeof eventData.schedule === "string") {
            scheduleStr = eventData.schedule;
        } else if (typeof eventData.schedule === "object" && typeof (eventData.schedule as FirestoreTimestamp).toDate === "function") {
            scheduleStr = (eventData.schedule as FirestoreTimestamp).toDate().toISOString();
        }
      }

      const detail = {
        eventId: item.eventId,
        indianName: eventData
          ? eventData.indianName || eventData.name || "Event details unavailable"
          : "Event details unavailable",
        englishName: eventData ? eventData.englishName || eventData.description || "" : "",
        category: eventData ? eventData.category || "Unknown" : "Unknown",
        type: item.eventType,
        venue: eventData ? eventData.venue || null : null,
        schedule: scheduleStr,
        eventDate: eventData ? eventData.eventDate || null : null,
        eventTime: eventData ? eventData.eventTime || null : null,
        fee: item.eventFee || (eventData ? eventData.fee || 0 : 0),
        pricingType: eventData ? eventData.pricingType || "fixed" : "fixed",
        teamName: item.teamId ? teamsMap.get(item.teamId) || null : null,
        participantNames: (item.participantDelegateIds || []).map(
          (id: string) => participantNamesMap.get(id) || id
        ),
      };

      if (item.eventType === "solo") {
        soloEvents.push(detail);
      } else {
        teamEvents.push(detail);
      }
    });

    if (lookupType === "team" && teamDocData) {
      return NextResponse.json({
        success: true,
        lookupType: "team",
        team: {
          teamId: teamDocData.teamId,
          teamName: teamDocData.teamName,
          leadDelegateId: teamDocData.leadDelegateId,
          memberDelegateIds: teamDocData.memberDelegateIds || [],
          members: teamMembers.map((m) => ({
            delegateId: m.delegateId,
            name: m.name,
            collegeName: m.collegeName,
            delegateTier: m.delegateTier,
            isJSSMC: !!m.isJSSMC,
            paymentStatus: m.paymentStatus || "pending_verification",
          })),
        },
        teamEvents,
      });
    }

    if (mainDelegateData) {
        return NextResponse.json({
          success: true,
          lookupType: "delegate",
          delegate: {
            delegateId: mainDelegateData.delegateId,
            name: mainDelegateData.name,
            email: mainDelegateData.email,
            collegeName: mainDelegateData.collegeName,
            delegateTier: mainDelegateData.delegateTier,
            teamId: mainDelegateData.teamId || null,
            isJSSMC: !!mainDelegateData.isJSSMC,
            paymentStatus: mainDelegateData.paymentStatus || "pending_verification",
            registeredEventIds: mainDelegateData.registeredEventIds || [],
            createdAt: mainDelegateData.createdAt,
          },
          team: teamDocData
            ? {
                teamId: teamDocData.teamId,
                teamName: teamDocData.teamName,
                leadDelegateId: teamDocData.leadDelegateId,
                memberDelegateIds: teamDocData.memberDelegateIds || [],
                members: teamMembers.map((m) => ({
                  delegateId: m.delegateId,
                  name: m.name,
                  collegeName: m.collegeName,
                  delegateTier: m.delegateTier,
                })),
              }
            : null,
          soloEvents,
          teamEvents,
        });
    }

    // Fallback if data is unexpectedly null
    return NextResponse.json(
      { success: false, message: "Lookup failed unexpectedly." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Registration status lookup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
