import type {
  Alternative,
  AnalyticsData,
  Category,
  DashboardData,
  NewPurchase,
  Purchase,
  User,
} from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.status === 204) return undefined as T;
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    const here = window.location.pathname + window.location.search;
    // Full reload so the server layout re-reads the now-cleared session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?next=${encodeURIComponent(here)}`);
    return new Promise<T>(() => {});
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body.issues?.map((i: { message: string }) => i.message).join(", ");
    throw new ApiError(res.status, detail || body.error || res.statusText);
  }
  return body as T;
}

function qs(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => v);
  return entries.length ? `?${new URLSearchParams(entries as [string, string][])}` : "";
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((r) => r.user),

  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((r) => r.user),

  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  me: () =>
    request<{ user: User }>("/api/auth/me").then(
      (r) => r.user,
      () => null
    ),

  listPurchases: (filter: { category?: Category; search?: string } = {}) =>
    request<{ purchases: Purchase[]; total: number; count: number }>(
      `/api/purchases${qs(filter)}`
    ),

  createPurchase: (input: NewPurchase) =>
    request<{ purchase: Purchase }>("/api/purchases", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.purchase),

  deletePurchase: (id: string) =>
    request<void>(`/api/purchases/${encodeURIComponent(id)}`, { method: "DELETE" }),

  alternatives: (category: Category, name: string) =>
    request<{ alternatives: Alternative[] }>(
      `/api/alternatives${qs({ category, name })}`
    ).then((r) => r.alternatives),

  dashboard: () => request<DashboardData>("/api/dashboard"),

  analytics: () => request<AnalyticsData>("/api/analytics"),
};
