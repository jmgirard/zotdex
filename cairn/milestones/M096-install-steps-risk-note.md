# M096: Say how to install a plugin and what it can reach

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — visitors read the new text on the site
- **Branch/PR:** m096-install-steps-risk-note

## Goal

A visitor can learn from the site how to install a plugin and what a plugin can reach, and the home page's intro says what the site is for.

## Scope

**In:** A note on each plugin page that has a download link. An About section on installing, with the steps, the Firefox step, the risk, and the bot's role. A shorter home intro that keeps the disclaimer and links to that section. The tests, README, DESIGN, and CHANGELOG text for these, and a decision entry.

**Out:** An install button stays out of scope (DESIGN's out-of-scope line, D-029). Home rows keep their download icons, as the user chose. Other About text stays as it is, including the stray missing spaces that the criteria audit saw near `about.astro:190-197`. The plugin with no facts after a failed read stays with the candidate "Keep a plugin's last good record".

## Acceptance criteria

- [x] AC1: A plugin page with a download link shows, directly after its page head, one paragraph with `data-fact="install-note"` whose built text reads exactly: "To install, save the .xpi file and drag it onto the Plugins window in Zotero (Tools → Plugins). In Firefox, right-click the download link and choose Save Link As. A plugin has full access to your Zotero and your computer, and the index does not review its code before listing it, so install only plugins from developers you trust. More about installing". "More about installing" links to `about/#installing` under the site's base. A plugin page with no download link has no such paragraph. `test/site.test.ts` checks, on each plugin page that the fixture build writes, that the paragraph count equals the download link count (0 or 1), and that the paragraph follows the page head and has that link. It checks the text on one page.
- [x] AC2: The About page has a section with `id="installing"`, `data-about="installing"`, and the heading "Installing a plugin", directly before the section `not-vetted`. Its built text holds each of these sentences: "To install a plugin, save its .xpi file to your computer. Then, in Zotero, go to Tools → Plugins and drag the file onto the Plugins window." (zotero-plugins-page) "In Firefox, right-click the download link and choose Save Link As." (zotero-plugins-page, Firefox evidence) "A plugin has full access to your Zotero and your computer, so install only plugins from developers you trust." (zotero-plugins-page) "A bot adds most new plugins on its own." "If one of the bot's checks flags a plugin, the bot waits, and a maintainer decides whether to list it." "A maintainer can also add a plugin by hand or keep one out." "When deciding, a maintainer mainly checks whether the entry would mislead people about what the plugin is, who makes it, or who controls its updates." "A maintainer can compare files to spot a copy, but does not review the code." "The index does not review a plugin's code before listing it." `test/site.test.ts` asserts each sentence inside that section.
- [x] AC3: The home page's intro paragraph has this built text exactly: "See which Zotero versions each plugin declares, whether it starts, and what users report. This index is unofficial and not affiliated with or endorsed by Zotero, and it cannot vet the plugins it lists. How to install a plugin." "How to install a plugin" links to `about/#installing` under the site's base, and the paragraph comes before the table. `test/site.test.ts` asserts these. Measured in the browser pane on the built site at a 375 px wide page, the paragraph takes at most 6 lines.
- [x] AC4: The build facts cut from the home intro stay on About: the About intro holds "A maintainer reads the paid service fact by hand, and the build reads the others", and the Start test section holds "It also starts each plugin again on one day of each week". `test/site.test.ts` asserts both.
- [x] AC5: README's and DESIGN's text on plugin pages each name the install note and About's `#installing` section, and each says what the home intro now holds. CHANGELOG has an entry for all three.
- [x] AC6: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T2, T3
- AC2 → T1, T2, T4
- AC3 → T2, T5, T7
- AC4 → T2, T5
- AC5 → T6
- AC6 → T7

## Tasks

- [x] T1: Save https://www.zotero.org/support/plugins to `cairn/references/sources/`. Write `cairn/references/zotero-plugins-page.md` and its `INDEX.md` line, with the install steps and the full-access warning. Record the Firefox evidence there: GitHub's `content-type: application/x-xpinstall` answer and the Firefox notes in the READMEs of Better Notes and PDF Translate.
- [x] T2: In `test/site.test.ts`, write the tests for AC1 to AC4 first and see them fail. Change the tests that the new intro and section replace: "the About and home intros say who reads the paid service fact" (line 765, About only), "opens the home intro with the disclaimer, above the table" (line 1779, the disclaimer stays in the intro, above the table), and the section list (line 775).
- [x] T3: Add the note after `.page-head` in `site/src/pages/plugins/[id]/index.astro`, only when the download link shows, with its style in `site/src/layouts/Base.astro`. The `.actions` markup stays as `test/site.test.ts:438` reads it. Write `{" "}` before the link (lesson M021).
- [x] T4: Add the `installing` section to `site/src/pages/about.astro`, before `not-vetted`. Add a sentence on it to the About intro. Read the built text for dropped spaces.
- [x] T5: Replace the home intro in `site/src/pages/index.astro:57-61`, keeping `{DISCLAIMER}` and using `{" "}` before the link.
- [x] T6: Update README and DESIGN, add the CHANGELOG entry, and add a D-entry that annotates D-029 and D-051: a plugin page now states a plugin's full access and that the index does not review code, in Zotero's own terms, and the home intro leads with what the site does. Wrap prose as the files do (lesson M036).
- [x] T7: Build the site from the deployed data (lesson M035) and view it in the browser pane: a plugin page and About at 375 px and desktop, in both color schemes. Measure the intro's lines at 375 px and check for side scrolling (lesson M048). Run `pnpm test` and `pnpm check`, sending the test output to a file and reading its exit code (lesson M082).

## Work log

- 2026-11-05: created by /milestone-plan.
- 2026-11-05: tier check: milestone — a small change to running code that is not a bug: new text on three kinds of page.
- 2026-11-05: idea vet: gap — "no one reads its code" is too broad, so the reading taken says the index does not review code before listing; gap — home row icons skip the note, sent to the question set, which kept them; gap — the bot's role near the download, sent to the question set, which placed it on About only. No flaw.
- 2026-11-05: collision check: D-029 stands, since a text note is not an install button; D-051 stands, since the intro still says the index cannot vet; M080 did not have the user choose the disclaimer's place, so the plan moves it after the first sentence; D-053 and D-062 shaped the wording on holds. No candidate row absorbed.
- 2026-11-05: inbox sweep: 0 open issues; 9 open bot pull requests, none overlapping, left to the merge job.
- 2026-11-05: lessons used: 2026-10-25 (M001), 2026-10-26 (M015), 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-28 (M036), 2026-10-29 (M048), 2026-10-31 (M066), 2026-11-02 (M082).
- 2026-11-05: criteria audit (full mode): AC1 "no one reads its code" unsupported, narrowed; AC1 total-count test too weak, now per page; AC1 note moved after the page head for `test/site.test.ts:438`; AC1 "this file" and "the link" made specific; AC2 "most often after two days" false, as hand runs set a shorter wait (D-034), timing removed; AC2 "reads its entry, not its code" too narrow (D-053), reworded; AC2 and AC3 test conflicts moved to T2; AC3 spaces moved to T5; AC5's search proved nothing, dropped, and "describe" made specific; AC4 and AC6 none.
- 2026-11-05: plan gate chose to keep home row download icons over adding the risk to the intro or removing the icons, because the intro stays short and phone rows keep their only download link; falsified by reports of visitors who installed from a row and did not know the risk.
- 2026-11-05: plan gate chose to state the bot's role on About only over also on the plugin page, because the note is already four sentences above the compatibility table; falsified by a visitor who reads the note and takes a listing as a human check.
- 2026-11-05: plan chose Zotero's own steps and warning over a menu path from memory, because the index should match Zotero's documented words; falsified by a change to that page.
- 2026-11-05: question set: start the build workflow by hand after the merge — yes, `gh workflow run build.yml --ref main`.
- 2026-11-05: T1 done: source note and INDEX line; the page also says that an official plugin directory is planned, which the close names for the user.
- 2026-11-05: T2 to T6 done in one commit, since the T2 tests fail until T5 lands; a negative margin on the note failed the style test, so the note keeps the page head's own gap; `INSTALL_HREF` in `site/src/data.ts` holds the shared link; D-064 added.
- 2026-11-05: T7 done: built from the deployed data; at 375 px the home intro takes 5 lines and the plugin note 7, with no side scrolling on home, a plugin page, or About; viewed in light at 375 px and dark on desktop; no console errors; `pnpm test` and `pnpm check` pass.
- 2026-11-05: claim audit: 31 claims read, 2 corrected — `site/src/pages/about.astro` (a maintainer's role in the bot's listing, and what a maintainer checks), and the same sentences in `test/site.test.ts`.
- 2026-11-05: substantive amendment: AC2's bot and maintainer sentences replaced, as the claim audit found two false; the user approved the shown text at a stop, over a shorter text that leaves out what a maintainer looks at.
- 2026-11-05: re-audit: AC2 (full) — five wording findings: `mainly` for two hold reasons, an unclear `its` and process words, `stop` could read as turning a plugin off, three senses of `check`, and a citation that covered all sentences; all five fixed.
- 2026-11-05: re-audit: AC2 (full) — nothing; `most` holds, with 648 unheld bot merges, 73 held merges, and 15 by hand of 736 entries; no one ran Firefox, and the sentence rests on the reference's evidence.
- 2026-11-05: home intro's "what users report" kept: the plugin pages show reports, but the home table has none; the claim audit read this as holding, and it is text the user approved.

## Decisions

## Review

- AC1: `test/site.test.ts` "each plugin page with a download link has one note after its page head, and a page with none has no note" and "the note gives the steps, the Firefox step, and the risk" pass; the deployed-data build shows the note on Better Notes.
- AC2: the nine "the About section says" sentence tests pass, with the two install sentences joined in one test; "has one section for each part of the method" passes with `installing` before `not-vetted`; in the browser pane `#installing`'s next section is `not-vetted`.
- AC3: "says what the site is for in the home intro, with the disclaimer and the install link, above the table" passes; measured in the browser pane on the deployed-data build at 375 px: 5 lines, no side scrolling.
- AC4: "the About intro says who reads the paid service fact, and the Start test section says when a plugin starts again" passes.
- AC5: a joined search finds "install note" and "#installing" in README and DESIGN, and "what the site shows" in each; CHANGELOG's first Unreleased entry names the note, the section, and the intro.
- AC6: `pnpm test` 2393 passed and 6 skipped, exit 0; `pnpm check` 736 entries, 0 problems.
- Consistency gate: `cairn_validate` passes; one advisory, a local-clock date on the new source note (UTC date 2026-11-05); no principle changed; the profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: "the bot waits" implies that an unflagged plugin has no wait — reject, false: the sentence says that the bot waits for a maintainer, which a held pull request does (D-033), and it does not state the unheld wait.
- diff-bug #2: "what users report" sits above a table with no reports — reject, planned change: AC3's text, which the user approved; plugin pages show the reports.
- diff-bug #3: `.install-note` has no `max-width`, so lines run long on desktop — fix now, fixed e97c4692.
- diff-bug #4: the one warning on a plugin page is in the smallest muted text, and nothing caps its 7 lines at 375 px — fix now, fixed e97c4692 for the color, which is now the page's text color; the length is a planned change.
- diff-bug #5: "before listing it" can suggest a later review, and "does not review the code" is unqualified — reject, false: the sentences describe a listing decision, and D-062's read of code applies only to a report's evidence.
- diff-bug #6: the listing section names three kinds of misleading entry and Removing names two — reject, planned change: D-053 and D-062 differ, and each section states its own.
- diff-bug #7: About's description and h1 do not mention installing — reject, style: both stay true, and the link lands on the section.
- diff-bug #8: the home description names repository facts only, and the intro names reports — reject, false: what it says stays true (M094).
- diff-bug #9: the evidence supports saving but not the label "Save Link As" — fix now, fixed e97c4692: read from the installed Firefox 158's text and recorded in `zotero-plugins-page.md`.
- diff-bug #10: "the download link" names a button, and the Firefox step comes after the drag step — reject, style.
- diff-bug #11: DESIGN's walkthrough says the card follows the links, and its About list omits installing — fix now, fixed e97c4692.
- diff-bug #12: T7 asked for both color schemes at each size, and the log records two of the four views — fix now, fixed e97c4692: the other views ran after these fixes.
- diff-bug #13: two sentences both say that code is not reviewed, under an install heading — reject, planned change: AC2's text, approved by the user.
- diff-bug #14: `INSTALL_HREF` import order, and the rule's place in `Base.astro` — reject, style.
- diff-bug #15: one link ends with a period and one does not — reject, planned change: AC1 and AC3 say so.
- diff-bug #16: the note's position test never names the page head — fix now, fixed e97c4692.
- diff-bug #17: About intro's new sentence has no test — fix now, fixed e97c4692.
- diff-bug #18: tag stripping appears twice in `test/site.test.ts` — reject, style.
- blame-history #1: the home intro drops M082's paid-service sentence, and D-064 omits it — fix now, fixed e97c4692: D-064 names it; the cut is a planned change.
- blame-history #2: the home intro drops M059's start rule — fix now, fixed e97c4692 in the same D-064 sentence; AC4 keeps it on About.
- blame-history #3: the disclaimer no longer opens the intro, against M080 — reject, planned change: D-064 records it.
- blame-history #4: the home intro no longer says where the facts come from — fix now, fixed e97c4692 in the same D-064 sentence; About keeps it.
- prior-review #1: the same M082 AC5 cut, not named in the plan's collision check — fix now, fixed e97c4692 through D-064, as blame-history #1.
- prior-review #2: the plan's claim on M080's disclaimer place — reject, false: M080's summary says that the user "did not choose a place".
- prior-review #3: a second About link on a plugin page, against M054's one line — reject, planned change: AC1 calls for the link, and M054's line is for the compatibility section, which keeps one.
- ripple #1: `CHANGELOG.md` says that the home intro links to the "Add a plugin" form, which it does not — fix now, fixed e97c4692: sentence removed.
- ripple #2: DESIGN's About list omits installing — fix now, fixed e97c4692, as diff-bug #11.
- ripple #3: the home description is now the only home text on the daily read — reject, false: it stays true.
- Re-verify after the fixes: `pnpm test` first failed 2 tests in `test/registry-schema.test.ts` with `RegistrySchemaUnavailable`, a read of raw.githubusercontent.com that reached its 10 s limit, code this branch does not touch and that the candidate "Steady the time-limit tests under load" names; a rerun gave 2393 passed and 6 skipped, exit 0; `pnpm check` 736 entries, 0 problems.
- T7 views after the fixes: a plugin page and About, in light and dark, at 375 px and desktop; the note takes 7 lines at 375 px and 4 on desktop, with no side scrolling.
