# M078: Add a dark mode toggle to the site

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — every page of the public site gets a new control
- **Branch/PR:** m078-dark-mode-toggle

## Goal

Each page of the site has a top-bar button that flips between the light and dark color schemes and keeps the visitor's choice.

## Scope

**In:** A sun and moon button in the top bar of `Base.astro`. A press flips the scheme and saves it in the browser, and flipping back to the system's scheme clears the saved choice, as the user chose. A classic inline script in `<head>` sets the saved scheme before the body parses, and a second one right after the button wires and shows it. `src/site/theme.ts` holds both as tested functions, in the `prePaintStyle` pattern. The dark tokens gain a second block for the `data-theme` attribute. CHANGELOG and DESIGN state the change. After the merge, one `gh workflow run build.yml --ref main` publishes the toggle, as the user chose.

**Out:**
- Pinning the scheme that matches the system, or a third "System" state: the user chose the two-state flip at the plan.
- A site-wide test in a real browser: row "Test the home page script in a browser" holds it, and this milestone adds hand checks in the browser pane.
- A different look in forced colors: the button stays and draws in `currentColor`, and no work is planned, since forced colors replace the site's colors.
- Changing any color value or the data file: the tokens keep their values.

## Acceptance criteria

- [x] AC1: Every HTML file that `pnpm site` writes from the site test fixture, as `htmlFiles(out)` lists them, has a classic inline script in `<head>` that sets the saved scheme, and in its top bar one `<button>` with `data-theme-toggle` and the `hidden` attribute, followed at once by a classic inline script that wires and shows the button. Neither script has `src`, `defer`, or `async`. No built `<html>` tag holds `data-theme`, and a `[data-theme-toggle][hidden]` rule in `Base.astro` sets `display: none`, so with JavaScript off the button stays hidden and only `prefers-color-scheme` sets the scheme.
- [x] AC2: Run in `node:vm` with stand-ins, the head script sets `data-theme` on `<html>` to `light` or `dark` when `localStorage` holds that value under the key `zotero-plugin-index-theme`. With no value, with each of `""`, `Dark`, and `system`, with a `localStorage` getter that throws, and with a `getItem` that throws, it sets no `data-theme` and throws nothing.
- [x] AC3: Run in `node:vm` with stand-ins, a press of the button sets the other scheme for each of the six states of system scheme (light, dark) and `data-theme` (none, light, dark). If the other scheme differs from the system scheme, the press saves it under the key and sets `data-theme` to it. If it equals the system scheme, the press removes the key and the attribute, so the page follows the system again. When `localStorage` throws, a press still sets the page's scheme and throws nothing.
- [x] AC4: The button's `aria-label` and `title` name the scheme that a press gives ("Switch to dark mode" or "Switch to light mode"), and its icon is a moon when a press gives dark and a sun when it gives light. All three are right at load, after a press, after a change of the system scheme with no saved choice, and after a `pageshow` or `storage` event that follows a change to the saved value, which also updates `data-theme`. A read that throws at such an event leaves `data-theme` as it is. Each case runs in `node:vm` with stand-ins, and the browser pane shows both icons at 375 px.
- [x] AC5: In `Base.astro`, the dark color tokens apply under `@media (prefers-color-scheme: dark)` to `:root:not([data-theme="light"])` and under `:root[data-theme="dark"]`, and the two blocks hold the same custom properties with the same values, which a site test compares. `color-scheme` is `light` under `:root[data-theme="light"]` and `dark` under `:root[data-theme="dark"]`. In the browser pane, on the built home, About, and one plugin page, for each of the six pairs of emulated system scheme and saved choice (none, light, dark), the computed `background-color` of `body` is the `--bg` of the expected scheme, a reload keeps it, and a click on the button changes it to the other scheme's `--bg`.
- [x] AC6: In the browser pane, on the built home, About, and one plugin page at 375 and 1280 px in both schemes, the button shows in the top bar, the `scrollWidth` of `documentElement` does not pass its `clientWidth`, and a keyboard focus shows an outline in `--link`.
- [x] AC7: The active profile's verify slot is clean: `pnpm test` and `pnpm check`. `CHANGELOG.md` Unreleased has an entry for the toggle. `cairn/DESIGN.md` says that every page carries the two theme scripts and names both dark blocks.

## Coverage

- AC1 → T2, T3
- AC2 → T1
- AC3 → T1
- AC4 → T1, T4
- AC5 → T2, T3, T4
- AC6 → T2, T4
- AC7 → T3, T5

