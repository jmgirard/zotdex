<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M117: Open an issue for each malware scan find

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the build opens issues in the public repository
- **Branch/PR:** m117-scan-find-issues

## Goal

When the weekly ClamAV scan flags a plugin file, the daily build opens one
GitHub issue for that file and signature, assigned to the repository's
owner, so the maintainer gets GitHub's notice instead of reading run logs.

## Scope

**In:** a `pnpm scan-issues` command (`src/malware-scan/scan-issues.ts`
and a CLI) and a `scan-issues` job in `.github/workflows/build.yml` that
holds `issues: write` and opens an issue, labeled `malware-scan`, for each
flagged file that no such issue names yet; docs, DESIGN, D-084, CHANGELOG.

**Out:** closing an issue when a later scan comes back clean: the
maintainer closes it, so no row. Hiding or removing a flagged plugin: D-062
still governs, so no row. A branch run of the job: not granted at the
question set; the first real check is a run on main after the merge.

## Acceptance criteria

- [x] AC1: `pnpm scan-issues --data <file> --results <file> --expect
      <sha256> [--assignee <login>]` takes as its finds the records whose
      `malwareScan`, after `addScanResults` adds the results file, has
      `found`. A missing, changed, or malformed results file, or an
      `--expect` that is not 64 hex digits, adds no result, so the `--data`
      finds stand, with one warning line. Tests cover each such results
      file, two results for one id, a result for no record, a result for
      another `xpiSha256`, and a clean result over a carried find.
- [ ] AC2: With no find it sends no request. Otherwise it lists the issues
      labeled `malware-scan` in all states and opens an issue for each find
      whose marker line `<!-- malware-scan <SHA-256 of the id> <xpiSha256>
      <SHA-256 of the signature> -->` no listed issue's body holds as a
      whole line, in data order, at most `SCAN_ISSUES_MAX` (5) a run; a find
      already reported takes no slot, and past the cap it prints one warning
      line naming each id left. Each create request sends the label, the
      assignee as `assignees` when given, the title `Malware scan flagged
      <id>`, and a body that links the plugin's page in angle brackets and
      holds the id, version, signature, scan date, `clamav` line, and file
      SHA-256, each with line breaks turned into spaces, cut to 200
      characters, and in a code span whose fence is longer than any backtick
      run in it, padded by a space, and the marker on its own line. A label
      read that answers 404 creates the label first. Tests cover no find
      (no request), a new find, its marker in an open issue, in a closed
      issue, as a whole line mid-body, inside a value's code span (not
      counted), in an issue with a null body, a marker for the same id with
      another file and with another signature, exactly 5 and 6 new finds, 6
      finds with 1 reported, the label found and created, the request's
      assignee, and each of the six values holding `\r\n`, `\r`, a blank
      line and `#`, a leading and a trailing backtick, `-->`, and `@name`.
- [x] AC3: A failed issue list or label read opens no issue; a failed label
      create stops the run; an issue create that answers 422 skips that find
      and goes on, and any other failed issue create stops the run's other
      creates; each prints one warning line and exits 0. Tests cover a failed
      list, a label read that answers 500, a failed label create, a 422
      create followed by a good one, and a 500 create.
- [x] AC4: `.github/workflows/build.yml` has a `scan-issues` job with
      `needs: [build, malware-scan]`, `if: ${{ !cancelled() &&
      needs.build.result == 'success' }}`, `permissions` of `issues: write`
      only, `cache-mode: none`, a `timeout-minutes` of at most 10, and
      checkout with `persist-credentials: false`. It checks the downloaded
      `plugins-data` against the build job's `data-sha256` output before
      `pnpm scan-issues`, downloads `scan-results` with `continue-on-error:
      true`, and runs `pnpm scan-issues` with `--expect` set to
      `needs.malware-scan.outputs.scan-sha256`, `--assignee` set to `${{
      github.repository_owner }}`, and `GITHUB_TOKEN` set to `${{
      secrets.GITHUB_TOKEN }}` in the step's environment. The job sets no
      `GITHUB_REPOSITORY` (GitHub sets it in every step, and a job cannot
      replace it). No other job names `scan-issues` in `needs`.
      `test/workflows.test.ts` asserts each of these.
