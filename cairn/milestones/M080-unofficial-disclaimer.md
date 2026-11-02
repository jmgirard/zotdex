# M080: Say the index is unofficial and cannot vet plugins

- **Status:** planned
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — every page of the public site and the README state it
- **Branch/PR:** —

## Goal

Each page of the site and the README say that the index is unofficial, not affiliated with or endorsed by Zotero, and cannot vet the plugins it lists.

## Scope

**In:** One sentence in a constant in `site/src/data.ts`, which replaces the footer's "does not vet" line on every page and opens the home page's intro. The About page's last section says the same with the reason, and README, DESIGN, and CHANGELOG state it. The user allowed one hand run of Build data after the merge.

**Out:**
- Renaming the site: no work is planned, since the sentence answers the concern that its name could read as official.
- Vetting plugins, or changing the holds and start tests: no work is planned, as the sentence states the limit.

## Acceptance criteria

- [ ] AC1: Every HTML file that the site build writes from the site test fixture, as `htmlFiles(out)` lists them, has in its footer one `<p data-fact="disclaimer">` whose text is "This index is unofficial and not affiliated with or endorsed by Zotero, and it cannot vet the plugins it lists." None holds `data-fact="not-vetted"` or the words "does not vet".
- [ ] AC2: The built home page's `.intro` paragraph, above the table, opens with that sentence.
- [ ] AC3: The built About page's `not-vetted` section says that the index is unofficial and not affiliated with or endorsed by Zotero, that it cannot vet the plugins it lists, and that the start test is not a review of plugin code.
- [ ] AC4: The opening paragraph of `README.md` says that the index is unofficial, is not affiliated with or endorsed by Zotero, and cannot vet the plugins it lists. `README.md` "The site" and `cairn/DESIGN.md` Contract boundary quote that sentence, and `CHANGELOG.md` Unreleased states it.
- [ ] AC5: In the browser pane, on the site that `npx -y pnpm@12.15.0 site --out <dir>` builds over the downloaded deployed `v1/plugins.json`, the footer line shows on the home, About, and one plugin page at 375 and 1280 px, wrapping at spaces only by eye, and in a same-origin `<iframe>` of that width with `border: 0` the `scrollWidth` of `documentElement` does not pass its `clientWidth`.
- [ ] AC6: The active profile's verify slot is clean, run as the slot names its commands.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T1
- AC4 → T2
- AC5 → T3
- AC6 → T2

## Tasks

- [ ] T1: Add `DISCLAIMER` to `site/src/data.ts`. Use it in the footer of `site/src/layouts/Base.astro` with `data-fact="disclaimer"` on one source line, and at the start of the home intro in `site/src/pages/index.astro`. Rewrite the first sentences of the About section. Update `test/site.test.ts` near lines 585, 599, 774, 782, and 1626, and add tests for AC1, AC2, and AC3 over the built pages.
- [ ] T2: Update the README opening and "The site" near line 244, DESIGN's Contract boundary near line 136, and the CHANGELOG, then run `pnpm test` and `pnpm check` as the verify slot names them.
- [ ] T3: Build the real site and run the AC5 checks in the browser pane, and look at the home intro at 375 and 1280 px (lessons M015, M035, M048, M054, and M079).

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — words on every public page, in running templates, with a choice of wording and place.
- 2026-11-02: idea vet: gap: the site's name still says Zotero; the plan takes a sentence on each page and no rename. gap: where the line goes; the user's answer asked that it also say the index cannot vet plugins and did not choose a place, so the plan took the recommended footer and home intro, and the merge question names this. gap: "cannot vet" goes past DESIGN's "does not review", and the holds, the spam removal, and the start tests screen in part; the user asked for "unable to vet", so About says that the start test is not a review of plugin code.
- 2026-11-02: collision check: the footer line of M053 and M054 and test `data-fact="not-vetted"` are replaced at the user's request; no decision or candidate row overlaps; DESIGN notes that Zotero plans an official directory, and the sentence does not conflict with it.
- 2026-11-02: inbox sweep: 0 open issues; 61 open pull requests, all discovery bot entries, do not overlap.
- 2026-11-02: lessons used: 2026-10-26 (M015), 2026-10-28 (M035), 2026-10-29 (M048), 2026-10-29 (M054), 2026-10-27 (M021), 2026-11-02 (M079).
- 2026-11-02: criteria audit: full mode, a fresh Opus reader; it returned five findings, and four were taken: the two lists that name the line, the eye check for broken words, the build procedure and `border: 0`, and the verify slot's own commands. The fifth, that the verify criterion binds an instrument, was answered: the template keeps it as a gate line.
- 2026-11-02: criteria re-audit after the user's answer changed the sentence: full mode, a fresh Opus reader; it returned five findings, all taken: no built page holds the old words, About gives the reason and does not repeat the footer sentence, "cannot" is recorded in the idea vet, "quote" for the two lists, and the `npx` command with a 1280 px look.
- 2026-11-02: question set: start one Build data run by hand after the merge — yes, allowed once, as `gh workflow run build.yml --ref main`.
- 2026-11-02: plan chose one sentence in one constant over separate lines for the two facts, because the user asked for one disclaimer; falsified by the sentence reading too long at 375 px.

## Decisions

## Review
