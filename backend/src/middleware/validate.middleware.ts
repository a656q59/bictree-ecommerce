import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

// One gate for every Zod schema. Controllers receive data that already matches
// the schema, and failures fall through to the shared error middleware as 400s.
export function validate(part: RequestPart, schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(result.error);
      return;
    }

    if (part === "body") {
      req.body = result.data;
      next();
      return;
    }

    if (part === "query") {
      req.validatedQuery = result.data;
      next();
      return;
    }

    req.validatedParams = result.data;
    next();
  };
}
