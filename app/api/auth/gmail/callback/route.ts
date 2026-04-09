import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  try {
    const tokens = await exchangeCode(code);

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Passgo — OAuth Complete</title></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px;">
          <h1>OAuth Complete</h1>
          <p>Copy the refresh token below and add it as <code>GMAIL_REFRESH_TOKEN</code> in your Vercel environment variables, then redeploy.</p>
          <pre style="background: #f4f4f5; padding: 16px; border-radius: 8px; word-break: break-all; white-space: pre-wrap;">${tokens.refresh_token ?? "No refresh token returned — did you use prompt=consent?"}</pre>
          <p style="color: #666; font-size: 13px;">Access token and other fields are handled automatically. You only need the refresh token.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("OAuth token exchange failed:", error);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 }
    );
  }
}
