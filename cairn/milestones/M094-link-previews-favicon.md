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

- [x] AC1: On every HTML page built from the fixture data, `meta name="description"`, `og:title`, `og:description`, `og:type`, `og:site_name`, `og:url`, `twitter:card`, and `link rel="canonical"` each appear exactly once. `og:title` equals `<title>`, `og:description` equals the meta description, and both are non-empty and differ across the home, About, and plugin pages. `og:url` equals the canonical address, which is the page's own public address under `https://jmgirard.github.io/zotero-plugin-index/`, encoded as `pluginHref` encodes it. A test walks every built page and asserts this.
- [x] AC2: On each plugin page built from the records of the test `the plugin page's preview description`, the `meta name="description"` value is one of these. With no shown description (`shownDescription`), or when the cut below leaves only whitespace (what JavaScript's `\s` matches), it is a sentence that holds the plugin's `displayName`. Otherwise it is the shown description, whole at 200 code points or fewer, and above that cut at the last U+0020 in its first 200 code points that has a non-whitespace code point before it, or at 200 when that part has no such U+0020. The records include a text with `"` and `<` and a text of unbroken CJK.
- [x] AC3: Each built page links `favicon.svg` under the base path, and the file is in the site's output. The file draws one filled square in the accent color that shows on light and dark backgrounds, and it holds no Zotero logo. A test asserts the link, the file, and the one shape, and a hand check opens the file in both schemes.
- [x] AC4: `gh api repos/jmgirard/zotero-plugin-index/topics` lists `zotero`, `zotero-plugins`, and `plugin-directory`, and lists neither `zotero-plugin` nor `zotero-addon`, the two topics that discovery searches.
- [x] AC5: CHANGELOG's Unreleased section has an entry for the previews and the icon, and README's site section names them. `pnpm test` and `pnpm check` exit 0.

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
- 2026-11-04: step-7 approval: m094-link-previews-favicon approved for merge

## Decisions

## Review

- AC1 evidence (head 19d2dfea): `the link preview tags` tests pass; they walk all 22 pages of the fixture build (20 plugins plus home and About), assert each of the eight tags once with `tagValue`, the equalities, and the address from the file path; the About page in the browser pane read the same title, description, and canonical address.
- AC2 evidence (head 19d2dfea): `the plugin page's preview description` builds 7 records and passes: cut at a space past 200 code points (astral text, so a cut by UTF-16 units fails), unbroken CJK at 200, no text with a name and with an id, `"` and `<` with `&quot;` decoded in one pass, a head of only spaces, and a whitespace-only override; the 10 `cutDescription` rows cover 200 code points whole and each opening-whitespace case.
- AC3 evidence (head 19d2dfea): the `the favicon` tests pass: one `rel="icon"` link on every page to `/zotero-plugin-index/favicon.svg`, one `rect` that fills the view box and no other shape, and each scheme's `--accent` at 3:1 or more on that scheme's `--bg`. Hand check on the fixture build in the browser pane: light scheme fill rgb(181, 35, 47), dark scheme fill rgb(240, 113, 120), one shape each, no logo, and the link answered 200. The pane is one browser, so the check does not cover how other browsers show an icon in a tab.
- AC4 evidence (2026-11-04): `gh api repos/jmgirard/zotero-plugin-index/topics` returns exactly `plugin-directory`, `zotero`, and `zotero-plugins`; neither `zotero-plugin` nor `zotero-addon`, the two that `TOPICS` in `src/discover/holds.ts` names.
- AC5 evidence (head 19d2dfea): CHANGELOG's Unreleased section has one entry for the previews and one for the icon; README's "The site" section names both in its last paragraph; `pnpm test` exits 0 (2384 passed, 6 skipped), and `pnpm check` exits 0 (736 entries, 0 problems).
- Consistency gate: `cairn_validate.py` exits 0 at head 19d2dfea; no DESIGN principle changed; the generic profile names no toolchain check.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: 101 of 736 real previews end mid-sentence with no mark — follow-up, parked row "Tighten link previews and the icon".
- diff-bug #2: the only icon is SVG, with no PNG or ICO fallback, and the hand check used one browser — follow-up, same row.
- diff-bug #3: the About intro change is outside Scope and absent from CHANGELOG — follow-up, same row, for the facts About does not source; the sentence stays, because the audit found the old one false.
- diff-bug #4: `rx="3"` drew a rounded square where AC3 says a filled square — fix now, fixed c0bca21e; the agent judged this no criterion failure, as the shape was one filled square, and removed the rounding so the words match exactly.
- diff-bug #5: the `og:description` check repeated across the rows — fix now, fixed c0bca21e.
- diff-bug #6: the encoded-address test repeated the walk — fix now, fixed c0bca21e.
- diff-bug #7: a row pinned 200 spaces, which no page shows — fix now, fixed c0bca21e; the code guard behind it did nothing and went too.
- diff-bug #8: the one-space row ran the same branch as the two-space row — fix now, fixed c0bca21e.
- diff-bug #9: the newline row runs the same branch as the no-space row — reject, false: it pins that only U+0020 counts, which AC2 states.
- diff-bug #10: the favicon test's regexes bind one form of the file — reject, style.
- diff-bug #11: the contrast checks sit apart from `PAIRS` and use `--bg` for the tab strip — reject, style.
- diff-bug #12: built rows overlap `cutDescription` rows — reject, false: the built rows test code points and the build, and the unit rows test the 200 boundary.
- diff-bug #13: three rows expect the same sentence — reject, false: each reaches it by a different route.
- diff-bug #14: DESIGN omits `cutDescription` and `ORIGIN` — fix now, fixed c0bca21e.
- diff-bug #15: each page passes `path` by hand — reject, style; AC1's walk catches a wrong path.
- diff-bug #16: the public address is hard-coded again in `ORIGIN` — follow-up, same row.
- diff-bug #17: "Zotero plugin index" is a literal in several places — reject, style.
- diff-bug #18: a cut can keep stray whitespace — follow-up, same row.
- diff-bug #19: a cut can leave a short or name-only preview — follow-up, same row.
- diff-bug #20: over 200 opening spaces drops the text for the sentence — follow-up, same row.
- diff-bug #21: AC2 is scoped to the test's records and had no third reader — reject, planned change: the bound follows the audit, and the user left the wording to the agent.
- diff-bug #22: the home preview omits the hand-read fact and the cannot-vet line — reject, false: it says "facts that" a build reads, not all facts, and it says "unofficial".
- diff-bug #23: the title check does not trim, and `tagsOf` is a hand parser — reject, style.
- diff-bug #24: some comments restate the code — reject, style.
- diff-bug #25: an added DESIGN line runs past the wrap — fix now, fixed c0bca21e.
- diff-bug #26: "characters" stands for code points — reject, style: plain wording for readers.
- blame-history #1: the About intro softens a promise and leaves stars unsourced — follow-up, same row.
- blame-history #2: AC2 was rewritten to match the code — reject, planned change: logged, and the user left the wording to the agent.
- blame-history #3: "characters" against code points — reject, style.
- blame-history #4: plugin text reaches outside platforms — reject, false: the public page already shows that text.
- blame-history #5: `ORIGIN` is hard-coded — follow-up, same row.
- blame-history #6: no ellipsis at a cut — follow-up, same row.
- blame-history #7: Safari may not apply an SVG icon or its media query, unverified — follow-up, same row.
- prior-review #1: a text of only U+200B gives an invisible preview, as DESIGN's Known issues entry says for Details — follow-up, same row.
- prior-review #2: a cut can leave trailing spaces — follow-up, same row.
- prior-review #3: the DESIGN line runs past the wrap — fix now, fixed c0bca21e.
- prior-review #4: the home preview paraphrases `DISCLAIMER` — reject, style.
- ripple #1: README's list of `pnpm site` outputs omits the favicon — fix now, fixed c0bca21e.
- ripple #2: DESIGN's list for `src/site/description.ts` omits `cutDescription` — fix now, fixed c0bca21e.
- ripple #3: DESIGN does not say where the host comes from — fix now, fixed c0bca21e.
- ripple #4: "the main facts" implies some are left out — reject, false: no line says About covers every fact.
- ripple #5: lines on the discovery topics — reject, false: they describe plugin repos, not this repo.
- ripple #6: "icon" names both the card mark and the favicon in README — fix now, fixed c0bca21e.
- Evidence after the fixes (head c0bca21e): `pnpm test` exits 0 (2381 passed, 6 skipped), `pnpm check` exits 0; the 8 `cutDescription` rows and 7 built records pass; the rect has no `rx` in either scheme in the browser pane, fills rgb(181, 35, 47) and rgb(240, 113, 120). No snapshot files changed. Rejected 18, fixed 12, sent to the row 13; no finding moved the status back.
