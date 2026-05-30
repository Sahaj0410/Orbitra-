import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function connectDatabase() {
  let uri = process.env.MONGO_URI;

  if (!uri && process.env.USE_MEMORY_DB === "true") {
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log("Using in-memory MongoDB for local demo");
  }

  if (!uri) {
    throw new Error("MONGO_URI is required. For a quick local demo, set USE_MEMORY_DB=true.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
