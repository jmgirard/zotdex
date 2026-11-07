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

const NAMED = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" } as Record<string, string>;

// A link with its character references decoded, as a browser reads an <img> src and CommonMark
// a link: the named ones above and any numeric one. Another reference stays as it is.
function decoded(src: string): string {
  return src.replace(/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));/g, (whole, decimal?: string, hex?: string, name?: string) => {
    const code = decimal !== undefined ? Number(decimal) : hex !== undefined ? Number.parseInt(hex, 16) : undefined;
    if (code !== undefined) return code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    return NAMED[name!] ?? whole;
  });
}

// Each distinct image link in a field, in order of first use: a Markdown image's link or an
// <img> element's src, which is what GitHub writes for an attached image. A plain link is not
// an image link.
export function imageLinks(text: string): string[] {
  const found = [...text.matchAll(MARKDOWN_IMAGE)].map((match) => ({ at: match.index, url: decoded(match[1]!) }));
  found.push(...[...text.matchAll(HTML_IMAGE)].map((match) => ({ at: match.index, url: decoded(match[2]!) })));
  return [...new Set(found.sort((a, b) => a.at - b.at).map(({ url }) => url))];
}
