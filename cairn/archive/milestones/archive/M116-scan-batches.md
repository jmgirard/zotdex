# M116: Make the weekly malware scan finish

**Status:** done (2026-11-07, PR #870 https://github.com/jmgirard/zotdex/pull/870)

**Goal:** The weekly ClamAV scan gives results again: it scans the downloaded files in parallel `clamscan` batches,
keeps the result of each file that a batch printed, and logs each batch's time.

**Outcome:** `scan()` (`src/malware-scan/scan.ts`) deals the files round-robin into `min(SCAN_BATCHES_MAX (4), cores,
files)` batches (`batchesOf`; `cores` defaults to `availableParallelism()`, a non-number counts as 1) and runs one
`clamscan` per batch through `Promise.all`; a run that throws counts as a stopped batch with no output. `resultOf`
reads each file from its own batch: a stopped batch keeps its printed lines, its last line only when it ends with a
line break, and its files with no line get `clamscan-stopped`; a failed `--version` runs no batch. `pnpm malware-scan`
prints `batchLine` for each batch. Docs, DESIGN Function Families and Known issues (measured times), CHANGELOG.

**Decisions:** D-083 (parallel batches; a stopped batch keeps its printed lines, chosen by the user over finished
batches only; clamd and pooled small batches rejected; annotates D-082).

**Review:** The first real scan (run 42414892219) stopped its one `clamscan` at 10 minutes with no results. A branch
run (42417346897) gave four batches of 185–186 files in 191–235 s: 741 results, 2 partial scans, no finds. Criteria
audit took 10 of 11 findings; claim audit corrected 6 of 41 claims. Four-lens fan-out, one pass, 28 findings: 13 fixed
(a throwing batch contained, a stopped batch's cut last line ignored, tests pinned to one core), 15 rejected. No rows
or Known issues filed. Lessons: 8 marked used M116, 1 captured, M097's evicted by rank.
