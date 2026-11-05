<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M099: Replace the red logo with a blue puzzle piece

- **Status:** review   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** normal   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** user-facing — visitors see the logo on every page and in the browser tab   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** m099-puzzle-piece-logo   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

## Goal
<!-- owner: plan · create; a wrong goal returns to plan, never edited in place -->

The site's logo no longer looks like an error, and red on the site means only a problem.

## Scope
<!-- owner: plan · create/amend-via-gate -->

**In:** the blue filled puzzle piece in the top bar and the favicon; `--accent` becomes the site's blue, which also turns the pressed version button's bar blue; the tests and docs that describe them.

**Out:** a PNG icon for browsers that show no SVG icon → parked row "Tighten link previews and the icon". A picture in link previews → parked row "Add a picture to link previews". The `--bad` color and the status colors stay unchanged.

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

- [x] AC1: `site/public/favicon.svg` draws one shape, the `puzzle` path of lucide-static 1.68.0 filled, and no other shape element. Its light fill equals the layout's light `--accent` and its dark media-query fill equals the layout's dark `--accent`. A test in `test/site.test.ts` reads the built `favicon.svg` and shows each fill has at least 3:1 contrast with that scheme's `--bg`.
- [x] AC2: `--accent` is `#1d5fb8` in the light block of `site/src/layouts/Base.astro` and `#7fb0ff` in both dark blocks, and the pressed version button's bar still draws from `--accent`. The token-pair contrast test passes in both schemes for `--accent` on `--hover` and for a new pair, `--accent` on `--surface`, at 3:1.
- [x] AC3: In every built HTML page, enumerated by the `htmlFiles(out)` helper in `test/site.test.ts`, the `.brand` link holds one inline SVG with `aria-hidden="true"`, whose path equals the path in the built `favicon.svg`, and the link's text is exactly "Zotero plugin index". The `.brand::before` rule is gone from the layout. Under `@media (forced-colors: active)` the logo's fill is `CanvasText`.
- [x] AC4: A search of `site/` and `test/` for `#b5232f` and `#f07178`, case-insensitive, finds nothing.
- [x] AC5: On the built home page and one plugin page in the browser pane, at 375 px and 1280 px wide, in the light and the dark scheme, the logo shows in blue beside the site name, the site name stays on one line, and the page has no horizontal scroll. The built `favicon.svg`, served on localhost, shows the blue puzzle piece in both schemes.
- [x] AC6: `README.md`'s favicon sentence and the `CHANGELOG.md` Unreleased entries say the icon is a blue puzzle piece, and a search of `README.md`, `CHANGELOG.md`, and `cairn/DESIGN.md` for "filled square" finds nothing that describes the current icon. `README.md`'s list of files with Lucide paths names `site/public/favicon.svg`, which points to the notice in `site/src/components/Icon.astro`. That file's comment names `puzzle` as an unchanged path of lucide-static 1.68.0.
- [x] AC7: `pnpm test` and `pnpm check` pass (run as `npx -y pnpm@12.15.0`).

## Coverage
<!-- owner: plan · create/amend-via-gate; each acceptance criterion → the
     task(s) satisfying it, by positional number (AC/Task counted
     top-to-bottom). Review reads to fence evidence — tracking-rules "AC fencing". -->

- AC1 → T1, T2
- AC2 → T1, T2
- AC3 → T1, T2
- AC4 → T2
- AC5 → T4
- AC6 → T3
- AC7 → T5

## Tasks
<!-- owner: plan (create) / implement (check-off, minor edits); substantive
     change is amend-via-gate. Every item opens with its positional label —
     `Tn:` — the item's position counted top-to-bottom, the number Coverage
     cites; an insertion, removal, or reorder renumbers the labels and the
     Coverage lines together. -->

