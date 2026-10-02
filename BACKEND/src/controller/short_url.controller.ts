import type { Context } from "hono";
import { createShortUrlWithUser, createShortUrlWithoutUser } from "@/services/short_url.service";
import { getShortUrl } from "@/dao/short_url.dao";
import wrapAsync from "@/utils/tryCatchWrapper";

export const createShortUrl = wrapAsync(async (c: Context) => {
  const data = await c.req.json();
  const user = c.get("user");
  let shortUrl: string;
  if (user) {
    shortUrl = await createShortUrlWithUser(data.url, user._id, data.slug);
  }else {
    shortUrl = await createShortUrlWithoutUser(data.url, null, data.slug);
  }
  c.status(200);


  return c.text(process.env.APP_URL + shortUrl);
});

export const redirectFromShortUrl = wrapAsync(async (c: Context) => {
  const { id } = c.req.param();
  const url = await getShortUrl(id);
  if (!url) {
    return c.json(
      {
        success: false,
        message: "Short URL not found",
      },
      404,
    );
  }

  return c.redirect(url.full_url);
});