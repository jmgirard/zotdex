import { faviconSvg } from "../../../src/site/logo.ts";

// The tab icon: the lens mark, with each color scheme's fills (D-072).
export function GET(): Response {
  return new Response(faviconSvg(), { headers: { "Content-Type": "image/svg+xml" } });
}
