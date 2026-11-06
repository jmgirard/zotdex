# M102: Move the site to a jmgirard.com subdomain

- **Status:** in-progress
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the site's address and the public data URL change
- **Branch/PR:** m102-move-to-subdomain

## Goal

Serve the site and its data at `https://zotero-plugins.jmgirard.com/` before the index is advertised, with GitHub forwarding the old github.io addresses there (D-068).

## Scope

**In:**
- `site/src/base.ts`: `BASE` becomes `/` and `ORIGIN` becomes `https://zotero-plugins.jmgirard.com`; every site link, canonical link, `og:url`, and `sitemap.xml` entry follows from them. Comments that give the Pages path as the reason (`site/src/base.ts`, `site/astro.config.ts`, `src/site/theme.ts`) are corrected.
- A `robots.txt` at the host root, built from `ORIGIN`, that names the sitemap.
- `PREVIOUS_URL` in `src/build/previous.ts`, both `--previous` arguments in `.github/workflows/build.yml`, and the `$id` of each schema the build publishes.
- README, `cairn/DESIGN.md`, a CHANGELOG Unreleased entry, and the LESSONS lines of M015 and M035.
- The switch, after the merge, in this order: set the custom domain on the repo's Pages; wait until GitHub reports the HTTPS certificate approved; enforce HTTPS; run `gh workflow run build.yml --ref main`; read that run's log for a previous-data read warning; read the new home page, an old address's forward, and the new data URL; set the repo's homepage link. No criterion covers it, because its evidence exists only after the merge; review records it in the work log.

**Out:**
- History records keep the old address: `cairn/milestones/archive/`, `cairn/DECISIONS.md`, `cairn/references/` ledgers, `cairn/mockups/`, and CHANGELOG entries before Unreleased (IP4 history and dated records).
- The theme choice and saved Zotero version in a visitor's browser storage belong to the old origin, so a returning visitor loses them once; accepted before launch, no work.
- Search Console and Bing Webmaster submission of the new sitemap: the user's, after the switch.
- A picture for link previews stays in the parked row "Add a picture to link previews".
- The note that `ORIGIN` repeats the address stays in the row "Tighten link previews and the icon".

## Acceptance criteria

- [ ] AC1: `site/src/base.ts` sets `BASE` to `/` and `ORIGIN` to `https://zotero-plugins.jmgirard.com`. In the site that `test/site.test.ts` builds from its fixture data, each double-quoted `href` and `src` value with no scheme, in every built HTML file with `404.html` included, starts with `/` and with neither `//` nor `/zotero-plugin-index/`.
- [ ] AC2: In that built site, each page's canonical link and `og:url`, and each `<loc>` in `sitemap.xml`, start with `https://zotero-plugins.jmgirard.com/`, shown by the site tests' preview-tag and sitemap tests.
- [ ] AC3: The built site holds `robots.txt` at its root, which allows every path and has the line `Sitemap: https://zotero-plugins.jmgirard.com/sitemap.xml`, shown by a test that reads the built file.
- [ ] AC4: `PREVIOUS_URL` and both `--previous` arguments in `.github/workflows/build.yml` are `https://zotero-plugins.jmgirard.com/v1/plugins.json`, and each schema file that `writeData` in `src/build/build.ts` writes under `schemas/` has the `$id` `https://zotero-plugins.jmgirard.com/schemas/<its file name>`, shown by `test/workflows.test.ts` and a test that runs `writeData` into a temporary folder and reads the `$id` of every file it wrote under `schemas/`.
- [ ] AC5: `git grep -nE 'jmgirard\.github\.io|(^|[^d])/zotero-plugin-index/'` outside `cairn/` lists only lines of `CHANGELOG.md` and README's text on the old address, which says that old page and data addresses forward to the new ones and that a script in a web page must use the new data address. The same search over `cairn/DESIGN.md` and `cairn/LESSONS.md` lists only DESIGN's text saying the same. A search for `robots` in README.md and `cairn/DESIGN.md` finds no line saying the site cannot have a `robots.txt`.
- [ ] AC6: Before the merge, `dig +short zotero-plugins.jmgirard.com CNAME` prints `jmgirard.github.io.`.
- [ ] AC7: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T2
- AC4 → T3
- AC5 → T4
- AC6 → T5
- AC7 → T1, T2, T3, T4

## Tasks

- [x] T1: Set `BASE` and `ORIGIN` in `site/src/base.ts` and correct the Pages-path comments. Move the site tests to the root base and the new host: the link sweep (`test/site.test.ts:148`) asserts the AC1 prefixes, and the tests that name `/zotero-plugin-index/` or the github.io host (`test/site.test.ts`, `test/home-filter.test.ts:117`) use the new values; add a `filterHref` probe on a root-path page address.
- [x] T2: Add `site/src/pages/robots.txt.ts`, built from `ORIGIN` as `sitemap.xml.ts` is, and a site test that reads the built `robots.txt`.
- [x] T3: Move `PREVIOUS_URL`, the two `--previous` lines in `build.yml`, and the two schema `$id`s; update `test/workflows.test.ts:96` and add the `$id` test.
- [x] T4: Update README (site address, data and schema URLs, the `curl` example, the Pages-path sentence at README.md:1846, the robots sentence near README.md:343, and the text on the old address), `cairn/DESIGN.md` (Contract boundary URLs and the forward, the robots sentence at lines 211 to 214), a CHANGELOG Unreleased entry, and the M015 and M035 lessons in `cairn/LESSONS.md`, marked `corrected M102`.
- [ ] T5: Once the user has added the CNAME record, read it with `dig`; if it is missing, stop for the user.

