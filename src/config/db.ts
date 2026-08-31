import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}
