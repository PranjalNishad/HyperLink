import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import connectDB from "@/config/mongo.config";
import short_url from "@/routes/short_url.route";
import url_routes from "@/routes/url.route";
import auth_routes from "@/routes/auth.route";
import { redirectFromShortUrl } from "@/controller/short_url.controller";
import { errorHandler } from "./utils/errorHandler";
import { attachUser } from "@/utils/attactUser";
import { allowedOrigins } from "@/config/config";
import { rateLimit } from "@/middleware/rateLimit.middleware";

const app = new Hono();

// Baseline security headers for every API response.
app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "no-referrer");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  c.header("Cross-Origin-Resource-Policy", "same-site");
  if (process.env.NODE_ENV === "production") {
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  await next();
});

// Credentialed CORS restricted to explicitly trusted origins.
app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowedOrigins.includes(origin) ? origin : undefined),
    credentials: true,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 600,
  }),
);

connectDB();

app.route("/api/auth", auth_routes);
app.use(attachUser);

// Throttle link creation to limit abuse.
app.use("/api/create", rateLimit({ name: "create", windowMs: 60_000, max: 30 }));
app.route("/api/create", short_url);
app.route("/api/urls", url_routes);

app.get("/:id", redirectFromShortUrl);

app.onError(errorHandler);

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("Server is running on http://localhost:3000");

// get - redirection
// post - create short url
