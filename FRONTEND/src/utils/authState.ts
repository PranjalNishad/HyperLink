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
 */

import { isAuthenticated } from "@/api/auth.api";

let started = false;
let resolved: boolean | null = null;

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

    window.dispatchEvent(
      new CustomEvent("nx:session-state", { detail: { authenticated: authed } }),
    );
  }

  isAuthenticated()
    .then(apply)
    .catch(() => apply(false));

  // If a CTA is clicked before the probe resolves, don't send a signed-in user
  // to /signup — resolve first, then navigate.
  document.addEventListener("click", (event) => {
    const el = (event.target as HTMLElement).closest<HTMLAnchorElement>("[data-auth-href]");
    if (!el || resolved !== null) return;

    event.preventDefault();
    isAuthenticated()
      .then((authed) => {
        window.location.href = authed ? "/dashboard" : "/signup";
      })
      .catch(() => {
        window.location.href = "/signup";
      });
  });
}
