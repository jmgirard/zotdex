# M113: Show each plugin's own icon on its page

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — plugin pages and the published data gain an icon
- **Branch/PR:** m113-plugin-icons

## Goal

Each plugin page shows the icon that the plugin's release declares in its manifest, redrawn by the build as a PNG
file that Zotdex serves, and shows none where the build cannot read one safely.

## Scope

**In:** read the manifest's `icons` and the picked file from the XPI; redraw it with sharp as a 96×96 PNG (an SVG
never reaches a page as SVG); skip the plugin template's stock icon; write `v1/icons/<sha>.png` and the optional
`upstream.icon`; keep the icon of a record that keeps deployed facts; a maintainer's `iconHidden` in `index.json`;
the icon at the top right of the plugin page head; the approved About and license lines; docs, a D-entry, DESIGN,
and CHANGELOG.

**Out:** icons on the home rows → candidate row "Show plugin icons in home rows"; owner screenshots and the head's
right column under the icon → M114; owner-submitted icons (the user chose automatic icons with a hide).

## Acceptance criteria

- [x] AC1: For an XPI whose manifest.json `icons` object maps keys to string paths, the build picks among the keys
      that are base-10 whole numbers (others are ignored) the smallest at or above 96, else the largest. When the
      picked path names a file in the XPI that is PNG, JPEG, WebP, or SVG, judged by its bytes, `pnpm build` writes
      one 96×96 PNG to `v1/icons/<sha>.png` in its output, `<sha>` being the SHA-256 of the written bytes, and sets
      the record's optional `upstream.icon` to `icons/<sha>.png`. An SVG with no width or height is drawn at 96 px.
      A path with a leading `/` or `./` is read without it. Tests cover each of the four formats, a non-numeric key,
      the smallest key at or above 96, the fall-back to the largest, and a leading `/`, and decode the written file
      as a 96×96 PNG.
- [x] AC2: The record has no `upstream.icon`, and its other fields and any failure are the same as for the same XPI
      with no `icons` field, when: `icons` is absent or not an object; no key is a whole number; the picked value is
      not a string or holds a `..` segment; the picked file is missing from the XPI; any read of that zip entry fails
      (over 1 MiB unzipped, a duplicate name, inflation past its declared size, an unknown compression method); the
      bytes are none of the four formats or fail to decode; sharp's metadata gives a width or height over 4096 px;
      or the SHA-256 of the bytes is in `TEMPLATE_ICONS`, each value recorded with its source path and commit. One
      test for each case named here; the template case injects a hash rather than the template's bytes.
- [x] AC3: `schemas/plugins.v1.schema.json` defines `upstream.icon` as an optional string matching
      `^icons/[0-9a-f]{64}\.png$`, and `schemas/index.v1.schema.json` defines an optional
      `iconHidden: { "reason": <string, minLength 1> }`; the schema tests pass with and without each field, and the
      plugins.v1 test passes on the data fixture written before this change.
- [x] AC4: A record that keeps deployed facts under the 7-day rule keeps the deployed `upstream.icon`, unless its
      `index.json` has `iconHidden`, and the build writes that icon file, fetched from the URL resolved against
      `--previous`, within `previousMs` and a size cap, and checked against the SHA-256 in its name. A failed or
      late fetch, a file over the cap, or wrong bytes leaves that record without `upstream.icon` and changes no
      other record and not the exit code. Tests cover the match, a failed fetch, a mismatch, and a hidden icon.
- [x] AC5: An `index.json` with `iconHidden` gives that plugin's record no `upstream.icon`, a kept record included,
      and the build writes no icon file for it. `pnpm check`'s `reason-not-blank` rule covers `iconHidden.reason`.
      Tests cover a hidden icon on a read record, an empty reason, and a whitespace-only reason.
