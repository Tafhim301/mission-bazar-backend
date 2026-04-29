import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const notFound = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorSources: [
      {
        path: req.originalUrl,
        message: "This route does not exist on this server",
      },
    ],
  });
};
