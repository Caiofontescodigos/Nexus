import type { Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import type { AuthenticatedRequest } from "../types/index.js";

export function validate(schema: ZodSchema) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(result.error);
    }
    req.body = result.data;
    next();
  };
}
