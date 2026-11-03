# M087: Read plugins a few at a time

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — an unread plugin loses its facts and word-rule categories on the live site
- **Branch/PR:** m087-read-plugins-at-once

## Goal

A normal daily build reads every plugin before its time limit, with room for the index to grow.

## Scope

**In:** `buildData` in `src/build/build.ts` reads up to 4 plugins at once, and starts the GitHub API requests of the plugin reads at least 80 ms apart. Tests, README, DESIGN, CHANGELOG, and D-058. Two `build.yml` runs on the branch. After the merge, one `build.yml` run on main, which deploys.

**Out:**
- Keeping an unread plugin's last good record → candidate row "Keep a plugin's last good record".
- Waiting and retrying when GitHub refuses a plugin read's request → candidate row "Retry build reads GitHub refuses".
- Raising `BUILD_LIMIT_MS` or the job's 30 minutes: both stay, and the limit stays as a safety stop.
- The discovery bot's reads (`pnpm discover`) → candidate row "Bound the whole discover workflow's time".

## Acceptance criteria

- [x] AC1: `pnpm build` holds at most 4 plugin reads open at once and reaches 4 when more than 4 plugins wait: a test over 6 plugins, which holds the answers and counts open reads at every start and end, sees a peak of exactly 4, sees no fifth repo read after two further gaps of 80 ms, and ends with all 6 records written.
- [x] AC2: A stalled plugin read holds up only its own place: one test with the stall on an API request and one with it on an XPI request each see the plugins after it written with facts, and the stalled plugin fail as `request-failed` at the read limit that the test sets.
- [x] AC3: Each fetch call that a plugin read makes to an `api.github.com` URL starts at least 80 ms after the one before it, whichever read sends it, and a request to another host does not wait: a test over several plugins compares the API start times, includes an `update_url` on the API host, and sees an XPI request start while an API request waits. A redirect that fetch follows inside one call counts as that one call.
- [x] AC4: Reads start in the day's order from D-028, and the records, the build-level list, and the start plan keep id order when reads end out of order, on an even and on an odd UTC day: tests with at least 2 build-level entries and 2 plan items whose reads end in another order than they start.
- [x] AC5: After `BUILD_LIMIT_MS` the build starts no read, the reads open at that time run on to their end, and each entry not started gets `not-read`; those entries are the last in the day's read order: a test over more than 4 plugins, on an even and on an odd UTC day, with a read open at the limit that ends with facts.
- [x] AC6: Two `build.yml` runs on the milestone branch, over all the plugins in `plugins/` (at least 736), each leave no record `not-read`, show no HTTP 403 or 429 from `api.github.com` in the log of their `pnpm build` step, the top-level name warning included, and finish that step in under 10 minutes.
- [x] AC7: README's "Building the data" text and `cairn/DESIGN.md`'s build text say that the build reads up to 4 plugins at once and paces its API requests, and `CHANGELOG.md` has an entry under Unreleased; a search of joined copies of README and DESIGN, and of `src/build/build.ts`, for "one at a time", "one by one", and "in turn" finds no remaining claim about the plugin reads.
- [ ] AC8: The `verify` slot is clean: `pnpm test` and `pnpm check`.

## Coverage

- AC1 → T1, T2
- AC2 → T2
- AC3 → T1, T2
- AC4 → T1, T2
- AC5 → T1, T2
- AC6 → T4
- AC7 → T3
- AC8 → T2, T3

## Tasks

- [x] T1: In `src/build/build.ts`, replace the `for (const i of order)` loop (line 219) with a pool of `READS_AT_ONCE` (4) workers that take the next index in `order`; each worker checks `buildMs` before it starts a read. Wrap the fetch given to `readRecord` so that a request to `api.github.com` waits for its turn, `API_GAP_MS` (80) after the last turn. Add `readsAtOnce` and `apiGapMs` to the limits object.
- [x] T2: In `test/build.test.ts`, set `readsAtOnce: 1` and `apiGapMs: 0` where a test rests on serial reads or fake timers. Add the tests that AC1 to AC5 name. See each new test fail once against a serial loop and against a fetch with no pacing.
- [x] T3: Update README, DESIGN, the comment above `buildData`, and CHANGELOG; run the AC7 search. Run `pnpm test` and `pnpm check`.
- [x] T4: Add a temporary step to `build.yml` that prints `/rate_limit` before and after `pnpm build`. Run `build.yml` on the branch twice, record the time, the request count, and the limit, search each log, then remove the step.

## Work log

