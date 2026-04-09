import { Resend } from "resend";
import { Recipient } from "./config";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendCodeEmail(
  serviceName: string,
  code: string,
  recipients: Recipient[]
): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(
    recipients.map((r) =>
      getResend().emails.send({
        from: "Passgo <onboarding@resend.dev>",
        to: r.email,
        subject: `Your ${serviceName} code: ${code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #333; margin-bottom: 8px;">${serviceName} Verification Code</h2>
            <p style="color: #666; margin-bottom: 24px;">Hey ${r.name}, here's your code:</p>
            <div style="background: #f4f4f5; border-radius: 12px; padding: 24px; text-align: center;">
              <span style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #111;">
                ${code}
              </span>
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 24px;">
              Forwarded automatically by Passgo
            </p>
          </div>
        `,
      })
    )
  );

  let sent = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === "fulfilled") sent++;
    else failed++;
  }

  return { sent, failed };
}
