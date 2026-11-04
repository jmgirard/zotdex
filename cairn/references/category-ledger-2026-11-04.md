# category-ledger-2026-11-04: a re-score of the `ai` and `attachments` rules on the held-out marks of 2026-11-03 (M092)

**Provenance.** Ingested 2026-11-04 by M092 from runs of the two scripts below. The input texts are the shelf file `cairn/references/sources/plugins-data-2026-11-03b.json`, whose `generatedAt` is 2026-11-03T22:05:15.306Z, with 736 records. The marks are the lines under "The held-out group" in `cairn/references/category-ledger-2026-11-03.md`. The base rules are the `categories.ts` blob `23f0c3c92ab12c8deea47b121156a23b48fafff7` of commit `f121d6fd`. The frozen rules are the `categories.ts` blob `15b019e217ba113b2134aa8c192645b3d0aeadec`.
Pagination: none.
Extraction: verified 2026-11-04 against the scripts' output. This is a snapshot, and the deployed data and the rules can change after it.

**Scope.** This page holds the counts that M092's choice rests on: what each rule removes, what it loses, and what the test cannot show. It makes no new marks. It is a reference, not an authority. Status lives in `ROADMAP.md`, decisions in `DECISIONS.md`, and architecture in `DESIGN.md`. `category-ledger-2026-11-03.md` holds the latest held-out read.

## What this test can and cannot show

This is a re-score, not a held-out read as D-059 defines one. D-061 records why.

- The marks existed before the rules. All 736 listed plugins were read, so no unread plugin existed to mark after the freeze.
- The rules' author did not see the marks. A fresh author worked from a folder without the held-out section, the 100 held-out ids, or any id list. A search of that folder for the 100 ids found none.
- The session that planned this work had read the held-out section. It chose the example cases that the author got, all from the tuning group or older test text. It added one thing to the rules before the freeze: a limit of 2000 characters on what a further test reads. No text in the data file passes 509 characters, so this limit changes no count.
- The two categories were chosen because of these marks: 13 of the 20 wrong assignments on this group are in them. So these counts are likely better than the rules will do on new plugins.
- The group is small, with 38 `ai` and 19 `attachments` assignments. The margin for `attachments` is 1.
- No read of unread plugins tested these rules. The row "Check categories on new plugins" holds that read. Until it runs, `category-ledger-2026-11-03.md` holds the expected rate.

## Results on the held-out group

The `include` and `exclude` lists are set aside. If a rule removes more wrong assignments than the right assignments it loses, it stays (AC1 of M092). The branch's rules are the frozen rules, so the candidate and branch counts are the same.

| Category | Base | Candidate and branch | Wrong removed | Right lost |
|---|---|---|---|---|
| `ai` | 31 right, 7 wrong | 31 right, 0 wrong | 7 | 0 |
| `attachments` | 13 right, 6 wrong | 10 right, 2 wrong | 4 | 3 |

- `ai`, wrong removed: `codex-zotero-bridge@guoxin-ink.github.io`, `literature-library@local.zotero`, `pdf-to-md@local`, `tex-fetch@colefaraday`, `writeflex@dominiklukes.net`, `zot-cli-bridge@zotero-cli-cc.org`, `zotero-management-bridge@example.org`.
- `attachments`, wrong removed: `easyread-zotero-sync@local.research`, `sdt-pack-sitter@search-works-for-zotero.invalid`, `zotero-markdown-summary@diantao.local`, `zotero@texglot.org`.
- `attachments`, right lost: `mineru-html@example.com`, `mineru-to-zotero@example.com`, `zotero-youtube-transcripts@lstrzepek`.

Over all categories, with the lists set aside, the wrong rate moves from 20 of 148 (13.5%) to 9 of 134 (6.7%). The other categories keep the base patterns, and they hold 7 of the 9 wrong assignments that remain. Every assignment that either set of rules gives on this group has a mark.

## Results over the 736 records

The lists are set aside, and each record's `overrides` come from `plugins/<id>/index.json` at the base commit. A loss on the base `exclude` list is wrong by an earlier read. Any other loss is one that the base `categories` gives, so it is right by an earlier read.