- 2026-11-03: created by /milestone-plan.
- 2026-11-03: tier check: milestone — a change to running code with a design decision, more than a bug fix.
- 2026-11-03: idea vet: flaw: GitHub's best-practices page advises serial requests; the question set chose 4 at once, paced below the published 900 a minute, and tested on the branch. Gap: "a few at a time" names no number; reading taken: 4, since 4 times the fastest serial build's request rate stays under 900 a minute.
- 2026-11-03: lessons used: 2026-10-25 (M001), 2026-10-27 (M027), 2026-10-27 (M030), 2026-11-02 (M075), 2026-11-02 (M082), 2026-10-26 (M018), 2026-10-31 (M066).
- 2026-11-03: measured: 12 runs' `pnpm build` steps took 5:35 to 19:38; run 41653526255 started 698 reads in 18 minutes, 1.55 s a plugin, and left 38 `not-read` and 1 `request-failed` (a gitee.com `update.json`). Run 41555026773 read the same 736 in 14:58 with no failure.
- 2026-11-03: measured locally: 60 plugins took 94 s at 1 at a time and 16 s at 8, 2.6 API requests a plugin, 61 of the 94 s in API requests, so about 1,900 API requests a build. Runs 41552772886 and 41555026773 ran inside one hour with no 403 or 429, past the documented 1,000 an hour for `GITHUB_TOKEN`; T4 reads the real limit.
- 2026-11-03: plan gate chose 4 at once with 80 ms between API requests over a longer limit, which the index outgrows, and over serial API requests with parallel downloads, which leaves room near 1,080 plugins at the slowest rate against about 2,400 at 4; falsified by an HTTP 403 or 429 from the API in a build log.
- 2026-11-03: plan chose a fixed pacing gap over no pacing, since a pool alone leaves the request rate to network speed and a burst past 900 a minute could fail many reads at once; falsified by a log that shows the gap sets a build's length.
- 2026-11-03: question set: run `build.yml` on the branch twice and on main once after the merge, which deploys — granted.
- 2026-11-03: question set: keep an unread plugin's last good record here or apart — apart, as a candidate row.
- 2026-11-03: collision check: D-015 and D-028 stand and D-058 annotates them; candidate row absorbed; no open issue or outside pull request overlaps. Remainders: 2 new candidate rows, named in Out.
- 2026-11-03: criteria audit (full mode) by a fresh Opus reader: 8 findings on AC1 to AC7, each fixed in the wording: AC1 open count and gap wait; AC2 stall on two kinds of request, and a test-set read limit since a request's own limit is 60 s; AC3 per fetch call, an API `update_url`, and an XPI starting during a wait; AC4 and AC5 minimum sizes; AC6 rate numbers moved to T4, and the name warning added; AC7 "in turn" added.

- 2026-11-03: checkpoint: T1 to T3 written; 8 planted defects each failed the new tests; the full test run is not yet read, so no box is ticked. Work is in a worktree, since this session must not switch branches in the shared checkout.
- 2026-11-03: run 41685419485 on main, serial, took 14:45 in its `pnpm build` step at 736 plugins, so the cut does not repeat on every build.

- 2026-11-03: T1 to T3 done: `pnpm test` 2222 passed, 6 skipped; `pnpm check` 0 problems. The "over 64 KiB" stdout test moved from 1500 entries to 80 with long repo names, since 1500 paced API requests pass the spawn's time limit. Names chosen: `readsAtOnce`, `apiGapMs`, in the existing limits object.

- 2026-11-03: branch run 41689697258: `pnpm build` step 5:08 at 736 plugins, 0 failures; `/rate_limit` shows `core` limit 5000, 1527 used before the step (run 41685419485 in the same hour) and 3054 after, so one build uses 1527 requests, 2.07 a plugin, about 300 a minute; GraphQL 9 requests. So 3 builds fit one hour, and 3 hand builds plus other workflows can pass the limit.

- 2026-11-03: branch run 41690770665: `pnpm build` step 5:32 at 736 plugins, 0 failures, 1527 `core` requests again (3054 to 4581 used, limit 5000); no HTTP 403 or 429 and no `not-read` in the job log. Temporary steps removed; `build.yml` matches main. Row "Retry build reads GitHub refuses" now holds the budget numbers.

- 2026-11-03: claim audit: 44 claims read, 1 corrected — README.md, src/build/build.ts (a redirect that fetch follows is not paced; the CHANGELOG summary stands). The `not-read` message "reads no plugin" predates this work and stays.

## Decisions

## Review

Fresh runs on 2026-11-03 at the branch head, with `vitest run test/build.test.ts -t "reading plugins at once"`: 9 passed. Before review, 8 planted defects each failed these tests: serial reads, 5 at once, no pacing, pacing every host, waiting for the prior answer, no limit check, and no order reverse (`scratchpad`, not kept).

- AC1: "holds 4 reads open at most, and starts a fifth only when one ends" passes; a planted 5 at once and a planted 1 at once both fail it.
- AC2: "reads on past a read stalled on an API request" and "on an XPI request" pass, each with a read limit of 1500 ms; a planted wait for the prior answer fails the API one.
- AC3: "starts the plugin reads' API requests 80 ms apart, an API update file included" and "lets a request to another host start while an API request waits" pass; planted no pacing and planted pacing of every host each fail one.
- AC4: "starts reads in the day's order and keeps id order when they end in another" passes on an even and an odd day, with 2 build-level entries and 4 plan items; a planted loss of the reverse fails the odd day.
- AC5: "lets open reads end at the build limit and starts no other" passes on an even and an odd day over 6 plugins, with 4 reads open at the limit that end with facts; a planted loss of the limit check fails both.
- AC6: runs 41689697258 and 41690770665 on the branch at 6750b3a (code equal to the head, comments apart), 736 plugins: steps 5:08 and 5:32, "build-level failures: 0 of 736 records", and a search of each job log found 0 `not-read` and 0 `api.github.com` lines with HTTP 403 or 429; no top-level name warning in either.
- AC7: README, DESIGN, and CHANGELOG hold the text; the search of joined README and DESIGN finds only the `discover` group's runs and two issue sweeps, none about plugin reads, and `src/build/build.ts` has no hit.
