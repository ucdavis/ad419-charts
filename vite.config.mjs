import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "src/public",
  publicDir: "../static",
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "../../docs",
    emptyOutDir: true,
  },
});
