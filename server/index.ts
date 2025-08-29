import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

export async function setupApp() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Basic health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Check for required environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set in your .env file.");
  }
  log("DATABASE_URL present: yes", "startup");

  // Register routes on the Express app
  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return app;
}

export async function startServer() {
  await setupApp();
  const server: Server = createServer(app);

  // Setup Vite in development, serve static in production
  if (app.get("env") === "development") {
    log("initializing Vite dev middleware", "startup");
    await setupVite(app, server);
    log("Vite dev middleware ready", "startup");
  } else {
    serveStatic(app);
  }

  // Use PORT from env or default to 5000
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
}

// Start the server if this file is run directly
if (import.meta.url.endsWith
  (`/${
    process.argv[1].split("/").slice(-1)[0]
  }`)) {
  startServer().catch(err => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });
}

export { app };
