# M090: Fill the six later description gaps

- **Status:** review
- **Priority:** normal
- **Depends on:** M089
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — 6 plugins' shown descriptions and some of their categories change on the site
- **Branch/PR:** m090-six-later-description-gaps

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

- [x] AC1: `pnpm description-gaps cairn/references/sources/plugins-data-2026-11-03b.json` prints no gap line.
- [x] AC2: Each `description` override that this milestone adds, as `git diff` of `plugins/*/index.json` against the
      default branch lists them, has no `version` and has an English value of at least six words. Each claim in the
      value is stated in the upstream file that its `reason` names, and the value holds no privacy or safety assurance
      and no feature that file marks unreleased. The `reason` says which case each upstream text is, in the words of
      DESIGN's Overrides item or, for an English text the site does not show, "in English and not shown".
- [x] AC3: On AC1's data file, each category that an override adds is either right by the rule of
      `cairn/references/category-ledger.md` and shown, or wrong and on its `exclude` list in `src/site/categories.ts`.
      The new ledger section marks each.
- [x] AC4: The entry in the Unreleased section of `CHANGELOG.md` that says plugins now show English text gives the count
      86, and it still says that such text hides later upstream edits until someone removes the override.
- [x] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T2
- AC2 → T2
- AC3 → T3, T4
- AC4 → T5
- AC5 → T2, T3, T5

## Tasks

- [x] T1: Run the command on the data file, and save the list. Read the plugin READMEs. Check that no `text-change` issue
      records an owner's removal for a listed plugin (none exists on 2026-11-03).
- [x] T2: Write the overrides for the 4 `short` gaps and the 2 `cjk` gaps.
- [x] T3: Compare `categories` with and without each override on that data, read each added category, and add the
      excludes for the wrong ones.
- [x] T4: Add the section to the ledger page: the data file's `generatedAt` and SHA-256, each gap's case, shown text,
      disposition, source, and each added category's mark. Say that these 6 were read failures in the earlier data, not
      new plugins, and update the page's Scope and Evidence snapshot, which say one data file.
