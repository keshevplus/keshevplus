import express, { type Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";

const PgSession = connectPgSimple(session);

export async function createApp(): Promise<Express> {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "keshevplus-session-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

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
        const formattedTime = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        console.log(`${formattedTime} [express] ${logLine}`);
      }
    });

    next();
  });

  await registerRoutes(app);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return app;
}
