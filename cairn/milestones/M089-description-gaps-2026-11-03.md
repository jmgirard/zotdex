# M089: Fill the description gaps of 2026-11-03

- **Status:** review
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

- [x] AC1: `pnpm description-gaps cairn/references/sources/plugins-data-2026-11-03.json` prints no gap line, except for
      a plugin that `cairn/references/description-ledger-2026-11-03.md` marks `kept` because neither its manifest, its
      GitHub text, nor its default-branch README says what the plugin does.
- [x] AC2: Each `description` override that this milestone adds, as `git diff` of `plugins/*/index.json` against the
      default branch lists them, has no `version`, has an English value of at least six words, and has a `reason` that
      names the upstream file it was drawn from and which case each upstream text is, as DESIGN's Overrides item says.
      `pnpm check` passes.
- [x] AC3: Comparing `categories` with and without each added override, on the default branch's `exclude` lists, gives
      a list of the categories that the overrides add. A hand read marks each one right, or it is on that category's
      `exclude` list in `src/site/categories.ts`, so the plugin does not show it.
- [x] AC4: The Unreleased section of `CHANGELOG.md` has an entry that says these plugins now show English text and that
      such text hides later upstream edits until someone removes the override.
- [x] AC5: `pnpm test` and `pnpm check` pass.

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
- [x] T2: Write the overrides for the 15 `missing` gaps, or mark a row `kept`.
- [x] T3: Write the overrides for the 18 `short` gaps, or mark a row `kept`.
- [x] T4: Write the overrides for the 47 `cjk` gaps, or mark a row `kept`. These can take more than one sitting, so
      commit each batch.
- [x] T5: Run the category comparison of AC3, read each added category, and add the excludes for the wrong ones.
- [x] T6: Write `cairn/references/description-ledger-2026-11-03.md` in the shape of `description-ledger.md`, with its
      `INDEX.md` line: each gap's case, shown text, disposition, source, and each added category's mark.
- [x] T7: Add the `CHANGELOG.md` entry.

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
- 2026-11-03: T2 to T4: 80 overrides, 0 kept; the session read every value and reason; `pnpm description-gaps` on the data file prints 0 gaps. Sources other than a root README, named in each reason: `ZoteroExcerpt` (code, README is template text), `readai` and `translateAnt` (locale files), `zemble` (`docs/index.html`), `docboxtrans` and `paperplanex` (subfolder READMEs), `cychen.stats` (`bootstrap.js` menu label).
- 2026-11-03: session changed two drafts: `zoteromagic` no longer says "requires purchase", since `paid-service-sweep.md` records that its text states a trial and a purchase link and not what stops after the trial; `zotero-reading-room` no longer names features "still marked unreleased", which would go stale behind an override with no `version`.
- 2026-11-03: T5: the comparison on the default branch's lists gives 53 added categories; the read marks 26 right and 27 wrong, and each wrong one is now on its category's `exclude` list; on the branch's lists the comparison gives the 26. A text that names a model only as the translation engine counts as wrong under `ai`, since that category's `about` names chat, summaries, explanations, and agents.
- 2026-11-03: T7: `CHANGELOG.md` entry added; `pnpm test` (2238 passed, 6 skipped) and `pnpm check` (736 entries, 0 problems) pass. T2 to T5 and T7 share this commit, since the drafts came back together.
- 2026-11-03: the simple-english lint hook flagged old lines of `CHANGELOG.md` on the T7 edit, none of them in the new entry; those entries stay as they are, as this milestone does not reword them.
- 2026-11-03: T6: ledger page and `INDEX.md` line written; its table matches rows generated from the drafts and the command's list. The hook's other hits on the page stay: the `— observed` marks the rulebook asks for, quoted plugin text, and the two long lists of plugin names.
- 2026-11-03: claim audit: 717 claims read, 12 corrected — plugins/{ninja@fluctus.cc,rule-outline@local.zotero,zotero7-scidb@dev.null}/index.json in `value`; plugins/{ai-batch-reader@example.com,bilingual-reader@zotero.local,lcsc-datasheets@local.example,litmtrans@srt117.github.io,yonghao.zou@epfl.ch,zemble@cosmik.network,zotassets@yunze.dev,zotero-mcp-plugin@autoagent.my,zotero@bibsonomy.org}/index.json in `reason`; CHANGELOG.md read, none wrong. Four fresh Opus readers split the pass by the same four batches, as 625 KB of READMEs does not fit one reader well.
- 2026-11-03: review corrects the T5 line above: a model named as a translation engine counts as right under `ai`, as `category-ledger.md` marks such plugins, so the read is 32 right and 21 wrong.
- 2026-11-03: the audit left one claim standing that may be stale: `zoteropaperagent`'s "API key from a QR code login web page" is what the README's step 1 states, though `doc/3_1_Introduction_EN.md` says the Kimi web crawler was removed.

## Decisions

## Review

Evidence at head `5ac77a42`; `origin/main` has not moved since the branch was cut.

