import { getRoutes } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  const routes = getRoutes();

  const checks = [
    { label: "GMAIL_CLIENT_ID", ok: !!process.env.GMAIL_CLIENT_ID },
    { label: "GMAIL_CLIENT_SECRET", ok: !!process.env.GMAIL_CLIENT_SECRET },
    { label: "GMAIL_REFRESH_TOKEN", ok: !!process.env.GMAIL_REFRESH_TOKEN },
    { label: "GOOGLE_CLOUD_PROJECT_ID", ok: !!process.env.GOOGLE_CLOUD_PROJECT_ID },
    { label: "GOOGLE_PUBSUB_TOPIC", ok: !!process.env.GOOGLE_PUBSUB_TOPIC },
    { label: "RESEND_API_KEY", ok: !!process.env.RESEND_API_KEY },
    { label: "APP_URL", ok: !!process.env.APP_URL },
    { label: "CRON_SECRET", ok: !!process.env.CRON_SECRET },
  ];

  const allSet = checks.every((c) => c.ok);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Passgo</h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 32 }}>
        Automatic streaming verification code forwarding
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Setup Checklist</h2>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 16,
          }}
        >
          {checks.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                fontFamily: "monospace",
                fontSize: 14,
              }}
            >
              <span>{c.ok ? "\u2705" : "\u274c"}</span>
              <span>{c.label}</span>
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid #e5e7eb",
              fontSize: 14,
              color: allSet ? "#16a34a" : "#dc2626",
            }}
          >
            {allSet
              ? "All environment variables configured."
              : "Some environment variables are missing."}
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Configured Services</h2>
        {routes.map((route) => (
          <div
            key={route.name}
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>{route.name}</h3>
            <div style={{ fontSize: 13, color: "#666" }}>
              <div>
                Senders: {route.senderPatterns.join(", ")}
              </div>
              <div>
                Subject keywords: {route.subjectPatterns.join(", ")}
              </div>
              <div>
                Code pattern: <code>{route.codePattern}</code>
              </div>
              <div style={{ marginTop: 8 }}>
                Recipients:{" "}
                {route.recipients.map((r) => `${r.name} <${r.email}>`).join(", ")}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 32, fontSize: 13, color: "#999" }}>
        <p>
          <strong>Quick start:</strong> Set all env vars &rarr;{" "}
          <a href="/api/auth/gmail">Authorize Gmail</a> &rarr; Copy refresh
          token &rarr; Set up Pub/Sub &rarr;{" "}
          <code>POST /api/setup/watch</code>
        </p>
      </section>
    </div>
  );
}