- [x] T1: Change `test/site.test.ts` first: the favicon tests (near line 2591), the top bar's exact HTML (near 2004), the `--accent` on `--surface` pair (near 2578), and a forced-colors test that matches the layout source (lesson M063).
- [x] T2: Set `--accent` in the three blocks, write `site/public/favicon.svg`, add `puzzle` to `Icon.astro`, put it in the `.brand` link in `Base.astro`, remove `.brand::before`, and add the forced-colors rule.
- [x] T3: Update `README.md` (lines 335 and 1923), `CHANGELOG.md` (lines 11 and 41), and any `cairn/DESIGN.md` line that describes the icon. Make sure that the README exception at `test/site.test.ts:881` still holds.
- [x] T4: Build the site and view it as AC5 says, on localhost (lessons M015, M035).
- [x] T5: Run the checks of AC7, and send the output to a file (lesson M082).

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
- 2026-11-05: tier check: milestone — a change to the running site that is not a bug and holds a choice of look.
- 2026-11-05: idea vet: gap, "logo" can mean only the favicon; reading taken: the top bar mark and the favicon, as both are the red square. gap, the pressed version button's bar uses the same red; sent to the set, answered: change it too. No flaw.
- 2026-11-05: lessons used: 2026-10-25 (M001), 2026-10-26 (M015), 2026-10-28 (M035), 2026-10-30 (M063), 2026-10-31 (M066), 2026-11-02 (M082).
- 2026-11-05: collision check: M094 shipped the square favicon and M098 the accent bar, both done, so this extends them; the parked rows "Tighten link previews and the icon" and "Add a picture to link previews" stay, as their work differs; no D-entry concerns the color.
- 2026-11-05: inbox sweep: 0 open issues; 9 open bot pull requests, none overlaps.
- 2026-11-05: question set: which logo — A, the blue puzzle piece.
- 2026-11-05: question set: change the pressed button's red bar too — yes.
- 2026-11-05: question set: start a build after the merge so the logo goes live at once — yes, `gh workflow run build.yml --ref main`.
- 2026-11-05: plan gate chose an inline SVG in the `.brand` link over an `<img>` of `favicon.svg` because the favicon's media query follows the system scheme and not the site's theme button; falsified by a theme-button read where an inline logo does not change.
- 2026-11-05: criteria audit (full): 5 findings, all taken: README's Lucide file list gains `favicon.svg`; AC1 pins lucide-static 1.68.0; AC2 adds `--accent` on `--surface`; AC3 adds the forced-colors fill; AC5 views the favicon. Each changed criterion was checked again by the agent against the same questions.
- 2026-11-05: T1, T2: tests first, seen failing on the old logo; `.brand .icon` fills `puzzle` from `Icon.astro` with `--accent`; `favicon.svg` uses the same path and an XML comment points to the notice; `--accent` now equals `--link`, as both are the site's blue.
- 2026-11-05: T3: README, CHANGELOG, and DESIGN name the puzzle piece; README's Lucide list names `site/public/favicon.svg`; About's license text stays, as its words still hold.
- 2026-11-05: T4: viewed on localhost with the deployed data: home and a plugin page at 375 and 1280 px in both schemes; logo 16 px, `#1d5fb8` and `#7fb0ff`, name on one line, no horizontal scroll; `favicon.svg` shows the blue piece in both schemes.
- 2026-11-05: T5: `pnpm test` and `pnpm check` passed before the last test edit; run again below.
- 2026-11-05: claim audit: 28 claims read, 1 corrected — `test/site.test.ts`: the test name said "before the site's name" with no assertion on order; added one, and the reader's re-read holds.
- 2026-11-05: review: T3's line that About's license text stays is corrected: the review fixed it to "The icons on these pages", as every icon now comes from Lucide or Feather.

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

