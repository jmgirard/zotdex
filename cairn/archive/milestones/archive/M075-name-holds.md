# M075: Hold name matches only on evidence of copying

**Status:** done (2026-11-02, PR #800 https://github.com/jmgirard/zotero-plugin-index/pull/800)

**Goal:** A name match holds a bot pull request only for shared code or a far larger, older namesake.

**Outcome:** `holdReasons` gives `name-match` for a matched entry that shares a first commit, reaches 30% identical
files on either side (`identicalPercent`, git blob SHAs, less `BOILERPLATE` and the empty blob), is older with at least
20 stars and 10 times the new repo's stars, or is unread. `matchEvidence` reads the new repo's commits and tree and each
named github.com entry's meta, commits, and tree, within 60 s, and stops after a 403 or 429. An entry on another host, or
past those that `namedEntries` names, is unread. `HoldDetails` gains the facts, the handoff schema bounds them,
`holdDetailLines` prints them or "not read", and `pnpm refresh-holds` writes them. After the merge, `--apply` wrote the
facts to 36 pull requests; 29 were released (`Hold: none`, `UNHELD_TEXT`, detail lines and `hold` label removed), each
read first and read back. #238, #289, #485, #545, #552, #555, and #592 stay held.

**Decisions:** D-045 (a name match holds only on evidence of copying, annotating D-033). Milestone-local: none.

**Review:** Criteria audit (full) two passes, all findings taken. Claim audit 71 claims, 6 corrected, then 2 on its
re-read. Four lenses, then diff-bug and ripple on the fixes: 41 items, 14 fixed (first-commit link rule, stop after a
403 or 429, empty blobs, host mix-up, docs, tests), 8 to new row "Tighten the name-match evidence reads", parked, 15
rejected (2 edge), 4 duplicates. One defect return, on AC2; its fix ran in the review session. CI passed. New rows also
"Review repeats of a listed add-on id" and "Flag copies listed before the original". Lessons: 5 used M075, 1 captured;
evicted by rank: 2026-10-29 (M053).