- [x] AC5: `docs/maintaining.md` states the command, the job, the label,
      the assignee, the marker, the cap, and that a find past the cap or
      whose create failed gets its issue on a later run while the published
      data still holds that find; `docs/data.md` and `docs/site.md` say that
      a find opens an issue; `cairn/DESIGN.md`'s Function Families entry for
      `src/malware-scan/` names the command; D-084 records the choice,
      annotating D-062 and D-082, and that a forged find can reach an issue;
      `CHANGELOG.md`'s Unreleased section names it.
- [x] AC6: The verify slot (`pnpm test` and `pnpm check`) passes.

## Coverage

- AC1 → T1, T2
- AC2 → T1, T2, T5
- AC3 → T2
- AC4 → T3
- AC5 → T4
- AC6 → T1, T2, T3, T4

## Tasks

- [x] T1: Write `src/malware-scan/scan-issues.ts`: the finds from the
      results (sharing `addScanResults`'s checks) and the data, the marker,
      the title, the page link, and the body with safe code spans, with the
      AC1 tests and the AC2 text tests.
- [x] T2: Add the GitHub calls through `githubClient`
      (`src/upstream/reader.ts`): `pages` over the label's issues in all
      states, the label read and create, each issue create with its
      assignee, the cap, and the warning lines; add `pnpm scan-issues` and
      its CLI, with the remaining AC2 tests and the AC3 tests.
- [x] T3: Add the `scan-issues` job to `build.yml`, with
      `GITHUB_REPOSITORY_OWNER` as the assignee, and its tests in
      `test/workflows.test.ts`, the job in the cache-mode list.
- [x] T4: Update `docs/maintaining.md`, `docs/data.md`, `docs/site.md`,
      DESIGN's Function Families entry, D-084, and CHANGELOG.
- [x] T5: Test each of the six body values holding each hostile string
      (review return 1).

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — a new job that writes to GitHub, with design choices.
- 2026-11-07: question set: when to open an issue — once per file and signature, never again for that pair, even after a close.
- 2026-11-07: question set: assign each issue — yes, to the repository's owner (jmgirard).
- 2026-11-07: question set: may the build open issues on its own (at most 5 a run), and may implement start a branch run — the user answered "im assuming these will be rare. if we start getting a lot of false positives, will need to adjust the plan"; read as yes to the issues, the feature asked for, and no grant for the branch run, which is dropped. D-084's falsifier takes the false-positive condition.
- 2026-11-07: idea vet: gap — whether a find past the cap or after a failed create ever gets an issue; reading taken: every run reports each find, carried or new, that no issue names, so it gets one later. No flaw.
- 2026-11-07: collision check: M115 and M116 (done) show a find on the page and as a run warning; this extends them. D-062 (removal grounds) and D-082 (a find hides nothing; forged results possible) stand and get D-084's annotation. Inbox: 0 open issues, bot pull requests only, none overlapping.
- 2026-11-07: lessons used: 2026-10-25 (M001), 2026-11-02 (M082), 2026-11-07 (M115, Vitest flags), 2026-11-07 (M116).
- 2026-11-07: plan chose a separate `scan-issues` job over `issues: write` on the site job, because the site job writes what deploys and should hold no write to GitHub; falsified by a run where the extra job's start time delays the deploy.
- 2026-11-07: plan chose reporting every unreported find each run over only the run's new results, because a find past the cap or after a failed create would never get an issue; falsified by a run that opens issues for finds the maintainer meant to ignore without closing them.
- 2026-11-07: criteria audit (full mode, fresh Opus reader) returned 12 findings, all taken: (1) every value from the results in a code span and the signature hashed in the marker, with `-->` and `@name` tests; (2) finds follow `addScanResults`, two results for one id tested; (3) the cap counts only new issues and names the ids left, which the every-run reading then reports later; (4) marker tests for another file, another signature, mid-body, and a null body; (5) a label read answering 500 tested; (6) a failed read opens nothing; (7) `--expect` as 64 hex digits, AC1 mapped to T1 and T2; (8) `issues: write` only, the digest check before the command; (10) version and signature text tests; (11) no request with no find, and the branch run dropped; (12) D-084 annotates D-062 and D-082. The answers then added the assignee and the every-run reading.
- 2026-11-07: checkpoint (`59f235d5`): plan drafted after the first audit and the answers; the changed criteria's re-audit is still running, so the plan commit comes after it. That checkpoint lacked the empty `## Decisions` and `## Review` sections; this restores them.
- 2026-11-07: re-audit of the changed AC1–AC5 (full mode, fresh Opus reader) returned 12 findings, the 9 asking for change taken: (1) the job runs after a failed scan job (`if: !cancelled() && build success`); (2) the marker counts only as a whole line, so a value cannot carry another plugin's marker; (3) a 422 create skips that find and goes on, and values are cut to 200 characters; (4) a find past the cap gets its issue later only while the published data holds it; (5) line breaks become spaces, fences outgrow backtick runs with padding, and every one of the six values is tested with `\r\n`, `\r`, a blank line and `#`, and edge backticks; (6) the marker holds the id's SHA-256, and the link sits in angle brackets; (7) finds are the records flagged after `addScanResults`, with tests for another file and a clean result over a carried find; (8) a no-find test; (9) the request's `assignees` and `github.repository_owner`, with `GITHUB_REPOSITORY` in the environment. Findings 10–12 found nothing. The fixes narrow promises, so no third reader ran.
- 2026-11-07: implement started on branch `m117-scan-find-issues` (cut from `eb605d70`); `.claude/` is an unrelated untracked folder, left unstaged.
- 2026-11-07: T1–T2 done in one commit, since the finds, the text, and the GitHub calls share one module: `src/malware-scan/scan-issues.ts` (`findsOf`, `markerOf`, `holdsMarker`, `codeSpan`, `titleOf`, `bodyOf`, `reportFinds`, `SCAN_ISSUES_MAX`, `SCAN_ISSUE_LABEL`), `scan-issues-cli.ts` (`pnpm scan-issues`, the repo from `GITHUB_REPOSITORY`), and `test/scan-issues.test.ts`, 37 tests. A shared change: `githubClient`'s writes now throw a `ReadFailure` carrying the HTTP status, as its reads already did, so a 422 can be told apart. Choices: the page link uses `ORIGIN` and `BASE` from `site/src/base.ts`; the label's color and description are fixed; the body ends with a note that ClamAV can flag in error and points to "Removing a plugin"; the CLI exits 1 only for a usage error, a missing `GITHUB_REPOSITORY`, or unreadable data. Planted defects (a substring marker match, no 422 skip, no cap, a one-backtick fence) turned 1, 1, 1, and 3 tests red. `pnpm test` 2751 passed, `pnpm check` 0 problems.
- 2026-11-07: T3 done: the `scan-issues` job in `build.yml` (8 steps; the token, the scan job's SHA-256, and `github.repository_owner` passed through `env`), and 3 more tests in `test/workflows.test.ts` with the job in the cache-mode list. Choice: the assignee goes through an `ASSIGNEE` variable rather than an expression in the run line. Planted defects (no `if:`, the site job waiting on `scan-issues`) turned 3 tests red; the file parses with `yaml` 2.9.1.
- 2026-11-07: T4 done: `docs/maintaining.md` (the command, label, assignee, marker, cap, later runs, and the job as item 4 of six), one sentence each in `docs/data.md` and `docs/site.md`, DESIGN's Function Families entry and daily-build text, D-084, and a CHANGELOG line. `pnpm test` 2755 passed, `pnpm check` 0 problems.
- 2026-11-07: substantive amendment: AC4's environment clause, since GitHub sets `GITHUB_REPOSITORY` in every step and a workflow cannot replace it, so no test could assert it was set. Now: "`GITHUB_TOKEN` set to `${{ secrets.GITHUB_TOKEN }}` in the step's environment. The job sets no `GITHUB_REPOSITORY` (GitHub sets it in every step, and a job cannot replace it). No other job names `scan-issues` in `needs`." Added the test `sets no GITHUB_REPOSITORY in the scan-issues job`; a planted `GITHUB_REPOSITORY:` line turned it red. What users see is unchanged, so no stop.
- 2026-11-07: re-audit: AC4 (full) — the clause "which no test asserts" was a fact, not a promise, and read two ways; GitHub's docs bear out that `GITHUB_*` defaults cannot be overwritten; reworded to a clause the test checks.
- 2026-11-07: re-audit: AC4 (full) — the GitHub fact sat under "asserts each of these", and "it" in "No other job names it" could be misread; took the reader's wording verbatim (a reason in parentheses, `scan-issues` named). No third reader: the fix narrows and changes nothing users see.
- 2026-11-07: claim audit (fresh Opus reader) over the non-cairn diff: 3 findings, all in the new `docs/maintaining.md` paragraph, all fixed: the assignee is the `--assignee` login, which the job sets to the owner; a refused or untried find is tried again rather than promised an issue; the exit-1 cases are named. Every other added claim held.
- 2026-11-07: review return 1: AC2's tests set only the version and signature to the hostile strings in the body; each of the six values must be tested there (diff-bug #12).
- 2026-11-07: T5 added for review return 1 (minor amendment).
- 2026-11-07: T5 done: `keeps the body's lines fixed when the %s holds %j` sets each of the six values to each of 7 hostile strings (42 cases) and checks the line count, no `<!--` or `#` line before the marker, and one closed code span per value line. A raw ClamAV value turned 42 cases red. `pnpm test` 2806 passed, `pnpm check` 0 problems.

## Decisions

## Review

- AC1: `test/scan-issues.test.ts` `findsOf` block, green: missing, bad `--expect`, other SHA-256, and malformed results files each keep the carried find `a` and return a problem, which `scan-issues-cli.ts` prints as one `::warning::` line; a new find taken and a clean result clearing a carried find; two results for one id, a result for no record, and one for another file each leave the carried finds.
- AC2: same file, `the issue text` and `reportFinds` blocks, green: no find sends no request; a new find posts title, body, label, and `assignees: ["owner"]`; the marker counts in an open and a closed issue and as a whole line mid-body, not inside a code span, in a null body, or for another file or signature; 5 new finds open 5, 6 leave `p5` named in a warning, 6 with 1 reported open 5; label 404 creates it; the six values with each hostile string stay in one code span, cut at 200. `holdsMarker` matches whole trimmed lines and the cap counts opened issues only (`scan-issues.ts:119`, `:137`).
- AC3: same file, green: a failed list, a label read of 500, and a failed label create each open no issue and print one `::warning::` line; a 422 create warns and the next opens #9; a 500 create stops after one post. `main()` in `scan-issues-cli.ts` returns 0 after `reportFinds`, which catches every GitHub error.
- AC4: `test/workflows.test.ts`, 73 green: the `scan-issues` job's `needs`, `if`, `issues: write` alone, `timeout-minutes: 10`, checkout without credentials, the cache-mode list, the digest check after the `plugins-data` download, `scan-results` with `continue-on-error: true`, the exact run step with `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`, `--expect`, `--assignee`, no `GITHUB_REPOSITORY:` key, and no other job's `needs`.
- AC5: `docs/maintaining.md:1013-1036` (command, job, label, `--assignee` set to the owner by the job, marker, cap of 5, later runs while the published data holds the find) and items 4-6 of the six jobs; `docs/data.md:304` and `docs/site.md:297` say a find opens an issue; DESIGN Function Families names `pnpm scan-issues` (`cairn/DESIGN.md:756`); D-084 annotates D-062 and D-082 and says a forged find can reach an issue; CHANGELOG Unreleased names the issue.
- AC6: `pnpm test` 2756 passed, 6 skipped; `pnpm check` 0 problems in 745 entries.
- Gate: `cairn_validate.py` all checks passed; profile `generic`, no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: GitHub can drop the label from a created issue with no error, so every run would open the issue again — fix now (stop with a warning when the created issue lacks the label), fixed 73f65bc9
- diff-bug #2: the job has no default-branch guard, so a dispatched branch run opens real issues — reject (false): a dispatched run uses that branch's own `build.yml`, so a guard here cannot limit branch code, and a branch run's finds are real finds
- diff-bug #3: two runs at once (a branch dispatch beside main's schedule) both list the issues and open the same one — fix now (one `scan-issues` concurrency group for every branch), fixed 73f65bc9
- diff-bug #4: D-084 says start-test code can forge a find, but the digest checks let it only withhold results — fix now (D-084 reworded), fixed 73f65bc9
- diff-bug #5: deleting the issue, removing its label, or editing its marker lets a later run open it again, which the docs do not say — fix now (`docs/maintaining.md` sentence), fixed 73f65bc9
- diff-bug #6: an assignee GitHub always refuses (422) skips every find on every run — reject (edge): only an org-owned repository, whose owner login is not assignable, gives it, outside this user-owned repository's use, and its effect is a warning each run
- diff-bug #7: `scan-issues.ts` imports `site/src/base.ts`, the reverse of the usual direction — reject (style): `base.ts` holds two plain constants and no Astro code, and one source keeps the issue link in step with the site
- diff-bug #8: an empty version shows as an empty code span — fix now (`unknown`, with a test), fixed 05c131f1
- diff-bug #9: `holdsMarker` splits only on `\n`, so a body with bare `\r` breaks hides a marker — fix now (splits on `\r\n`, `\r`, `\n`, with a test), fixed 73f65bc9
- diff-bug #10: no test puts a marker on the second page of the issue list — fix now (test), fixed 73f65bc9
- diff-bug #11: no test runs the CLI, though the repo's other CLIs have tests — fix now (warning line and the three exit-1 cases), fixed 73f65bc9
- diff-bug #12: AC2 asks for tests of each of the six values holding the hostile strings in the body, but the body test sets only the version and signature — floor return: AC2 fails as written (review return 1)
- diff-bug #13: the no-other-job-needs test misses a block-list `needs:` — fix now (regex takes both forms, planted block list turned it red), fixed 73f65bc9
- diff-bug #14 (tests worth keeping): the `GITHUB_REPOSITORY` absence test, the exact run-step text, and the `titleOf` text restate the code — reject (planned change): AC4 and AC2 call for each
- blame-history #1: the same missing default-branch guard as diff-bug #2 — reject (false), as there
- blame-history #2: start-test code can delay an issue by a day by withholding results — noted: it agrees with D-041 and D-084, which now says so
- prior-review: no prior-review evidence; the probe found no PR review comments
- ripple #1: `docs/maintaining.md` said three commands do the scan work — fix now (four), fixed 73f65bc9
- ripple #2: DESIGN's Known issues entry on a replaced `scan-results` artifact did not name the issues — fix now, fixed 73f65bc9
- ripple #3: two `build.yml` comments named only the site job as reading the scan results by SHA-256 — fix now, fixed 73f65bc9
- ripple #4: DESIGN's cache-mode list named build, start-test, and site only — fix now (all five jobs), fixed 73f65bc9
- ripple #5: `docs/maintaining.md`'s "If the downloaded data ... fails its check" named no job, and a failed check in `scan-issues` deploys anyway — fix now (the site job's), fixed 73f65bc9
- ripple #6: the `ScanResults` comment in `scan.ts` named only `add-scan-results` as its reader — fix now, fixed 73f65bc9