- AC1 evidence: named tests pass on the built file: "draws one shape, the puzzle piece", "uses each scheme's accent" (fills equal the layout's `--accent`, each at least 3:1 on `--bg`). The path equals lucide-static 1.68.0 `puzzle.svg`, compared in the claim audit.
- AC2 evidence: `Base.astro:51` `#1d5fb8`, `:102` and `:124` `#7fb0ff`; `:442` the bar uses `var(--accent)`. Named test "sets --accent" and the token-pair tests pass in both schemes, with `--accent` on `--surface` at 3:1 listed.
- AC3 evidence: named test over `htmlFiles(out)` passes: one SVG with `aria-hidden="true"`, the favicon's path, first in the link, text exact. `grep brand::before` in the layout finds nothing. Named test pins `fill: CanvasText` after the base rule.
- AC4 evidence: `grep -rniE "#b5232f|#f07178" site test` finds nothing (exit 1).
- AC5 evidence: built with the deployed data at `06cc09bc`, and `git diff 06cc09bc..HEAD -- site/` is empty. Home and a plugin page at 375 and 1280 px, both schemes: logo 16 px in `#1d5fb8` and `#7fb0ff`, `white-space: nowrap`, name on one line, `scrollWidth` equals `clientWidth`. Screenshots of the top bar, the bar under the pressed button, and `favicon.svg` on localhost show blue in both schemes.
- AC6 evidence: `README.md:336` and `CHANGELOG.md:41` name the blue puzzle piece; "filled square" count 0 in `README.md`, `CHANGELOG.md`, and `cairn/DESIGN.md`, on line-joined copies too; `README.md:1924` names `site/public/favicon.svg`, whose comment points to `Icon.astro`; `Icon.astro:9` names `puzzle` as unchanged from lucide-static 1.68.0.
- AC7 evidence: `pnpm test` exit 0, 2433 passed, 6 skipped; `pnpm check` exit 0, 736 entries, 0 problems.
- Consistency gate: `cairn_validate.py` exit 0; no principle changed, so no impact run; the generic profile's slot names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- prior-review #1: About's "line icons" no longer covers the filled logo, and M095's review chose those words to leave out the favicon — fix now.
- diff-bug #2: same About sentence — fix now, as prior-review #1.
- ripple #3: same About sentence — fix now, as prior-review #1.
- ripple #1: DESIGN's list of what `Icon.astro` draws omits the puzzle piece — fix now.
- ripple #2: `Icon.astro`'s opening comment names only the star as filled — fix now.
- blame-history #2: DESIGN omits that `--accent` now matches `--link` — fix now.
- diff-bug #10: DESIGN's "draw one path" overstates it, as the favicon holds a copy that tests keep equal — fix now.
- diff-bug #9: short README line after the edit — fix now.
- blame-history #4: same README line — fix now, as diff-bug #9.
- prior-review #3: same README line — fix now, as diff-bug #9.
- diff-bug #1: the new `htmlFiles` loop repeats the exact top-bar test — reject, planned change: AC3 names that loop.
- diff-bug #3: AC5 evidence does not show the favicon at 16 px — reject, false: the top bar zooms show that same path at 16 px in both schemes.
- diff-bug #4: a focused pressed button's bar and focus ring share one blue — reject, planned change: the user asked for the blue bar, and a 2 px offset keeps them apart.
- diff-bug #5: a blue bar can read as a link underline — reject, planned change: the user asked for it, and it sits at the button's edge.
- diff-bug #6: `--accent` and `--link` repeat one hex — reject, planned change: AC2 states the literals.
- diff-bug #7: in forced colors the mark is `CanvasText` and the link text is likely `LinkText` — reject, planned change: AC3 states `CanvasText`, as the star rule does.
- diff-bug #8: the forced-colors test's regex depends on indentation and order — reject, style: it copies the star test.
- blame-history #1: `--accent` now equals `--link` — reject, planned change: AC2 states it.
- blame-history #3: the M098 bar changes from red to blue — reject, planned change: the user asked for it.
- blame-history #5: the favicon's dark fill and the forced-colors rule — reject, false: the reviewer reports no regression.
- prior-review #2: `favicon.svg` carries a Lucide path with its notice in `Icon.astro` — reject, false: M095's known issue already covers it.
- ripple #4: DESIGN's known issue on Lucide paths — reject, false: its words still hold with the favicon among the built files.
