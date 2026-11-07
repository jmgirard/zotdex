import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, test } from "vitest";
import { imageLinks, parseScreenshotRequest, SCREENSHOT_REQUEST_LABELS } from "../src/screenshot-request/parse.ts";
import { type ScreenshotOptions, screenshotRequest } from "../src/screenshot-request/request.ts";
import { DOWNLOAD_MAX_BYTES, IMAGE_MAX_PIXELS, imageFormat } from "../src/screenshot-request/rules.ts";
import { fixtureFetch, type Responses } from "./support/fixture-fetch.ts";

const ROOT = resolve(import.meta.dirname, "..");
const ID = "first-plugin@example.org";
const ISSUE_URL = "https://api.github.com/repos/jmgirard/zotdex/issues/9";
const REPO_URL = "https://api.github.com/repos/example/first-plugin";
const LINK = "https://github.com/user-attachments/assets/4d43dc68-a99e-4e6f-8488-b6c03c672f33";
const S3 = "https://github-production-user-asset-6210df.s3.amazonaws.com/1/2-4d43dc68.png?X-Amz-Signature=x";
const GOOD = "The plugin's pane beside an item in the library.";

const body = (screenshot: string, description = GOOD, plugin = ID) =>
  `### ${SCREENSHOT_REQUEST_LABELS.plugin}\n\n${plugin}\n\n### ${SCREENSHOT_REQUEST_LABELS.screenshot}\n\n${screenshot}\n\n### ${SCREENSHOT_REQUEST_LABELS.description}\n\n${description}\n`;
const attached = (url = LINK) => `<img width="800" alt="Image" src="${url}" />`;

const image = (width: number, height: number, format: "png" | "jpeg" | "webp" = "png") =>
  sharp({ create: { width, height, channels: 3, background: { r: 40, g: 90, b: 160 } } })
    [format]()
    .toBuffer();
// Built before the tables below read it.
const png = await image(800, 500);

describe("the screenshot form", () => {
  const form = readFileSync(resolve(ROOT, ".github/ISSUE_TEMPLATE/screenshot.yml"), "utf8");

  test("has the label, and the inputs and headings that parseScreenshotRequest reads", () => {
    expect(form).toMatch(/^labels: \["screenshot"\]$/m);
    const inputs = form.split(/^ {2}- type: (?:input|textarea)$/m).slice(1);
    expect(inputs.map((block) => block.match(/^ {4}id: (\w+)$/m)?.[1])).toEqual(["plugin", "screenshot", "description"]);
    for (const block of inputs) {
      const id = block.match(/^ {4}id: (\w+)$/m)![1] as keyof typeof SCREENSHOT_REQUEST_LABELS;
      expect(block).toMatch(new RegExp(`^ {6}label: ${SCREENSHOT_REQUEST_LABELS[id]}$`, "m"));
      expect(block).toMatch(new RegExp(`^ {6}required: ${id === "plugin"}$`, "m"));
    }
    // GitHub takes an attached file only in a textarea.
    expect(form).toMatch(/^ {2}- type: textarea\n {4}id: screenshot$/m);
  });
});

describe("parseScreenshotRequest and imageLinks", () => {
  test("reads the three values, with an empty input as blank", () => {
    expect(parseScreenshotRequest(body(attached(), "_No response_"))).toEqual({ ok: true, request: { plugin: ID, screenshot: attached(), description: "" } });
  });

  test("fails on a heading that a hidden comment repeats", () => {
    expect(parseScreenshotRequest(`<!--\n### Screenshot\n-->\n${body("")}`)).toMatchObject({ ok: false, failure: "duplicate-heading" });
  });

  test("finds an <img> src and a Markdown image's link, in order, once each", () => {
    const text = `![shot](${S3})\n${attached()}\n![again](<${S3}> "title")`;
    expect(imageLinks(text)).toEqual([S3, LINK]);
  });

  test("finds no image in a plain link or in text", () => {
    expect(imageLinks(`${LINK}\n[a link](${LINK}) and words`)).toEqual([]);
  });
});

describe("imageFormat", () => {
  test("names PNG, JPEG, and WebP by their first bytes, and nothing else", async () => {
    expect(imageFormat(png)).toBe("png");
    expect(imageFormat(await image(4, 4, "jpeg"))).toBe("jpeg");
    expect(imageFormat(await image(4, 4, "webp"))).toBe("webp");
    expect(imageFormat(Buffer.from("GIF89a\x01\x00\x01\x00"))).toBeUndefined();
    expect(imageFormat(Buffer.from("RIFF\x00\x00\x00\x00WAVE"))).toBeUndefined();
  });
});

