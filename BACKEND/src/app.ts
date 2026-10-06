import { Hono } from "hono";
import { cors } from "hono/cors";
import short_url from "./routes/short_url.route.js";
import url_routes from "./routes/url.route.js";
import auth_routes from "./routes/auth.route.js";
import { redirectFromShortUrl } from "./controller/short_url.controller.js";
import { errorHandler } from "./utils/errorHandler.js";
import { attachUser } from "./utils/attactUser.js";
import { allowedOrigins } from "./config/config.js";
import connectDB from "./config/mongo.config.js";
import { rateLimit } from "./middleware/rateLimit.middleware.js";

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

// Ensure MongoDB is connected before any request handler runs.
app.use("*", async (c, next) => {
  await connectDB();
  await next();
});

app.route("/api/auth", auth_routes);
app.use(attachUser);

// Throttle link creation to limit abuse.
app.use("/api/create", rateLimit({ name: "create", windowMs: 60_000, max: 30 }));
app.route("/api/create", short_url);
app.route("/api/urls", url_routes);

app.get("/:id", redirectFromShortUrl);

app.onError(errorHandler);

export default app;

// get - redirection
// post - create short url
