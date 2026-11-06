# M102: Move the site to a jmgirard.com subdomain

- **Status:** review
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

- [x] AC1: `site/src/base.ts` sets `BASE` to `/` and `ORIGIN` to `https://zotero-plugins.jmgirard.com`. In the site that `test/site.test.ts` builds from its fixture data, each double-quoted `href` and `src` value with no scheme, in every built HTML file with `404.html` included, starts with `/` and with neither `//` nor `/zotero-plugin-index/`.
- [x] AC2: In that built site, each page's canonical link and `og:url`, and each `<loc>` in `sitemap.xml`, start with `https://zotero-plugins.jmgirard.com/`, shown by the site tests' preview-tag and sitemap tests.
- [x] AC3: The built site holds `robots.txt` at its root, which allows every path and has the line `Sitemap: https://zotero-plugins.jmgirard.com/sitemap.xml`, shown by a test that reads the built file.
- [x] AC4: `PREVIOUS_URL` and both `--previous` arguments in `.github/workflows/build.yml` are `https://zotero-plugins.jmgirard.com/v1/plugins.json`, and each schema file that `writeData` in `src/build/build.ts` writes under `schemas/` has the `$id` `https://zotero-plugins.jmgirard.com/schemas/<its file name>`, shown by `test/workflows.test.ts` and a test that runs `writeData` into a temporary folder and reads the `$id` of every file it wrote under `schemas/`.
- [x] AC5: `git grep -nE 'jmgirard\.github\.io|(^|[^d])/zotero-plugin-index/'` outside `cairn/` lists only lines of `CHANGELOG.md` and README's text on the old address, which says that old page and data addresses forward to the new ones and that a script in a web page must use the new data address. The same search over `cairn/DESIGN.md` and `cairn/LESSONS.md` lists only DESIGN's text saying the same. A search for `robots` in README.md and `cairn/DESIGN.md` finds no line saying the site cannot have a `robots.txt`.
- [x] AC6: Before the merge, `dig +short zotero-plugins.jmgirard.com CNAME` prints `jmgirard.github.io.`.
- [x] AC7: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T2
- AC4 → T3
- AC5 → T4, T6
- AC6 → T5
- AC7 → T1, T2, T3, T4

## Tasks

