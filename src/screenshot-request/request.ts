// A repository owner's request to add, replace, or remove a plugin's screenshot (D-081). The
// maintainer runs this by hand, looks at the image, and answers the issue.
import { readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { failed, type IssueOptions, ownerLines, quoted, readOwnerRequest, type RequestResult } from "../text-request/owner.ts";
import { shownName } from "../text-request/request.ts";
import { textProblems } from "../text-request/rules.ts";
import { type Lookup, systemLookup } from "../upstream/host-guard.ts";
import { downloader, type Fetch, readCapped, ReadFailure } from "../upstream/reader.ts";
import { imageLinks, parseScreenshotRequest } from "./parse.ts";
import {
  DOWNLOAD_MAX_BYTES,
  IMAGE_MAX_PIXELS,
  imageFormat,
  SCREENSHOT_FILE,
  SCREENSHOT_HOSTS,
  SCREENSHOT_MAX_BYTES,
  SCREENSHOT_MAX_HEIGHT,
  SCREENSHOT_MAX_WIDTH,
} from "./rules.ts";

export type { RequestResult } from "../text-request/owner.ts";

const SCREENSHOT_LABEL = "screenshot";

export interface ScreenshotOptions extends IssueOptions {
  // Read the image from this file instead of downloading the field's link.
  file?: string;
  lookup?: Lookup;
  apply?: boolean;
  ownerChecked?: boolean;
}

// A rule that the request breaks, found during the download.
class Problem extends Error {}

// Downloads `url` with the reads' host check and redirect rules, refusing a URL off
// SCREENSHOT_HOSTS before its request and a body past DOWNLOAD_MAX_BYTES. It throws a Problem
// for those, and a ReadFailure for a failed request or an HTTP error answer.
async function download(url: string, fetch: Fetch, lookup: Lookup): Promise<Uint8Array> {
  if (!URL.canParse(url)) throw new Problem(`host-not-allowed: ${quoted(url)} is not a URL`);
  const check = (next: URL) => {
    if (next.protocol !== "https:" || next.port !== "" || !SCREENSHOT_HOSTS.includes(next.hostname)) throw new Problem(`host-not-allowed: ${quoted(next.href)}`);
  };
  const { response } = await downloader(fetch, lookup, undefined, check)(url);
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new ReadFailure("request-failed", `GET ${url} returned HTTP ${response.status}`);
  }
  return readCapped(response, url, DOWNLOAD_MAX_BYTES, () => {
    throw new Problem(`too-large: the download is over ${DOWNLOAD_MAX_BYTES} bytes`);
  });
}

// What the request's image breaks, and its report line.
async function imageProblems(bytes: Uint8Array): Promise<{ problems: string[]; line?: string }> {
  const format = imageFormat(bytes);
  if (!format) return { problems: ["not-an-image: the file is not PNG, JPEG, or WebP"] };
  let width: number | undefined;
  let height: number | undefined;
  try {
    ({ width, height } = await sharp(bytes).metadata());
  } catch (error) {
    return { problems: [`unreadable-image: ${(error as Error).message}`] };
  }
  const line = `image: ${format} ${width}x${height} ${bytes.byteLength} bytes`;
  if (width === undefined || height === undefined || width > IMAGE_MAX_PIXELS || height > IMAGE_MAX_PIXELS) {
    return { problems: [`too-many-pixels: the image is over ${IMAGE_MAX_PIXELS} px wide or tall`], line };
  }
  return { problems: [], line };
}

