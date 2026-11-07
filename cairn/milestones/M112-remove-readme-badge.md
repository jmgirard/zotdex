# M112: Remove the README badge

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — plugin pages, About, and a public file path change
- **Branch/PR:** m112-remove-readme-badge

## Goal

Remove the README badge that M105 added, since no README outside Zotdex uses it.

## Scope

**In:** delete the badge files (`site/src/pages/badges/[id].json.ts`,
`src/site/badge.ts`), `badgeSnippet` in `site/src/data.ts`, the "Badge for
your README" card on plugin pages, the `.badge-snippet` CSS, About's "README
badge" section, and their tests; remove the badge text from `docs/site.md`,
`docs/maintaining.md`, `cairn/DESIGN.md`, and
`cairn/references/plain-words-copy.md`; delete the Unreleased CHANGELOG
entry that added the badge, since no release shipped it; append a D-entry
that supersedes D-071.

**Out:** the "Archived" and "Older data" labels, which share the `.badge`
class and stay as they are; `majorStart` in `src/site/version.ts`, which the
plugin page still uses; any new badge or author outreach (no row: the user
chose removal).

## Acceptance criteria

- [x] AC1: A site build writes no badge files: a test in `test/site.test.ts`
      builds the fixture site and asserts that its output folder holds no
      `badges` entry, and `site/src/pages/badges/`, `src/site/badge.ts`, and
      `test/badge.test.ts` no longer exist.
- [x] AC2: No built plugin page offers a badge: a test in `test/site.test.ts`
      asserts that each fixture plugin page's sections are "Zotero versions"
      then "Details", with no `data-section="badge"` section, and that no
      built page in the fixture site's output holds the text `img.shields.io`.
- [x] AC3: The built About page has no README badge section: the About test
      in `test/site.test.ts` lists About's sections, and that list holds no
      `badge` section, while every other section keeps its current heading
      and text.
- [x] AC4: `git grep -n -iE 'readme badge|badges/|badge file|badge (names|says|shows|can)|badgeSnippet|badgeFor|badge-snippet|shields|badge for your|data-section="badge"|id="badge"|#badge' -- site src docs README.md CHANGELOG.md cairn/DESIGN.md cairn/references/plain-words-copy.md`
      prints no line.
- [x] AC5: `cairn/DECISIONS.md` holds a new entry that supersedes D-071, says
      that the badge files, the plugin-page card, and About's section were
      removed and that the stable-address promise is withdrawn, says that a
      README embedding a badge then shows a shields.io error image, and gives
      the reason.
- [x] AC6: `pnpm test` and `pnpm check` pass (run as
      `npx -y pnpm@12.15.0 test` and `npx -y pnpm@12.15.0 check`).

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T1, T2
- AC4 → T1, T2, T4
- AC5 → T3
- AC6 → T4

## Tasks

- [x] T1: Remove the badge code and its tests: delete
      `site/src/pages/badges/[id].json.ts`, `src/site/badge.ts`, and
      `test/badge.test.ts`; remove `badgeSnippet` (`site/src/data.ts:45-50`),
      the card (`site/src/pages/plugins/[id]/index.astro:395-402`) and its
      import, and `.badge-snippet` (`site/src/layouts/Base.astro:992-`). In
      `test/site.test.ts`: drop the `badgeFor` import (:28), turn the badge
      file test (:148-151) into the no-`badges` check, drop `badge` from the
      section order test (:636-643), and replace the snippet tests
      (:2166-2192) with the no-`img.shields.io` check over `htmlFiles(out)`.
- [x] T2: Remove About's section (`site/src/pages/about.astro:150-156`) and
      its entry in the About test (`test/site.test.ts:946-951`); remove the
      badge text from `docs/site.md` (:282, :380-403), `docs/maintaining.md`
      (:932-933), `cairn/DESIGN.md` (:163-164, :172, :252-258, :580,
      :618-620), and `cairn/references/plain-words-copy.md` (:62-65,
      :157-160); delete the CHANGELOG entry (:36-43). Rewrap edited prose
      near 76 columns.
