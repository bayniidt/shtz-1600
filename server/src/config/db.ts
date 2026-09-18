import mongoose from "mongoose";

import { config } from "@/config";

mongoose.set("strictQuery", true);

export async function connectDB(uri: string = config.mongoUri): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function dropDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
}
