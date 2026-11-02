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

export type ParseResult = { ok: true; request: TextRequest } | { ok: false; failure: "missing-heading" | "bad-field"; message: string };

// Reads a request from an issue body, which anyone who files the issue can edit.
export function parseTextRequest(body: string): ParseResult {
  const lines = body.split(/\r?\n/);
  const values: Partial<Record<keyof typeof TEXT_REQUEST_LABELS, string>> = {};
  for (const id of ["plugin", "field", "text"] as const) {
    const value = under(lines, TEXT_REQUEST_LABELS[id]);
    if (value === undefined) return { ok: false, failure: "missing-heading", message: `the issue body has no "### ${TEXT_REQUEST_LABELS[id]}" heading` };
    values[id] = value;
  }
  const { plugin, field, text } = values as Record<keyof typeof TEXT_REQUEST_LABELS, string>;
  if (field !== "name" && field !== "description") return { ok: false, failure: "bad-field", message: "the field must be name or description" };
  return { ok: true, request: { plugin, field, text } };
}

// All lines under the heading `label`, before the next heading, joined and with outer space
// removed, or undefined with no such heading. GitHub writes _No response_ for an empty input.
function under(lines: string[], label: string): string | undefined {
  const heading = lines.findIndex((line) => line.trim() === `### ${label}`);
  if (heading === -1) return undefined;
  const rest = lines.slice(heading + 1);
  const end = rest.findIndex((line) => line.startsWith("### "));
  const value = (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
  return value === "_No response_" ? "" : value;
}
