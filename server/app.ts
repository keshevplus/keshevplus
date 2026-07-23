import express, { type Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import { ensureSchema } from "./migrate";
import { registerLoadTestSeedRoutes } from "./seed-load-test";

const PgSession = connectPgSimple(session);

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const current = rateLimitBuckets.get(key);
    if (!current || current.resetAt <= now) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > maxRequests) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000).toString());
      return res.status(429).json({ error: "Too many requests" });
    }
    return next();
  };
}

export async function createApp(): Promise<Express> {
  const app = express();

  app.set("trust proxy", 1);

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    next();
  });

  const allowedOrigins = (
    process.env.CORS_ALLOWED_ORIGINS ||
    "https://keshevplus.co.il,https://www.keshevplus.co.il,https://dev.keshevplus.co.il,https://admin.keshevplus.co.il,https://www.admin.keshevplus.co.il,https://admin.keshevplus.com,https://lp.keshevplus.co.il,https://lp.keshevplus.com,https://keshevplus.com,https://www.keshevplus.com"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,x-auth-token");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ extended: false }));

  const authWriteLimit = rateLimit(20, 60 * 1000);
  const apiWriteLimit = rateLimit(120, 60 * 1000);
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api") || !["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      return next();
    }
    return req.path.startsWith("/api/auth")
      ? authWriteLimit(req, res, next)
      : apiWriteLimit(req, res, next);
  });

  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET;
  if (isProduction && !sessionSecret) {
    throw new Error("SESSION_SECRET is required in production");
  }

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: sessionSecret || "keshevplus-session-secret-change-in-development",
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

    if (!isProduction) {
      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };
    }

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

  await ensureSchema();
  await registerRoutes(app);
  registerLoadTestSeedRoutes(app);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return app;
}
