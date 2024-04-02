import react from "@vitejs/plugin-react";
import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wyw()],
  base: "/fractal-curves/",

  server: {
    host: "0.0.0.0",
    headers: {
      // Make the app run in an isolated context so that we can have high
      // precision timing.
      //
      // https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/High_precision_timing#reduced_precision
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
