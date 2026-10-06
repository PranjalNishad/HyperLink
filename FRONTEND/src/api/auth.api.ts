/**
 * HyperLink auth API client.
 *
 * The backend owns the session with two httpOnly cookies: a short-lived
 * `accessToken` and a long-lived `refreshToken`. The frontend never reads or
 * stores either — it relies on `credentials: "include"` (handled by
 * `apiFetch`), which transparently refreshes an expired access token.
 *
 * Contracts:
 * - POST /api/auth/login    { email, password }        -> 200 { message }
 * - POST /api/auth/register { name, email, password }  -> 200 { message }
 * - POST /api/auth/refresh                             -> 200 (rotates session)
 * - POST /api/auth/logout                              -> 200 (revokes session)
 */

import { apiFetch } from "@/api/client";

export async function login(email: string, password: string): Promise<void> {
  await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await apiFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

/**
 * Lightweight session probe for public pages (e.g. the landing NavBar) so they
 * can reflect the authenticated state. It reuses an existing authenticated
 * endpoint (no new backend endpoint) and never reads/clears the cookie itself:
 * a 200 means the session is valid, a 401 (or network error) means it is not.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await apiFetch("/api/urls/stats");
    return true;
  } catch {
    return false;
  }
}
