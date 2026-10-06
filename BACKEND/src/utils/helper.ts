import crypto from "node:crypto";
import { nanoid } from "nanoid";
import jsonwebtoken from "jsonwebtoken";

export interface AuthTokenPayload {
  id: string;
  email: string;
}

export const generateNanoid = (length: number) => {
  return nanoid(length);
};

/**
 * Signs a short-lived access token. The matching cookie (and the token itself)
 * expire quickly; persistence is handled by the refresh-session mechanism.
 */
export const signToken = async (payload: AuthTokenPayload) => {
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "10m",
  });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jsonwebtoken.verify(
    token,
    process.env.JWT_SECRET as string,
  ) as AuthTokenPayload;
};

/** Generates a high-entropy opaque refresh token (never stored in plaintext). */
export const generateRefreshToken = () => crypto.randomBytes(48).toString("base64url");

/** Hashes a refresh token so only a digest is persisted server-side. */
export const hashRefreshToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
