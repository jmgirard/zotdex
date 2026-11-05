# M097: Get the site ready for first visitors

- **Status:** in-progress
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — visitors see the sort menu, the star counts, the 404 page, and the Feedback link
- **Branch/PR:** m097-first-visitors

## Goal

Help a first-time visitor find established plugins and find their way around the site, before the index is advertised.

## Scope

**In:** a "Sort by" menu on the home table with Stars as the default, star counts on home rows, a 404 page, GitHub Discussions with a "Feedback" link in the top bar, a `sitemap.xml`, and the docs for each.

**Out:** the choice about the four Sci-Hub plugins, the hand reports, and the Safari and Firefox checks → the user, before advertising, with no code in this milestone. Submitting the sitemap in Google Search Console → the user by hand after a deploy. A verification tag or file that Google asks for → a trivial edit then. A `robots.txt` → no place for it, as it must sit at the host root, which this repo does not serve. A picture in link previews → the "Add a picture to link previews" row. An automated browser test → the "Test the home page script in a browser" row.

## Acceptance criteria

- [ ] AC1: With JavaScript, the home page has a "Sort by" menu with the options Stars (the default), Name (`name`), and Latest release (`latest`). Stars puts a higher `upstream.stars` first, and 0 is a value. Latest release puts a later `upstream.latestReleaseDate` first. Name uses the display name with `localeCompare` at base sensitivity, then the id. Under Stars and Latest release, a record with no such value comes after every record that has one, and records that tie keep Name order. A change of the menu reorders the rows that the filters pass and shows page 1. The page keeps `sort=name` or `sort=latest` in the address, reads it on load and on Back and Forward, and removes any other `sort` value, `sort=stars` included. `test/home-filter.test.ts` tests the order on rows that cover each case in this criterion. `test/site.test.ts` tests that the built rows carry each record's values, and it tests the parameter, the row order, and page 1 on the built page's script.
- [ ] AC2: Without JavaScript, the built home page lists every row in Stars order and shows no sort menu: the menu's wrapper has `hidden`, and the layout's `[hidden]` rule names it. `test/site.test.ts` tests the order, the wrapper, and the rule. For an address whose `sort` value is not empty, `prePaintStyle` hides every row. The existing cases in `test/support/pre-paint.ts` keep their styles, and new cases cover `?sort=name`, `?sort=x`, `?sort=`, `?sort=%20`, `?sort=name&page=2`, and `?sort=name&language=en`.
- [ ] AC3: A home row that shows an owner and whose record has `upstream.stars` shows a star icon and the count after the owner, in `--muted`, with the same words as the plugin page (`starsText`) in its title and for screen readers. A long owner is cut with an ellipsis, and the count stays whole. At 375 px with the deployed data, the home page has no page overflow, the table card does not scroll sideways, and the count shows whole in each row with the longest owner name and in the most-starred row whose owner is cut, as a browser pane check that pages to those rows shows. The legend under the table says that the count comes from GitHub, that the default order comes from that count, and that neither is a review by the index.
- [ ] AC4: `pnpm site` writes `404.html` at the top of the site. Its main content says that no page is at that address and links to the home page and the About page by addresses that start with `BASE`. It has a `robots` meta tag with `noindex`, no canonical link, and no `og:url` tag. A test in `test/site.test.ts` reads the built file.
- [ ] AC5: GitHub Discussions is on for the repository: `gh repo view --json hasDiscussionsEnabled` reads true. The top bar of every built page, as a test in `test/site.test.ts` reads it, links to `https://github.com/jmgirard/zotero-plugin-index/discussions` as "Feedback". At 375 px with the deployed data, the home page has no page overflow.
- [ ] AC6: `pnpm site` writes `sitemap.xml` at the top of the site in the sitemaps.org `urlset` form, with one `<loc>` for the home page, one for the About page, and one for each record in the data, each equal to that page's canonical address, and no other `<loc>`. Each built page's head has a `<link rel="sitemap">` to it. A test in `test/site.test.ts` compares the `<loc>` list with the canonical links of the built pages and reads the head link.
- [ ] AC7: README, `cairn/DESIGN.md`, and CHANGELOG state the behavior of AC1 to AC6 and no longer say that the home table is sorted by name, and `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T2
- AC2 → T1, T2
- AC3 → T3, T7
- AC4 → T4
- AC5 → T5, T7
- AC6 → T6
- AC7 → T7

## Tasks

- [x] T1: In `src/site/home-filter.ts`, add the sort options and a row comparator, keeping the file free of imports, since the module script imports it and `site/src/data.ts` reads `node:fs`. Add the `sort` clause to `prePaintStyle`, with `%20` hiding every row. Have `homeOrder` in `site/src/data.ts` use the comparator, so the one rule orders the build and the script. Tests first in `test/home-filter.test.ts` and `test/support/pre-paint.ts`.
- [x] T2: In `site/src/pages/index.astro`, give each row its stars and full release date as data attributes, and add the hidden "Sort by" menu. Reorder the rows in the script, read and write `sort`, and make a change show page 1. In `Base.astro`, style the menu with the other menus, including the forced-colors block and the `[hidden]` rule. Update `test/site.test.ts`: the row regex near line 1394, the selector stand-in near line 1447, the generated rows near line 1406, the order near line 1294, and the pre-paint tests near lines 999 to 1023.
- [x] T3: Show the count on the owner line, keeping it outside `[data-name]` and `[data-description]`, so the search does not read it. Cut only the owner with the ellipsis. Add the legend text. Add a fixture row with `LONG_OWNER` and a large count, by a text edit, and list it in the hand-kept fixture orders.
- [x] T4: Add `site/src/pages/404.astro`. Make `path` optional in `Base.astro`, with the canonical link and `og:url` left out without it and a `noindex` meta on this page. Update the page-count and head-tag tests that the new page reaches near `test/site.test.ts:1994`.
- [ ] T5: Turn on Discussions with `gh repo edit jmgirard/zotero-plugin-index --enable-discussions`, as the user chose, and read the setting back. Add the "Feedback" link to the top bar and update the exact-match link test near `test/site.test.ts:1807`.
- [ ] T6: Add an Astro endpoint, `site/src/pages/sitemap.xml.ts`, from `ORIGIN`, `BASE`, and `pluginHref`, with no new package (D-004). Add the head link in `Base.astro`. Add its tests.
- [ ] T7: Update README (the site section and the top bar), `cairn/DESIGN.md` (lines near 58 and 106 and the GitHub-only line near 211), and CHANGELOG. Build the site from the deployed data and do the 375 px checks of AC3 and AC5 in the browser pane. Run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-05: created by /milestone-plan.
- 2026-11-05: tier check: milestone — a `/milestone-plan` request with new behavior and design choices; the user asked for one milestone after the /milestone status read.
- 2026-11-05: idea vet: gap, default order, asked, Stars; gap, where the count shows, asked, after the owner; gap, where feedback goes, asked, Discussions; gap, a Stars default can read as advice, narrowed by the legend text and D-065; flaw, a sitemap does nothing until submitted since no `robots.txt` can reach the host root, asked, build it and the user submits it.
- 2026-11-05: lessons used: 2026-10-25 (M001), 2026-10-26 (M015), 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-29 (M048), 2026-10-29 (M054), 2026-10-30 (M061), 2026-10-31 (M066).
- 2026-11-05: criteria audit (full): an Opus reader returned no unsatisfiable criterion and wording findings in all seven; all fixed: named the `sort` values and `sort=stars`, 0 as a value, rows in the comparator test, named tests for order and page 1, the `[hidden]` rule trap, a sample of pre-paint cases over "every other address", the blank `%20` case, rows with no owner, both tied longest owners plus a most-starred cut row, a card that scrolls itself, the property stated before the check, the count's color, a 404 page that says what happened, a full discussion address, the `urlset` form, the head link's test, and retiring the sorted-by-name text.
- 2026-11-05: criteria audit (full), AC5 after the Discussions answer: one finding, a sentence that bound the test, moved to a method clause on the link sentence.
- 2026-11-05: question set: default order — Stars, with the Sci-Hub row's 9th place named in the question.
- 2026-11-05: question set: star count place — after the owner.
- 2026-11-05: question set: turn on GitHub Discussions and link it as Feedback — yes, the user chose it over an issue form.
- 2026-11-05: question set: sitemap — build it; the user verifies the site and submits it in Search Console after a deploy.
- 2026-11-05: plan gate chose an issue-form-free Discussions link as the user answered; an issue form lost at the user's choice; falsified by Discussions going unread while issues get answers.
- 2026-11-05: plan chose a menu over clickable column headers because Stars has no column and the toolbar already holds menus; falsified by visitors missing the menu.
- 2026-11-05: plan chose an Astro endpoint over `@astrojs/sitemap` because D-004 asks for approval of a new package and the file is short; falsified by a sitemap need that the endpoint cannot meet.
- 2026-11-05: collision sweep: no D-entry or archive rejects a sort, a 404 page, a sitemap, or Discussions; M053 set the name order that this replaces; D-006, D-026, D-037, D-051, and D-064 stand; no candidate row absorbed.
- 2026-11-05: inbox sweep: 0 open issues; 9 open bot pull requests, none overlapping.
- 2026-11-05: deploy: a merge deploys nothing (M066 lesson), so review offers `gh workflow run build.yml --ref main` and reads the live 404 page after that run, which a local server cannot show.
- 2026-11-05: implement started on branch m097-first-visitors; `.claude/` is an untracked local folder and stays unstaged.
- 2026-11-05: T1 done: `sortOrder` in `home-filter.ts` is the one rule, `homeOrder` uses it, and `prePaintStyle` hides every row for a sort value that is not empty; two site tests now compare rows by id, not by hand order.
- 2026-11-05: T2 done: the home page has the hidden "Sort by" menu and the script reorders rows; the script passed Vite's 4 KiB inline limit, so `site/astro.config.ts` sets `assetsInlineLimit` to 32768 and the page keeps its script inline, over letting it become a separate file, which the test harness and the page's no-extra-request habit do not expect.
- 2026-11-05: T3 done: home rows show the count after the owner, only the owner is cut, and the legend has the no-review line; `same-name-plugin` (the long owner in the fixture) took a count of 98765 in place of a new fixture row, which keeps the hand-kept fixture lists short. The 375 px checks wait for T7.
- 2026-11-05: T4 done: `site/src/pages/404.astro` builds `404.html`; `path` in `Base.astro` is optional, and a page without one has no canonical link or `og:url` and a `noindex` tag. The live 404 read waits for a deploy after the merge.

## Decisions

## Review
