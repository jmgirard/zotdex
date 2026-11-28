# M106: Replace the puzzle piece with the Zotdex lens mark

**Status:** done (2026-11-06, PR #855 https://github.com/jmgirard/zotdex/pull/855)

**Goal:** Replace the puzzle-piece logo with Zotdex's own mark, the lens alone at 16 px and the full dex mark where it is drawn large (D-072).

**Outcome:** `src/site/logo.ts` holds the full mark (`FULL_MARK`: blue body, lens opening, three lights, stepped lid gap, disc, Z) on a 16 by 16 grid and the lens mark (`lensMark`, scale 7.5/6 centered at (8, 8)), with fills and SVG writers. Astro endpoints build `favicon.svg` (the lens mark with a dark-scheme rule; `site/public/favicon.svg` deleted) and, through `src/site/logo-png.ts` and `sharp` 0.35.5 (D-073), `favicon.png` (32, lens), `apple-touch-icon.png` (180, full), and `preview.png` (1200, full), all RGB on white with the light fills, sizes and margins from `PICTURES`. The top bar draws the lens mark inline, filled from `--accent`, `--logo-disc`, and `--logo-z` in all three scheme blocks, with a forced-colors rule; `puzzle` left `Icon.astro`. `Base.astro` links the PNG icon, then the SVG, then the touch icon, and adds `og:image` with size and alt "The Zotdex logo". README, About's License, DESIGN, and CHANGELOG describe the new mark. After the merge, build run 42321476423 deployed and the live site served all four files.

**Decisions:** D-072 (the mark), D-073 (`sharp`). Milestone-local: none. AC6 reworded at implement to search tracked files and the test build, since the ignored Astro cache says "puzzle".

**Review:** Four-lens fan-out, 24 findings: 9 fixed (the favicon size test reads a literal, full-mark pixel tests check the lights and lid gap, a `lensMark` comment, a doubled white background, two ragged wraps, two weak or mixed `logo.test.ts` checks, M099's `.brand::before` guard restored), 3 sent to the parked row "Tighten link previews and the icon" (forced colors not rendered, Chrome's icon pick untested, no `/favicon.ico`), 12 rejected as planned changes or style. Hygiene removed the "Add a picture to link previews" row, narrowed "Tighten link previews and the icon" by its PNG-icon item, and marked 7 lessons used; no lesson captured or retired.
