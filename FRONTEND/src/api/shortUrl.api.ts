/**
 * HyperLink backend API — short URL creation.
 *
 * Verified backend contract (POST http://localhost:3000/api/create):
 * - No authentication.
 * - Request:  { "url": string, "slug"?: string }  (Content-Type: application/json)
 * - Success:  HTTP 200, Content-Type: text/plain, body is the short URL string.
 * - Error:    HTTP non-2xx, body is JSON: { "success": false, "message": string }
 *
 * Note: the endpoint must NOT have a trailing slash (/api/create/, returns 404).
 */

import { API_BASE_URL, extractErrorMessage, apiFetch } from "@/api/client";

export interface CreateShortUrlResult {
  shortUrl: string;
}

/**
 * Creates a short URL for the given long URL.
 * Optionally accepts a custom slug.
 */
export async function createShortUrl(
  url: string,
  slug?: string,
): Promise<CreateShortUrlResult> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, ...(slug ? { slug } : {}) }),
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  // Success response is plain text, not JSON.
  const shortUrl = (await response.text()).trim();

  if (!shortUrl) {
    throw new Error("The server returned an empty short URL.");
  }

  return { shortUrl };
}

/**
 * Deletes one of the signed-in user's short links.
 * Uses the shared client (credentials included); throws ApiError on failure.
 */
export async function deleteShortUrl(id: string): Promise<void> {
  await apiFetch(`/api/urls/${id}`, { method: "DELETE" });
}
