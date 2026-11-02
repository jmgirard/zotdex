import { boundFetch, type Fetch, githubClient, parseRepoUrl } from "../upstream/reader.ts";
import { withinLimit } from "../upstream/time-limit.ts";

// The longest wait for all the requests of one `readSourceFacts` call.
export const SOURCE_READ_LIMIT_MS = 3 * 60 * 1000;
// The repos that one GraphQL request asks for.
const SOURCE_BATCH = 40;
const GRAPHQL = "https://api.github.com/graphql";

// What a name at the top of a repo must look like to say nothing about source code, in
// lowercase. A dotfile or dot-folder, and a name with one of these stems, extensions, or
// whole forms, is not source.
const NOT_SOURCE_STEMS = new Set(["readme", "license", "licence", "copying", "notice", "changelog", "changes"]);
const NOT_SOURCE_EXTENSIONS = new Set(["xpi", "md", "txt", "rdf", "png", "jpg", "jpeg", "gif", "svg", "webp"]);
const NOT_SOURCE_NAMES = new Set(["docs", "doc", "images", "image", "img", "assets", "screenshots", "dist", "build", "releases", "update", "updates"]);
const UPDATE_FILE = /^update.*\.json$/;

function isSource(given: string): boolean {
  const name = given.toLowerCase();
  if (name.startsWith(".") || NOT_SOURCE_NAMES.has(name) || UPDATE_FILE.test(name)) return false;
  const dot = name.lastIndexOf(".");
  const [stem, extension] = dot === -1 ? [name, ""] : [name.slice(0, dot), name.slice(dot + 1)];
  return !NOT_SOURCE_STEMS.has(stem) && !NOT_SOURCE_EXTENSIONS.has(extension);
}

// Whether any of a repo's top-level file and folder names can be source code. It reads no
// code and no folder, so a repo that keeps its code in `build`, with no other name that
// counts, gives false.
export function holdsSource(names: string[]): boolean {
  return names.some(isSource);
}

type SourceAnswer = { data?: Record<string, { object?: { entries?: { name?: unknown }[] } | null } | null> | null; errors?: { message?: unknown }[] } | null;

// Whether each repo's default branch holds source at its top level, by repo URL, read in
// batches so that all of them cost a few requests. A repo with no answer is left out, and
// `problem` says so. A failed request ends the read and keeps the batches before it. The fact
// is not needed to list a plugin, so this never throws and no failure here stops a build.
export async function readSourceFacts(fetch: Fetch, repoUrls: string[], ms = SOURCE_READ_LIMIT_MS): Promise<{ facts: Map<string, boolean>; problem?: string }> {
  const unique = [...new Set(repoUrls)];
  const facts = new Map<string, boolean>();
  const unread = () => unique.length - facts.size;
  let said: string | undefined;
  try {
    await withinLimit(ms, async (signal) => {
      const github = githubClient(boundFetch(fetch, signal));
      for (let start = 0; start < unique.length; start += SOURCE_BATCH) {
        const batch = unique.slice(start, start + SOURCE_BATCH);
        const variables: Record<string, string> = {};
        const fields = batch.map((url, i) => {
          const { owner, repo } = parseRepoUrl(url);
          variables[`o${i}`] = owner;
          variables[`n${i}`] = repo;
          return `r${i}: repository(owner: $o${i}, name: $n${i}) { object(expression: "HEAD:") { ... on Tree { entries { name } } } }`;
        });
        const declared = batch.map((_, i) => `$o${i}: String!, $n${i}: String!`).join(", ");
        const answer = (await github.post(GRAPHQL, { query: `query(${declared}) { ${fields.join(" ")} }`, variables })) as SourceAnswer;
        // GraphQL answers a rate limit with status 200, an `errors` list, and no data.
        const messages = (Array.isArray(answer?.errors) ? answer.errors : []).map((error) => error?.message).filter((message) => typeof message === "string");
        said ??= messages[0];
        if (!answer?.data) throw new Error(`the answer has no data${said ? `: ${said}` : ""}`);
        for (const [i, url] of batch.entries()) {
          const entries = answer.data[`r${i}`]?.object?.entries;
          if (!Array.isArray(entries)) continue;
          const names = entries.map((entry) => entry?.name);
          if (names.every((name): name is string => typeof name === "string")) facts.set(url, holdsSource(names));
        }
      }
    });
  } catch (error) {
    return { facts, problem: `${unread()} of ${unique.length} repos stay unread: ${(error as Error).message}` };
  }
  return unread() > 0 ? { facts, problem: `GitHub gave no top-level names for ${unread()} of ${unique.length} repos${said ? `: ${said}` : ""}` } : { facts };
}
