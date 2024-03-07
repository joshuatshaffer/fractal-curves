import react from "@vitejs/plugin-react";
import _astroturf from "astroturf/vite-plugin.js";
import { PluginOption, defineConfig } from "vite";

// Something is wrong with the type definition of Astroturf's Vite plugin and
// the way it's exported.
const astroturf = (
  _astroturf as unknown as { default: (options?: any) => PluginOption }
).default;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), astroturf()],
});