const temps: string[] = [];
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function checkout() {
  const dir = mkdtempSync(join(tmpdir(), "zpi-shot-"));
  temps.push(dir);
  const root = join(dir, "plugins");
  cpSync(resolve(ROOT, "test/fixtures/check/valid"), root, { recursive: true });
  const dataPath = join(dir, "plugins.json");
  cpSync(resolve(ROOT, "test/fixtures/site/plugins.json"), dataPath);
  return { dir, root, dataPath, entry: join(root, ID) };
}

function responses(issueBody: string, { author = "example", bytes = png as Uint8Array } = {}): Responses {
  return {
    [ISSUE_URL]: { json: { body: issueBody, labels: [{ name: "screenshot" }], state: "open", user: { login: author } } },
    [REPO_URL]: { json: { owner: { login: "Example", type: "User" } } },
    [LINK]: { status: 302, headers: { location: S3 } },
    [S3]: { base64: Buffer.from(bytes).toString("base64") },
  };
}

function run(tree: ReturnType<typeof checkout>, answers: Responses, extra: Partial<ScreenshotOptions> = {}) {
  const fetched = fixtureFetch(answers);
  const result = screenshotRequest({
    root: tree.root,
    dataPath: tree.dataPath,
    fetch: fetched.fetch,
    lookup: async () => ["140.82.112.3"],
    indexRepo: "jmgirard/zotdex",
    issue: 9,
    ...extra,
  });
  return { result, requests: fetched.requests };
}

const problems = (lines: string[]) => lines.filter((line) => line.startsWith("problem: "));

