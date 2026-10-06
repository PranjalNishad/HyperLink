import mongoose from "mongoose";
import urlSchema from "../models/shorturl.model";
import { generateNanoid } from "../utils/helper";
import { ConflictError, InternalServerError } from "../utils/errorHandler";
export const saveShortUrl = async (longUrl, shortUrl, userId) => {
    try {
        const newUrl = new urlSchema({
            full_url: longUrl,
            short_url: shortUrl,
        });
        if (userId) {
            newUrl.user = userId;
        }
        await newUrl.save();
    }
    catch (err) {
        if (err?.code === 11000) {
            throw new ConflictError("Short URL already exists");
        }
        // Never surface raw MongoDB/driver errors to the client.
        throw new InternalServerError("Could not create the short URL");
    }
};
// displaying url click count
export const getShortUrl = async (shortUrl) => {
    return await urlSchema.findOneAndUpdate({ short_url: shortUrl }, { $inc: { clicks: 1 } }, { new: true });
};
export const getCustomShortUrl = async (slug) => {
    const exists = await urlSchema.findOne({ short_url: slug });
    return exists;
};
export const getUserStats = async (userId) => {
    const [stats] = await urlSchema.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalLinks: { $sum: 1 },
                totalClicks: { $sum: "$clicks" },
                linksWithClicks: {
                    $sum: { $cond: [{ $gt: ["$clicks", 0] }, 1, 0] },
                },
            },
        },
    ]);
    return stats ?? { totalLinks: 0, totalClicks: 0, linksWithClicks: 0 };
};
export const findUserShortUrls = async (userId, skip, limit) => {
    return await urlSchema
        .find({ user: userId })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
export const countUserShortUrls = async (userId) => {
    return await urlSchema.countDocuments({ user: userId });
};
export const findUserLinkById = async (userId, id) => {
    return await urlSchema.findOne({ _id: id, user: userId }).lean();
};
export const findTopUserLinks = async (userId, limit) => {
    return await urlSchema
        .find({ user: userId })
        .sort({ clicks: -1, _id: -1 })
        .limit(limit)
        .lean();
};
// Ownership is enforced in the query itself so a user can only ever delete
// their own link. Returns the deleted document, or null if nothing matched.
export const deleteUserShortUrl = async (userId, id) => {
    return await urlSchema.findOneAndDelete({ _id: id, user: userId });
};
