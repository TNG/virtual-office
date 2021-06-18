import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
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
