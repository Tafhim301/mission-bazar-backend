import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/errorHandlers/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { envVars } from "./app/config/env";

const app = express();

// === Core Middleware =========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://mission-bazar-frontend.vercel.app",
    credentials: true,
  })
);

// === Serverless DB connection =================================================
// When running on Vercel (serverless), server.ts never executes.
// This middleware ensures MongoDB is connected before every request.
// Mongoose caches the connection, so it only opens once per warm instance.

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB_URL as string);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// === Routes ==================================================================

app.use("/api/v1", router);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Mission Bazar API is up and running.",
  });
});

// === 404 Handler =============================================================

app.use(notFound);

// === Global Error Handler (must be last) =====================================

app.use(globalErrorHandler);

export default app;
