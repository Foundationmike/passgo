import { NextRequest, NextResponse } from "next/server";
import { getAuthedClient, searchMessages, getMessage, extractEmailDetails, markAsRead } from "@/lib/gmail";
import { getRoutes } from "@/lib/config";
import { matchService, extractCode } from "@/lib/parsers";
import { sendCodeEmail } from "@/lib/sender";

export async function POST(request: NextRequest) {
  // Always return 200 to prevent Pub/Sub retries
  try {
    const body = await request.json();

    // Decode Pub/Sub message (we don't need the data, just use it as a trigger)
    const pubsubMessage = body?.message?.data;
    if (pubsubMessage) {
      console.log(
        "Pub/Sub notification received:",
        Buffer.from(pubsubMessage, "base64").toString()
      );
    }

    const gmail = getAuthedClient();
    const routes = getRoutes();

    // Build a query for all configured senders
    const senderQueries = routes
      .flatMap((r) => r.senderPatterns)
      .map((s) => `from:${s}`)
      .join(" OR ");

    const query = `is:unread newer_than:1h (${senderQueries})`;
    console.log("Searching Gmail with query:", query);

    const messages = await searchMessages(gmail, query);
    console.log(`Found ${messages.length} unread message(s)`);

    for (const msg of messages) {
      if (!msg.id) continue;

      try {
        const full = await getMessage(gmail, msg.id);
        const { from, subject, body: emailBody } = extractEmailDetails(full);
        console.log(`Processing: from="${from}" subject="${subject}"`);

        const route = matchService(from, subject, routes);
        if (!route) {
          console.log("No matching service route, skipping");
          continue;
        }

        const code = extractCode(emailBody, route.codePattern);
        if (!code) {
          console.log(`No code found for ${route.name}, skipping`);
          continue;
        }

        console.log(`Extracted ${route.name} code: ${code}`);

        const { sent, failed } = await sendCodeEmail(
          route.name,
          code,
          route.recipients
        );
        console.log(
          `Sent to ${sent} recipient(s), ${failed} failed for ${route.name}`
        );

        await markAsRead(gmail, msg.id);
        console.log(`Marked message ${msg.id} as read`);
      } catch (err) {
        console.error(`Error processing message ${msg.id}:`, err);
      }
    }
  } catch (err) {
    console.error("Webhook error:", err);
  }

  return NextResponse.json({ ok: true });
}
