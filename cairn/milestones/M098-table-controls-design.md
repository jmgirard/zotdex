<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M098: Give the table controls one design

- **Status:** in-progress   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** normal   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** user-facing — site visitors use these controls on the home page   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** m098-table-controls-design   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

## Goal
<!-- owner: plan · create; a wrong goal returns to plan, never edited in place -->

The home page's search box, filter menus, version buttons, sort menu, count, and pager share one look and one card with the table, with their function unchanged.

## Scope
<!-- owner: plan · create/amend-via-gate -->

**In:** The markup and CSS of the controls in `site/src/pages/index.astro` and `site/src/layouts/Base.astro`: one card that holds the controls, the table, and the pager; one size, edge, and label style; one set of hover, pressed, and focus states; the arrangement at phone and desktop widths. The tests and docs that state these things.

**Out:**
- New function, such as numbered pages, a clear-filters button, a page-size choice, or a new filter: no one asked for it, so it has no row. A later plan can add it.
- The table's columns and rows, the legend, the plugin pages, and the top bar: unchanged.
- The toolbar's paint shift, and the menu arrow unseen in Safari and Firefox: `cairn/DESIGN.md` Known issues, items (4) and (5) of the site pages entry.
- An automated browser test: the row "Test the home page script in a browser".

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

- [ ] AC1: One look. In a build from the deployed data, the search box, the category, language, and sort menus, the version button group, and the Previous and Next buttons each have a computed height of 32 px, a corner radius of 6 px (`--radius-m`), and a top border color equal to `--faint`. Those controls, and each button inside the version group, have a font size of 14 px (`--text-m`). The visible labels "Category", "Menus and settings in", "Declares Zotero", and "Sort by" each have the computed font size, weight, and color of the "Plugin" header cell (12 px, 600, `--muted`). The count and "Page p of P" have a font size of 13 px (`--text-s`). A browser-pane read of these computed values on each named element, at 375 and 1200 px wide in the light and dark schemes, shows this.
- [ ] AC2: One set of states. In a browser-pane read of a build from the deployed data, at 1200 px in each scheme: a pointer over the search box, a menu, an unpressed version button, or a Previous or Next button that is not at its end gives that control the `--hover` background, and a menu keeps its arrow. A button at its end keeps the `--surface` background under the pointer. The pressed version button has the `--hover` background, weight 600, `--text` color, and a 2 px `--accent` bar on its bottom edge. Keyboard focus on each of these controls draws a 2 px `--link` outline. The `--accent` bar has at least 3:1 contrast on `--hover` in both schemes. In `site/src/layouts/Base.astro`, the pressed button keeps its 3 px `ButtonText` border and the end button its `GrayText` color and border color under forced colors, and each of those rules comes after any rule of equal specificity that sets the same property.
- [ ] AC3: One card. At 1200 px wide in a build from the deployed data, one element with the card's border and background holds, from top to bottom: a row with the search box, the category menu, the language menu, and the version buttons, with each visible label above its control and all four controls sharing one top edge within 1 px; a row with the count at its left and "Sort by" and its menu at its right; the table; and the pager, with Previous's left edge and Next's right edge at the card's inner edges within 1 px and "Page p of P" between them. `.table-card` has no border of its own. Each menu is as wide as on a main build from the same data, so a closed menu shows its longest option whole (304 and 188 px, measured 2026-11-05). The distance from the bottom of `.hero` to the top of the table's `thead` is at most 145 px (105 px on main, measured 2026-11-05). A browser-pane read of each element's bounding box shows this.
- [ ] AC4: Narrow widths. In a build from the deployed data, at each of 320, 375, 560, 760, and 1024 px wide, a browser-pane read gives the page `scrollWidth` equal to `clientWidth`, each control's bounding box lies inside the card's, and `.table-card` has computed `overflow-x: auto`. At 375 px the distance from the bottom of `.hero` to the top of the table's `thead` is at most 250 px (288 px on main, measured 2026-11-05). Screenshots at 320 and 375 px, and at 320 px with a search that matches nothing, show no label, button, or count word broken inside a word.
- [ ] AC5: Same function. `git diff main -- src/site/home-filter.ts` changes only comment lines. Each control and the count keep every attribute they have on main except `class` and `hidden`, and their label words and option lists, and the pager stays a `nav` with its `aria-label`. In the built HTML the classic pre-paint script comes before `<tbody>`. In the browser pane with the deployed data, using each control once changes the table, the count, and the address as on main, Previous and Next move a page and Back returns, and Previous or Next scrolls the element that holds the table, not the controls row, to the top of the view.
- [ ] AC6: No script. In a same-origin iframe with `sandbox="allow-same-origin"`, which runs no script, the home page shows every row in the card, and the bounding boxes of the search box, the menus, the version buttons, the count, the pager, and the two control rows that hold them are all empty.
- [ ] AC7: Docs and checks. No sentence in README.md or `cairn/DESIGN.md` places the count, the sort menu, or the pager elsewhere than AC3 does, by a search of both files for at least "beside", "above", "below the table", and "toolbar", with line breaks joined. CHANGELOG.md's `## Unreleased` has one entry for the new look. `pnpm test` and `pnpm check` pass.