## Tasks

- [x] T1: Tests first: add `src/site/theme.ts` with the head function and the button function, each calling and reading nothing outside its body except built-ins and browser globals, and run them in `node:vm` for AC2, AC3, and AC4 in `test/site.test.ts` or a new test file.
- [x] T2: In `site/src/layouts/Base.astro`, add the head script and the button with its script through `<script is:inline set:html={…}>`, the second dark block, the two `color-scheme` rules, the `[data-theme-toggle][hidden]` rule, and the button's styles from tokens, with an outline in `--link` at `:focus-visible`. Add `sun` and `moon` to `site/src/components/Icon.astro`.
- [x] T3: Update the site tests that the new scripts and blocks change in `test/site.test.ts`: the dark-block regex at line 1869, whose null would stop the contrast block at collection; the classic script match at 1547 and the position check at 1581, which must read the home page's pre-paint script and not the head script; the hiding-rule list at 1138; and the checks near 1130, 1603, and 1636-1637. Add the AC1 test over `htmlFiles(out)` and the AC5 test that compares the two blocks.
- [x] T4: Build the real site for a hand check (lessons M035 and M015), and run the AC4, AC5, and AC6 checks in the browser pane, with iframes for the width check (lesson M048). Look at the 375 px view, and record each result.
- [x] T5: Add the `CHANGELOG.md` entry, update the script and style text in `cairn/DESIGN.md` (the home page's "The other pages carry none" sentence and the `prefers-color-scheme` block sentence near "All styles are global"), and run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — a new control and new scripts on every page; not a bug fix and not an edit with no runtime surface.
- 2026-11-02: idea vet: flaw: no user asked for it, no issue is open, and the system setting already switches the scheme; the user answered build it. gap: a two-state flip can keep the choice for good or return to the system, and a three-state button also fits; the user chose the flip that returns to the system. gap: the Pages origin `jmgirard.github.io` is shared with the owner's other sites, so the plan takes a key named for this site. gap: a page restored by Back keeps its old scheme, so the plan re-reads the key at `pageshow`.
- 2026-11-02: collision check: absorbed candidate row "Add a dark mode toggle to the site"; D-026 allows a script on any page, and D-004's rule that each page reads in full without JavaScript stays, so no D-entry is needed; no archived milestone or dropped row overlaps.
- 2026-11-02: inbox sweep: 0 open issues; the 50 open pull requests read, all discovery bot entries, do not overlap.
- 2026-11-02: lessons used: 2026-10-26 (M015), 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-29 (M048), 2026-10-29 (M054), 2026-10-30 (M060), 2026-10-30 (M063), 2026-10-31 (M066, deploy).
- 2026-11-02: criteria audit: full mode, a fresh Opus reader; it returned findings on all seven criteria. All were taken: the `hidden` rule in AC1, named values and both throw sites in AC2, six states in AC3 and AC5, "sets" in place of "shows" in AC3, load, the icon mapping, and the throwing read in AC4, a real click in AC5, `documentElement` in AC6, a positive DESIGN statement in AC7, and the test sites named in T3. The answers changed no criterion.
- 2026-11-02: question set: start one Build data run by hand after the merge — yes, allowed once, as `gh workflow run build.yml --ref main`.
- 2026-11-02: plan gate chose inline scripts over an external script file because a file adds a request that can paint the wrong scheme first; falsified by a measured flash with the inline script or a page size problem from it.
- 2026-11-02: plan chose a second dark block over `light-dark()` because a browser before 2024 without that function loses every color; falsified by browser support data that makes such browsers absent, or by the blocks drifting apart despite the test.
- 2026-11-02: plan chose a script right after the button over `DOMContentLoaded` because the 800 KB home page can paint the top bar before the parse ends, and the nav links would then move; falsified by a look at the home page showing no such move.
- 2026-11-02: plan gate chose the two-state flip that returns to the system over a three-state button at the user's choice; falsified by users asking to pin the scheme that matches their system.
- 2026-11-02: T1: added `src/site/theme.ts`, `test/support/theme-page.ts`, and `test/theme.test.ts`; 27 tests pass, and three planted defects (the key, the return to the system, the `pageshow` read) failed them; the button's icon follows a `data-gives` attribute; the site test on the built scripts comes at T3.
- 2026-11-02: T2, T3: added the button inside the top bar's `nav`, so it stays beside the links when the bar wraps, with its base rule's background `--surface`, since the color test reads the pair that a rule sets together; committed together, since T2 alone fails the tests that T3 updates; `pnpm test` passes, 2000 passed and 6 skipped.
- 2026-11-02: T4: on the real site built from the deployed data (673 pages), the pane gave the expected `--bg` on the home, About, and one plugin page for all six pairs of system scheme and saved choice, at first load, after a reload, and after a click; `scrollWidth` equaled `clientWidth` in all 12 cases at 375 and 1280 px, and a planted 900 px block read 900; the moon and sun both showed, Tab reached the button with an outline in `--link`, Return flipped it, and Back to the home page showed the new scheme; no console errors. Review reruns these.
- 2026-11-02: T5: added the changelog entry, and DESIGN now names the button, `src/site/theme.ts`, the two scripts, and both dark blocks.
- 2026-11-02: claim audit: 46 claims read, 1 corrected — site/src/layouts/Base.astro.
- 2026-11-02: open concern from the claim audit: if only `setItem` throws, as on a full quota, a press works, and the next `pageshow` or `storage` event undoes it, since the read finds no saved value; the tests cover storage whose every method throws.
- 2026-11-02: left 8 simple-english hook hits in `CHANGELOG.md` lines 243 to 425 unfixed: they are older entries outside this milestone, and the new entry has none.

## Decisions

## Review

Evidence read 2026-11-02 at fd5822a, the branch level with `origin/main`; the browser checks ran on the real site built from the deployed data at that commit (673 pages).

- AC1 evidence: `test/site.test.ts` "has two classic theme scripts on every page" and "starts every page with no scheme on `<html>`…" pass over `htmlFiles(out)`, 22 fixture pages: each script tag is exactly `<script>`, one is in `<head>`, the button holds `hidden` and a script follows it at once; "hides each control's element while it has hidden" lists `[data-theme-toggle][hidden]`.
- AC2 evidence: `test/theme.test.ts` "the head theme script" passes: `light` and `dark` on both system schemes, no value, `""`, `Dark`, `system`, a throwing getter, and a throwing `getItem`, each read reached (`reads` is 1).
- AC3 evidence: `test/theme.test.ts` passes the six-state table, with `data-theme` and the saved value checked after each press, and "still flips the page" for a throwing getter and throwing methods.
- AC4 evidence: `test/theme.test.ts` passes for the label, title, and `data-gives` at load, after each press, after a system change, and after `pageshow` and `storage`, and for a throwing read at each event; `test/site.test.ts` "shows the moon when a press gives dark…" passes; pane at 375 px: the moon with saved light and the sun with saved dark, seen in screenshots.
- AC5 evidence: the "holds the same dark colors" and "sets the browser's color scheme" site tests pass; pane, on the home, About, and BetterRSS plugin pages, for all six pairs (18 cases): body background matched the expected `--bg` at load and after a reload, and a scripted `.click()` changed it to the other `--bg`; one pointer click on the plugin page also flipped it, with system dark and no saved choice, to `rgb(247, 247, 245)`, saved `light`.
- AC6 evidence: pane, 12 cases of three pages, 375 and 1280 px, saved light and dark: the button was inside the top bar, `scrollWidth` equaled `clientWidth`, and a planted 900 px block read 900; Tab reached the button with `:focus-visible` and a solid outline equal to `--link` in all 12; no console errors.
- AC7 evidence: `pnpm test` 2000 passed, 6 skipped; `pnpm check` 671 entries, 0 problems; `CHANGELOG.md` Unreleased opens with the toggle entry; `cairn/DESIGN.md` says "every page carries two classic inline theme scripts" and names `:root:not([data-theme="light"])` and `:root[data-theme="dark"]`.
- Evidence after the review fixes, at f52d8f6: `pnpm test` 2002 passed, 6 skipped; `pnpm check` 0 problems. AC1's test now also requires the button right after a link and its script right before `</nav>`. AC2 now runs each saved scheme against the opposite system. AC3's throwing-storage test now uses throwing methods, and a new test keeps a press whose save failed. AC4's throwing-read test now blocks storage after a working press. AC5's site test now compares every custom property, not only hex values. Pane on the rebuilt site: all 18 AC5 cases pass again, all 12 AC6 width and placement cases pass, and one focus case, home at 375 px in the system dark scheme, shows the outline in `--link`; the other 11 focus reads stand from fd5822a, since the fixes change no focus rule. At 200% root text, the About and plugin pages do not scroll sideways; the home page does (599 px against 375 px), with the button inside the view, from content below the top bar.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: if only `setItem` or `removeItem` throws, the next `reread` undoes a press, and `pageshow` also fires at the end of a normal load — fix now, fixed f52d8f6.
- diff-bug #2: the `storage` listener does not filter on `event.key`, so another `jmgirard.github.io` site's write runs `reread` — reject, false: a reread with the same saved value changes nothing, and a press whose save failed is now kept.
- diff-bug #3: `setBlocked` is never called, so storage that works at load and then fails at an event never runs — fix now, fixed f52d8f6.
- diff-bug #4: `colors()` sees only `#rrggbb`, so the AC5 comparison misses another value form — fix now, fixed f52d8f6.
- diff-bug #5: `if (!button) return` has no test and cannot run — fix now, removed, fixed f52d8f6.
- diff-bug #6: the icon test pins the rule's exact selector string — fix now, fixed f52d8f6.
- diff-bug #7: the color-scheme test matches source text with a fixed indent — fix now, fixed f52d8f6.
- diff-bug #8: the nav does not wrap, so the button can make it overflow at a larger text size at 375 px — fix now, `flex-wrap` added and checked at 200% text, fixed f52d8f6.
- diff-bug #9: on Safari before 14, `MediaQueryList.addEventListener` is missing, so the script throws and logs an error, and the button stays hidden — reject, edge: Safari before 14 is outside common use, and the site still follows the system setting.
- diff-bug #10: DESIGN's "under the same limit" points at a limit worded as built-ins only — fix now, fixed f52d8f6.
- diff-bug #11: a comment in `test/support/theme-page.ts` repeats the code — fix now, fixed f52d8f6.
- diff-bug #12: after a tap on a touch screen the button can keep its hover background — reject, style: no control on the site guards against this.
- diff-bug #13: the 28 px button is smaller than the 32 px pager button — reject, style: it matches the 28 px icon links in the home table and passes the 24 px minimum.
- diff-bug #14: the head test loops over a system scheme that the function never reads — fix now, fixed f52d8f6.
- diff-bug #15: the built-script test repeats one layout's scripts on all 22 pages — fix now, it runs on the home page, fixed f52d8f6.
- diff-bug #16: the press test runs "getter" and "methods" into one catch — fix now, fixed f52d8f6.
- diff-bug #17: `""`, `Dark`, and `system` run down one branch — reject, planned change: AC2 names each value.
- diff-bug #18: the first assertion of the hidden test reads only the stand-in's start value — fix now, removed, fixed f52d8f6.
- blame-history #1: a press whose save failed can be undone, the same defect as diff-bug #1 — fix now, fixed f52d8f6.
- blame-history #2: the top bar test strips the button, so no test keeps it inside the nav — fix now, fixed f52d8f6.
- blame-history #3: `??` in the inline script fails to parse before about Chrome 80, Safari 13.1, or Firefox 72, which leaves the button hidden — reject, edge: browsers from before 2020 are outside common use, and the site still follows the system setting.
- blame-history #4: `align-items: center` on the nav also centers the links — reject, false: the button makes the row taller, and centered links are the intended look, seen at 375 and 1280 px.
- prior-review #1: the button has no visible edge, against the 3:1 edge rule for controls — reject, false: the icon links in the home table, also icon-only, have no edge, and the icon itself measures 5.36:1 and 6.58:1 on `--surface`.
- prior-review #2: `aria-label` and `title` hold the same words, so a screen reader can read them twice, as M064 found for another control — follow-up, parked row "Check the theme button's double label", promote when a user reports it, since AC4 asks for both and no use is known to fail.
- ripple #1: the candidate row still says the site only follows `prefers-color-scheme` — reject, false: post-merge hygiene removes the row, which ends with `started M078`.
- ripple #2: the README's top bar list omits the button — fix now, fixed f52d8f6.
- ripple #3: the style-value test excludes only the exact selector `:root` — reject, false: the new blocks hold no such property, so the test and DESIGN do not disagree on any value.
- ripple #4: the 2026-10-30 lesson says "except built-ins", while the theme scripts also read browser globals — fix now, corrected in place, fixed f52d8f6.
- ripple #5: the comment "The script removes hidden" now covers two scripts — fix now, fixed f52d8f6.
- ripple #6: a test title says "the dark block" while two exist — reject, style: the next test compares the two blocks.
