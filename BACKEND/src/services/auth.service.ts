import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById } from "../dao/user.dao.js";
import {
  createSession,
  deleteSessionByTokenHash,
  findSessionByTokenHash,
} from "../dao/session.dao.js";
import { ConflictError, UnauthorizedError, BadRequestError } from "../utils/errorHandler.js";
import { signToken, generateRefreshToken, hashRefreshToken } from "../utils/helper.js";
import { REFRESH_TOKEN_TTL_SECONDS } from "../config/config.js";

const BCRYPT_ROUNDS = 10;
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 60;

const isBcryptHash = (value: string) => BCRYPT_HASH_PATTERN.test(value);

// Timing-safe comparison for the legacy plaintext upgrade path.
const safeEqual = (a: string, b: string) => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
};

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

/** Creates a short-lived access token plus a rotating server-side session. */
const issueSession = async (userId: unknown, email: string): Promise<SessionTokens> => {
  const accessToken = await signToken({ id: String(userId), email });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await createSession(userId as string, hashRefreshToken(refreshToken), expiresAt);

  return { accessToken, refreshToken };
};

export const registerUser = async (
  name: unknown,
  email: unknown,
  password: unknown,
) => {
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    throw new BadRequestError("Please provide a name, email, and password");
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length === 0 || cleanName.length > MAX_NAME_LENGTH) {
    throw new BadRequestError("Please provide a valid name");
  }
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    throw new BadRequestError("Please provide a valid email address");
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw new BadRequestError(
      `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    );
  }

  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    throw new ConflictError("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const newUser = await createUser(cleanName, cleanEmail, passwordHash);

  const tokens = await issueSession(newUser._id, newUser.email);

  return { user: newUser, ...tokens };
};

export const loginUser = async (email: unknown, password: unknown) => {
  if (typeof email !== "string" || typeof password !== "string") {
    throw new ConflictError("Invalid credentials");
  }

  const user = await findUserByEmail(email.trim().toLowerCase());

  // Same message whether the email or the password is wrong.
  if (!user) {
    throw new ConflictError("Invalid credentials");
  }

  const stored = user.password as string;

  if (isBcryptHash(stored)) {
    const matches = await bcrypt.compare(password, stored);
    if (!matches) {
      throw new ConflictError("Invalid credentials");
    }
  } else {
    // Legacy plaintext record: verify, then upgrade to a bcrypt hash in place.
    if (!safeEqual(password, stored)) {
      throw new ConflictError("Invalid credentials");
    }

    user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await user.save();
  }

  const tokens = await issueSession(user._id, user.email);
  return { user, ...tokens };
};

/**
 * Rotates a refresh session: the presented token is invalidated and a brand new
 * access + refresh pair is issued. A re-used (already rotated) token matches no
 * session, so it fails.
 */
export const refreshSession = async (refreshToken: unknown) => {
  if (typeof refreshToken !== "string" || refreshToken.length === 0) {
    throw new UnauthorizedError("Session expired");
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const session = await findSessionByTokenHash(tokenHash);

  if (!session) {
    throw new UnauthorizedError("Session expired");
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await deleteSessionByTokenHash(tokenHash);
    throw new UnauthorizedError("Session expired");
  }

  const user = await findUserById(String(session.user));
  if (!user) {
    await deleteSessionByTokenHash(tokenHash);
    throw new UnauthorizedError("Session expired");
  }

  // Rotation: invalidate the presented token before issuing a new one.
  await deleteSessionByTokenHash(tokenHash);

  const tokens = await issueSession(user._id, user.email);
  return { user, ...tokens };
};

/** Revokes a single refresh session (the one belonging to this device). */
export const logoutSession = async (refreshToken: unknown) => {
  if (typeof refreshToken === "string" && refreshToken.length > 0) {
    await deleteSessionByTokenHash(hashRefreshToken(refreshToken));
  }
};
