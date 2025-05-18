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
import contactRoutes from "./api/contact.js";
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

// ===== Static File Serving =====
// Serve static files FIRST, before any auth or API middleware
// This allows quick serving of assets like images, CSS, and JS
app.use(express.static(path.join(__dirname, "public")));

// ===== General Middleware =====
// CORS: Allow cross-origin requests (important for frontend-backend communication)
app.use(cors({
  origin: [
    'https://www.keshevplus.co.il',
    'https://keshevplus.co.il'
  ],
  credentials: true
}));


app.options('/auth/login', (req, res) => {
  res.sendStatus(200);
});


// Helmet: Set security-related HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity, but consider enabling it in production with proper configuration
}));

// Morgan: HTTP request logger for debugging and monitoring
app.use(morgan("dev"));

// Body Parsers: Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
 
 
    // Check for required fields
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: [
          { field: 'name', message: !req.body.name ? 'Name is required' : '' },
          { field: 'email', message: !req.body.email ? 'Email is required' : '' },
          { field: 'message', message: !req.body.message ? 'Message is required' : '' }
        ].filter(e => e.message)
      });
    }
    
    // Forward to the neon leads endpoint directly using proper protocol
    axios({
      method: 'post',
      url: `${getBaseUrl(req)}${API_BASE_URL}/neon/leads`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('Successfully forwarded to neon leads endpoint');
      res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        data: response.data
      });
    })
    .catch(error => {
      console.error('Error forwarding to neon leads:', error.message);
      
      // Provide detailed error information
      res.status(500).json({
        success: false,
        message: 'Error processing form submission',
        error: error.message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
      });
    });
  } else {
    // For other methods (PUT, DELETE, etc.)
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
      allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Serve static assets and the React app
if (process.env.NODE_ENV === 'production') {
  console.log("Running in production mode - serving static files from client/dist");

  // Serve static assets from the React build directory
  app.use(express.static(path.join(__dirname, "public"), {
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

  // THIS IS CRITICAL: The catch-all route that serves the React app
  app.get("*", (req, res) => {
    // Explicitly resolve the absolute path to index.html
    const indexPath = path.resolve(__dirname, "../client/dist/index.html");
    
    // Check if the file exists
    if (fs.existsSync(indexPath)) {
      // Set no-cache headers to ensure fresh content on refresh
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.sendFile(indexPath);
    } else {
      // Log an error if the index.html file doesn't exist at the expected path
      console.error(`Error: index.html not found at ${indexPath}`);
      res.status(500).send('Server Error: index.html not found');
    }
  });
} else {
  // In development mode, redirect all non-API routes to the development server
  app.get("*", (req, res) => {
    // Only handle non-API routes
    if (!req.path.startsWith('/api')) {
      console.log(`Redirecting ${req.path} to development server`);
      res.redirect(`localhost:5000${req.path}`);
    } else {
      res.status(404).send('API endpoint not found');
    }
  });
}
 
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
