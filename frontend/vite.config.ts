import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Absolute base keeps deep links such as /admin/login working when Express
  // serves the build. For GitHub Pages subdirectory hosting, build with
  // `npx vite build --base=/zentry-site/` instead.
  base: "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
