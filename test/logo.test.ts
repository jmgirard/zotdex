import { describe, expect, test } from "vitest";
import { FULL_MARK, LIGHT, type Point } from "../src/site/logo.ts";
import { inCircle, inPolygon, inRoundedRect } from "./support/logo-geometry.ts";

const inBody = (point: Point) => inRoundedRect(point, FULL_MARK.body);

// Every point of a 0.05 grid over the 16 by 16 square.
const grid: Point[] = [];
for (let x = 0; x <= 16; x += 0.05) for (let y = 0; y <= 16; y += 0.05) grid.push([x, y]);

describe("the full mark", () => {
  const { body, opening, lights, lidGap, disc, z } = FULL_MARK;
  const cuts: [string, (point: Point) => boolean][] = [
    ["opening", (point) => inCircle(point, opening)],
    ...lights.map((light, i): [string, (point: Point) => boolean] => [`light ${i}`, (point) => inCircle(point, light)]),
    ["lid gap", (point) => inPolygon(point, lidGap)],
  ];

  test("has a rounded body in the site blue inside the 16 by 16 grid", () => {
    expect(LIGHT.body).toBe("#1d5fb8");
    expect(body.x).toBeGreaterThanOrEqual(0);
    expect(body.y).toBeGreaterThanOrEqual(0);
    expect(body.x + body.width).toBeLessThanOrEqual(16);
    expect(body.y + body.height).toBeLessThanOrEqual(16);
    expect(body.radius).toBeGreaterThan(0);
  });

  test("cuts the lens opening, three round lights, and a lid gap out of the body, each apart from the others", () => {
    expect(lights).toHaveLength(3);
    for (const [name, inside] of cuts) {
      const points = grid.filter(inside);
      expect(points.length, name).toBeGreaterThan(0);
      expect(points.every(inBody), name).toBe(true);
    }
    for (const point of grid) expect(cuts.filter(([, inside]) => inside(point)).length).toBeLessThanOrEqual(1);
  });

  test("runs the lid gap across the body's full width, stepping up past the lens", () => {
    const xs = lidGap.map(([x]) => x);
    expect(Math.min(...xs)).toBe(body.x);
    expect(Math.max(...xs)).toBe(body.x + body.width);
    const left = lidGap.filter(([x]) => x === body.x).map(([, y]) => y);
    const right = lidGap.filter(([x]) => x === body.x + body.width).map(([, y]) => y);
    expect(Math.min(...right)).toBeLessThan(Math.min(...left));
  });

  test("draws the disc inside the lens opening and the Z inside the disc", () => {
    expect(disc.r).toBeLessThan(opening.r);
    expect(Math.hypot(disc.cx - opening.cx, disc.cy - opening.cy) + disc.r).toBeLessThan(opening.r);
    for (const corner of z) expect(inCircle(corner, disc), String(corner)).toBe(true);
    expect([LIGHT.disc, LIGHT.z]).toEqual(["#a9cbff", "#0e2f5c"]);
  });
});
