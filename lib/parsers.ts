import { ServiceRoute } from "./config";

export function matchService(
  from: string,
  subject: string,
  routes: ServiceRoute[]
): ServiceRoute | null {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();

  for (const route of routes) {
    const senderMatch = route.senderPatterns.some((pattern) =>
      fromLower.includes(pattern.toLowerCase())
    );
    if (!senderMatch) continue;

    const subjectMatch = route.subjectPatterns.some((pattern) =>
      subjectLower.includes(pattern.toLowerCase())
    );
    if (!subjectMatch) continue;

    return route;
  }

  return null;
}

export function extractCode(body: string, codePattern: string): string | null {
  // Strip HTML tags to get plain text
  const plain = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const match = plain.match(new RegExp(codePattern));
  return match?.[1] ?? match?.[0] ?? null;
}
