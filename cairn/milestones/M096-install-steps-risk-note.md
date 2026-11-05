# M096: Say how to install a plugin and what it can reach

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — visitors read the new text on the site
- **Branch/PR:** —

## Goal

A visitor can learn from the site how to install a plugin and what a plugin can reach, and the home page's intro says what the site is for.

## Scope

**In:** A note on each plugin page that has a download link. An About section on installing, with the steps, the Firefox step, the risk, and the bot's role. A shorter home intro that keeps the disclaimer and links to that section. The tests, README, DESIGN, and CHANGELOG text for these, and a decision entry.

**Out:** An install button stays out of scope (DESIGN's out-of-scope line, D-029). Home rows keep their download icons, as the user chose. Other About text stays as it is, including the stray missing spaces that the criteria audit saw near `about.astro:190-197`. The plugin with no facts after a failed read stays with the candidate "Keep a plugin's last good record".

## Acceptance criteria

- [ ] AC1: A plugin page with a download link shows, directly after its page head, one paragraph with `data-fact="install-note"` whose built text reads exactly: "To install, save the .xpi file and drag it onto the Plugins window in Zotero (Tools → Plugins). In Firefox, right-click the download link and choose Save Link As. A plugin has full access to your Zotero and your computer, and the index does not review its code before listing it, so install only plugins from developers you trust. More about installing". "More about installing" links to `about/#installing` under the site's base. A plugin page with no download link has no such paragraph. `test/site.test.ts` checks, on each plugin page that the fixture build writes, that the paragraph count equals the download link count (0 or 1), and that the paragraph follows the page head and has that link. It checks the text on one page.
- [ ] AC2: The About page has a section with `id="installing"`, `data-about="installing"`, and the heading "Installing a plugin", directly before the section `not-vetted`. Its built text holds each of these sentences (zotero-plugins-page): "To install a plugin, save its .xpi file to your computer. Then, in Zotero, go to Tools → Plugins and drag the file onto the Plugins window." "In Firefox, right-click the download link and choose Save Link As." "A plugin has full access to your Zotero and your computer, so install only plugins from developers you trust." "A bot adds new plugins on its own, and a maintainer decides only those that one of its checks holds." "A maintainer who decides a held plugin checks who makes it and what it claims to be, not its code." "The index does not review a plugin's code before listing it." `test/site.test.ts` asserts each sentence inside that section.
- [ ] AC3: The home page's intro paragraph has this built text exactly: "See which Zotero versions each plugin declares, whether it starts, and what users report. This index is unofficial and not affiliated with or endorsed by Zotero, and it cannot vet the plugins it lists. How to install a plugin." "How to install a plugin" links to `about/#installing` under the site's base, and the paragraph comes before the table. `test/site.test.ts` asserts these. Measured in the browser pane on the built site at a 375 px wide page, the paragraph takes at most 6 lines.
- [ ] AC4: The build facts cut from the home intro stay on About: the About intro holds "A maintainer reads the paid service fact by hand, and the build reads the others", and the Start test section holds "It also starts each plugin again on one day of each week". `test/site.test.ts` asserts both.
- [ ] AC5: README's and DESIGN's text on plugin pages each name the install note and About's `#installing` section, and each says what the home intro now holds. CHANGELOG has an entry for all three.
- [ ] AC6: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T2, T3
- AC2 → T1, T2, T4
- AC3 → T2, T5, T7
- AC4 → T2, T5
- AC5 → T6
- AC6 → T7

## Tasks

- [ ] T1: Save https://www.zotero.org/support/plugins to `cairn/references/sources/`. Write `cairn/references/zotero-plugins-page.md` and its `INDEX.md` line, with the install steps and the full-access warning. Record the Firefox evidence there: GitHub's `content-type: application/x-xpinstall` answer and the Firefox notes in the READMEs of Better Notes and PDF Translate.
- [ ] T2: In `test/site.test.ts`, write the tests for AC1 to AC4 first and see them fail. Change the tests that the new intro and section replace: "the About and home intros say who reads the paid service fact" (line 765, About only), "opens the home intro with the disclaimer, above the table" (line 1779, the disclaimer stays in the intro, above the table), and the section list (line 775).
- [ ] T3: Add the note after `.page-head` in `site/src/pages/plugins/[id]/index.astro`, only when the download link shows, with its style in `site/src/layouts/Base.astro`. The `.actions` markup stays as `test/site.test.ts:438` reads it. Write `{" "}` before the link (lesson M021).
- [ ] T4: Add the `installing` section to `site/src/pages/about.astro`, before `not-vetted`. Add a sentence on it to the About intro. Read the built text for dropped spaces.
- [ ] T5: Replace the home intro in `site/src/pages/index.astro:57-61`, keeping `{DISCLAIMER}` and using `{" "}` before the link.
- [ ] T6: Update README and DESIGN, add the CHANGELOG entry, and add a D-entry that annotates D-029 and D-051: a plugin page now states a plugin's full access and that the index does not review code, in Zotero's own terms, and the home intro leads with what the site does. Wrap prose as the files do (lesson M036).
- [ ] T7: Build the site from the deployed data (lesson M035) and view it in the browser pane: a plugin page and About at 375 px and desktop, in both color schemes. Measure the intro's lines at 375 px and check for side scrolling (lesson M048). Run `pnpm test` and `pnpm check`, sending the test output to a file and reading its exit code (lesson M082).

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

## Decisions

## Review
