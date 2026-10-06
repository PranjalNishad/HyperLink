import { Hono } from "hono";
import {
  getUserStats,
  getUserUrls,
  getUserAnalytics,
  getUserTopLinks,
  getUserLinkAnalytics,
  deleteUserLink,
} from "../controller/short_url.controller";

const url_routes = new Hono();

// Static paths must be registered before the "/:id" param route.
url_routes.get("/stats", getUserStats);
url_routes.get("/overview", getUserAnalytics);
url_routes.get("/top", getUserTopLinks);
url_routes.get("/:id", getUserLinkAnalytics);
url_routes.get("/", getUserUrls);

// Different HTTP method, so it does not affect the GET routes above.
url_routes.delete("/:id", deleteUserLink);

export default url_routes;
