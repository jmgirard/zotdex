import { picturePng, pngResponse } from "../../../src/site/logo-png.ts";

// apple-touch-icon.png, drawn from src/site/logo.ts at build time.
export async function GET(): Promise<Response> {
  return pngResponse(await picturePng("apple-touch-icon.png"));
}
