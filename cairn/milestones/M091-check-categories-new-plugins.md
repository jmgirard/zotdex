<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M091: Check categories on new plugins

- **Status:** in-progress   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** normal   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** user-facing — visitors see the categories on the home menu, plugin pages, and About page   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** m091-check-categories-new-plugins   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

## Goal
<!-- owner: plan · create; a wrong goal returns to plan, never edited in place -->

The site's categories rest on a hand read of the 464 plugins added since 2026-10-31, a measured wrong rate on plugins that the tuning did not see, and category links that say what they do.

## Scope
<!-- owner: plan · create/amend-via-gate -->

**Terms.**
- The data file is `cairn/references/sources/plugins-data-2026-11-03b.json` (`generatedAt` 2026-11-03T22:05:15.306Z, 736 records).
- A new plugin is a record of the data file whose id is not in `cairn/references/sources/plugins-data-2026-10-31.json`.
- The base commit is the commit that the milestone branch is cut from.
- The ledger is `cairn/references/category-ledger-2026-11-03.md`.
- The held-out group: sort the new plugins' ids by the SHA-1 hex digest of the id, skip the first 70 (the plan read those), drop each id whose text appears in `src/site/categories.ts`, `cairn/references/category-ledger.md`, `cairn/references/description-ledger.md`, or `cairn/references/description-ledger-2026-11-03.md` at the base commit, then take the first 100. The tuning group is the other 364 new plugins.
- A counted assignment is a category that `categories` gives a record and that does not come from an `include` list alone.

**In:** read and mark every category of the 464 new plugins; change patterns where a word match can go wrong again, and use `include` and `exclude` entries for single plugins; add a category that a plugin clearly lacks when the read sees it; measure the wrong rate before tuning and on the held-out group after it; label the plugin page's category links.

**Out:**
- Plugins merged after the data file's `generatedAt` → the row "Check categories on new plugins", which stays for them.
- A promise to find every missing category → no procedure enumerates it, so the ledger states the limit.
- A new category, or a new way to assign categories → if the held-out rate is over 1 in 10, that is the user's decision at the stop (D-059).
- Categories in the published data → the row "Publish plugin categories in the data".
- Excludes left by removed overrides → the row "Drop excludes left by removed overrides".

## Acceptance criteria
<!-- owner: plan · create/amend-via-gate; review reads, never reinterprets.
     Every item opens with its positional label — `ACn:` — the item's
     position counted top-to-bottom, the number Coverage cites; an
     insertion, removal, or reorder renumbers the labels and the Coverage
     lines together.
     Driving RR set → its Binding criteria appear VERBATIM here (binding-
     criteria check), each ingested as a numbered criterion carrying its tag
     — `- [ ] ACn (BCm): <verbatim>` — with its own Coverage line, since
     coverage-complete counts AC checkboxes positionally (M107); departures:
     a "Deviations from RR<NN>" table ends this section. -->

- [ ] AC1: The ledger holds one line for each of the 464 new plugins, naming each category that `categories` gives it under the base commit's `src/site/categories.ts` and a mark of right or wrong for each. The marks follow the rule in `cairn/references/category-ledger.md`, section "How the read marks an assignment", and for an `include` entry or `other` the rule of its section "The M086 read of plugins with no category". A script in the ledger takes the data file and a `categories.ts` path, and with the base commit's file it prints the same 464 ids and categories that the lines hold.
- [ ] AC2: The ledger states two rates, each as wrong counted assignments over counted assignments: the tuning group under the base commit's rules, and the held-out group under the rules of a named commit. That commit holds every rule change from the tuning-group read and comes before the commit that adds the first held-out mark. The ledger holds that commit's `categories.ts` hash and the pull request number, and a line with marks for each held-out plugin under that commit, and the rate counts those lines. The ledger states that the group holds only plugins that no earlier read names. If the held-out rate is over 1 in 10, the ledger says so, and the milestone stops for the user's decision before the merge question.
- [ ] AC3: `categories` gives no `notes` for a text with "Note:", no `organization` for "easy to read" or "two-column layout", no `appearance` for "magnifying glass", no `translation` for "import translator", and no `rankings` for 期刊缩写. It still gives `notes` for "a child note", `organization` for "mark it To Read" and "a sortable column", `appearance` for "a liquid glass look", `translation` for "Paper Translator", and `rankings` for 期刊等级.
- [ ] AC4: Each category that a line of the ledger marks wrong is gone from that plugin when the ledger's script runs on the data file with the branch's `categories.ts`.
- [ ] AC5: When the compare script of `cairn/references/category-ledger.md` runs on the data file with the base commit's and the branch's `categories.ts`, the ledger holds each gain it lists with the mark right, and each loss it lists as a category that the read marks wrong or as an `other` that a new category replaces. The ledger states that the read does not measure every missing category.
- [ ] AC6: On a built plugin page, each link with `data-category` keeps the category's name as its visible text, and its `aria-label` is `<name>: plugins in this category`.
- [ ] AC7: The `CHANGELOG.md` `## Unreleased` section states that the categories of plugins added since 2026-10-31 were read and the rules changed, and that the links have the new label. `cairn/DESIGN.md`'s plugin page lines name the label, `cairn/references/INDEX.md` lists the ledger, and `pnpm test` and `pnpm check` pass.

