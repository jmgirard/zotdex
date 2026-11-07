# M106: Replace the puzzle piece with the Zotdex lens mark

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the icon in every browser tab, the top bar's logo, the phone home-screen icon, and the picture in link previews
- **Branch/PR:** —

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

- [ ] AC1: The build writes `favicon.svg`, the lens mark in a `0 0 16 16` view box with exactly three shapes: the rim, one `<path>` of two circles with the same center and `fill-rule="evenodd"`; the disc, a `<circle>`; and the Z, a `<path>` of absolute M and L commands only. The light fills are rim `#1d5fb8`, disc `#a9cbff`, and Z `#0e2f5c`. Inside `@media (prefers-color-scheme: dark)` they are rim `#7fb0ff`, disc `#1d5fb8`, and Z `#ffffff`. In each scheme the Z has at least 4.5:1 contrast with the disc, and the rim at least 3:1 with `--bg` and with `--surface`.
- [ ] AC2: The lens mark is the full mark's lens cut out and scaled. The rim's outer circle is centered at (8, 8) with radius 7.5. The rim's inner circle is the full mark's lens opening, its outer circle is that opening grown by 1 unit of the full mark's grid, and the disc and the Z are the full mark's disc and Z, all under the one scale and shift that the outer circle sets. Checked by computing that scale and shift from the full mark's opening in `src/site/logo.ts` and comparing the rim's two circles, the disc's circle, and every Z vertex in the built `favicon.svg`, each within 0.001.
- [ ] AC3: Every built page's `.brand` link starts with an inline SVG with `aria-hidden="true"` that holds the same three elements as `favicon.svg` with the same geometry attributes, followed by the text `Zotdex`. The layout fills the rim, disc, and Z from tokens that take AC1's light values in its light block and AC1's dark values in both dark blocks, so the top bar follows the theme button. Under `@media (forced-colors: active)`, a rule after the base rule fills the rim and disc with `CanvasText` and the Z with `Canvas`.
- [ ] AC4: `src/site/logo.ts` holds the full mark inside the 16 by 16 grid: a rounded body filled `#1d5fb8`, cut by the lens opening, three round lights, and a stepped gap across its full width, plus the disc and the Z with AC1's light fills. The build writes `favicon.png` (32 by 32, the lens mark), `apple-touch-icon.png` (180 by 180, the full mark), and `preview.png` (1200 by 1200, the full mark), each PNG color type 2, bit depth 8, with no `tRNS` chunk. In each file a corner pixel is 255,255,255, and one pixel each inside the rim or body, the disc, and the Z, and one in the ring between the lens opening and the disc, are within 8 per channel of `#1d5fb8`, `#a9cbff`, `#0e2f5c`, and white. Each probed pixel's whole square lies inside its part and outside every other part, by `logo.ts`'s geometry.
- [ ] AC5: Every page that `htmlFiles` lists in the test build links `/favicon.png` with `rel="icon"`, `type="image/png"`, and `sizes="32x32"`, then `/favicon.svg` with `rel="icon"` and `type="image/svg+xml"`, and `/apple-touch-icon.png` with `rel="apple-touch-icon"`. It has `og:image` set to `https://zotdex.jmgirard.com/preview.png`, `og:image:width` and `og:image:height` set to `1200`, `og:image:alt` set to `The Zotdex logo`, and `twitter:card` set to `summary`.
- [ ] AC6: The puzzle piece is gone. A search of `site/`, `src/`, and the test build's output for `M15.39 4.39` and, ignoring case, for `puzzle` finds nothing. README's list of files with Lucide paths no longer names `favicon.svg`, and its count of files that point to `Icon.astro` matches the list.
- [ ] AC7: README's favicon paragraph names the lens mark in the tab and the top bar, the full mark in the touch icon and the preview picture, and the three PNG files, and says that a shared link shows `preview.png`. CHANGELOG's Unreleased entry for the puzzle piece is replaced by one for the new mark. About's License section says that the logo is Zotdex's own, under the code's terms, and credits Lucide and Feather for the other icons. DESIGN's site paragraph names `src/site/logo.ts`, the four files the build writes from it, and `sharp`, and no longer names `site/public/favicon.svg` or the puzzle piece.

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

- [ ] T1: `src/site/logo.ts` with the full mark and the lens mark as shape data and an SVG writer; tests for the full mark's parts and the lens crop.
- [ ] T2: `site/src/pages/favicon.svg.ts` writing the lens mark with both schemes' fills; delete `site/public/favicon.svg`; rewrite the favicon tests.
- [ ] T3: The top bar's logo from `logo.ts`, the logo tokens in all three scheme blocks, the forced-colors rule; drop `puzzle` from `Icon.astro` and `PUZZLE_PATH` uses; rewrite the logo tests.
- [ ] T4: Pin `sharp` 0.35.5; endpoints for `favicon.png`, `apple-touch-icon.png`, and `preview.png` (light fills, flattened on white); PNG header and pixel tests.
- [ ] T5: The head tags in `Base.astro`; tests over every built page.
- [ ] T6: README, About, DESIGN, and CHANGELOG; the puzzle search over `site/`, `src/`, and the test build.
- [ ] T7: Look at the built site in the browser pane: the tab icon and top bar in light, dark, and forced colors, and the three PNG files.

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
