<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M120: Re-check listed plugins for listed sites

- **Status:** planned
- **Priority:** high
- **Depends on:** M119
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the build opens issues in the public repository
- **Branch/PR:** —

## Goal

The daily build matches listed plugins against the sites file and opens
a GitHub issue for the maintainer for each new match, so a plugin that
adds a listed site after it is listed is found.

## Scope

**In:** a `pnpm site-issues` command (`src/site-issues/` and a CLI) and a
`site-issues` job in `.github/workflows/build.yml` that holds `issues:
write` and opens an issue, labeled `listed-site` and assigned to the
repository's owner, for each listed plugin and site that no such issue
names yet; docs, DESIGN, a D-entry annotating D-084, CHANGELOG.

**Out:** removing a matched plugin: the maintainer reads it under M118's
rules, so no row. Matching on topics: the deployed data holds no topics,
and the bot's hold (M119) reads them at intake, so no row.

## Acceptance criteria

- [ ] AC1: `pnpm site-issues --data <file> --sites <file> [--assignee
      <login>]` takes as its matches each record whose name, description,
      or repository name in the data matches a name in the sites file, and
      opens one issue for each match whose marker line (plugin id and site)
      no issue labeled `listed-site`, open or closed, holds, at most 5 a
      run, printing one warning line naming each match left past the cap.
      Tests cover no match (no request), a match in each of the three
      fields, a match already reported in an open and in a closed issue,
      exactly 5 and 6 new matches, and the label found and created.
- [ ] AC2: A failed issue list or label read opens no issue; a failed label
      create or a failed issue create stops the run's other creates; each
      prints one warning line and exits 0. Tests cover each failure.
- [ ] AC3: A `site-issues` job in `build.yml` runs the command on the
      daily build's data with the checked-out sites file, and
      `docs/maintaining.md` says what a maintainer does with such an issue
      under M118's rules, including that a second removal on the fifth
      ground stays.
- [ ] AC4: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T2
- AC4 → T3

## Tasks

- [ ] T1: Write `src/site-issues/` and its CLI on the shape of
      `src/malware-scan/scan-issues.ts` (D-084); tests per AC1 and AC2.
- [ ] T2: Add the `site-issues` job to `.github/workflows/build.yml`;
      write the D-entry; update docs, DESIGN, CHANGELOG.
- [ ] T3: Run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-09: created by /milestone-plan, split from M119 at RR01 ingestion (R8's daily re-check), which the user accepted.
- 2026-11-09: tier check: milestone — a new build job that writes to the public repository; planned from RR01 ingestion, which `/milestone-brief` routed.
- 2026-11-09: idea vet: gap — topics are not in the deployed data; taken as out, since M119's hold reads them at intake. flaw — none.
- 2026-11-09: lessons used: 2026-11-07 (M116) a `Build data` run dispatched on a branch runs every job but the deploy.

## Decisions

## Review
