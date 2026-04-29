/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to MongoDB");
    server = app.listen(envVars.PORT, () => {
      console.log(`Server listening on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection — shutting down:", err);
  server?.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception — shutting down:", err);
  server?.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  server?.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received — shutting down gracefully");
  server?.close(() => process.exit(0));
});
