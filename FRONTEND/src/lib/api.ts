import { API_BASE } from "./apiBase";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

// Small wrapper around fetch: adds the JSON header and login token, and turns
// any failure into an Error whose message is safe to show to the user.
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Couldn't reach the server. Please check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.message) || "Something went wrong. Please try again.");
  }
  return data as T;
}
