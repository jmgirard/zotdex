# M108: Show the full Zotdex mark in the top bar

- **Status:** in-progress
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — every page's top bar changes
- **Branch/PR:** m108-full-mark-top-bar

## Goal

The site's top bar shows the full Zotdex mark at 32 px beside a larger site
name, and the lens mark stays only in the favicon files (D-074).

## Scope

**In:** the top bar's logo becomes the full mark (body with the lens, three
lights, and lid gap cut out, then the disc and the Z) at 2rem, filled from
the scheme tokens, with the brand text at `--text-xl`; `src/site/logo.ts`
gains a classed writer for the full mark's shapes; the site tests, the
README or `docs/site.md` paragraph, DESIGN.md, and the Unreleased CHANGELOG
logo entry describe the change.

**Out:** `favicon.svg`, `favicon.png`, `apple-touch-icon.png`, and
`preview.png` keep their marks and bytes; a large mark on the home or About
page (declined at the plan gate); the parked row "Tighten link previews and
the icon" keeps its forced-colors and icon-pick items.

## Acceptance criteria

- [ ] AC1: On every HTML page of a site build, as the site tests' walk of the
  build folder lists them, the top bar's brand link holds one SVG with
  `aria-hidden="true"` and the view box `0 0 16 16`, then the text "Zotdex".
  The SVG's tags, with fills and classes set aside, equal the full-mark tags
  that `pictureSvg("apple-touch-icon.png")` writes, as a site test shows.
- [ ] AC2: The SVG is 2rem wide and 2rem tall, and the brand text's font size
  is `var(--text-xl)`. The body takes `--accent`, the disc `--logo-disc`, and
  the Z `--logo-z`, in the light block and both dark blocks. In forced colors
  the body and disc are `CanvasText` and the Z is `Canvas`.
- [ ] AC3: A site build's `favicon.svg`, `favicon.png`,
  `apple-touch-icon.png`, and `preview.png` are byte-identical to a build of
  `main` at the milestone's branch point, as `cmp` shows.
- [ ] AC4: In the browser pane, a built home page and one plugin page at 375
  px and 1280 px wide, each in the light scheme and in the dark scheme set
  with the top bar's theme button, show the full mark with its three lights
  and lid line visible, as a zoom of the logo region shows, and
  `document.documentElement.scrollWidth` equals `clientWidth` on each.
- [ ] AC5: A case-insensitive search for `lens`, `rim`, `same mark`,
  `top bar`, and `top$` in `README.md`, `docs/`, `cairn/DESIGN.md`, the
  `## Unreleased` part of `CHANGELOG.md`, `src/site/logo.ts`,
  `site/src/layouts/Base.astro`, and `test/site.test.ts` lists every hit.
  For each hit the whole sentence is read, and every sentence that describes
  the top bar's logo describes the full mark. `pnpm test` passes.

## Coverage

- AC1 → T1, T2, T3
- AC2 → T2, T3
- AC3 → T1, T5
- AC4 → T2, T5
- AC5 → T4, T5

## Tasks

- [x] T1: In `src/site/logo.ts`, add an exported writer of the full mark's
  shapes that, like `lensShapes`, takes fills or writes the classes
  `logo-body`, `logo-disc`, and `logo-z`, and have `pictureSvg` use it with
  the light fills so its output stays byte-identical. Update the file's top
  comment, which names the top bar as a 16 px place.
- [x] T2: In `site/src/layouts/Base.astro`, draw the full mark in the brand
  link (line 1106) at 2rem, set the brand text to `var(--text-xl)`, fill the
  body from `--accent` and keep the disc and Z rules, and move the
  forced-colors rule to the body class (styles near lines 211-243).
- [x] T3: In `test/site.test.ts`, change "the logo" tests (near line 2872) and
  the top-bar markup test (near line 2035) to the full mark per AC1 and AC2,
  keeping the favicon's own tests; see the search that AC5 names for test
  names that say "lens" or "favicon's three shapes".
- [x] T4: Run AC5's search and rewrite each sentence that says the top bar
  shows the lens: the README or `docs/site.md` paragraph (whichever holds the
  logo text after M107), DESIGN.md near lines 577-579 and 1095-1099, the
  Unreleased CHANGELOG entry near line 75, and the comments in `logo.ts` and
  `Base.astro`.
