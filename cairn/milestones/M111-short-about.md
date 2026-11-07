# M111: Shorten About in the home page's words

- **Status:** review
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

- [x] AC1: The built About page's `<h1>`, intro, and each section's `<h2>`
  and prose, with tags removed and spaces joined, read as the "About page
  (M111)" section of the copy file, section by section in its order, with
  each section's `id` unchanged and `{…}` filled from the code; the copy's
  directions (the title line, the id and link note, "Then:", "(a link)",
  "The category list stays as it is.", and the 404 block) are not page
  text; the category and newest-release list items are unchanged in form;
  and the removal form and license page phrases link to
  `REMOVE_PLUGIN_HREF` and `LICENSE_HREF`; as site tests show.
- [x] AC2: The built About page's `<title>` and meta description, the
  intro's "site docs" link to
  `https://github.com/jmgirard/zotdex/blob/main/docs/site.md`, and the 404
  page's heading and text, with "See all plugins" linking home and "About
  page" linking `/about/`, read as the copy file lists, as site tests show.
- [x] AC3: The text of the built `about/index.html` and `404.html`, with
  tags removed, holds none of "the index", "start test", and "declared
  range" in any letter case, as a site test shows.
- [x] AC4: Reading `site/src/pages/about.astro` at the commit the M111
  branch is cut from, sentence by sentence, a file under `docs/` at the
  branch head states the rule of each sentence that the new About leaves
  out.
- [x] AC5: Each sentence of `docs/site.md` and `cairn/DESIGN.md` at the
  branch head that says what the About page states, found by searching
  their joined text for "About", names only points that the new About
  states.
- [x] AC6: In the browser pane at 375 px and 1280 px, the built About and
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
- 2026-11-07: question: approved-wording fix from the claim audit — the user chose "The counts start over with each new release of the plugin" over the approved "each new release", which could read as a Zotero release; page, test, and copy file updated; the other imprecise lines stay as approved; site tests 496 passed.
- 2026-11-07: implement done, status review: `pnpm test` 2503 passed, `pnpm check` 0 problems.

## Decisions

## Review

