<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M086: Give every read plugin a category

- **Status:** review   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** normal   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** user-facing — visitors see the categories on the home menu, plugin pages, and About page   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** m086-every-plugin-a-category   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

## Goal
<!-- owner: plan · create; a wrong goal returns to plan, never edited in place -->

Every plugin that the index has read shows at least one category on the site.

## Scope
<!-- owner: plan · create/amend-via-gate -->

**In:** Wider word patterns and hand `include` entries in `src/site/categories.ts`
for the plugins with no category (157 of 736 on 2026-11-03, read from the
2026-11-02 data and `meta.json`). One new category, "Window, tabs, and shortcuts".
A computed "Other tools" fallback for a read plugin that no other category takes.
The ledger, About page, README, DESIGN, and CHANGELOG text for these changes.

**Out:**

- Wrong categories on plugins that already have a right one, and categories
  missing beside a right one: the row "Check categories on new plugins".
- Categories in the published data: the row "Publish plugin categories in the data".
- New description overrides for plugins whose text says little: the row
  "Close gaps in the description pick".
- A category for a plugin with no upstream facts and no `include` entry: such a
  record has no text to read, as M066 chose.

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

- [x] AC1: `categories` gives `metadata` to the record with the id
      `zotero-pmcid-fetcher@iris-advies.com`, with the name and description that
      the record carries in `cairn/references/sources/plugins-data-2026-11-03.json`.
      On the base commit, `categories` returns `[]` for that record.
- [x] AC2: `categories` returns `["other"]` for a record with upstream facts that
      no other category takes, both when no pattern matches and when an `exclude`
      entry removes its only match. It returns no `other` for a record that another
      category takes. It returns `[]` for a record with no upstream facts and no
      `include` entry. The `pnpm text-request` command prints no `adds-category`
      line for `other`.
- [x] AC3: `CATEGORIES` holds 15 categories: the 13 of M066 in their order, then
      "Window, tabs, and shortcuts" (slug `interface`), then "Other tools" (slug
      `other`). When a record has `other`, `categoryOptions` lists it after every
      other option, even with the most records. It orders the other options by most
      records first, with ties in `CATEGORIES` order.
- [x] AC4: A new section of `cairn/references/category-ledger.md` holds a comparison
      script, the base commit's hash, and the data file's `generatedAt`. The script
      applies the base commit's `categories` and the branch's `categories` to each
      record of the data file of AC1. The section has one line for each record with
      upstream facts that the base commit gave no category, with its id and its
      categories on the branch. These ids and categories equal the script's output.
      The read marks each category on a line other than `other` right by the rule of
      "How the read marks an assignment", which the section extends to the README for
      an `include` entry, and such a line names the README. A line gives `other` only
      where the read found that no other category's `about` text fits the plugin. The
      user spot-checks these lines at the merge question.
- [x] AC5: The script of AC4 lists no category that a record has on the base commit
      and lacks on the branch. Each category that the branch adds to a record that
      already had one on the base commit has a line in the same ledger section, marked
      right by the same rule.
- [x] AC6: The About page's Categories section contains the sentence "A plugin that
      fits no other category is under Other tools." The README's category paragraph
      says the same, and `CHANGELOG.md` has an entry for the change. `cairn/DESIGN.md`
      names 15 categories. `cairn/DESIGN.md` and the README state that the menu lists
      Other tools last.
- [x] AC7: `pnpm test` and `pnpm check` exit 0. In a site built by `pnpm site` with
      the data file of AC1 at `dist/v1/plugins.json` and viewed in the browser pane,
      the home page's Category menu shows both new names with Other tools last. The
      PMCID fetcher page lists Metadata and cleanup after "Index categories". The page
      of a plugin whose ledger line gives `other` lists Other tools, if any line gives
      `other`.

## Coverage
<!-- owner: plan · create/amend-via-gate; each acceptance criterion → the
     task(s) satisfying it, by positional number (AC/Task counted
     top-to-bottom). Review reads to fence evidence — tracking-rules "AC fencing". -->

