import express, { Express, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import numbersRouter from "./routes/numbers.js";

const app: Express = express();

// Middlewares
app.use(
  cors({
    origin: [env.BETTER_AUTH_URL, "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

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

export default app;