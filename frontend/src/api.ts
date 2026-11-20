const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${BASE}${path}`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof URLSearchParams) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text || `Request failed (${response.status})` };
  }
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  business: string;
  need: string;
  source: string;
  status: string;
  created_at: string;
}

export interface Client {
  id: number;
  lead_id: number | null;
  business_name: string;
  phone: string;
  address: string;
  service: string;
  amount: number;
  currency: "USD" | "KES";
  payment_status: string;
  payment_ref: string;
  created_at: string;
}

export interface PageRow {
  id: number;
  client_id: number;
  slug: string;
  status: string;
  deployed_url: string;
  created_at: string;
  business_name?: string;
}

export interface Enquiry {
  id: number;
  page_id: number;
  slug: string;
  name: string;
  phone: string;
  message: string;
  source: string;
  created_at: string;
  notified: number;
}

export interface Invoice {
  id: number;
  client_id: number;
  number: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  paid_at: string | null;
  business_name?: string;
}

export interface Activity {
  id: number;
  type: string;
  entity: string;
  message: string;
  created_at: string;
}

export interface DashboardData {
  counts: Record<string, number>;
  leadsByStatus: Record<string, number>;
  sourceStats: Array<{ source: string; total: number; converted: number; conversionRate: number }>;
  recentLeads: Lead[];
  recentEnquiries: Enquiry[];
}
