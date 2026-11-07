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

export type FormValues<K extends string> = { ok: true; values: Record<K, string> } | { ok: false; failure: "missing-heading" | "duplicate-heading"; message: string };

// Reads the value under each label's heading from an issue body, which anyone who files the
// issue can edit. A heading that appears twice is refused, since one can sit in an HTML comment
// that the issue page hides.
export function formValues<K extends string>(body: string, labels: Record<K, string>): FormValues<K> {
  const lines = body.split(/\r?\n/);
  const values: Partial<Record<K, string>> = {};
  for (const id of Object.keys(labels) as K[]) {
    const heading = `### ${labels[id]}`;
    const count = lines.filter((line) => line.trim() === heading).length;
    if (count === 0) return { ok: false, failure: "missing-heading", message: `the issue body has no "${heading}" heading` };
    if (count > 1) return { ok: false, failure: "duplicate-heading", message: `the issue body has more than one "${heading}" heading` };
    values[id] = under(lines, heading);
  }
  return { ok: true, values: values as Record<K, string> };
}

export function parseTextRequest(body: string): ParseResult {
  const read = formValues(body, TEXT_REQUEST_LABELS);
  if (!read.ok) return read;
  const { plugin, field, text } = read.values;
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