- [x] T1: Set `BASE` and `ORIGIN` in `site/src/base.ts` and correct the Pages-path comments. Move the site tests to the root base and the new host: the link sweep (`test/site.test.ts:148`) asserts the AC1 prefixes, and the tests that name `/zotero-plugin-index/` or the github.io host (`test/site.test.ts`, `test/home-filter.test.ts:117`) use the new values; add a `filterHref` probe on a root-path page address.
- [x] T2: Add `site/src/pages/robots.txt.ts`, built from `ORIGIN` as `sitemap.xml.ts` is, and a site test that reads the built `robots.txt`.
- [x] T3: Move `PREVIOUS_URL`, the two `--previous` lines in `build.yml`, and the two schema `$id`s; update `test/workflows.test.ts:96` and add the `$id` test.
- [x] T4: Update README (site address, data and schema URLs, the `curl` example, the Pages-path sentence at README.md:1846, the robots sentence near README.md:343, and the text on the old address), `cairn/DESIGN.md` (Contract boundary URLs and the forward, the robots sentence at lines 211 to 214), a CHANGELOG Unreleased entry, and the M015 and M035 lessons in `cairn/LESSONS.md`, marked `corrected M102`.
- [x] T5: Once the user has added the CNAME record, read it with `dig`; if it is missing, stop for the user.
- [x] T6: Write the link sweep's refused old-path prefix in `test/site.test.ts` so the AC5 sweep does not match it (review return 1).

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
- 2026-11-05: claim audit: 29 claims read, 2 corrected — README.md, CHANGELOG.md, cairn/DESIGN.md: the forward keeps path and query under the new host's root (it drops the repo prefix), and old links work in a browser and in most clients that follow redirects, since the first hop goes to http. Re-read of the two corrections pending at this checkpoint.
- 2026-11-05: hand check: a local `pnpm site --out` build of the deployed data, served at a root path in the browser pane, loads the home page (736 rows), About, a plugin page, the data file, the favicon, the sitemap, and robots.txt, and answers a missing path with 404; every top bar link starts at `/`.
- 2026-11-05: claim audit re-read: both corrections hold; the forward's first hop stays http even with HTTPS enforced, which "most clients" allows for.
- 2026-11-05: stop at T5 for the user: `dig +short zotero-plugins.jmgirard.com CNAME` prints nothing, so the user's DNS record is not in place yet. T1 to T4 and the claim audit are done.
- 2026-11-05: T5 done: the user added the CNAME record and the GitHub domain verification TXT record (`_github-pages-challenge-jmgirard.jmgirard.com` resolves). `dig +short zotero-plugins.jmgirard.com CNAME` prints `jmgirard.github.io.` at Cloudflare's nameserver `zelda.ns.cloudflare.com`, at 1.1.1.1, and at 8.8.8.8, and the A lookup gives GitHub Pages' four addresses, so the record is DNS only. The machine's own resolver still printed nothing, a cached answer from the earlier lookups.
- 2026-11-05: implement done; status review.
- 2026-11-05: review return 1: AC5 fails as written: its sweep outside `cairn/` also lists `test/site.test.ts:165`, the link-sweep test line that names `/zotero-plugin-index/` as a refused prefix, a line that is neither CHANGELOG nor README.
- 2026-11-05: T6 added for review return 1 (minor amendment): write the link sweep's refused old-path prefix so the AC5 sweep does not match it.
- 2026-11-05: T6 done: the link sweep now tests each value with `/^\/(?!\/)/` and refuses `/^\/zotero-plugin-index\//`, which the AC5 sweep does not match; that sweep now lists only CHANGELOG lines 9, 271, 272, 279 and README:369. Planting the old `BASE` again turned the sweep red on 232 links. pnpm test 2484 passed, pnpm check 0 problems. Status review.

## Decisions

## Review

Evidence at `619f8b36`, 2026-11-05.

