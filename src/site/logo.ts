// Zotdex's own mark (D-072), drawn on a 16 by 16 grid. The full mark is a handheld with a ringed
// lens that holds a Z, three lights, and a stepped lid line. The lens mark is that lens alone,
// cut out and scaled to fill the grid, for the 16 px places: the tab icon and the top bar.

export type Point = readonly [number, number];
export interface Circle {
  cx: number;
  cy: number;
  r: number;
}

export interface FullMark {
  // A rounded rectangle.
  body: { x: number; y: number; width: number; height: number; radius: number };
  // Openings cut out of the body: the lens, the three lights, and the lid line's gap.
  opening: Circle;
  lights: Circle[];
  lidGap: Point[];
  // Drawn inside the lens opening.
  disc: Circle;
  z: Point[];
}

// A Z of bars `bar` thick in a square of side `size` whose top left corner is (x, y). The slanted
// stroke runs from the top bar's right end to the bottom bar's left end, `slant` wide on each bar.
function zShape(x: number, y: number, size: number, bar: number, slant: number): Point[] {
  const right = x + size;
  const bottom = y + size;
  return [
    [x, y],
    [right, y],
    [right, y + bar],
    [x + slant, bottom - bar],
    [right, bottom - bar],
    [right, bottom],
    [x, bottom],
    [x, bottom - bar],
    [right - slant, y + bar],
    [x, y + bar],
  ];
}

export const FULL_MARK: FullMark = {
  body: { x: 1, y: 0.5, width: 14, height: 15, radius: 2.5 },
  opening: { cx: 6.5, cy: 6.5, r: 5 },
  lights: [
    { cx: 13.1, cy: 2.6, r: 0.75 },
    { cx: 13.1, cy: 4.8, r: 0.75 },
    { cx: 13.1, cy: 7, r: 0.75 },
  ],
  // Level under the lens, a slope up past it, then level to the right edge, 1 unit tall.
  // It ends above the body's lower corners, so it cuts only the body's straight sides.
  lidGap: [
    [1, 12],
    [10.5, 12],
    [12, 9.5],
    [15, 9.5],
    [15, 10.5],
    [12.4, 10.5],
    [10.9, 13],
    [1, 13],
  ],
  disc: { cx: 6.5, cy: 6.5, r: 4 },
  z: zShape(4.25, 4.25, 4.5, 1.15, 1.7),
};

// How far the lens mark's rim reaches past the lens opening, in the full mark's units, and the
// radius of the rim's outer edge on the lens mark's grid, which leaves 0.5 free at each edge.
export const RIM_WIDTH = 1;
export const LENS_RADIUS = 7.5;

export interface LensMark {
  rimOuter: Circle;
  rimInner: Circle;
  disc: Circle;
  z: Point[];
}

// The full mark's lens and its rim, scaled so the rim's outer edge has radius LENS_RADIUS and
// moved so the lens is centered on the grid. Nothing is redrawn, so the two marks stay one lens.
export function lensMark(full: FullMark = FULL_MARK): LensMark {
  const { opening } = full;
  const scale = LENS_RADIUS / (opening.r + RIM_WIDTH);
  const at = (x: number, y: number): Point => [8 + (x - opening.cx) * scale, 8 + (y - opening.cy) * scale];
  const circle = ({ cx, cy, r }: Circle): Circle => {
    const [x, y] = at(cx, cy);
    return { cx: x, cy: y, r: r * scale };
  };
  return {
    rimOuter: { ...circle(opening), r: LENS_RADIUS },
    rimInner: circle(opening),
    disc: circle(full.disc),
    z: full.z.map(([x, y]) => at(x, y)),
  };
}

// Fills for each part. The PNG files take the light ones, as an image has no color scheme.
export const LIGHT = { body: "#1d5fb8", disc: "#a9cbff", z: "#0e2f5c" };
export const DARK = { body: "#7fb0ff", disc: "#1d5fb8", z: "#ffffff" };

