import mongoose from "mongoose";
import { saveShortUrl, getCustomShortUrl, getUserStats, findUserShortUrls, countUserShortUrls, findUserLinkById, findTopUserLinks, deleteUserShortUrl, } from "../dao/short_url.dao.js";
import urlSchema from "../models/shorturl.model.js";
import { generateNanoid } from "../utils/helper.js";
import { ConflictError, BadRequestError, NotFoundError, InternalServerError, } from "../utils/errorHandler.js";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_TOP_LIMIT = 5;
const MAX_TOP_LIMIT = 50;
const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_SLUG_LENGTH = 64;
const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
/**
 * Validates a destination URL. Only absolute http/https URLs are accepted so
 * dangerous schemes (javascript:, data:, file:, …) can never be stored and
 * later served back as a redirect.
 */
export const validateDestinationUrl = (url) => {
    if (typeof url !== "string" || url.trim().length === 0) {
        throw new BadRequestError("A URL is required");
    }
    const value = url.trim();
    if (value.length > MAX_URL_LENGTH) {
        throw new BadRequestError("URL is too long");
    }
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        throw new BadRequestError("Please provide a valid URL, including http:// or https://");
    }
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
        throw new BadRequestError("Only http and https URLs are allowed");
    }
    return value;
};
/** Validates an optional custom slug and normalises an empty value to null. */
export const validateSlug = (slug) => {
    if (slug === undefined || slug === null)
        return null;
    if (typeof slug !== "string") {
        throw new BadRequestError("Invalid custom slug");
    }
    const value = slug.trim();
    if (value.length === 0)
        return null;
    if (value.length > MAX_SLUG_LENGTH) {
        throw new BadRequestError("Custom slug is too long");
    }
    if (!SLUG_PATTERN.test(value)) {
        throw new BadRequestError("Custom slug can only contain letters, numbers, hyphens, and underscores");
    }
    return value;
};
const parseIntegerQuery = (raw, fallback, field) => {
    if (raw === undefined || raw === "")
        return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value)) {
        throw new BadRequestError(`Invalid ${field}`);
    }
    return value;
};
const mapShortUrl = (doc) => ({
    id: String(doc._id),
    destination: doc.full_url,
    slug: doc.short_url,
    shortUrl: `${(process.env.APP_URL ?? "").replace(/\/+$/, "")}/${doc.short_url}`,
    clicks: doc.clicks ?? 0,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
});
export const createShortUrlWithUser = async (url, userId, slug) => {
    const destination = validateDestinationUrl(url);
    const customSlug = validateSlug(slug);
    const shortUrl = customSlug || generateNanoid(7);
    if (!shortUrl)
        throw new InternalServerError("Failed to generate short URL");
    const exists = await getCustomShortUrl(shortUrl);
    if (exists) {
        throw new ConflictError("Custom URL already exists");
    }
    await saveShortUrl(destination, shortUrl, userId);
    return shortUrl;
};
export const createShortUrlWithoutUser = async (url, userId, slug) => {
    const destination = validateDestinationUrl(url);
    const customSlug = validateSlug(slug);
    const shortUrl = customSlug || generateNanoid(7);
    const exists = await getCustomShortUrl(shortUrl);
    if (exists) {
        throw new ConflictError("Custom URL already exists");
    }
    await saveShortUrl(destination, shortUrl, userId);
    return shortUrl;
};
export const getDashboardStats = async (userId) => {
    const { totalLinks, totalClicks } = await getUserStats(userId);
    return { totalLinks, totalClicks };
};
export const getUserShortUrls = async (userId, pageRaw, limitRaw) => {
    const page = parseIntegerQuery(pageRaw, DEFAULT_PAGE, "page");
    const limit = parseIntegerQuery(limitRaw, DEFAULT_LIMIT, "limit");
    if (page < 1)
        throw new BadRequestError("Invalid page");
    if (limit < 1 || limit > MAX_LIMIT)
        throw new BadRequestError("Invalid limit");
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
        findUserShortUrls(userId, skip, limit),
        countUserShortUrls(userId),
    ]);
    const links = docs.map(mapShortUrl);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
        links,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};
export const getAnalyticsOverview = async (userId) => {
    const { totalLinks, totalClicks, linksWithClicks } = await getUserStats(userId);
    return { totalLinks, totalClicks, linksWithClicks };
};
export const getTopLinks = async (userId, limitRaw) => {
    const limit = parseIntegerQuery(limitRaw, DEFAULT_TOP_LIMIT, "limit");
    if (limit < 1 || limit > MAX_TOP_LIMIT) {
        throw new BadRequestError("Invalid limit");
    }
    const docs = await findTopUserLinks(userId, limit);
    return docs.map(mapShortUrl);
};
export const getLinkAnalytics = async (userId, id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new NotFoundError("Short URL not found");
    }
    const doc = await findUserLinkById(userId, id);
    if (!doc) {
        throw new NotFoundError("Short URL not found");
    }
    return mapShortUrl(doc);
};
export const removeUserLink = async (userId, id) => {
    // Same not-found response whether the id is invalid, missing, or owned by
    // someone else — callers cannot tell another user's link exists.
    if (!mongoose.isValidObjectId(id)) {
        throw new NotFoundError("Short URL not found");
    }
    const deleted = await deleteUserShortUrl(userId, id);
    if (!deleted) {
        throw new NotFoundError("Short URL not found");
    }
};
