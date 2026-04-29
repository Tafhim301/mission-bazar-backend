import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

// === validateRequest ==========================================================
// Validates req.body directly against the provided Zod schema.
// For multipart/form-data routes, body fields are usually in req.body.data
// (a JSON string); pass parseData: true to auto-parse it.
// =============================================================================

export const validateRequest =
  (schema: ZodType, opts?: { parseData?: boolean }) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (opts?.parseData && typeof req.body?.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
