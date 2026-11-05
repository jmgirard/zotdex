# M097: Get the site ready for first visitors

**Status:** done (2026-11-05, PR #836 https://github.com/jmgirard/zotero-plugin-index/pull/836)

**Goal:** Help a first-time visitor find established plugins and find their way around the site, before the index is advertised.

**Outcome:** The home table opens by `upstream.stars`: `sortOrder` in `src/site/home-filter.ts` holds the Stars, `name`, and `latest` orders, and `homeOrder` in `site/src/data.ts` uses it, replacing M053's name order. A hidden "Sort by" menu (`select[data-sort]`) reorders the rows from `data-stars` and `data-released`, keeps `?sort=name` or `?sort=latest`, removes other values, and restores the built rows for Stars. `prePaintStyle` hides every row for a `sort` value that is not empty. Home rows show the count after the owner in `.row-stars`, in `--muted`, and only `.owner-name` is cut; the legend says the count and default order are no review. `site/astro.config.ts` sets `assetsInlineLimit` to 32768, so the module script stays inline. `site/src/pages/404.astro` writes `404.html`; `path` in `Base.astro` is optional, and a page without one has `noindex`, no canonical link, and no `og:url`. `site/src/pages/sitemap.xml.ts` writes `sitemap.xml`, linked from each head. GitHub Discussions is on, and the top bar links to it as "Feedback" (`FEEDBACK_HREF`).

**Decisions:** D-065 (the home table opens in star order, and the legend says this is no review). The user chose Stars as the default, the count after the owner, Discussions over an issue form, and a sitemap that the user submits to Search Console by hand after a deploy.

**Review:** Claim audit 120 claims, 8 corrected. Four lenses over two passes, with one defect return: the home star icon was gold, against AC3. 28 fixed, including `toSorted` throwing in older browsers and two blind tests; 20 rejected and 6 noted; 1 follow-up held by the row "Test the home page script in a browser"; 2 known issues, the star icons' bytes and a sort change that only the menu announces. Retired by rank: lesson 2026-10-31 (M070). No row unparked. The live 404 page waits for a deploy.
