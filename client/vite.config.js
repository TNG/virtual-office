import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:9000",
      },
      "/api/updates": {
        target: "ws://localhost:9000",
        ws: true,
      },
    },
  },
});
