// The rules for a name or description that a repository's owner asks for (D-049). They bind
// requests only, so an existing name, description, or override can break them.
import { cjkShare, onlyRepeatsName } from "../site/description.ts";

export const NAME_MIN = 2;
export const NAME_MAX = 40;
export const DESCRIPTION_MIN_WORDS = 6;
export const DESCRIPTION_MAX = 200;
// About as much as the two lines of a home table row hold on a wide screen; a narrow one shows
// no description. This is the form's advice, not a limit.
export const DESCRIPTION_SHOWN = 120;

export type TextField = "name" | "description";
export type TextProblem = "too-short" | "too-long" | "format-character" | "url" | "angle-bracket" | "cjk" | "repeats-name" | "first-character";

const FORMAT_CHARACTER = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
const URL_START = /https?:\/\/|www\./i;
const WORD = /[\p{L}\p{M}\p{N}]+/gu;

// One problem for each rule that a non-blank text breaks, after removing outer spaces. `name`
// is the plugin's shown name, which a description must do more than repeat. Lengths count code
// points, as a reader counts characters, and a word is a run of letters, marks, and digits.
export function textProblems(field: TextField, text: string, name: string): TextProblem[] {
  const trimmed = text.trim();
  const length = [...trimmed].length;
  const problems: TextProblem[] = [];
  if (field === "name") {
    if (length < NAME_MIN) problems.push("too-short");
    if (length > NAME_MAX) problems.push("too-long");
    if (!/^[\p{L}\p{N}]/u.test(trimmed)) problems.push("first-character");
  } else {
    if ((trimmed.match(WORD)?.length ?? 0) < DESCRIPTION_MIN_WORDS) problems.push("too-short");
    if (length > DESCRIPTION_MAX) problems.push("too-long");
    if (onlyRepeatsName(trimmed, name)) problems.push("repeats-name");
  }
  if (FORMAT_CHARACTER.test(trimmed)) problems.push("format-character");
  if (URL_START.test(trimmed)) problems.push("url");
  if (trimmed.includes("<")) problems.push("angle-bracket");
  if (cjkShare(trimmed) >= 0.5) problems.push("cjk");
  return problems;
}
