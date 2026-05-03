import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/errorHandlers/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";

const app = express();

// === Core Middleware =========================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || " https://mission-bazar-frontend.vercel.app",
    credentials: true,
  })
);

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
