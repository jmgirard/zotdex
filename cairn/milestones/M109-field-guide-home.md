# M109: Make the home page a field guide

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the home page's text, every page's footer and top bar, and shared tooltip words
- **Branch/PR:** m109-field-guide-home

## Goal

The home page's text reads for people, as the user approved it word by word
in the copy block below, and every page links to Zotdex's GitHub repository
(D-075).

## Scope

**In:** the copy block below, on the home page (heading, intro, controls,
table, row tooltips, legend, `<title>`, meta description), every page's
footer, and a GitHub link in every page's top bar and footer; the shared
words in `site/src/data.ts` (`DISCLAIMER`, `supportText`, `START_WORDS`,
`starsText`, `PAID_SERVICE_TEXT`) and `NoSourceMark`'s text, so plugin pages
show the same tooltip, mark, and start-result words; the tests,
`docs/site.md`, DESIGN.md, and one Unreleased CHANGELOG entry.

Copy block (approved 2026-11-07):
- Heading: "Your field guide to Zotero plugins"
- Intro: "Zotero can do a lot more with the right plugins. Browse hundreds of
  them, from AI assistants and translation tools to better ways to read PDFs
  and take notes. Each entry tells you what a plugin does, who makes it, and
  which Zotero versions it supports. Zotdex is independent and unofficial,
  and it doesn't review anyone's code, so look into a plugin before you trust
  it with your library. How to install a plugin." (the last phrase links to
  `/about/#installing`)
- Controls: language filter "Language" / "Any language"; version buttons
  "Supports Zotero" / "Any 7 8 9 10"; sort "Most stars", "Name", "Recently
  updated"; empty result "No plugins match. Try removing a filter."
- Table headers: "Supports Zotero"; "Languages"
- Tooltips: "Supports Zotero N"; "Supports some of Zotero N (<range>)";
  "Doesn't support Zotero N"; "Startup check: loaded in Zotero <v>" and
  "failed to load", "didn't install", "didn't finish loading" for the other
  results; "<n> stars on GitHub" ("1 star on GitHub")
- Legend: ✓ "Supports this version of Zotero"; ◐ "Supports some releases of
  this version"; – "Doesn't support this version"; Older data "Zotdex
  couldn't reach this plugin today, so this row shows what it found in the
  past week"; lock "No obvious source code in its repository"; card
  "Requires paying its maker"; ● "Passed Zotdex's startup
  check: it installs and loads, but its features aren't tested"; ✕ "Failed
  Zotdex's startup check: it didn't install or load"; ★ "GitHub stars. The
  list is sorted by stars, which shows popularity (not necessarily
  quality)." No "No mark" entry, no declared-range sentence.
- Footer: "Zotdex is an independent project, not part of Zotero, and it
  doesn't test the safety or features of the plugins it lists."; "Updated
  <Month D, YYYY>." from the build date; "Get all the data as JSON" (links
  to `v1/plugins.json`); "Zotdex on GitHub" (links to the repo)
- Top bar: a GitHub mark beside the theme button, linking to
  `https://github.com/jmgirard/zotdex`, labeled "Zotdex on GitHub"
- `<title>`: "Zotdex: your field guide to Zotero plugins"; meta description:
  "Your field guide to Zotero plugins: browse hundreds of them and see what
  each one does, who makes it, and which Zotero versions it supports."

**Out:** other text on plugin pages and About (headers such as "Start test",
the Details card, and "Language not listed", which shows only there), which
the row "Use plain words on plugin pages and About" holds; real trust
signals for plugins, set aside by the user.

## Acceptance criteria

- [x] AC1: The built home page holds exactly one `<h1>`, reading the copy
  block's heading, and its intro paragraph, with tags removed and spaces
  joined, reads the copy block's intro, as site tests show.
- [x] AC2: The built home page's legend lists the copy block's nine entries
  in order and nothing else, and each row's lock and card marks carry the
  same text as their legend entries in title and hidden text, as site tests
  show.