- [x] AC6: The plugin page of a record with `upstream.icon` shows one `<img data-icon>` whose `src` is `${BASE}v1/`
      followed by `upstream.icon`, with `alt=""`, `width="64"`, and `height="64"`, on a tile whose computed
      background is white in the light theme, with a dark system scheme and no saved theme, and with
      `data-theme="dark"`, and which sets `forced-color-adjust: none`. At viewport widths of 375 px and 1280 px, for
      a fixture with a 40-character name, the Archived and Older data badges, a kept note, and a 200-character
      description, the tile's right edge is within 1 px of `.page-head`'s right edge, its top is above the `h1`'s
      bottom, no client rect of a text node in `.page-head` meets the tile's rect, and the page has no horizontal
      scroll at 375 px. A browser-pane look in the Review checks these; site tests check the attributes. A record
      without the field has no `[data-icon]` element.
- [x] AC7: Each line that `cairn/references/plain-words-copy.md` records for M113 appears word for word on the
      built site (the About page's "Icons" section and the license line); `docs/data.md` documents `upstream.icon`
      and `iconHidden`, and `docs/license.md` says plugin icons keep their authors' terms.
- [x] AC8: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T2
- AC4 → T3
- AC5 → T2
- AC6 → T4
- AC7 → T5, T6
- AC8 → T1, T2, T3, T4, T5, T6

## Tasks

- [x] T1: In `src/upstream/reader.ts`, extend `ManifestJson` (:339) with `icons`, add the pick rule, and read the
      picked entry with a reader that returns no icon in place of throwing (`zipEntry` :899 and `unzipOne` :924
      throw `manifest-too-large` and `xpi-unreadable`). Sniff the format by magic bytes, check sharp's metadata,
      redraw to a 96×96 PNG (`fit: contain`, transparent), and add `TEMPLATE_ICONS` with the hashes of
      zotero-plugin-template's `addon/content/icons/favicon.png` and `favicon@0.5x.png`, each with its commit. Tests
      in `test/upstream.test.ts` build XPIs with fflate as `manifestXpi` does (`test/start-test.test.ts:92`).
- [x] T2: In `src/build/build.ts`, write the icon bytes to `v1/icons/` in `writeData` (:389), set `upstream.icon`,
      and drop it for `iconHidden`; add both schema fields and extend `reason-not-blank` in `src/check/check.ts`
      (:182). Check that `test/build.test.ts`'s fixed output takes the optional field (lesson 2026-11-02, M075).
- [x] T3: In the keep path (build.ts :305-338, `src/build/previous.ts`), fetch each kept icon from the URL resolved
      against `--previous`, with `previousMs` and a size cap, check its SHA-256, and drop the field on any failure.
- [x] T4: On `site/src/pages/plugins/[id]/index.astro` (:61), put the icon tile at the top right of
      `.page-head`, with CSS in `site/src/layouts/Base.astro` (:834) that M114's screenshot can sit under. Add site
      tests and a fixture record with an icon (lesson 2026-10-30, M061: add it to each hand-kept id list). Look at
      375 px and 1280 px in light and dark in the browser pane (lessons 2026-10-26 M015, 2026-10-29 M048).
- [x] T5: Add the About "Icons" section and change the license line in `site/src/pages/about.astro` (:79, :158) to
      the lines in `cairn/references/plain-words-copy.md`; site tests match them (lessons 2026-10-27 M021,
      2026-11-07 M109).
- [x] T6: Document `upstream.icon` and `iconHidden` in `docs/data.md`, hiding an icon in `docs/maintaining.md`, and
      icon terms in `docs/license.md`; update DESIGN's Contract boundary and sources and add a D-entry that the
      build serves a redrawn icon from the XPI, annotating DESIGN's Contract boundary and D-063; add the CHANGELOG
      entry.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — new data field, build step, and page element with design choices.
- 2026-11-07: idea vet: gap — DESIGN says the index does not re-serve plugin files (XPI files); reading taken: a 96 px PNG redrawn from the XPI's icon is not a plugin file, recorded by T6's D-entry. gap — SVG icons can carry script; reading taken: every icon is redrawn to PNG. gap — template plugins ship a stock icon (1 of 25 sampled); reading taken: skip known stock hashes. gap — D-063 licenses text only; reading taken: icons keep their authors' terms. Sample of 25 XPIs from the 2026-11-03 data: 16 declare `icons`, 3 as SVG, 1 names a missing file.
- 2026-11-07: lessons used: 2026-10-26 (M015), 2026-10-27 (M021), 2026-10-29 (M048), 2026-10-30 (M061), 2026-11-02 (M075), 2026-11-07 (M109).
- 2026-11-07: question set: automatic icons or approved images only — automatic, with a maintainer hide.
- 2026-11-07: question set: page wording — approved as drafted, recorded in `cairn/references/plain-words-copy.md`.
- 2026-11-07: question set: layout — the user asked for the icon at the top right of the page head, with M114's screenshot below it.
- 2026-11-07: plan gate chose automatic manifest icons with a maintainer hide over owner-submitted icons because 16 of 25 sampled plugins declare one and approval would leave most plugins without; falsified by an icon that misleads or offends reaching a page before the maintainer hides it.
- 2026-11-07: plan chose writing icon files from the data build over embedding them in `plugins.json` because 700 data-URI icons would add about 2 MB to the data and the home page; falsified by a data user who needs icons without a second request.
- 2026-11-07: plan chose plugin pages only over home rows too, as the request named the plugin page; home rows go to the candidate row "Show plugin icons in home rows".
- 2026-11-07: plan chose a white tile under the icon in both themes so a dark icon stays visible on the dark theme.
- 2026-11-07: criteria audit (full mode, fresh Opus reader): 18 findings over M113 and M114, all taken. For M113: `icons` values that are not strings and failed zip reads added to AC2; numeric keys, all four formats, and path forms tested in AC1; size limit stated per side; `TEMPLATE_ICONS` recorded with source and commit and tested by an injected hash; the hide wins over a kept icon (AC4, AC5); the kept-icon fetch gets a time and size limit and fails one record only; `index.v1` gains `iconHidden` and `reason-not-blank` covers it; AC6 names `data-icon`; instrument wording (test file names, the Review's look, the copy file's tests) moved out of the promises.
- 2026-11-07: criteria re-audit after the layout answer (full mode, same fresh reader): 10 findings on M113 AC6 and M114 AC6, all taken: the tile, not the image, meets the head's edge; the overlap check names a long-text fixture; both dark-theme routes and forced colors named; exact `src`; the look named as the check.
- 2026-11-07: inbox sweep: 0 open issues; 10 open PRs, all bot "Add <repo>" PRs, none overlapping.
- 2026-11-07: sizing: 8 criteria pass the ~7 tripwire only through the verify-slot criterion (AC8), so no split; tasks are 6 to 7.
- 2026-11-07: T1 done: `src/upstream/icon.ts` holds `pickIconPath`, `iconFormat`, `redrawIcon` (sharp, `fit: contain`, SVG drawn at the density that makes its longer side 96), and `TEMPLATE_ICONS` (two hashes, same bytes at template commits bf1ff3a and 1ab8af4); the reader returns the picked file's bytes as an unpublished `icon` beside `xpi`, and any failed read of that entry gives none; `test/icon.test.ts` and an `icon` block in `test/upstream.test.ts`; a planted throw in `iconBytes` turned 5 of them red; verify clean (2530 tests, 745 entries).
- 2026-11-07: implement chose redrawing in the build rather than the reader, so the reader stays free of sharp and the discover bot, which also calls it, does no image work.
- 2026-11-07: T2 done: the build redraws each read record's icon unless `iconHidden`, names it `upstream.icon`, and returns the bytes in `BuildResult.icons`; a record whose icon the build does not hold loses the field, so the data never names a missing file; `writeData` writes the icons before `plugins.json` and then removes other files in `v1/icons/`; a kept record drops a hidden icon; both schemas gain their field and `reason-not-blank` covers `iconHidden.reason`; a planted bypass of the hide turned its test red; verify clean (2538 tests, 745 entries).
- 2026-11-07: T3 done: `readPreviousIcons` in `src/build/previous.ts` reads each kept icon from the path resolved against `--previous`, 8 at once under one `previousMs` limit, with a 64 KiB cap and a SHA-256 check against the file name; any failure drops that icon only; a hidden icon is never read; a planted skip of the hash check turned the mismatch test red; verify clean (2545 tests, 745 entries).
- 2026-11-07: T4 done: `.page-head` is a two-column grid; its text moves into `.head-text`, and `.head-side` holds the white `.icon-tile` (`forced-color-adjust: none`), 4rem icon, 3rem at 47.5rem and under; the site fixture's first-plugin gains an icon, the head test checks the tile markup and its absence, and the coverage test needs a record with and one without an icon; hand check in the browser pane on a 40-character name, both badges, a kept note, and a 200-character description: at 375 and 1280 px the tile's right edge meets `.page-head`'s (0 px), its top is above the `h1`'s bottom, 0 of 20 text nodes meet it, no horizontal scroll, and it is white in light, `data-theme="dark"`, and system dark; verify clean (2545 tests, 745 entries).
- 2026-11-07: implement chose a grid with a text column over a floated icon, because M114's screenshot must move below `.actions` at narrow widths, which a float cannot do.
- 2026-11-07: T5 done: About gains the "Icons" section (`#icons`) after Descriptions and the license line reads "icons, and other work", both word for word from `cairn/references/plain-words-copy.md`; the About COPY table in `test/site.test.ts` holds both, so its order and prose tests match them; no other file held the old license line; verify clean (2546 tests, 745 entries).
- 2026-11-07: T6 done: `docs/data.md` documents `upstream.icon` and `iconHidden`, `docs/maintaining.md` the icon writes, the hide, and the kept-icon read, and `docs/license.md` the icons' terms; DESIGN's Contract boundary and the build's architecture note name the icon; D-080 records the choice; CHANGELOG gains the entry; `build.yml` uploads and digests all of `dist/`, so `v1/icons/` reaches the deploy with no workflow change; verify clean (2546 tests, 745 entries), `cairn_validate` green.
- 2026-11-07: claim audit: 110 claims read, 4 corrected — src/build/build.ts, test/build.test.ts, docs/data.md, schemas/plugins.v1.schema.json; also backed 4 untested comments with tests in test/icon.test.ts and test/build.test.ts (SVG after a BOM, comment, and doctype; a tall source; no metadata; no read of a path of another shape; no data file after a failed icon write); the same reader re-read all 5 and found them true; verify clean (2551 tests, 745 entries).
- 2026-11-07: implement complete; status review.

## Review

Evidence gathered 2026-11-07 at `6c99a04e`; `origin/main` is still the plan commit `6b4b290f`, so the branch needs no sync.

- AC1: verbose vitest at `6c99a04e`: `pickIconPath` 13 cases pass (smallest key at or above 96, smallest above 96, fall-back to the largest, whole-number keys only, leading `/` and `./`); `redrawIcon` gives a 96×96 PNG whose SHA-256 is its name for PNG, JPEG, WebP, SVG, a viewBox-only SVG, and a 4096 px side; the reader test "gives the bytes of the file the picked key names" and "reads a path with a leading slash without it" pass; build test "names the drawn icon on the record and gives its bytes under that name" decodes the bytes as a 96×96 PNG named `icons/<sha>.png`.
- AC2: reader tests "gives no icon and the same facts when …" pass for each named case: `icons` not an object, no whole-number key, a value that is not a string, a `..` segment, a missing file, over 1 MiB unzipped, a name held twice, inflation past the declared size, an unknown compression; "leaves a read's failure as it is without icons when the icon is bad" passes; `redrawIcon` gives none for text, an HTML page, a cut PNG, a side over 4096 px wide and one over 4096 px tall, and an injected template hash (and one for a non-matching hash); build test "gives no icon, and the same record less the XPI's hash, for an icon file that is no image" passes. A planted throw in `iconBytes` turned 5 reader tests red (T1).
- AC3: `schemas/plugins.v1.schema.json` defines `upstream.icon` with pattern `^icons/[0-9a-f]{64}\.png$` and `schemas/index.v1.schema.json` defines `iconHidden.reason` with `minLength` 1; build test "the schema takes an upstream with or without an icon path and refuses another shape" passes; check test "index-schema: an empty iconHidden reason, and none for a written one" passes and `pnpm check` passes over 745 entries with none; `checkOutput` gives 0 problems for main's site fixture, `test/fixtures/build/mixed-failures.plugins.json`, the shelf data of 2026-11-03, and the local `dist/v1/plugins.json`, all written before this change.
- AC4: build tests under "buildData with the deployed data > and icons" pass: the kept record keeps `icon` and the build holds the deployed bytes when they read back with the SHA-256 in the name; a 404, a rejected fetch, a read past a 200 ms `previousMs`, a body over 64 KiB, and wrong bytes each leave the kept record equal to its kept form without `icon`, with `result.ok` true, the record still kept, and Better Notes unchanged; a hidden icon is dropped with no request for the file. `readPreviousIcons` resolves the path against `--previous` (`src/build/previous.ts`) under one `withinLimit(previousMs)`; a planted skip of the hash check turned the mismatch test red (T3).
- AC5: build tests "gives no icon to a read record whose index.json hides it" (no `icon`, `result.icons` empty) and "drops the kept icon of a record whose index.json hides it, with no read of the file" pass; check tests "reason-not-blank: an iconHidden reason of \" \\t\"" and of U+200B pass with the rule and message `iconHidden.reason holds only whitespace or format characters`, and an empty reason fails `index-schema`. A planted bypass of the hide turned its test red (T2).
- AC6: site test "opens the main content of …" passes for every fixture id, checking the exact tile markup `<img src="/v1/<icon>" alt="" width="64" height="64" data-icon>` on first-plugin and an empty head side elsewhere, and the coverage test needs a record with and one without `icon`. Browser-pane look on a site built from `6c99a04e` with a fixture record of a 40-character name, Archived and Older data badges, a kept note, and a 200-character description: at 375 and 1280 px, in light and with `data-theme="dark"`, the tile's right edge is 0 px from `.page-head`'s, its top is above the `h1`'s bottom, 0 of 20 head text nodes meet it, horizontal scroll is 0, the background is `rgb(255, 255, 255)`, `forced-color-adjust` is `none`, and the image loads at 96 px; with a dark system scheme and no saved theme the tile is white on the `rgb(22, 22, 21)` page at both widths; old-plugin, with no icon, has no `[data-icon]`.
- AC7: site tests "the icons section reads as the copy" and "the license section reads as the copy" pass; the built About page holds each M113 line of `cairn/references/plain-words-copy.md` once, word for word (joined-text grep); `docs/data.md` documents the `icon` field and `iconHidden`, and `docs/license.md` holds "Plugin icons also keep their authors' terms".
- AC8: `pnpm test` at `6c99a04e` exits 0: 37 files passed, 1 skipped, 2551 tests passed, 6 skipped; `pnpm check` exits 0: 745 entries, 0 problems.
- Consistency gate: `cairn_validate.py` passes (one advisory: 8 criteria over the ~7 tripwire, logged at plan); no principle changed, so `cairn_impact` is skipped; the generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: `redrawIcon` has no time or memory bound, and an SVG's embedded `<image>` escapes `limitInputPixels`, so one crafted icon could hang or kill the daily build — fix now (draws stop after `ICON_DRAW_SECONDS` = 10 via sharp's timeout; an SVG with `<image` or `<feImage` gets no icon; tests for three such SVGs), fixed 88f58704
- diff-bug #2: `.page-head`'s column gap stays on pages with no icon, so their head text ended 24 px (16 px on phones) short — fix now (the space is `.head-side`'s margin; browser: a page with no icon gives `.head-text` the whole head width, 343 and 1008 px), fixed 88f58704
- diff-bug #3: `readPreviousIcons` checks only the SHA-256, so any bytes named for their hash would be served as an icon — fix now (also needs a PNG signature and an IHDR of 96 by 96; the kept-icon fixture is now a real 96 px PNG; tests for text and a 48 px PNG with matching names), fixed 88f58704
- diff-bug #4: kept icons get their own `previousMs` window after the data read, up to 120 s together — reject, planned change: AC4 sets "within `previousMs`" for the icon reads, and `docs/maintaining.md` says the icon reads take 60 seconds apart from the data read
- diff-bug #5: `writeData`'s default empty icon map would delete every icon if a later caller left it out — fix now (`icons` is required; four existing tests pass `new Map()`), fixed 88f58704
- diff-bug #6: a failed cleanup of `v1/icons/` returned `ok: false` after `plugins.json` was written, withholding a deploy — fix now (cleanup is best-effort; stale files are named by no data), fixed 88f58704
- diff-bug #7: `iconFormat` looks for `<svg` only in the first 4096 bytes, undocumented — fix now (the comment states the window), fixed 88f58704
- diff-bug #8: a hash added to `TEMPLATE_ICONS` later does not remove a kept record's earlier icon for up to 7 days — reject, planned change: the keep rule (D-066) keeps the deployed facts as they were
- diff-bug #9 (tests): the kept-icon test asserted `icon` again after an exact `toEqual` — fix now (dropped), fixed 88f58704
- diff-bug #10 (tests): "writes no metadata" tests sharp's default — reject, false: it pins this code's output contract that the icon file carries no source metadata, the claim the claim audit asked to back
- diff-bug #11 (tests): the SVG test pinned the red channel — fix now (it checks the alpha channel is opaque), fixed 88f58704
- diff-bug #12 (tests): reader cases repeat pick-rule cases in `test/icon.test.ts` — reject, planned change: AC2 asks for one reader test per named case
- blame-history #1: `icon.ts` imported sharp at module load, so the discovery bot and start-test loaded it through the reader, a use D-073 did not record — fix now (sharp is imported inside `redrawIcon`; D-080 names the data build's use of sharp under D-073's falsifier), fixed 88f58704
- blame-history #2: the kept-icon read adds up to a minute outside `buildMs` — reject, planned change: as diff-bug #4
- blame-history #3: a failed icon cleanup exits 1 after the data is written — fix now, as diff-bug #6, fixed 88f58704
- blame-history #4: sharp might resolve an SVG's external `href` on the runner — reject, false: an SVG `<image>` pointing at a `file://` URL, an absolute path, a relative path, and an `http://` URL each drew nothing (alpha 0), while a `data:` image drew red at full alpha; and diff-bug #1's fix now refuses `<image` outright
- prior-review #1: the approved About line "Zotdex doesn't look at icons before it shows them" is untrue because the build redraws each icon — reject, false: "look at" means a person viewing the icon, and no one does; the build checks format and size, not content; the claim auditor also judged it true; no wording change proposed
- prior-review #2: README's license line omits icons — fix now (README names icons), fixed 88f58704
- prior-review #3: the kept-icon read's time is not in the build's timing lines — reject, planned change: as diff-bug #4; the timing lines cover plugin reads only, as for the existing data read
- prior-review #4: `border-radius: var(--space-6)` used a space token for a radius, and the token test does not see `column-gap` — fix now (`--radius` and `--radius-m`; the style-token test now covers `row-gap` and `column-gap`), fixed 88f58704
- ripple #1: `cairn/references/plain-words-copy.md`'s M111 About entry still gave the old license line as current — fix now (it notes the sentence is replaced at M113 and M114), fixed 88f58704
- ripple #2: README's license line — as prior-review #2, fixed 88f58704
- ripple #3: `docs/maintaining.md` said the build "writes one file" — fix now, fixed 88f58704
- ripple #4: `docs/maintaining.md`'s write-failure list omitted an icon write — fix now, fixed 88f58704
- ripple #5: DESIGN's data build bullet omitted the icon writes — fix now, fixed 88f58704
- ripple #6: DESIGN's workflow bullet omitted the icon writes — fix now, fixed 88f58704
- ripple #7: `docs/maintaining.md` described `reason-not-blank` for overrides only — fix now, fixed 88f58704
- ripple #8: DESIGN's reader bullet omitted the returned icon bytes — fix now, fixed 88f58704; the line in the `holds.ts` bullet names only what `draftEntry` reads, so it stays — reject, false
- ripple #9: DESIGN's About topic list omitted icons — fix now, fixed 88f58704
- ripple #10: the plugins.v1 schema's title line says the file is what `pnpm build` writes — reject, false: the data file is still exactly what that names
- After the fixes at 88f58704: `pnpm test` 2556 passed, 6 skipped; `pnpm check` 745 entries, 0 problems; the AC6 look rerun passes at 375 and 1280 px in light and `data-theme="dark"` (tile edge 0 px, 0 of 20 text nodes, no scroll, white tile).
- 2026-11-07: step-7 approval: m113-plugin-icons approved for merge
