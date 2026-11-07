# M111: Shorten About in the home page's words

**Status:** done (2026-11-07, PR #860 https://github.com/jmgirard/zotdex/pull/860)

**Goal:** The About and 404 pages read in the home page's tone, as the short version the user approved in the "About page (M111)" section of `cairn/references/plain-words-copy.md`, with the full rules in docs/site.md (D-078).

**Outcome:** `site/src/pages/about.astro` is "How Zotdex works": 14 short sections with their old ids, renamed "Supported Zotero versions", "Startup check", "Corrections", and "What Zotdex doesn't do"; the intro links `SITE_DOCS_HREF` (docs/site.md on GitHub); the ✓ ◐ – ● ✕ marks sit in the prose with `role="img"` names, and `[data-about] .start` keeps the startup marks inline; a major with no known release lists "no known release". 404 says Zotdex. The 14 rules About dropped that no doc held went to docs/site.md (range fields, `10.0.*`, several categories, "In use" and version-over-every-version, lock and paid-service rules), docs/maintaining.md (who controls updates), docs/requests.md (does not endorse), and docs/license.md (logo terms); docs/site.md's About paragraph names the short points and where data.md and requests.md hold the rest. The About tests compare each section to the copy text whole, plus links, mark names, 3 s, 90 s, 7 days against the code, and the old names' absence on both pages. DESIGN's About note and icon-credit entry (corrected M111) follow; one CHANGELOG entry.

**Decisions:** none beyond D-078. The user approved "each new release of the plugin" in the reports line after the claim audit.

**Review:** four-lens fan-out; 20 findings: 5 fixed (mark names for screen readers, a duplicate older-data test removed, `KEEP_MS` tied to "7 days", docs/site.md pointers to data.md and requests.md), 1 follow-up (low row "Match About's link text and heading"), 14 rejected (false, style, or planned). Claim audit: 90 claims, 1 corrected. Hygiene graduated "Use plain words on plugin pages and About"; 7 lessons marked used, none captured.
