import express, { type Request, Response, NextFunction } from "express";
import { spawn } from "child_process";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupSecurity } from "./middleware/security";
import { DatabaseLogger } from "./lib/logger";

const app = express();

// Start Python image generation service
function startPythonService() {
  DatabaseLogger.pythonServiceStart();
  
  const pythonProcess = spawn('python', ['main.py'], {
    cwd: './python_services',
    env: { ...process.env, OPENAI_API_KEY: process.env.OPENAI_API_KEY },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  pythonProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Uvicorn running')) {
      DatabaseLogger.pythonServiceSuccess();
    }
  });
  
  pythonProcess.stderr?.on('data', (data) => {
    DatabaseLogger.pythonServiceError(data.toString().trim());
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      DatabaseLogger.warn('python', `Service exited with code ${code}, using Node.js fallback for image generation`);
    }
  });
  
  pythonProcess.on('error', (error) => {
    DatabaseLogger.error('python', `Failed to start service: ${error.message}. Using Node.js fallback.`);
  });
  
  return pythonProcess;
}

// Start Python service
startPythonService();

// Initialize log cleanup scheduler
DatabaseLogger.initializeCleanup();

// Setup security middleware first
setupSecurity(app);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
