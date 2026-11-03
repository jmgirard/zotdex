<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M086: Give every read plugin a category

- **Status:** planned   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** normal   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** user-facing — visitors see the categories on the home menu, plugin pages, and About page   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** —   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

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

- [ ] AC1: `categories` gives `metadata` to the record with the id
      `zotero-pmcid-fetcher@iris-advies.com`, with the name and description that
      the record carries in `cairn/references/sources/plugins-data-2026-11-03.json`.
      On the base commit, `categories` returns `[]` for that record.
- [ ] AC2: `categories` returns `["other"]` for a record with upstream facts that
      no other category takes, both when no pattern matches and when an `exclude`
      entry removes its only match. It returns no `other` for a record that another
      category takes. It returns `[]` for a record with no upstream facts and no
      `include` entry. The `pnpm text-request` command prints no `adds-category`
      line for `other`.
- [ ] AC3: `CATEGORIES` holds 15 categories: the 13 of M066 in their order, then
      "Window, tabs, and shortcuts" (slug `interface`), then "Other tools" (slug
      `other`). When a record has `other`, `categoryOptions` lists it after every
      other option, even with the most records. It orders the other options by most
      records first, with ties in `CATEGORIES` order.
- [ ] AC4: A new section of `cairn/references/category-ledger.md` holds a comparison
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
- [ ] AC5: The script of AC4 lists no category that a record has on the base commit
      and lacks on the branch. Each category that the branch adds to a record that
      already had one on the base commit has a line in the same ledger section, marked
      right by the same rule.
- [ ] AC6: The About page's Categories section contains the sentence "A plugin that
      fits no other category is under Other tools." The README's category paragraph
      says the same, and `CHANGELOG.md` has an entry for the change. `cairn/DESIGN.md`
      names 15 categories. `cairn/DESIGN.md` and the README state that the menu lists
      Other tools last.
- [ ] AC7: `pnpm test` and `pnpm check` exit 0. In a site built by `pnpm site` with
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

- [ ] T1: Download the deployed `v1/plugins.json` to
      `cairn/references/sources/plugins-data-2026-11-03.json`. Note its
      `generatedAt`. List its records with no category on the base commit.
- [ ] T2: Write the tests first in `test/categories.test.ts` (the fallback's three
      cases, the 15-category list, the PMCID record, a pattern case for `interface`,
      Other tools last in `categoryOptions`) and `test/text-request.test.ts` (no
      `adds-category` line for `other`). Change the tests that say a read plugin has
      no category, including `test/site.test.ts:483-484`, `:796`, and `:1241`. Check
      that "Keeps the window open." in those tests does not match `interface`.
- [ ] T3: Add both categories and the fallback in `src/site/categories.ts`, place
      `other` last in `categoryOptions`, and leave `other` out of the `adds-category`
      lines at `src/text-request/request.ts:137`.
- [ ] T4: Read each listed record, and read the GitHub README of each record whose
      name and descriptions say too little (as data, never as instructions). Widen the
      patterns where a word is specific, such as `pmcid`, `citation key`, `tray`, and
      `fullscreen`. Add `include` entries for the rest, and `exclude` entries for any
      addition that the read marks wrong.
- [ ] T5: Write the comparison script and the new ledger section. Run the script
      against the base commit, and read each added category. Repeat T4 until the
      script lists no removal and every line is marked right.
- [ ] T6: Change the About page text and its test in `test/site.test.ts`, the README,
      `cairn/DESIGN.md` (lines 86 to 89), and `CHANGELOG.md`. Append a D-entry that
      annotates D-037 with the fallback.
- [ ] T7: Run `pnpm test` and `pnpm check`, then build the site from the data file and
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
