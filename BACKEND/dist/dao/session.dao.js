import mongoose from "mongoose";
import Session from "../models/session.model";
export const createSession = async (userId, tokenHash, expiresAt) => {
    return await Session.create({ user: userId, tokenHash, expiresAt });
};
export const findSessionByTokenHash = async (tokenHash) => {
    return await Session.findOne({ tokenHash }).lean();
};
export const deleteSessionByTokenHash = async (tokenHash) => {
    return await Session.deleteOne({ tokenHash });
};
export const deleteSessionsForUser = async (userId) => {
    return await Session.deleteMany({ user: userId });
};
