import path from "path";
import dotenv from "dotenv";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.email') });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import leadsRoutes from "./routes/leads.js";
import neonLeadsRoutes from "./routes/neon-leads.js";
import testRoute from "./routes/test.js";
import authMiddleware from "./middleware/auth.js";
import contactRoutes from './routes/contact.js';

/**
 * ================================
 * Keshev Plus Server Configuration
 * ================================
 *
 * This file sets up the Express server, configures middleware, and serves static files.
 * Each section is documented and categorized for clarity and maintainability.
 */

// ===== Imports and Constants =====
const API_BASE_URL = process.env.VITE_API_BASE_URL;
const app = express();
const PORT = process.env.PORT || 5000;

// ===== General Middleware =====
// CORS: Allow cross-origin requests (important for frontend-backend communication)
app.use(cors({
  origin: [
    'https://www.keshevplus.co.il',
    'https://keshevplus.co.il',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Accept-Version', 
    'Content-Length', 
    'Content-MD5', 
    'Date', 
    'X-Api-Version'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

// Helmet: Set security-related HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity, but consider enabling it in production with proper configuration
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow resources to be loaded by other origins
}));

// Morgan: HTTP request logger for debugging and monitoring
app.use(morgan("dev"));

// Body Parsers: Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle OPTIONS requests for all routes to ensure preflight checks pass
app.options('*', cors({
  origin: [
    'https://www.keshevplus.co.il',
    'https://keshevplus.co.il'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Accept-Version', 
    'Content-Length', 
    'Content-MD5', 
    'Date', 
    'X-Api-Version'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400 // Cache preflight results for 24 hours (in seconds)
}));

// ===== Utility Functions =====
// Set the base URL for API requests (used for dynamic environments)
const getBaseUrl = (req) => {
  // In production (Vercel), use https
  if (process.env.NODE_ENV === 'production') {
    return `${req.headers.host}`;
    console.log("Using production host: ", req.headers.host);
  }
  // In development, use the protocol from request or default to http
  return `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
};

// Router

// API Routes - Define these BEFORE static file handling
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/admin', authMiddleware, adminRoutes);

app.use('/api/admin/leads', leadsRoutes);
app.use('/admin/leads', leadsRoutes);

app.use('/api/test', testRoute);
app.use('/test', testRoute);

app.use('/api/contact', contactRoutes);
app.use('/contact', contactRoutes);
console.log('Registered /contact route');

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Root route handler
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Connected!",
    version: "1.0.0",
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static assets and the React app
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  console.log("Running in production mode (local) - serving static files from client/dist");

  // Serve static assets from the React build directory
  app.use(express.static(path.join(__dirname, "../client/dist"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  }));

  // Fallback: serve index.html for any route not handled above
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html')); 
  });

} else if (process.env.NODE_ENV !== 'production') {
  app.get("*", (req, res) => {
    if (!req.path.startsWith('/api')) {
      return res.status(404).send('Resource not found. In development, ensure your frontend dev server is running or a proxy is configured.');
    } else {
      next(); 
    }
  });
}

// Final catch-all for API routes not found, AFTER all other route handlers
app.use('/api/*', (req, res) => {
  res.status(404).send('API endpoint not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error occurred:", {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
    body: req.body,
  });
  res.status(500).json({
    message: "Server error",
    error: err.message,
    route: req.originalUrl,
  });
});

// In local development, start server on port
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  console.log('Server configured for serverless environment');
}

// Export the Express app for serverless environments (Vercel)
export default app;
