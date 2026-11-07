# M107: Shorten the README and move its detail to docs/

**Status:** done (2026-11-07, PR #856 https://github.com/jmgirard/zotdex/pull/856)

**Goal:** `README.md` becomes a short overview for a first-time visitor, and
its other text moves, unchanged except for links and references, into five
files under `docs/`.

**Outcome:** README went from 2,069 to 56 lines (opening, site, data and
schema addresses, five `issues/new?template=` forms, docs list, 6-line
license). Its 20 sections moved word for word into `docs/site.md`, `data.md`,
`requests.md`, `maintaining.md`, and `license.md`; 23 paragraphs changed, each
a link target or a reference now naming its file. The About License card links
`docs/license.md` ("license page"). CHANGELOG (all Unreleased), DESIGN.md,
`build.yml` comments, a test comment, and three schema descriptions (full
GitHub URLs) name the docs files.

**Decisions:** none (question set: move unchanged, four files by reader,
License also moved).

**Review:** four-lens fan-out, 19 findings: 4 fixed (schema URLs, README's
third-party exception, row tense), 15 rejected as style or not a defect.
Claim audit: 74 claims, 3 corrected. New rows: "Condense the docs moved from
README" (low), "Say that an override value needs text" (parked). Lessons
M018 and M036 corrected to name `docs/`.
