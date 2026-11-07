import { FULL_MARK, lensMark, type Circle, type FullMark, type Point } from "../../src/site/logo.ts";

export const inCircle = ([x, y]: Point, { cx, cy, r }: Circle) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

export function inPolygon([x, y]: Point, points: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]!;
    const [xj, yj] = points[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function inRoundedRect([x, y]: Point, { x: left, y: top, width, height, radius }: FullMark["body"]): boolean {
  const nearX = Math.min(Math.max(x, left + radius), left + width - radius);
  const nearY = Math.min(Math.max(y, top + radius), top + height - radius);
  return x >= left && x <= left + width && y >= top && y <= top + height && (x - nearX) ** 2 + (y - nearY) ** 2 <= radius * radius;
}

export type Part = "body" | "ring" | "disc" | "z" | "light" | "lid gap" | "background";

// Which part of a mark a point of the 16 by 16 grid falls in. The ring is the gap between the
// lens opening and the disc, and the lights and lid gap are cut out of the body, so the
// background shows through all three.
export function partAt(mark: "full" | "lens", point: Point): Part {
  if (mark === "lens") {
    const lens = lensMark();
    if (!inCircle(point, lens.rimOuter)) return "background";
    if (!inCircle(point, lens.rimInner)) return "body";
    if (!inCircle(point, lens.disc)) return "ring";
    return inPolygon(point, lens.z) ? "z" : "disc";
  }
  const { body, opening, lights, lidGap, disc, z } = FULL_MARK;
  if (inCircle(point, opening)) {
    if (!inCircle(point, disc)) return "ring";
    return inPolygon(point, z) ? "z" : "disc";
  }
  if (!inRoundedRect(point, body)) return "background";
  if (lights.some((light) => inCircle(point, light))) return "light";
  return inPolygon(point, lidGap) ? "lid gap" : "body";
}
