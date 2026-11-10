<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M119: Remove plugins with Sci-Hub built in

- **Status:** in-progress
- **Priority:** high
- **Depends on:** M118
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — plugins leave the site, owners get public issues, and the bot holds pull requests
- **Branch/PR:** m119-remove-scihub-plugins

## Goal

Before Zotdex is advertised, remove the listed plugins that name and have
built in Sci-Hub or a site like it, and hold new bot pull requests that
name such a site for the maintainer.

## Scope

**In:** a checked-in sites file read by the bot, with its schema and a
check; `cairn/references/` source notes for the court rulings and a
ledger of the sweep; one public issue per removed plugin on the index
repo, written to M118's outline and mentioning the repo's owner;
`delisted.json` records with ground `copyright` and the removed entries'
deletion; a new hold reason in `src/discover/holds.ts`, `discover.ts`,
`handoff.ts`, and `refresh-holds.ts`, with tests; a D-entry annotating
D-033 and D-053 (RR01 R9); docs, DESIGN.md, CHANGELOG.

**Out:** the rules → M118. The daily re-check of listed plugins → M120.
A plugin that gets papers from such a site but names none in the fields
the sweep reads: the remove form covers it on a report, so no row.
Plugins on hosts other than GitHub: the bot computes holds only for
GitHub repos (`src/discover/discover.ts:388`), and the remove form covers
them, so no row.

## Acceptance criteria

- [x] AC1: The sites file lists Sci-Hub and each other site that a plugin
      marked yes in AC2's ledger gets papers from, when it meets M118's
      fifth ground by the counting rule M118's D-entry records. Each ruling
      gives country, court, date, case name or number, kind (contested
      judgment, default judgment, or blocking order), and a link, and has
      a source note in `cairn/references/`. Each site gives the names the
      bot matches, none of which is also a common other word (such as
      "zlib"). A site that fails the count is left out, and the ledger
      names it.
- [x] AC2: A ledger in `cairn/references/` records, for each plugin in the
      deployed data of the sweep day whose name, description, or repository
      name matches the pattern that the ledger states, whether the plugin
      has a listed site built in by M118's definition, and the README line
      or settings file where that was read.
