import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { log } from "./vite";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    message = validationError.message;
  }

  if (status === 500) {
    log(err.stack, "error");
  } else {
    log(`Error: ${status} - ${message}`, "error");
  }

  res.status(status).json({ message });
};
