# M081: Show when a repo holds no source code

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the data file and the site show a new fact to visitors and data consumers
- **Branch/PR:** m081-no-source-mark

## Goal

Show on the site when a plugin's GitHub repo has no source code at its top level, as a checkable fact, with no change to who is listed.

## Scope

**In:** a function that decides the fact from a repo's top-level names, a bounded batched read in the build, an optional data field, a lock mark on the home row and the plugin page, a Details fact, and the docs that state what the fact means.

**Out:** a free or paid mark (candidate row "Mark plugins that sell a paid service"). A filter on this fact (no row; no one asked). Reading licenses, holding or refusing repos with no source, and delisting (rejected, D-052).

## Acceptance criteria

- [x] AC1: `holdsSource(names)` in `src/build/source.ts` returns false when every top-level name is non-source, ignoring case, and true otherwise, so an empty list gives false. A name is non-source when it starts with `.`, when its stem is readme, license, licence, copying, notice, changelog, or changes, when its extension is `.xpi`, `.md`, `.txt`, `.rdf`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, or `.webp`, when it matches `update*.json`, or when it equals docs, doc, images, image, img, assets, screenshots, dist, build, releases, update, or updates. A table test in `test/source.test.ts` has a false row for each of these tests, an upper-case row, and a true row that adds one source file to a false row.
- [x] AC2: For each record with `upstream`, `buildData` writes `upstream.sourceInRepo` as `true` or `false` when it read the top-level names of the repo's default branch, and otherwise leaves it out. Tests in `test/build.test.ts` show both values written. They also show that a rejected fetch, a 403, a 500, a non-JSON body, null `data`, a null tree, and a read past its time limit each leave the field out, keep the result `ok`, add no record `failure` and no build-level entry, and set a `sourceProblem` that `src/build/cli.ts` prints as a warning. `schemas/plugins.v1.schema.json` defines the field as an optional boolean.
- [x] AC3: A home row with `sourceInRepo: false` has a `data-no-source` element holding `Icon name="lock"`, a `title`, and a visually hidden span, both reading "No source code at the top level of the repository". Its source link reads "Repository" in `title` and "Repository of <name>" in `aria-label`. A row with `true` or no field has no such element and keeps "Source code". A test in `test/site.test.ts` shows all three.
- [x] AC4: A plugin page with `sourceInRepo: false` shows the same mark inside `<h1>`, after the Archived badge's place. The Details card shows "Source code at the repository's top level" with `data-fact="source-in-repo"` and "Yes" or "No" for a boolean, and no fact when the field is absent. A test in `test/site.test.ts` shows each case.
- [x] AC5: The About page says that the fact comes from the top-level names of the default branch, that the index reads no code to decide it, that "Yes" means neither an open-source license nor an XPI built from that code, and that "No" can be wrong because folders go unread. A test in `test/site.test.ts` asserts each claim. `README.md` and `CHANGELOG.md` state the field and tell consumers to fetch the schema again, and `cairn/DESIGN.md` states the fact and the mark.
- [x] AC6: A record with `sourceInRepo: false` stays in the home table in the AC3 test, and `git diff origin/main...HEAD --stat -- src/discover src/upstream` shows no change.
- [x] AC7: `pnpm test` and `pnpm check` exit with status 0 on the branch.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T3
- AC5 → T4
- AC6 → T3, T5
- AC7 → T5

## Tasks

