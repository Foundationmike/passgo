import { google, gmail_v1 } from "googleapis";

function getAuth() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.APP_URL}/api/auth/gmail/callback`
  );
}

export function getAuthedClient(): gmail_v1.Gmail {
  const auth = getAuth();
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth });
}

export function getAuthUrl(): string {
  const auth = getAuth();
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.modify"],
  });
}

export async function exchangeCode(code: string) {
  const auth = getAuth();
  const { tokens } = await auth.getToken(code);
  return tokens;
}

export async function searchMessages(
  gmail: gmail_v1.Gmail,
  query: string
): Promise<gmail_v1.Schema$Message[]> {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 10,
  });
  return res.data.messages ?? [];
}

export async function getMessage(
  gmail: gmail_v1.Gmail,
  messageId: string
): Promise<gmail_v1.Schema$Message> {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return res.data;
}

export interface EmailDetails {
  from: string;
  subject: string;
  body: string;
}

export function extractEmailDetails(
  message: gmail_v1.Schema$Message
): EmailDetails {
  const headers = message.payload?.headers ?? [];
  const from =
    headers.find((h) => h.name?.toLowerCase() === "from")?.value ?? "";
  const subject =
    headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
  const body = extractBody(message.payload ?? {});
  return { from, subject, body };
}

function extractBody(payload: gmail_v1.Schema$MessagePart): string {
  // Check for direct body data
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }

  // Recurse into parts, preferring text/plain over text/html
  const parts = payload.parts ?? [];
  const textPart = parts.find((p) => p.mimeType === "text/plain");
  if (textPart?.body?.data) {
    return Buffer.from(textPart.body.data, "base64url").toString("utf-8");
  }

  const htmlPart = parts.find((p) => p.mimeType === "text/html");
  if (htmlPart?.body?.data) {
    return Buffer.from(htmlPart.body.data, "base64url").toString("utf-8");
  }

  // Recurse into multipart/* parts
  for (const part of parts) {
    if (part.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }

  return "";
}

export async function markAsRead(
  gmail: gmail_v1.Gmail,
  messageId: string
): Promise<void> {
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
}

export async function setupWatch(gmail: gmail_v1.Gmail): Promise<{
  historyId: string | null;
  expiration: string | null;
}> {
  const res = await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/topics/${process.env.GOOGLE_PUBSUB_TOPIC}`,
      labelIds: ["INBOX"],
    },
  });
  return {
    historyId: res.data.historyId ?? null,
    expiration: res.data.expiration ?? null,
  };
}
