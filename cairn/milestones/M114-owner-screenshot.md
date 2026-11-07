# M114: Let a plugin's owner add a screenshot

- **Status:** review
- **Priority:** normal
- **Depends on:** M113
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — owners gain a request form and plugin pages show the screenshot
- **Branch/PR:** m114-owner-screenshot, https://github.com/jmgirard/zotdex/pull/863

## Goal

A plugin's repository owner can ask for one screenshot through an issue form, the maintainer checks and applies it
with `pnpm screenshot-request`, and the plugin page shows it under the icon.

## Scope

**In:** a `screenshot` label and issue form; `pnpm screenshot-request` with the text request's owner check, image
download and checks, `--file`, `--apply`, and removal; `plugins/<id>/screenshot.webp` and `index.json`'s
`screenshot`; `pnpm check` rules; the build's `v1/screenshots/<sha>.webp` and the record's `screenshot`; the page
head's right column with the icon above the screenshot; the approved lines; docs, a D-entry, DESIGN, and CHANGELOG.

**Out:** more than one screenshot (the user chose one); a bot that answers requests → the parked row "Let a bot
check text requests at once" holds the same idea for text; icons → M113.

## Acceptance criteria

- [x] AC1: The repo has a `screenshot` label, and `.github/ISSUE_TEMPLATE/screenshot.yml` adds a form with that
      label and the fields Plugin id, Screenshot (an image attached to the issue), and Description of the
      screenshot; each plugin page links to it with the plugin id filled in, which a site test checks.
- [x] AC2: `pnpm screenshot-request <issue> --data <file>` reads an open issue labeled `screenshot` and runs the same
      owner check as `pnpm text-request`. A Screenshot field that is blank or `_No response_` makes the request a
      removal, and the description is then ignored. Otherwise it exits 1 naming the problem when the field holds no
      image link or more than one; when the link or any redirect leaves the hosts in `SCREENSHOT_HOSTS`; when the
      download passes 10 MiB; when the bytes are not PNG, JPEG, or WebP; when sharp's metadata gives a width or
      height over 8000 px; or when `textProblems("description", text, shownName)` refuses the description. One
      test for each problem named here, with recorded responses.
- [x] AC3: With `--apply`, the command re-encodes the image with sharp as WebP, fit within 1600×2400 px with no
      metadata, exits 1 and writes nothing when the result is over 1 MiB, and otherwise writes
      `plugins/<id>/screenshot.webp` and sets `index.json`'s `screenshot` to the description and a reason naming
      the issue; a removal deletes both. `--file <path>` replaces only the download, and every other check of AC2
      still runs. Tests cover apply, the over-1 MiB result, removal, and `--file`.
- [x] AC4: `schemas/index.v1.schema.json` defines the optional `screenshot` object, and `pnpm check` fails an entry
      when `index.json` names a screenshot and `screenshot.webp` is missing, when `screenshot.webp` exists and
      `index.json` names none, or when the file is not WebP, is wider than 1600 px or taller than 2400 px, or is
      over 1 MiB. Schema tests pass with and without the field, and one check test covers each failure.
- [x] AC5: `pnpm build` copies each entry's screenshot to `v1/screenshots/<sha>.webp`, `<sha>` the SHA-256 of its
      bytes, and sets the record's optional `screenshot` to `{ "file": "screenshots/<sha>.webp", "alt": "<text>" }`;
      `schemas/plugins.v1.schema.json` defines the field, and the schema test passes with and without it.
- [x] AC6: The plugin page of a record with `screenshot` shows one `<a data-screenshot>` whose `href` is
      `${BASE}v1/` followed by `screenshot.file`, holding an `<img>` whose `alt` is `screenshot.alt`. At viewport
      widths of 1024 px and 1280 px, the image's left edge is right of the right edge of each head text element
      the page has (`h1`, repo line, description, categories, `.actions`), its right edge is within `.page-head`'s,
      and its top is below the icon tile's bottom, or within 1 px of the `h1`'s top when the record has no icon. At
      375 px and 1000 px it comes after `.actions` and before `.install-note`, or before the version card when the
      page has no install note, no wider than the page's content box, and the page has no horizontal scroll at
      375 px. A browser-pane look in the Review checks these with one wide and one tall image; site tests check the
      attributes and the element order. A record without the field has no `[data-screenshot]` element.
