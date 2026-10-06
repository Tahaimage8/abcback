import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
  }

  console.error(`[Error] ${req.method} ${req.url}:`, message);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