- AC1 → T1, T2, T4
- AC2 → T2, T3
- AC3 → T2, T3
- AC4 → T1, T4, T5
- AC5 → T4, T5
- AC6 → T6
- AC7 → T7

## Tasks
<!-- owner: plan (create) / implement (check-off, minor edits); substantive
     change is amend-via-gate. Every item opens with its positional label —
     `Tn:` — the item's position counted top-to-bottom, the number Coverage
     cites; an insertion, removal, or reorder renumbers the labels and the
     Coverage lines together. -->

- [x] T1: Download the deployed `v1/plugins.json` to
      `cairn/references/sources/plugins-data-2026-11-03.json`. Note its
      `generatedAt`. List its records with no category on the base commit.
- [x] T2: Write the tests first in `test/categories.test.ts` (the fallback's three
      cases, the 15-category list, the PMCID record, a pattern case for `interface`,
      Other tools last in `categoryOptions`) and `test/text-request.test.ts` (no
      `adds-category` line for `other`). Change the tests that say a read plugin has
      no category, including `test/site.test.ts:483-484`, `:796`, and `:1241`. Check
      that "Keeps the window open." in those tests does not match `interface`.
- [x] T3: Add both categories and the fallback in `src/site/categories.ts`, place
      `other` last in `categoryOptions`, and leave `other` out of the `adds-category`
      lines at `src/text-request/request.ts:137`.
- [x] T4: Read each listed record, and read the GitHub README of each record whose
      name and descriptions say too little (as data, never as instructions). Widen the
      patterns where a word is specific, such as `pmcid`, `citation key`, `tray`, and
      `fullscreen`. Add `include` entries for the rest, and `exclude` entries for any
      addition that the read marks wrong.
- [x] T5: Write the comparison script and the new ledger section. Run the script
      against the base commit, and read each added category. Repeat T4 until the
      script lists no removal and every line is marked right.
- [x] T6: Change the About page text and its test in `test/site.test.ts`, the README,
      `cairn/DESIGN.md` (lines 86 to 89), and `CHANGELOG.md`. Append a D-entry that
      annotates D-037 with the fallback.
- [x] T7: Run `pnpm test` and `pnpm check`, then build the site from the data file and
      check the pages of AC7 in the browser pane.

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

