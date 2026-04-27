import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// Simple in-memory rate limiter
// Note: This resets on server restart and is not suitable for multi-instance deployments.
// (Netlify serverless functions are single-instance per invocation so this is acceptable).
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

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
    const id = searchParams.get("id");
    const eventId = searchParams.get("eventId");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing delegate ID parameter" },
        { status: 400 }
      );
    }

    const doc = await adminDb.collection("delegates").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: "Delegate ID not found" },
        { status: 404 }
      );
    }

    const data = doc.data();

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Delegate ID not found" },
        { status: 404 }
      );
    }

    if (eventId && data.registeredEventIds && data.registeredEventIds.includes(eventId)) {
      let eventName = "this event";
      try {
        const eventDoc = await adminDb.collection("events").doc(eventId).get();
        if (eventDoc.exists) {
          eventName = eventDoc.data()?.name || "this event";
        }
      } catch (err) {
        // Fallback message if event fetch fails
        console.warn("Failed to fetch event name for duplicate check fallback:", err);
      }

      return NextResponse.json(
        {
          success: false,
          error: "already_registered",
          message: `This delegate is already registered for ${eventName}`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      delegate: {
        name: data.name,
        collegeName: data.collegeName,
        college: "", // Omitted per instructions, collegeIdNumber is sensitive
        delegateTier: data.delegateTier,
        teamId: data.teamId,
      },
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
