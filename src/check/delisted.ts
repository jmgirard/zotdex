import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { Ajv } from "ajv";
import schema from "../../schemas/delisted.schema.json" with { type: "json" };

// One plugin that a maintainer removed. `ids` holds only ids judged unique to the repo,
// since a fork can keep its source's id.
export interface DelistedRecord {
  repo: string;
  ids: string[];
  issue: number;
  date: string;
}

// The records by lowercase owner/repo and by lowercase plugin id.
export interface Delisted {
  repos: Map<string, DelistedRecord>;
  ids: Map<string, DelistedRecord>;
}

export const NOTHING_DELISTED: Delisted = { repos: new Map(), ids: new Map() };

const validate = new Ajv({ allErrors: true }).compile(schema);

// The list every command reads, whichever directory it checks. Tests name another file.
export function delistedPath(): string {
  return process.env.ZPI_DELISTED || resolve(import.meta.dirname, "../../delisted.json");
}

// Throws with the file's problem when it cannot be read or its schema refuses it. A missing
// file is such a problem, so a lost list cannot let removed plugins back in.
export async function readDelisted(path = delistedPath()): Promise<Delisted> {
  let value: unknown;
  try {
    value = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`cannot read the list: ${(error as Error).message}`);
  }
  if (!validate(value)) {
    const problems = (validate.errors ?? []).map((error) => `${error.instancePath || "(root)"} ${error.message ?? "is invalid"}`);
    throw new Error(`the list does not match schemas/delisted.schema.json: ${problems.join("; ")}`);
  }
  return delistedFrom(value as DelistedRecord[]);
}

export function delistedFrom(records: DelistedRecord[]): Delisted {
  const delisted: Delisted = { repos: new Map(), ids: new Map() };
  for (const record of records) {
    delisted.repos.set(record.repo, record);
    for (const id of record.ids) delisted.ids.set(id.toLowerCase(), record);
  }
  return delisted;
}

// The lowercase owner/repo of a URL on github.com, in any letter case, with or without
// `.git`. A URL on another host names no repo on the list.
export function githubRepoOf(url: unknown): string | undefined {
  if (typeof url !== "string" || !URL.canParse(url)) return undefined;
  const { host, pathname } = new URL(url);
  if (!["github.com", "www.github.com"].includes(host.toLowerCase())) return undefined;
  const [owner, repo] = pathname.split("/").filter(Boolean);
  return owner && repo ? `${owner}/${repo.replace(/\.git$/i, "")}`.toLowerCase() : undefined;
}

// What a refusal says about a repo or id that a maintainer removed.
export function delistedMessage(named: string, record: DelistedRecord): string {
  return `a maintainer removed ${named} from the index in issue #${record.issue}, so the bot does not propose it again`;
}