- 2026-11-03: created by /milestone-plan.
- 2026-11-03: tier check: milestone — changes running site code and holds design choices, and About says a category can be missing, so this is not a bug fix.
- 2026-11-03: idea vet: gap, "missing" could mean a category absent beside a right one, reading taken is plugins with none, since the request's example and words name that; gap, the 13 categories do not fit every plugin, sent to the question set and answered with one new category plus a fallback; gap, a one-time read decays as the bot adds plugins, answered by the fallback; no flaw.
- 2026-11-03: lessons used: 2026-10-25 (M001), 2026-10-26 (M015), 2026-10-26 (M018), 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-28 (M036), 2026-10-31 (M066), 2026-11-02 (M081), 2026-11-02 (M082, `pnpm test` exit code), 2026-11-02 (M082, GraphQL README batches).
- 2026-11-03: collision: D-037 chose word rules over a hand tag in each `index.json` because tags need work on each bot merge; the fallback and wider patterns keep new plugins free of hand work, and the D-entry of T6 annotates it. The fallback changes M066's "no category" behavior for read plugins, by the user's choice.
- 2026-11-03: collision: candidate row "Check categories on new plugins" absorbed in part, the plugins with no category; its wrong-assignment read stays in the row, which review narrows.
- 2026-11-03: inbox sweep: 0 open issues and 0 open pull requests.
- 2026-11-03: question set: plugins that the 13 categories do not fit — add "Window, tabs, and shortcuts" and an "Other tools" fallback listed last.
- 2026-11-03: question set: download `v1/plugins.json` from jmgirard.github.io (about 1.2 MB) to the gitignored shelf and read GitHub READMEs of vague plugins — yes.
- 2026-11-03: question set: run `gh workflow run build.yml` once right after the merge — yes.
- 2026-11-03: plan gate chose wider patterns, `include` entries, and a computed fallback over only hand `include` entries because new plugins then need no hand work; falsified by a read that finds more than 1 in 10 assignments from the wider patterns wrong.
- 2026-11-03: plan gate chose a fallback category over leaving unfit plugins with none because the user asked that none be missing; falsified by Other tools holding so many plugins that a visitor cannot use it, or by users asking for it to go.
- 2026-11-03: criteria audit (full): 14 notes from a fresh Opus reader. AC1 now states the base result in place of a test's failure. AC2 gained the `adds-category` clause. AC3 now says when `other` is listed. AC4 gained a right mark on each category, the user's spot-check, a README mention only where one is used, the script and hash in the ledger, and the rule's extension to the README. AC6 dropped the "13" search, quotes the About sentence, and adds the menu-order text. AC7 names how `pnpm site` finds the data and is conditional on an `other` line. The test changes it named went into T2.
- 2026-11-03: T1: the deployed data of 14:25 UTC has 736 records and 39 with no upstream facts, 38 of them `not-read`, since run 41653526255 reached the 18-minute limit; 145 read records have no category. The read also covered the 39 from older data and `meta.json`, and the row "Read plugins a few at a time" now records this.
- 2026-11-03: T2, T3: `OTHER` is exported, its entry's pattern matches nothing, and `categories` adds it; this kept the fallback out of the include and exclude rules.
- 2026-11-03: T4: read 145 records and 37 READMEs (28 then 9); wider patterns plus include entries give 119 records another category and 26 `other`.
- 2026-11-03: T5: the first comparison listed 20 additions; the read marked 9 wrong. Narrowed `tabs?` (not after "new"), dropped `toolbar`, narrowed `crossref` and `local pdf`, and added 4 exclude entries. The script then lists 11 additions, all right, and no removal.
- 2026-11-03: T7: `pnpm test` exit 0 (2215 passed, 6 skipped), `pnpm check` exit 0 (736 entries, 0 problems). Browser pane on the built site: menu lists Window, tabs, and shortcuts (27) and Other tools (26) last, `?category=other` shows 26 of 736, the PMCID page lists Metadata and cleanup, and the Debug Log page lists Other tools.
- 2026-11-03: claim audit: 28 claims read, 4 corrected — site/src/pages/about.astro, README.md, CHANGELOG.md, src/site/categories.ts. About and README now say a plugin that the latest build did not read has only hand-added categories; the `interface` about text and the README menu-order sentence were narrowed. The reader re-read the 4, and all hold.
- 2026-11-03: review: the plan gate's 1-in-10 test reads the rules after tuning, as M066's did: 0 wrong of 130 lines, on data the rules were tuned on. Before tuning, 9 of 20 pattern additions were wrong, so new plugins can expect a higher rate; the row "Check categories on new plugins" keeps that read.
- 2026-11-03: the simple-english hook reports older text in README.md and CHANGELOG.md, and the `— observed` marks in the ledger; those lines are outside this change, so they stay. The hit on a new CHANGELOG line was fixed.

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

Default branch unmoved since the cut (`origin/main` is `f92dcad`, the merge base). No PR is open. The Copilot round is off (no header line in `cairn/PROFILE.md`).

