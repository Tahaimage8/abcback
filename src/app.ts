import express, { Express, Request, Response, NextFunction } from "express";
import { connectDB } from "./config/db.js";
import numbersRouter from "./routes/numbers.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

// Custom Robust CORS Middleware for Vercel Serverless & Local
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight OPTIONS request immediately
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json());

// Database connection middleware for Serverless (Vercel) & Local
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Healthcheck Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "abcschool-backend",
    timestamp: new Date().toISOString(),
  });
});

import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import managerRouter from "./routes/manager.js";

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/manager", managerRouter);
app.use("/api/numbers", numbersRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use(errorHandler);

export default app;