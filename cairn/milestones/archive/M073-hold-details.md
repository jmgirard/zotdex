# M073: Show hold details in bot pull requests

**Status:** done (2026-11-02, PR #798 https://github.com/jmgirard/zotero-plugin-index/pull/798)

**Goal:** A held bot pull request's body names the facts behind its hold reasons, when the bot opens it and, through one refresh command, when it is already open.

**Outcome:** `matchedEntries` (`src/discover/holds.ts`) now decides both the `name-match` reason and `holdDetails`,
which gives at most 5 matched entries (repo, name cut to 100 characters) and `moreMatches`, the update host, and
the owner's account day, within the limits of `entrySchema`; an entry whose repo the schema refuses counts in
`moreMatches`. The handoff carries it as optional `holdDetails`; `body()` writes `holdDetailLines` under
`DETAILS_HEADING`, through `code()`. `pnpm refresh-holds [--apply]` (`src/discover/refresh-holds.ts`, `-cli.ts`),
run by hand, works the details out again for open held bot pull requests from each `meta.json`, the checkout's
`plugins/`, and `ownerCreatedAt`. It reads each pull request again before its PATCH, sends the body alone, and sends
no label request. `botPullProblem`, `newEntry`, and `contents` are shared with `merge.ts`. README, DESIGN, CHANGELOG.
After the merge, `--apply` edited all 58 open held pull requests; a read-back of each showed only the detail lines
added, and each Hold line and label the same. #796, #797, and #103 have no label and were skipped.

**Decisions:** none. A kept command rather than a throwaway script, since the run comes after the merge.

**Review:** Criteria audit (reduced) 5 findings, all fixed. Claim audit not owed (internal). Four-lens fan-out, 28
findings: 16 fixed (re-read before the PATCH, repo length filter, error-branch and command tests, `--apply` token
check, README conditions and note loss, update-first line, trimmed names, lost spaces in `handoff.ts`, weaker checks
removed), 4 to new parked row "Close small gaps in pnpm refresh-holds", 8 rejected. Re-read planted off: 3 tests
failed. CI passed. Candidate "Show hold details in bot pull requests" graduated. Lessons: 4 used M073, none captured.