- AC1 evidence (2026-11-07, branch head 3e4aaec1, site rebuilt to the scratchpad from the 2026-11-07 data): a scratch script parsed the copy file's "About page (M111)" section, dropped its directions, and compared the built `about/index.html`: h1 and intro, the 14 sections in order with their ids, title, and meta all match (0 problems); the same script on M110's built About gives 16 problems; site tests pass for each copy section, the section order and ids, the category list and links, the newest-release list (known 10.0.7 and no known release), and the removal form and license page links (48 About, 404, and release tests passed).
- AC2 evidence: site tests "the title, the meta description, the h1, and the intro read as the copy, and the intro links the site docs" (one link, `https://github.com/jmgirard/zotdex/blob/main/docs/site.md`, text "site docs") and the 404 test (exact text, "See all plugins" to `/`, "About page" to `/about/`) pass; the scratch script's title, meta, and 404 checks match.
- AC3 evidence: site tests "about/index.html says none of the index's old names" and the 404 one pass; on the rebuilt pages with tags removed and lowercased, "the index", "start test", and "declared range" each occur 0 times, and "zotdex" 24 times on About and 5 on 404.
- AC4 evidence: T3's fresh reader read the cut commit's about.astro (146 sentences: 59 kept by the copy, 73 in docs, 14 not); each of the 14 added rules is found once at the head (12 in docs/site.md, 1 each in docs/maintaining.md, docs/requests.md, docs/license.md); every docs line the branch removes is rewrapped with its rule kept, or is the old "The About page says" paragraph that T5 rewrote.
- AC5 evidence: every sentence of docs/site.md and cairn/DESIGN.md at the head that names "About" (11 and 14) was read with the rewritten paragraph's follow-on sentences; each one that says what About states names points the new About states (the newest releases, the category list, the install section with steps, Firefox, the full-access warning, and the bot and maintainer, the short method notes, vetting and its reason, the short license and its link, Older data, the removal form, the license page's icon credit).
- AC6 evidence: in the browser pane on the rebuilt site, About and 404 have `scrollWidth` equal to `clientWidth` at 375 px (375/375 each) and 1280 px (1280/1280 each); `pnpm test` 2503 passed, 6 skipped, 0 failed; `pnpm check` 0 problems; CHANGELOG.md's Unreleased section opens with the About entry ("The About page is now "How Zotdex works" …").
- Consistency gate: `cairn_validate.py` exit 0 (all checks passed); no DESIGN principle changed, so `cairn_impact` was skipped; the generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: the kept-record test "says on About when Zotdex keeps facts" checks static older-data prose that the copy test already compares whole — fix now, test removed, fixed bd97fac2
- diff-bug #2: the ✓ ◐ – ● ✕ marks now sit in prose with no accessible name, so a screen reader can skip the dash and never say which mark means none — fix now, each mark has `role="img"` and the name docs/site.md gives it (check mark, half circle, dash, dot, cross), with a test; visible text unchanged, fixed bd97fac2
- diff-bug #3: no test for the docs' `10.0.*` once 10.1 is out — reject (false): test/version.test.ts:135 covers `10.0.*` against 10.1.0 as "some"
- diff-bug #4: "the past 7 days" on About is not tied to `KEEP_MS` — fix now, the 3 and 90 seconds test also checks `KEEP_MS`, fixed bd97fac2
- diff-bug #5: docs/site.md's "Zotero's warning" for the install section now also covers Zotdex's own advice — reject (false): the section still gives Zotero's full-access warning, so the sentence names only what About states
- diff-bug #6: new docs lines run to about 120 columns — reject (style)
- blame-history #1: About links docs/site.md for the full rules, but the start-test schedule is in docs/data.md — fix now, docs/site.md's About paragraph names data.md's "Using the data" and "Plugin entries" and requests.md for the rules they hold, fixed bd97fac2
- blame-history #2: "the bot does not propose a removed plugin again" is not in docs/site.md — fix now with #1 (docs/requests.md states it, and docs/site.md now points there), fixed bd97fac2
- blame-history #3: no test covers the `[data-about] .start` style — reject (style): the test rules leave out cosmetic output
- prior-review #1: plugin pages link to About as "How Zotdex reads plugins", which M080 had matched to the About title, but the h1 is now "How Zotdex works" — follow-up, low row "Match About's link text and heading", as both lines are approved wording and the link still names the page's subject
- prior-review #2: "the start test is not a review of plugin code" left About and docs/site.md — reject (false): About says the check uses none of a plugin's features and Zotdex doesn't test safety, and docs/requests.md says the index does not review code
- prior-review #3: the AC3 test reads the whole page, which M080 had scoped to sections — reject (planned change): AC3 names the text of the whole built pages
- prior-review #4: DESIGN's icon-credit entry changed under its M095 acceptance — reject (false): DESIGN is current knowledge, corrected in place with its `corrected M111` mark as the record-correction rule asks
- ripple #1: same as prior-review #1 — follow-up, the same low row
- ripple #2: ROADMAP's candidate "Use plain words on plugin pages and About" still says About keeps older wording — reject (planned change): this milestone's post-merge hygiene graduates that row
- ripple #3: the copy's "The category list stays as it is." is not on the page — reject (false): AC1 names that line as a direction, not page text
- ripple #4: README says About covers "the declared range, the start tests" — reject (false): the short About still covers each named topic
- ripple #5: docs/site.md says "start test" where About says "Startup check" — reject (style): the docs use "start test" throughout and name it Zotdex's startup check
- ripple #6: About no longer explains the N.0 to N.9 count for an unknown release — reject (false): no line disagrees, and docs/site.md and DESIGN state the rule
- ripple #7: docs/site.md's "gives the reason" still holds — reject (false): reported as consistent
- snapshot: no snapshot files changed (`git diff --name-only main...HEAD` lists none under `_snaps` or `__snapshots__`)
- After the fixes: site tests 496 passed (one removed, one added); `pnpm test` 2503 passed, 6 skipped; `pnpm check` 0 problems.
