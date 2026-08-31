import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  const rawUri = env.MONGODB_URI || "";
  // Strip any surrounding quotes (single or double) and trim whitespace
  const mongoUri = rawUri.replace(/^["']|["']$/g, "").trim();

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error(
      `Invalid MONGODB_URI scheme. Expected connection string starting with "mongodb://" or "mongodb+srv://", but got: "${mongoUri.slice(0, 15)}..."`
    );
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}
