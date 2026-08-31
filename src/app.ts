import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import numbersRouter from "./routes/numbers.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
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

// API Routes
app.use("/api/numbers", numbersRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use(errorHandler);

export default app;