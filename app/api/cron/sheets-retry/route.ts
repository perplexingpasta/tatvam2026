import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify the request is from Vercel cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const response = await fetch(`${baseUrl}/api/sheets/retry`, {
      method: "POST",
    });
    const data = await response.json();
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
