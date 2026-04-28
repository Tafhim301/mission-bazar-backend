/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
let server: Server;
const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    console.log("connected to DB");
    server = app.listen(envVars.PORT, () => {
      console.log(`Server listenig to port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
})();

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shtting down..", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("SIGINT signal detected... Server shtting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM signal detected... Server shtting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected... Server shtting down..", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
