import { saveShortUrl, getCustomShortUrl } from "@/dao/short_url.dao";
import urlSchema from "@/models/shorturl.model";
import { generateNanoid } from "@/utils/helper"; 
import { ConflictError } from "@/utils/errorHandler";

export const createShortUrlWithUser = async (url: string, userId: string, slug: string | null) => {
  const shortUrl = slug || await generateNanoid(7);
  
  if (!shortUrl) throw new Error("Failed to generate short URL");

  const exists = await getCustomShortUrl(shortUrl);
  if (exists) {
    throw new ConflictError("Custom URL already exists");
  }
  
  await saveShortUrl(url, shortUrl, userId);
  return shortUrl;
};

export const createShortUrlWithoutUser = async (url: string, userId: string | null, slug: string | null) => {
  const shortUrl = slug || await generateNanoid(7);
  const exists = await getCustomShortUrl(slug || shortUrl);
  if (exists) {
    throw new ConflictError("Custom URL already exists");
  }
  await saveShortUrl(url, shortUrl, userId);
  return shortUrl;
};
