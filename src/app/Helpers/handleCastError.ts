import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleCastError = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid MongoDB ObjectID. Please provide a valid id",
  };
};
