# M110: Use plain words on plugin pages

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the text of every plugin page and the home row's Older data tooltip
- **Branch/PR:** m110-plain-plugin-pages

## Goal

A plugin page's text reads in the home page's plain words, as the user
approved it in the "Plugin page (M110)" section of
`cairn/references/plain-words-copy.md` (D-078).

## Scope

**In:** every line of that copy section on the plugin page template
(`site/src/pages/plugins/[id]/index.astro`): the Older data badge title and
note, the failure line, the categories label, the buttons, the install note,
the version card, the Details card with dates in "Month D, YYYY" form, the
Corrections table, and the badge card. Also the shared words in
`site/src/data.ts` (`languagesText`, `upstreamLines`), the home row's Older
data tooltip, and About's two quotes of renamed plugin page labels. The site
tests, `docs/site.md`, DESIGN.md, and one Unreleased CHANGELOG entry follow.

**Out:** the rest of About and the 404 page's text, which M111 holds; the
badge file's text, which D-071 fixes and READMEs show; the home page's other
text, which M109 set.

## Acceptance criteria

- [x] AC1: Each line of the "Plugin page (M110)" section of
  `cairn/references/plain-words-copy.md`, except its first and last, shows
  on a built plugin page as written, with `{…}` and `<date>` filled from the
  record, on one site-test fixture record that shows it (from the shared
  fixtures or the kept-record build in `test/site.test.ts`), as site tests
  show.
- [x] AC2: The "Older data" badge of the kept record in the site test's
  kept-record build carries the copy's badge title on its home row and on
  its plugin page, with the date from its `kept.readAt` written by
  `longDay`, as a site test shows.
- [x] AC3: The built About page names "Source code in the repository's top
  folder", the "Corrections by Zotdex" table, and its "In use" column where
  it named the old labels, as a site test shows.
- [x] AC4: At the branch head, the text outside code comments of each file
  under `site/src/pages/plugins/`, `site/src/data.ts`,
  `site/src/pages/index.astro`, and `docs/site.md`, with line breaks joined
  into spaces, holds none of "Zotero compatibility", "the release the index
  read", "Release read by the index", "Declared range:", "Index categories",
  "Manifest description", "Host of update.json", "Menus and settings in",
  "Unknown (no translations found)", "Upstream value", "Override value",
  "The last build could not read", "The build that wrote this page", "Facts
  from an earlier build", "Source code at the repository's top level", and
  "the index does not review its code"; and the joined text of
  `cairn/DESIGN.md` holds none of the quoted labels "Zotero compatibility",
  "Index categories", "Menus and settings in", and "Unknown (no translations
  found)" outside a sentence that names them as earlier wording; as a search
  of those files shows.
- [x] AC5: In the browser pane at 375 px and 1280 px, the plugin page of
  `filetrans@euclpts.com` (corrections and a paid-service fact), from a site
  built from the deployed data, shows its version card, Details card, and
  Corrections table with the page's `documentElement.scrollWidth` equal to
  its `clientWidth`; `pnpm test` passes; `CHANGELOG.md`'s Unreleased section
  has one entry for the change.

## Coverage

- AC1 → T1, T2, T4
- AC2 → T1, T3, T4
- AC3 → T3, T4
- AC4 → T5
- AC5 → T6

## Tasks

- [x] T1: In `site/src/data.ts`, set `languagesText`'s fallback to "Language
  not listed" and `upstreamLines`' manifest label to "Plugin file:", add an
  Older data title helper that uses `longDay`, and use `longDay` for the
  plugin page's dates.
- [x] T2: In `site/src/pages/plugins/[id]/index.astro`, set every line of
  the copy section that AC1 names.
- [x] T3: In `site/src/pages/index.astro`, set the home row's Older data
  title from the T1 helper; in `site/src/pages/about.astro`, update the two
  quotes of renamed labels (near lines 169 and 209).
