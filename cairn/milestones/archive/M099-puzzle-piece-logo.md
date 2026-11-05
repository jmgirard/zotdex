# M099: Replace the red logo with a blue puzzle piece

**Status:** done (2026-11-05, PR #838 https://github.com/jmgirard/zotero-plugin-index/pull/838)

**Goal:** The site's logo no longer looks like an error, and red on the site means only a problem.

**Outcome:** `site/public/favicon.svg` draws the `puzzle` path of lucide-static 1.68.0, filled, in `#1d5fb8` and, through a media query, `#7fb0ff`. `Icon.astro` gained `puzzle`, and the `.brand` link in `Base.astro` shows it, filled with `--accent`, with `fill: CanvasText` in forced colors; `.brand::before` is gone. `--accent` now has the values of `--link`, so the pressed version button's bar is blue too. The About credit now says "The icons on these pages", and the README's list of files with Lucide paths names `favicon.svg`. The user chose the look from drawn options and asked for a build after the merge.

**Decisions:** none cross-cutting. The logo is an inline SVG and not an `<img>` of the favicon, because the favicon's media query follows the system scheme and not the site's theme button.

**Review:** Criteria audit (full) 5 findings, all taken. Claim audit 28 claims, 1 corrected. Four lenses, 22 findings: 10 fixed (About's credit, which M095's review had worded to leave out the favicon; DESIGN's icon list and path wording; `Icon.astro`'s comment; a short README line); 12 rejected (7 planned change, 4 false, 1 style); none sent to a row. Lessons marked used: M001, M015, M035, M063, M066, M082. None captured or retired. No Known issues entry.
