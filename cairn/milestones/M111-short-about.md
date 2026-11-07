# M111: Shorten About in the home page's words

- **Status:** in-progress
- **Priority:** normal
- **Depends on:** M110
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the About and 404 pages' text and the maintainer docs that hold About's full rules
- **Branch/PR:** m111-short-about

## Goal

The About and 404 pages read in the home page's tone, as the short version
the user approved in the "About page (M111)" section of
`cairn/references/plain-words-copy.md`, with the full rules in docs/site.md
(D-078).

## Scope

**In:** `site/src/pages/about.astro` and `site/src/pages/404.astro` per that
copy section, with an intro link to docs/site.md on GitHub; each rule that
About drops, stated in `docs/site.md` where it is not there yet; the site
tests; DESIGN.md's and docs/site.md's descriptions of About; one Unreleased
CHANGELOG entry.

**Out:** plugin page text, which M110 holds; the badge file's text (D-071);
a shorter rewrite of docs/site.md itself, which the candidate row "Condense
the docs moved from README" holds.

## Acceptance criteria

- [ ] AC1: The built About page's `<h1>`, intro, and each section's `<h2>`
  and prose, with tags removed and spaces joined, read as the "About page
  (M111)" section of the copy file, section by section in its order, with
  each section's `id` unchanged and `{…}` filled from the code; the copy's
  directions (the title line, the id and link note, "Then:", "(a link)",
  "The category list stays as it is.", and the 404 block) are not page
  text; the category and newest-release list items are unchanged in form;
  and the removal form and license page phrases link to
  `REMOVE_PLUGIN_HREF` and `LICENSE_HREF`; as site tests show.
- [ ] AC2: The built About page's `<title>` and meta description, the
  intro's "site docs" link to
  `https://github.com/jmgirard/zotdex/blob/main/docs/site.md`, and the 404
  page's heading and text, with "See all plugins" linking home and "About
  page" linking `/about/`, read as the copy file lists, as site tests show.
- [ ] AC3: The text of the built `about/index.html` and `404.html`, with
  tags removed, holds none of "the index", "start test", and "declared
  range" in any letter case, as a site test shows.
- [ ] AC4: Reading `site/src/pages/about.astro` at the commit the M111
  branch is cut from, sentence by sentence, a file under `docs/` at the
  branch head states the rule of each sentence that the new About leaves
  out.
- [ ] AC5: Each sentence of `docs/site.md` and `cairn/DESIGN.md` at the
  branch head that says what the About page states, found by searching
  their joined text for "About", names only points that the new About
  states.
- [ ] AC6: In the browser pane at 375 px and 1280 px, the built About and
  404 pages have `documentElement.scrollWidth` equal to `clientWidth`;
  `pnpm test` passes; `CHANGELOG.md`'s Unreleased section names the About
  change.

## Coverage

- AC1 → T1, T4
- AC2 → T1, T2, T4
- AC3 → T1, T2, T4
- AC4 → T3
- AC5 → T5
- AC6 → T5, T6

## Tasks

- [x] T1: Rewrite `site/src/pages/about.astro` to the copy: title,
  description, h1, the intro with the docs link, and the 14 sections, with
  their ids, the category list, and the newest-releases list kept.
- [x] T2: Set `site/src/pages/404.astro`'s text to the copy.
- [x] T3: Read `about.astro` at the branch's cut commit sentence by
  sentence; for each sentence the new About drops, find the `docs/` text
  that states its rule (the audit found many in `docs/data.md` and
  `docs/requests.md`; bot flagging and maintainer adds were not found) or
  add it to `docs/site.md`; record the result in one work-log line.
- [x] T4: Update the About and 404 tests in `test/site.test.ts` per AC1 to
  AC3.
- [x] T5: Update DESIGN.md's and docs/site.md's descriptions of About, and
  add the CHANGELOG entry.
- [x] T6: Build the site, check AC6's widths in the browser pane, and run
  `pnpm test`.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — a change to the text of the About page, with the wording a design choice.
