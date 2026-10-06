import { Hono } from "hono";
import { register_user, login_user, logout_user, refresh_user, } from "../controller/auth.controller.js";
import { rateLimit } from "../middleware/rateLimit.middleware.js";
const auth_routes = new Hono();
// Credential endpoints are rate limited to slow brute-force attempts.
const authLimiter = rateLimit({ name: "auth", windowMs: 60_000, max: 10 });
auth_routes.post("/register", authLimiter, register_user);
auth_routes.post("/login", authLimiter, login_user);
auth_routes.post("/refresh", refresh_user);
auth_routes.post("/logout", logout_user);
export default auth_routes;