// The index's copy: turned upright by its orientation tag, fit within the file limits without
// growing, and saved as WebP, which drops the metadata.
async function encode(bytes: Uint8Array): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(bytes)
    .autoOrient()
    .resize({ width: SCREENSHOT_MAX_WIDTH, height: SCREENSHOT_MAX_HEIGHT, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

interface EntryIndex {
  screenshot?: { description?: unknown; reason?: unknown };
  [key: string]: unknown;
}

// Reads the issue, the data file, the entry, the repository's owner, and the image, prints the
// report, and with `apply` writes the entry's screenshot.webp and index.json, or removes the
// screenshot for a blank field. Status 0 with `apply` and a removal from an entry with no
// screenshot writes nothing.
export async function screenshotRequest(options: ScreenshotOptions): Promise<RequestResult> {
  const { fetch, file, lookup = systemLookup, issue, apply = false, ownerChecked = false } = options;
  const read = await readOwnerRequest(options, SCREENSHOT_LABEL, parseScreenshotRequest);
  if (!read.ok) return read.result;
  const { request, record, entry, matches, organization } = read.read;
  const indexPath = join(entry, "index.json");
  const imagePath = join(entry, SCREENSHOT_FILE);
  let index: EntryIndex;
  try {
    index = JSON.parse(await readFile(indexPath, "utf8")) as EntryIndex;
  } catch (error) {
    return failed("entry-unreadable", `${indexPath}: ${(error as Error).message}`);
  }
  const current = index.screenshot;

  const removal = request.screenshot === "";
  const lines = [`plugin: ${quoted(record.id)}`];
  const problems: string[] = [];
  let bytes: Uint8Array | undefined;
  if (removal) {
    lines.push("request: remove the screenshot, since the Screenshot field is blank", ...ownerLines(read.read));
    if (current) lines.push(`removes-screenshot: ${quoted(String(current.description))}`);
  } else {
    const links = imageLinks(request.screenshot);
    lines.push(...links.map((link) => `link: ${quoted(link)}`), `description: ${quoted(request.description)}`, ...ownerLines(read.read));
    if (current) lines.push(`replaces-screenshot: ${quoted(String(current.description))}`);
    if (links.length === 0) problems.push("no-image-link: the Screenshot field holds no image");
    if (links.length > 1) problems.push("more-than-one-image: the Screenshot field holds more than one image");
    if (file !== undefined) {
      try {
        bytes = await readFile(file);
      } catch (error) {
        return failed("file-unreadable", `${file}: ${(error as Error).message}`);
      }
      lines.push(`file: ${quoted(file)}`);
    } else if (links.length === 1) {
      try {
        bytes = await download(links[0]!, fetch, lookup);
      } catch (error) {
        if (error instanceof Problem) problems.push(error.message);
        else if (error instanceof ReadFailure) return failed("download-failed", error.message);
        else throw error;
      }
    }
    if (bytes) {
      const image = await imageProblems(bytes);
      if (image.line) lines.push(image.line);
      problems.push(...image.problems);
    }
    for (const problem of textProblems("description", request.description, shownName(record))) problems.push(`description-${problem}`);
  }
  for (const problem of problems) lines.push(`problem: ${problem}`);
  const ownerOk = matches && !organization;
  const status = problems.length === 0 && ownerOk ? 0 : 1;
  if (!apply) return { status, lines };
  if (problems.length > 0) return { status: 1, lines: [...lines, "wrote nothing: the request breaks a rule"] };
  if (!ownerOk && !ownerChecked) return { status: 1, lines: [...lines, "wrote nothing: check the author, then use --owner-checked"] };

  try {
    if (removal) {
      const hasImage = await stat(imagePath).then(
        () => true,
        () => false,
      );
      if (!current && !hasImage) return { status: 0, lines: [...lines, "wrote nothing: the entry has no screenshot to remove"] };
      await rm(imagePath, { force: true });
      delete index.screenshot;
      await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
      return { status: 0, lines: [...lines, `removed: ${quoted(imagePath)}`, `wrote: ${quoted(indexPath)}`] };
    }
    const copy = await encode(bytes!);
    lines.push(`copy: webp ${copy.width}x${copy.height} ${copy.data.byteLength} bytes`);
    if (copy.data.byteLength > SCREENSHOT_MAX_BYTES) {
      return { status: 1, lines: [...lines, `wrote nothing: the copy is over ${SCREENSHOT_MAX_BYTES} bytes, so ask for a smaller image`] };
    }
    await writeFile(imagePath, copy.data);
    index.screenshot = { description: request.description, reason: `The repository's owner asked for this screenshot in issue #${issue}.` };
    await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  } catch (error) {
    return failed("write-failed", `${entry}: ${(error as Error).message}`);
  }
  return { status: 0, lines: [...lines, `wrote: ${quoted(imagePath)}`, `wrote: ${quoted(indexPath)}`] };
}
