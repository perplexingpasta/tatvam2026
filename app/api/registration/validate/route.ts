import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// Shared rate limit map logic
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 30; // Slightly higher for validation

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= MAX_REQUESTS) return false;
  record.count++;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ success: false, message: "Rate limit exceeded" }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const emails = searchParams.get("emails")?.split(",").filter(Boolean) || [];
    const phones = searchParams.get("phones")?.split(",").filter(Boolean) || [];
    const collegeIds = searchParams.get("collegeIds")?.split(",").filter(Boolean) || [];

    if (emails.length === 0 && phones.length === 0 && collegeIds.length === 0) {
      return NextResponse.json({ success: true, conflicts: [] });
    }

    const conflicts: { field: string; value: string }[] = [];

    // Check emails
    if (emails.length > 0) {
      const emailQuery = await adminDb.collection("delegates").where("email", "in", emails).get();
      emailQuery.docs.forEach(doc => {
        conflicts.push({ field: "email", value: doc.data().email });
      });
    }

    // Check phones
    if (phones.length > 0) {
      const phoneQuery = await adminDb.collection("delegates").where("phone", "in", phones).get();
      phoneQuery.docs.forEach(doc => {
        conflicts.push({ field: "phone", value: doc.data().phone });
      });
    }

    // Check collegeIds
    if (collegeIds.length > 0) {
      const idQuery = await adminDb.collection("delegates").where("collegeIdNumber", "in", collegeIds).get();
      idQuery.docs.forEach(doc => {
        conflicts.push({ field: "collegeIdNumber", value: doc.data().collegeIdNumber });
      });
    }

    return NextResponse.json({ success: true, conflicts });
  } catch (error) {
    console.error("Validation API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
