/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import AppError from "./appError";
import { envVars } from "../config/env";


export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorSources: any = [];
  let statusCode = 500;
  let message = `Something Went Wrong!! ${err.message}`;
  if (err.code === 11000) {
    const duplicate = err.message.match(/"([^"]*)"/);
    message = `${duplicate[1]} Error Occured`;
    statusCode = 400;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid MongoDB ObjectID PLEASE PROVIDE A VALID Id";
  } else if(err.name === "ZodError"){
    statusCode = 400;
    message = "Zod Error"
    err.issues.forEach((issue : any) => {
        errorSources.push({
            path: issue.path[issue.path.length - 1],
            message : issue.message
        })

    })

  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error"
    const errors = Object.values(err.errors);

    errors.forEach((errorObject: any) => {
      errorSources.push({
        path: errorObject.path,
        message: errorObject.message,
      });

    });
    message = "Validation Error Occured";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message: message,
    errorSources,
    err,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