- [x] T5: Build the site on the branch and at the branch point and `cmp` the
  four icon files (AC3); serve the build in the browser pane and check the
  eight views of AC4; run `pnpm test`.

## Work log

- 2026-11-06: created by /milestone-plan.
- 2026-11-06: tier check: milestone — a change to running code that a recorded decision (D-072) set, not a bug that restores documented behavior.
- 2026-11-06: idea vet: gap — the mark's size and any other placement were open, posed at the set (32 px, top bar only); gap — the user's answer asked for larger brand text, read as the next step of the site's type scale, `--text-xl` (1.375rem, from `--text-base` 0.9375rem); no flaw.
- 2026-11-06: collision check: D-072's clause "the tab and the top bar show the lens alone" is superseded by D-074 in this plan commit; M106 (done) shipped the lens in the top bar; the parked row "Tighten link previews and the icon" stays separate; inbox sweep: 0 open issues, 14 bot pull requests, none overlapping.
- 2026-11-06: lessons used: 2026-10-25 (M001) pnpm via npx; 2026-10-26 (M015) serve the built site for the browser pane; 2026-10-28 (M035) download the deployed data for a hand check; 2026-10-29 (M048) iframe width check; 2026-10-30 (M063) cssRules drops @media wrappers; 2026-10-31 (M066) only a build run deploys; 2026-11-02 (M079) hidden pane and requestAnimationFrame.
- 2026-11-06: criteria audit (full mode, fresh Opus) returned 5 findings, all taken: AC5's line search missed wrapped and reworded claims, so it now searches five patterns and reads whole sentences; AC5 left D-074's content unsaid, so D-074 now names the clause it supersedes and why 32 px works (written at plan); AC4's dark scheme is set with the theme button, since the pane's scheme emulation does not reach a static preview, and a zoom shows the 3 px lights; AC4's screenshot-record sentence bound the evidence, so it was cut; AC1's test target was ambiguous and could be circular, so it now compares with `pictureSvg("apple-touch-icon.png")`. No finding on AC2 or AC3.
- 2026-11-06: plan gate chose 32 px over 24 px and 40 px because at 32 px the lights are 3 px and the lid line 2 px while the mark fits the 3.25rem top bar; falsified by a zoomed screenshot at 375 or 1280 px where the lights or lid line do not show.
- 2026-11-06: plan gate chose the top bar only over adding a large mark to the About or home page because one change covers every page and the table stays where it is; falsified by a user asking for the mark on a page.
- 2026-11-06: question set: mark size — 32 px, with the "Zotdex" text larger; placement — top bar only.
- 2026-11-06: order: M107 is in progress in the same checkout, so M108 starts after M107 merges; this plan commit was made from a temporary checkout of main so the M107 branch stayed checked out.
- 2026-11-06: implement started on m108-full-mark-top-bar, cut from main at 68a5c1fe after M107 merged.
- 2026-11-06: T1 choice: `fullShapes(fills?)` writes fills only when given (no class), so `pictureSvg` output stays the bytes main wrote, and classes only without fills; `pictureSvg` and `faviconSvg` output compared equal to main's `logo.ts` for all four files.
- 2026-11-06: T3 plant: with `lensShapes()` put back in the top bar, the new "is the full mark's three shapes" test failed on 404.html; restored.
- 2026-11-06: T4: the style hook flagged older sentences in `docs/site.md` and `CHANGELOG.md` (moved unchanged by M107, or released entries); none is in the sentences this milestone wrote, so they stay.
- 2026-11-06: checkpoint: T1 to T5 code and docs done; site and logo tests 507 passed; four icon files byte-identical to the branch point's build (cmp); eight browser-pane views passed; full `pnpm test` and `pnpm check` running, tasks not ticked yet.
- 2026-11-06: verify clean: `pnpm test` 37 files passed, 1 skipped, 2509 tests passed, 6 skipped; `pnpm check` 741 entries, 0 problems; T1 to T5 ticked; claim audit running.

## Decisions

## Review