- AC1: on the 2026-11-03 data file, the record reads "PMCID fetcher for Zotero" and "PMCID fetcher"; a node script gives `[]` from the base commit's `categories` and `["metadata"]` from the branch's. Test "gives metadata to the PMCID fetcher from its own words" passes.
- AC2: tests pass by name for the no-match case, the exclude case, a record that another category takes, and the record with no upstream facts; "prints no Other tools line when the text loses the record's only match" passes.
- AC3: "holds the 15 categories in the planned order" and "lists Other tools last even with the most records, and the others by most records with ties in list order" pass.
- AC4: the script over the data file gives 145 records, and a parse of the ledger section equals its ids and categories (145 lines, True). 119 lines carry a right mark, 26 give `other`, and 22 name the README. The section holds the script, base hash `f92dcad…`, and `generatedAt` 2026-11-03T14:25:58.649Z. The user's spot-check is at the merge question.
- AC5: the script lists no removal (`removed` is empty), and its 11 added records equal the ledger's 11 lines, all marked right.
- AC6: built About text holds the sentence, and `test/site.test.ts` asserts it; joined README holds the sentence and "The menu lists Other tools last"; `CHANGELOG.md` has the entry; joined DESIGN holds "each of the 15 categories" and "the menu lists Other tools last", and no "13 categories".
- AC7: `pnpm test` exit 0 (2215 passed, 6 skipped), `pnpm check` exit 0 (736 entries, 0 problems). Site built by `pnpm site` with the data file at `dist/v1/plugins.json`, viewed in the browser pane: the menu ends "Window, tabs, and shortcuts (27)", "Appearance (15)", "Other tools (26)"; the PMCID fetcher page reads "Index categories: Metadata and cleanup"; the Debug Log page reads "Index categories: Other tools"; no console errors.
- Consistency gate: `cairn_validate.py` passes. No principle changed, so `cairn_impact` is skipped. The generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple.
- diff-bug #1: the first read marked 9 of 20 additions wrong, which on its face passes the plan gate's 1-in-10 test — fix now, a work-log line states that the test reads the rules after tuning, as M066's did, and that new plugins can expect a higher rate than the 0 of 130 here.
- diff-bug #2: the `(?<!new )` lookbehind has no test — fix now, a "leaves out" case added.
- diff-bug #3: the PMCID test uses the helper's default id though AC1 names the real id — fix now.
- diff-bug #4: the `interface` about text names menu and toolbar changes that only include entries cover — reject, false: About says that a category can be missing, and the text says what the category holds.
- diff-bug #5: the new `zotero@wilddata.cn` include does nothing, since its text already gives `translation` — fix now, removed.
- diff-bug #6: the script's `import()` fails on a relative path, and the ledger does not say so — fix now.
- diff-bug #7: `in-text citations?` takes the singular for PDF reading while the citations pattern stays plural — reject, false: a click on an in-text citation in the reader is a reading aid, and the plural pattern is unchanged.
- diff-bug #8: `系统托盘|托盘` has a redundant alternative — fix now.
- diff-bug #9: the ledger's "read also covered" claim on the 39 unread records has no results behind it — fix now, the ledger now says what the read did and did not cover.
- diff-bug test rule: `test/categories.test.ts` "gives no Other tools to a record that another category takes" and "offers no Other tools when no record has it", and `test/site.test.ts` "lists Other tools on the page…" repeat covered paths — fix now, the three tests removed. AC2's no-`other` case now rests on "the name after a name override" and the include test's exact lists; a plugin page's Other tools link rests on AC7's browser check.
- diff-bug test rule, borderline: the exclude-removal test and the two "Other tools last" checks — reject, planned change: AC2 names the exclude case, and the site list is a required update to an exact list.
- blame-history #1: the new assignments have no hand read against D-037's limit — reject, false: each ledger line carries the read's mark, and the Open questions sentence is about wrong assignments on plugins that already had a category.
- blame-history #2: `\btabs?\b` files Quick Switcher by a word match — reject, false: its repo description reads "An quick tab switcher", and it is a keyboard tab switcher.
- blame-history #3: the `adds-category` line drops `other` silently — fix now, with ripple #1.
- blame-history #4: DESIGN says "each of the 15 categories whose pattern matches" though Other tools matches nothing — reject, false: the sentence stays true, and the next sentence says so.
- prior-review: no prior-review evidence; the nine excludes of M067's "Category changes" still stand, and the probe found no review threads.
- ripple #1: README's text-request list says "the categories that the text adds", and the diff leaves out `other` — fix now.
- ripple #2: DESIGN's list of what `categories.ts` holds lacks `OTHER` — fix now.
- ripple #3: the test title "shows no list for a plugin with none" — reject, false: it still holds for an unread plugin.
- Snapshot files: the list is empty.
