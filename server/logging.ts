import { type Request, type Response, type NextFunction } from "express";
import { log } from "./vite";

const SENSITIVE_KEYS = ["password", "token"];

const redact = (key: string, value: any) => {
  if (SENSITIVE_KEYS.includes(key)) {
    return "[REDACTED]";
  }
  return value;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const { method, path } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    let logLine = `${method} ${path} ${statusCode} ${duration}ms`;

    if (path.startsWith("/api")) {
      const { body } = req;
      if (body && Object.keys(body).length > 0) {
        logLine += ` - body: ${JSON.stringify(body, redact)}`;
      }
    }

    log(logLine);
  });

  next();
};