## Coverage
<!-- owner: plan · create/amend-via-gate; each acceptance criterion → the
     task(s) satisfying it, by positional number (AC/Task counted
     top-to-bottom). Review reads to fence evidence — tracking-rules "AC fencing". -->

- AC1 → T1, T2, T4
- AC2 → T2, T4
- AC3 → T3
- AC4 → T5
- AC5 → T5
- AC6 → T6
- AC7 → T7

## Tasks
<!-- owner: plan (create) / implement (check-off, minor edits); substantive
     change is amend-via-gate. Every item opens with its positional label —
     `Tn:` — the item's position counted top-to-bottom, the number Coverage
     cites; an insertion, removal, or reorder renumbers the labels and the
     Coverage lines together. -->

- [x] T1: Start the ledger with its provenance, the terms, the base commit, and the listing script. Compute the held-out ids by the rule and keep them in a scratch file, and do not read those plugins' ids, texts, or categories until T4.
- [x] T2: Read the tuning group under the base rules. Mark each category, search `cairn/references/category-ledger.md` for like plugins before marking one wrong (M089 lesson), and note each clearly missing category. State the tuning-group rate.
- [x] T3: Change the patterns in `src/site/categories.ts` for words that can go wrong again, starting with the six phrases of AC3, and add `include` and `exclude` entries for single plugins. Add the AC3 tests to `test/categories.test.ts`, seen red on the base rules first, and add one test for each other pattern narrowed. Stop changing rules, and commit: this is the named commit of AC2.
- [x] T4: Read the held-out group under the named commit and under the base rules, and write its lines. State the held-out rate, the `categories.ts` hash, and the group's limit. If the rate is over 1 in 10, stop with a close block that names the rate and D-059. Write the base-rule marks of these plugins as AC1's lines.
- [x] T5: Fix the held-out plugins' wrong marks with `include` or `exclude` entries, since their rate is now recorded. Run the listing script with the branch's file, then the compare script over all 736 records, and read and mark each gain and loss in the ledger, the older 272 plugins included.
- [x] T6: Add the `aria-label` to the link in `site/src/pages/plugins/[id]/index.astro:111`, and update the tests near `test/site.test.ts:444` and `:480`, which assume `data-category` is the last attribute. Look at one built plugin page in the browser pane.
- [x] T7: Write the `CHANGELOG.md` entry, the `cairn/DESIGN.md` lines, the `cairn/references/INDEX.md` line, and the open question in `cairn/references/category-ledger.md` that this read answers. Run `pnpm test` and `pnpm check`.

## Work log
<!-- owner: any skill · append-only; one line per entry; absolute dates.
     EXEMPT from the 150-line cap (D-046): history under D-045, never edited,
     so the cap must never demand a trim here. Wrapped entries get a WARN.
     The rejected-alternative record (/milestone-plan step 4) takes this form:
     `- YYYY-MM-DD: plan gate chose <approach> over <alternative> because
     <reason>; falsified by <evidence class>.` — one per approach choice the
     gate actually weighed, none where it weighed none, and it is the record
     `/milestone-review`'s thrash trigger (b) reads. It lives here rather than
     below so an instantiated file inherits no placeholder to delete.
     A milestone of a feature series also carries the plan's
     `feature series: M<a> -> M<b>[ -> …]` line (tracking-rules "Feature series"). -->