- [x] T4: Update `test/site.test.ts` per AC1 to AC3, on the shared fixtures
  and the kept-record build.
- [x] T5: Search the AC4 strings, update `docs/site.md` and DESIGN.md where
  they quote them, and add the CHANGELOG entry.
- [x] T6: Build the site from the deployed data, check AC5 in the browser
  pane, and run `pnpm test`.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — a change to the text that every plugin page visitor reads, with the wording a design choice.
- 2026-11-07: idea vet: gap — the wording was open; settled with the user over four rounds into `cairn/references/plain-words-copy.md`; gap — how far About goes; the user chose a short About with the full rules in docs/site.md (M111); no flaw.
- 2026-11-07: collision check: absorbs the candidate "Use plain words on plugin pages and About" with M111, and the parked "Name the build on the failure page" in full, since the failure line now names when this page was updated; D-037's own-grouping label kept as "Zotdex categories"; D-052's top-level meaning kept as "top folder"; D-064's install note sentence replaced by the footer's safety-or-features point (D-078); D-071's badge text unchanged; inbox sweep: 0 open issues, 14 open bot add-plugin pull requests, none overlapping.
- 2026-11-07: lessons used: 2026-10-25 (M001) pnpm via npx; 2026-10-26 (M015) serve the built site for the browser pane; 2026-10-27 (M021) Astro drops the space before a link; 2026-10-28 (M035) download the deployed data for a hand check; 2026-10-28 (M036) end an Edit at a line break; 2026-10-26 (M018) search joined docs text; 2026-10-29 (M048) iframe width check; 2026-11-07 (M109) Astro writes an apostrophe as `&#39;` in inserted text, and dates need UTC.
- 2026-11-07: question set: wording — the user approved the copy file's Plugin page and About sections on 2026-11-07, after asking for before-and-after views, the footer's safety-or-features sentence in place of "doesn't review anyone's code", and a shorter About.
- 2026-11-07: criteria audit (full mode, fresh Opus) returned 15 findings, all taken: AC1 names the kept-record build and one fixture per line with values filled; AC4 searches DESIGN's quoted labels only, exempts earlier-wording notes, and skips code comments; AC5 measures the page, on a deployed record with corrections and a paid fact; the copy's range line says "Supported versions:", the reports rule names the major version, "a 10.0 release", "no known release", and the badge title says "in its latest update"; M111's empty docs criterion was dropped.
- 2026-11-07: plan gate chose two milestones (plugin pages, then About) over one because the two pages ship apart and one would pass the criteria tripwire; falsified by M111 needing to undo M110 text.
- 2026-11-07: implement started on m110-plain-plugin-pages; the untracked `.claude/` folder is unrelated and stays unstaged.
- 2026-11-07: T1 to T4 landed in one commit, since the new words fail the old expectations until the tests change; `keptTitle` in `site/src/data.ts` gives both Older data titles; the unused `day()` helper is gone; `longDay` on a paid fact's `read` relies on the schema's YYYY-MM-DD pattern; new tests cover the version table's headers, the Corrections text and headers, the badge card text, the "Supported versions:" line, and About's three label quotes; `pnpm test` 2515 passed, `pnpm check` 741 entries, 0 problems.
- 2026-11-07: the M109 lesson on `&#39;` holds for inserted text but not for an attribute: a `title={…}` value keeps a raw apostrophe in the built page.
- 2026-11-07: T5: updated `docs/site.md` (languages, categories, links, install note, version card, Details, Corrections, source label) and DESIGN.md's plugin page and About lines; added the CHANGELOG entry; the AC4 joined-text search over 4 files hits only DESIGN's "named … before M109" note; `pnpm test` 2515 passed.
- 2026-11-07: T6: built 743 pages from the deployed `v1/plugins.json`; in the browser pane, `filetrans@euclpts.com` at 375 px and 1280 px shows "Zotero versions", "Details", and "Corrections by Zotdex" with `documentElement.scrollWidth` equal to `clientWidth` (375, 1280); a planted 900 px div made it 900, so the check can fail.
- 2026-11-07: claim audit: 83 claims read, 1 corrected — `site/src/pages/plugins/[id]/index.astro`, `CHANGELOG.md`, `test/site.test.ts`; "Updates come from" became "Checks for updates at", since `updateHost` is the `update_url` host and the update file can download elsewhere; the "couldn't reach" Older data wording stays to match the approved home legend; both at the user's choice, shown old line, problem, and new line per CLAUDE.md.
- 2026-11-07: step-7 approval: m110-plain-plugin-pages approved for merge

