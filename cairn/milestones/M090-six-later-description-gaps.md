# M090: Fill the six later description gaps

- **Status:** planned
- **Priority:** normal
- **Depends on:** M089
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — 6 plugins' shown descriptions and some of their categories change on the site
- **Branch/PR:** —

## Goal

With this milestone's overrides, the deployed data whose `generatedAt` is 2026-11-03T22:05:15.306Z shows an English description of at least six words for `zoterotransnator@euclpts.com`, `zotfetch@edslab.research`, `zotfetch@nikhilweee.me`, `zoturead@zotero.org`, `zotwanglele@wanglele.com`, and `zotxt@e6h.org`.

## Scope

**In:** The 6 gaps that `pnpm description-gaps` prints for that data (4 short, 2 cjk), with a `description` override for
each, drawn from the plugin's README or other upstream file as M067 and M089 did. The category changes that these
overrides cause. A new section in `cairn/references/description-ledger-2026-11-03.md`. The count in the `CHANGELOG.md`
entry that M089 added. The override count in the row "Refine the Latin part and short picks".

**Out:** Plugins added after that data file, and shown texts in other languages, which the command does not see → the
row "Fill description gaps on new plugins". Mixed texts with a CJK share under 0.5, which D-038 gives no override.

## Acceptance criteria

- [ ] AC1: `pnpm description-gaps cairn/references/sources/plugins-data-2026-11-03b.json` prints no gap line.
- [ ] AC2: Each `description` override that this milestone adds, as `git diff` of `plugins/*/index.json` against the
      default branch lists them, has no `version` and has an English value of at least six words. Each claim in the
      value is stated in the upstream file that its `reason` names, and the value holds no privacy or safety assurance
      and no feature that file marks unreleased. The `reason` says which case each upstream text is, in the words of
      DESIGN's Overrides item or, for an English text the site does not show, "in English and not shown".
- [ ] AC3: On AC1's data file, each category that an override adds is either right by the rule of
      `cairn/references/category-ledger.md` and shown, or wrong and on its `exclude` list in `src/site/categories.ts`.
      The new ledger section marks each.
- [ ] AC4: The entry in the Unreleased section of `CHANGELOG.md` that says plugins now show English text gives the count
      86, and it still says that such text hides later upstream edits until someone removes the override.
- [ ] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T2
- AC2 → T2
- AC3 → T3, T4
- AC4 → T5
- AC5 → T2, T3, T5

## Tasks

- [ ] T1: Run the command on the data file, and save the list. Read the plugin READMEs. Check that no `text-change` issue
      records an owner's removal for a listed plugin (none exists on 2026-11-03).
- [ ] T2: Write the overrides for the 4 `short` gaps and the 2 `cjk` gaps.
- [ ] T3: Compare `categories` with and without each override on that data, read each added category, and add the
      excludes for the wrong ones.
- [ ] T4: Add the section to the ledger page: the data file's `generatedAt` and SHA-256, each gap's case, shown text,
      disposition, source, and each added category's mark. Say that these 6 were read failures in the earlier data, not
      new plugins, and update the page's Scope and Evidence snapshot, which say one data file.
- [ ] T5: Change the count in the `CHANGELOG.md` entry, and add `zotfetch@edslab.research` and `zotxt@e6h.org` to the row
      "Refine the Latin part and short picks", since each has an English GitHub text of six or more words.

## Work log

- 2026-11-03: created by /milestone-plan.
- 2026-11-03: tier check: milestone — it changes text and categories the site shows, it is no bug, and no tier below a milestone holds such a change.
- 2026-11-03: idea vet: gap: the user's "fill them" could cover the other-language texts of the row; reading taken: the 6 that the command lists, which is what the user was told. No flaw.
- 2026-11-03: collision: M089 did this work for the data of 14:25; D-038 says "Every such plugin gets an override."; the row "Fill description gaps on new plugins" keeps the other-language texts and later plugins. No open issue overlaps (0 open), the 5 open PRs are bot pull requests for new plugins, and no `text-change` issue exists.
- 2026-11-03: lessons used: 2026-11-03 (M089), 2026-11-02 (M082), 2026-10-25 (M001), 2026-10-31 (M066).
- 2026-11-03: question set: none posed; the user asked for these fills after seeing the list, and nothing else here is theirs to settle.
- 2026-11-03: criteria audit (full mode) by a fresh Opus reader: 11 findings, each taken. `kept` is cut, since all 6 have a text that says what the plugin does and D-038 keeps no clear short text; the Goal names the 6 ids and the data; AC2 binds the value's claims and M089's lesson and drops a repeated `pnpm check`; AC3 states the deliverable and the rule, which an over-exclude now fails; AC4 gives the count 86; T4 records the file's SHA-256, since the shelf is gitignored, and says these 6 were read failures; T5 adds the row's stale count. The reader's run confirmed 6 gaps and 736 of 736 records with an upstream block.
- 2026-11-03: plan chose editing M089's Unreleased entry over a second entry, because one changelog line reads better for one kind of change and M089 has not shipped in a release; falsified by a release cut between them.
- 2026-11-03: plan chose a section in the existing ledger page over a new page, because both reads share a date and a method; falsified by a page too long to read in one pass.
- 2026-11-03: AC1's shelf file renamed from the audited name to `plugins-data-2026-11-03b.json`, since `cairn_validate.py` reads the earlier name's digits as a bad date; the same file, so the audit stands.

## Decisions

## Review
