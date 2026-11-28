# M118: Define the removal rules before launch

**Status:** done (2026-11-09, PR #882 https://github.com/jmgirard/zotdex/pull/882)

**Goal:** Before Zotdex is advertised, its rules say when a plugin is removed and how it comes back, define spam and
harm, add a ground for plugins with a court-blocked site built in, and say how legal notices and private reports reach
the maintainer.

**Outcome:** `docs/requests.md` "Removing a plugin": five grounds (owner, spam, misleading, harm, a listed site built
in: courts in at least two countries ordered the site blocked or shut down for copyright infringement); definitions of
spam, harm (by design and disclosure; a bug is not harm), and "built in"; the fifth ground applied without a report
only to plugins that name a listed site, reading README and settings only; "Coming back" by ground; a 14-day notice for
stated-purpose data sending; "Legal notices and private reports" with three promises. `docs/maintaining.md` "Removing a
plugin": removal steps with `gh` commands, the removal-issue outline (`Removing`/`Removed` titles), the notice, lifting
(owner check, earlier-removal search, `pnpm add-plugin` past a closed bot PR), held pull requests. About card and remove
form reworded (approved lines in `plain-words-copy.md`); the form adds "It has a listed site built in"; About links
GitHub's private report form (`PRIVATE_REPORT_HREF`) and the full rules (`REMOVAL_RULES_HREF`). `delisted.json` records
require `ground` (schema, `DelistedRecord`, tests). Scan-issues body and `docs/data.md` point to the new rules.

**Decisions:** D-085 (fifth ground, definitions, read without a report, the way back; annotates D-006, D-051, D-062);
D-086 (scan find needs a second source, built-in details, stated-purpose notice, a removal closes a held PR; annotates
D-053, D-082, D-084, D-085). Fable second opinion RB01/RR01 (`cairn/reviews/archive/`). Lessons: 2 marked used M118.

**Review:** AC1, AC2 amended at user stops; claim audit 32 claims, 1 corrected; returns 2 defect, 2 amendment; three
four-lens passes, 60 findings: 47 fixed, 1 by the user's setting (private reporting on), 12 rejected, 1 amendment.
