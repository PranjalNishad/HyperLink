import { Hono } from "hono";
import {createShortUrl} from "../controller/short_url.controller";

const router = new Hono();

router.post("/", createShortUrl);

export default router;