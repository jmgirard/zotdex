# M110: Use plain words on plugin pages

**Status:** done (2026-11-07, PR #859 https://github.com/jmgirard/zotdex/pull/859)

**Goal:** A plugin page's text reads in the home page's plain words, as the user approved it in the "Plugin page (M110)" section of `cairn/references/plain-words-copy.md` (D-078).

**Outcome:** Plugin pages show a "Zotero versions" card with "Supports" and "Startup check" columns, "Not stated" and "Not checked" cells, and a "Supported versions:" line; "Zotdex categories" and a "Source code" button; an install note that Zotdex doesn't test plugins' safety or features; a failure line with the day of the build that wrote the page; Details labels such as "Plugin ID", "Description in the plugin file", "Release on this page", "Checks for updates at" (the claim audit's fix), and "Languages" with "Language not listed"; dates from `longDay`, which falls back to the first 10 characters of a text that is not a date; and a "Corrections by Zotdex" table with "Plugin file:" lines. `keptTitle` gives the Older data badge's tooltip on home rows and plugin pages. `day()` is gone. About's three label quotes, `docs/site.md`, `docs/requests.md`, the text-change issue form, DESIGN, and the CHANGELOG follow. The user's rule for approved wording went into CLAUDE.md during the plan.

**Decisions:** D-078 (plugin pages and About use the home page's words; About gives the short form). Milestone-local: none. The user approved the copy over four rounds, chose "Checks for updates at" and kept "couldn't reach" after the claim audit.

**Review:** Four-lens fan-out, 33 findings: 11 fixed (DESIGN's Known issues names, the issue form and two docs' "Overrides table", the docs' description labels, a test title, the `longDay` fallback, and four test tightenings), 7 left to M111 (About's old wording), 15 rejected (approved wording, false, or style). Hygiene narrowed "Use plain words on plugin pages and About" to About, removed the parked row "Name the build on the failure page", marked 10 lessons used, corrected the M109 lesson on `&#39;` in attributes, captured none (25 at the limit), and pruned the M107 row.
