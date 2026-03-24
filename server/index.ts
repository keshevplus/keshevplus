import { createServer } from "http";
import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  console.log("Starting server, NODE_ENV:", process.env.NODE_ENV);

  const app = await createApp();
  console.log("Routes registered");

  const server = createServer(app);

  if (app.get("env") === "development") {
    console.log("Setting up Vite...");
    try {
      await setupVite(app, server);
      console.log("Vite ready");
    } catch (e) {
      console.error("Vite setup error:", e);
      process.exit(1);
    }
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
})();
