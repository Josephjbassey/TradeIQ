import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes/index";
import { requestLogger } from "./logging";
import { errorHandler } from "./errors";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "./config";

const app = express();

export async function setupApp() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Basic health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(requestLogger);

  // Register routes on the Express app
  registerRoutes(app);

  app.use(errorHandler);

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
  const port = config.PORT;
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