| Category | Base matches | Frozen matches | Lost, on `exclude` | Lost, base gives |
|---|---|---|---|---|
| `ai` | 217 | 179 | 33 | 5 |
| `attachments` | 108 | 78 | 23 | 7 |

The lost matches that the base gives are now `include` entries, so these plugins keep their categories:

- `ai`: `semantic-search@ildon.github.io`, `super-scholar@Kohirus`, `zotero-cool-paper@andybear`, `zotero-notebooklm@peterdresslar.com`, `zoteroautoccftagplugin@tobyshi.com`.
- `attachments`: `mineru-html@example.com`, `mineru-to-zotero@example.com`, `zenotes@alefa.net`, `zotero-pdf-outline-builder@xfl031129.github.io`, `zotero-youtube-transcripts@lstrzepek`, `zoteropdfmetadata@gmail.com`, `zoterotransnator@euclpts.com`.

The 56 `exclude` entries that the rules no longer need are gone, with the `BRIDGES` list. Four `attachments` entries stay, since the rule still matches them: `bibtex-clean@ouyangjiahong.github.io`, `zotero-random-read@xuan.dev`, `zotero@bibsonomy.org`, `zoterofig@forgeters.github.io`. The `compare.ts` script in `category-ledger.md` lists no loss and no gain between the base and the branch over these 736 records.

These results do not cover a plugin's upstream text that changes after the data file. A removed `exclude` entry no longer guards such a plugin.

**The cost of a new `include` entry.** A build that does not read a plugin gives it only its `include` categories. So each of the 12 plugins above still shows its category after a failed read, as `include` entries always do. Without the entry, it shows none.

## The score script

Copy `categories.ts`, `description.ts`, and `version.ts` of each set of rules to its own folder outside the repo. Then run `node score.ts <data file> <2026-11-03 ledger> <base categories.ts> <candidate categories.ts> [<branch categories.ts>]`, with absolute paths for the `categories.ts` files.

