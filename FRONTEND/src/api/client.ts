/**
 * Shared helpers for the HyperLink backend API clients.
 */

export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface ApiErrorBody {
  success?: boolean;
  message?: string;
}

/** Error carrying the HTTP status so callers can special-case e.g. 401. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...init,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
    );
  }
}

/**
 * Single-flight refresh: many concurrent 401s share one refresh request so we
 * never stampede the endpoint or loop. Resolves to whether the session is valid.
 */
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = send("/api/auth/refresh", { method: "POST" })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Authenticated fetch against the HyperLink backend.
 *
 * Always sends the httpOnly auth cookies (`credentials: "include"`). If the
 * short-lived access token has expired, a 401 triggers a single transparent
 * refresh and the original request is retried exactly once. Auth endpoints are
 * never retried, so this can not loop.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  let response = await send(path, init);

  const isAuthEndpoint = path.startsWith("/api/auth/");

  if (response.status === 401 && !isAuthEndpoint) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await send(path, init);
    }
  }

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  return response;
}

/** Parses the backend's JSON error body, falling back to a generic message. */
export async function extractErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body && typeof body.message === "string" && body.message.length > 0) {
        return body.message;
      }
    } catch {
      // fall through to the generic message
    }
  }

  return `Request failed with status ${response.status}`;
}
