<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M116: Make the weekly malware scan finish

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the daily build's scan results reach every plugin page's "Malware scan" row
- **Branch/PR:** —

## Goal

The weekly ClamAV scan gives results again: it scans the downloaded files in
parallel `clamscan` batches, keeps the result of each file that a batch
printed, and logs each batch's time.

## Scope

**In:** batches in `scan()` (`src/malware-scan/scan.ts`), one `clamscan` per
batch at the same time; results from each file's line, whether or not its
batch was stopped; one log line per batch from `pnpm malware-scan`; docs,
DESIGN (Function Families, Known issues), D-083, CHANGELOG; a measured run
of the scan job on the branch.

**Out:** clamd or `clamdscan` (a daemon that loads the signatures once): a
second package and service; the measured run decides whether it is needed,
and a candidate row holds it only if the run does not finish. The other two
M115 Known issues (a failed carry read, start-test plugin code withholding a
run's results) stay as they are.

## Acceptance criteria

- [ ] AC1: `scan()` deals the downloaded files round-robin, in selection
      order, into `min(SCAN_BATCHES_MAX, availableParallelism(), files)`
      batches, with `SCAN_BATCHES_MAX` 4, and starts one `clamscan` per batch
      before any of them ends, each with `CLAMSCAN_OPTIONS` and stopped
      `CLAMSCAN_LIMIT_MS` after it starts. Tests with a stand-in runner show
      the batch count for 1, 3, and 9 files, that each file is in exactly one
      batch, and that every batch's run starts before the first one ends.
- [ ] AC2: A file named on exactly one OK or FOUND line of its own batch's
      output gets a result whether or not that batch was stopped, under
      M115's other rules (no text before OK, no scan-limit or encrypted-entry
      find, the schema's shape). A file of a stopped batch with no line gets
      no result with reason `clamscan-stopped`, and a file of a batch that
      ended with no line gets `no-line`. Tests cover a stopped batch with
      some lines, a stopped batch with none, a line cut before its last word,
      and a finished batch beside a stopped one.
- [ ] AC3: `pnpm malware-scan --scan` prints one line per batch with its
      number, its file count, its result count, its run time in seconds, and
      whether it was stopped. A test of the line's text covers a stopped and
      a finished batch.
- [ ] AC4: `docs/data.md` and `docs/maintaining.md` state the batches, that
      a stopped batch keeps the results of the lines it printed, and the
      batch line; `cairn/DESIGN.md`'s Function Families entry for
      `src/malware-scan/` names the batches, and its Known issues entry on a
      stopped `clamscan` now states only what remains true; D-083 records the
      change to M115's rule; `CHANGELOG.md`'s Unreleased section names it.
- [ ] AC5: The verify slot (`pnpm test` and `pnpm check`) passes.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T5
- AC5 → T1, T2, T3, T5

## Tasks

- [ ] T1: Add `SCAN_BATCHES_MAX` and the round-robin batches to `scan()`, one
      `clamscan` per batch run at the same time (`Promise.all`), with the
      batch-count and start-order tests.
- [ ] T2: Read each batch's lines on its own, keep the lines of a stopped
      batch, and give `clamscan-stopped` only to its files with no line; add
      the four AC2 tests, including a line cut before its last word.
- [ ] T3: Return each batch's number, files, results, seconds, and stopped
      flag in `ScanOutcome`, and print one line per batch from the CLI; add
      the line test.
- [ ] T4: With the user's permission, dispatch `Build data` on the
      milestone branch with `malware-scan` true (a branch run deploys
      nothing), read the scan job's batch lines with `gh api
      --allow-escape-sequences .../jobs/<id>/logs`, and record each batch's
      time and results in the work log. If the scan still does not finish,
      file the clamd candidate row.
- [ ] T5: Update `docs/data.md`, `docs/maintaining.md`, DESIGN's Function
      Families entry and the stopped-`clamscan` Known issues entry, append
      D-083 (annotating D-082), and add a CHANGELOG entry.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — it changes M115's documented rule that a stopped `clamscan` gives no result, and it holds design choices.
- 2026-11-07: question set: a stopped batch keeps the results of the lines it printed — the user chose this over finished batches only.
- 2026-11-07: question set: may implement dispatch `Build data` on the milestone branch with `malware-scan` true to measure the batches — yes; a run on main after the merge is offered, not run.
- 2026-11-07: checkpoint: plan drafted; the criteria audit is still running, so the plan commit comes after its findings.

## Decisions

## Review
