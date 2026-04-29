/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import AppError from "./appError";
import { envVars } from "../config/env";
import { handleZodError } from "../Helpers/handleZodError";
import { handleCastError } from "../Helpers/handleCastError";
import { handleDuplicateError } from "../Helpers/handleDuplicateError";
import { handleValidationError } from "../Helpers/handleValidationError";
import { TErrorSources } from "../interfaces/error.types";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources[] = [];

  // === Zod Validation Error ===
  if (err instanceof ZodError) {
    const result = handleZodError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources ?? [];

  // === Mongoose Cast Error (bad ObjectId) ===
  } else if (err instanceof mongoose.Error.CastError) {
    const result = handleCastError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources ?? [];

  // === Mongoose Duplicate Key Error ===
  } else if (err?.code === 11000) {
    const result = handleDuplicateError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources ?? [];

  // === Mongoose Validation Error ===
  } else if (err instanceof mongoose.Error.ValidationError) {
    const result = handleValidationError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources ?? [];

  // === Custom App Error ===
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];

  // === Generic Error ===
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: envVars.NODE_ENV === "development" ? err?.stack : null,
  });
};
