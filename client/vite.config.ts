import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    outDir: "../server/dist/public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
