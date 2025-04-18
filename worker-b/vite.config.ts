import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  server: { allowedHosts: ["dev.promptify.ai"] },
  plugins: [
    cloudflare({
      persistState: { path: "../.data/" },
    }),
  ],
});