- [x] T1: Write `src/build/source.ts` and `test/source.test.ts`.
- [x] T2: Add a bounded, batched GraphQL read after the plugin reads in `buildData` (`src/build/build.ts`; `src/discover/discover.ts:640` shows the post), with `sourceProblem`, the warning in `src/build/cli.ts`, the schema field, and the build tests.
- [x] T3: Add the `lock` icon to `site/src/components/Icon.astro`, the home mark and link label (`site/src/pages/index.astro:147`, `:192`), the plugin page mark and fact (`site/src/pages/plugins/[id]/index.astro:56`, `:245`), any plugin page link that says source code, and the site tests.
- [x] T4: Write the About section, `README.md`, `CHANGELOG.md`, and `cairn/DESIGN.md`.
- [x] T5: Run `pnpm test`, `pnpm check`, and the diff that AC6 names.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — it changes the data file and the site and holds a design decision.
- 2026-11-02: idea vet: flaw: a rule that code must be open source cannot merge PR 161 and close PR 371, since both repos hold no source; the question set answered with a shown fact. Flaw: "open source" names a license that this read does not check, so the label says "no source code at the top level". Gap: an icon for both states or only one; reading taken: a lock only for no source, since each row's source link already shows the repo and 99% of rows would carry the same mark.
- 2026-11-02: lessons used: 2026-11-02 (M075, used M077).
- 2026-11-02: collision check: D-006 and D-007 are the precedent for an optional shown fact; D-033 and D-042 keep inclusion no judgment of quality; D-051 stands; D-011, D-015, and D-022 make a failed GitHub read build-level, so D-052 annotates them as D-036 did.
- 2026-11-02: inbox sweep: 0 open issues and 26 open bot pull requests, none overlapping.
- 2026-11-02: question set: how to treat plugins with no source in their repo — show it as a fact; what the paid row covers — the maker's own paid service.
- 2026-11-02: plan gate chose a shown fact over a no-source hold, a refusal, and a license requirement because the user chose it after the count of 8 of 695 and 158 of 695; falsified by plugins commonly hiding source in ways that top-level names do not show.
- 2026-11-02: plan chose one batched GraphQL read after the plugin reads over one REST read per plugin because 691 more REST requests add to the build's 18-minute read limit and rate limit; falsified by a GraphQL limit or failure that leaves the field out on most builds.
- 2026-11-02: criteria audit (full mode) returned findings on every criterion but the last. Fixed: AC1's garbled clause, its unlisted patterns and case rule, and its probes; AC2's unreachable domain for failure records, its build-level conflict (now D-052), its one-example probe, and a new warning; AC3's absolute label, its contradicting source link, and its unnamed icon and mechanism; AC4's mark position; AC5's "No" disclosure, the D-007 schema notice, and a test of each claim. Added AC6 for no change to who is listed.
- 2026-11-02: T1 done: `holdsSource` and its table test (20 rows); the stem is the name before its last dot.
- 2026-11-02: T2 done: one read after the plugin reads in batches of 40, a 2-minute limit, `sourceProblem`, a CLI warning, and the schema field; `responses()` in the build tests gained a default answer so that a clean build still warns of nothing.
- 2026-11-02: T3 done: `NoSourceMark.astro` holds the mark for both pages, the plugin page's Source button reads "Repository" for false, and the site fixture gained one true and one false record.
- 2026-11-02: T4 done: a new About section with five tested claims, `README.md`, `CHANGELOG.md` with the schema notice, and `cairn/DESIGN.md`.
- 2026-11-02: T5 done: `pnpm test` and `pnpm check` pass, and the AC6 diff is empty. A live run read all 695 repos in 69 seconds and found 8 with no source, so the limit went from 2 to 3 minutes; a browser look at a fixture build showed the mark, link label, and Details fact with no console error.
- 2026-11-02: claim audit: about 65 claims read, 12 corrected — README.md, CHANGELOG.md, site/src/pages/about.astro, src/build/source.ts, cairn/DESIGN.md; the workflow time-limit comment also gained the new read; the reader's re-read of the corrections is pending at this checkpoint.
- 2026-11-02: claim audit: 65 claims read, 12 corrected — README.md, CHANGELOG.md, site/src/pages/about.astro, src/build/source.ts, cairn/DESIGN.md; the same reader re-read the corrections once and found nothing still wrong.
- 2026-11-02: review added a legend line under the home table for touch and keyboard users (diff-bug #10), inside the mark's scope; no criterion changed.
- 2026-11-02: step-7 approval: m081-no-source-mark approved for merge

## Decisions

## Review

- AC1: `test/source.test.ts` passes 23 tests on 2026-11-02: 15 false rows cover each name test and an upper-case row, and 5 true rows include one source file added to a false row.
- AC2: `test/build.test.ts -t "top-level names"` passes 12 tests: both values written, one repo left out with a named problem, and each of the seven failure kinds in the criterion plus a body stall and an unexpected error leaves the field out, stays `ok`, and adds no failure or build-level entry; `pnpm build` prints one warning and exits 0. The schema defines `sourceInRepo` as a boolean that no `required` list names.
- AC3: The filtered `test/site.test.ts` run passes: a false row holds the mark and reads "Repository" and "Repository of <name>", and true and no-field rows have no mark and keep "Source code".
- AC4: The filtered `test/site.test.ts` run passes: the mark is inside `<h1>` after the Archived badge's place, the fact reads Yes or No under `data-fact="source-in-repo"`, and an absent field shows no fact.
- AC5: The filtered `test/site.test.ts` run passes one test per About claim, including "reads no code", what "Yes" does not mean, and that "No" can be wrong. `README.md` and `CHANGELOG.md` name the field and tell consumers to fetch the schema again; `cairn/DESIGN.md` names the fact and the mark at lines 137, 437, and 955.
- AC6: The AC3 test keeps the false record's row in the home table, and `git diff origin/main...HEAD --stat -- src/discover src/upstream` prints nothing.
- AC7: `pnpm test` passes 2139 tests with 6 skipped, and `pnpm check` reports 695 entries and 0 problems, both on 2026-11-02 at the branch head, level with `origin/main`.
- Consistency gate: `cairn_validate.py` passes; the generic profile names no toolchain checks; no principle changed.
- Recheck after the fixes: `pnpm test` passes 2144 tests with 6 skipped and `pnpm check` reports 695 entries and 0 problems. AC3's title now sits on the mark's `aria-hidden` child, still inside the `data-no-source` element. A browser look at a fixture build shows the mark and a new legend line.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: a 200 answer with `errors` loses GitHub's message and keeps sending batches — fix now, fixed 2965fb7
- diff-bug #2: one failed request ends the read, so every lock vanishes for that day — follow-up: parked row "Keep source facts when their read fails", since AC2 allows it and no failure is seen yet
- diff-bug #3: the mark keeps its left margin inside the plugin page's flex h1 — fix now, fixed 2965fb7
- diff-bug #4: nothing proves the schema's boolean type — fix now, fixed 2965fb7
- diff-bug #5: the non-string-name branch has no test — reject, edge: GitHub's GraphQL schema types `name` as a string, and the effect is a field left out with a warning
- diff-bug #6: the README's `LICENSE-MIT` claim has no table row — fix now, fixed 2965fb7
- diff-bug #7: duplicate-URL behavior has no test — fix now, fixed 2965fb7
- diff-bug #8: inserted constants separate two test comments from their code — fix now, fixed 2965fb7
- diff-bug #9: no whitespace between the name and the hidden text — fix now, fixed 2965fb7; the Archived badge's own gap is in the existing parked row
- diff-bug #10: a tooltip does not reach touch or keyboard users — fix now, fixed 2965fb7, with a legend line under the table
- diff-bug #11: three style rules have no effect on the icon — fix now, fixed 2965fb7
- diff-bug #12: README source-link wording is unconditional — fix now, fixed 2965fb7
- diff-bug #13: the workflow comment omits the last plugin read's overrun — fix now, fixed 2965fb7
- diff-bug #14: the field is written after `languages` — reject, style: JSON key order has no effect
- diff-bug question (c): some site and table tests overlap, one comment restates code, and `LOCK_SVG` pins path data — reject, planned change: AC1 and AC3 to AC5 name these tests, and the pin is how a test tells the lock from other icons
- blame-history #1: the build job's time margin fell to 4.5 minutes — reject, false: run 41524890675's build step took 683 seconds and its other steps about 12 seconds, so the bound holds; the comment was fixed under diff-bug #13
- blame-history #2: a failed source read is not build-level, unlike D-015 and D-022 — reject, planned change: D-052 names both and makes this exception
- blame-history #3: `README.md:199` still says "Source" — fix now, fixed 2965fb7
- blame-history #4: a comment says `sourceMs` bounds every request — fix now, fixed 2965fb7
- prior-review #1: `title` beside hidden words reads twice, as M064's review found — fix now, fixed 2965fb7
- prior-review #2: the mark follows the badge with no space, as M064's review found — fix now, fixed 2965fb7
- prior-review #3: the link's `title` and `aria-label` use different words — reject, planned change: AC3 names both, and the parked row "Check the theme button's double label" holds the pattern
- prior-review #4: the worst-case build time — reject, false: the same finding and evidence as blame-history #1
- prior-review #5: `white-space: nowrap` on the mark — fix now, fixed 2965fb7, by removing it
- ripple #1 to #10: `README.md` lines 29, 199, 540, 1318, 1370, and 1381 and `cairn/DESIGN.md` lines 102, 117, 131, 418, and 485 did not state the lock, the new read, its warning, or that it is not build-level — fix now, fixed 2965fb7
- ripple #11: the About intro does not name the new read — reject, false: the read is of the repository, so the sentence holds
- Snapshot files: none changed. PR conversation: none, since no PR is open.