const num = (value: number) => String(Number(value.toFixed(4)));
const pair = ([x, y]: Point) => `${num(x)} ${num(y)}`;
const circlePath = ({ cx, cy, r }: Circle) =>
  `M${num(cx - r)} ${num(cy)}A${num(r)} ${num(r)} 0 1 0 ${num(cx + r)} ${num(cy)}A${num(r)} ${num(r)} 0 1 0 ${num(cx - r)} ${num(cy)}Z`;
// Absolute M and L commands only. A filled path closes itself, so it needs no Z command.
const polygonPath = (points: Point[]) => `M${points.map(pair).join("L")}`;
const roundedRect = ({ x, y, width: w, height: h, radius: r }: FullMark["body"]) =>
  `M${num(x + r)} ${num(y)}H${num(x + w - r)}A${num(r)} ${num(r)} 0 0 1 ${num(x + w)} ${num(y + r)}V${num(y + h - r)}` +
  `A${num(r)} ${num(r)} 0 0 1 ${num(x + w - r)} ${num(y + h)}H${num(x + r)}A${num(r)} ${num(r)} 0 0 1 ${num(x)} ${num(y + h - r)}` +
  `V${num(y + r)}A${num(r)} ${num(r)} 0 0 1 ${num(x + r)} ${num(y)}Z`;
const circleTag = ({ cx, cy, r }: Circle, extra: string) => `<circle${extra} cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}"/>`;

// The lens mark's three shapes: the rim, the disc, and the Z. `fills` gives each its fill;
// without it each gets a class, for a page whose stylesheet colors them.
export function lensShapes(fills?: typeof LIGHT): string {
  const lens = lensMark();
  const paint = (part: keyof typeof LIGHT, name: string) => (fills ? ` class="${name}" fill="${fills[part]}"` : ` class="${name}"`);
  return (
    `<path${paint("body", "logo-rim")} fill-rule="evenodd" d="${circlePath(lens.rimOuter)}${circlePath(lens.rimInner)}"/>` +
    circleTag(lens.disc, paint("disc", "logo-disc")) +
    `<path${paint("z", "logo-z")} d="${polygonPath(lens.z)}"/>`
  );
}

// The favicon: the lens mark with the light fills, and the dark ones for a dark system scheme.
export function faviconSvg(): string {
  const dark = `@media (prefers-color-scheme: dark) { .logo-rim { fill: ${DARK.body} } .logo-disc { fill: ${DARK.disc} } .logo-z { fill: ${DARK.z} } }`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><style>${dark}</style>${lensShapes(LIGHT)}</svg>\n`;
}

// The PNG files: each draws a mark in the light fills on a white square `size` pixels wide,
// `margin` grid units wider than the 16 by 16 grid on each side.
export const PICTURES = {
  "favicon.png": { mark: "lens", margin: 0, size: 32 },
  "apple-touch-icon.png": { mark: "full", margin: 2, size: 180 },
  "preview.png": { mark: "full", margin: 4, size: 1200 },
} as const;
export type PictureName = keyof typeof PICTURES;

export function pictureSvg(name: PictureName): string {
  const { mark, margin, size } = PICTURES[name];
  const side = 16 + 2 * margin;
  const box = `${num(-margin)} ${num(-margin)} ${num(side)} ${num(side)}`;
  const shapes = mark === "lens" ? lensShapes(LIGHT) : fullShapes();
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${box}">` +
    `<rect x="${num(-margin)}" y="${num(-margin)}" width="${num(side)}" height="${num(side)}" fill="#ffffff"/>${shapes}</svg>`
  );
}

function fullShapes(full: FullMark = FULL_MARK): string {
  const cuts = [circlePath(full.opening), ...full.lights.map(circlePath), polygonPath(full.lidGap)].join("");
  return (
    `<path fill="${LIGHT.body}" fill-rule="evenodd" d="${roundedRect(full.body)}${cuts}"/>` +
    circleTag(full.disc, ` fill="${LIGHT.disc}"`) +
    `<path fill="${LIGHT.z}" d="${polygonPath(full.z)}"/>`
  );
}
