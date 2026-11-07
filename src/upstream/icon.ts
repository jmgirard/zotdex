import { createHash } from "node:crypto";

// The side, in pixels, of each icon file that the build writes.
export const ICON_SIZE = 96;

// The longest one icon draw may take.
export const ICON_DRAW_SECONDS = 10;

// The widest or tallest source image the build redraws, as sharp's metadata gives it.
export const ICON_MAX_SIDE = 4096;

// The SHA-256 of the stock icons of windingwind/zotero-plugin-template, which many plugins ship
// unchanged, so the icon tells nothing about the plugin. Read at commit
// bf1ff3a6fb216631dafb91413d42440dd7feecfe, where the files moved to addon/content/icons/; the
// files at addon/chrome/content/icons/ in 1ab8af4ad24257903b53019e24a2f0439d8facdf have the same
// bytes (both read 2026-11-07).
export const TEMPLATE_ICONS: ReadonlySet<string> = new Set([
  // addon/content/icons/favicon.png
  "2fd7c8f97dea9a603d03e9e418a9ae3b58414f8f7c262b982dab7a425b10860b",
  // addon/content/icons/favicon@0.5x.png
  "cc8b158a3f035fe70aa817b259788e7e51e334e6541813f8b6216a3a13bac105",
]);

// The path of the icon that a manifest's `icons` value names, or undefined when it names none
// the build reads. Of the keys that are base-10 whole numbers, it takes the smallest at or above
// ICON_SIZE, else the largest; other keys are ignored. The value must be a string. One leading
// "/" or "./" is dropped, and a path with an empty or ".." segment is refused.
export function pickIconPath(icons: unknown): string | undefined {
  if (typeof icons !== "object" || icons === null || Array.isArray(icons)) return undefined;
  const sizes = Object.keys(icons)
    .filter((key) => /^[0-9]+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (sizes.length === 0) return undefined;
  const key = sizes.find((size) => Number(size) >= ICON_SIZE) ?? sizes[sizes.length - 1];
  const value = (icons as Record<string, unknown>)[key];
  if (typeof value !== "string") return undefined;
  const path = value.replace(/^\.?\//, "");
  if (path.split("/").some((segment) => segment === "" || segment === "..")) return undefined;
  return path;
}

export type IconFormat = "png" | "jpeg" | "webp" | "svg";

// The image format of `bytes`, judged by their first bytes, or undefined for any other file.
// An SVG is text whose first tag, after an optional byte-order mark, white space, XML
// declaration, comments, and doctype, is `<svg`, within its first 4096 bytes.
export function iconFormat(bytes: Uint8Array): IconFormat | undefined {
  const starts = (signature: number[], at = 0) => signature.every((byte, i) => bytes[at + i] === byte);
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (starts([0xff, 0xd8, 0xff])) return "jpeg";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 4096)).replace(/^﻿/, "");
  const head = text.replace(/^(?:\s|<\?xml[^>]*\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>)*/i, "");
  return /^<svg[\s>]/i.test(head) ? "svg" : undefined;
}

// The icon file for the source bytes of a plugin's icon: a ICON_SIZE × ICON_SIZE PNG with
// the image fit inside on a transparent background, and its SHA-256 in hex. It returns
// undefined when the bytes are none of the four formats, fail to decode, have a side over
// ICON_MAX_SIDE, have a SHA-256 in `templates`, or are an SVG that holds an `<image` or
// `<feImage` element, whose embedded picture limitInputPixels does not bound. An SVG is drawn
// as pixels, so no SVG reaches a page. sharp writes no metadata unless asked, and its timeout
// option stops a draw after ICON_DRAW_SECONDS. sharp loads only here, so the reader's other
// users, such as the discovery bot, do not load it.
export async function redrawIcon(
  bytes: Uint8Array,
  templates: ReadonlySet<string> = TEMPLATE_ICONS,
): Promise<{ png: Uint8Array; sha256: string } | undefined> {
  const format = iconFormat(bytes);
  if (!format) return undefined;
  if (format === "svg" && /<(?:\w+:)?(?:image|feImage)[\s/>]/i.test(new TextDecoder().decode(bytes))) return undefined;
  if (templates.has(createHash("sha256").update(bytes).digest("hex"))) return undefined;
  const limitInputPixels = ICON_MAX_SIDE * ICON_MAX_SIDE;
  try {
    const { default: sharp } = await import("sharp");
    const { width, height } = await sharp(bytes, { limitInputPixels }).metadata();
    if (!width || !height || width > ICON_MAX_SIDE || height > ICON_MAX_SIDE) return undefined;
    // An SVG is drawn at the density that makes its longer side ICON_SIZE, so a small one is
    // drawn sharp rather than scaled up. Its metadata reads its size at 72 dpi.
    const density = format === "svg" ? (72 * ICON_SIZE) / Math.max(width, height) : undefined;
    const png = await sharp(bytes, { limitInputPixels, ...(density ? { density } : {}) })
      .resize(ICON_SIZE, ICON_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .timeout({ seconds: ICON_DRAW_SECONDS })
      .toBuffer();
    return { png: new Uint8Array(png), sha256: createHash("sha256").update(png).digest("hex") };
  } catch {
    return undefined;
  }
}
