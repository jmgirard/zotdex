# M103: Move the site to zotdex.jmgirard.com and name it Zotdex

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the site's address, the public data URL, and the site's visible name change
- **Branch/PR:** m103-move-to-zotdex

## Goal

Serve the site and its data at `https://zotdex.jmgirard.com/` under the name Zotdex before the index is advertised, with GitHub forwarding the old github.io addresses there (D-069).

## Scope

**In:**
- The host `https://zotdex.jmgirard.com` in `ORIGIN` (`site/src/base.ts`), `PREVIOUS_URL` (`src/build/previous.ts`), both `--previous` lines in `.github/workflows/build.yml`, and the `$id` of each published schema, with their tests.
- The site's name becomes Zotdex: the top bar's brand link, `og:site_name`, page titles (home `Zotdex: a Zotero plugin index`, others `<page>: Zotdex`), the About and 404 descriptions, and the preview fallback in `site/src/data.ts`.
- README (Zotdex in the first paragraph, the new address), the CHANGELOG Unreleased entry from M102 rewritten to the final address and name (never released or announced), `cairn/DESIGN.md` (the URLs and the M102/D-068 tag), and the M035 lesson.
- The switch, after the merge, in this order: set the repo's Pages custom domain to `zotdex.jmgirard.com`; wait until GitHub reports the certificate approved; enforce HTTPS; run `gh workflow run build.yml --ref main`; read that run's log for its `--previous` reads of the new URL; read the new home page and data URL, an old github.io address's forward, and `zotero-plugins.jmgirard.com`; set the repo homepage link. No criterion covers it, as its evidence exists only after the merge; review records it in the work log. The user then deletes the `zotero-plugins` CNAME record and adds the new host in Search Console and Bing.

**Out:**
- Renaming the GitHub repo: the user raised it at the question set; its answer decides a separate milestone or none.
- A redirect for `zotero-plugins.jmgirard.com`: the user chose none, as it was never announced.
- Buying `zotdex.com`: the user's, if the site becomes popular.
- The author badge: planned after this milestone, labeled Zotdex.
- History records keep the old hosts: `cairn/milestones/archive/`, `cairn/DECISIONS.md`, `cairn/references/`, `cairn/mockups/`, and CHANGELOG's released sections.

## Acceptance criteria

- [ ] AC1: `ORIGIN` in `site/src/base.ts` is `https://zotdex.jmgirard.com`; `PREVIOUS_URL` in `src/build/previous.ts` and both `--previous` arguments in `.github/workflows/build.yml` are `https://zotdex.jmgirard.com/v1/plugins.json`; each schema file that `writeData` writes has the `$id` `https://zotdex.jmgirard.com/schemas/<its file name>`. In the site that `test/site.test.ts` builds, each canonical link, `og:url`, and sitemap `<loc>` starts with `https://zotdex.jmgirard.com/`, and `robots.txt` names `https://zotdex.jmgirard.com/sitemap.xml`. Shown by the site, workflow, and schema tests.
- [ ] AC2: In that built site, every page's `og:site_name`, `404.html` included, is `Zotdex`; the top bar's brand link text is `Zotdex`; the home page's `<title>` and `og:title` are `Zotdex: a Zotero plugin index`; and every other page's `<title>` ends with `: Zotdex`. A site test over every built HTML file finds `zotero plugin index`, ignoring case, only in the home page's `<title>` and `og:title`.
- [ ] AC3: Each line that `git grep -niE 'jmgirard\\?\.(com|github\\?\.io)'` finds outside `cairn/` and outside CHANGELOG's released sections, and in `cairn/DESIGN.md` and `cairn/LESSONS.md`, names `zotdex.jmgirard.com` or names `jmgirard.github.io/zotero-plugin-index` as the old address that forwards. README's first paragraph names the site Zotdex, and the first sentence under "The site" gives `https://zotdex.jmgirard.com/`. The CHANGELOG Unreleased entry on the move names the site Zotdex and the address `https://zotdex.jmgirard.com/`.
- [ ] AC4: Before the merge, `dig +short zotdex.jmgirard.com CNAME` prints `jmgirard.github.io.`.
- [ ] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T4
- AC5 → T1, T2, T3

## Tasks

- [x] T1: Move the host in `site/src/base.ts`, `src/build/previous.ts`, `.github/workflows/build.yml`, both schemas, and the tests that name it (`test/site.test.ts`, `test/home-filter.test.ts`, `test/schemas.test.ts`, `test/workflows.test.ts`).
- [x] T2: Rename the site to Zotdex in `site/src/layouts/Base.astro`, `site/src/pages/index.astro`, `about.astro`, `404.astro`, `plugins/[id]/index.astro`, and `site/src/data.ts`; widen the preview-tag test to `404.html` for `og:site_name`, and add the case-insensitive name sweep over every built HTML file.
- [x] T3: README, the CHANGELOG Unreleased entry, `cairn/DESIGN.md`, and the M035 lesson, marked `corrected M103`.
- [x] T4: Once the user has added the CNAME record, read it with `dig`; if it is missing, stop for the user.