- [x] AC7: Each line that `cairn/references/plain-words-copy.md` records for M114 appears word for word on the
      built site (the plugin page's owner line, the About section "Icons and screenshots", and the license line);
      `docs/requests.md` documents the form and the command, `docs/data.md` the two `screenshot` fields, and
      `docs/license.md` says screenshots keep their owners' terms.
- [x] AC8: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T2, T8, T9
- AC3 → T3, T8, T9
- AC4 → T4
- AC5 → T5
- AC6 → T6
- AC7 → T1, T7
- AC8 → T1, T2, T3, T4, T5, T6, T7, T8, T9

## Tasks

- [x] T1: Run `gh label create screenshot` (granted at the question set); add `screenshot.yml` after
      `.github/ISSUE_TEMPLATE/text-change.yml`, a `screenshotHref` beside `textChangeHref` (`site/src/data.ts:220`),
      and the approved owner line at `site/src/pages/plugins/[id]/index.astro:388`, with a site test.
- [x] T2: Add `src/screenshot-request/` on the shape of `src/text-request/` (`request.ts` :72-148, `parse.ts`):
      reuse the owner check, find image links in the field, and download with a host check on each redirect and a
      byte cap (export `downloader` and `readCapped` from `src/upstream/reader.ts`, or share them); check the
      format by magic bytes and the size by sharp's metadata; tests with recorded responses
      (`test/support/fixture-fetch.ts`).
- [x] T3: Add `--apply`, removal, and `--file` to the command, re-encoding with sharp; tests.
- [x] T4: Add `screenshot` to `schemas/index.v1.schema.json` and the file rules to `src/check/check.ts` (`checkEntry`
      :143 reads only the two JSON files today); tests.
- [x] T5: Copy screenshots in `src/build/build.ts` `writeData` and add the record field and plugins.v1 schema entry;
      tests, with the fixed output of `test/build.test.ts` in mind (lesson 2026-11-02, M075).
- [x] T6: Make `.page-head` two columns above 62.5rem, the icon over the screenshot on the right, and put the
      screenshot below `.actions` at 62.5rem and under; site tests and a fixture with a screenshot (lesson
      2026-10-30, M061); look at 375, 1000, 1024, and 1280 px in light and dark (lessons 2026-10-29 M048,
      2026-11-06 M108).
- [x] T7: Rename the About section and add its sentence, change the license line, document the form and command
      in `docs/requests.md` (after "Changing a plugin's name or description", :165), the fields in `docs/data.md`,
      and terms in `docs/license.md`; update DESIGN's sources and add a D-entry for owner screenshots, annotating
      D-049, D-062, and D-063; add the CHANGELOG entry.
- [x] T8: Review return 1: a link or redirect of any scheme other than https is host-not-allowed (exit 1), and
      `--file` checks the link's own host and the 10 MiB limit; with it, the review's fix-now findings listed in the
      Review section; tests.
- [x] T9: Review return 2: `imageLinks` reads only real `<img>` src attributes and Markdown images outside HTML
      comments and code, the report writes the copy where the maintainer opens it, and the pass-2 fix-now findings
      listed in the Review section; tests.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — new request command, files, data field, and page layout.
- 2026-11-07: idea vet: gap — images from random repos can show harm; reading taken: only owner requests that the maintainer applies by hand, re-encoded by sharp. gap — a hotlinked image can change after approval; reading taken: the index commits and serves its own copy. gap — D-063 licenses text only; reading taken: screenshots keep their owners' terms. No one outside asked yet, as for D-049; the user asked for it.
- 2026-11-07: lessons used: 2026-10-29 (M048), 2026-10-30 (M061), 2026-11-02 (M075), 2026-11-06 (M108).
- 2026-11-07: question set: screenshots per plugin — one, under the icon at the top right of the page head.
- 2026-11-07: question set: page wording — approved as drafted, recorded in `cairn/references/plain-words-copy.md`.
- 2026-11-07: question set: creating the `screenshot` label on GitHub — granted.
- 2026-11-07: plan gate chose owner requests that the maintainer applies over reading images from READMEs because the build cannot tell a screenshot from other images and the user did not want unreviewed images; falsified by owners who do not use the form while their READMEs hold screenshots.
- 2026-11-07: plan chose committing a re-encoded copy over linking the attachment because the owner could replace a linked file after approval; falsified by repo size growth that slows clones.
- 2026-11-07: criteria audit (full mode, fresh Opus reader), with M113: a blank Screenshot field is a removal, not an error; apply refuses a result over the check's 1 MiB and fits height too; `--file` keeps every other check; the description uses `textProblems("description", …)` and no second 200 limit; the label must exist; the wide layout starts above 1000 px; `index.v1` gains the field; instrument wording moved out of the promises.
- 2026-11-07: criteria re-audit after the layout answer: AC6 anchors on every head text element, not the optional description; names the slot before `.install-note`; keeps the image inside `.page-head`; a 1 px tolerance; a wide and a tall image in the look; exact `href`.
- 2026-11-07: inbox sweep: 0 open issues; 10 open PRs, all bot "Add <repo>" PRs, none overlapping.
- 2026-11-07: sizing: 8 criteria pass the ~7 tripwire only through the verify-slot criterion (AC8), so no split; tasks are 6 to 7.
- 2026-11-07: implement started on branch m114-owner-screenshot.
- 2026-11-07: T1: created the `screenshot` label, added `screenshot.yml` (Screenshot is a textarea so an image can be attached), `screenshotHref`, and the approved owner line with site tests; the form's own test lands with T2's labels.
- 2026-11-07: T2: moved the issue, label, form, record, entry, and owner reads into `src/text-request/owner.ts` (`readOwnerRequest`, `formValues` in parse.ts) and put both requests on it; exported `downloader` with a per-URL `check` and `readCapped`, whose `tooLarge` now throws outside its catch; `SCREENSHOT_HOSTS` is github.com and the S3 host an attachment redirected to (curl, 2026-11-07); a non-https URL or a port also counts as off the hosts; a ReadFailure or HTTP error on the download is failure `download-failed` (exit 2); problems print as `problem: <name>: <detail>`, the description's as `description-<textProblems name>`; the form test lives in `test/screenshot-request.test.ts`.
- 2026-11-07: T3: `--apply` auto-orients, fits inside 1600×2400 without growing, and writes WebP at quality 80 (sharp drops metadata); `index.json`'s field is `screenshot: { description, reason }`; `--owner-checked` works as in text-request; the over-1 MiB test uses seeded noise; the check run after apply waits for T4's schema.
- 2026-11-07: T4: `screenshot` in index.v1 requires `description` (non-blank) and `reason`; `pnpm check` adds the rule `screenshot-file`, reads the limits from `src/screenshot-request/rules.ts`, and loads sharp only for an entry with a screenshot.webp; a blank `screenshot.reason` is `reason-not-blank`; the T3 apply and removal now pass `pnpm check` in a test.
- 2026-11-07: T5: every record of an entry with a screenshot gets `screenshot`, a failed read included; `BuildResult.screenshots` and a required fourth `writeData` argument, which also clears stale files in `v1/screenshots/`; a named screenshot with no readable file stops the build; data of a tree with no screenshot is unchanged (lesson M075).
- 2026-11-07: T6: the screenshot link sits in `.head-side` after the icon (DOM order: actions, icon, screenshot, then install note or version card); above 62.5rem `.head-side.with-screenshot` is a 20rem column, the image at most 30rem tall and right-aligned; at 62.5rem and under the column is `display: contents`, so the icon keeps its place beside the name and the screenshot takes row 2 under the links; fixture screenshots on first-plugin (icon, no install note) and a-cafe (no icon, install note); browser look at 1280, 1024, 1000, 375 px with a wide and a tall image, dark and light: every AC6 measure held, no horizontal scroll at 375.
- 2026-11-07: T7: About's `#icons` section keeps its id under the new heading; docs/requests.md "Adding a screenshot", docs/data.md (record block, entry field, third file), docs/license.md screenshot terms, DESIGN (contract boundary, About list, overrides, check, reader, build, text and screenshot requests), D-081, and the CHANGELOG entry; the simple-english lint hook still flags older lines in those docs, left as they were.
- 2026-11-07: claim audit: 165 claims read, 5 corrected — Base.astro, src/screenshot-request/request.ts, src/text-request/owner.ts, docs/requests.md (fresh Opus reader; open points for review: About's license line says screenshots keep "their authors' terms" while docs/license.md says owners', an approved line left as is; `--file` skips the 10 MiB download cap by design of AC3).
- 2026-11-07: implement done; status review.
- 2026-11-07: review return 1: AC2 and AC3 fail as written — a Screenshot link or redirect with a scheme other than http(s) exits 2 `download-failed` instead of 1 host-not-allowed, and with `--file` the link's own host is never checked; the review's fix-now findings (Review section, diff-bug #1, #2, #5–#8, #10–#12, prior-review #1, #2, #4, ripple #1–#11) ride on the same return.
- 2026-11-07: added T8 for review return 1 (minor amendment; Coverage AC2, AC3, AC8 → T8).
- 2026-11-07: T8: `downloader` runs `check` on the first URL and each redirect target before its own scheme check, so any non-https link or redirect is host-not-allowed (exit 1), shown failing with that line removed; `--file` checks the link's own host and the 10 MiB limit; the report makes the copy, so a cut image is `unreadable-image` and an over-1 MiB copy is `copy-too-large` before `--apply`, and prints the image's SHA-256; apply re-reads index.json before writing, writes the image through a temporary file after index.json names it, and a removal changes index.json first; `readOwnerRequest` reads index.json before the owner; `imageLinks` decodes character references; check stats before reading and refuses a format-only description; propose copies a kept screenshot into its check and names it; docs, README, DESIGN, D-081, and CHANGELOG fixed; full `pnpm test` 2638 passed, 6 skipped, `pnpm check` clean.
- 2026-11-07: claim audit: 64 claims read, 6 corrected — docs/requests.md, src/screenshot-request/request.ts, src/screenshot-request/parse.ts, src/upstream/reader.ts, src/text-request/owner.ts (fresh Opus reader over 2977dfcc..908a8753); it also named two stale lines outside the added ones, fixed: propose's `keptLines` comment and docs/data.md's description rule; left as is: a rename or delete that fails after index.json is written can still leave the two out of step, which the corrected docs now say.
- 2026-11-07: implement done after review return 1; status review.
- 2026-11-07: review return 2: the image the command applies can differ from the one the issue page shows — `imageLinks` takes a ` src=` inside another attribute's value and counts images in HTML comments and code spans, and the report gives the maintainer no copy to look at, so D-081's look can be bypassed; the pass-2 fix-now findings (Review section, pass 2) ride on the same return.
- 2026-11-07: added T9 for review return 2 (minor amendment; Coverage AC2, AC3, AC8 → T9).
- 2026-11-07: T9: `imageLinks` reads only an `<img>` tag's own `src` attribute (attributes parsed one by one) and skips HTML comments (to the end when open), code fences, code spans, and indented code lines; the report writes the copy to `zotdex-screenshot-<issue>.webp` in the system temporary folder (`previewDir` option) and prints `preview:`, removing an earlier preview when there is no copy; docs tell the maintainer to look at the preview, not the issue page, and to match the apply run's SHA-256; a removal with `--file` is failure `file-with-removal`; `downloader` checks each URL once; check flags a leftover `screenshot.webp.tmp` and drops the unreachable format branch; request reads a missing size as 0; tests for smuggled and hidden links, the preview, metadata failure, index.json write failure, the first-URL check, and the leftover; repeated and absence-only tests removed; propose's fallback names the screenshot; docs/maintaining.md replace lines fixed; full `pnpm test` 2649 passed, 6 skipped, `pnpm check` clean.
- 2026-11-07: claim audit: 24 claims read, 2 corrected — src/screenshot-request/parse.ts, src/screenshot-request/request.ts (fresh Opus reader over ae24e9e5..fdb67577); it showed that dropping every line indented four spaces also dropped images the page shows in list items, so `shownText` no longer drops indented lines (the preview covers indented code), with a list-item test and the docs and DESIGN wording narrowed to comments, code fences, and code spans; full `pnpm test` 2649 passed, 6 skipped, `pnpm check` clean.
- 2026-11-07: implement done after review return 2; status review.
- 2026-11-07: review pass 3 fixed its fix-now findings on the branch (e02d6c08) and fixed its own two candidate rows that broke the ROADMAP line cap by merging them; no return.
- 2026-11-07: step-7 approval: m114-owner-screenshot approved for merge

## Review

Evidence at c4344954, 2026-11-07. Full `pnpm test` 2621 passed, 6 skipped; `pnpm check` 745 entries, 0 problems. Verbose run of the seven touched test files: 1269 passed, 1 skipped, 0 failed.

- AC1: `gh label list --search screenshot` → `screenshot`; "the screenshot form" test passes (label, inputs plugin/screenshot/description with their labels, textarea for the image); "links each plugin page's owner line to the screenshot form with the plugin id" passes (one `data-screenshot-request` link per page with `template=screenshot.yml&plugin=<id>`, none on home or About).
- AC2: "screenshotRequest's report" 21 tests pass, with recorded responses: blank and `_No response_` fields are removals that ignore a bad description; one test each exits 1 naming no-image-link, more-than-one-image, host-not-allowed (link off hosts, link with a port, redirect off hosts before the request), too-large (download past 10 MiB, reading stopped), not-an-image, too-many-pixels (8001 wide, 8001 tall), and description-<rule> from `textProblems("description", …)`; owner check is `readOwnerRequest`, shared with `pnpm text-request` (84 text-request tests pass), with a mismatch test.
- AC3: "screenshotRequest with apply" 13 tests pass: 3200×2000→1600×1000, 1000×6000→400×2400, 640×400 kept, all WebP with index.json `screenshot: { description, reason: "…issue #9." }`; EXIF orientation applied and exif/icc/xmp absent; a 1600×2400 noise image's copy over 1 MiB exits 1 and writes nothing; removal deletes file and field; `--file` writes with no download and still runs the field, image, and description checks (report test); applied and removed entries pass `pnpm check`.
- AC4: `schemas/index.v1.schema.json` defines optional `screenshot` {description, reason}; check tests pass: an entry with screenshot and file and one with neither give no finding; schema refuses a missing reason or blank description; `screenshot-file` findings, one test each, for named-but-missing, file-but-unnamed, PNG file, 1601 px wide, 2401 px tall, and over 1 MiB.
- AC5: "buildData screenshots" 6 tests pass: a read and a failed record get `screenshot: { file: "screenshots/<sha256>.webp", alt }` with the bytes under that name; a tree with none gives unchanged data; the plugins.v1 schema takes a record with and without the field and refuses another path; `writeData` writes `v1/screenshots/` and clears stale files; a `pnpm build` run writes the file the data names.
- AC6: site tests pass: one `<a class="screenshot" href="/v1/<file>" data-screenshot>` with `<img alt>` equal to `screenshot.alt` on first-plugin and a-cafe, none on the other 18 pages or home; it follows `.actions` and the icon and comes before the install note (a-cafe) or the version card (first-plugin). Browser-pane look on the fixture site rebuilt at c4344954, iframes at each width, wide 1600×1000 image with icon (first-plugin) and tall 800×2400 image with no icon (a-cafe): at 1280 and 1024 px the image is right of all 5 head text elements, inside `.page-head`, below the icon tile (first-plugin) or 0.00 px from the h1 top (a-cafe); at 1000 and 375 px it is after `.actions`, before the card or note, inside the content box, and 375 px has no horizontal scroll.
- AC7: the three M114 lines of plain-words-copy.md read word for word from the built site text (About heading "Icons and screenshots" and its two added sentences, the license line, the owner line on first-plugin), and the About-page copy test and owner-line test pass; docs/requests.md:237 "Adding a screenshot" documents the form and `pnpm screenshot-request`, docs/data.md:87 and :277 the record block and the index.json field, docs/license.md:30 "Screenshots keep their owners' terms."
- AC8: `pnpm test` exit 0 (type check, then 2621 passed, 6 skipped) and `pnpm check` exit 0 at c4344954.
- gate: `cairn_validate.py` exit 0, all checks pass, 1 advisory (sizing: 8 criteria, judged at plan); no IP/GP changed, so no `cairn_impact`; generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: a `replaces-entry` proposal keeps the old entry's index.json, so an old `screenshot` makes propose's check run fail falsely (no screenshot.webp copied into the check folder), and `keptLines` does not tell the maintainer that the old owner's screenshot stays — fix now
- diff-bug #2: a truncated image passes `metadata()` in the report and fails at `--apply` as `write-failed` (exit 2) — fix now: the report makes the copy, so a decode failure is `unreadable-image` and the copy's size shows before apply
- diff-bug #3: a link or redirect with a scheme other than http(s) (`data:`, `ftp:`) leaves the hosts but exits 2 `download-failed` — floor return (AC2 failing)
- diff-bug #4: with `--file` the link's host is never checked — floor return (AC3: every other AC2 check still runs); the same return applies the 10 MiB limit to the file
- diff-bug #5: across awaits — apply downloads again after the report, so print the image's SHA-256 in the report: fix now; index.json is read before the encode and written after: fix now (re-read at write time); stat-then-rm and build readEntry — reject (false: one CLI process, and the build reads a CI checkout nothing writes during it)
- diff-bug #6: a failed write can leave screenshot.webp and index.json out of step — fix now (write order: temp image, index.json, rename; removal writes index.json first)
- diff-bug #7: text-request's overrides read moved after the owner API read, changing which failure prints when both fail — fix now (readOwnerRequest reads the entry's index.json before the owner)
- diff-bug #8: a missing width or height reads as `too-many-pixels` with `undefinedxundefined` — fix now (`unreadable-image`)
- diff-bug #9: the download has no timeout — reject (false: `request` in src/upstream/reader.ts:521 sets `AbortSignal.timeout` on every request)
- diff-bug #10: `pnpm check` now loads sharp for an entry with a screenshot, so the discovery bot's merge check loads it, which D-080 said it does not — fix now (D-081, drafted on this branch, says so)
- diff-bug #11: `imageLinks` decodes only `&amp;` — fix now (decode numeric and named ampersand and quote entities)
- diff-bug #12: tests — the token assertion cannot fail, the description case repeats the next test, the site order check compares against -1 for a page with no icon, the check over-1 MiB test is not exact, and new branches lack tests (unreadable-image, file-unreadable, entry-unreadable, the https part of the host check, removal of a stray file, check's non-ENOENT read and unreadable WebP) — fix now; the fixture's orientation precondition assertion — reject (false: it proves the input carries the metadata the test then shows removed, not sharp's behavior)
- diff-bug #13: the screenshot `<img>` has no width or height, so the page shifts as it loads — follow-up: candidate row "Give screenshot images their pixel size", [low] because no AC asks for it and the shift is cosmetic
- blame-history #1: same as diff-bug #7 — fix now (with #7)
- blame-history #2: `readCapped` no longer rethrows ReadFailure from inside its try — reject (false: every caller's `tooLarge` throws a ReadFailure and now reaches the caller unwrapped, as its comment states; planned by T2)
- blame-history #3: the build reads screenshot.webp with no byte cap — reject (false: .github/workflows/build.yml:56 runs `pnpm check`, which holds the 1 MiB limit, before the build)
- blame-history #4: `check` runs before `refusal` on each hop — reject (false: informational, no conflict found)
- prior-review #1: a description of only format characters passes `pnpm check` (the M032 gap) — fix now (`reason-not-blank` also covers `screenshot.description`)
- prior-review #2: CHANGELOG does not tell schema users to fetch v1 again (D-007) — fix now
- prior-review #3: README's license line omits screenshots — fix now (with ripple #2)
- prior-review #4: check reads the whole file before its size test — fix now (stat first); the build and `--file` parts — reject for the build (false, as blame-history #3), and `--file` goes with the floor return
- ripple #1: cairn/references/plain-words-copy.md:61-62 still shows the old owner line in the plugin-page list — fix now (mark it replaced at M114)
- ripple #2: README.md:54-55 license line omits screenshots — fix now
- ripple #3: README.md:27-33 lists five issue forms, not the screenshot form — fix now
- ripple #4: docs/site.md:280-281 Details card links omit the screenshot form — fix now
- ripple #5: cairn/DESIGN.md:171-172 page-end links omit the screenshot form — fix now
- ripple #6: docs/maintaining.md:546-549 names two index.json rules and `reason-not-blank` without screenshot — fix now
- ripple #7: docs/maintaining.md:608-610 writes and clears only `dist/v1/icons/` — fix now
- ripple #8: docs/maintaining.md:590 build output omits `dist/v1/screenshots/` — fix now
- ripple #9: cairn/DESIGN.md:527-528 and :1054-1055 build writes omit screenshots — fix now
- ripple #10: docs/maintaining.md:796-797 partial write names only icon files — fix now
- ripple #11: CHANGELOG.md Unreleased says About gains an "Icons" section while the M114 entry renames it — fix now (one entry names "Icons and screenshots")
- ripple #12: propose and merge texts say a new entry has only its two files — reject (false: still true of a new entry, which never holds a screenshot)
- fixed 908a8753: every fix-now finding above (diff-bug #1, #2, #5 SHA-256 and re-read, #6, #7, #8, #10, #11, #12; blame-history #1; prior-review #1, #2, #3, #4 check; ripple #1–#11); claim-audit wording corrections 84adfc1e.

Pass 2, after review return 1, evidence at 84adfc1e, 2026-11-07. Default branch unchanged since the cut; no site, schema, or form change since c4344954. Full `pnpm test` 2638 passed, 6 skipped, and `pnpm check` 745 entries, 0 problems, run on this tree before its commit. Verbose run of the eight touched test files: 1345 passed, 1 skipped, 0 failed.

- AC1 (pass 2): label `screenshot` exists (pass 1 read, no label change since); form test and owner-line link test pass.
- AC2 (pass 2): "screenshotRequest's report" 30 tests pass: removals for "" and `_No response_`; exit 1 naming no-image-link, more-than-one-image, host-not-allowed for a link off the hosts, with a port, http, ftp, data, or not a URL, and for a redirect off the hosts or to ftp before that request; too-large past 10 MiB; not-an-image; too-many-pixels both ways; unreadable-image for a cut file; description-<rule>; owner mismatch shares `readOwnerRequest` (84 text-request tests pass).
- AC3 (pass 2): "screenshotRequest with apply" 16 tests pass: three fits, metadata dropped, replace keeps other fields, over-1 MiB copy exits 1 writing nothing, removal of file and field, stray-file removal, kept concurrent edit, write failure leaves the entry as it was, applied and removed entries pass `pnpm check`; `--file` writes with no download and still checks the field, the link's own host, the 10 MiB limit, the image, and the description.
- AC4 (pass 2): 11 check tests pass: with and without the field; schema refuses no reason and an empty description; `screenshot-file` for missing file, unnamed file, PNG, 1601 wide, 2401 tall, over 1 MiB (exact, unread), unreadable WebP, and a directory; format-only description and reason as `reason-not-blank`.
- AC5 (pass 2): "buildData screenshots" 6 tests pass (record field and sha path on read and failed records, unchanged data without, schema with and without, `writeData` writes and clears, `pnpm build` writes the named file).
- AC6 (pass 2): site tests pass (attributes, none elsewhere, order after `.actions` and before note or card, icon before screenshot on the icon page); browser-pane look on the fixture site, iframes at 1280, 1024, 1000, 375 px, first-plugin (wide image, icon) and a-cafe (tall image, no icon): all eight measures true.
- AC7 (pass 2): About-page copy test and owner-line test pass; the three M114 lines read word for word on the built site (pass 1 read; no site change since); docs/requests.md "Adding a screenshot", docs/data.md record block and entry field, docs/license.md screenshot terms present.
- AC8 (pass 2): `pnpm test` exit 0 (2638 passed, 6 skipped) and `pnpm check` exit 0 on the 84adfc1e tree.
- gate (pass 2): `cairn_validate.py` all checks pass, 1 advisory (sizing, as pass 1); no IP/GP changed; generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple (pass 2)
- diff-bug #1 (pass 2): `HTML_IMAGE` takes the first ` src=` in the tag, also inside another attribute's quoted value, so `<img alt="x src='…EVIL'" src="…GOOD">` fetches EVIL while the issue page shows GOOD; the report and apply agree, so the maintainer looks at one image and applies another — floor return (load-bearing: it defeats the look that D-081 rests on)
- diff-bug #2 (pass 2): an image in an HTML comment or a code span counts as the field's one image though the page shows none — floor return (with #1)
- diff-bug #3 (pass 2): the maintainer has no SHA-256 of the image looked at, since the report saves nothing to open — floor return (with #1: the report writes the copy where the maintainer opens it, and apply's SHA-256 is compared with the report run's)
- diff-bug #4 (pass 2): a new GitHub file host would read as host-not-allowed, blaming the owner — fix now (docs say to check the host and use `--file`, which checks only the link's own host)
- diff-bug #5 (pass 2): a removal with `--file` ignores the file — fix now (named failure)
- diff-bug #6 (pass 2): a killed apply leaves `screenshot.webp.tmp`, which `pnpm check` does not flag — fix now (`screenshot-file` flags the leftover)
- diff-bug #7 (pass 2): `downloader` runs `check` twice on each URL — fix now
- diff-bug #8 (pass 2): unreachable branches (check's `format !== "webp"` after the magic bytes, "sharp reads no width or height") — fix now (removed)
- diff-bug #9 (pass 2): a Markdown link's backslash escapes are not undone — reject (edge: GitHub writes `<img>` for attachments, so only a hand-written escaped link reaches it, and it exits 2 `download-failed`)
- diff-bug #10 (pass 2): `screenshot.description` has no 200-character limit in the schema or check — reject (planned change: D-049's rules bind requests only, and D-081 follows it)
- diff-bug (a)1 (pass 2): the issue can change between the report and apply runs — floor return (with #1, by the copy and SHA-256 compare)
- diff-bug (a)2 (pass 2): the `replaces-`/`removes-screenshot` line comes from index.json as read before the download — follow-up: candidate row "Tighten screenshot request report lines", parked, promote when a user reports it
- diff-bug (a)3 (pass 2): removal's stat, then index.json write, then `rm` — reject (false: one CLI process, as pass 1)
- diff-bug (c)1 (pass 2): the write-failure test fails at the temp file and never reaches the index.json write — fix now (a test where index.json cannot be written)
- diff-bug (c)2 (pass 2): untested `metadata()` failure, first-URL `check`, and `else throw` — fix now (tests for the first two; the `else throw` rethrows an unexpected error and needs no case)
- diff-bug (c)3 (pass 2): repeated inputs — http, ftp, and data each a documented case, and "" and `_No response_` each named by AC2: reject (planned change); unknown-plugin and not-an-image via `--file` repeat shared paths: fix now (removed)
- diff-bug (c)4 (pass 2): site test re-checks href and alt — reject (false: it also asserts no `data-screenshot` on other pages and home, which the head test does not); build's no-screenshot test asserts only an absence — fix now (removed: the fixed-output build tests pass unchanged)
- diff-bug (c)5 (pass 2): site fixture-fact assertions — reject (false: they show the test's two cases are the ones it names); check "no reason" uses `objectContaining` — fix now (exact message)
- blame-history #1 (pass 2): sharp loads in the bot's merge check for an entry with a screenshot, against D-080 — reject (false: sharp still loads only for an entry with screenshot.webp, and D-081, which annotates D-080, records the bot path)
- blame-history #3 (pass 2): an ftp redirect now fails as host-not-allowed rather than the reader's scheme message — reject (false: only the screenshot download passes a `check`; other callers are unchanged)
- blame-history #2, #4–#9 (pass 2): checked, no conflict — reject (false)
- prior-review #1 (pass 2): lazy sharp — reject (as blame-history #1)
- prior-review #2 (pass 2): two new check tests hold a raw U+200B, which M032 ruled out — fix now (escaped)
- ripple #1 (pass 2): docs/maintaining.md:349-352 says the replaces-entry body names overrides and the paid-service mark "or says that it holds neither" — fix now
- ripple #2 (pass 2): propose's fallback line omits the screenshot — fix now
- ripple #3 (pass 2): docs/license.md:4-8 lists what CC0 covers in the data file — reject (false: it lists the index's own work, and its screenshot paragraph covers the rest)
- fixed fdb67577 and 422a6932: every pass-2 fix-now finding above (diff-bug #4–#8, (c)1, (c)2, the (c)3, (c)4, and (c)5 removals and exact message; prior-review #2 escapes in ae24e9e5; ripple #1, #2); the floor-return items (diff-bug #1–#3, (a)1) by T9.

Pass 3, after review return 2, evidence at 422a6932, 2026-11-07. Default branch unchanged; no site, schema, or form change since c4344954. Full `pnpm test` 2649 passed, 6 skipped, and `pnpm check` 745 entries, 0 problems, run on this tree before its commit. Verbose run of the nine touched test files: 1409 passed, 1 skipped, 0 failed.

- AC1 (pass 3): form test and owner-line link test pass; label unchanged.
- AC2 (pass 3): "screenshotRequest's report" 32 tests pass, each AC2 problem named with exit 1 (blank and `_No response_` removals; no link; two links; off-host, port, http, ftp, data, and non-URL links; off-host and ftp redirects before the request; over 10 MiB; not PNG/JPEG/WebP; over 8000 px both ways; cut and unreadable images; description rules); 13 parse tests pass, including a `src` inside another attribute and images in comments, fences, and code spans; owner check shared with text-request (84 tests pass).
- AC3 (pass 3): "screenshotRequest with apply" 17 tests pass (fits, no metadata, replace, over-1 MiB copy writes nothing, removal, stray file, concurrent edit kept, both write failures leave the entry as it was, `pnpm check` after apply and removal); `--file` checks the field, the link's host, 10 MiB, the image, and the description.
- AC4 (pass 3): 13 check tests pass (with and without the field; schema refusals with exact messages; each `screenshot-file` failure; leftover temporary file; format-only description and reason).
- AC5 (pass 3): "buildData screenshots" 5 tests pass; the fixed-output build tests pass unchanged.
- AC6 (pass 3): site tests pass; browser-pane look on the fixture site, iframes at 1280, 1024, 1000, 375 px, first-plugin and a-cafe: all eight measures true.
- AC7 (pass 3): About-page copy test and owner-line test pass; docs sections present (pass 2 read, wording narrowed since, no page change).
- AC8 (pass 3): `pnpm test` exit 0 (2649 passed, 6 skipped) and `pnpm check` exit 0 on the 422a6932 tree.
- gate (pass 3): `cairn_validate.py` first failed `weight caps` (ROADMAP 60 lines) from this review's two M114 candidate rows; review merged its own two rows into "Give screenshot images their pixel size" and re-ran: all checks pass, 1 advisory (sizing). ROADMAP is 24,098 bytes, over its 24,000 budget, left to step 9's terminal-row prune.
- spawned: diff-bug, blame-history, prior-review, ripple (pass 3)
- diff-bug #1 (pass 3): `--apply` downloads again and writes the entry before the maintainer can compare SHA-256 lines — fix now (docs: the written files stay local until the maintainer commits them, so a differing SHA-256 means restore the entry and run the report again)
- diff-bug #2 (pass 3): the preview has a fixed name in a possibly shared temporary folder, so another local user could plant it — fix now (removed first, then written only as a new file)
- diff-bug #3 (pass 3): `imageLinks` refuses some unusual but shown forms and counts an escaped `\![x](url)` — reject (edge: GitHub writes a plain `<img … src>` for an attachment, and the effect is a `problem:` refusal, exit 1, after which the owner files again)
- diff-bug #4 (pass 3): stat then read of a `--file` image or screenshot.webp — reject (edge: only a file changed by the maintainer during the run reaches it, and its effect is reading past the limit)
- diff-bug #5 (pass 3): a failed run or a removal leaves an earlier preview — fix now (each run removes the issue's preview first)
- diff-bug #6 (pass 3): the first URL is checked by `linkUrl` and by `downloader` — reject (false: once in each layer, with no effect)
- diff-bug #7 (pass 3): `imageLinks` is quadratic on 65,000 backticks — reject (edge: GitHub's issue body limit bounds the field, and the effect is slow running)
- diff-bug #8 (pass 3): README calls screenshots "text" — fix now
- diff-bug (c)1 (pass 3): no test for `preview-failed` — fix now
- diff-bug (c)2 (pass 3): the problem table asserts only the first problem — fix now (exact list)
- diff-bug (c)3 (pass 3): the not-JSON test does not assert status 2 — fix now
- diff-bug (c)4 (pass 3): untested parse branches (a code point over U+10FFFF, a bare `src`, an `<img>` with no `src`) — fix now
- diff-bug (c)5 (pass 3): icc and xmp absences cannot fail for an input that has neither — fix now (removed)
- diff-bug (c)6 (pass 3): the check test's no-screenshot case repeats "passes a tree of valid entries" — fix now (removed)
- diff-bug (c)7 (pass 3): four test comments restate their assertion — fix now (removed)
- blame-history #1 (pass 3): no maintainer-only way to pull a shown screenshot, as `iconHidden` does for icons — fix now (docs/requests.md says a maintainer removes one by hand: delete screenshot.webp and the field)
- blame-history #2 (pass 3): D-080's own sentence on sharp is not marked — reject (false: D-081, whose heading annotates D-080, records the change, and DECISIONS is append-only)
- blame-history #3 (pass 3): D-081 adopts the owner-submit model that D-080 rejected for icons without saying so — fix now (D-081, drafted on this branch, says why)
- blame-history #4 (pass 3): ROADMAP over its byte budget — reject (false: recorded above and handled at step 9)
- prior-review #1 (pass 3): a missing width or height no longer reads as `unreadable-image` by name — reject (false: pass 2 #8 removed that branch as unreachable for PNG, JPEG, and WebP; a size of 0 fails the encode as `unreadable-image`)
- prior-review #2 (pass 3): sharp in the bot's check — reject (as pass 2 blame-history #1)
- prior-review #3 (pass 3): the first URL is checked in two layers — reject (as diff-bug #6)
- prior-review note (pass 3): raw format characters on main at test/check.test.ts:321, test/text-request.test.ts:103 and :220, test/upstream.test.ts:285 and :286, lines this branch did not change — follow-up: candidate row "Escape the raw format characters in tests", [low] because the tests pass and only M032's rule is broken, written at step 9 once its terminal-row prune frees a ROADMAP line
- ripple #1 (pass 3): cairn/DESIGN.md:766 says an entry holds meta.json and index.json — fix now
- ripple #2 (pass 3): cairn/DESIGN.md:453-455 names `reason-not-blank` for override reasons only — fix now
- fixed e02d6c08: every pass-3 fix-now finding above; full `pnpm test` 2653 passed, 6 skipped, and `pnpm check` clean on that tree.
