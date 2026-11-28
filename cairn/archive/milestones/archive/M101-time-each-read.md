# M101: Time each plugin read in the build log

**Status:** done (2026-11-05, PR #845 https://github.com/jmgirard/zotero-plugin-index/pull/845)

**Goal:** Each build log shows how long the plugin reads took, by result and for the slowest reads, so a cut build shows where its time went.

**Outcome:** `readEntries` in `src/build/build.ts` times each `readRecord` with `performance.now()`, and `BuildResult` gains `timings` (`ReadTiming`: id, ms, the result `readRecord` gave or `read`, in id order) and `readsMs` (first start to last end), both outside the data. `timingLines` in `src/build/timing.ts` gives `plugin reads took <s> s`, one `<result>: <n> reads, <s> s in all` line per result in code-unit order, and up to `SLOW_READS` (10) `slow read: <id>: <s> s (<result>)` lines, slowest first and ties by the shown tenth in id order, with line breaks as spaces; `src/build/cli.ts` prints them just before the failed-record lines. The two timer-pending tests compare stdout without the timing lines. Branch run 42125640367: 736 reads in 220.6 s, 734 reads summing 877.8 s, slowest 10.9 s.

**Decisions:** none. The plan's idea vet found that retrying 5xx answers would not stop a cut build, and the user chose to time reads first.

**Review:** Criteria audit (reduced) 8 findings, all applied. Four-lens review, 21 findings: 12 fixed, among them README text that the sums overlap and include API pacing waits, ties on the shown tenth, and a tighter timing test on an odd day; 8 rejected, 1 as edge (a failed `dist/` write exits before the timing lines); 1 new parked row, "Print entry ids on one line in the build log". Lesson 2026-11-02 (M081) evicted by rank for the new M101 lesson. No row unparked.
