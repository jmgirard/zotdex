<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M119: Remove plugins with Sci-Hub built in

- **Status:** planned
- **Priority:** high
- **Depends on:** M118
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — plugins leave the site, owners get public issues, and the bot holds pull requests
- **Branch/PR:** —

## Goal

Before Zotdex is advertised, remove the listed plugins that name and have
built in Sci-Hub or a site like it, and hold new bot pull requests that
name such a site for the maintainer.

## Scope

**In:** a checked-in sites file read by the bot, with its schema and a
check; `cairn/references/` source notes for the court rulings and a
ledger of the sweep; one public issue per removed plugin on the index
repo, mentioning the repo's owner; `delisted.json` records with ground
`copyright` and the removed entries' deletion; a new hold reason in
`src/discover/holds.ts`, `discover.ts`, `handoff.ts`, and
`refresh-holds.ts`, with tests; a D-entry annotating D-033 and D-053
that states the hold's question; docs, DESIGN.md, CHANGELOG.

**Out:** the rules themselves → M118. A plugin that gets papers from such
a site but names none in its manifest, GitHub description, or repo name:
the sweep cannot find it, and the remove form covers it on a report, so
no row. Plugins on hosts other than GitHub: the bot computes holds only
for GitHub repos (`src/discover/discover.ts:388`), and the remove form
covers them, so no row.

## Acceptance criteria

- [ ] AC1: The sites file names Sci-Hub and each other site that a plugin
      marked yes in AC2's ledger gets papers from, if courts in at least
      two countries have found that site, in copyright cases, infringes
      copyright. For each site it gives the name spellings the bot
      matches and the rulings, each ruling with a source note in
      `cairn/references/`. A site with rulings from fewer than two
      countries is left out of the file, and the ledger names it.
- [ ] AC2: A ledger in `cairn/references/` records, for each plugin in the
      deployed data of the sweep day whose manifest name, manifest
      description, GitHub description, or repo name matches the pattern
      that the ledger states, whether the plugin has a built-in way to get
      papers from a site in the sites file, and the README line or
      settings file where that was read.
- [ ] AC3: Each plugin that the ledger marks yes has a `delisted.json`
      record with ground `copyright` and the number of its own public
      issue on the index repo, which mentions the repo's owner, names the
      rulings, and links how a plugin comes back. Its directory under
      `plugins/` is gone, and `pnpm check` passes.
- [ ] AC4: The bot holds a new pull request for a GitHub repo whose
      manifest name, manifest description, GitHub description, or repo
      name matches a name spelling in the sites file, under a new hold
      reason, and `refresh-holds` gives the same reason. Tests show a held
      case for each of the four fields and for each site in the file, a
      case and punctuation variant of a name, and an unheld plugin with a
      near-miss name.
- [ ] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T4
- AC4 → T3
- AC5 → T5

## Tasks

- [ ] T1: Find and read court rulings in copyright cases for Sci-Hub and
      for each site the matched plugins use; write a source note for each
      ruling; write the sites file, its schema, and a check that refuses
      a site with rulings from fewer than two countries.
- [ ] T2: Sweep the deployed data with the ledger's pattern; read each
      matched plugin's README and settings (no code review, per M118's
      D-entry); record each verdict and where it was read.
- [ ] T3: Write the D-entry for the hold. Add the hold reason: description
      fields in `HoldFacts` (`src/discover/holds.ts:97`), the match
      against the sites file, the pull request body's text, the handoff
      schema, and `refresh-holds`; tests per AC4.
- [ ] T4: For each plugin marked yes, open one public issue on the index
      repo that mentions the owner, names the rulings, and links the
      return steps (text written with the writing-for-people skill and
      shown in chat when posted); add its `delisted.json` record; delete
      its `plugins/` directory; update docs, DESIGN.md, CHANGELOG.
- [ ] T5: Run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-09: created by /milestone-plan.
- 2026-11-09: tier check: milestone — removals under a new ground and a new bot hold.
- 2026-11-09: idea vet: gap — a plugin that gets papers from such a site without naming it; taken as out of reach of the sweep and left to reports. flaw — none.
- 2026-11-09: lessons used: 2026-11-02 (M075) a new repo field in `pluginRepo` fails the fixed build output; 2026-11-07 (M114) `gitRunner` stdin.
- 2026-11-09: criteria audit (full, fresh Opus reader): AC1 narrowed from every infringing site to the sites the swept plugins use; the goal narrowed to plugins that name a site; AC4 narrowed to GitHub repos and `refresh-holds`, with tests over each site, spelling variants, and a near miss; a D-entry for the hold's question added to T3.
- 2026-11-09: question set: one public issue per removed plugin, each mentioning the repo's owner — yes; opening those issues is granted.
- 2026-11-09: collision: the parked row "Close gaps in the delisted list reads" stays parked; these are the first removals, and its condition is a return.
- 2026-11-09: roadmap cap: the M115 terminal row was pruned and one parked row shortened to fit the two new rows.
- 2026-11-09: word search of the 2026-11-09 data found six candidates: ethanwillis/zotero-scihub, syt2/zotero-scipdf, 0xc1c4da/zotero7-scidb, chen7447/sci-download-for-zotero, dnnunn/zotero-scihub-fetcher, fdossi/zotfetch.

## Decisions

## Review
