# M106: Replace the puzzle piece with the Zotdex lens mark

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the icon in every browser tab, the top bar's logo, the phone home-screen icon, and the picture in link previews
- **Branch/PR:** m106-zotdex-lens-mark, https://github.com/jmgirard/zotdex/pull/855

## Goal

Replace the puzzle-piece logo with Zotdex's own mark, the lens alone at 16 px and the full dex mark where it is drawn large (D-072).

## Scope

**In:**
- `src/site/logo.ts`: the full mark (F on the user's sketch canvas) on a 16 by 16 grid, and the lens mark (S4), cut from the full mark's lens and scaled.
- A built `favicon.svg` (an Astro endpoint) in place of `site/public/favicon.svg`.
- The top bar's logo drawn from the lens mark, with its colors from scheme tokens and a forced-colors rule; `puzzle` leaves `Icon.astro`.
- `sharp` 0.35.5 as a direct dependency (D-073), and built `favicon.png`, `apple-touch-icon.png`, and `preview.png`.
- The head tags for the three files and `og:image`.
- README, About, `cairn/DESIGN.md`, and CHANGELOG.
- After the merge: run `gh workflow run build.yml --ref main`, then read the three PNG files and `favicon.svg` from `https://zotdex.jmgirard.com/`. No criterion covers it; review records it in the work log.

**Out:**
- A web app manifest with Android icons: not planned; Android falls back to the touch icon.
- A preview picture per plugin page: not planned; every page shares `preview.png`.
- The rest of "Tighten link previews and the icon" (the cut marks, stray spaces, `ORIGIN`, About's sources) stays in that row.
- A logo inside the README badge: not planned; the badge keeps its text label (D-071).

## Acceptance criteria

- [x] AC1: The build writes `favicon.svg`, the lens mark in a `0 0 16 16` view box with exactly three shapes: the rim, one `<path>` of two circles with the same center and `fill-rule="evenodd"`; the disc, a `<circle>`; and the Z, a `<path>` of absolute M and L commands only. The light fills are rim `#1d5fb8`, disc `#a9cbff`, and Z `#0e2f5c`. Inside `@media (prefers-color-scheme: dark)` they are rim `#7fb0ff`, disc `#1d5fb8`, and Z `#ffffff`. In each scheme the Z has at least 4.5:1 contrast with the disc, and the rim at least 3:1 with `--bg` and with `--surface`.
- [x] AC2: The lens mark is the full mark's lens cut out and scaled. The rim's outer circle is centered at (8, 8) with radius 7.5. The rim's inner circle is the full mark's lens opening, its outer circle is that opening grown by 1 unit of the full mark's grid, and the disc and the Z are the full mark's disc and Z, all under the one scale and shift that the outer circle sets. Checked by computing that scale and shift from the full mark's opening in `src/site/logo.ts` and comparing the rim's two circles, the disc's circle, and every Z vertex in the built `favicon.svg`, each within 0.001.
- [x] AC3: Every built page's `.brand` link starts with an inline SVG with `aria-hidden="true"` that holds the same three elements as `favicon.svg` with the same geometry attributes, followed by the text `Zotdex`. The layout fills the rim, disc, and Z from tokens that take AC1's light values in its light block and AC1's dark values in both dark blocks, so the top bar follows the theme button. Under `@media (forced-colors: active)`, a rule after the base rule fills the rim and disc with `CanvasText` and the Z with `Canvas`.
- [x] AC4: `src/site/logo.ts` holds the full mark inside the 16 by 16 grid: a rounded body filled `#1d5fb8`, cut by the lens opening, three round lights, and a stepped gap across its full width, plus the disc and the Z with AC1's light fills. The build writes `favicon.png` (32 by 32, the lens mark), `apple-touch-icon.png` (180 by 180, the full mark), and `preview.png` (1200 by 1200, the full mark), each PNG color type 2, bit depth 8, with no `tRNS` chunk. In each file a corner pixel is 255,255,255, and one pixel each inside the rim or body, the disc, and the Z, and one in the ring between the lens opening and the disc, are within 8 per channel of `#1d5fb8`, `#a9cbff`, `#0e2f5c`, and white. Each probed pixel's whole square lies inside its part and outside every other part, by `logo.ts`'s geometry.
- [x] AC5: Every page that `htmlFiles` lists in the test build links `/favicon.png` with `rel="icon"`, `type="image/png"`, and `sizes="32x32"`, then `/favicon.svg` with `rel="icon"` and `type="image/svg+xml"`, and `/apple-touch-icon.png` with `rel="apple-touch-icon"`. It has `og:image` set to `https://zotdex.jmgirard.com/preview.png`, `og:image:width` and `og:image:height` set to `1200`, `og:image:alt` set to `The Zotdex logo`, and `twitter:card` set to `summary`.
- [x] AC6: The puzzle piece is gone. `git grep -i -e puzzle -e 'M15.39 4.39' -- site src` finds nothing in the files git tracks under `site/` and `src/`, and the same two searches, `puzzle` ignoring case and `M15.39 4.39`, find nothing in any file of the test build's output. README's list of files with Lucide paths no longer names `favicon.svg`, and its count of files that point to `Icon.astro` matches the list.
- [x] AC7: README's favicon paragraph names the lens mark in the tab and the top bar, the full mark in the touch icon and the preview picture, and the three PNG files, and says that a shared link shows `preview.png`. CHANGELOG's Unreleased entry for the puzzle piece is replaced by one for the new mark. About's License section says that the logo is Zotdex's own, under the code's terms, and credits Lucide and Feather for the other icons. DESIGN's site paragraph names `src/site/logo.ts`, the four files the build writes from it, and `sharp`, and no longer names `site/public/favicon.svg` or the puzzle piece.

## Coverage
<!-- owner: plan · create/amend-via-gate; one line per criterion, AC → tasks by positional number -->

- AC1 → T2
- AC2 → T1, T2
- AC3 → T3
- AC4 → T1, T4
- AC5 → T5
- AC6 → T3, T6
- AC7 → T6

## Tasks

- [x] T1: `src/site/logo.ts` with the full mark and the lens mark as shape data and an SVG writer; tests for the full mark's parts and the lens crop.
- [x] T2: `site/src/pages/favicon.svg.ts` writing the lens mark with both schemes' fills; delete `site/public/favicon.svg`; rewrite the favicon tests.
- [x] T3: The top bar's logo from `logo.ts`, the logo tokens in all three scheme blocks, the forced-colors rule; drop `puzzle` from `Icon.astro` and `PUZZLE_PATH` uses; rewrite the logo tests.
- [x] T4: Pin `sharp` 0.35.5; endpoints for `favicon.png`, `apple-touch-icon.png`, and `preview.png` (light fills, flattened on white); PNG header and pixel tests.
- [x] T5: The head tags in `Base.astro`; tests over every built page.
- [x] T6: README, About, DESIGN, and CHANGELOG; the puzzle search over `site/`, `src/`, and the test build.
- [x] T7: Look at the built site in the browser pane: the tab icon and top bar in light, dark, and forced colors, and the three PNG files.

## Work log
<!-- owner: any skill · append-only; one line per entry, absolute dates (YYYY-MM-DD) -->

- 2026-11-06: tier check: milestone — new logo files, a new dependency, and new head tags change what every page shows and need design decisions.
- 2026-11-06: idea vet: none found. The design was picked from drawn options on the user's sketch canvas (F full, S4 at 16 px); the mark hints at a Pokedex without copying its red body or exact layout, which the user weighed in chat.
- 2026-11-06: lessons used: 2026-10-25 (M001), 2026-10-26 (M015), 2026-10-28 (M036), 2026-10-30 (M063), 2026-10-31 (M066), 2026-11-02 (M082).
- 2026-11-06: collision check: M094 (favicon, text-only previews at the user's choice) and M099 (puzzle logo) are done; this replaces M099's mark and keeps its inline-SVG choice for the top bar. Absorbs "Add a picture to link previews" in full (its condition, the user asking, holds) and the PNG-icon part of "Tighten link previews and the icon". No D-entry rejects it.
- 2026-11-06: inbox sweep: 0 open issues; 14 open bot "Add" PRs, none overlapping.
- 2026-11-06: criteria audit (full): 19 findings. Applied: the rim as an even-odd path, dark fills named per shape, the rim checked on `--surface` too, the lens scale fixed by the outer circle at (8, 8) radius 7.5, the crop computed apart from the endpoint's code, the full mark's parts and body color (new AC4 text, merged with the PNG criterion), PNG type 2 with no `tRNS`, probes for the corner, the Z, and the ring placed by geometry, the alt text pinned so the home-only name test holds, `puzzle` in the search, README's file count, About's credit reworded to a claim that is false today, and the stale README, CHANGELOG, and DESIGN lines. Noted: the test rewrites at `test/site.test.ts` 2035 and 2724-2773; librsvg ignores the dark media query, so PNGs take the light fills.
- 2026-11-06: alternative rejected: committing PNGs made once on the Mac with `sips`, as a later logo change would leave them stale; this is wrong if `sharp` fails to install on the build runner.
- 2026-11-06: alternative rejected: a 1200 by 630 banner with the name drawn in, at the user's choice, as it needs text as shapes; this is wrong if apps show the square picture too small to read.
- 2026-11-06: question set: `sharp` dependency — add it, pinned at 0.35.5 (D-073).
- 2026-11-06: question set: preview picture — square full mark, 1200 by 1200, on white.
- 2026-11-06: question set: after the merge — run `build.yml` on main and read the live files.
- 2026-11-06: design choice: the lens mark's rim is 1 unit of the full mark's grid wide and its outer circle has radius 7.5, leaving 0.5 at each edge of the 16 px icon; the touch icon and preview draw the full mark on white with a margin set at implement.
- 2026-11-06: started on branch m106-zotdex-lens-mark, cut from main at 10e690d5.
- 2026-11-06: T1 done: `src/site/logo.ts` holds `FULL_MARK`, `lensMark` (scale 7.5/6, lens centered at (8, 8)), the fills, and SVG writers; the lid gap sits at y 12 to 13 so it ends above the body's lower corners; `test/logo.test.ts` (4 tests) fails when a light overlaps the lens; verify green (2499 passed, check 0 problems).
- 2026-11-06: T2 done: `site/src/pages/favicon.svg.ts` writes `faviconSvg()`; `site/public/favicon.svg` deleted; three favicon tests replace the puzzle ones (shapes, fills and contrast, the crop computed in the test from `FULL_MARK.opening`); a Z shifted 0.01 fails the crop test; the logo test compares with `PUZZLE_PATH` until T3; verify green (2499 passed).
- 2026-11-06: T3 done: the `.brand` link draws `lensShapes()` in `<svg class="logo">`; `--logo-disc` and `--logo-z` in all three scheme blocks, the rim on `--accent`; forced colors fill rim and disc `CanvasText`, Z `Canvas`; `puzzle` and its comments left `Icon.astro`, `PUZZLE_PATH` left the tests; a 4.9 disc radius in the top bar fails the logo test; verify green (2499 passed).
- 2026-11-06: T4 done: `sharp` pinned at 0.35.5 (lockfile only re-marks it, no download); `PICTURES` in `logo.ts` sets each PNG's mark, margin, and size (lens 0 at 32, full 2 at 180, full 4 at 1200); `src/site/logo-png.ts` draws each SVG at its own size and flattens on white; three endpoints; `test/support/logo-geometry.ts` holds the shape tests shared by `logo.test.ts` and six new PNG tests; a blue disc in the full mark fails the pixel test; verify green (2505 passed).
- 2026-11-06: T5 done: `Base.astro` links `favicon.png` (32x32) before `favicon.svg`, then `apple-touch-icon.png`, and adds `og:image`, its width and height from `PICTURES`, and the alt "The Zotdex logo"; two tests over every built page replace the one-icon link test; a dropped `sizes` and a changed alt fail them; verify green (2506 passed).
- 2026-11-06: substantive amendment: AC6's search of `site/` also read the ignored `site/node_modules/.astro` cache, where Astro's dev toolbar says "puzzle", so it could never pass; it now names `git grep` over tracked files plus the test build's output; wording only, what users see is unchanged, so no stop.
- 2026-11-06: re-audit: AC6 (full) — nothing blocking; one optional note (the `-i` also covers `M15.39 4.39`, and without `-F` the dot matches any character, both stricter); not applied, so the audited wording stands.
- 2026-11-06: T6 done: README (favicon paragraph with the three PNG files as a list, `pnpm site` output, the third-party list now three files plus a logo line), CHANGELOG (the preview entry names `preview.png`, the puzzle entry replaced), About's License (the logo is the index's own, other icons from Lucide and Feather) and its test, DESIGN (site build files, `logo.ts`, `logo-png.ts`, head links, top-bar tokens); a test sweeps every built file for `puzzle` and `M15.39 4.39`, and "Puzzle" in the alt text fails it; `git grep` over tracked `site/` and `src/` finds nothing; no new prose-lint hits; verify green (2507 passed, check 0 problems).
- 2026-11-06: T7 done: built the site from the deployed `plugins.json` (738 pages) and served it in the browser pane; the top-bar logo is 16 by 16 and computes rim, disc, and Z as `#7fb0ff`, `#1d5fb8`, `#ffffff` in dark and `#1d5fb8`, `#a9cbff`, `#0e2f5c` in light; the page links the three icons in order; `preview.png` and `apple-touch-icon.png` read as the full mark on white. Forced colors were not emulated; the CSS rule order has a test.
- 2026-11-06: claim-audit corrections applied (CHANGELOG's "same shapes" line, Base.astro's `sizes` comment narrowed to Chrome, logo.ts's lid-gap comment, DESIGN's "writes" to "builds the text of"); the reader's one re-read is pending.
- 2026-11-06: claim audit: 41 claims read, 4 corrected — CHANGELOG.md, site/src/layouts/Base.astro, src/site/logo.ts, cairn/DESIGN.md; the re-read found all four right; a DESIGN line joined by an Edit was rewrapped.
- 2026-11-06: implement done: all 7 tasks checked; verify green (2507 passed, 6 skipped; check 0 problems); status review.
- 2026-11-06: step-7 approval: m106-zotdex-lens-mark approved for merge
- 2026-11-06: resume: PR #855 open with CI running, main unmoved at 10e690d5; re-entered at route (c), the PR conversation read empty, the merge chip re-posed.
- 2026-11-06: step-7 approval: m106-zotdex-lens-mark approved for merge

## Decisions

## Review

Fresh run on the branch at 1e4a7932, main at 10e690d5 (no new commits): `pnpm test` 2507 passed, 6 skipped; `pnpm check` 0 problems. Per-test results from a verbose run of `test/logo.test.ts` and the logo tests in `test/site.test.ts`, all passing.

- AC1: "draws the lens mark in a 16 by 16 view box" and "fills the rim, disc, and Z with each scheme's colors" pass. The scratch build from deployed data has `viewBox="0 0 16 16"`, an even-odd rim path of two circles at (8, 8), a `<circle>` disc, an M/L Z, light fills `#1d5fb8`, `#a9cbff`, `#0e2f5c`, and dark rules `#7fb0ff`, `#1d5fb8`, `#ffffff`. Contrast: Z on disc 8.02 light, 6.21 dark; rim on `--bg` 5.79 and 8.24, on `--surface` 6.21 and 7.60.
- AC2: "is the full mark's lens cut out and scaled so the rim's outer edge has radius 7.5" passes; it computes scale 7.5/6 and the shift from `FULL_MARK.opening` in the test and compares all three circles and 10 Z corners within 0.001. A Z moved 0.01 fails it (T2 work log). The built rim reads `M0.5 8 … 15.5 8` (r 7.5) and `M1.75 8 … 14.25 8` (r 6.25 = 5 × 1.25).
- AC3: "is the favicon's three shapes, hidden from screen readers, before the site's name on every page" and "fills the rim, disc, and Z from each scheme's tokens, with CanvasText and Canvas in forced colors" pass; the token test reads `--logo-disc` and `--logo-z` in all three blocks with AC1's values, and the rim on `--accent`. In the browser pane (T7) the logo is 16 by 16 and computes AC1's light and dark fills under each `data-theme`. Forced colors were not emulated.
- AC4: the four `logo.test.ts` tests pass (body `#1d5fb8` inside the grid; opening, three lights, and lid gap cut out apart; gap spans x 1 to 15 and steps up; disc in opening, Z in disc). The six PNG tests pass. Header reads of the scratch build: `favicon.png` 32×32, `apple-touch-icon.png` 180×180, `preview.png` 1200×1200, each depth 8, type 2, chunks IHDR, pHYs, IDAT, IEND with no tRNS. The pixel test probes the corner, rim or body, disc, Z, and ring at geometry-placed pixels; a blue disc fails it (T4 work log).
- AC5: "is linked from every page as a PNG, then an SVG, beside the touch icon" and "gives every page the preview picture, its size, and its alt text" pass over `ids.length + 3` pages, 404 included; the browser pane read the three links in order (T7).
- AC6: `git grep -i -e puzzle -e 'M15.39 4.39' -- site src` exits 1. "leaves nothing of the old puzzle piece in any built file" passes over every file of the test build, PNGs included; "Puzzle" planted in the alt text fails it (T6 work log). README's Lucide list names `Icon.astro`, `test/site.test.ts`, and the two mockup files, not `favicon.svg`, and says "the other three files point to it"; each of the three names `Icon.astro` (claim audit re-read).
- AC7: README's favicon paragraph names the lens mark in the tab and top bar, the full logo, and the three PNG files with their uses, and its preview paragraph says a shared link shows `preview.png`. CHANGELOG's Unreleased icon entry now describes the lens mark and full logo, and no `puzzle` remains in CHANGELOG or README. About's License says "The Zotdex logo is the index's own drawing, under the same terms as its code" and credits Lucide and Feather for the other icons; its test passes. DESIGN names `src/site/logo.ts`, the four built files, `logo-png.ts`, and `sharp`; `grep` finds no `public/favicon` or `puzzle` in DESIGN.
- Consistency gate: `cairn_validate` all checks passed (exit 0); no principle changed, so no `cairn_impact`; the generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: the PNG size test reads sizes from `PICTURES`, the code under test, and `sizes="32x32"` is a separate literal, so a changed favicon size passes every test — fix now, fixed 4583dd12
- diff-bug #2: no test checks that the full-mark PNGs show the three lights and the lid gap; dropping either cut passes — fix now, fixed 4583dd12
- diff-bug #3: the lens mark's rim is the opening grown by 1, not a crop (the full body is 0.5 wide left of the lens), so the `lensMark` comment "nothing is redrawn" overstates — fix now (comment; AC2 defines the rim this way), fixed 4583dd12
- diff-bug #4: `favicon.png` is opaque white outside the lens, so a browser that uses it shows a white square on a dark tab strip — reject, planned change: AC4 asks for no alpha on a white background
- diff-bug #5: the white background is drawn twice, by the SVG `<rect>` and by `flatten` — fix now (drop the rect), fixed 4583dd12
- diff-bug #6: the forced-colors rule was not rendered in a browser — follow-up: absorbed into the parked row "Tighten link previews and the icon", which keeps `promote when a user reports it`
- diff-bug #7: ROADMAP's "Tighten link previews and the icon" still lists the PNG icon gap, and "Add a picture to link previews" is done — reject, planned change: step 9's hygiene narrows and removes them
- diff-bug #8: Base.astro's comment that `sizes` keeps Chrome from choosing the PNG is not tested here — follow-up: absorbed into the same parked row (check which icon Chrome shows)
- diff-bug #9: no `/favicon.ico` for tools that skip link tags — follow-up: absorbed into the same parked row; not a regression
- diff-bug #10: ragged wraps in CHANGELOG ("link previews. A") and README ("description. The") — fix now, fixed 4583dd12
- diff-bug #11 (question c): `expect(disc.r).toBeLessThan(opening.r)` in `logo.test.ts` is a weaker check before an exact one — fix now (drop it), fixed 4583dd12
- diff-bug #12 (question c): fill constants are checked inside two geometry tests of `logo.test.ts` — fix now (one fills test), fixed 4583dd12
- diff-bug #13 (question c): the name "leaves nothing of the old puzzle piece" refers to past code — reject, style; AC6 asks for the output search
- diff-bug #14 (question c): the header test runs three times over one path and checks sharp's output format — reject, planned change: AC4 asks for each file's type and size
- diff-bug #15 (question c): the two every-page loops run one layout path — reject, planned change: AC5 says every page
- blame-history #1: the PNG favicon comes first and has no dark form, against M094's both-accents favicon — reject, planned change: AC4 and AC5 set an opaque PNG fallback first; the SVG keeps both schemes
- blame-history #2: M099's guard `not.toContain(".brand::before")` was dropped with the old logo test — fix now (restore it), fixed 4583dd12
- blame-history #3: picture in link previews reverses M094's text-only choice — reject, planned change: the user asked for it at the M106 question set
- blame-history #4: the 404 page now carries `og:image` — reject, planned change: AC5 covers every page, and no rule forbids it
- prior-review #1: picture in previews reverses M094 — reject, planned change (as blame-history #3)
- prior-review #2: ragged wraps — fix now (as diff-bug #10), fixed 4583dd12
- Fixes re-verified: `pnpm test` 2508 passed, 6 skipped; `pnpm check` 0 problems; a full mark with no light or lid cuts fails the two full-mark pixel tests.
- prior-review #3: M095's license-pointer test for `favicon.svg` removed — reject, planned change: the favicon holds no Lucide path
- ripple #1: ROADMAP row "Tighten link previews and the icon" lists the PNG gap — reject, planned change (step 9 narrows it)
- ripple #2: ROADMAP row "Add a picture to link previews" still parked — reject, planned change (step 9 removes it)
