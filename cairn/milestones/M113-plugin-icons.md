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

- [ ] AC1: For an XPI whose manifest.json `icons` object maps keys to string paths, the build picks among the keys
      that are base-10 whole numbers (others are ignored) the smallest at or above 96, else the largest. When the
      picked path names a file in the XPI that is PNG, JPEG, WebP, or SVG, judged by its bytes, `pnpm build` writes
      one 96×96 PNG to `v1/icons/<sha>.png` in its output, `<sha>` being the SHA-256 of the written bytes, and sets
      the record's optional `upstream.icon` to `icons/<sha>.png`. An SVG with no width or height is drawn at 96 px.
      A path with a leading `/` or `./` is read without it. Tests cover each of the four formats, a non-numeric key,
      the smallest key at or above 96, the fall-back to the largest, and a leading `/`, and decode the written file
      as a 96×96 PNG.
- [ ] AC2: The record has no `upstream.icon`, and its other fields and any failure are the same as for the same XPI
      with no `icons` field, when: `icons` is absent or not an object; no key is a whole number; the picked value is
      not a string or holds a `..` segment; the picked file is missing from the XPI; any read of that zip entry fails
      (over 1 MiB unzipped, a duplicate name, inflation past its declared size, an unknown compression method); the
      bytes are none of the four formats or fail to decode; sharp's metadata gives a width or height over 4096 px;
      or the SHA-256 of the bytes is in `TEMPLATE_ICONS`, each value recorded with its source path and commit. One
      test for each case named here; the template case injects a hash rather than the template's bytes.
- [ ] AC3: `schemas/plugins.v1.schema.json` defines `upstream.icon` as an optional string matching
      `^icons/[0-9a-f]{64}\.png$`, and `schemas/index.v1.schema.json` defines an optional
      `iconHidden: { "reason": <string, minLength 1> }`; the schema tests pass with and without each field, and the
      plugins.v1 test passes on the data fixture written before this change.
- [ ] AC4: A record that keeps deployed facts under the 7-day rule keeps the deployed `upstream.icon`, unless its
      `index.json` has `iconHidden`, and the build writes that icon file, fetched from the URL resolved against
      `--previous`, within `previousMs` and a size cap, and checked against the SHA-256 in its name. A failed or
      late fetch, a file over the cap, or wrong bytes leaves that record without `upstream.icon` and changes no
      other record and not the exit code. Tests cover the match, a failed fetch, a mismatch, and a hidden icon.
- [ ] AC5: An `index.json` with `iconHidden` gives that plugin's record no `upstream.icon`, a kept record included,
      and the build writes no icon file for it. `pnpm check`'s `reason-not-blank` rule covers `iconHidden.reason`.
      Tests cover a hidden icon on a read record, an empty reason, and a whitespace-only reason.
- [ ] AC6: The plugin page of a record with `upstream.icon` shows one `<img data-icon>` whose `src` is `${BASE}v1/`
      followed by `upstream.icon`, with `alt=""`, `width="64"`, and `height="64"`, on a tile whose computed
      background is white in the light theme, with a dark system scheme and no saved theme, and with
      `data-theme="dark"`, and which sets `forced-color-adjust: none`. At viewport widths of 375 px and 1280 px, for
      a fixture with a 40-character name, the Archived and Older data badges, a kept note, and a 200-character
      description, the tile's right edge is within 1 px of `.page-head`'s right edge, its top is above the `h1`'s
      bottom, no client rect of a text node in `.page-head` meets the tile's rect, and the page has no horizontal
      scroll at 375 px. A browser-pane look in the Review checks these; site tests check the attributes. A record
      without the field has no `[data-icon]` element.
- [ ] AC7: Each line that `cairn/references/plain-words-copy.md` records for M113 appears word for word on the
      built site (the About page's "Icons" section and the license line); `docs/data.md` documents `upstream.icon`
      and `iconHidden`, and `docs/license.md` says plugin icons keep their authors' terms.
- [ ] AC8: `pnpm test` and `pnpm check` pass.

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
