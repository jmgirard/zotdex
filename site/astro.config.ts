import { defineConfig } from "astro/config";
import { BASE } from "./src/base.ts";

// pnpm site (src/site/site.ts) passes a temporary outDir, and the data file path through
// ZPI_SITE_DATA. Every link inside the site starts with BASE, the site's path on its host.
export default defineConfig({
  output: "static",
  base: BASE,
  trailingSlash: "always",
  // Each page carries its styles, so it needs no request for a stylesheet.
  build: { format: "directory", inlineStylesheets: "always" },
  // The home page's module script stays in the page, also past Vite's default limit of 4 KiB.
  // The limit applies to every module script and imported asset, and today this is the only one.
  vite: { build: { assetsInlineLimit: 32768 } },
});
