const isProduction = process.env.NODE_ENV === "production";
/** Name of the short-lived access-token cookie. */
export const ACCESS_COOKIE = "accessToken";
/** Name of the long-lived refresh-token cookie. */
export const REFRESH_COOKIE = "refreshToken";
/** Access token / cookie lifetime (10 minutes). */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 10;
/** Refresh session lifetime (30 days). */
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
/**
 * Access-token cookie: sent on every request, short-lived, HttpOnly so it is
 * never readable from JavaScript.
 */
export const accessCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
};
/**
 * Refresh-token cookie: only sent to the auth endpoints, long-lived, HttpOnly.
 * Scoping the path limits exposure if a request is ever misrouted.
 */
export const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
};
/** Origins allowed to send credentialed cross-origin requests. */
export const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:4321")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
/**
 * Public base URL used to build every short link returned to clients — the
 * plain-text body of `POST /api/create` and the `shortUrl` field of the link
 * and analytics payloads.
 *
 * Set `PUBLIC_SHORT_URL_BASE` to the public short-link domain when one is
 * configured; until then it falls back to `APP_URL`, which is the host that
 * currently serves the redirect route. Trailing slashes are stripped so the
 * value produces the same URL with or without one.
 */
export const shortUrlBaseUrl = (process.env.PUBLIC_SHORT_URL_BASE ||
    process.env.APP_URL ||
    "").replace(/\/+$/, "");
