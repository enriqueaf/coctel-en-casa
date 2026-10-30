// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://coctel-en-casa.enrique.workers.dev",
  adapter: cloudflare({
    imageService: "compile",
  }),
  vite: {
    ssr: {
      noExternal: [],
    },
  },
});
