import routes from "@/config/routes.json";

export interface Recipient {
  name: string;
  email: string;
}

export interface ServiceRoute {
  name: string;
  senderPatterns: string[];
  subjectPatterns: string[];
  codePattern: string;
  recipients: Recipient[];
}

export function getRoutes(): ServiceRoute[] {
  return routes as ServiceRoute[];
}
