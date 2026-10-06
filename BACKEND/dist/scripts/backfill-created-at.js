import mongoose from "mongoose";
import connectDB from "@/config/mongo.config";
import urlSchema from "@/models/shorturl.model";
const run = async () => {
    await connectDB();
    const missingBefore = await urlSchema.collection.countDocuments({
        createdAt: { $exists: false },
    });
    if (missingBefore === 0) {
        console.log("Backfill: no documents missing createdAt. Nothing to do.");
        await mongoose.connection.close();
        return;
    }
    // Raw native update (bypasses Mongoose timestamp handling) so we can derive
    // createdAt from the ObjectId creation time. The filter makes this idempotent
    // and guarantees existing createdAt values are never overwritten.
    const result = await urlSchema.collection.updateMany({ createdAt: { $exists: false } }, [{ $set: { createdAt: { $toDate: "$_id" } } }]);
    console.log(`Backfill: updated ${result.modifiedCount} document(s).`);
    await mongoose.connection.close();
};
run().catch(async (error) => {
    console.error("Backfill failed:", error);
    await mongoose.connection.close();
    process.exit(1);
});
