import { setCookie, getCookie } from "hono/cookie";
import wrapAsync from "../utils/tryCatchWrapper.js";
import { registerUser, loginUser, refreshSession, logoutSession, } from "../services/auth.service.js";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions, } from "../config/config.js";
import { BadRequestError } from "../utils/errorHandler.js";
const setAuthCookies = (c, accessToken, refreshToken) => {
    setCookie(c, ACCESS_COOKIE, accessToken, accessCookieOptions);
    setCookie(c, REFRESH_COOKIE, refreshToken, refreshCookieOptions);
};
const clearAuthCookies = (c) => {
    setCookie(c, ACCESS_COOKIE, "", { ...accessCookieOptions, maxAge: 0 });
    setCookie(c, REFRESH_COOKIE, "", { ...refreshCookieOptions, maxAge: 0 });
};
const readJsonBody = async (c) => {
    try {
        const body = await c.req.json();
        if (!body || typeof body !== "object") {
            throw new Error("bad body");
        }
        return body;
    }
    catch {
        throw new BadRequestError("Invalid request body");
    }
};
export const register_user = wrapAsync(async (c) => {
    const { name, email, password } = await readJsonBody(c);
    const { accessToken, refreshToken } = await registerUser(name, email, password);
    setAuthCookies(c, accessToken, refreshToken);
    c.status(200);
    return c.json({ message: "User registered successfully" });
});
export const login_user = wrapAsync(async (c) => {
    const { email, password } = await readJsonBody(c);
    const { accessToken, refreshToken } = await loginUser(email, password);
    setAuthCookies(c, accessToken, refreshToken);
    return c.json({ message: "User logged in successfully" });
});
/** Exchanges a valid refresh session for a fresh access + refresh pair. */
export const refresh_user = wrapAsync(async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE);
    const { accessToken, refreshToken: nextRefreshToken } = await refreshSession(refreshToken);
    setAuthCookies(c, accessToken, nextRefreshToken);
    return c.json({ message: "Session refreshed" });
});
export const logout_user = wrapAsync(async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE);
    // Revoke only this device's session; other sessions stay valid.
    await logoutSession(refreshToken);
    clearAuthCookies(c);
    return c.json({ message: "User logged out successfully" });
});
