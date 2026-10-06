import { serve } from "@hono/node-server";
import app from "./app.js";
import connectDB from "./config/mongo.config.js";
const start = async () => {
    await connectDB();
    serve({
        fetch: app.fetch,
        port: 3000,
    });
    console.log("Server is running on http://localhost:3000");
};
start();
