import sharp from "sharp";
import { pictureSvg, type PictureName } from "./logo.ts";

// One of the PNG files, drawn from its SVG at its own size, as 8-bit RGB with no alpha (D-073).
export async function picturePng(name: PictureName): Promise<Buffer> {
  return sharp(Buffer.from(pictureSvg(name))).flatten({ background: "#ffffff" }).png().toBuffer();
}

export function pngResponse(png: Buffer): Response {
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
