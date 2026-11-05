import { BASE, ORIGIN } from "../base.ts";
import { loadData, pluginHref } from "../data.ts";

// The one sitemap: the home page, the About page, and each plugin page, at the addresses that
// their canonical links name. pluginHref percent-encodes each id, so no address needs XML escapes.
export function GET(): Response {
  const paths = [BASE, `${BASE}about/`, ...loadData().plugins.map(({ id }) => pluginHref(id))];
  const urls = paths.map((path) => `  <url><loc>${ORIGIN}${path}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml" },
  });
}
