# M105: Offer plugin authors a README badge

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — a public file per plugin that authors embed, and a new section on each plugin page
- **Branch/PR:** m105-author-badge

## Goal

Give each listed plugin a README badge, labeled Zotdex, that says which Zotero majors its release started in and links to its page on the index, so authors who add it send readers to Zotdex (D-071).

## Scope

**In:**
- `badgeFor(record)` in `src/site/badge.ts`, a pure function, and `test/badge.test.ts`.
- `site/src/pages/badges/[id].json.ts`, writing `badges/<id>.json` for every record from `badgeFor`.
- A "Badge for your README" section at the foot of each plugin page (`data-section="badge"`), with the Markdown to copy as text only; the site loads nothing from shields.io.
- README, About, `cairn/DESIGN.md` (Contract boundary), and a CHANGELOG Unreleased entry.
- After the merge: run `gh workflow run build.yml --ref main`, then read one badge's JSON and its image through `img.shields.io`. No criterion covers it; review records it in the work log.

**Out:**
- Badge images drawn by the index, a badge for report counts, and counting badge use: none asked for.
- A mark for kept facts on the badge: the user chose the same badge; the plugin page keeps its "Older data" note (D-071).
- An id holding `(` or `)` would break the Markdown link; bot ids exclude them (`src/discover/handoff.ts:58`) and no entry has one.

## Acceptance criteria

- [ ] AC1: `badgeFor` in `src/site/badge.ts` returns `{ schemaVersion: 1, label: "Zotdex", message, color, cacheSeconds: 3600 }` for a record. Let the started majors be each major N that some `startTests` item names (its `zotero` up to the first dot) for which `majorStart(record, N).result` is `started`, sorted by `Number(N)`. `message` is "started in Zotero " followed by the started majors joined by " · " when there is at least one; "no start in tests" when the record has `startTests` and no started major; "not start-tested" when the record has `upstream` and no `startTests`; and "no data" when it has no `upstream`. A record with `kept` is read from its `upstream` and `startTests` like any other. `color` is `#1d5fb8` for a "started in" message and `lightgrey` for the others. `test/badge.test.ts` covers each of the four messages, a major whose older result started and whose newer result did not, a record whose only started result is 12.x (`started in Zotero 12`), started results in 7 and 10 (`started in Zotero 7 · 10`), and a record with `kept` and a started 8.x result (`started in Zotero 8`).
- [ ] AC2: In the site that `test/site.test.ts` builds from its fixture, `badges/` holds one file `<id>.json` for each fixture record and no other file, each parsing to `badgeFor` of its record, and `badges/no-range-plugin@example.org.json` has the message `started in Zotero 7`. Shown by a site test that lists `badges/`.
- [ ] AC3: Each page that the built `plugins/` folder holds has one section with `data-section="badge"`, headed "Badge for your README", holding exactly one `<code>` element whose text, with HTML escapes undone, is `[![Zotdex](https://img.shields.io/endpoint?url=<U>)](<P>)`, where `<U>` is `encodeURIComponent` of `ORIGIN` + `BASE` + `badges/` + `encodeURIComponent(id)` + `.json` and `<P>` is the page's canonical address. Shown by a site test that lists the built `plugins/` folder, the `_x-y+z.w@{v}` page included.
- [ ] AC4: In each built HTML file, `img.shields.io` appears only inside `<code>` text, and no `src` or `srcset` value or CSS `url(` names it. Shown by a site test over every built HTML file.
- [ ] AC5: README and About each describe the badge: its address `https://zotdex.jmgirard.com/badges/<id>.json` with the id percent-encoded as in the page's snippet; the four messages; that start results come from each day's build, so after a day whose start tests fail a badge can name fewer majors or say "not start-tested" until a later build has results; that shields.io and GitHub each cache the image for up to an hour, so a change can take a few hours to show; that a removed plugin's badge shows an error badge from shields.io; and that a start does not show that a plugin works. `cairn/DESIGN.md` names the badge files under its Contract boundary, and CHANGELOG has an Unreleased entry.
- [ ] AC6: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T3
- AC5 → T4
- AC6 → T1, T2, T3, T4

## Tasks

- [x] T1: `src/site/badge.ts` with `badgeFor`, and `test/badge.test.ts` with AC1's cases.
- [x] T2: `site/src/pages/badges/[id].json.ts`; the site test of AC2.
- [x] T3: The badge section at the foot of `site/src/pages/plugins/[id]/index.astro`, its snippet built from `ORIGIN`, `BASE`, and `pluginHref`; the site tests of AC3 and AC4.
- [x] T4: README, About, `cairn/DESIGN.md`, and the CHANGELOG entry.

## Work log

