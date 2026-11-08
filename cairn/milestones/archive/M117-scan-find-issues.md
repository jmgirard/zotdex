# M117: Open an issue for each malware scan find

**Status:** done (2026-11-07, PR #871 https://github.com/jmgirard/zotdex/pull/871)

**Goal:** When the weekly ClamAV scan flags a plugin file, the daily build opens one GitHub issue for that file and
signature, assigned to the repository's owner, so the maintainer gets GitHub's notice instead of reading run logs.

**Outcome:** `pnpm scan-issues` (`src/malware-scan/scan-issues.ts`, `scan-issues-cli.ts`): `findsOf` takes the
records flagged after `addScanResults`; `reportFinds` lists `malware-scan` issues in all states, skips a find whose
marker line (`<!-- malware-scan <sha256 id> <xpiSha256> <sha256 signature> -->`) a body holds as a whole line, creates
the label on a 404, and opens at most `SCAN_ISSUES_MAX` (5) a run with every value in a `codeSpan`; a 422 skips a find,
another failure or a created issue without the label stops the run, and each gives one warning, exit 0.
`githubClient` writes now throw `ReadFailure` with the HTTP status. A `scan-issues` job in `build.yml` holds only
`issues: write`, checks the data digest and the scan SHA-256, runs whatever the scan job's result, sits in one
concurrency group for every branch, and is in no job's `needs`. Docs, DESIGN, CHANGELOG.

**Decisions:** D-084 (one issue per file and signature, even after close; assigned to the owner; cap 5; every-run
reporting; separate job; the user's false-positive note as falsifier; annotates D-062 and D-082).

**Review:** Claim audit corrected 3 claims; AC4 amended (GitHub sets `GITHUB_REPOSITORY`), re-audited twice. Two
four-lens passes: 37 findings fixed (dropped-label stop, case-free label match, concurrency group, CLI and page-2
tests, ripple lines), 12 rejected, 1 noted; return 1 added 42 body-value tests for AC2. Known issues: a dropped label
gives a daily repeat issue (new), and M115's withheld-results entry gained an issues clause. Lessons: 4 marked used
M117, none captured. No branch run; the first real run is on main.