```ts
import { readFileSync } from "node:fs";

const [dataPath, ledgerPath, ...rulePaths] = process.argv.slice(2);
const records = new Map(JSON.parse(readFileSync(dataPath!, "utf8")).plugins.map((record: { id: string }) => [record.id, record]));
const section = readFileSync(ledgerPath!, "utf8").split("## The held-out group")[1]!.split("## The branch")[0]!;

// id -> slug -> mark. A mark opens the marks part or follows "), ", since a reason can hold commas.
const marks = new Map<string, Map<string, "right" | "wrong">>();
for (const line of section.split("\n")) {
  const found = /^- `([^`]+)`: (.*)$/.exec(line);
  if (!found) continue;
  const inner = new Map<string, "right" | "wrong">();
  for (const mark of found[2]!.matchAll(/(?:^|\), |: )([a-z-]+) \((right|wrong)\b/g)) inner.set(mark[1]!, mark[2] as "right" | "wrong");
  marks.set(found[1]!, inner);
}
if (marks.size !== 100) throw new Error(`read ${marks.size} lines, not 100`);

async function assignments(path: string) {
  const { CATEGORIES, categories } = await import(path);
  for (const category of CATEGORIES) {
    category.include = [];
    category.exclude = [];
  }
  return new Map([...marks.keys()].map((id) => [id, new Set<string>(categories(records.get(id)))]));
}

const count = (given: Map<string, Set<string>>, slug: string, mark: string) =>
  [...given].filter(([id, slugs]) => slugs.has(slug) && marks.get(id)!.get(slug) === mark).length;

const [base, ...others] = await Promise.all(rulePaths.map(assignments));
for (const slug of ["ai", "attachments"]) {
  console.log(`${slug}: base ${count(base!, slug, "right")} right, ${count(base!, slug, "wrong")} wrong`);
  others.forEach((given, index) => {
    const lost = (mark: string) => [...base!].filter(([id, slugs]) => slugs.has(slug) && !given.get(id)!.has(slug) && marks.get(id)!.get(slug) === mark).map(([id]) => id);
    console.log(`  rules ${index + 1}: ${count(given, slug, "right")} right, ${count(given, slug, "wrong")} wrong`);
    console.log(`    wrong removed ${lost("wrong").length}: ${lost("wrong").join(" ")}`);
    console.log(`    right lost ${lost("right").length}: ${lost("right").join(" ")}`);
  });
}
for (const [index, given] of [base!, ...others].entries()) {
  let wrong = 0;
  let total = 0;
  const unmarked: string[] = [];
  for (const [id, slugs] of given) {
    for (const slug of slugs) {
      const mark = marks.get(id)!.get(slug);
      if (slug === "other") continue;
      if (mark === undefined) unmarked.push(`${id} ${slug}`);
      else {
        total += 1;
        if (mark === "wrong") wrong += 1;
      }
    }
  }
  console.log(`all categories, rules ${index}: ${wrong} wrong of ${total} marked; unmarked: ${unmarked.join("; ") || "none"}`);
}
```

## The list script

Run `node lists.ts <repo root> <data file> <out data file> <base categories.ts> <frozen categories.ts>`. It writes the data copy that the `compare.ts` run reads, and it prints the counts and ids of the section above.

```ts
import { readFileSync, writeFileSync } from "node:fs";

const [root, dataPath, outPath, basePath, frozenPath] = process.argv.slice(2);
const data = JSON.parse(readFileSync(dataPath!, "utf8"));
let changed = 0;
for (const record of data.plugins) {
  const index = JSON.parse(readFileSync(`${root}/plugins/${record.id}/index.json`, "utf8"));
  const overrides = index.overrides ?? [];
  if (JSON.stringify(overrides) !== JSON.stringify(record.overrides ?? [])) {
    console.log(`overrides differ: ${record.id}`);
    changed += 1;
  }
  record.overrides = overrides;
}
writeFileSync(outPath!, JSON.stringify(data));
console.log(`records ${data.plugins.length}, overrides replaced on ${changed}`);

const base = await import(basePath!);
const frozen = await import(frozenPath!);
const lists = new Map<string, { include: readonly string[]; exclude: readonly string[] }>();
for (const category of base.CATEGORIES) lists.set(category.slug, { include: category.include, exclude: category.exclude });
for (const module of [base, frozen]) {
  for (const category of module.CATEGORIES) {
    category.include = [];
    category.exclude = [];
  }
}
for (const slug of ["ai", "attachments"]) {
  const { include, exclude } = lists.get(slug)!;
  const lostExcluded: string[] = [];
  const lostRight: string[] = [];
  const lostRightIncluded: string[] = [];
  let baseMatches = 0;
  const frozenMatch = new Set<string>();
  for (const record of data.plugins) {
    const before = base.categories(record).includes(slug);
    const after = frozen.categories(record).includes(slug);
    if (after) frozenMatch.add(record.id);
    if (before) baseMatches += 1;
    if (!before || after) continue;
    if (exclude.includes(record.id)) lostExcluded.push(record.id);
    else if (include.includes(record.id)) lostRightIncluded.push(record.id);
    else lostRight.push(record.id);
  }
  console.log(`\n${slug}: base matches ${baseMatches}, frozen matches ${frozenMatch.size}`);
  console.log(` lost, on the base exclude list (${lostExcluded.length}): ${lostExcluded.join(" ")}`);
  console.log(` lost, base gives by include already (${lostRightIncluded.length}): ${lostRightIncluded.join(" ")}`);
  console.log(` lost, base gives, needs include (${lostRight.length}): ${lostRight.join(" ")}`);
  const stillNeeded = exclude.filter((id) => frozenMatch.has(id));
  const notNeeded = exclude.filter((id) => !frozenMatch.has(id));
  console.log(` exclude entries still needed (${stillNeeded.length}): ${stillNeeded.join(" ")}`);
  console.log(` exclude entries no longer needed (${notNeeded.length}): ${notNeeded.join(" ")}`);
}
```
