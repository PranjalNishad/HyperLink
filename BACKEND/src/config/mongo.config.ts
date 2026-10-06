import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache lives on globalThis so it survives module re-evaluation and is reused
// across warm serverless invocations.
const globalWithMongoose = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalWithMongoose.__mongooseCache ??
  (globalWithMongoose.__mongooseCache = { conn: null, promise: null });

const connectDB = async (): Promise<typeof mongoose> => {
  // An established connection is reused as-is.
  if (cache.conn) {
    return cache.conn;
  }

  // A single in-flight promise is shared so concurrent callers during a cold
  // start never open more than one connection.
  if (!cache.promise) {
    console.log("Connecting to MongoDB...");
    cache.promise = mongoose
      .connect(process.env.MONGO_URL as string)
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Clear the failed attempt so a later invocation can retry.
    cache.promise = null;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }

  return cache.conn;
};

export default connectDB;
