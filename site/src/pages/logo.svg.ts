import { logoSvg } from "../../../src/site/logo.ts";

// The full mark with no background, which the README shows.
export function GET(): Response {
  return new Response(logoSvg(), { headers: { "Content-Type": "image/svg+xml" } });
}