- AC1: `pnpm description-gaps cairn/references/sources/plugins-data-2026-11-03.json` exits 0 and prints `description gaps: 0`, against 80 at `a2066a9`. The ledger marks no row `kept`.
- AC2: `git diff --name-only origin/main...HEAD -- plugins` lists 80 entries. A script read of each finds one `description` override, no `version`, no CJK in the value, at least 7 words (the rule's floor is 6), and a `reason` that names a file and each upstream text. The English and the cases were read by the session and by four fresh claim-audit readers (717 claims, 12 corrected). `pnpm check`: 736 entries, 0 problems.
- AC3: the comparison on `origin/main`'s `src/site/categories.ts` gives 53 added categories; on the branch's it gives 26, each marked right in the ledger; the other 27 pairs were checked by script to be on their category's `exclude` list. The hand read and its marks are in `cairn/references/description-ledger-2026-11-03.md`, "Category changes".
- AC4: `CHANGELOG.md`, first entry under `## Unreleased`, says that "80 more plugins now show an English description" and that "Such a text hides later edits to the upstream description until someone removes the override."
- AC5: `pnpm test` exits 0 (2238 passed, 6 skipped, 33 files); `pnpm check` exits 0 (736 entries, 0 problems). Consistency gate: `cairn_validate.py` all checks passed; the generic profile names no toolchain checks; no principle changed.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: `zoteropaperagent`'s "API key from a QR code login web page" is probably false for version 3.1.1, since `doc/3_1_Introduction_EN.md` says 3.1.0 removed the Kimi web crawler — fix now.
- diff-bug #2: `zotero@wilddata.cn` has no paid-service verdict that read its GitHub text, which names a free allowance for new users — follow-up: row "Read new plugins for paid services", low, since About says a mark can be missing.
- diff-bug #3: time-bound claims stay behind overrides with no `version` (`readai`, `break-pdf`, `remarkable`, `zodh`, `ninja`, `zotero-reading-room`) — reject, planned change: D-031 intends a text that stays until removed, and AC4 tells users so.
- diff-bug #4: privacy and safety claims read in the index's own voice (`rule-outline`, `wmu-journal-tags`, `ccfa`, `zotero-tray`, `pdfocrforzotero`) — fix now; `zotero-reading-room`'s "local-first" cut too.
- diff-bug #5: the `ai` rule for a model named as a translation engine was applied only to added categories, so parallel plugins differ — fix now, with blame-history #1.
- diff-bug #6: ledger marks differ for `zotero-lit-ai-matrix`, `zemble` against `zotero-wikicite`, and `zotero-mcp-plugin` — reject, false: the texts differ; the matrix reads notes into its table and only shows metadata, zemble sends items to an outside service while wikicite syncs citation data, and the MCP plugin's own tools do these writes.
- diff-bug #7: `paperplanex`'s named path is a submodule, not a file of the listed repo, and the changelog says "in its repository" — fix now.
- diff-bug #8: the new excludes stay if an owner removes or replaces the override that caused them — follow-up: new row "Drop excludes left by removed overrides", parked, promote when a user reports it, since no documented or common use reaches it yet.
- diff-bug #9: `ROADMAP.md` row "Refine the Latin part and short picks" still counts 8 overrides, and M089 adds 5 such cases — fix now.
- diff-bug #10: `zotbox`'s maker's site was not read for a paid mark — follow-up: row "Read new plugins for paid services", low.
- diff-bug #11: `zotero7-scidb`'s text names Sci-Hub, close to the Contract boundary's "does not endorse" — reject, false: the text says what the plugin does as its README does, which is no endorsement, and no rule bars the name.
- diff-bug #12: reasons call slugs or names "in English" (`translateAnt`, `readai`, `zotero@wilddata.cn`) — reject, style: the case matches what `description.ts` computes.
- diff-bug #13: the work log's list of non-root sources omits `zoteropaperagent` and `geyi` — reject, style: their reasons and the ledger name those files.
- diff-bug #14: the longest value is 276 characters against 261 before — reject, style: no rule limits it.
- blame-history #1: the new `ai` excludes contradict `category-ledger.md`, which marks `paper-translator`, `pdf2zh`, `zotero-better-translate`, and `bilingual-reader@zbr.local` right under `ai` — fix now: six of the seven `ai` excludes are reversed; only `zotero-figure-extract` stays.
- blame-history #2: D-037's 1 in 10 test is not evidenced, as only added assignments were read — reject, planned change: the plan reads only the categories the overrides add, and the row "Check categories on new plugins" stays.
- blame-history #3: the ledger's G76 note cites the sweep with the wrong sign — reject, false: `paid-service-sweep.md:434` states the trial and purchase link, as the note says.
- prior-review #1: the row "Check categories on new plugins" does not record this read — reject, false: that row is about new plugins, which this read did not cover, and its text stays true.
- prior-review #2: the first-read rate is far above D-037's 1 in 10 — reject, planned change: same as blame-history #2.
- prior-review #3: M067's "categories follow overrides" lesson is not in `LESSONS.md` — reject, false: the diff does not touch that file, and this milestone's T5 did the comparison.
- ripple #1: `README.md`'s "an About edit changes the description" is false for a plugin with an override — fix now.
- ripple #2: `text-change.yml` does not say that an index override hides the About text — fix now.
- ripple #3: same as prior-review #1 — reject, false.
- ripple #4: `category-ledger.md:569` says no later read checks new plugins — reject, false: this read covers plugins whose text changed, not new plugins.
- ripple #5: `README.md`'s definition of upstream names fewer files than these reasons cite — reject, false: it says where an English text can exist, and DESIGN's Overrides item lets the override draw on another upstream file.
- ripple #6: `README.md:77` and `about.astro:114` name no overrides — reject, false: the override paragraph follows each.

After the fix-now edits: the comparison gives 53 added on `origin/main`'s lists and 32 on the branch's, each of the 32 marked right in the ledger, and the other 21 on their `exclude` lists. `pnpm description-gaps` prints 0 gaps, `pnpm test` passes 2238 with 6 skipped, `pnpm check` reports 0 problems, and `cairn_validate.py` passes.

snapshot: no changed snapshot file.
