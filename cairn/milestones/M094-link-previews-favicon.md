# M094: Add link previews and a favicon

- **Status:** review
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
- [ ] AC2: On each plugin page built from the records of the test `the plugin page's preview description`, the `meta name="description"` value is one of these. With no shown description (`shownDescription`), or when the cut below leaves only whitespace (what JavaScript's `\s` matches), it is a sentence that holds the plugin's `displayName`. Otherwise it is the shown description, whole at 200 code points or fewer, and above that cut at the last U+0020 in its first 200 code points that has a non-whitespace code point before it, or at 200 when that part has no such U+0020. The records include a text with `"` and `<` and a text of unbroken CJK.
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
- 2026-11-04: claim audit fixes: README now says a text of 200 characters or fewer is not cut; the `previewDescription` comment no longer says "fixed"; `cutDescription` no longer cuts at spaces that open a text, and `previewDescription` falls back to the sentence when the cut holds only spaces, so AC1's non-empty text holds (a small addition to AC2's cut rule, which it did not cover); the About preview text and the About intro now say "the main facts", because About gives no source for some facts, such as stars and open issues.
- 2026-11-04: claim audit: 38 claims read, 4 corrected — README.md, site/src/data.ts, src/site/description.ts, site/src/pages/about.astro. The same reader re-read the 4 and found none wrong.
- 2026-11-04: amendment routed: AC2 — as written it cuts every description at a space, even one of 200 code points or fewer, and it gives a blank preview for a text whose first 200 code points hold only opening spaces and a space; the code keeps short text whole and does not cut at opening spaces, so the wording, not the work, is wrong.
- 2026-11-04: re-audit: AC2 (full) — 14 findings on the first draft: "space" had no meaning that fit the code, a short whitespace-only text stayed blank, and the attribute sentence was false for carriage return, NUL, and lone surrogates; the test sentence bound an instrument; the draft was rewritten, 3 test rows and a README sentence added; code unchanged; the cut's odd but valid results (a one-letter preview, a split combining mark) were left as they are.
- 2026-11-04: re-audit: AC2 (full) — second draft: 0 differences from the code on 400,000 generated texts, but "meta description" read two ways, sentences 1 and 4 conflict on whitespace-only text, and no procedure bounds the claims; comments and README now say whitespace, and a test row uses mixed whitespace; further wording goes to the user, the stop for a second re-audit.
- 2026-11-04: at that stop the user said they do not care about this level of detail and asked the agent to make the wording change carefully on its own; the agent took the text it had recommended, with no third reader.
- 2026-11-04: amendment return: AC2 — "On each plugin page built from the records of the test `the plugin page's preview description`, the `meta name="description"` value is one of these. With no shown description (`shownDescription`), or when the cut below leaves only whitespace (what JavaScript's `\s` matches), it is a sentence that holds the plugin's `displayName`. Otherwise it is the shown description, whole at 200 code points or fewer, and above that cut at the last U+0020 in its first 200 code points that has a non-whitespace code point before it, or at 200 when that part has no such U+0020. The records include a text with `"` and `<` and a text of unbroken CJK."

## Decisions

## Review