- [x] T3: Append the D-entry that supersedes D-071, as AC5 says.
- [x] T4: Run `pnpm test`, `pnpm check`, and the AC4 sweep; after the merge,
      run `gh workflow run build.yml --ref main` (granted at the question set).

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — removes a feature and a public file path, which needs a design decision.
- 2026-11-07: idea vet: gap — the request left remove or redesign open; the question set chose removal. No flaw: GitHub code search for `zotdex.jmgirard.com/badges` finds no README outside this repo.
- 2026-11-07: collision check: M105 (done) added the badge, and D-071 promises a stable address; this plan supersedes D-071 at T3 rather than ignoring it. No candidate row or other milestone overlaps.
- 2026-11-07: inbox sweep: 0 open issues; 10 open bot "Add" PRs, none overlapping.
- 2026-11-07: lessons used: 2026-10-25 (M001), 2026-10-26 (M018), 2026-10-28 (M036), 2026-10-31 (M066), 2026-11-02 (M082).
- 2026-11-07: criteria audit (full, fresh Opus reader): 6 findings. Fixed: the sweep's `test` path clashed with AC2's own `img.shields.io` text, so it was dropped; the sweep's pattern missed card, anchor, and message lines, so it was widened, and on the current tree it now hits only badge text; AC5 now names the withdrawn address promise and the error image; T1 now names the `badgeFor` import and the shields test at :2186-2192. Answered: deleting the approved card and About lines is the user's yes at the question set. Noted: the other criteria's domains are enumerated by the tests they name.
- 2026-11-07: plan gate chose removing everything over keeping the badge files and dropping only the card, because no README uses the files and keeping them keeps About text and a promise to maintain; falsified by an author asking for the badge or a README found embedding it.
- 2026-11-07: question set: remove the README badge in full, deleting the approved card and About section lines — yes (remove it all).
- 2026-11-07: question set: start `build.yml` on main by hand after the merge — yes.
- 2026-11-07: T1 done: removed the badge files, `badgeSnippet` (and the now unused `ORIGIN` import in `site/src/data.ts`), the card, and `.badge-snippet`; `test/site.test.ts` now checks that the output has no `badges` entry and that no HTML page has a badge section or `img.shields.io`, both of which a main build fails; `pnpm test` 2494 passed.
- 2026-11-07: T2 done: removed About's section and its test entry, the badge text in `docs/site.md`, `docs/maintaining.md`, `cairn/DESIGN.md`, and `cairn/references/plain-words-copy.md`, and the CHANGELOG entry; the AC4 sweep prints nothing; `pnpm test` 2493 passed. The simple-english lint hook flagged older sentences in those files that this task did not write, so they stay.
- 2026-11-07: T3 done: appended D-079, which supersedes D-071.
- 2026-11-07: T4 done: `pnpm test` 2493 passed, `pnpm check` 745 entries with 0 problems, AC4 sweep prints nothing; a site built from the deployed data has no `badges` folder and no page with badge text, and in the browser pane a plugin page ends with Details and About lists 13 sections with no badge. The post-merge `build.yml` run belongs to review's merge step.
- 2026-11-07: claim audit: 6 claims read, 0 corrected — docs/maintaining.md, docs/site.md, test/site.test.ts, site/src/data.ts. Noted: a local `dist/badges/` from an earlier run stays, since the site build replaces only what it writes; CI builds `dist/` fresh, so the deploy is not affected.
- 2026-11-07: step-7 approval: m112-remove-readme-badge approved for merge

## Decisions

## Review

Evidence (2026-11-07, branch `m112-remove-readme-badge`, level with `origin/main`):

- AC1: "writes no badge files" passes (`vitest run test/site.test.ts -t …`, verbose ✓); `site/src/pages/badges`, `src/site/badge.ts`, and `test/badge.test.ts` do not exist (`[ -e ]` per path).
- AC2: the `test.each(ids)` test "shows the sections of %s in order" expects `compatibility`/"Zotero versions" then `details`/"Details" and counts every `<section>` and `<h2>` in main, and "offers no badge on any page" checks all `ids.length + 3` HTML files for `data-section="badge"` and `img.shields.io`; both pass. A site built from the deployed data had 0 files with either text.
- AC3: "has the copy's sections in its order, each under its h2 and with its id" passes against `COPY`, which no longer holds `badge`; the per-section "the %s section reads as the copy" tests for the other 13 sections pass unchanged (`git diff main -- test/site.test.ts` removes only the `badge` entry from `COPY`).
- AC4: the named `git grep` prints no line (exit 1).
- AC5: `cairn/DECISIONS.md:1204` D-079 supersedes D-071; it names the removed files, card, and About section, withdraws the stable-address promise, says an embedding README shows a shields.io error image, and gives the user's reason.
- AC6: `pnpm test` exit 0, 36 files passed, 2493 tests passed, 6 skipped; `pnpm check` 745 entries, 0 problems.

Consistency gate: `cairn_validate.py` all checks passed; no principle changed, so no `cairn_impact`; the generic profile names no toolchain checks.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: the `data-section="badge"` line in "offers no badge on any page" repeats what the exact section-list test already checks — fix now, fixed fbb5bcb3.
- diff-bug #2: ragged wrap in `docs/site.md:281-283` and `cairn/DESIGN.md:170-171` — fix now, fixed fbb5bcb3.
- diff-bug #3: `majorStart` stays split into `src/site/version.ts` though its badge reason is gone — reject, planned change (Scope Out keeps it).
- diff-bug #4: the CHANGELOG entry is deleted though the badge path was live for about a day — reject, planned change (D-079 records the withdrawal).
- blame-history #1: removed approved lines in `plain-words-copy.md` need the user's yes — reject, false (the question set records it).
- blame-history #2: the fixed `ids.length + 3` count can drift — reject, false (the file's way to show a non-empty domain, also at :170 and :2122).
- blame-history #3: the old src/srcset/url scan is gone — reject, planned change (the stricter absence check replaces it).
- prior-review #1: ragged rewrap in `docs/site.md:280-282` — fix now, fixed fbb5bcb3 (same as diff-bug #2).
- prior-review #2: 100-character line at `cairn/DESIGN.md:162`, untouched by the diff — reject, style.
- prior-review #3: the `ids.length + 3` count — reject, false (as blame-history #2).
- prior-review #4: long lines in DECISIONS and ROADMAP — reject, style (one-line rows and long D headings are the convention).
- prior-review #5: approved wording removed — reject, false (as blame-history #1).
- ripple #1: `docs/site.md:280` "comes next" no longer tells the reader the Details card ends the page — fix now, fixed fbb5bcb3 ("comes last").
- ripple #2: the `(M105)` citation on `majorStart` in DESIGN — reject, false (M105 did move it).

After the fixes: `pnpm test` exit 0, 2493 passed; the AC4 sweep prints nothing.