## Work log

- 2026-11-05: created by /milestone-plan.
- 2026-11-05: tier check: milestone — changes the published site and data address and needs a decision entry.
- 2026-11-05: idea vet: flaw — a script in another site's page that fetches the old data URL fails, since GitHub's 301 carries no Access-Control-Allow-Origin header and goes to http first; the user chose to move anyway at the question set.
- 2026-11-05: lessons used: 2026-10-31 (M066), 2026-10-26 (M015), 2026-10-28 (M035), 2026-10-28 (M036).
- 2026-11-05: collision check: M006, M094, and M097 are done and this extends them, correcting DESIGN's robots sentence from M097; the row "Tighten link previews and the icon" names `ORIGIN` repeating the address, a distinct scope, so it stays; D-006 and D-007 govern the data's shape, not its address, so neither blocks the `$id` change.
- 2026-11-05: inbox sweep: no open issues; 14 open bot pull requests, none overlapping.
- 2026-11-05: criteria audit (full mode) returned 6 findings, all fixed: the merge-to-switch gap got an ordered switch in Scope In; AC5 widened from the github.io host to the old path and the robots sentences; AC5's forward text names browser scripts; AC1 reworded from the test's report to the site's links, with a root-path `filterHref` probe in T1; the DNS read stays before the merge, which comes before the domain is set; browser storage moved to Scope Out.
- 2026-11-05: question set: subdomain — zotero-plugins.jmgirard.com.
- 2026-11-05: question set: old data URL breaks for browser scripts — move anyway.
- 2026-11-05: question set: GitHub steps after the merge (custom domain, enforce HTTPS, build run, repo homepage) — the agent runs them with gh.
- 2026-11-05: question set: DNS CNAME record and verifying jmgirard.com on the GitHub account — the user does both; the plan does not wait on the verification.
- 2026-11-05: plan gate chose a jmgirard.com subdomain over a new domain because a lapsed renewal breaks every link and a Zotero-named domain can look official; falsified by a need to move the index off the user's domain, such as a hand-off to another maintainer.
- 2026-11-05: plan gate chose setting the custom domain right after the merge, then building, over building first, because only `main` deploys and a root-base site at the github.io path breaks every link; falsified by a deploy that GitHub serves at both addresses.
- 2026-11-05: plan gate chose moving the schema `$id`s over keeping them, so that each `$id` stays its own URL; falsified by a consumer that resolves the schemas by the old `$id` string.
- 2026-11-05: implement started on m102-move-to-subdomain; untracked `.claude/` left unstaged. DNS CNAME not yet present (dig prints nothing), so T5 comes last.
- 2026-11-05: T1 done: `BASE` `/`, `ORIGIN` the new host; site and home-filter tests moved, the link sweep now refuses a value not starting with `/`, starting with `//`, or starting with `/zotero-plugin-index/`; `filterHref` probes the root page and a sub-path. Planting the old `BASE` turned the sweep red on 232 links. pnpm test 2482 passed, pnpm check 0 problems.
- 2026-11-05: T2 done: `site/src/pages/robots.txt.ts` writes `User-agent: *`, `Allow: /`, and the `Sitemap:` line from `ORIGIN` and `BASE`; a site test compares the built file exactly. pnpm test 2483 passed, pnpm check 0 problems.
- 2026-11-05: substantive amendment: AC4's "each file in `schemas/`" could not hold, since `schemas/delisted.schema.json` is an internal schema with no `$id` that the build never publishes; AC4 now binds each schema file that `writeData` writes, and Scope In says "each schema the build publishes". What users see is unchanged.
- 2026-11-05: re-audit: AC4 (full) — the first narrowing named `PUBLISHED_SCHEMAS`, an unexported constant, so a test would copy its list; reworded to the files `writeData` writes.
- 2026-11-05: re-audit: AC4 (full) — holds; noted that build.yml has no `PREVIOUS_URL`, which lives in `src/build/previous.ts`. Answered, not reworded: Scope In names that file, and a further rewording would need the user.
- 2026-11-05: T3 done: `PREVIOUS_URL`, both build.yml `--previous` lines, and the `$id` of `plugins.v1` and `index.v1` name the new host; `test/schemas.test.ts` runs `writeData` into a temporary folder and checks every schema it writes. Its first form, over every file in `schemas/`, failed on `delisted.schema.json`, which led to the AC4 amendment.
- 2026-11-05: T4 done: README (site address, data and schema URLs, the forward and browser-script note, the robots sentence, the `curl` example, and the `pnpm site` output list, which now also names `404.html` and `sitemap.xml`), DESIGN (data URLs, the forward, the robots sentence), a CHANGELOG Unreleased entry, and the M015 and M035 lessons. The plain-English linter finds no new hit from these edits, and README keeps its 28 older hits. The AC5 sweeps list only CHANGELOG lines, README:369, the link-sweep test line that names the old path as refused, and DESIGN:251. pnpm test 2484 passed, pnpm check 0 problems.

## Decisions

## Review