- [ ] AC3: Each plugin that the ledger marks yes has a `delisted.json`
      record with ground `copyright` and the number of its own public
      issue on the index repo, written to M118's outline and mentioning
      the repo's owner. Its directory under `plugins/` is gone, and `pnpm
      check` passes.
- [x] AC4: The bot holds a new pull request for a GitHub repo whose
      manifest name, manifest description, GitHub description, repo name,
      or topics match a name in the sites file, under a new hold reason,
      and `refresh-holds` gives the same reason. Tests show a held case for
      each of the five fields and for each site in the file, a case and
      punctuation variant of a name, and an unheld plugin with a near-miss
      name.
- [x] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T4
- AC4 → T3
- AC5 → T5

## Tasks

- [x] T1: Find and read the court rulings for Sci-Hub and each site the
      matched plugins use (RR01 named cases from memory; confirm each);
      write a source note per ruling; write the sites file, its schema,
      and a check that refuses a site with rulings from fewer than two
      countries.
- [x] T2: Sweep the deployed data with the ledger's pattern; read each
      matched plugin's README and settings (no code, per M118's D-entry);
      record each verdict and where it was read.
- [x] T3: Write the D-entry for the hold and for closing a held pull
      request under a ground (RR01 R9). Add the hold reason: description
      and topic fields in `HoldFacts` (`src/discover/holds.ts:97`), the
      match against the sites file, the pull request body's text, the
      handoff schema, and `refresh-holds`; tests per AC4.
- [x] T4: For each plugin marked yes, open one public issue on the index
      repo to M118's outline, mentioning the owner (text written with the
      writing-for-people skill and shown in chat when posted); add its
      `delisted.json` record; delete its `plugins/` directory; update docs,
      DESIGN.md, CHANGELOG.
- [x] T5: Run `pnpm test` and `pnpm check`.

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
- 2026-11-09: RR01 ingested: AC1 takes the ruling fields and the name rule (R12); AC2 follows M118's built-in definition; AC3 follows M118's issue outline (R13); AC4 adds topics (R12); T3 takes R9; RR01's cases are from memory, so T1 confirms each.
- 2026-11-09: started on branch m119-remove-scihub-plugins; `.claude/` was untracked before the cut and stays unstaged.
- 2026-11-09: T1 and T2 read together: the sweep's reads told which sites T1 had to count; the order of commits is kept.
- 2026-11-09: T1: `sites.json` at the repo root with `schemas/sites.schema.json`; `src/check/sites.ts` reads it and `pnpm check` reports `sites-file`; Sci-Hub (US 2017, FR 2019, IN 2025) and Anna's Archive (NL 2024, US 2026) listed; Sci-Net left out on one country; RR01's Sci-Hub cases confirmed, from the US judgment's own text and reports; the Dutch day not found, so the schema takes YYYY-MM; five source notes.
- 2026-11-09: T1 choice: a name matches when whole runs of a-z and 0-9 in a row join to it, a run also ending at a lower-to-upper case change, after NFKC; so `scihubfetcher` as one word does not match, a cost of keeping near misses out.
- 2026-11-09: T2: `cairn/references/listed-site-sweep-2026-11-09.md`; the pattern is the sites file's names under the bot's own match, over name, both descriptions, repo name, and description overrides (the data holds no topics); six matches, all yes (five Sci-Hub, one Anna's Archive); zotfetch's README contradicts itself, so its issue names the conflict; one commit with T1, since INDEX.md lists both.
- 2026-11-09: T3: D-087 (the hold, the match rule, a tripwire not a guard, and a held pull request closed under a ground with its own `delisted.json` record and removal issue); `listed-site` is the seventh hold reason, last in order so earlier lists keep their order; `HoldFacts` takes both descriptions and the sites; the details name each site and its texts (at most 10); `refresh-holds` reads the GitHub description and topics again and fails the pull request on a failed read; the discover, issue, and refresh CLIs read `sites.json` and stop on a bad file; docs/maintaining.md lists the hold, its details, and closing a never-listed plugin's pull request.
- 2026-11-09: T3 choice: `sites` is optional in the draft options, like `delisted`, and required in `refreshHolds`; each CLI passes it.
- 2026-11-09: T4 part 1 (not done): the six `plugins/` directories deleted; docs/maintaining.md now puts the outline in the removal issue's body, so the owner can answer before the merge, and the step-7 close names the merged pull request; docs/requests.md links `sites.json`; DESIGN and CHANGELOG updated; no open bot pull request or earlier issue names the six repos.
- 2026-11-09: T4: six issue bodies drafted by a fresh Opus drafter from a brief (writing-for-people), checked against the reads and links, one judgment ("That is fine") removed; posting waits for the user's yes on the text, since the text is drafted, not the user's, and names people's plugins next to court rulings; `delisted.json` records wait for the issue numbers.
- 2026-11-09: user override: the user asked for the issues to be written for people, then much shorter: what Zotdex is, the removal and its reason, and how to appeal; the rulings list, the no-claim-of-law-breaking line, and the second-removal note were cut; the user kept the @mention; docs/maintaining.md's outline now matches (three items), so AC3's "M118's outline" reads against that shortened outline.
- 2026-11-09: T4: issues #883 to #888 opened with the `remove-plugin` label, each @-mentioning the owner and linking the line read, posted bodies checked against the drafts; six `delisted.json` records, ground `copyright`, date 2026-11-09; `ids` left empty for `ethanwillis/zotero-scihub`, since `scihub@example.com` is a placeholder id its forks keep; after the merge each issue is renamed `Removed …` and closed with a comment naming the merged pull request (docs/maintaining.md step 7).
- 2026-11-09: claim audit in progress (checkpoint): the fresh Opus reader's six findings fixed (the match's case rule in docs and D-088, what `sites.json` lists in both docs, the Paris and Rotterdam ruling links, the per-name held cases read from the file); Library Genesis, which meets the count but is out of AC1, recorded as a DESIGN Known issue since the ROADMAP is at its line cap; the reader's one re-read is pending.
- 2026-11-09: claim audit: 133 claims read, 6 corrected — docs/maintaining.md, docs/requests.md, sites.json, test/holds.test.ts; the reader's one re-read found all six hold, and D-088 and the Known issues entry hold; D-088's heading leaves out "or a digit", which its body gives; left, since the pass's one re-read is spent and the heading is history.
- 2026-11-09: status review: `pnpm test` 2864 passed, 6 skipped; `pnpm check` 0 problems; cairn_validate all checks passed.
- 2026-11-09: amendment routed: AC3 — the issues follow the three-part outline the user chose (user override above), not M118's six-part outline that AC3 names, so AC3's outline clause is wrong as written; the deliverable is as the user asked.
- 2026-11-09: re-audit: AC3 (full) — "Its directory" reads as the issue's; the link clause should name what the ledger names; both fixed toward the narrower wording.
- 2026-11-09: re-audit: AC3 (full) — "the repo's owner" can read as the index repo's; "README line or settings file" admits a README line that is not the evidence; "is removed" vs issues opened before the merge; second re-audit on AC3, so the wording goes to the user (stop).
- 2026-11-09: T5: `pnpm test` 2864 passed, 6 skipped; `pnpm check` 748 entries, 0 problems; a restored copy of two removed entries fails `pnpm check` as `delisted-repo` and `delisted-id`.

## Decisions

## Decisions

- 2026-11-09 (RR01): Whether Anna's Archive (used by 0xc1c4da/zotero7-scidb) qualifies turns on blocking orders, which M118's counting rule now counts; T1 applies the fixed rule and does not revisit it.

## Review

Pass 1, 2026-11-09, at 15d0d98e.

- AC1: `sites.json` lists Sci-Hub (US 2017 default judgment, FR 2019 blocking order, IN 2025 blocking order; 3 countries) and Anna's Archive (NL 2024 blocking order, US 2026 default judgment; 2 countries), the one other site a yes plugin uses (L3); each ruling has country, court, date, case, kind, and url, read by node from the file; each has a source note (five files present in `cairn/references/`); names `Sci-Hub` and `Anna's Archive`, neither a common other word; Sci-Net, used by L1, fails the count and the ledger names it (S3, "1 country: left out"). Pass.
- AC2: `cairn/references/listed-site-sweep-2026-11-09.md` states its pattern (the sites file's names under `sitesNamedIn`, over name, both descriptions, repo name, and description overrides) and gives each match's verdict and the README line or settings file read (L1 to L6); re-running that match over the shelf copy of the data (`generatedAt` 2026-11-09T16:32:17.108Z, 754 records) gives the same six records. Pass.
- AC3: each of the six yes plugins has a `delisted.json` record with ground `copyright` and its own issue (#883 to #888, open, label `remove-plugin`, each body opening with `@<owner>`); the six `plugins/` directories are gone; `pnpm check` exits 0 (748 entries). Fails as written: the bodies follow the three-part outline that the user chose (what Zotdex is, the removal and reason with the line read, how to appeal), and they leave out two items of M118's outline (the rule's rulings, the no-claim-of-law-breaking line). Routed as an amendment return; box left unticked.
- AC4: tests pass for a held case in each of the five fields (`test/holds.test.ts` "the listed-site hold", 5 cases), for each name of each site in the committed file (2 cases, built from `sites.json`), case and punctuation variants (4 cases), and unheld near misses in name, description, and topic (3 cases); `refresh-holds` gives the same reason (`test/refresh-holds.test.ts` "a listed-site hold", 3 cases). Pass.
- AC5: `pnpm test` 2864 passed, 6 skipped, 0 failed; `pnpm check` 748 entries, 0 problems, exit 0. Pass.