- [x] T5: Change the count in the `CHANGELOG.md` entry, and add `zotfetch@edslab.research` and `zotxt@e6h.org` to the row
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
- 2026-11-03: T1 to T5: the command printed 6 gaps at `819ee093`; READMEs read by the session, no subagent; no `text-change` issue exists. 6 overrides written, and the command prints 0 gaps. The comparison gave 11 added categories, 7 marked right and 4 excluded (review's rewording of one text left 9 and 2). Ledger section, changelog count, and the row's count added. These share this commit, since each is small.
- 2026-11-03: claim audit: 57 claims read, 2 corrected — plugins/zoterotransnator@euclpts.com/index.json in `value`, plugins/zoturead@zotero.org/index.json in `reason`; CHANGELOG.md read, none wrong.

## Decisions

## Review

Evidence at head `646c41f8`; `origin/main` has not moved since the branch was cut.

- AC1: `pnpm description-gaps cairn/references/sources/plugins-data-2026-11-03b.json` prints `description gaps: 0`, against 6 before this branch.
- AC2: `git diff --name-only origin/main...HEAD -- plugins` lists 6 entries. A script read finds one `description` override in each, no `version`, no CJK, and 36 to 46 words. A fresh claim-audit reader checked each claim against its upstream file (57 claims, 2 corrected), and the session read the values for privacy or safety assurances and unreleased features, and found none.
- AC3: on `plugins-data-2026-11-03b.json`, the comparison gives 11 added categories on `origin/main`'s lists and 7 on the branch's. The ledger's section "Later gaps (M090)" marks the 7 right and the other 4 wrong, and those 4 are on `exclude` lists in `src/site/categories.ts`.
- AC4: `CHANGELOG.md`, first entry under `## Unreleased`, opens "86 more plugins now show an English description" and keeps "Such a text hides later edits to the upstream description until someone removes the override."
- AC5: `pnpm test` exits 0 (2238 passed, 6 skipped, 33 files); `pnpm check` exits 0 (736 entries, 0 problems). Consistency gate: `cairn_validate.py` all checks passed; the generic profile names no toolchain checks; no principle changed.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: `zotfetch@edslab.research`'s source list names only open-access sources and a proxy, while its README says it tries its own Sci-Hub mirrors, so the text suggests legal sourcing — fix now, fixed ad9c5b9a.
- diff-bug #2: `zotxt`'s "through an API, which lets pandoc" states a causal link the README never makes — fix now, fixed ad9c5b9a.
- diff-bug #3: `zotwanglele`'s text names only selected-text translation, while its README lists whole-PDF translation as a main feature — fix now, fixed ad9c5b9a.
- diff-bug #4: `zoturead`'s "tied to the uread.today site" covers all its tools, while the README ties only the first group to that site — fix now, fixed ad9c5b9a.
- diff-bug #5: `zotfetch@nikhilweee.me`'s "so annotations stay usable" repeats a README assurance about user data — fix now, fixed ad9c5b9a; the new text also leaves out what caused its two excludes, so those are removed.
- diff-bug #6: `zoterotransnator` under `attachments` sits awkwardly beside `mineru-parse`'s exclude — reject, false: this text names OCR-style recognition, which the category's `about` holds, and the reader marks it right too.
- diff-bug #7: `zoterotransnator`'s `export` exclude has mixed precedent in `llm-for-zotero-sync` — reject, false: the README's data flow ends in a Zotero note, and `paper-companion` and `annotationmanage` match it.
- diff-bug #8: `zotxt`'s `export` exclude can be argued the other way — reject, false: nothing says zotxt exports or syncs anything.
- diff-bug #9: `zoturead`'s `metadata` matched "CNKI", not its real ground, and the ledger does not say so — reject, style: the mark is right.
- diff-bug #10: `zoturead` and `zotwanglele` say "half or more Chinese" where AC2 asks for DESIGN's words — fix now, fixed ad9c5b9a, so the reasons read as AC2 states.
- diff-bug #11: `zotfetch@edslab.research` and `zotwanglele` omit some credentials that `zoterotransnator` states — reject, style: AC2 binds what a value claims, and no rule asks a text to list every credential.
- diff-bug #12: `zoterotransnator`'s "needs an API token or key" lacks "your own" — reject, style.
- diff-bug #13: `paid-service-sweep.md`'s `zoterotransnator` line names no Baidu token — reject, false: Baidu is a third party, so the no-mark verdict stands, and that page is a dated read.
- diff-bug #14: `zoterotransnator`'s text omits the README's Alpha label, and its tail reads as a fragment — fix now for the fragment, with prior-review #1, fixed ad9c5b9a; reject the label, planned change: D-031 intends texts with no `version`, so a text leaves out a status that goes stale.
- diff-bug #15: 5 of these 6 values are among the longest overrides — reject, style: no rule limits length.
- diff-bug #16: the ledger's title and Provenance name only M089 — fix now for the title, fixed ad9c5b9a; the new section says who read the READMEs.
- diff-bug #17: the ledger's "this data file" is ambiguous, and the no-`upstream` line does not apply to the second file — fix now, fixed ad9c5b9a.
- diff-bug #18: `category-ledger.md`'s `zoturead` and `zotxt` rows say "no upstream facts on this file" — reject, false: those rows are a dated read of an earlier file.
- diff-bug #19: the row "Drop excludes left by removed overrides" omits M090 — fix now, fixed ad9c5b9a.
- diff-bug #20: `zotxt` on the `citations` `include` is redundant while the override stands — reject, false: it still matters if the override goes.
- diff-bug #21: "and 5 more (...) and 2 more (...)" in the row "Refine the Latin part and short picks" is clumsy — reject, style.
- diff-bug #22: AC2 was ticked before these reviewers finished — reject, false: its evidence line came first as the rule asks, and the line below gives fresh evidence after the fixes.
- blame-history #1: `zoturead` keeps a hand `search` assignment that its new text does not match — reject, false: its text says that it searches sites for books, which fits "Search and discovery", and AC3 reads only added categories.
- blame-history #2: `zotxt`'s `export` exclude has a reason that does not match the category's sense — reject, false: same as diff-bug #8.
- blame-history #3: the ledger section records no check against the M089 lesson — reject, false: the prior-review and diff-bug lenses checked the six texts and found no privacy assurance or unreleased feature after these fixes.
- prior-review #1: `zoterotransnator`'s "a cost estimate first" states a README setting as always on — fix now, fixed ad9c5b9a.
- prior-review #2: `zotxt`'s `export` exclude rests on a word match alone — reject, false: same as diff-bug #8.
- ripple #1: same as diff-bug #19 — fix now, fixed ad9c5b9a.
- ripple #2: `INDEX.md`'s line names one data set and M089 — fix now, fixed ad9c5b9a.
- ripple #3: same as diff-bug #16 — fix now, fixed ad9c5b9a.
- ripple #4: the row "Fill description gaps on new plugins" says only M089 filled the gaps of that date — fix now, fixed ad9c5b9a.
- ripple #5: same as diff-bug #17 — fix now, fixed ad9c5b9a.

After the fix-now edits: `pnpm description-gaps` on AC1's file prints 0 gaps. AC2: the six values were reread against their READMEs by the session, each with one override, no `version`, and no CJK. AC3: the comparison gives 9 added categories on `origin/main`'s lists and 7 on the branch's, each of the 7 marked right in the ledger, and the other 2 on the `export` `exclude` list. `pnpm test` passes 2238 with 6 skipped, `pnpm check` reports 0 problems, and `cairn_validate.py` passes.

snapshot: no changed snapshot file.