- [x] AC3: The built home page's control labels, sort options, table
  headers, and row tooltips (the `<range>` being `rangeText`'s output), and
  the home script's empty-result text, read as the copy block lists, and
  each start mark's hidden text equals its title, as site tests and
  `test/home-filter.test.ts` show; a built plugin page's start cells read
  "Loaded", "Failed to load", "Didn't install", and "Didn't finish loading"
  for started, start-error, not-installed, and timed-out, and its support
  and stars tooltips read as the home ones.
- [x] AC4: Every built page's footer reads the copy block's four footer
  lines, with the test build's date, 2026-10-25 in UTC, written as the
  month's English name, the day, a comma, and the year after "Updated ",
  and its top bar holds one link to `https://github.com/jmgirard/zotdex`
  labeled "Zotdex on GitHub", as a site test over the build's page walk
  shows.
- [x] AC5: The built home page's `<title>`, `og:title`, meta description, and
  `og:description` read as the copy block lists, as a site test shows.
- [x] AC6: `git grep -n -F` at the branch head over `site/src/`, `src/site/`,
  `docs/site.md`, and `README.md`, for each of "Plugins for Zotero 7 and
  later", "a Zotero plugin index", "Declares all of Zotero", "Declares part
  of Zotero", "Does not declare Zotero", "GitHub Star", "failed at startup",
  "did not install", "gave no answer in time", "No plugins match these
  filters", "Menus and settings", "All languages", "Declares Zotero",
  "cannot vet the plugins", "The data comes from the build of", "Data
  file:", "No mark:", and "Started in the start test", lists no line other
  than "Menus and settings" in `site/src/pages/plugins/[id]/index.astro`,
  "cannot vet the plugins" in `site/src/pages/about.astro`, and
  `docs/site.md` lines that quote those two, which Out keeps.
- [x] AC7: In the browser pane at 375 px and 1280 px, the built home page's
  heading, footer, and GitHub links, and one plugin page's footer and
  GitHub links, are visible, with `scrollWidth` equal to `clientWidth`;
  `pnpm test` passes; `CHANGELOG.md` has one Unreleased entry for the
  change.

## Coverage

- AC1 → T1, T4
- AC2 → T1, T4
- AC3 → T1, T2, T4
- AC4 → T3, T4
- AC5 → T1, T4
- AC6 → T5
- AC7 → T5, T6

## Tasks

- [x] T1: In `site/src/pages/index.astro`, set the heading, intro, controls,
  table headers, legend, `<title>`, and description to the copy block; drop
  the `DISCLAIMER` import there.
- [x] T2: In `site/src/data.ts` and `src/site/home-filter.ts`, set
  `supportText`, `START_WORDS`, the start tooltip and hidden-text prefix,
  `starsText`, `PAID_SERVICE_TEXT`, `NoSourceMark`'s text, and the
  empty-result text to the copy block.
- [x] T3: In `site/src/data.ts` and `site/src/layouts/Base.astro`, set
  `DISCLAIMER` and the footer lines, format the build date as "Month D,
  YYYY", and add the GitHub mark (Lucide's path, in `Icon.astro`) to the top
  bar and the footer link.
- [x] T4: Update `test/site.test.ts` and `test/home-filter.test.ts` to the
  copy block per AC1 to AC5.
- [x] T5: Grep every replaced string (AC6) and update `docs/site.md`,
  DESIGN.md, and README.md where they quote it; add the CHANGELOG entry.
- [x] T6: Build the site, check the AC7 views in the browser pane, run
  `pnpm test`.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — a change to the text that every visitor to the home page reads, with the wording a design choice.
- 2026-11-07: idea vet: gap — the wording was open; settled with the user over several rounds into the copy block; gap — the user asked how a visitor would know which plugins to trust; the user set trust signals aside; no flaw.
- 2026-11-07: collision check: D-051 and D-064 put the shared disclaimer in the home intro and footer, and D-069 set the home title; D-075 in this plan annotates all three; inbox sweep: 0 open issues, no overlapping pull request.
- 2026-11-07: lessons used: 2026-10-25 (M001) pnpm via npx; 2026-10-26 (M015) serve the built site for the browser pane; 2026-10-27 (M021) Astro drops the space before a link; 2026-10-28 (M035) download the deployed data for a hand check; 2026-10-28 (M036) end an Edit at a line break; 2026-11-06 (M108) full-size zoom of a wide layout.
- 2026-11-07: plan widened before implement at the user's request ("widen M109 to do all of this"): from the heading and intro to the whole home page's text, the footer, shared tooltip words, and a GitHub link; 7 criteria, at the split line, kept as one milestone at the user's request.
- 2026-11-07: question set: home copy — the copy block, approved line by line by the user in chat.
- 2026-11-07: criteria audit (full mode, fresh Opus) of the widened criteria returned 8 findings, all taken: "Language not listed" shows only on plugin pages, so it moved to Out; AC2 covers the lock and card marks' shared text; AC3 pins the hidden start text, the plugin page's start cells, and `rangeText`; AC4 names the fixture date; AC6 lists the exact old strings and greps `site/src/`, `src/site/`, `docs/site.md`, and README.md; AC7 names what must be visible.

- 2026-11-07: implement started on m109-field-guide-home, cut from main at cefc5ba6; status in-progress.
- 2026-11-07: user rule for review: the copy block is the user's approved wording and no reviewer or fix may change it; a finding that some copy is false goes to the user, never to a rewording on the branch; reviewers are told so.
- 2026-11-07: T2/T3 choices: `NO_SOURCE_TEXT` joins `PAID_SERVICE_TEXT` in `data.ts` so the lock mark and its legend line share one string; the top bar reuses the `source` icon, which is already Lucide's GitHub mark; `longDay` formats the footer date in UTC; `day` stays for its other uses.
- 2026-11-07: T1 to T5 done: home page, shared words, footer, top bar link, tests, docs/site.md, DESIGN.md, CHANGELOG; site and home-filter tests 619 passed; a plant that removed the top bar's GitHub link failed "puts the top bar and the footer on every page"; Astro escapes an apostrophe in an inserted expression (`&#39;`) but not in template text, so tests compare unescaped text where an expression writes it.
- 2026-11-07: substantive amendment: AC6 now allows "Menus and settings" in the plugin page, "cannot vet the plugins" on About, and docs/site.md lines that quote those two, which Out keeps; the first wording listed them as failures. Wording only; what users see is unchanged.
- 2026-11-07: re-audit: AC6 (full) — the first carve-out exempted whole files, which would hide stale strings on plugin pages; narrowed to the two strings and the docs lines that quote them, as written.
- 2026-11-07: style-hook hits in docs/site.md and CHANGELOG.md left in place at the user's direction to set Simplified English aside.
- 2026-11-07: claim audit: 45 claims read, 6 corrected — the lock text overstated the top-level check and the card text missed plugins sold by code, both put to the user, who chose "No obvious source code in its repository" and "Requires paying its maker" (substantive amendment: the copy block's lock and card lines, at the user's choice); a stale `DISCLAIMER` comment in data.ts, "Menus and settings" and "Stars" in docs/site.md, home-filter.ts, and DESIGN.md, and DESIGN's control names fixed — site/src/data.ts, docs/site.md, src/site/home-filter.ts, cairn/DESIGN.md
- 2026-11-07: claim audit re-read at 3708f0ed: all 6 corrected claims hold; status review; handed to /milestone-review.
- 2026-11-07: verify clean at 28520878: `pnpm test` 37 files passed, 1 skipped, 2511 tests passed, 6 skipped; `pnpm check` 741 entries, 0 problems; a build from the deployed data viewed at 1024 and 375 px, home and plugin page, scroll width equal to client width, no console errors; the user looked at the preview and said "Looks good, review it"; T1 to T6 ticked; claim audit running.

## Decisions

## Review

- AC1 evidence (2026-11-07, head 9cc2984b): `pnpm test` 37 files passed, 1 skipped, 2512 tests passed, 6 skipped; "gives the home page one h1, its field guide heading" (counts `/<h1[\s>]/g` once) and "says what Zotdex is for in the home intro…" (the copy block's intro, joined) passed.
- AC2 evidence: "names each declared mark and each start mark in a legend under the table…" passed, matching the nine entries in order, the stars entry now exactly; "marks a repo with no source" and the paid mark tests passed with `NO_SOURCE_TEXT` and `PAID_SERVICE_TEXT` as title and hidden text.
- AC3 evidence: the version-cell tests (title and hidden text both the copy block's words, `rangeText` in the part form), "shows the newest start result…", the sort, language, and version control tests, `test/home-filter.test.ts` "says the count when a filter hides every row", the compatibility table tests ("Loaded", "Failed to load", "Didn't install", "Didn't finish loading"), and "shows the repository facts" passed.
- AC4 evidence: "puts the top bar and the footer on every page" (the build walk, ids + 3 files) passed with the four footer lines, the fixture's 2026-10-25 written out after "Updated ", and the top bar's GitHub link; a plant that removed the link failed it; "writes the footer's day in UTC…" passed, and in America/Los_Angeles `longDay("2026-10-26T02:00:00Z")` still names the 26th.
- AC5 evidence: "calls the home page a field guide in its title, description, and their link-preview tags" passed.
- AC6 evidence: the 18-string `git grep -n -F` at 9cc2984b listed only "Menus and settings" at plugins/[id]/index.astro:345, "cannot vet the plugins" at about.astro:287, and docs/site.md:282 and :302, which quote those two.
- AC7 evidence: a build of 9cc2984b from the deployed data; in the browser pane at 375 and 1280 px (1280 in a same-origin frame), the home page's heading, footer, and both GitHub links and the plugin page's footer and both links are visible, `scrollWidth` equal to `clientWidth` on all four; `pnpm test` as AC1; CHANGELOG has one Unreleased entry for the change.
- gate: `cairn_validate.py` all checks passed; `pnpm check` 741 entries, 0 problems; profile `generic`, no toolchain checks; no principle changed.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: docs/site.md quoted the start cell as "Started Zotero 10.0.6" — fix now, fixed 9cc2984b
- diff-bug #2: AC7 evidence lacked 1280 px — reject (false): recorded at 1280 above
- diff-bug #3: the legend's stars entry was checked by substring — fix now, fixed 9cc2984b
- diff-bug #4: `longDay` writes "Invalid Date" for an unparsable timestamp — reject (edge): only a `generatedAt` that the build itself wrote reaches it
- diff-bug #5: the footer tests could not catch a dropped UTC option — fix now, fixed 9cc2984b
- diff-bug #6: the top bar's GitHub link had no focus ring or hover background — fix now, fixed 9cc2984b
- diff-bug #7: the home Older data badge's tooltip keeps the old register — follow-up, added to "Use plain words on plugin pages and About" (normal), since the copy block did not include it
- diff-bug #8: the cell tests unescape before comparing — reject (false): equality after one unescape still catches a wrong or double escape
- diff-bug #9: the GitHub anchor is checked on every page — reject (planned change): AC4 names the page walk
- blame-history #1: the stars line drops D-065's "neither is a review" — fix now on the record, D-077, fixed 9cc2984b; the copy stays the user's
- blame-history #2: the lock text drops D-052's "at the top level" — fix now on the record, D-077, fixed 9cc2984b; the user chose this text after the claim audit
- blame-history #3: the ✕ legend no longer names a time-out — reject (false): "didn't … load" covers "didn't finish loading"
- blame-history #4: the legend drops D-023's declared-range note — fix now on the record, D-077, fixed 9cc2984b; the user approved the legend without it
- blame-history #5: "couldn't reach this plugin today" for any D-066 build-level failure — fix now on the record, D-077, fixed 9cc2984b
- blame-history #6: DESIGN and docs still name "Menus and settings in" — reject (false): those lines describe the plugin page fact, which Out keeps
- prior-review #1: the sixth top bar item may move the wrap point — follow-up, new row "Check the top bar and controls at mid widths" (parked, promote when a user reports it), quoting "Tighten the home controls at larger text"
- prior-review #2: longer sort options at 761 and 1001 px — follow-up, same row
- prior-review #3: the declared-range legend note was deleted — reject (planned change): the user approved the legend without it; D-077 records it
- prior-review #4: the start mark's hidden text repeats its title — reject (planned change): AC3 asks for the two to be equal
- ripple #1: About still defined the start results with the old words — fix now, fixed 9cc2984b
- ripple #2: docs/site.md's "Started Zotero 10.0.6" — fix now, fixed 9cc2984b (same as diff-bug #1)
- ripple #3: docs/site.md's "no plugins match these filters" — fix now, fixed 9cc2984b
- ripple #4: README.md line 6 keeps its own unofficial / cannot vet sentence — reject (false): it states the same facts in its own words and is not the footer
- ripple #5: docs/site.md:20 describes the lock as "top level" — reject (false): it describes the check, which is top level
- ripple #6: the card mark's meaning in docs and DESIGN — reject (false): the lens found no conflict
- ripple #7: "Stars" in a data.ts comment and a home-filter test name — fix now, fixed 9cc2984b
- ripple #8: the 2026-10-29 mockup shows the old heading — reject (false): a dated design record
- conversation: no PR yet, so no PR-conversation read
- snapshot: no `_snaps` or `__snapshots__` path in `git diff --name-only origin/main...HEAD`