describe("screenshotRequest's report", () => {
  test("follows the attachment's redirect, prints the facts, and exits 0 for a good request from the owner", async () => {
    const { result, requests } = run(checkout(), responses(body(attached())));
    expect(await result).toEqual({
      status: 0,
      lines: [
        `plugin: "${ID}"`,
        `link: "${LINK}"`,
        `description: "${GOOD}"`,
        'author: "example"',
        'owner: "Example"',
        "author-matches-owner: true",
        expect.stringMatching(/^data-generated: /),
        `image: png 800x500 ${png.byteLength} bytes`,
      ],
    });
    expect(requests.map(({ url }) => url)).toEqual([ISSUE_URL, REPO_URL, LINK, S3]);
    // The token goes to the API only.
    expect(requests.slice(2).every(({ headers }) => !headers.has("authorization"))).toBe(true);
  });

  test.each(["", "_No response_"])("reads the Screenshot field %j as a removal and ignores the description", async (field) => {
    const { result, requests } = run(checkout(), responses(body(field, "<b>")));
    const { status, lines } = await result;
    expect(status).toBe(0);
    expect(lines).toContain("request: remove the screenshot, since the Screenshot field is blank");
    expect(problems(lines)).toEqual([]);
    expect(requests).toHaveLength(2);
  });

  test("exits 1 when the author is not the owner", async () => {
    const { status, lines } = await run(checkout(), responses(body(attached()), { author: "someone" })).result;
    expect(status).toBe(1);
    expect(lines).toContain("author-matches-owner: false");
    expect(problems(lines)).toEqual([]);
  });

  test.each<[string, string, string]>([
    ["no image link", body(LINK), "problem: no-image-link: the Screenshot field holds no image"],
    ["two image links", body(`${attached()}\n![b](${S3})`), "problem: more-than-one-image: the Screenshot field holds more than one image"],
    ["a link off the hosts", body(attached("https://example.org/shot.png")), 'problem: host-not-allowed: "https://example.org/shot.png"'],
    ["a link to another port", body(attached("https://github.com:8443/shot.png")), 'problem: host-not-allowed: "https://github.com:8443/shot.png"'],
    ["a description that breaks a rule", body(attached(), "See https://example.org"), "problem: description-too-short"],
  ])("exits 1 naming the problem for %s", async (_name, issueBody, problem) => {
    const { result, requests } = run(checkout(), responses(issueBody));
    const { status, lines } = await result;
    expect(status).toBe(1);
    expect(problems(lines)[0]).toBe(problem);
    // A refused host gets no request.
    expect(requests.some(({ url }) => !url.startsWith("https://api.github.com/") && !url.startsWith("https://github.com/user-attachments/") && !url.startsWith(S3))).toBe(false);
  });

  test("names the description's every problem with textProblems' names", async () => {
    const { lines } = await run(checkout(), responses(body(attached(), "See https://example.org"))).result;
    expect(problems(lines)).toEqual(["problem: description-too-short", "problem: description-url"]);
  });

  test("exits 1 for a redirect off the hosts, before it requests that host", async () => {
    const answers = { ...responses(body(attached())), [LINK]: { status: 302, headers: { location: "https://images.example.org/shot.png" } } };
    const { result, requests } = run(checkout(), answers);
    const { status, lines } = await result;
    expect(status).toBe(1);
    expect(problems(lines)).toEqual(['problem: host-not-allowed: "https://images.example.org/shot.png"']);
    expect(requests.map(({ url }) => url)).toEqual([ISSUE_URL, REPO_URL, LINK]);
  });

  test("exits 1 for a download over the limit, and stops reading", async () => {
    const chunk = 1024 * 1024;
    const answers = { ...responses(body(attached())), [S3]: { chunks: { size: chunk, count: DOWNLOAD_MAX_BYTES / chunk + 5 } } };
    const { result, requests } = run(checkout(), answers);
    const { status, lines } = await result;
    expect(status).toBe(1);
    expect(problems(lines)).toEqual([`problem: too-large: the download is over ${DOWNLOAD_MAX_BYTES} bytes`]);
    expect(requests.at(-1)!.bytesEnqueued).toBeLessThanOrEqual(DOWNLOAD_MAX_BYTES + chunk);
  });

  test("exits 1 for bytes that are not PNG, JPEG, or WebP", async () => {
    const answers = responses(body(attached()), { bytes: Buffer.from("<!doctype html><title>Sign in</title>") });
    const { status, lines } = await run(checkout(), answers).result;
    expect(status).toBe(1);
    expect(problems(lines)).toEqual(["problem: not-an-image: the file is not PNG, JPEG, or WebP"]);
  });

  test.each([
    [IMAGE_MAX_PIXELS + 1, 10],
    [10, IMAGE_MAX_PIXELS + 1],
  ])("exits 1 for an image %ix%i, over the pixel limit", async (width, height) => {
    const answers = responses(body(attached()), { bytes: await image(width, height) });
    const { status, lines } = await run(checkout(), answers).result;
    expect(status).toBe(1);
    expect(lines).toContain(`image: png ${width}x${height} ${(await image(width, height)).byteLength} bytes`);
    expect(problems(lines)).toEqual([`problem: too-many-pixels: the image is over ${IMAGE_MAX_PIXELS} px wide or tall`]);
  });

  test("passes an image at the pixel limit", async () => {
    const answers = responses(body(attached()), { bytes: await image(IMAGE_MAX_PIXELS, 10, "jpeg") });
    const { status, lines } = await run(checkout(), answers).result;
    expect(problems(lines)).toEqual([]);
    expect(status).toBe(0);
  });

  test.each<[string, Partial<Responses>, string]>([
    ["an HTTP error answer", { [S3]: { status: 403, text: "AccessDenied" } }, "download-failed"],
    ["a failed request", { [S3]: { error: "connection reset" } }, "download-failed"],
    ["no label", { [ISSUE_URL]: { json: { body: body(attached()), labels: [{ name: "text-change" }], state: "open", user: { login: "example" } } } }, "no-screenshot-label"],
    ["an unknown plugin", { [ISSUE_URL]: { json: { body: body(attached(), GOOD, "other@example.org"), labels: ["screenshot"], state: "open", user: { login: "example" } } } }, "unknown-plugin"],
  ])("fails with exit 2 on %s", async (_name, change, failure) => {
    const { status, lines } = await run(checkout(), { ...responses(body(attached())), ...change } as Responses).result;
    expect(status).toBe(2);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(new RegExp(`^failure: ${failure}: `));
  });

  test("checks a --file image in place of the download, and still checks the field and the description", async () => {
    const tree = checkout();
    const file = join(tree.dir, "shot.png");
    writeFileSync(file, png);
    const good = run(tree, responses(body(attached())), { file });
    expect((await good.result).status).toBe(0);
    expect((await good.result).lines).toContain(`file: "${file}"`);
    expect(good.requests.map(({ url }) => url)).toEqual([ISSUE_URL, REPO_URL]);

    const bad = await run(tree, responses(body(LINK, "Too short")), { file }).result;
    expect(problems(bad.lines)).toEqual(["problem: no-image-link: the Screenshot field holds no image", "problem: description-too-short"]);

    writeFileSync(file, "not an image");
    expect(problems((await run(tree, responses(body(attached())), { file }).result).lines)).toEqual(["problem: not-an-image: the file is not PNG, JPEG, or WebP"]);
  });
});

