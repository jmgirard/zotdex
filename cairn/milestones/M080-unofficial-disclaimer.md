# M080: Say the index is unofficial and cannot vet plugins

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — every page of the public site and the README state it
- **Branch/PR:** m080-unofficial-disclaimer

## Goal

Each page of the site and the README say that the index is unofficial, not affiliated with or endorsed by Zotero, and cannot vet the plugins it lists.

## Scope

**In:** One sentence in a constant in `site/src/data.ts`, which replaces the footer's "does not vet" line on every page and opens the home page's intro. The About page's last section says the same with the reason, and README, DESIGN, and CHANGELOG state it. The user allowed one hand run of Build data after the merge.

**Out:**
- Renaming the site: no work is planned, since the sentence answers the concern that its name could read as official.
- Vetting plugins, or changing the holds and start tests: no work is planned, as the sentence states the limit.

## Acceptance criteria

- [x] AC1: Every HTML file that the site build writes from the site test fixture, as `htmlFiles(out)` lists them, has in its footer one `<p data-fact="disclaimer">` whose text is "This index is unofficial and not affiliated with or endorsed by Zotero, and it cannot vet the plugins it lists." None holds `data-fact="not-vetted"` or the words "does not vet".
- [x] AC2: The built home page's `.intro` paragraph, above the table, opens with that sentence.
- [x] AC3: The built About page's `not-vetted` section says that the index is unofficial and not affiliated with or endorsed by Zotero, that it cannot vet the plugins it lists, and that the start test is not a review of plugin code.
- [x] AC4: The opening paragraph of `README.md` says that the index is unofficial, is not affiliated with or endorsed by Zotero, and cannot vet the plugins it lists. `README.md` "The site" and `cairn/DESIGN.md` Contract boundary quote that sentence, and `CHANGELOG.md` Unreleased states it.
- [x] AC5: In the browser pane, on the site that `npx -y pnpm@12.15.0 site --out <dir>` builds over the downloaded deployed `v1/plugins.json`, the footer line shows on the home, About, and one plugin page at 375 and 1280 px, wrapping at spaces only by eye, and in a same-origin `<iframe>` of that width with `border: 0` the `scrollWidth` of `documentElement` does not pass its `clientWidth`.
- [x] AC6: The active profile's verify slot is clean, run as the slot names its commands.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T1
- AC4 → T2
- AC5 → T3
- AC6 → T2

## Tasks

- [x] T1: Add `DISCLAIMER` to `site/src/data.ts`. Use it in the footer of `site/src/layouts/Base.astro` with `data-fact="disclaimer"` on one source line, and at the start of the home intro in `site/src/pages/index.astro`. Rewrite the first sentences of the About section. Update `test/site.test.ts` near lines 585, 599, 774, 782, and 1626, and add tests for AC1, AC2, and AC3 over the built pages.
- [x] T2: Update the README opening and "The site" near line 244, DESIGN's Contract boundary near line 136, and the CHANGELOG, then run `pnpm test` and `pnpm check` as the verify slot names them.
- [x] T3: Build the real site and run the AC5 checks in the browser pane, and look at the home intro at 375 and 1280 px (lessons M015, M035, M048, M054, and M079).

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — words on every public page, in running templates, with a choice of wording and place.
- 2026-11-02: idea vet: gap: the site's name still says Zotero; the plan takes a sentence on each page and no rename. gap: where the line goes; the user's answer asked that it also say the index cannot vet plugins and did not choose a place, so the plan took the recommended footer and home intro, and the merge question names this. gap: "cannot vet" goes past DESIGN's "does not review", and the holds, the spam removal, and the start tests screen in part; the user asked for "unable to vet", so About says that the start test is not a review of plugin code.
- 2026-11-02: collision check: the footer line of M053 and M054 and test `data-fact="not-vetted"` are replaced at the user's request; no decision or candidate row overlaps; DESIGN notes that Zotero plans an official directory, and the sentence does not conflict with it.
- 2026-11-02: inbox sweep: 0 open issues; 61 open pull requests, all discovery bot entries, do not overlap.
- 2026-11-02: lessons used: 2026-10-26 (M015), 2026-10-28 (M035), 2026-10-29 (M048), 2026-10-29 (M054), 2026-10-27 (M021), 2026-11-02 (M079).
- 2026-11-02: criteria audit: full mode, a fresh Opus reader; it returned five findings, and four were taken: the two lists that name the line, the eye check for broken words, the build procedure and `border: 0`, and the verify slot's own commands. The fifth, that the verify criterion binds an instrument, was answered: the template keeps it as a gate line.
- 2026-11-02: criteria re-audit after the user's answer changed the sentence: full mode, a fresh Opus reader; it returned five findings, all taken: no built page holds the old words, About gives the reason and does not repeat the footer sentence, "cannot" is recorded in the idea vet, "quote" for the two lists, and the `npx` command with a 1280 px look.
- 2026-11-02: question set: start one Build data run by hand after the merge — yes, allowed once, as `gh workflow run build.yml --ref main`.
- 2026-11-02: plan chose one sentence in one constant over separate lines for the two facts, because the user asked for one disclaimer; falsified by the sentence reading too long at 375 px.
- 2026-11-02: T1, T2, T3: added `DISCLAIMER`, the footer line, the home intro, the About text, tests, and docs; `pnpm test` 2088 passed, 6 skipped; `pnpm check` 0 problems; the pane on the real site at 375 and 1280 px showed the line on three pages with `scrollWidth` equal to `clientWidth` in 6 cases, a planted block read 900, words broke only at spaces, and no console errors. Left the simple-english hook's sentence-length hits on the quoted disclaimer in README and CHANGELOG, since a quote stays as it is.
- 2026-11-02: claim audit: 25 claims read, 0 corrected — site/src/data.ts, site/src/pages/index.astro, site/src/pages/about.astro, README.md, CHANGELOG.md, test/site.test.ts. Whether Zotero endorses the index is the maintainer's own fact, which the reader could not check. It noted the older About title "How the index checks plugins" as worth a look.
- 2026-11-02: step-7 approval: m080-unofficial-disclaimer approved for merge; the user saw the home intro placement, the About reason, and the title change named at the question.

