# M094: Add link previews and a favicon

**Status:** done (2026-11-05, PR #833 https://github.com/jmgirard/zotero-plugin-index/pull/833)

**Goal:** A shared link to any index page shows its own title and description, the page has an icon, and the repo has topics.

**Outcome:** `Base.astro` takes `description` and `path` props and writes a meta description, `og:title`, `og:description`, `og:type`, `og:site_name`, `og:url`, `twitter:card` (`summary`, no picture), and `link rel="canonical"`, using `ORIGIN` in `site/src/base.ts`. A plugin page uses `previewDescription` in `site/src/data.ts`: the shown description through `cutDescription` in `src/site/description.ts`, or a sentence with the plugin's name. `site/public/favicon.svg` is one square with each scheme's accent, through a media query. The repo gained the topics `zotero`, `zotero-plugins`, and `plugin-directory`, and not the two that discovery searches. About's intro now says "the main facts". README and CHANGELOG describe them.

**Decisions:** none cross-cutting. The icon uses both accents because each gives under 3:1 on the other scheme's background.

**Review:** Claim audit 38 claims, 4 corrected, none wrong at the re-read; one correction fixed a blank preview for text that opens with spaces. AC2 was amended once, as its wording did not match the behavior: two re-audits, and then the user left the wording to the agent. Four-lens fan-out, 43 findings: 12 fixed (the icon's rounded corners, repeated tests, a guard that did nothing, stale README and DESIGN lines); 13 sent to the new parked row "Tighten link previews and the icon"; 18 rejected (9 style, 7 false, 2 planned change). Lessons marked used: M015, M021, M035, M066. None captured or retired. No Known issues entry.
