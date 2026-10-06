import mongoose from "mongoose";
import Session from "@/models/session.model";

export const createSession = async (
  userId: mongoose.Types.ObjectId | string,
  tokenHash: string,
  expiresAt: Date,
) => {
  return await Session.create({ user: userId, tokenHash, expiresAt });
};

export const findSessionByTokenHash = async (tokenHash: string) => {
  return await Session.findOne({ tokenHash }).lean();
};

export const deleteSessionByTokenHash = async (tokenHash: string) => {
  return await Session.deleteOne({ tokenHash });
};

export const deleteSessionsForUser = async (
  userId: mongoose.Types.ObjectId | string,
) => {
  return await Session.deleteMany({ user: userId });
};
