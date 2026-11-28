# M112: Remove the README badge

**Status:** done (2026-11-07, PR #861 https://github.com/jmgirard/zotdex/pull/861)

**Goal:** Remove the README badge that M105 added, since no README outside Zotdex uses it.

**Outcome:** Removed `site/src/pages/badges/[id].json.ts` (the `badges/<id>.json` shields.io endpoint files), `src/site/badge.ts` (`badgeFor`), `test/badge.test.ts`, `badgeSnippet` and the unused `ORIGIN` import in `site/src/data.ts`, the plugin page's "Badge for your README" card (`data-section="badge"`), the `.badge-snippet` CSS, and About's "README badge" section (`#badge`). Plugin pages now end with the Details card; docs/site.md says it comes last. The badge text left `docs/site.md`, `docs/maintaining.md`, DESIGN, and `cairn/references/plain-words-copy.md` (approved lines removed at the user's yes), and the unreleased CHANGELOG entry was deleted. The Archived and Older data `.badge` labels and `majorStart` stay. `test/site.test.ts` checks that the build writes no `badges` entry and that no HTML page holds `img.shields.io`. After the merge, the `build.yml` run 42382074541 was started by hand.

**Decisions:** D-079 supersedes D-071: the badge is removed and its stable-address promise withdrawn; an embedding README shows a shields.io error image. GitHub code search found no such README.

**Review:** Criteria audit (full) 6 findings, all applied. Claim audit 6 claims, 0 corrected. Four-lens review, 14 findings: 4 fixed (rewrapped docs and DESIGN prose, "Details comes last", a section check repeated in the new test), 10 rejected (false, style, or planned). No candidate row graduated or filed. Lessons M001, M018, M036, M066, and M082 marked used; none captured.
