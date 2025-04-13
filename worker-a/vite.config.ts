import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  server: { allowedHosts: ["dev.promptify.ai"] },
  plugins: [
    cloudflare({
      auxiliaryWorkers: [{ configPath: "../worker-b/wrangler.toml" }],
      persistState: { path: "../.data/" },
    }),
  ],
});
