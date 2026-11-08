<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M117: Open an issue for each malware scan find

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the build opens issues in the public repository
- **Branch/PR:** —

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

- [ ] AC1: `pnpm scan-issues --data <file> --results <file> --expect
      <sha256> [--assignee <login>]` takes as each record's find its result
      that `pnpm add-scan-results` would add, else its `malwareScan` in
      `--data`, when that has `found`. A missing, changed, or malformed
      results file, or an `--expect` that is not 64 hex digits, adds no
      result, so only the `--data` finds count, with one warning line.
      Tests cover each such results file, two results for one id, and a
      result for no record.
- [ ] AC2: With no find it sends no request. Otherwise it lists the issues
      labeled `malware-scan` in all states and opens an issue for each find
      whose marker line `<!-- malware-scan <id> <xpiSha256> <SHA-256 of the
      signature> -->` no listed issue's body holds, in data order, at most
      `SCAN_ISSUES_MAX` (5) a run; a find already reported takes no slot,
      and past the cap it prints one warning line naming each id left. Each
      issue has the label, the assignee when given, the title `Malware scan
      flagged <id>`, and a body that links the plugin's page and holds the
      id, version, signature, scan date, `clamav` line, and file SHA-256,
      each in a code span that no backtick or line break in it can end, and
      the marker. A read of the label that answers 404 creates the label
      first. Tests cover a new find, its marker in an open issue, in a
      closed issue, mid-body, in an issue with a null body, a marker for the
      same id with another file and with another signature, exactly 5 and 6
      new finds, 6 finds with 1 reported, the label found and created, and a
      version and a signature holding backtick runs, a line break, `-->`,
      and `@name`.
- [ ] AC3: A failed issue list or label read opens no issue, a failed label
      or issue create stops the run's other creates, and each prints one
      warning line and exits 0. Tests cover a failed list, a label read that
      answers 500, a failed label create, and a failed issue create.
- [ ] AC4: `.github/workflows/build.yml` has a `scan-issues` job with
      `needs: [build, malware-scan]`, `permissions` of `issues: write` only,
      `cache-mode: none`, a `timeout-minutes` of at most 10, and checkout
      with `persist-credentials: false`. It checks the downloaded
      `plugins-data` against the build job's `data-sha256` output before
      `pnpm scan-issues`, downloads `scan-results` with `continue-on-error:
      true`, and runs `pnpm scan-issues` with `--expect` set to
      `needs.malware-scan.outputs.scan-sha256`, `--assignee` set to the
      repository's owner, and `GITHUB_TOKEN`. No other job names it in
      `needs`. `test/workflows.test.ts` asserts each of these.
- [ ] AC5: `docs/maintaining.md` states the command, the job, the label,
      the assignee, the marker, the cap, and that a find past the cap or
      whose create failed gets its issue on a later run; `docs/data.md` and
      `docs/site.md` say that a find opens an issue; `cairn/DESIGN.md`'s
      Function Families entry for `src/malware-scan/` names the command;
      D-084 records the choice, annotating D-062 and D-082, and that a
      forged find can reach an issue; `CHANGELOG.md`'s Unreleased section
      names it.
- [ ] AC6: The verify slot (`pnpm test` and `pnpm check`) passes.

## Coverage

- AC1 → T1, T2
- AC2 → T1, T2
- AC3 → T2
- AC4 → T3
- AC5 → T4
- AC6 → T1, T2, T3, T4

## Tasks

- [ ] T1: Write `src/malware-scan/scan-issues.ts`: the finds from the
      results (sharing `addScanResults`'s checks) and the data, the marker,
      the title, the page link, and the body with safe code spans, with the
      AC1 tests and the AC2 text tests.
- [ ] T2: Add the GitHub calls through `githubClient`
      (`src/upstream/reader.ts`): `pages` over the label's issues in all
      states, the label read and create, each issue create with its
      assignee, the cap, and the warning lines; add `pnpm scan-issues` and
      its CLI, with the remaining AC2 tests and the AC3 tests.
- [ ] T3: Add the `scan-issues` job to `build.yml`, with
      `GITHUB_REPOSITORY_OWNER` as the assignee, and its tests in
      `test/workflows.test.ts`, the job in the cache-mode list.
- [ ] T4: Update `docs/maintaining.md`, `docs/data.md`, `docs/site.md`,
      DESIGN's Function Families entry, D-084, and CHANGELOG.

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