- 2026-11-05: created by /milestone-plan.
- 2026-11-05: tier check: milestone — a new public file per plugin and a new page section, with a decision entry on the badge address.
- 2026-11-05: idea vet: gap — whether a kept record's badge carries a mark; reading taken, the same badge, which the user chose at the question set. The badge's words follow D-023 ("started", never "works"). No flaw.
- 2026-11-05: lessons used: 2026-10-30 (M061), 2026-10-31 (M066), 2026-10-27 (M021), 2026-10-28 (M036).
- 2026-11-05: collision check: absorbs the candidate row "Offer plugin authors a README badge"; no shipped or dropped badge work; D-023, D-024, D-035, D-051, D-064, D-066 read, none blocks it.
- 2026-11-05: inbox sweep: no open issues; 14 open bot pull requests, none overlapping.
- 2026-11-05: criteria audit (full mode) returned 6 findings, all applied: the failed-day sentence says a badge can name fewer majors, as carried starts survive (D-035); the cache sentence says a change can take a few hours; AC4 allows `img.shields.io` only in `<code>` text on any page, and AC3 names `data-section="badge"` and one `<code>` element; AC1's kept clause reads the record like any other, with a probe for kept and started 8.x; AC5 says the id is percent-encoded; the kept-record mark went to the question set. A scratch Astro build wrote `badges/` files named with `{`, `}`, `@`, and `+`. An earlier draft's audit in this session gave the major counting, the "started" wording, and "no data".
- 2026-11-05: question set: snippet place — each plugin page.
- 2026-11-05: question set: kept records — the same badge, no mark.
- 2026-11-05: question set: after the merge, the agent runs the build and reads one badge through shields.io.
- 2026-11-05: plan gate chose shields.io endpoint files over badge images the build draws, as shields renders text, width, and fonts and authors know its badges; falsified by shields.io refusing or long failing the endpoint reads.
- 2026-11-05: implement started on m105-author-badge; untracked `.claude/` left unstaged.
- 2026-11-05: implementation choice: `majorStart` moved from `site/src/data.ts` to `src/site/version.ts`, typed by shape so that file keeps no imports, and `data.ts` re-exports it, so `src/site/badge.ts` uses the same function the pages use without `src/` importing `site/`.
- 2026-11-05: T1 done: `badgeFor` in `src/site/badge.ts`; `test/badge.test.ts` covers the four messages, an older start under a newer failure, a 12.x start, starts in 7 and 10, and a kept record with an 8.x start. Planting a string sort turned the 7 · 10 test red. pnpm test 2491 passed, pnpm check 0 problems.
- 2026-11-05: T2 done: `site/src/pages/badges/[id].json.ts` writes `badges/<raw id>.json` from `badgeFor` for every record; the site test "writes one badge file for each record and no other" lists `badges/`, compares each file with `badgeFor`, and reads `started in Zotero 7` for no-range-plugin. pnpm test 2492 passed, pnpm check 0 problems.
- 2026-11-05: T3 done: `badgeSnippet(id)` in `site/src/data.ts` builds the Markdown from `ORIGIN`, `BASE`, and `pluginHref`; each plugin page ends with a `data-section="badge"` card, "Badge for your README", one fineprint line, and the snippet in `<code class="badge-snippet">`, styled with `--space-4`, `--space-6`, `--radius-m`, and `--hover`. The section-order test now lists the badge card; new tests read every built `plugins/` page's snippet against its canonical address and check every HTML file for `img.shields.io` outside code text and in `src`, `srcset`, or `url(`. Planting an `<img>` from img.shields.io turned that test red. A real-data build wrote 736 badge files; the 375 px view shows the card with no sideways scroll. pnpm test 2494 passed, pnpm check 0 problems.
- 2026-11-05: T4 done: README's site section gains two badge paragraphs, and its `pnpm site` list names `dist/badges/<id>.json`; About gains a "README badge" section after "Installing a plugin", with tests for the section list and its address and four messages; DESIGN's Contract boundary names the badge path and its rules, and its site build line names the badge files; CHANGELOG has an Unreleased entry. No new plain-English hit in README, CHANGELOG, or DESIGN. pnpm test 2495 passed, pnpm check 0 problems.
- 2026-11-05: claim audit: 44 claims read, 4 corrected — site/src/pages/about.astro, README.md, site/src/pages/plugins/[id]/index.astro, CHANGELOG.md: About's "no data" sentence gains the kept-facts exception; the cache sentence adds GitHub Pages' 10-minute copy of the badge file; the plugin page and the changelog say the badge names the versions or why it names none. Re-read: all four hold; GitHub's image proxy honoring shields' one-hour header stays unchecked.
- 2026-11-05: implement done; status review.

## Decisions

## Review
