<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M116: Make the weekly malware scan finish

- **Status:** in-progress
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the daily build's scan results reach every plugin page's "Malware scan" row
- **Branch/PR:** m116-scan-batches

## Goal

The weekly ClamAV scan gives results again: it scans the downloaded files in
parallel `clamscan` batches, keeps the result of each file that a batch
printed, and logs each batch's time.

## Scope

**In:** batches in `scan()` (`src/malware-scan/scan.ts`), one `clamscan` per
batch at the same time; results from each file's line, whether or not its
batch was stopped; one log line per batch from `pnpm malware-scan`; code
comments, docs, DESIGN (Function Families, Known issues), D-083, CHANGELOG;
a measured run of the scan job on the branch.

**Out:** clamd or `clamdscan` (a daemon that loads the signatures once): a
second package and service; the measured run decides whether it is needed,
and a candidate row holds it only if the run does not finish. The other two
M115 Known issues (a failed carry read, start-test plugin code withholding a
run's results) stay as they are.

## Acceptance criteria

- [ ] AC1: `scan()` deals the downloaded files round-robin, in selection
      order, into `min(SCAN_BATCHES_MAX, cores, files)` batches, with
      `SCAN_BATCHES_MAX` 4 and `cores` a `ScanOptions` value that defaults to
      `availableParallelism()`, and starts one `clamscan` per batch before any
      of them ends, each with `CLAMSCAN_OPTIONS` and stopped
      `CLAMSCAN_LIMIT_MS` after it starts. Tests with a stand-in runner show
      the batch count for 1, 3, and 9 files with 8 cores and for 9 files with
      2 cores, that each file is in exactly one batch, and that every batch's
      run starts before the first one ends.
- [ ] AC2: A file named on exactly one line of its own batch's output, that
      line an OK or FOUND line, gets a result whether or not that batch was
      stopped, under M115's other rules (no text before OK, no scan-limit or
      encrypted-entry find, the schema's shape). A file of a stopped batch
      with no line gets no result with reason `clamscan-stopped`, and a file
      of a batch that ended with no line gets `no-line`. Tests cover a stopped
      last batch beside a finished first batch, a stopped batch whose lines
      include a FOUND, a stopped batch with no line, and output that ends
      inside a path, inside the verdict word, and after the verdict word with
      no line break.
- [ ] AC3: `pnpm malware-scan --scan` prints one line per batch with its
      number, its file count, its result count, its run time in seconds, and
      whether it was stopped. A test of the line's text, with a set run time,
      covers a stopped and a finished batch.
- [ ] AC4: `docs/data.md` (its no-result list and the stopped-`clamscan`
      case) and `docs/maintaining.md` state the batches, that a stopped batch
      keeps the results of the lines it printed, and the batch line; the
      comments on `CLAMSCAN_LIMIT_MS`, `clamscan`, and `scan()` state the
      batch rule; `cairn/DESIGN.md`'s Function Families entry for
      `src/malware-scan/` names the batches, and its Known issues entry on a
      stopped `clamscan` no longer says that a stop gives no file a result;
      D-083 records the change to M115's rule; `CHANGELOG.md`'s Unreleased
      section names it.
- [ ] AC5: The verify slot (`pnpm test` and `pnpm check`) passes.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T5
- AC5 → T1, T2, T3, T5

## Tasks

- [x] T1: Add `SCAN_BATCHES_MAX`, the `cores` option, and the round-robin
      batches to `scan()`, one `clamscan` per batch run at the same time
      (`Promise.all`), with the batch-count tests and a stand-in runner that
      holds each run open until every batch has started.
- [x] T2: Read each batch's lines on its own, keep the lines of a stopped
      batch, and give `clamscan-stopped` only to its files with no line, with
      a message that covers an outside stop too. Give the stand-in runner a
      `stopped` value and an output per call, rewrite the M115 test that
      asserts no result for a stopped run, and add the AC2 tests.
- [x] T3: Return each batch's number, files, results, seconds, and stopped
      flag in `ScanOutcome`, with an injectable clock, and print one line per
      batch from the CLI through a function the test calls.
- [x] T4: Dispatch `Build data` on the milestone branch with `malware-scan`
      true (the user allowed it; a branch run deploys nothing), read the scan
      job's batch lines with `gh api --allow-escape-sequences
      repos/jmgirard/zotdex/actions/jobs/<id>/logs`, and record each batch's
      line and the signature load time in the work log. If no batch
      finishes, file the clamd candidate row.
- [x] T5: Update the code comments, `docs/data.md`, `docs/maintaining.md`,
      DESIGN's Function Families entry and the stopped-`clamscan` Known
      issues entry (with T4's times, or that no full scan was timed), append
      D-083 (annotating D-082, and noting that a stopped batch cannot tell a
      lone line from the first of two), and add a CHANGELOG entry.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — it changes M115's documented rule that a stopped `clamscan` gives no result, and it holds design choices.
- 2026-11-07: question set: a stopped batch keeps the results of the lines it printed — the user chose this over finished batches only.
- 2026-11-07: question set: may implement dispatch `Build data` on the milestone branch with `malware-scan` true to measure the batches — yes; a run on main after the merge is offered, not run.
- 2026-11-07: checkpoint: plan drafted; the criteria audit is still running, so the plan commit comes after its findings.
- 2026-11-07: idea vet: gap — whether a stopped batch keeps its printed lines; the user chose to keep them. No flaw: one `clamscan` per core is the field's usual way to use several cores, since `clamscan` scans on one thread.
- 2026-11-07: collision check: M115 (done) shipped the scan and its Known issue "A `clamscan` run stopped at its 10-minute limit gives no file a result"; this plans an extension. D-082 does not state the stopped-run rule (code, DESIGN, docs/data.md do), so D-083 annotates it. Inbox: 0 open issues, 15 bot pull requests, none overlapping.
- 2026-11-07: lessons used: 2026-10-25 (M001), 2026-10-31 (M066), 2026-11-02 (M082), 2026-11-03 (M087), 2026-11-07 (M115).
- 2026-11-07: plan chose parallel `clamscan` batches over clamd with `clamdscan --multiscan`, because clamd adds a second package, a service, and its config; falsified by a measured batch run in which signature loading takes most of the 10 minutes.
- 2026-11-07: plan chose one batch per core, at most 4, over many small batches in a pool, because each `clamscan` loads the full signature set; falsified by a measured run in which one batch is stopped while others end early.
- 2026-11-07: criteria audit (full mode, fresh Opus reader) returned 11 findings; 10 taken: (1) a `cores` option and a 2-core test; (2) "exactly one line, that line an OK or FOUND line"; (3) tests vary which batch is stopped, a FOUND kept from a stopped batch, and where the cut falls, with a per-call stand-in (T2); (4) a cut line can match only with its verdict word whole, and the weaker two-lines guard in a stopped batch goes to D-083; (5) the stopped message covers an outside stop (T2); (6) a set run time in the line test; (7) AC4 names the code comments and docs/data.md's case, and the Known issues entry drops "gives no file a result"; (10) D-083 annotates D-082; (11) four signature loads fit a 16 GB runner, and T4 records the load time. Declined (9): an AC binding T4's work-log record, since a criterion on a record binds an instrument, not the scan; T4 stays a task.
- 2026-11-07: implement started on branch `m116-scan-batches` (cut from `598a1d7d`); `.claude/` is an unrelated untracked folder, left unstaged. The plan's rewrite after the criteria audit had dropped the empty `## Decisions` and `## Review` sections; they are restored here.
- 2026-11-07: T1–T3 done in one commit (`13b4a901`), since the batch run, the per-batch line reading, and the batch report share one loop: `SCAN_BATCHES_MAX` (4), `batchesOf`, the `cores` and `now` options, `Promise.all` over the batches, `resultOf` per file from its own batch's lines (a stopped batch keeps them; `clamscan-stopped` only for its files with no line, with a message naming an outside stop), `Batch` and `batchLine`, and the CLI's batch lines. Choices: a failed `--version` runs no batch; batch numbers count from 1; the clock option times each batch. Tests: the M115 stopped-run test is removed, 10 batch tests added (counts for 1/3/9 files at 8 cores and 9 at 2, start order, options and limit per batch, a stopped last batch with a FOUND beside a finished first, a stopped batch with no line, three cut points, the batch lines). Planted defects (batches one after another, the old stop rule) each turned 4 tests red. `pnpm test` 2713 passed, `pnpm check` 0 problems. That commit went in without these ticks and this line, by a failed script; this commit adds them.
- 2026-11-07: T4 done: `Build data` run 42417346897 on `m116-scan-batches` at `b2aa965c`, `malware-scan` true; every job passed and the deploy was skipped, as for any branch. freshclam updated `daily.cvd` 28176 and `main.cvd` 63 with no refusal. Batch lines: "batch 1: 186 files, 186 results, 191.1 s", "batch 2: 186 files, 185 results, 219.8 s", "batch 3: 186 files, 185 results, 234.9 s", "batch 4: 185 files, 185 results, 233.0 s". 741 results, 2 with none (`partial-scan`: ztransplit@zotero.org `Heuristics.Limits.Exceeded.MaxFiles`, chatpdf@zotero-plugin `Heuristics.Limits.Exceeded.MaxFileSize`); no find. The scan step took 5 min 54 s from its start to the batch lines, so the downloads took about 2 minutes; the batch times include the signature load, which no line times on its own. No batch was stopped, so no clamd row is filed. The site job added 741 results.
- 2026-11-07: T5 done: the code comments (in `13b4a901`), docs/data.md and docs/maintaining.md, DESIGN's Function Families entry, D-083, and the CHANGELOG entry (in `1328cc32`), and DESIGN's Known issues entry rewritten with T4's times and marked corrected M116. Choice: the CHANGELOG adds to M115's unreleased entry rather than a second entry, since both are unreleased. `pnpm test` 2713 passed.

## Decisions

## Review
