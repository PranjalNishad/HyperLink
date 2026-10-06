import { createShortUrlWithUser, createShortUrlWithoutUser, getDashboardStats, getUserShortUrls, getAnalyticsOverview, getTopLinks, getLinkAnalytics, removeUserLink, } from "@/services/short_url.service";
import { getShortUrl } from "@/dao/short_url.dao";
import { UnauthorizedError, NotFoundError } from "@/utils/errorHandler";
import wrapAsync from "@/utils/tryCatchWrapper";
export const createShortUrl = wrapAsync(async (c) => {
    const data = await c.req.json();
    const user = c.get("user");
    let shortUrl;
    if (user) {
        shortUrl = await createShortUrlWithUser(data.url, user._id, data.slug);
    }
    else {
        shortUrl = await createShortUrlWithoutUser(data.url, null, data.slug);
    }
    c.status(200);
    return c.text(`${(process.env.APP_URL ?? "").replace(/\/+$/, "")}/${shortUrl}`);
});
export const redirectFromShortUrl = wrapAsync(async (c) => {
    const { id } = c.req.param();
    const url = await getShortUrl(id);
    if (!url) {
        return c.json({
            success: false,
            message: "Short URL not found",
        }, 404);
    }
    return c.redirect(url.full_url);
});
export const getUserStats = wrapAsync(async (c) => {
    const user = c.get("user");
    if (!user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const data = await getDashboardStats(user._id);
    return c.json({ success: true, data });
});
export const getUserUrls = wrapAsync(async (c) => {
    const user = c.get("user");
    if (!user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const { links, meta } = await getUserShortUrls(user._id, c.req.query("page"), c.req.query("limit"));
    return c.json({ success: true, data: { links }, meta });
});
export const getUserAnalytics = wrapAsync(async (c) => {
    const user = c.get("user");
    if (!user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const data = await getAnalyticsOverview(user._id);
    return c.json({ success: true, data });
});
export const getUserTopLinks = wrapAsync(async (c) => {
    const user = c.get("user");
    if (!user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const links = await getTopLinks(user._id, c.req.query("limit"));
    return c.json({ success: true, data: { links } });
});
export const getUserLinkAnalytics = wrapAsync(async (c) => {
    const user = c.get("user");
    if (!user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const id = c.req.param("id");
    if (!id) {
        throw new NotFoundError("Short URL not found");
    }
    const data = await getLinkAnalytics(user._id, id);
    return c.json({ success: true, data });
});
export const deleteUserLink = wrapAsync(async (c) => {
    const user = c.get("user");
    if (!user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const id = c.req.param("id");
    if (!id) {
        throw new NotFoundError("Short URL not found");
    }
    await removeUserLink(user._id, id);
    return c.json({ success: true, message: "Link deleted successfully" });
});
