import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const cookieHeader = req.headers.cookie;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (cookieHeader) {
      const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    // Look up session in MongoDB 'session' and 'user' collections if token exists
    if (token && mongoose.connection.db) {
      const sessionDoc = await mongoose.connection.db
        .collection("session")
        .findOne({ token });

      if (sessionDoc && sessionDoc.userId) {
        const userDoc = await mongoose.connection.db
          .collection("user")
          .findOne({ _id: sessionDoc.userId });

        if (userDoc) {
          req.user = {
            id: String(userDoc._id),
            name: userDoc.name || "User",
            email: userDoc.email || "",
            role: (userDoc.role || "MEMBER").toUpperCase(),
          };
          return next();
        }
      }
    }

    // Default fallback user for development if no token passed
    req.user = {
      id: "anonymous",
      name: "Guest User",
      email: "guest@school.com",
      role: "MEMBER",
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid or expired session token" });
  }
}
