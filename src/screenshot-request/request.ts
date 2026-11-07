// A repository owner's request to add, replace, or remove a plugin's screenshot (D-081). The
// maintainer runs this by hand, looks at the image, and answers the issue.
import { createHash } from "node:crypto";
import { readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
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
  // Where the report writes the copy for the maintainer to look at; the system temporary folder
  // by default.
  previewDir?: string;
}

// The preview file of one issue's copy. A run on an add or replace request that gets past the
// download replaces it, or removes it when there is no copy. A removal and a failure leave it.
export const previewPath = (dir: string, issue: number) => join(dir, `zotdex-screenshot-${issue}.webp`);

// A rule that the request breaks, found while checking the link or reading the image.
class Problem extends Error {}

const TOO_LARGE = `too-large: the image is over ${DOWNLOAD_MAX_BYTES} bytes`;

// Throws a Problem for a URL that is not https on a SCREENSHOT_HOSTS host at its default port.
function checkHost(url: URL): void {
  if (url.protocol !== "https:" || url.port !== "" || !SCREENSHOT_HOSTS.includes(url.hostname)) {
    throw new Problem(`host-not-allowed: ${quoted(url.href)}`);
  }
}

// The field's link as a URL, or a Problem for a link that is not one or is off the hosts.
function linkUrl(link: string): URL {
  if (!URL.canParse(link)) throw new Problem(`host-not-allowed: ${quoted(link)} is not a URL`);
  const url = new URL(link);
  checkHost(url);
  return url;
}

// Downloads `url` with the reads' host check and redirect rules, refusing a redirect off
// SCREENSHOT_HOSTS before its request and a body past DOWNLOAD_MAX_BYTES. It throws a Problem
// for those, and a ReadFailure for a failed request or an HTTP error answer.
async function download(url: URL, fetch: Fetch, lookup: Lookup): Promise<Uint8Array> {
  const { response } = await downloader(fetch, lookup, undefined, checkHost)(url.href);
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new ReadFailure("request-failed", `GET ${url.href} returned HTTP ${response.status}`);
  }
  return readCapped(response, url.href, DOWNLOAD_MAX_BYTES, () => {
    throw new Problem(TOO_LARGE);
  });
}

