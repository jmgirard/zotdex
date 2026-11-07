// The limits for a screenshot that a repository's owner asks for. The download limits bind the
// request; the file limits bind the copy that the index keeps, and `pnpm check` holds every
// entry to them.

// A GitHub issue attachment link is on github.com and redirects to this S3 host (observed
// 2026-11-07 with an attachment of a public repo's issue). A link or a redirect to any other
// host is refused.
export const SCREENSHOT_HOSTS = ["github.com", "github-production-user-asset-6210df.s3.amazonaws.com"];

export const DOWNLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_MAX_PIXELS = 8000;

// The copy that the index keeps, plugins/<id>/screenshot.webp.
export const SCREENSHOT_FILE = "screenshot.webp";
export const SCREENSHOT_MAX_WIDTH = 1600;
export const SCREENSHOT_MAX_HEIGHT = 2400;
export const SCREENSHOT_MAX_BYTES = 1024 * 1024;

export type ImageFormat = "png" | "jpeg" | "webp";

// The format that the first bytes show, or undefined for any other file.
export function imageFormat(bytes: Uint8Array): ImageFormat | undefined {
  const starts = (offset: number, values: number[]) => values.every((value, i) => bytes[offset + i] === value);
  if (starts(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (starts(0, [0xff, 0xd8, 0xff])) return "jpeg";
  // "RIFF", four bytes of size, then "WEBP".
  if (starts(0, [0x52, 0x49, 0x46, 0x46]) && starts(8, [0x57, 0x45, 0x42, 0x50])) return "webp";
  return undefined;
}
