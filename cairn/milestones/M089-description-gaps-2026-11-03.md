# M089: Fill the description gaps of 2026-11-03

- **Status:** in-progress
- **Priority:** normal
- **Depends on:** M088
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — 80 plugins' shown descriptions and some of their categories change on the site
- **Branch/PR:** m089-description-gaps-2026-11-03

## Goal

Each plugin that `pnpm description-gaps` lists for the deployed data of 2026-11-03 shows an English description of at least six words, from an index override.

## Scope

**In:** Item (4) of the candidate row "Close gaps in the description pick", for the data of 2026-11-03: 80 gaps (47
cjk, 18 short, 15 missing), with a `description` override for each that an upstream text can support, drawn from the
plugin's README or other upstream file as M067 did. The category changes that these overrides cause. A ledger page.

**Out:** Plugins added after that data file, and shown texts in other languages, which the command does not see → the
row "Fill description gaps on new plugins". Mixed texts with a CJK share under 0.5, which D-038 gives no override.
Records with no `upstream` block, which the command skips. A pick rule that prefers a longer GitHub text → the parked
row "Refine the Latin part and short picks".

## Acceptance criteria

- [ ] AC1: `pnpm description-gaps cairn/references/sources/plugins-data-2026-11-03.json` prints no gap line, except for
      a plugin that `cairn/references/description-ledger-2026-11-03.md` marks `kept` because neither its manifest, its
      GitHub text, nor its default-branch README says what the plugin does.
- [ ] AC2: Each `description` override that this milestone adds, as `git diff` of `plugins/*/index.json` against the
      default branch lists them, has no `version`, has an English value of at least six words, and has a `reason` that
      names the upstream file it was drawn from and which case each upstream text is, as DESIGN's Overrides item says.
      `pnpm check` passes.
- [ ] AC3: Comparing `categories` with and without each added override, on the default branch's `exclude` lists, gives
      a list of the categories that the overrides add. A hand read marks each one right, or it is on that category's
      `exclude` list in `src/site/categories.ts`, so the plugin does not show it.
- [ ] AC4: The Unreleased section of `CHANGELOG.md` has an entry that says these plugins now show English text and that
      such text hides later upstream edits until someone removes the override.
- [ ] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T2, T3, T4, T6
- AC2 → T2, T3, T4
- AC3 → T5
- AC4 → T7
- AC5 → T2, T3, T4, T5, T7

## Tasks

- [x] T1: Run the command on the data file after M088, and save the list. Read the plugin READMEs by the blob read of
      the 2026-11-02 M082 lesson. Check that no `text-change` issue records an owner's removal for a listed plugin (none
      exists on 2026-11-03).
- [ ] T2: Write the overrides for the 15 `missing` gaps, or mark a row `kept`.
- [ ] T3: Write the overrides for the 18 `short` gaps, or mark a row `kept`.
- [ ] T4: Write the overrides for the 47 `cjk` gaps, or mark a row `kept`. These can take more than one sitting, so
      commit each batch.
- [ ] T5: Run the category comparison of AC3, read each added category, and add the excludes for the wrong ones.
- [ ] T6: Write `cairn/references/description-ledger-2026-11-03.md` in the shape of `description-ledger.md`, with its
      `INDEX.md` line: each gap's case, shown text, disposition, source, and each added category's mark.
- [ ] T7: Add the `CHANGELOG.md` entry.

## Work log

- 2026-11-03: created by /milestone-plan.
- 2026-11-03: tier check: milestone — the row mixes a CJK count rule, page changes, and data work, so it is more than a bug fix.
- 2026-11-03: collision: D-038 says "Every such plugin gets an override." and rejected a hand read that keeps clear short texts, so the 18 short gaps get overrides. D-049's owner removal outranks it, and no `text-change` issue exists on 2026-11-03. M067 did this work for the data of 2026-10-31 (31 overrides, 9 category excludes). Row "Check categories on new plugins" stays; this milestone reads only the categories its overrides add.
- 2026-11-03: idea vet: gap: the row names no snapshot; reading taken: the newest shelf file, 2026-11-03, 736 records, 80 gaps. Gap: `pnpm description-gaps` sees no other language; reading taken: the command's list only, which is what the row names.
- 2026-11-03: lessons used: 2026-10-25 (M001), 2026-10-27 (M027), 2026-11-02 (M082), 2026-11-02 (M081), 2026-10-31 (M066), 2026-11-03 (M085).
- 2026-11-03: criteria audit (full mode) by a fresh Opus reader: 5 findings on this milestone, each fixed in the wording, toward the narrower promise: the Goal claimed every plugin and now names the command's list (the reader found Spanish and Turkish shown texts, 10 mixed texts, and 39 records with no upstream block that it misses); a criterion on 2 French texts is cut, since `readeck-import` has an English GitHub text and fits no override case, and all such texts go to the new row; AC1's `kept` now names what is read; AC2's `reason` now states each text's case; the category criterion now compares on the default branch's `exclude` lists, and its marks go to the ledger task.
- 2026-11-03: plan chose an override for each gap over a pick rule that prefers a longer GitHub text, because 5 of the 18 short gaps have an English GitHub text of six or more words and one of those is only a pointer to another repo; falsified by a later list where most short gaps have such a text.
- 2026-11-03: plan chose one milestone for all 80 over a split by case, because the overrides change one kind of file and review reads them one way; falsified by a branch whose review cannot read them in one pass.
- 2026-11-03: T1: the command on the data file (`generatedAt` 2026-11-03T14:25:58.649Z, sha256 `b66c7ab3…`) printed 80 gaps at `a2066a9` (47 cjk, 18 short, 15 missing); a GraphQL tree-then-blob read got all READMEs of the 80 repos, none lost; `gh issue list --label text-change --state all` lists none.
- 2026-11-03: delegation: four Opus subagents draft the overrides from README reads, one for the missing gaps, one for the short gaps, two for the cjk gaps; their brief is a scratch file, and the session checks each result before commit.

## Decisions

## Review
