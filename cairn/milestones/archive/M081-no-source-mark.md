# M081: Show when a repo holds no source code

**Status:** done (2026-11-02, PR #806 https://github.com/jmgirard/zotero-plugin-index/pull/806)

**Goal:** Show on the site when a plugin's GitHub repo has no source code at its top level, as a checkable fact, with no change to who is listed.

**Outcome:** `holdsSource` in `src/build/source.ts` decides the fact from a repo's top-level names and reads no code. `readSourceFacts` reads those names after the plugin reads, in GraphQL batches of 40 within 3 minutes, and `buildData` writes the optional `upstream.sourceInRepo`. A failed read leaves it out and sets `sourceProblem`, which `src/build/cli.ts` prints as a warning, and it is never build-level. `NoSourceMark.astro` shows a lock on the home row and in the plugin page's h1, and the source link reads "Repository" there. The Details card gives "Source code at the repository's top level", and the About page, the home legend, the README, and the changelog state what the fact means. A live run before the last fixes read 695 repos in 69 seconds and found 8 with no source.

**Decisions:** D-052 lists a repo with no source with a shown fact, over a hold, a refusal, and a license rule, and makes a failed read of it an exception to the build-level rule.

**Review:** Full fan-out, all seven criteria met. Of 35 findings, 26 were fixed on the branch, 1 went to the parked row "Keep source facts when their read fails", and 8 were rejected, 1 of them as an edge case. The fixes include one reading of the mark for screen readers, GitHub's message in the read's warning, a legend line for touch and keyboard users, and docs that did not state the lock or the read. The criteria audit and the claim audit each corrected text before review. The new row "Mark plugins that sell a paid service" holds the free or paid mark that the maintainer asked for. The M075 lesson took a `used` mark, and one lesson was captured. CI passed 4 of 4 checks.