## Coverage
<!-- owner: plan · create/amend-via-gate; each acceptance criterion → the
     task(s) satisfying it, by positional number (AC/Task counted
     top-to-bottom). Review reads to fence evidence — tracking-rules "AC fencing". -->

- AC1 → T2, T6
- AC2 → T3, T5, T6
- AC3 → T1, T2, T6
- AC4 → T4, T6
- AC5 → T1, T5, T6
- AC6 → T1, T2, T6
- AC7 → T5, T7

## Tasks
<!-- owner: plan (create) / implement (check-off, minor edits); substantive
     change is amend-via-gate. Every item opens with its positional label —
     `Tn:` — the item's position counted top-to-bottom, the number Coverage
     cites; an insertion, removal, or reorder renumbers the labels and the
     Coverage lines together. -->

- [x] T1: Change the markup in `site/src/pages/index.astro`: an outer card holds two control rows that are hidden until the script runs, the existing `.table-card` scroller, and the pager. The classic pre-paint script stays before the table. Keep each attribute and label word. Previous and Next keep scrolling `.table-card`. The script unhides the two rows, and Base.astro's hide rule covers them.
- [x] T2: In `site/src/layouts/Base.astro`, write one rule for the controls' sizes and one for the labels, then the card and the rows. Search takes the free width, and the menus and version group keep their natural width at desktop. Replace `.toolbar p`, which cancels `.filter-status`'s `margin-left: auto`, with a margin reset on the controls. Drop that auto margin, and put one on `.sort-menu`.
- [x] T3: Add the hover, pressed, and focus states. Write hover on a menu with `background-color`, since the arrow is a `background-image`. Keep the forced-colors rules after the rules they override.
- [x] T4: Fix the arrangement at 320 to 1024 px: search on its own row at the middle widths, and at 560 px or less the two menus side by side and the version buttons on their own row at full width.
- [x] T5: Update the markup and CSS expectations in `test/site.test.ts`, keeping every behavior expectation of the `homeScript` tests and the theme button's hide rule. Add the `--accent` on `--hover` pair to the color test, and a test of the pre-paint script's place before `<tbody>`.
- [x] T6: Run the browser-pane reads of AC1 to AC6 on a build from the deployed data, in both schemes where the criterion says so.
- [x] T7: Update README.md, `cairn/DESIGN.md`, the stale comments in `src/site/home-filter.ts`, and CHANGELOG.md.

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

