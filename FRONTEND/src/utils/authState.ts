/**
 * Centralised, single-probe auth state for public pages (landing).
 *
 * Elements opt in with attributes:
 * - [data-guest-only]  → shown only when signed out
 * - [data-auth-only]   → shown only when signed in
 * - [data-auth-href]   → href becomes /dashboard when signed in, /signup when not
 *
 * Call `initAuthState()` once per page. It runs at most once and never touches
 * the httpOnly cookie — it only reflects the session via the existing probe.
 *
 * The probe is asynchronous, so a click may happen before it resolves. The CTAs
 * keep plain `<a href>` behaviour and navigate immediately: blocking the click
 * to await the probe turns a tap into a network round-trip and swallows the
 * navigation whenever that request is slow, cold, or never completes. Signed-in
 * visitors who reach /signup that way are forwarded to the dashboard there.
 */

import { isAuthenticated } from "@/api/auth.api";

let started = false;
let resolved: boolean | null = null;
const subscribers = new Set<(authed: boolean) => void>();

/** The last probe result, or null while it is still unknown. */
export function getAuthState(): boolean | null {
  return resolved;
}

/**
 * Subscribe to the shared probe result. Fires immediately when the state is
 * already known, so components never need to issue a second probe of their own.
 */
export function subscribeAuthState(fn: (authed: boolean) => void): () => void {
  subscribers.add(fn);
  if (resolved !== null) fn(resolved);
  return () => subscribers.delete(fn);
}

export function initAuthState(): void {
  if (started) return;
  started = true;

  const guestEls = document.querySelectorAll<HTMLElement>("[data-guest-only]");
  const authEls = document.querySelectorAll<HTMLElement>("[data-auth-only]");
  const ctaEls = document.querySelectorAll<HTMLAnchorElement>("[data-auth-href]");

  function apply(authed: boolean) {
    resolved = authed;

    guestEls.forEach((el) => {
      el.style.display = authed ? "none" : "";
    });
    authEls.forEach((el) => {
      el.style.display = authed ? "" : "none";
    });
    ctaEls.forEach((el) => {
      el.setAttribute("href", authed ? "/dashboard" : "/signup");
    });

    subscribers.forEach((fn) => fn(authed));

    window.dispatchEvent(
      new CustomEvent("nx:session-state", { detail: { authenticated: authed } }),
    );
  }

  isAuthenticated()
    .then(apply)
    .catch(() => apply(false));
}
