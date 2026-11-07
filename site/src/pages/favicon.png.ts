import { picturePng, pngResponse } from "../../../src/site/logo-png.ts";

// favicon.png, drawn from src/site/logo.ts at build time.
export async function GET(): Promise<Response> {
  return pngResponse(await picturePng("favicon.png"));
}