- 2026-11-03: created by /milestone-plan from the candidate row "Check categories on new plugins".
- 2026-11-03: tier check: milestone — it changes running category rules and a plugin page, takes more than one sitting, and holds a design choice.
- 2026-11-03: idea vet: gap, a read on tuned data scores near zero by construction and says nothing about the next plugin, reading taken is a held-out group, and the question set chose stop-if-high; gap, "tune" could mean removals only or additions too, and the question set chose adding when the read sees a miss; gap, a one-time read decays as the bot adds plugins, reading taken is one pinned data file with the row kept for later plugins; gap, five of the row's six phrases occur in no record of the data file, reading taken is to fix them since the row names them; no flaw.
- 2026-11-03: lessons used: 2026-11-03 (M089), 2026-11-02 (M082, `pnpm test` exit code), 2026-10-25 (M001), 2026-10-27 (M027), 2026-10-31 (M066, merge deploys nothing), 2026-10-29 (M054, built page read).
- 2026-11-03: collision: absorbs the candidate row; extends done M066 and M086; annotates D-037 through D-059; D-057 stands, and the plan names no change to it; "Drop excludes left by removed overrides" and "Publish plugin categories in the data" stay parked with a cross-reference in Out.
- 2026-11-03: inbox sweep: no open issues; 5 open bot pull requests (#818 to #822), none overlapping, since they add plugins after the pinned data file.
- 2026-11-03: criteria audit (full, fresh Opus reader) returned 13 notes, all applied or answered: M086's rule named for `include` and `other` marks; the held-out rate given its own lines; the named commit must hold all tuning; hash and PR number recorded since merges squash; the group's limit stated; AC3 bound to `categories`, with near-neighbor right uses and the literal "import translator"; the script takes a file path; AC5 reworded so that a loss of a wrong category passes; AC6's label an exact string and the test moved to tasks; the link work added to the goal; AC7 no note.
- 2026-11-03: audit check by the plan: the audit's right-use probes "glass theme" and 期刊分区 also match `\bthemes?\b` and 分区, so AC3 uses "a liquid glass look" and 期刊等级, which test the narrowed word alone.
- 2026-11-03: plan gate chose a held-out group of 100 over tuning on all 464 because a read of tuned data cannot fail D-037's test; falsified by a held-out rate that a later read of new plugins does not reproduce.
- 2026-11-03: plan gate chose pattern changes first, with id lists for single plugins, over only id lists because id lists do nothing for the next plugin; falsified by pattern changes that lose right categories in the compare script at a rate near what they fix.
- 2026-11-03: plan gate chose an `aria-label` over longer visible link text because the links sit in one short line and the home page's links already use this form (`site/src/pages/index.astro:215`); falsified by a user report that the label misleads.
- 2026-11-03: plan kept the one-attribute link fix in this milestone over a milestone of its own, despite the independent-task split test, since the row holds both and a PR for one attribute costs a full review.
- 2026-11-03: plan-time sample: the first 70 new plugins by SHA-1 of the id, read roughly, about 1 in 8 assignments wrong; a rough read, not a ledger figure, and those 70 stay in the tuning group.
- 2026-11-03: remainder ledger: read of 464 and tuning → this milestone; six phrases → this milestone; link label → this milestone; plugins after the data file → the row, which stays. The row's text is narrowed at review hygiene.
- 2026-11-03: deploy: a merge deploys nothing; the review close block offers `gh workflow run build.yml --ref main`, and the daily build at 06:17 UTC deploys otherwise.
- 2026-11-03: implement: base commit b941616b; the rule gives 100 held-out and 364 tuning plugins; one held-out id was on a line of the plan's phrase search, and no rule change may rest on it.
- 2026-11-03: T1 done: ledger started with the group rule and listing script; minor amendment, the held-out ids reach the ledger at T4, so the agent that tunes does not read them first.
- 2026-11-03: T2 done: tuning group 63 wrong of 503 counted assignments under the base rules, 32 missing marks accepted.
- 2026-11-03: T3 done at 87a6185b: patterns narrowed and widened, id lists added, 24 tests red on the base rules; the compare over non-held records gives 34 gains and 63 losses, and every loss is a wrong mark.
- 2026-11-03: T3 approach: a guard on any text naming MCP lost 3 right `ai` assignments, so the guard names only "MCP server" and "MCP bridge"; a wider net is the falsifier the plan named.
- 2026-11-03: T4 result: a fresh Opus reader marked the held-out group; 20 wrong of 148 under 87a6185b (13.5%), 20 wrong of 146 under the base rules (13.7%); over 1 in 10, so the stop of AC2 and D-059 applies; the agent changed no held-out mark.
- 2026-11-03: T6 label committed at 4c64c658 ahead of T4 and T5, since it touches no rule; the browser look waits.
- 2026-11-03: stop: the user, at the chip this stop posed in place of T4's close block since the choice was theirs, kept word rules and finished the milestone, recorded as D-060, with a new row "Tighten the ai and attachments rules"; the M088 terminal row left the ROADMAP to keep it under its line cap.
- 2026-11-03: T5 done: 22 list edits for the held-out plugins; the compare over 736 records gives 83 losses, each a wrong mark, and 51 gains, each read right; no older plugin loses a category.
- 2026-11-03: T6 done: the browser pane shows the three labeled links on `paper-loom@local.research` and no console error; the build read the pinned data.
- 2026-11-03: T7 done: CHANGELOG, DESIGN, INDEX, and the open question in `category-ledger.md` updated; the writing hook's other hits in `CHANGELOG.md` and `category-ledger.md` predate this branch and stay.
- 2026-11-03: claim audit: 43 claims read, 6 corrected — CHANGELOG.md, src/site/categories.ts, test/categories.test.ts
- 2026-11-03: delegation: four fresh Opus readers mark the tuning group in batches of 91, so the rule changes are not tuned by the readers of the held-out group; the agent settles every wrong and missing mark.

## Decisions
<!-- owner: implement / review · append-only; milestone-local; promote
     cross-cutting ones to cairn/DECISIONS.md.
     EXEMPT from the 150-line cap (D-074) because D-045 makes it history like the work log — dated dispositions, never edited — so the cap must never demand a trim here either.
     Entries carry their rationale; the counterweight `decisions format`
     advisory watches for pasted output, not for entry length (D-075). -->

## Review
<!-- owner: review · exclusive; evidence per criterion, consistency-gate
     results, review findings + triage. EXEMPT from the 150-line cap (M55),
     as are the work log (D-046) and the decisions section (D-074); evidence
     never scrambles plan-owned content. -->
