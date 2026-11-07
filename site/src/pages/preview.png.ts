import { picturePng, pngResponse } from "../../../src/site/logo-png.ts";

// preview.png, drawn from src/site/logo.ts at build time.
export async function GET(): Promise<Response> {
  return pngResponse(await picturePng("preview.png"));
}