## Decisions

## Review

Evidence read 2026-11-02 at bdedf54, the branch level with `origin/main`.

- AC1 evidence: the site tests "puts the top bar and the footer on every page" and "drops the old footer line from every page…" pass over `htmlFiles(out)` with the sentence stated literally in the test; on the real site's 673 built pages, a read found the line on 673 and "does not vet" on 0.
- AC2 evidence: the site test "…opens the home intro with the disclaimer" passes, and it checks the intro's start and its place before the table; the pane shows it at 375 and 1280 px.
- AC3 evidence: the About site test passes on "The index is unofficial: it is not affiliated with or endorsed by Zotero.", "It cannot vet the plugins it lists.", and "The start test is not a review of plugin code."
- AC4 evidence: a joined read of `README.md` finds the opening's statement and the quoted sentence in "The site"; a joined read of `cairn/DESIGN.md` finds the quoted sentence in Contract boundary; `CHANGELOG.md` Unreleased opens with it.
- AC5 evidence: pane, site built from the downloaded deployed data at bdedf54: home, About, and BetterRSS plugin page at 375 and 1280 px in iframes with `border: 0`: the line has width and `scrollWidth` equals `clientWidth` in all 6; a planted 900 px block read 900 at T3; screenshots at T3 and now show words breaking only at spaces.
- AC6 evidence: `pnpm test` 2088 passed, 6 skipped; `pnpm check` 671 entries, 0 problems; tracking checks pass; no snapshot files changed.
- Evidence after the review fixes, at a3f7391: `pnpm test` 2089 passed, 6 skipped; `pnpm check` 0 problems; tracking checks pass. AC3's test now reads the section itself. The pane on the rebuilt site repeated AC5's 6 width cases. The criteria did not change.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: the About title and two plugin page links say "How the index checks plugins" beside "cannot vet" — fix now: "How the index reads plugins", fixed a3f7391.
- diff-bug #2: About gives no reason, though Scope says it does — fix now, fixed a3f7391.
- diff-bug #3: "does not review" and "cannot vet" sit side by side with nothing to reconcile them — fix now: DESIGN and D-051 say that the holds and start tests screen in part and are no review, fixed a3f7391.
- diff-bug #4: the About test read the whole page, not the section — fix now, fixed a3f7391.
- diff-bug #5: the changelog's "say the same" was loose, and no test covers the README half — fix now: the entry names what About does, fixed a3f7391.
- diff-bug #6: "these facts" can point back at the disclaimer — fix now: "the facts below", fixed a3f7391.
- diff-bug #7: two About sentences repeated "review of plugin code" — fix now, fixed a3f7391.
- diff-bug #8: the heading "What the index does not do" now opens with a status — reject, style: the section's other sentences fit it, and a test names it.
- diff-bug #9: the per-file check repeated `data-fact="not-vetted"` after the exact footer match — fix now, removed, fixed a3f7391.
- diff-bug #10: the intro check hid the actual text on failure — fix now, fixed a3f7391.
- diff-bug #11: the intro test names literal tags — reject, style: nearby tests do the same.
- diff-bug #12: one test bundled AC1 and AC2 — fix now: two tests, fixed a3f7391.
- diff-bug #13: README's "also" no longer connected — fix now, fixed a3f7391.
- diff-bug #14: two prose lines were left over 120 columns — fix now on the home intro, fixed a3f7391.
- diff-bug #15: `DISCLAIMER` was out of order in an import list — fix now, fixed a3f7391.
- diff-bug #16: a period inside and after a quote in DESIGN — reject, style.
- blame-history #1: "cannot vet" is broader than the index's screening record — reject, planned change: the user asked for "unable to vet", and D-051 records the holds.
- blame-history #2: replacing M054's footer line has no decision entry — fix now: D-051, fixed a3f7391.
- blame-history #3: the home intro is longer than M053 planned — reject, planned change: the plan puts the sentence there, and the merge question names it.
- blame-history #4: the About section keeps the id `not-vetted` — reject, planned change: AC3 names it, and nothing links to it.
- prior-review #1: the sentence shows twice on the home page — reject, planned change: top and footer are the plan's placement.
- prior-review #2: two mockups keep the old words — reject, false: they are frozen records that do not feed the site.
- prior-review #3: the section's old id remains — reject, planned change, the same as blame-history #4.
- prior-review #4: a merge deploys nothing — reject, false: the question set allows the hand run.
- ripple #1: an older Unreleased changelog line says "does not vet" — fix now, fixed a3f7391.
- ripple #2: the title "How the index checks plugins" — fix now, the same as diff-bug #1, fixed a3f7391.
- ripple #3: the section's old id remains — reject, planned change, the same as blame-history #4.
- ripple #4: DESIGN's Contract boundary does not quote the sentence — reject, false: that section runs from line 23 to 206, and the quote is inside it.
- ripple #5: hand-typed copies of the sentence can drift — reject, style: the test's own copy checks the wording, and the docs quote it.