## Work log

- 2026-11-05: created by /milestone-plan.
- 2026-11-05: tier check: milestone — changes the published site address, data URL, and site name, and needs a decision entry.
- 2026-11-05: idea vet: gap — whether the visible name changes with the address; reading taken, rename to Zotdex, which the user chose at the question set. No flaw: the move came about two hours after M102, before any announcement.
- 2026-11-05: lessons used: 2026-10-31 (M066), 2026-10-28 (M035), 2026-10-28 (M036), 2026-10-26 (M018).
- 2026-11-05: collision check: M102 (done) set `zotero-plugins.jmgirard.com`; this extends it, and D-069 annotates D-068's address; no candidate row overlaps; the badge planning paused at its question set and resumes after this milestone.
- 2026-11-05: inbox sweep: no open issues; 14 open bot pull requests, none overlapping.
- 2026-11-05: criteria audit (full mode) returned 7 findings: AC3's sweep widened from one host to every jmgirard host line, escaped forms included, each required to name the new host or the forwarded github.io address; AC3's README clause fitted to where the address sits; AC3 requires the CHANGELOG entry to name Zotdex; AC2's sweep ignores case and `og:site_name` covers `404.html`; Search Console added to the user's steps after the switch. Answered, not adopted: a criterion on the live switch, whose evidence exists only after the merge, so Scope In orders it and review records it. Noted: "the index" as a plain noun stays true.
- 2026-11-05: question set: site name — rename to Zotdex.
- 2026-11-05: question set: GitHub steps after the merge (custom domain, enforce HTTPS, build run, repo homepage) — the agent runs them with gh.
- 2026-11-05: question set: DNS — the user adds `zotdex` CNAME to `jmgirard.github.io` (DNS only) before the merge and deletes the `zotero-plugins` record after the switch; the user also asked whether to rename the repo.
- 2026-11-05: plan gate chose no redirect for `zotero-plugins.jmgirard.com`, at the user's word, over a Cloudflare redirect rule, as the host was live about two hours and never announced; falsified by a link to it found in use.
- 2026-11-05: implement started on m103-move-to-zotdex; untracked `.claude/` left unstaged.
- 2026-11-05: T1 done: `ORIGIN`, `PREVIOUS_URL`, both build.yml `--previous` lines, both schema `$id`s, and the four test files name `https://zotdex.jmgirard.com`; a search of site, src, test, schemas, and .github finds no `zotero-plugins.jmgirard`. pnpm test 2483 passed, pnpm check 0 problems.
- 2026-11-05: T2 done: brand link and `og:site_name` read Zotdex; titles are `Zotdex: a Zotero plugin index` (home), `About: Zotdex`, `Page not found: Zotdex`, and `<name>: Zotdex`; About and 404 descriptions and the preview fallback say Zotdex. New site test "names the site Zotdex in every page's site name and title" reads every built HTML file, 404 included. Planting `About: Zotero Plugin Index` as a title and `ZOTERO PLUGIN INDEX` in a description each turned it red. pnpm test 2484 passed, pnpm check 0 problems.
- 2026-11-05: T3 done: README's first paragraph opens "Zotdex is a community index", and its site, data, schema, and `curl` addresses name zotdex; the CHANGELOG Unreleased entry from M102 now says the site is named Zotdex at `https://zotdex.jmgirard.com/`; DESIGN's data URLs and tag name M103 and D-069; the M035 lesson names the new data URL. The AC3 search lists only zotdex lines and the github.io forward text at CHANGELOG:9, README:370, and DESIGN:251. No new plain-English hit. pnpm test 2484 passed, pnpm check 0 problems.
- 2026-11-05: claim audit: 24 claims read, 0 corrected — README.md, CHANGELOG.md, site/src/base.ts, site/src/data.ts, site/src/layouts/Base.astro, site/src/pages/*, test/*. Not checkable before the switch: zotdex serving the site and github.io forwarding there.
- 2026-11-05: T4 in progress: 1.1.1.1 and 8.8.8.8 return the `zotdex` CNAME `jmgirard.github.io.`; this machine's resolver still holds an earlier empty answer, so a background read waits for it.
- 2026-11-05: T4 done: `dig +short zotdex.jmgirard.com CNAME` on this machine prints `jmgirard.github.io.` once the router's empty answer expired; the custom domain is still `zotero-plugins.jmgirard.com`. Implement done; status review.

## Decisions

## Review
