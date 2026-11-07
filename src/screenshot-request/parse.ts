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
// An <img> tag with its attributes, each one a name and an optional quoted or bare value.
const ATTRIBUTE = String.raw`\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>` + "`" + String.raw`]+))?`;
const HTML_IMAGE = new RegExp(String.raw`<img((?:${ATTRIBUTE})*)\s*\/?>`, "gi");
const EACH_ATTRIBUTE = /\s+([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

// The field's text without what the issue page shows as no image: HTML comments, which run to
// the end when one is not closed, code fences, code spans, and lines indented as code.
function shownText(text: string): string {
  return text
    .replace(/<!--[\s\S]*?(?:-->|$)/g, " ")
    .replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:^ {0,3}\1[`~]* *$|(?![\s\S]))/gm, " ")
    .replace(/(`+)[\s\S]*?\1/g, " ")
    .replace(/^(?: {4,}|\t).*$/gm, " ");
}

// The value of an <img> tag's first src attribute, as a browser takes it.
function srcOf(attributes: string): string | undefined {
  for (const match of attributes.matchAll(EACH_ATTRIBUTE)) {
    if (match[1]!.toLowerCase() === "src") return match[2] ?? match[3] ?? match[4] ?? "";
  }
  return undefined;
}

const NAMED = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" } as Record<string, string>;

// A link with its character references decoded, as a browser reads an <img> src and CommonMark
// a link: the named ones above and any numeric one up to U+10FFFF. Another reference stays as it is.
function decoded(src: string): string {
  return src.replace(/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));/g, (whole, decimal?: string, hex?: string, name?: string) => {
    const code = decimal !== undefined ? Number(decimal) : hex !== undefined ? Number.parseInt(hex, 16) : undefined;
    if (code !== undefined) return code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    return NAMED[name!] ?? whole;
  });
}

// Each distinct image link in a field, in order of first use: a Markdown image's link or an
// <img> element's src attribute, which is what GitHub writes for an attached image. A plain link
// is not an image link, nor is an image in a comment or in code. The page can still show another
// image, by srcset or <picture> for example, so the maintainer looks at the command's own copy.
export function imageLinks(text: string): string[] {
  const shown = shownText(text);
  const found = [...shown.matchAll(MARKDOWN_IMAGE)].map((match) => ({ at: match.index, url: decoded(match[1]!) }));
  for (const match of shown.matchAll(HTML_IMAGE)) {
    const src = srcOf(match[1]!);
    if (src !== undefined) found.push({ at: match.index, url: decoded(src) });
  }
  return [...new Set(found.sort((a, b) => a.at - b.at).map(({ url }) => url))];
}
