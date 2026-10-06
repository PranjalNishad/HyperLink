import mongoose from "mongoose";

/**
 * A server-side refresh session. Only the SHA-256 hash of the refresh token is
 * stored, never the raw token. `expiresAt` is enforced with a TTL index so
 * abandoned sessions are cleaned up automatically.
 */
const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
