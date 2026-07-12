import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    allowedHosts: true,
  },
});
