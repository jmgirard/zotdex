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
- [ ] T2: In `site/src/layouts/Base.astro`, write one rule for the controls' sizes and one for the labels, then the card and the rows. Search takes the free width, and the menus and version group keep their natural width at desktop. Replace `.toolbar p`, which cancels `.filter-status`'s `margin-left: auto`, with a margin reset on the controls. Drop that auto margin, and put one on `.sort-menu`.
- [ ] T3: Add the hover, pressed, and focus states. Write hover on a menu with `background-color`, since the arrow is a `background-image`. Keep the forced-colors rules after the rules they override.
- [ ] T4: Fix the arrangement at 320 to 1024 px: search on its own row at the middle widths, and at 560 px or less the two menus side by side and the version buttons on their own row at full width.
- [ ] T5: Update the markup and CSS expectations in `test/site.test.ts`, keeping every behavior expectation of the `homeScript` tests and the theme button's hide rule. Add the `--accent` on `--hover` pair to the color test, and a test of the pre-paint script's place before `<tbody>`.
- [ ] T6: Run the browser-pane reads of AC1 to AC6 on a build from the deployed data, in both schemes where the criterion says so.
- [ ] T7: Update README.md, `cairn/DESIGN.md`, the stale comments in `src/site/home-filter.ts`, and CHANGELOG.md.

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
