# M094: Add link previews and a favicon

- **Status:** in-progress
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — tags and an icon on every public page, and the repo's public topics
- **Branch/PR:** m094-link-previews-favicon

## Goal

A shared link to any index page shows its own title and description, the page has an icon, and the repo has topics.

## Scope

**In:** a meta description, Open Graph tags, a Twitter card tag, and a canonical link on each page; a favicon; three GitHub topics; README and CHANGELOG lines.

**Out:** a preview picture (user's choice at the plan; parked row "Add a picture to link previews"); a custom 404 page (no request for one); the removal path → M093; the license → M095.

## Acceptance criteria

- [ ] AC1: On every HTML page built from the fixture data, `meta name="description"`, `og:title`, `og:description`, `og:type`, `og:site_name`, `og:url`, `twitter:card`, and `link rel="canonical"` each appear exactly once. `og:title` equals `<title>`, `og:description` equals the meta description, and both are non-empty and differ across the home, About, and plugin pages. `og:url` equals the canonical address, which is the page's own public address under `https://jmgirard.github.io/zotero-plugin-index/`, encoded as `pluginHref` encodes it. A test walks every built page and asserts this.
- [ ] AC2: A plugin page's description is the shown description (`shownDescription`), cut at the last space in its first 200 code points, or at 200 when that part has no space. A record with no shown description gets a fixed sentence that names the plugin. A description that holds `"` and `<` has a parsed attribute value equal to the text. A test asserts the four cases, one with unbroken CJK text.
- [ ] AC3: Each built page links `favicon.svg` under the base path, and the file is in the site's output. The file draws one filled square in the accent color that shows on light and dark backgrounds, and it holds no Zotero logo. A test asserts the link, the file, and the one shape, and a hand check opens the file in both schemes.
- [ ] AC4: `gh api repos/jmgirard/zotero-plugin-index/topics` lists `zotero`, `zotero-plugins`, and `plugin-directory`, and lists neither `zotero-plugin` nor `zotero-addon`, the two topics that discovery searches.
- [ ] AC5: CHANGELOG's Unreleased section has an entry for the previews and the icon, and README's site section names them. `pnpm test` and `pnpm check` exit 0.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T2
- AC4 → T3
- AC5 → T4

## Tasks

- [x] T1: Give `Base.astro` (`site/src/layouts/Base.astro:7`) `description` and path props, write the tags, and pass them from the three pages, with a helper for the cut. Test on built pages in `test/site.test.ts`.
- [x] T2: Add `site/public/favicon.svg`, which Astro copies to the output, and the link, and test them.
- [x] T3: Add the three topics with `gh repo edit --add-topic` after reading the current list.
- [x] T4: Update README and CHANGELOG, and run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-04: created by /milestone-plan.
- 2026-11-04: tier check: milestone — the request as a whole holds milestone work, and this part changes running site code.
- 2026-11-04: idea vet: gap — topics could feed the bot's own search; reading taken: avoid `zotero-plugin` and `zotero-addon`. gap — a preview picture; the question set chose none. flaw — none.
- 2026-11-04: lessons used: 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-31 (M066).
- 2026-11-04: question set: may the work add the three repo topics — yes.
- 2026-11-04: question set: may the work start `Build data` by hand after the merge — yes.
- 2026-11-04: question set: should a shared link show a picture — no, text only for now.
- 2026-11-04: plan chose a static SVG over an inline data address because it is one reviewable file and pages stay smaller; falsified by a browser that the site supports showing no icon.
- 2026-11-04: full criteria audit findings here: counts did not show a page's own text (equalities added); CJK has no word break (fallback cut added); the hand look bound a recording (file property instead); the goal omitted topics (added). All fixed in the wording above.
- 2026-11-04: `.claude/` is untracked and unrelated, so it stays unstaged; it gained an `m094-look` server entry for the hand check.
- 2026-11-04: T1 and T2: one commit, as their tests share one test file. `cutDescription` went in `src/site/description.ts`, `previewDescription` in `site/src/data.ts`, and `ORIGIN` in `site/src/base.ts`.
- 2026-11-04: T1: a space that opens a long text does not count as the cut point, because a cut there would leave an empty description, which AC1 forbids. twitter:card is `summary`, the text-only card; og:type is `website`.
- 2026-11-04: T2: the icon uses each scheme's accent through a media query, because the light accent gives under 3:1 on the dark background and the dark accent under 3:1 on the light one; a test asserts at least 3:1 for each pair. Hand check on the fixture site at 2026-11-04: opened in the light and dark schemes in the browser pane, fill rgb(181, 35, 47) and rgb(240, 113, 120); the home page link answered 200.
- 2026-11-04: T3: the repo had no topics; added `zotero`, `zotero-plugins`, and `plugin-directory` with `gh repo edit`, as the question set allowed; the topics read back as those three.
- 2026-11-04: T4: README and CHANGELOG lines added, and a DESIGN.md sentence on the props and the icon file; `pnpm test` and `pnpm check` exit 0. The prose hook's hits on these two files are all on older lines, so they stay as they are.

## Decisions

## Review