- AC1: `site/src/base.ts:4` is `BASE = "/"` and `:7` is `ORIGIN = "https://zotero-plugins.jmgirard.com"`. "starts every link inside the site with the root path" passes. A one-off sweep with the same pattern over a `pnpm site --out` build of the deployed data read 739 HTML files and 9201 scheme-less `href`/`src` values: none fails to start with `/`, none starts with `//` or `/zotero-plugin-index/`. Planting the old `BASE` turned the test red on 232 links (T6).
- AC2: "puts each tag once on every page with an address" (canonical and `og:url` equal `https://zotero-plugins.jmgirard.com/` plus the page path) and "writes a sitemap in the urlset form that lists exactly the canonical address of each page" pass. The real-data build has 1476 canonical and `og:url` values and 738 `<loc>` entries, all starting with the new host.
- AC3: "writes a robots.txt at the top that allows every path and names the sitemap" passes, comparing the built file exactly with `User-agent: *`, `Allow: /`, and `Sitemap: https://zotero-plugins.jmgirard.com/sitemap.xml`. The real-data build's `robots.txt` holds the same text.
- AC4: `src/build/previous.ts:6` and `.github/workflows/build.yml:69` and `:77` name `https://zotero-plugins.jmgirard.com/v1/plugins.json`. The two workflow tests on `--previous` and "gives each schema that the build publishes the $id of its own published address", which runs `writeData` into a temporary folder and reads each written schema, pass. The written files are `plugins.v1.schema.json` and `index.v1.schema.json`.
- AC5: the sweep outside `cairn/` lists `CHANGELOG.md:9`, `:271`, `:272`, `:279`, and `README.md:369`, the README text saying old page and data addresses forward and a script in a web page must use the new data address. Over `cairn/DESIGN.md` and `cairn/LESSONS.md` it lists only `cairn/DESIGN.md:251`, the same text. `grep -n robots` in README.md and `cairn/DESIGN.md` finds lines 342 and 1852 and line 213, none saying the site cannot have one.
- AC6: before any merge, `dig +short zotero-plugins.jmgirard.com CNAME` on the maintainer's machine prints `jmgirard.github.io.`; the custom domain is not set (`gh api repos/jmgirard/zotero-plugin-index/pages` reads `cname: null`).
- AC7: `pnpm test` exits 0 with 35 files passed, 1 skipped, and 2484 tests passed, 6 skipped; `pnpm check` reads "checked 736 entries in plugins, 0 problems", exit 0.
- Gate: `cairn_validate.py` all checks passed. The generic profile's consistency-gate slot names no toolchain checks. No DESIGN principle changed, so `cairn_impact` is skipped.
- spawned: diff-bug, blame-history, prior-review, ripple
- prior-review: no regression of a past review point; the PR comment probe returned none.
- diff-bug #1: nothing in code stops a 06:17 UTC or hand-run build between the merge and the domain switch, which would deploy root-path links under the old path and fail the `--previous` reads — reject, planned change: Scope In's switch order sets the domain right after the merge, and the merge runs well clear of 06:17 UTC.
- diff-bug #2: between setting the domain and the certificate, both addresses show the old deploy with broken links — reject, planned change: a window of minutes on a site not yet advertised; the data URL keeps working.
- diff-bug #3: README, DESIGN, and CHANGELOG state the forward in the present tense, false until the switch — reject, planned change: the switch follows the merge at once.
- diff-bug #4: DESIGN's robots sentence carried "(M102; corrected M102)" for text first written in M097 — fix now, fixed 6c4bcf27.
- diff-bug #5: CHANGELOG.md line 10 ran to 98 columns — fix now, fixed 6c4bcf27.
- diff-bug #6: short lines after rewrapping in README and DESIGN — reject, style.
- diff-bug #7: `src/site/theme.ts` comment gave a reason that no longer holds — fix now, fixed 6c4bcf27.
- diff-bug #8: the link sweep's escaped old-path pattern did not say why it is a pattern — fix now, fixed 6c4bcf27: its comment says so.
- diff-bug #9: `robots.txt.ts`'s Content-Type header is dropped in a static build — reject, false as a defect: Pages serves `.txt` by its extension, as it does `sitemap.xml`.
- diff-bug #10: README "publishes its data file on GitHub Pages" may not lead readers to the new host — reject, false: the sentence is true and the list under it names the new host.
- diff-bug #11 (test question c): the new `filterHref` test "keeps a path below the root" probes behavior the change does not alter — fix now, fixed 6c4bcf27: removed; `PAGE` is now the root probe.
- diff-bug #12 (test question c): the sweep's comment stated what the code shows — fix now, fixed 6c4bcf27, with #8.
- blame-history #1: the merge-to-switch window for the `--previous` reads — reject, planned change, as diff-bug #1.
- blame-history #2: the sweep missed a bare `/zotero-plugin-index` or one followed by `?` — fix now, fixed 6c4bcf27: the pattern is `/^\/zotero-plugin-index(?:[/?#]|$)/`.
- blame-history #3: the theme comment no longer stated why the key names the site — fix now, fixed 6c4bcf27, with diff-bug #7.
- blame-history #4: schema `$id`s change — noted, D-068 records it.
- blame-history #5: robots.txt reverses M097's reason — noted, D-068 records it.
- blame-history #6: `cairn/DESIGN.md:1063` still said "Pages path" — fix now, fixed 6c4bcf27.
- ripple #1: `cairn/DESIGN.md:1063` "The templates take the Pages path" — fix now, fixed 6c4bcf27, with blame-history #6.
- ripple #2: `cairn/DESIGN.md:558` listed only the pages `pnpm site` writes — fix now, fixed 6c4bcf27: it names `404.html`, `favicon.svg`, `sitemap.xml`, and `robots.txt`. A local build wrote no other top-level entry.
- snapshot: no changed snapshot file (`git diff --name-only main...HEAD` lists no `_snaps` or `__snapshots__` path).