// The index's copy: turned upright by its orientation tag, fit within the file's pixel limits
// without growing, and saved as WebP, which drops the metadata. A decode of the whole image,
// so a cut file fails here.
async function encode(bytes: Uint8Array): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(bytes)
    .autoOrient()
    .resize({ width: SCREENSHOT_MAX_WIDTH, height: SCREENSHOT_MAX_HEIGHT, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// What the request's image breaks, its report lines, and the index's copy when nothing does.
async function readImage(bytes: Uint8Array): Promise<{ problems: string[]; lines: string[]; copy?: Buffer }> {
  const format = imageFormat(bytes);
  if (!format) return { problems: ["not-an-image: the file is not PNG, JPEG, or WebP"], lines: [] };
  let width: number;
  let height: number;
  try {
    // A size that sharp does not give reads as 0, and the encode below then fails.
    ({ width = 0, height = 0 } = await sharp(bytes).metadata());
  } catch (error) {
    return { problems: [`unreadable-image: ${(error as Error).message}`], lines: [] };
  }
  // The SHA-256 lets the maintainer match the report run, whose copy they looked at, with the
  // --apply run.
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const lines = [`image: ${format} ${width}x${height} ${bytes.byteLength} bytes sha256 ${sha256}`];
  if (width > IMAGE_MAX_PIXELS || height > IMAGE_MAX_PIXELS) {
    return { problems: [`too-many-pixels: the image is over ${IMAGE_MAX_PIXELS} px wide or tall`], lines };
  }
  let copy: Awaited<ReturnType<typeof encode>>;
  try {
    copy = await encode(bytes);
  } catch (error) {
    return { problems: [`unreadable-image: ${(error as Error).message}`], lines };
  }
  lines.push(`copy: webp ${copy.width}x${copy.height} ${copy.data.byteLength} bytes`);
  if (copy.data.byteLength > SCREENSHOT_MAX_BYTES) {
    return { problems: [`copy-too-large: the copy is over ${SCREENSHOT_MAX_BYTES} bytes, so ask for a smaller image`], lines };
  }
  return { problems: [], lines, copy: copy.data };
}

// The image from --file: the limit of a download holds for it too.
async function readImageFile(file: string): Promise<Uint8Array> {
  if ((await stat(file)).size > DOWNLOAD_MAX_BYTES) throw new Problem(TOO_LARGE);
  return readFile(file);
}

interface EntryIndex {
  screenshot?: { description?: unknown; reason?: unknown };
  [key: string]: unknown;
}

const readIndex = async (path: string) => JSON.parse(await readFile(path, "utf8")) as EntryIndex;
const writeIndex = (path: string, index: EntryIndex) => writeFile(path, `${JSON.stringify(index, null, 2)}\n`);

// Reads the issue, the data file, the entry, the repository's owner, and the image, prints the
// report, and with `apply` writes the entry's screenshot.webp and index.json, or removes the
// screenshot for a blank field. Status 0 with `apply` and a removal from an entry with no
// screenshot writes nothing.
export async function screenshotRequest(options: ScreenshotOptions): Promise<RequestResult> {
  const { fetch, file, lookup = systemLookup, issue, apply = false, ownerChecked = false, previewDir = tmpdir() } = options;
  const read = await readOwnerRequest(options, SCREENSHOT_LABEL, parseScreenshotRequest);
  if (!read.ok) return read.result;
  const { request, record, entry, matches, organization } = read.read;
  const indexPath = join(entry, "index.json");
  const imagePath = join(entry, SCREENSHOT_FILE);
  let current: EntryIndex["screenshot"];
  try {
    current = (await readIndex(indexPath)).screenshot;
  } catch (error) {
    return failed("entry-unreadable", `${indexPath}: ${(error as Error).message}`);
  }

  const removal = request.screenshot === "";
  const lines = [`plugin: ${quoted(record.id)}`];
  const problems: string[] = [];
  let copy: Buffer | undefined;
  if (removal && file !== undefined) {
    return failed("file-with-removal", "the Screenshot field is blank, so the request removes the screenshot and reads no --file image");
  }
  if (removal) {
    lines.push("request: remove the screenshot, since the Screenshot field is blank", ...ownerLines(read.read));
    if (current) lines.push(`removes-screenshot: ${quoted(String(current.description))}`);
  } else {
    const links = imageLinks(request.screenshot);
    lines.push(...links.map((link) => `link: ${quoted(link)}`), `description: ${quoted(request.description)}`, ...ownerLines(read.read));
    if (current) lines.push(`replaces-screenshot: ${quoted(String(current.description))}`);
    if (links.length === 0) problems.push("no-image-link: the Screenshot field holds no image");
    if (links.length > 1) problems.push("more-than-one-image: the Screenshot field holds more than one image");
    let bytes: Uint8Array | undefined;
    try {
      // The link's own host is checked with --file too; only its redirects need the download.
      const url = links.length === 1 ? linkUrl(links[0]!) : undefined;
      if (file !== undefined) {
        lines.push(`file: ${quoted(file)}`);
        bytes = await readImageFile(file);
      } else if (url) {
        bytes = await download(url, fetch, lookup);
      }
    } catch (error) {
      if (error instanceof Problem) problems.push(error.message);
      else if (error instanceof ReadFailure) return failed("download-failed", error.message);
      else if (file !== undefined) return failed("file-unreadable", `${file}: ${(error as Error).message}`);
      else throw error;
    }
    if (bytes) {
      const image = await readImage(bytes);
      lines.push(...image.lines);
      problems.push(...image.problems);
      copy = image.copy;
    }
    // The maintainer looks at this file, the copy that --apply writes, and not at the issue page,
    // which can show another image than the link that the command reads.
    const preview = previewPath(previewDir, issue);
    try {
      if (copy) {
        await writeFile(preview, copy);
        lines.push(`preview: ${quoted(preview)}`);
      } else {
        await rm(preview, { force: true });
      }
    } catch (error) {
      return failed("preview-failed", `${preview}: ${(error as Error).message}`);
    }
    for (const problem of textProblems("description", request.description, shownName(record))) problems.push(`description-${problem}`);
  }
  for (const problem of problems) lines.push(`problem: ${problem}`);
  const ownerOk = matches && !organization;
  const status = problems.length === 0 && ownerOk ? 0 : 1;
  if (!apply) return { status, lines };
  if (problems.length > 0) return { status: 1, lines: [...lines, "wrote nothing: the request breaks a rule"] };
  if (!ownerOk && !ownerChecked) return { status: 1, lines: [...lines, "wrote nothing: check the author, then use --owner-checked"] };

  // index.json is read again just before each write, so the write keeps any edit made while the
  // image was read. A failed write of index.json leaves both files as they were: a new image
  // waits in a temporary file until index.json names it, and a removal changes index.json before
  // it deletes the image.
  const temporary = `${imagePath}.tmp`;
  try {
    if (removal) {
      const hasImage = await stat(imagePath).then(
        () => true,
        () => false,
      );
      const index = await readIndex(indexPath);
      if (!index.screenshot && !hasImage) return { status: 0, lines: [...lines, "wrote nothing: the entry has no screenshot to remove"] };
      const done: string[] = [];
      if (index.screenshot) {
        delete index.screenshot;
        await writeIndex(indexPath, index);
        done.push(`wrote: ${quoted(indexPath)}`);
      }
      if (hasImage) {
        await rm(imagePath, { force: true });
        done.unshift(`removed: ${quoted(imagePath)}`);
      }
      return { status: 0, lines: [...lines, ...done] };
    }
    await writeFile(temporary, copy!);
    const index = await readIndex(indexPath);
    index.screenshot = { description: request.description, reason: `The repository's owner asked for this screenshot in issue #${issue}.` };
    await writeIndex(indexPath, index);
    await rename(temporary, imagePath);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    return failed("write-failed", `${entry}: ${(error as Error).message}`);
  }
  return { status: 0, lines: [...lines, `wrote: ${quoted(imagePath)}`, `wrote: ${quoted(indexPath)}`] };
}
