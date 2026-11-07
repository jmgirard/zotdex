# M109: Make the home page a field guide

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the home page's heading and intro
- **Branch/PR:** —

## Goal

The home page's heading and intro read as the user chose them at the plan
gate, in place of "Plugins for Zotero 7 and later" and its intro (D-075).

## Scope

**In:** the hero `<h1>` and intro paragraph in `site/src/pages/index.astro`,
dropping the now-unused `DISCLAIMER` import there; the home intro test in
`test/site.test.ts`; DESIGN.md's sentence on what the home intro says; one
Unreleased CHANGELOG entry.

**Out:** the footer, which keeps the shared `DISCLAIMER` sentence; the page
`<title>` and meta description (D-069); real trust signals for plugins, which
the user set aside for now (no row: the user did not ask for one).

## Acceptance criteria

- [ ] AC1: The built home page `index.html` holds exactly one `<h1>`, and its
  text is "Your field guide to Zotero plugins", as a site test shows by
  matching `/<h1[\s>]/g` once in `index.html` and reading that tag's text.
- [ ] AC2: The built home page's intro paragraph, with tags removed and spaces
  joined, reads "Zotero can do a lot more with the right plugins. Browse
  hundreds of them, from AI assistants and translation tools to better ways
  to read PDFs and take notes. Each entry tells you what a plugin does, who
  makes it, and which Zotero versions it supports. Zotdex is independent and
  unofficial, and it doesn't review anyone's code, so look into a plugin
  before you trust it with your library. How to install a plugin.", where
  `<a href="/about/#installing">How to install a plugin</a>` is followed by
  ".", as the updated intro test shows.
- [ ] AC3: `git diff main -- site/src` changes only the hero's heading and
  intro lines and the `DISCLAIMER` import in `site/src/pages/index.astro`,
  and the test "names the site Zotdex in every page's site name and title"
  passes with no change to its lines.
- [ ] AC4: `git grep -n -e "Plugins for Zotero 7 and later" -e "See which
  Zotero versions" -- site/ test/ docs/ README.md CHANGELOG.md src/` at the
  branch head lists no line, and `git grep -c "plugins for Zotero 7 and
  later" -- README.md site/src/pages/index.astro` shows 1 for each file.
- [ ] AC5: At 375 px wide in the browser pane, the built home page shows the
  new heading and intro, and `document.documentElement.scrollWidth` equals
  `clientWidth`.
- [ ] AC6: `CHANGELOG.md` gets one `## Unreleased` entry naming the new
  heading and intro, and `pnpm test` passes.

## Coverage

- AC1 → T1, T2
- AC2 → T1, T2
- AC3 → T1, T4
- AC4 → T3, T4
- AC5 → T4
- AC6 → T3, T4

## Tasks

- [ ] T1: In `site/src/pages/index.astro`, set the hero `<h1>` (line 59) and
  the intro (lines 60-63) to the AC1 and AC2 text, keeping the install link,
  and drop the `DISCLAIMER` import if nothing else on the page uses it.
- [ ] T2: In `test/site.test.ts`, add the one-`<h1>` check of AC1 and change
  the home intro test (near line 2058) to the AC2 text, renaming it so it no
  longer says "with the disclaimer".
- [ ] T3: Update DESIGN.md's sentence that the home intro carries
  `DISCLAIMER` (near line 178) to say what it now says (D-075), and add one
  Unreleased CHANGELOG entry naming the new heading and intro.
- [ ] T4: Run AC4's greps, build the site and look at the home page at 375 px
  in the browser pane (AC5), check `git diff main -- site/src` (AC3), and run
  `pnpm test`.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — a change to the text that every visitor to the home page reads, with the wording a design choice.
- 2026-11-07: idea vet: gap — the wording was open; posed at the set across three rounds, and the user chose "Field guide": heading "Your field guide to Zotero plugins" and the intro AC2 quotes; gap — the user asked how a visitor would know which plugins to trust; the user chose to leave trust signals out for now; no flaw.
- 2026-11-07: collision check: D-051 and D-064 put the `DISCLAIMER` sentence in the home intro; D-075 in this plan commit annotates both, the footer keeps it; D-069's title and meta description stay; inbox sweep: 0 open issues, no overlapping pull request.
- 2026-11-07: lessons used: 2026-10-25 (M001) pnpm via npx; 2026-10-26 (M015) serve the built site for the browser pane; 2026-10-27 (M021) Astro drops the space before a link; 2026-10-28 (M035) download the deployed data for a hand check; 2026-10-28 (M036) end an Edit at a line break.
- 2026-11-07: criteria audit (full mode, fresh Opus) ran four times as the wording changed; taken: AC3 limited the grep to site, test, docs, README, CHANGELOG, src, since a mockup and the plan's records quote the old heading; AC1 counts `<h1>` tags; AC2 names where the link's period sits; AC3 names the title test exactly and allows the import line; AC4 checks that the lowercase meta and README lines stay; D-075 annotates D-064 and DESIGN's intro line. The last audit read an earlier intro; AC2's final quoted text is the user's pick at the gate, entered at the user's request with no further wording audit (logged deviation).
- 2026-11-07: plan gate chose the "Field guide" copy over "Spotted in the wild", "Sorted out", and "Plain reference" at the user's pick; falsified by the user asking for other wording.
- 2026-11-07: question set: home copy — "Field guide", as AC1 and AC2 quote it.
- 2026-11-07: plan revised before implement at the user's direction: the intro is framed around discovering plugins, not checking them first; AC2 now quotes the user's pick (option A with the ending "so look into a plugin before you trust it with your library"); the heading stays; the user may revise the copy again before the merge.

## Decisions

## Review
