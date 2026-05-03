import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

// === validateRequest ==========================================================
// Validates req.body directly against the provided Zod schema.
//
// parseData: true  — two modes (tried in order):
//   1. Legacy: if req.body.data is a JSON string, parse the whole body from it.
//   2. Multipart field-level: iterate req.body and JSON.parse any individual
//      string field whose value starts with "[" or "{" (arrays / objects sent
//      as JSON strings from multipart/form-data).
// =============================================================================

export const validateRequest =
  (schema: ZodType, opts?: { parseData?: boolean }) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (opts?.parseData) {
        if (typeof req.body?.data === "string") {
          // Legacy pattern: entire body serialised into a single "data" field
          req.body = JSON.parse(req.body.data);
        } else {
          // Multipart pattern: individual fields may be JSON-stringified arrays
          // or objects (e.g. tags, specifications, variants, deleteImages).
          const parsed: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(req.body as Record<string, unknown>)) {
            if (
              typeof value === "string" &&
              (value.startsWith("[") || value.startsWith("{"))
            ) {
              try {
                parsed[key] = JSON.parse(value);
              } catch {
                parsed[key] = value; // leave as-is if not valid JSON
              }
            } else {
              parsed[key] = value;
            }
          }
          req.body = parsed;
        }
      }
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
