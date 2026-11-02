import type { TextField } from "./rules.ts";

// The labels of the inputs in .github/ISSUE_TEMPLATE/text-change.yml, by input id. GitHub
// writes each input of a form into the issue body as a level-3 heading with the label, then
// the value.
export const TEXT_REQUEST_LABELS = { plugin: "Plugin id", field: "Field", text: "New text" } as const;

export interface TextRequest {
  plugin: string;
  field: TextField;
  // Blank asks to remove the index's override.
  text: string;
}

export type ParseResult = { ok: true; request: TextRequest } | { ok: false; failure: "missing-heading" | "duplicate-heading" | "bad-field"; message: string };

// Reads a request from an issue body, which anyone who files the issue can edit. A heading
// that appears twice is refused, since one can sit in an HTML comment that the issue page hides.
export function parseTextRequest(body: string): ParseResult {
  const lines = body.split(/\r?\n/);
  const values: Partial<Record<keyof typeof TEXT_REQUEST_LABELS, string>> = {};
  for (const id of ["plugin", "field", "text"] as const) {
    const heading = `### ${TEXT_REQUEST_LABELS[id]}`;
    const count = lines.filter((line) => line.trim() === heading).length;
    if (count === 0) return { ok: false, failure: "missing-heading", message: `the issue body has no "${heading}" heading` };
    if (count > 1) return { ok: false, failure: "duplicate-heading", message: `the issue body has more than one "${heading}" heading` };
    values[id] = under(lines, heading);
  }
  const { plugin, field, text } = values as Record<keyof typeof TEXT_REQUEST_LABELS, string>;
  if (field !== "name" && field !== "description") return { ok: false, failure: "bad-field", message: "the field must be name or description" };
  return { ok: true, request: { plugin, field, text } };
}

// All lines under a heading that the body holds, before the next heading, joined and with outer
// space removed. GitHub writes _No response_ for an empty input.
function under(lines: string[], heading: string): string {
  const rest = lines.slice(lines.findIndex((line) => line.trim() === heading) + 1);
  const end = rest.findIndex((line) => line.trim().startsWith("### "));
  const value = (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
  return value === "_No response_" ? "" : value;
}