## Decisions

## Review

- AC1: `pnpm test` at 14444191, 2515 passed, 6 skipped. Each copy line has a passing site test on a fixture record: the kept note (kept-record build), the failure line ("shows the table of %s"), "Zotdex categories" and the buttons ("opens the main content of %s"), the install note, "Zotero versions" and its line under it, the headers ("names the table's columns"), the cells (`expectedRows`, the extra-majors test), "Supported versions:" (the About-link test), the report line and buttons, every Details label and value (the Details list test, the paid, archived, source, repository, prerelease, and languages tests), the Corrections heading, text, headers, and "Plugin file:" lines, the two owner links, and the badge card text.
- AC2: vitest by name at 14444191, passed: "a kept record > shows the row … plus an Older data badge" asserts the home row's badge title "Zotdex couldn't reach this plugin in its latest update, so these facts are from <date>", the date being the fixture `readAt` 2026-11-03 written by `longDay`, and "says on the plugin page that the build …" asserts the same badge in the plugin page's h1.
- AC3: vitest by name at 14444191, passed: "the About page > says which user reports count, …" asserts About's "Corrections by Zotdex" table sentence, its "In use" column sentence, and "Source code in the repository's top folder".
- AC4: a node script (scratchpad `ac4.mjs`) joins each file's lines, drops `//` comments, and searches the 4 files (`site/src/pages/plugins/[id]/index.astro`, `site/src/data.ts`, `site/src/pages/index.astro`, `docs/site.md`) for the 16 strings, and DESIGN's joined text for the 4 quoted labels: at 14444191, 1 hit, DESIGN's "(named "Menus and settings in" before M109)", an earlier-wording sentence the criterion exempts; the same script on main's files finds 28 hits, so it can fail.
- AC5: site rebuilt at 14444191 from the deployed `v1/plugins.json` (743 pages); in the browser pane, `filetrans@euclpts.com` in 375 px and 1280 px iframes shows the version card, Details card, and Corrections table, with `documentElement.scrollWidth` 375 and 1280 equal to `clientWidth` (T6's planted 900 px div showed the check can fail); `pnpm test` 2515 passed (AC1 run); `CHANGELOG.md` Unreleased has one entry for the change, its first bullet.
- Consistency gate: `cairn_validate.py` all checks passed (after rewording one Review line that quoted a long-form date); no principle changed, so no `cairn_impact`; the generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- blame-history #1: "Languages" drops M033's "Menus and settings in" purpose and leaves the home menu on the old name — reject (planned change and false: the approved copy names "Languages", and M109 renamed the home menu "Language")
- blame-history #2: "Supports" and "Supported versions" drop the plugin page's "declared, not a test result" framing — reject (planned change: approved copy; D-077 moved that point to About, which keeps it)
- blame-history #3: "Language not listed" drops M036's "no translations found" meaning — reject (planned change: approved copy)
- blame-history #4: About still says "install only plugins from developers you trust" while the plugin page uses the new sentence — follow-up: M111, whose approved About install section uses the new sentence
- blame-history #5: the Older data note no longer says "earlier build" — reject (planned change: approved copy; the badge and the two dates still mark the facts as older)
- prior-review #1: About's install section still says the index does not review a plugin's code, which D-078 retires — follow-up: M111 (D-078 states the end state after M111)
- prior-review #2: the plugin page and About disagree on "doesn't test plugins' safety or features" against "does not review their code" — follow-up: M111
- prior-review #3: About and `docs/site.md` say "top level" while the label says "top folder" — reject (false: both state the same fact, and neither line quotes the label; About's wording is M111's)
- prior-review #4: About's headings "Overrides" and "Start test" differ from the plugin page — follow-up: M111
- prior-review #5: DESIGN's Known issues entry names the "Overrides cell" and a bare `Manifest:` — fix now, fixed 51b723de
- prior-review #6: the Older data badge's new `title` repeats visible text — reject (false: the title adds the reason and the date, not the badge's words, and the home badge carried a title before M110)
- prior-review #7: "Language not listed" replaces M036's wording — reject (planned change: approved copy)
- ripple #1: About's h1 "How the index reads plugins" differs from the plugin page's link text "How Zotdex reads plugins" — follow-up: M111, whose approved h1 is "How Zotdex works"
- ripple #2: `.github/ISSUE_TEMPLATE/text-change.yml` names the plugin page's "Overrides table" — fix now, fixed 6a0fd341
- ripple #3: About's h2 "Overrides" names the old table heading — follow-up: M111
- ripple #4: `docs/requests.md` names the plugin page's "Overrides table" — fix now, fixed 6a0fd341
- ripple #5: the ROADMAP row "Use plain words on plugin pages and About" still lists plugin page labels and the home tooltip — reject (false as a defect: post-merge hygiene narrows that row to About, its remainder in M111)
- ripple #6: the parked ROADMAP row "Name the build on the failure page" quotes the old failure text — reject (false as a defect: M110 absorbs that row, and post-merge hygiene removes it)
- ripple #7: `docs/site.md` does not give the two description labels — fix now, fixed 6a0fd341
- ripple #8: `docs/site.md` and About describe the Corrections rows as "the manifest description and the GitHub description" — fix now in `docs/site.md` (the "Plugin file:" and "GitHub:" lines), fixed 6a0fd341; About's line is M111's
- ripple #9: About and `docs/requests.md` say the index "does not review their code", unlike the install note's safety-or-features sentence — reject (false: both statements are true, and About's wording is M111's)
- ripple #10: a test title still says "the Used column" — fix now, fixed 6a0fd341
- ripple #11: `docs/site.md` and About say "top level" while the label says "top folder" — reject (false: same fact, and neither line quotes the label)
- ripple #12: the issue forms label the field "Plugin id" where the page now says "Plugin ID" — reject (style: letter case on separate GitHub forms)
- diff-bug #1: `longDay` prints "Invalid Date" for `repoCreatedAt` or `latestReleaseDate` text that is not a date, where `day()` sliced it — fix now (`longDay` falls back to the first 10 characters, with a test that fails on the unfixed helper), fixed 6a0fd341
- diff-bug #2: the badge text check runs on every built page through one code path — fix now (moved to one page), fixed 6a0fd341
- diff-bug #3: "leaves the old languages label off every plugin page" checks only "Interface languages:" — fix now (also checks "Menus and settings in"), fixed 6a0fd341
- diff-bug #4: a test comment restates the fixture's `generatedAt` — fix now (removed), fixed 6a0fd341
- diff-bug #5: `keptTitle` has no direct test — reject (false: a site helper, covered by the kept-record tests, and "What gets a test" tests internal helpers indirectly)
- diff-bug #6: the h1 badge regex treats the badge text's dots as wildcards — fix now (a contains check on the h1), fixed 6a0fd341
- diff-bug #7: "couldn't reach" is loose for a time-limit failure — reject (planned change: the user kept it to match the home legend after the claim audit)
- diff-bug #8: About still says "declared range" — follow-up: M111
- diff-bug #9: one reflowed About line is 135 characters — reject (style)
- After the fixes: `pnpm test` 2517 passed, 6 skipped; `pnpm check` 0 problems.