- 2026-11-07: idea vet: gap — the wording was open; settled with the user into `cairn/references/plain-words-copy.md`; gap — whether About keeps every rule; the user found the full rewrite too long ("the about page seems too long"), so About gives the short form and docs/site.md the full rules; no flaw.
- 2026-11-07: collision check: completes the candidate "Use plain words on plugin pages and About" with M110; D-077 kept the lock's full rule on About, and D-078 moves it to docs/site.md; D-064 and D-075's full-access warning stays in the install section; D-023's points stay, as the short About still says that a range is not a test result and that passing the startup check does not mean a plugin works; inbox sweep: 0 open issues, 14 open bot add-plugin pull requests, none overlapping.
- 2026-11-07: lessons used: 2026-10-25 (M001) pnpm via npx; 2026-10-26 (M015) serve the built site for the browser pane; 2026-10-26 (M018) search joined docs text; 2026-10-27 (M021) Astro drops the space before a link; 2026-10-28 (M036) end an Edit at a line break; 2026-10-29 (M048) iframe width check; 2026-11-07 (M109) Astro writes an apostrophe as `&#39;` in inserted text.
- 2026-11-07: question set: wording — the user approved the short About on 2026-11-07, after asking for before-and-after views, the footer's safety-or-features sentence, and a shorter page.
- 2026-11-07: plan gate chose a short About that links docs/site.md over a full About in plain words, at the user's request; falsified by visitors asking for rules that About no longer states.
- 2026-11-07: criteria audit (full mode, fresh Opus) of the first draft found the docs criterion empty, so it was dropped; the criteria changed by the question set's answers (AC1, AC2, AC4) went back to a fresh Opus reader, whose findings a follow-up plan commit takes.
- 2026-11-07: criteria re-audit (full mode, fresh Opus) returned 13 findings: AC1 separates the copy's directions from page text and names the two link targets; AC2 checks the 404 links; AC3 reads the built pages, so imported text counts; AC4 pins the cut commit and accepts any file under `docs/`; new AC5 keeps docs/site.md's and DESIGN's descriptions of About true; the copy now says "new Zotero profile" and "the tested release of each Zotero version that the plugin's own range covers", "most often up to a week old", reports "that pass the bot's checks", English read first only when the file gives several languages, "half or more", "when it has both", "a removed plugin's repository", the full License split, and no "updates this site"; the badge line had no finding; D-075's "install only plugins from developers you trust" became "look into a plugin before you trust it with your library", at the user's choice of the footer sentence.
- 2026-11-07: question set: re-audit wording — the user found the re-audit's fixes hurt the tone ("review has a tendency to ruin copywriting quality") and approved lighter lines: "clean Zotero setup, once for each Zotero version the plugin says it supports", "usually less than a week old", the two-sentence reports text, "If a plugin comes in several languages, Zotdex uses its English text", "mostly Chinese, Japanese, or Korean", "A removed plugin stays off Zotdex", and the shorter License text; the dropped detail stays in `docs/` (AC4).
- 2026-11-07: started on branch m111-short-about, cut from 65c81d34; the untracked `.claude/` folder stays unstaged.
- 2026-11-07: implementation choices: the intro link reads its address from a new `SITE_DOCS_HREF` in `site/src/data.ts`; the declared and startup marks sit in the prose as styled spans that screen readers read, and the old mark lists are gone; `[data-about] .start` replaces `.about-list .start` so a startup mark stays inline in a paragraph; Installing keeps two paragraphs; the 404 title and description stay, since the copy names neither; the newest-release item for a major with no known release reads "no known release", as the copy lists.
- 2026-11-07: T1, T2, T4 done: About and 404 follow the copy; the old wording tests in `test/site.test.ts` gave way to one test per copy section (text compared whole), the head and intro link, the two links, the 3 and 90 seconds against the code, and the AC3 phrase check on both pages; the section tests first failed on Astro joining an h2 to its paragraph, fixed in the test with `blockText`; `pnpm test` 2503 passed, `pnpm check` 0 problems.
- 2026-11-07: T3 done (delegated read: one fresh Opus reader of the cut-commit about.astro against the copy and docs/*.md): 146 sentences, 59 kept by the new About, 73 already in `docs/`, 14 added: in `docs/site.md` the manifest fields of the range, the `10.0.*` example, several categories, the "In use" column and version-over-every-version rule, why a lock or card icon leaves a plugin listed, the payment forms, "from the plugin's own text", why an unmarked plugin can cost money, and that an author can open an issue; in `docs/maintaining.md` the maintainer's mislead check with "who controls its updates"; in `docs/requests.md` "does not endorse"; in `docs/license.md` the logo's terms; checked against `usedOverride`, `overrideUsed`, and the `10.0.*` tests.
- 2026-11-07: T5 done: `docs/site.md`'s About paragraph now names the short points and drops the "In use" column, the start test as no code review, and how a maintainer adds plugins by hand; DESIGN's About note names the short form and the docs link; DESIGN's accepted icon-credit entry said About credits Lucide and Feather, which the approved copy dropped, so it now names `docs/license.md` (corrected M111); README's About line stays true and is unchanged; CHANGELOG has one Unreleased entry.
- 2026-11-07: minor amendment: T6 said "check AC5 in the browser pane", where the browser check is AC6's; the text now says AC6.
- 2026-11-07: T6 done: built the site from M110's 2026-11-07 data into the scratchpad (743 pages) and served it on port 4411; at 375 px and 1280 px, About and 404 have scrollWidth equal to clientWidth (375/375, 1280/1280); the prose marks stay inline; `pnpm test` 2503 passed, `pnpm check` 0 problems.
- 2026-11-07: claim audit: 90 claims read, 1 corrected — docs/site.md ("The declared range is" the manifest fields became "comes from", since the cell uses the range after overrides; the same reader re-read it as true); none false; on the approved About copy the reader called imprecise: the startup check runs on one tested release per version from the manifest range before corrections (the user chose the lighter line on 2026-11-07, and data.md states the detail), "90 seconds" counts from Zotero's launch, "the counts start over with each new release" can read as a Zotero release, and "a few hours" counts from a deploy; the `10.0.*` example shows ◐ when the Zotero release read fails, which the same paragraph's N.0-to-N.9 rule covers.

## Decisions
