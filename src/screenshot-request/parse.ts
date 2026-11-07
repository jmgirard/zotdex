import { formValues } from "../text-request/parse.ts";

// The labels of the inputs in .github/ISSUE_TEMPLATE/screenshot.yml, by input id. GitHub writes
// each input of a form into the issue body as a level-3 heading with the label, then the value.
export const SCREENSHOT_REQUEST_LABELS = { plugin: "Plugin id", screenshot: "Screenshot", description: "Description of the screenshot" } as const;

export interface ScreenshotRequest {
  plugin: string;
  // The field's text as the issue holds it. Blank asks to remove the plugin's screenshot.
  screenshot: string;
  description: string;
}

export type ParseResult = { ok: true; request: ScreenshotRequest } | { ok: false; failure: "missing-heading" | "duplicate-heading"; message: string };

export function parseScreenshotRequest(body: string): ParseResult {
  const read = formValues(body, SCREENSHOT_REQUEST_LABELS);
  return read.ok ? { ok: true, request: read.values } : read;
}

const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+"[^"]*")?\s*\)/g;
const HTML_IMAGE = /<img\b[^>]*?\ssrc\s*=\s*(["'])(.*?)\1/gi;

// Each distinct image link in a field, in order of first use: a Markdown image's link or an
// <img> element's src, which is what GitHub writes for an attached image. A plain link is not
// an image link.
export function imageLinks(text: string): string[] {
  const found = [...text.matchAll(MARKDOWN_IMAGE)].map((match) => ({ at: match.index, url: match[1]! }));
  found.push(...[...text.matchAll(HTML_IMAGE)].map((match) => ({ at: match.index, url: match[2]! })));
  return [...new Set(found.sort((a, b) => a.at - b.at).map(({ url }) => url.replaceAll("&amp;", "&")))];
}
