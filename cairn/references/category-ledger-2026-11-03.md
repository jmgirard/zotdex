# category-ledger-2026-11-03: a hand read of the categories of the plugins added since 2026-10-31 (M091)

**Provenance.** Ingested 2026-11-03 by M091 from a hand read of the results of `categories` in `src/site/categories.ts`. The input is the shelf file `cairn/references/sources/plugins-data-2026-11-03b.json`, the deployed `v1/plugins.json`, whose `generatedAt` is 2026-11-03T22:05:15.306Z, with 736 records. The base commit is `b941616be45162de233a0430682c7bc51bc8316e`. A new plugin is a record of that file whose id is not in `cairn/references/sources/plugins-data-2026-10-31.json`. There are 464.
Pagination: none.
Extraction: observed 2026-11-03. This is a snapshot, and the deployed data and the rules can change after it.

**Scope.** This page records the read that M091's criteria rest on. It gives each new plugin's categories on the base commit, with a mark for each. It also gives two wrong rates and each change of category that the branch makes. It is not a source summary, and it builds no checker. It is a reference, not an authority. Status lives in `ROADMAP.md`, decisions in `DECISIONS.md`, and architecture in `DESIGN.md`. `category-ledger.md` holds the earlier reads.

## How the read marks an assignment

The rule is the one in `category-ledger.md`, section "How the read marks an assignment". For an `include` entry or `other`, it is the rule of that page's section "The M086 read of plugins with no category". If the plugin's name or descriptions say that it does such a thing as the category's `about` text says, the assignment is right. If the plugin only mentions the matched word, the assignment is wrong. A read marks a borderline assignment right. Fresh readers made the first marks, in batches, and the agent settled each wrong and missing mark.

A counted assignment is a category that `categories` gives a record and that does not come from an `include` list alone.

## The two groups

**The held-out group.** Sort the new plugins' ids by the SHA-1 hex digest of the id. Skip the first 70, which the plan read. Drop each id whose text appears in `src/site/categories.ts`, `cairn/references/category-ledger.md`, `cairn/references/description-ledger.md`, or `cairn/references/description-ledger-2026-11-03.md` at the base commit. Take the first 100. The tuning group is the other 364 new plugins.

```python
import hashlib, json, subprocess, sys

root, base = sys.argv[1:3]
load = lambda f: json.load(open(f"{root}/cairn/references/sources/{f}"))["plugins"]
older = {p["id"] for p in load("plugins-data-2026-10-31.json")}
new = sorted((p["id"] for p in load("plugins-data-2026-11-03b.json") if p["id"] not in older),
             key=lambda i: hashlib.sha1(i.encode()).hexdigest())
named = "".join(subprocess.check_output(["git", "-C", root, "show", f"{base}:{f}"], text=True) for f in [
    "src/site/categories.ts", "cairn/references/category-ledger.md",
    "cairn/references/description-ledger.md", "cairn/references/description-ledger-2026-11-03.md"])
print("\n".join(sorted([i for i in new[70:] if i not in named][:100])))
```

## The listing script

Run `node list.ts <data file> <categories.ts>`, with absolute paths. The older data file must be beside the data file. For the base rules, copy `categories.ts`, `description.ts`, and `version.ts` of the base commit to a folder outside the repo. Then give the path of the copied `categories.ts`. The script prints each new plugin's id, a tab, and its categories.

```ts
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const [dataPath, categoriesPath] = process.argv.slice(2);
const { categories } = await import(categoriesPath);
const read = (path: string) => JSON.parse(readFileSync(path, "utf8")).plugins;
const older = new Set(read(join(dirname(dataPath), "plugins-data-2026-10-31.json")).map((record: { id: string }) => record.id));
const lines = read(dataPath)
  .filter((record: { id: string }) => !older.has(record.id))
  .map((record: { id: string }) => `${record.id}\t${categories(record).join(",")}`)
  .toSorted();
console.log(lines.join("\n"));
```