// Noise from a fixed seed, which WebP cannot make small.
function noise(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(width * height * 3);
  let seed = 7;
  for (let i = 0; i < bytes.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    bytes[i] = seed >>> 24;
  }
  return bytes;
}

describe("screenshotRequest with apply", () => {
  const indexOf = (tree: ReturnType<typeof checkout>) => JSON.parse(readFileSync(join(tree.entry, "index.json"), "utf8"));
  const shotOf = (tree: ReturnType<typeof checkout>) => join(tree.entry, "screenshot.webp");
  const REASON = "The repository's owner asked for this screenshot in issue #9.";

  test.each([
    [3200, 2000, 1600, 1000],
    [1000, 6000, 400, 2400],
    [640, 400, 640, 400],
  ])("writes a %ix%i image as WebP fit to %ix%i, and sets the description and reason", async (width, height, fitWidth, fitHeight) => {
    const tree = checkout();
    const { result } = run(tree, responses(body(attached()), { bytes: await image(width, height, "jpeg") }), { apply: true });
    const { status, lines } = await result;
    expect(status).toBe(0);
    expect(lines.slice(-2)).toEqual([`wrote: "${shotOf(tree)}"`, `wrote: "${join(tree.entry, "index.json")}"`]);
    const written = readFileSync(shotOf(tree));
    expect(lines).toContain(`copy: webp ${fitWidth}x${fitHeight} ${written.byteLength} bytes`);
    expect(await sharp(written).metadata()).toMatchObject({ format: "webp", width: fitWidth, height: fitHeight });
    expect(indexOf(tree)).toEqual({ schemaVersion: 1, screenshot: { description: GOOD, reason: REASON } });
  });

  test("turns the image upright by its orientation tag and keeps no metadata", async () => {
    const tree = checkout();
    const tagged = await sharp({ create: { width: 300, height: 100, channels: 3, background: "#336699" } })
      .jpeg()
      .withMetadata({ orientation: 6, exif: { IFD0: { Copyright: "Someone" } } })
      .toBuffer();
    expect(await sharp(tagged).metadata()).toMatchObject({ orientation: 6, exif: expect.any(Buffer) });
    await run(tree, responses(body(attached()), { bytes: tagged }), { apply: true }).result;
    const copy = await sharp(readFileSync(shotOf(tree))).metadata();
    expect(copy).toMatchObject({ width: 100, height: 300 });
    expect(copy.exif).toBeUndefined();
    expect(copy.icc).toBeUndefined();
    expect(copy.xmp).toBeUndefined();
    expect(copy.orientation).toBeUndefined();
  });

  test("replaces an earlier screenshot and leaves the other fields", async () => {
    const tree = checkout();
    writeFileSync(shotOf(tree), "old");
    writeFileSync(join(tree.entry, "index.json"), JSON.stringify({ schemaVersion: 1, iconHidden: { reason: "Test." }, screenshot: { description: "Old text for the old image.", reason: "Old." } }));
    const { lines } = await run(tree, responses(body(attached())), { apply: true }).result;
    expect(lines).toContain('replaces-screenshot: "Old text for the old image."');
    expect(indexOf(tree)).toEqual({ schemaVersion: 1, iconHidden: { reason: "Test." }, screenshot: { description: GOOD, reason: REASON } });
    expect(imageFormat(readFileSync(shotOf(tree)))).toBe("webp");
  });

  test("writes nothing and exits 1 when the copy is over 1 MiB", async () => {
    const tree = checkout();
    const big = await sharp(noise(1600, 2400), { raw: { width: 1600, height: 2400, channels: 3 } }).jpeg({ quality: 95 }).toBuffer();
    expect(big.byteLength).toBeLessThan(DOWNLOAD_MAX_BYTES);
    const before = readFileSync(join(tree.entry, "index.json"), "utf8");
    const { status, lines } = await run(tree, responses(body(attached()), { bytes: big }), { apply: true }).result;
    expect(status).toBe(1);
    expect(lines.at(-2)).toMatch(/^copy: webp 1600x2400 (\d+) bytes$/);
    expect(Number(lines.at(-2)!.split(" ")[3])).toBeGreaterThan(1024 * 1024);
    expect(lines.at(-1)).toBe("wrote nothing: the copy is over 1048576 bytes, so ask for a smaller image");
    expect(readFileSync(join(tree.entry, "index.json"), "utf8")).toBe(before);
    expect(() => readFileSync(shotOf(tree))).toThrow(/ENOENT/);
  });

  test("removes the file and the field for a blank Screenshot field", async () => {
    const tree = checkout();
    writeFileSync(shotOf(tree), "old");
    writeFileSync(join(tree.entry, "index.json"), JSON.stringify({ schemaVersion: 1, screenshot: { description: "Old text for the old image.", reason: "Old." } }));
    const { status, lines } = await run(tree, responses(body("")), { apply: true }).result;
    expect(status).toBe(0);
    expect(lines).toContain('removes-screenshot: "Old text for the old image."');
    expect(lines.slice(-2)).toEqual([`removed: "${shotOf(tree)}"`, `wrote: "${join(tree.entry, "index.json")}"`]);
    expect(indexOf(tree)).toEqual({ schemaVersion: 1 });
    expect(() => readFileSync(shotOf(tree))).toThrow(/ENOENT/);
  });

  test("leaves an entry that passes pnpm check after it writes and after it removes", async () => {
    const check = (root: string) => spawnSync(process.env.npm_execpath!, ["--silent", "check", root], { encoding: "utf8", cwd: ROOT, timeout: 50_000 });
    const tree = checkout();
    expect((await run(tree, responses(body(attached())), { apply: true }).result).status).toBe(0);
    expect(check(tree.root)).toMatchObject({ status: 0 });
    expect((await run(tree, responses(body("")), { apply: true }).result).status).toBe(0);
    expect(check(tree.root)).toMatchObject({ status: 0 });
  });

  test("writes nothing for a removal from an entry with no screenshot", async () => {
    const tree = checkout();
    const before = readFileSync(join(tree.entry, "index.json"), "utf8");
    const { status, lines } = await run(tree, responses(body("")), { apply: true }).result;
    expect(status).toBe(0);
    expect(lines.at(-1)).toBe("wrote nothing: the entry has no screenshot to remove");
    expect(readFileSync(join(tree.entry, "index.json"), "utf8")).toBe(before);
  });

  test("writes a --file image without a download", async () => {
    const tree = checkout();
    const file = join(tree.dir, "shot.webp");
    writeFileSync(file, await image(500, 300, "webp"));
    const { result, requests } = run(tree, responses(body(attached())), { apply: true, file });
    expect((await result).status).toBe(0);
    expect(requests.map(({ url }) => url)).toEqual([ISSUE_URL, REPO_URL]);
    expect(await sharp(readFileSync(shotOf(tree))).metadata()).toMatchObject({ format: "webp", width: 500, height: 300 });
  });

  test.each<[string, Responses, string]>([
    ["a problem", responses(body(attached(), "Too short")), "wrote nothing: the request breaks a rule"],
    ["a mismatch", responses(body(attached()), { author: "someone" }), "wrote nothing: check the author, then use --owner-checked"],
  ])("writes nothing on %s", async (_name, answers, line) => {
    const tree = checkout();
    const before = readFileSync(join(tree.entry, "index.json"), "utf8");
    const { status, lines } = await run(tree, answers, { apply: true }).result;
    expect(status).toBe(1);
    expect(lines.at(-1)).toBe(line);
    expect(readFileSync(join(tree.entry, "index.json"), "utf8")).toBe(before);
  });

  test("writes past a mismatch with ownerChecked, but never past a problem", async () => {
    const tree = checkout();
    expect((await run(tree, responses(body(attached()), { author: "someone" }), { apply: true, ownerChecked: true }).result).status).toBe(0);
    expect(indexOf(tree).screenshot.description).toBe(GOOD);
    const other = checkout();
    expect((await run(other, responses(body(attached(), "Too short"), { author: "someone" }), { apply: true, ownerChecked: true }).result).status).toBe(1);
    expect(indexOf(other).screenshot).toBeUndefined();
  });
});

describe("pnpm screenshot-request", () => {
  test.each([
    [[]],
    [["9"]],
    [["x", "--data", "f"]],
    [["9", "--data"]],
    [["9", "--data", "f", "--file"]],
    [["9", "--data", "f", "--other"]],
    [["9", "--data", "f", "--owner-checked"]],
  ])(
    "prints the usage and exits 2 for the arguments %j",
    (args) => {
      const result = spawnSync(process.execPath, [resolve(ROOT, "src/screenshot-request/cli.ts"), ...args], { encoding: "utf8", cwd: ROOT });
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("usage: pnpm screenshot-request <issue> --data <file>");
    },
  );
});
