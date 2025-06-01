import 'dotenv/config';
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
import messagesRoutes from "./routes/messages.js";
import testRoute from "./routes/test.js";
import authMiddleware from "./middleware/auth.js";
import contactRoutes from './routes/contact.js';
import translationsRoutes from './routes/translations.js';
import apiRoutes from './routes/api.js';
import contentRoutes from './routes/content.js';
import pool from './db/connection.js';

// ===== Server Setup =====
const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors({
  origin: [
    'https://www.keshevplus.co.il',
    'https://keshevplus.co.il',
    'http://localhost:5173'
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
    'X-Api-Version',
    'x-auth-token'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Preflight for all routes
app.options('*', cors({
  origin: [
    'https://www.keshevplus.co.il',
    'https://keshevplus.co.il',
    'http://localhost:5173'
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
    'X-Api-Version',
    'x-auth-token'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400
}));

// ===== Routes =====
app.use('/auth', authRoutes);
app.use('/admin', authMiddleware, adminRoutes);
app.use('/leads', leadsRoutes);
app.use('/messages', messagesRoutes);
app.use('/test', testRoute);
app.use('/contact', contactRoutes);
app.use('/translations', translationsRoutes);
app.use('/content', contentRoutes);
app.use('/api', apiRoutes);

console.log('Registered all base routes');

// ===== Health Check =====
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ===== Root Response =====
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Connected!",
    version: "1.0.0",
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== Verify Database Connection =====
if (pool) {
  // Add delay to ensure pool is ready
  setTimeout(() => {
    pool.query('SELECT NOW()')
      .then(result => {
        console.log('Database connection verified successfully:', result.rows[0].now);
      })
      .catch(err => {
        console.error('Database connection test failed:', err.message);
        
        // Provide helpful troubleshooting info
        console.log('\nDatabase troubleshooting tips:');
        console.log('1. Check if PostgreSQL is running locally');
        console.log('2. Verify the DATABASE_URL in your .env file');
        console.log('3. Make sure the postgres user exists and has the correct permissions');
        console.log('4. Try connecting with psql to verify credentials manually\n');
      });
  }, 1000);
}

// ===== Serve React App in Production (Non-Vercel) =====
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  console.log("Running in production mode (local) - serving static files from client/dist");

  app.use(express.static(path.join(__dirname, "../client/dist"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
      else if (path.endsWith(".css")) res.setHeader("Content-Type", "text/css");
    }
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html')); 
  });
} else if (process.env.NODE_ENV !== 'production') {
  app.get("*", (req, res) => {
    return res.status(404).send('Resource not found. In development, ensure your frontend dev server is running or a proxy is configured.');
  });
}

// ===== Error Handling =====
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

// ===== Local Server Start =====
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  console.log('Server configured for serverless environment');
}

// ===== Export App for Vercel =====
export default app;
