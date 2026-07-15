import express, { type Express } from "express";
import fs from "fs";
import { createRequire } from "module";
import path, { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { type Server } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const clientRoot = path.resolve(__dirname, "..", "client");
  // Root and client have separate node_modules trees (not an npm workspace).
  // Vite must be resolved from client's install so its CSS toolchain (postcss,
  // tailwindcss, autoprefixer) all comes from the same tree — mixing a root-installed
  // vite with client-installed tailwindcss breaks PostCSS's internal AST checks.
  const clientRequire = createRequire(path.join(clientRoot, "package.json"));
  const viteEntry = clientRequire.resolve("vite");
  const viteModule: any = await import(pathToFileURL(viteEntry).href);
  const createViteServer = viteModule.createServer ?? viteModule.default.createServer;
  const vite = await createViteServer({
    configFile: path.resolve(clientRoot, "vite.config.ts"),
    root: clientRoot,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
