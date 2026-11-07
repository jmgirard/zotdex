import { createHash } from "node:crypto";
import sharp from "sharp";
import { beforeAll, describe, expect, test } from "vitest";
import { pickIconPath, redrawIcon } from "../src/upstream/icon.ts";

describe("pickIconPath", () => {
  test.each<[string, unknown, string | undefined]>([
    ["the smallest key at or above 96", { "48": "a.png", "128": "c.png", "96": "b.png" }, "b.png"],
    ["the smallest key above 96 when none is 96", { "256": "d.png", "128": "c.png", "32": "a.png" }, "c.png"],
    ["the largest key when none reaches 96", { "16": "a.png", "48": "b.png", "32": "c.png" }, "b.png"],
    ["only keys that are whole numbers", { big: "x.png", "96px": "y.png", "48": "a.png" }, "a.png"],
    ["a path without one leading slash", { "96": "/content/icon.png" }, "content/icon.png"],
    ["a path without one leading ./", { "96": "./content/icon.png" }, "content/icon.png"],
    ["nothing for a value that is not a string", { "96": 96, "48": "a.png" }, undefined],
    ["nothing for a .. segment", { "96": "content/../../icon.png" }, undefined],
    ["nothing for an empty segment", { "96": "content//icon.png" }, undefined],
    ["nothing for no whole-number key", { large: "a.png" }, undefined],
    ["nothing for a string", "icon.png", undefined],
    ["nothing for an array", ["icon.png"], undefined],
    ["nothing for null", null, undefined],
  ])("takes %s", (_name, icons, path) => {
    expect(pickIconPath(icons)).toBe(path);
  });
});

describe("redrawIcon", () => {
  const sources: Record<string, Uint8Array> = {};
  beforeAll(async () => {
    const red = sharp({ create: { width: 40, height: 20, channels: 4, background: "#c00" } });
    sources.png = new Uint8Array(await red.clone().png().toBuffer());
    sources.jpeg = new Uint8Array(await red.clone().jpeg().toBuffer());
    sources.webp = new Uint8Array(await red.clone().webp().toBuffer());
    sources.svg = new TextEncoder().encode(
      '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#c00"/></svg>',
    );
    sources.viewBoxSvg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 4"><rect width="8" height="4" fill="#c00"/></svg>',
    );
    sources.wide = new Uint8Array(
      await sharp({ create: { width: 4097, height: 1, channels: 3, background: "#c00" } }).png().toBuffer(),
    );
    sources.side4096 = new Uint8Array(
      await sharp({ create: { width: 4096, height: 1, channels: 3, background: "#c00" } }).png().toBuffer(),
    );
  });

  test.each(["png", "jpeg", "webp", "svg", "viewBoxSvg", "side4096"])("redraws a %s source as a 96×96 PNG", async (name) => {
    const icon = await redrawIcon(sources[name], new Set());
    expect(icon).toBeDefined();
    const { format, width, height } = await sharp(icon!.png).metadata();
    expect({ format, width, height }).toEqual({ format: "png", width: 96, height: 96 });
    expect(icon!.sha256).toBe(createHash("sha256").update(icon!.png).digest("hex"));
  });

  test("draws an SVG's shapes, not an empty image", async () => {
    const icon = await redrawIcon(sources.svg, new Set());
    const { channels } = await sharp(icon!.png).stats();
    // The red channel's mean is near 204 (#cc) where the square fills the whole icon.
    expect(channels[0].mean).toBeGreaterThan(190);
  });

  test.each<[string, () => Uint8Array]>([
    ["text that is no image", () => new TextEncoder().encode("hello")],
    ["an HTML page", () => new TextEncoder().encode("<html><body><svg></svg></body></html>")],
    ["a PNG signature with no image after it", () => sources.png.slice(0, 16)],
    ["a side over 4096 px", () => sources.wide],
  ])("gives no icon for %s", async (_name, bytes) => {
    expect(await redrawIcon(bytes(), new Set())).toBeUndefined();
  });

  test("gives no icon for a source whose SHA-256 is in the template list", async () => {
    const hash = createHash("sha256").update(sources.png).digest("hex");
    expect(await redrawIcon(sources.png, new Set([hash]))).toBeUndefined();
    expect(await redrawIcon(sources.png, new Set(["0".repeat(64)]))).toBeDefined();
  });
});
