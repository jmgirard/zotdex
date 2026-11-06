import { BASE, ORIGIN } from "../base.ts";

// The host's robots.txt, which the site can have because it is served at its host's root
// (D-068). It lets every crawler read every path and names the sitemap.
export function GET(): Response {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}${BASE}sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain" },
  });
}
