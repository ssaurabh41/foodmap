import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `--mode mockup` bundles everything into one HTML file so the mockup can be shared as a page.
export default defineConfig(({ mode }) => ({
  plugins: mode === "mockup" ? [react(), viteSingleFile()] : [react()],
  build: { outDir: mode === "mockup" ? "dist-mockup" : "dist" },
}));
