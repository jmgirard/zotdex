# M109: Make the home page a field guide

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the home page's text, every page's footer and top bar, and shared tooltip words
- **Branch/PR:** —

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
  past week"; lock "Source code not found in its repository"; card "Needs a
  paid account or subscription from its maker"; ● "Passed Zotdex's startup
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

- [ ] AC1: The built home page holds exactly one `<h1>`, reading the copy
  block's heading, and its intro paragraph, with tags removed and spaces
  joined, reads the copy block's intro, as site tests show.
- [ ] AC2: The built home page's legend lists the copy block's nine entries
  in order and nothing else, and each row's lock and card marks carry the
  same text as their legend entries in title and hidden text, as site tests
  show.
- [ ] AC3: The built home page's control labels, sort options, table
  headers, and row tooltips (the `<range>` being `rangeText`'s output), and
  the home script's empty-result text, read as the copy block lists, and
  each start mark's hidden text equals its title, as site tests and
  `test/home-filter.test.ts` show; a built plugin page's start cells read
  "Loaded", "Failed to load", "Didn't install", and "Didn't finish loading"
  for started, start-error, not-installed, and timed-out, and its support
  and stars tooltips read as the home ones.
- [ ] AC4: Every built page's footer reads the copy block's four footer
  lines, with the test build's date, 2026-10-25 in UTC, written as the
  month's English name, the day, a comma, and the year after "Updated ",
  and its top bar holds one link to `https://github.com/jmgirard/zotdex`
  labeled "Zotdex on GitHub", as a site test over the build's page walk
  shows.
- [ ] AC5: The built home page's `<title>`, `og:title`, meta description, and
  `og:description` read as the copy block lists, as a site test shows.
- [ ] AC6: `git grep -n -F` at the branch head over `site/src/`, `src/site/`,
  `docs/site.md`, and `README.md`, for each of "Plugins for Zotero 7 and
  later", "a Zotero plugin index", "Declares all of Zotero", "Declares part
  of Zotero", "Does not declare Zotero", "GitHub Star", "failed at startup",
  "did not install", "gave no answer in time", "No plugins match these
  filters", "Menus and settings", "All languages", "Declares Zotero",
  "cannot vet the plugins", "The data comes from the build of", "Data
  file:", "No mark:", and "Started in the start test", lists no line.
- [ ] AC7: In the browser pane at 375 px and 1280 px, the built home page's
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

- [ ] T1: In `site/src/pages/index.astro`, set the heading, intro, controls,
  table headers, legend, `<title>`, and description to the copy block; drop
  the `DISCLAIMER` import there.
- [ ] T2: In `site/src/data.ts` and `src/site/home-filter.ts`, set
  `supportText`, `START_WORDS`, the start tooltip and hidden-text prefix,
  `starsText`, `PAID_SERVICE_TEXT`, `NoSourceMark`'s text, and the
  empty-result text to the copy block.
- [ ] T3: In `site/src/data.ts` and `site/src/layouts/Base.astro`, set
  `DISCLAIMER` and the footer lines, format the build date as "Month D,
  YYYY", and add the GitHub mark (Lucide's path, in `Icon.astro`) to the top
  bar and the footer link.
- [ ] T4: Update `test/site.test.ts` and `test/home-filter.test.ts` to the
  copy block per AC1 to AC5.
- [ ] T5: Grep every replaced string (AC6) and update `docs/site.md`,
  DESIGN.md, and README.md where they quote it; add the CHANGELOG entry.
- [ ] T6: Build the site, check the AC7 views in the browser pane, run
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

## Decisions

## Review
