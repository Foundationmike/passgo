import { NextRequest, NextResponse } from "next/server";
import { getAuthedClient, setupWatch } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  // Vercel cron auth
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handleWatch();
}

export async function POST() {
  return handleWatch();
}

async function handleWatch() {
  try {
    const gmail = getAuthedClient();
    const result = await setupWatch(gmail);
    console.log("Gmail watch registered:", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Watch setup failed:", err);
    return NextResponse.json(
      { error: "Watch setup failed", details: String(err) },
      { status: 500 }
    );
  }
}