- 2026-11-05: created by /milestone-plan.
- 2026-11-05: tier check: milestone — a change to running code that needs a design decision and is not a bug.
- 2026-11-05: idea vet: no flaw. gap: whether "cohesive design" also means new function; reading taken: look and arrangement only, function unchanged. gap: which look; the user chose by mockup at the question set.
- 2026-11-05: lessons used: 2026-10-25 (M001), 2026-10-26 (M015), 2026-10-26 (M018), 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-28 (M036), 2026-10-29 (M048), 2026-10-29 (M054), 2026-10-30 (M063), 2026-10-31 (M066), 2026-11-02 (M079), 2026-11-02 (M082), 2026-11-05 (M097).
- 2026-11-05: collision check: no standing rejection and no candidate row covers this. It extends done M044, M053, M058, M063, and M097, and keeps D-026 (each page reads in full without JavaScript) and D-065 (Stars stays the default). The row "Test the home page script in a browser" stays parked and separate.
- 2026-11-05: inbox sweep: 0 open issues; 9 open bot pull requests, none overlapping.
- 2026-11-05: criteria audit (full): 16 findings, all taken. AC1 now reads the version group and its buttons apart and names the "Plugin" cell, and adds the count's and page status's type. AC1, AC2, and AC4 name the deployed data, since a fixture build has no pager. AC2 adds the menu arrow and the forced-colors order. AC3 puts labels above controls, keeps the menus' natural width, and bars a second card border. AC4 adds `overflow-x` and 320 px with the no-match text. AC5 keeps every attribute and the pre-paint script's place, allows comment-only changes to `home-filter.ts`, and narrows the README sweep to using each control. AC7 widens the search. T2 now moves the auto margin to `.sort-menu`. The reader's 248 px estimate for 375 px was tested against the mockup, which measured 239 px from `.hero`; the height caps were re-based on `.hero` so a label line above the row counts.
- 2026-11-05: plan gate chose one card over an open row above the card because controls, count, table, and pager then read as one object, at 8 px more height on desktop and one more wrapper; falsified by visitors missing the controls or by the card's bands reading as clutter at the merge look.
- 2026-11-05: plan gate chose one card over keeping today's places with matching styles because the two uneven rows are part of what the user asked to fix; falsified by the same evidence.
- 2026-11-05: plan gate chose a thin `--accent` bar for the pressed button over today's solid fill because it ties to the top bar's square and is less heavy; falsified by visitors reading the red as an error.
- 2026-11-05: question set: when the new look goes live after the merge — run the build workflow at once with `gh workflow run build.yml --ref main`, up to 30 minutes.
- 2026-11-05: agent decisions: control text at `--text-m`, since lowering the search box and menus to 13 px loses legibility; label style copied from the table's header cells; existing label words kept, as M053 kept them; at 560 px or less the two menus sit side by side, so a long closed value can be cut there, and the open list shows it whole.
- 2026-11-05: T1 done: `.table-panel` holds `.controls` and `.results`, each hidden in the HTML, then `.table-card` and the pager. Controls lose their own `hidden`, so the script's `closest("[hidden]")` calls unhide the rows with no script change; the count keeps its own. Markup expectations updated with the markup. T5 keeps the rest of the test work.
- 2026-11-05: T2 done: one size rule covers the search box, the three menus, the version group, and the pager buttons; one label rule; `.table-panel`, `.controls`, `.results`, and the pager as a card foot. `.toolbar` and its `p` rule are gone, `.results .sort-menu` takes the auto margin, and `.table-panel` adds `overflow: hidden` so a row's hover fill stays inside the corners.
- 2026-11-05: T3 done: one hover rule with `background-color`, the pressed button's `--hover` fill and 2 px `--accent` inset bar, the pager buttons joined to the focus rule. The forced-colors blocks stay after these rules. The color test gains `--accent` on `--hover`.
- 2026-11-05: T4 done: search takes its own row at 1000 px or less, where the menus' natural widths would leave it under about 200 px (agent's choice of width); at 560 px or less the menus sit side by side and the version group fills its row. The rows' side padding became `--space-6`, the table cells' value, so their left edges line up at desktop; the 560 px cells keep `--space-3`, since the table is out of scope.
- 2026-11-05: T5 done: the markup and edge expectations changed with T1 and T2, the color pair with T3, and the pre-paint place test with T1; no `homeScript` expectation changed.
- 2026-11-05: T6 done on a build from the deployed data (736 plugins). Hover, pressed, focus, sizes, labels, order, and widths read as AC1 to AC4 state; the desktop distance is 133 px against the 145 cap and the 375 px distance 243 px against the 250 cap. The same scripted use of each control on this build and on main's gave the same count, rows, and address at every step. The no-script iframe shows 736 rows and no control. At 320 px the arrow space cut "All categories", so the two filter menus take `--space-12` right padding at 560 px or less; that change came after these reads, so review reads it fresh.
- 2026-11-05: T7 done: README, DESIGN (the count's place, the card, known issue 4), the two comments in `home-filter.ts`, and one CHANGELOG entry.
- 2026-11-05: T2 and the first test edits used a Python script rather than the Edit tool, against the rulebook's file-edit rule, so those changes did not reach the app's edited-files card; the branch diff holds them.
- 2026-11-05: claim audit: 60 claims read, 6 corrected — CHANGELOG.md, README.md, cairn/DESIGN.md, site/src/layouts/Base.astro, site/src/pages/index.astro; the one re-read corrected the pressed-fill wording once more, since "pale" held only in the light scheme.
- 2026-11-05: review return 1: at larger browser text the search box collapses above 1000 px (87 px wide at root 24 px and 1200 px, diff-bug #1), closed menu values are cut at 561 to about 880 px at the default text size (diff-bug #3), and the fix-now items in the Review section's pass 1 remain open.
- 2026-11-05: amendment routed: AC3 — "at the card's inner edges within 1 px" fails as written, since Previous and Next sit level with the rows' controls, 13 px in from the card's outer edges.

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

### Pass 1, 2026-11-05 (head 2d39ca3c; returned, so no box ticked)

Evidence on a build from the deployed data, 736 plugins:
- AC1: computed values as written at 375 and 1200 px in both schemes; no element differs.
- AC2: hover, pressed, and focus read as written in both schemes, and the menu keeps its arrow; `--accent` on `--hover` is in the color test. The pressed and end-button forced-colors rules come after their rules; another forced-colors rule does not (diff-bug #2).
- AC3: order, labels, one top edge at 208.5, menus 303.5 and 187.5 as on main, 133 px against the 145 cap. Previous and Next sit 13 px in from the card's outer edges, level with the search box and sort menu but not at "the card's inner edges", so the wording fails as written.
- AC4: all five widths pass; 243 px against the 250 cap; screenshots at 320 and 375 px and at 320 px with no match show no broken word.
- AC5: `home-filter.ts` diff is two comment lines; attributes, labels, options, and buttons equal main's; the same scripted use gives the same count, rows, and address at all 12 steps; Next puts `.table-card` at the top of the view.
- AC6: 736 of 736 rows show, all in the card; every named box is empty.
- AC7: `pnpm test` 2429 passed and 6 skipped; `pnpm check` 736 entries and 0 problems; `cairn_validate` passes.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: the search box collapses above 1000 px with larger browser text, to 87 px at root 24 px and 1200 px — fix now (floor return): the breakpoints take rem.
- diff-bug #2: the 560 px padding rule beats the forced-colors rule — fix now: that rule goes.
- diff-bug #3: closed menu values are cut at 561 to about 880 px, worse at 561 than at 560 — fix now (floor return): the version group takes its own row only below where all three fit.
- diff-bug #4: at larger text the menus cut even the default value — fix now: one column below 22.5rem.
- diff-bug #5: at root 32 px the version buttons are clipped with no way to reach them — fix now: the card stops hiding overflow, and the version group keeps its width.
- diff-bug #6: at root 32 px the card cuts the sort menu — fix now: same, and `.sort-menu` wraps again.
- diff-bug #7: the first-paint move grows to 124 px at 1200 px from 74 px on main, and falls to 234 px at 375 px from 257 px — known issue: The home page's rows of controls appear after first paint and move the table by 124 px at 1200 px wide and 234 px at 375 px on the data of 2026-11-05, against 74 px and 257 px before the card, which M060's pre-paint style misses. Accepted at the M098 gate
- diff-bug #8: the new pre-paint expectation repeats the test at `test/site.test.ts:1975` and passes with no script — fix now: removed.
- diff-bug #9: the `homeScript` stand-ins give each control its own wrapper, while the real ones share one — follow-up: new parked row "Tighten the home controls at larger text", promote when a user reports it; the real path passed the browser read.
- diff-bug #10: the pager wraps unevenly at root 20 and 24 px at 320 px — follow-up: same row.
- diff-bug #11: the 320 px padding fix is tuned to one font — fix now: gone with #2.
- diff-bug #12: the search box's width at 1001 px depends on the longest option in the data — follow-up: same row.
- diff-bug #13: the count is `--text` at weight 600 while "Page p of P" stays `--muted` at 400 — reject, planned change: the mockup the user chose shows it.
- diff-bug #14: pressing a version button moves the row about 1 px, since weight 600 changes the group's width — follow-up: same row.
- diff-bug #15: `--faint` on `--hover` is 2.96:1 in dark on the divider beside a pressed or hovered button — follow-up: same row; the group's outer edge holds 3:1.
- diff-bug #16: four test titles still say "hidden" — fix now.
- diff-bug #17: on focus, square button corners can show past the group's rounded edge — follow-up: same row; main has the same rule.
- diff-bug #18: the comment says "Under 1000 px" but the rule includes 1000 — fix now, with #1.
- diff-bug #19: a long README line, an unindented `<table>`, and "red" for a salmon bar in dark — fix now for the line and the wording; reject, style, for the indent.
- blame-history #1: the count lost `--muted` — reject, planned change: as diff-bug #13.
- blame-history #2: the pressed look replaces M037's fill — reject, planned change: the user chose it at the question set.
- blame-history #3: the version and pager buttons moved to `--text-m` — reject, planned change: AC1.
- blame-history #4: menu padding at narrow widths unchecked in a browser — fix now: gone with diff-bug #2.
- blame-history #5: the count's 100% width rule went unverified at phone width — reject, false: the screenshots show the row at 320 and 375 px.
- blame-history #6: search has no width cap — reject, planned change: AC3 gives it the free width.
- prior-review #1: the version group lost its outer edge — reject, false: the shared size rule holds it, and AC1's read returns `--faint`.
- prior-review #2: the pressed and hovered fills match — reject, planned change: the bar and weight tell them apart, and the user chose that look.
- prior-review #3: labels shrank to `--text-xs` — reject, planned change: AC1.
- ripple #1 to #4: the same four test titles — fix now: as diff-bug #16.
- ripple #5 and #6: "a pager below the table" no longer describes the card — reject, false: the pager is still below the table.
- snapshot: no snapshot file changed.
