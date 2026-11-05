# M093: Let people ask to remove a plugin

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — a new public form and About text, and a list that changes what the bot proposes
- **Branch/PR:** m093-remove-plugin-path

## Goal

A plugin's owner or any reader can ask from the site to remove a listed plugin, and a removed plugin stays off the index.

## Scope

**In:** an issue form and its label; a link from each plugin page; a "Removing a plugin" section on the About page; a top-level `delisted.json`; refusals in `pnpm check`, `pnpm discover`, and the "Add a plugin" issue path; the maintainer's steps in README; DESIGN and CHANGELOG updates.

**Out:** a command that reads a request and applies it (no request exists yet, so the maintainer edits by hand, and nothing is filed for it); a bot answer to the form (D-049 chose a maintainer who reads); private reporting (the form is public); any review of plugin code (D-051); link previews → M094; the license → M095.

## Acceptance criteria

- [x] AC1: `.github/ISSUE_TEMPLATE/remove-plugin.yml` adds the label `remove-plugin`, which `gh label list` shows. It has a required input with the id `plugin`, a required reason dropdown with the options "I own this plugin's repository", "It is spam", "It misleads people about what it is or who makes it", and "It does harm, and I can show it", and a required evidence text area. Its text says that the issue is public and that a claim with no evidence removes nothing. A test reads the file and asserts each of these.
- [x] AC2: In the site built from `test/fixtures/site/plugins.json`, each plugin page holds exactly one link with the text "Ask to remove this plugin or report harm" to that form with its own id in the `plugin` parameter, and the home and About pages hold no link to the form with a `plugin` parameter. A test walks every built page and asserts this.
- [x] AC3: The built About page has a "Removing a plugin" section. It names the four grounds: an owner's request, spam, an entry that misleads about what the plugin is or who makes it, and harm that a report shows with evidence a reader can check. It says that the form is public, that a removed plugin stays off the index, and that the index still cannot vet plugins and does not review their code. It links to the form with no `plugin` parameter. A test reads the built text of that section and asserts each of these.
- [x] AC4: Given any `dir`, `pnpm check` reads the package root's `delisted.json`, or the file that the `ZPI_DELISTED` variable names. The file is a list of records with `repo` (lowercase owner/name), `ids` (which can be empty, and holds only ids that the maintainer judged unique to that repo), `issue`, and `date`. `pnpm check` exits 1 and names a distinct rule for (a) an entry whose id is on the list, in any letter case, (b) an entry whose GitHub `repoUrl` names a repo on the list, in any letter case and with or without `.git`, and (c) a file that its schema refuses. It stays silent on an entry that is not on the list, and on a non-GitHub `repoUrl` with the same path as a listed repo. A test runs the CLI on a temporary directory for each case and asserts which rule. The committed list passes `pnpm check`.
- [x] AC5: In `pnpm discover`, a topic-search or catalog candidate on the list that the run reaches appears in the report as skipped with the reason `delisted`, with no repo read sent for it, also when the skip set names it. A candidate whose read succeeds is refused as `delisted` when the read shows a listed repo, or as `delisted-id` when an unlisted repo carries a listed id, and neither writes an entry. Tests assert these on `discover()`. The CLI passes the list that `ZPI_DELISTED` names to the run, and `delistedPath()` defaults to the package root's `delisted.json`, and a test asserts each.
- [x] AC6: An "Add a plugin" issue gets a comment that names the removal, is closed as not planned, and sends no create-pull-request request in each of these cases: it names a repo on the list, it names a listed repo that also has a closed bot pull request, it names an old name that redirects to a listed repo, and it names a repo that carries a listed id. A test asserts the comment, the close reason, and the missing request for each.
- [x] AC7: A bot pull request whose entry is on the list is not merged by the merge job, and the run reports it as failed until the maintainer closes it. A test of `mergeDiscover` with `pnpmCheck` and a planted list asserts this, and that a pull request not on the list in the same run is merged.
- [x] AC8: README has a section with the maintainer's steps for a removal: delete the entry directory, add the record, close any open bot pull request for the repo, and answer the issue, with the rule for `ids`. DESIGN's Contract boundary and Data sources state the four grounds and the list. CHANGELOG's Unreleased section has an entry for the form and the lasting removal. `pnpm test` and `pnpm check` exit 0.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T2
- AC4 → T3
- AC5 → T4
- AC6 → T5
- AC7 → T6
- AC8 → T7

## Tasks

- [x] T1: Create the `remove-plugin` label, write `.github/ISSUE_TEMPLATE/remove-plugin.yml` on the shape of `text-change.yml`, and test the file in the shape of `test/text-request.test.ts:19`.
- [x] T2: Add `removeHref` beside `textChangeHref` (`site/src/data.ts:171`), the plugin page link (`site/src/pages/plugins/[id]/index.astro:354`), and the About section before "What the index does not do" (`site/src/pages/about.astro:213`), with tests in `test/site.test.ts:1805`'s shape. Read the built text, as Astro can drop a space.
- [x] T3: Add `delisted.json`, its schema under `schemas/`, the loader, and the three rules in `src/check/check.ts`, with `ZPI_DELISTED` for tests. Limit (b) to GitHub URLs, as `repoName` takes any host (`src/discover/discover.ts:714`).
- [x] T4: Pass the list from `src/discover/cli.ts` and `src/discover/propose.ts` to `discover()`. Test the list before the skip set (`discover.ts:201`, `:245`), and refuse in `draftEntry` after the read resolves the name (`discover.ts:349`).
- [x] T5: Answer in `src/discover/issue.ts` before `known` (`issue.ts:194`), and after the read for a redirected name (`issue.ts:111`).
- [x] T6: Test `mergeDiscover` with the real check runner and a planted list, and read how `src/discover/merge-cli.ts:46` reports the failure.
- [x] T7: Write the README section, update DESIGN and CHANGELOG, and run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-04: created by /milestone-plan.
- 2026-11-04: tier check: milestone — the request changes what running code does and needs design decisions.
- 2026-11-04: idea vet: gap — deleting an entry alone lets the bot propose it again, since `src/discover/propose.ts:214` skips only open and unmerged pull requests; reading taken: a removal lasts, so the list is in scope. flaw — none. gap — a report of harm could be read as a promise of review; reading taken: the form asks for checkable evidence and About keeps the cannot-vet line.
- 2026-11-04: lessons used: 2026-10-27 (M021), 2026-10-28 (M036), 2026-10-31 (M066), 2026-11-02 (M082).
- 2026-11-04: question set: may the work create the `remove-plugin` label — yes.
- 2026-11-04: question set: may the work start `Build data` by hand after the merge — yes.
- 2026-11-04: question set: removal grounds for reports from others — spam, misleading entries, and harm shown with checkable evidence (D-062).
- 2026-11-04: plan split the request by the shippable-independently tripwire: M093 removal path, M094 link previews and topics, M095 license; each merges alone, and M094 and M095 start from their typed commands.
- 2026-11-04: plan chose a checked-in list over more skip logic from closed pull requests because a merged pull request's repo has no closed record to read and the list survives a repo rename through its ids; falsified by a removed plugin returning through a path the list does not reach.
- 2026-11-04: plan chose one form with a reason dropdown over two forms because both requests end in the same maintainer steps; falsified by reports of harm needing a private channel.
- 2026-11-04: full criteria audit returned 12 findings across the three milestones. Here: a shared id blocks forks (ids can be empty and hold unique ids only); merge and propose check temporary directories (package root list); the injected check stub (real runner); skip-set and redirect order (added cases); missing label and input id (added); unpinned grounds (named); link text (fixed). All fixed in the wording above.
- 2026-11-04: the 8 criteria pass the split tripwire by one; kept, as the list's four enforcement points only protect a removal together.
- 2026-11-04: created the `remove-plugin` label on GitHub, as the question set allowed.
- 2026-11-04: implementation choices: a missing or refused list stops `pnpm discover` and fails the issue read, and `pnpm check` names it as `delisted-file`, so a lost list cannot readmit a plugin; `pnpm propose` does not read the list, since its read steps and the merge job's check cover it; the plugin page puts the link in its own line, because "Is this your plugin?" misframed a reader's report.
- 2026-11-04: T1 to T7 done in one checkpoint, as the tasks share the list module; `pnpm test` 2360 passed, 6 skipped; `pnpm check` 736 entries, 0 problems; a site built from the deployed data showed the About section and the link in the browser pane with no console error.
- 2026-11-04: claim audit: 90 claims read, 5 corrected — README.md, CHANGELOG.md, .github/ISSUE_TEMPLATE/remove-plugin.yml, site/src/pages/about.astro
- 2026-11-04: the claim audit's corrections add the rebuild step, the merge job's skip of held and newer pull requests, the closed-pull-request limit on listing a plugin again, the issue exception for a listed id with a bot pull request, and the limit that a copy under a new name and a new id is not covered.
- 2026-11-04: the claim audit's one re-read held four corrections and narrowed the fifth, so the docs now say that a copy under a new name is covered only if it keeps a listed id; no second pass, by the step's rule.
- 2026-11-04: amendment routed: AC5 — "the committed list" is empty, so no test can observe the CLI passing it; the wording binds what two tests together show.
- 2026-11-04: re-audit: AC5 (full) — `discover()` takes a skip set and reads no pull requests, a run stops before candidates past its limits, and code search has no case of its own; wording narrowed to the skip set, candidates the run reaches, and the two tested sources.
- 2026-11-04: re-audit: AC5 (full) — a read that fails first gives its own refusal, an entry-holding or unreached id-carrier is never refused, and the last sentence promises tests over a read of `delistedPath()`; second line on this criterion, so the wording goes to the user.
- 2026-11-04: amendment return: AC5 — "In `pnpm discover`, a topic-search or catalog candidate on the list that the run reaches appears in the report as skipped with the reason `delisted`, with no repo read sent for it, also when the skip set names it. A candidate whose read succeeds is refused as `delisted` when the read shows a listed repo, or as `delisted-id` when an unlisted repo carries a listed id, and neither writes an entry. Tests assert these on `discover()`. The CLI passes the list that `ZPI_DELISTED` names to the run, and `delistedPath()` defaults to the package root's `delisted.json`, and a test asserts each."
- 2026-11-04: the user chose this AC5 wording at the stop; it changes no code, so no new reviewer pass ran on it, and the amendment ran in this session with the implement rules already loaded.
- 2026-11-04: step-7 approval: m093-remove-plugin-path approved for merge
- 2026-11-04: the simple-english hook reports older README and CHANGELOG sentences outside this change; left as they are, and this change's own sentence it flagged is split.

## Decisions

## Review

Evidence (2026-11-04, branch head with this pass's fixes; `pnpm test` 2361 passed, 6 skipped; `pnpm check` 736 entries, 0 problems):

- AC1: `test/delisted.test.ts` "the remove-plugin form" asserts the label, the three required inputs with the id `plugin`, the four options, the public line, and the no-evidence line; `gh label list` shows `remove-plugin`.
- AC2: `test/site.test.ts` "links each plugin page to the remove-plugin form" walks `htmlFiles(out)` (fixture ids + 2) and asserts one link with the text and id on each plugin page, and none with a `plugin` parameter elsewhere.
- AC3: `test/site.test.ts` "states the grounds" reads the built section's text and link; the browser pane showed it from a site built with the deployed data.
- AC4: `test/delisted.test.ts` runs the CLI on temporary directories for (a) a listed id in another case, (b) a mixed-case repo with `.git`, (c) refused and missing lists, the silent unlisted entry, and the non-GitHub URL; `pnpm check` passes the committed list.
- AC5 (as amended at the user's choice): `test/discover.test.ts` "discover and the delisted list" covers the topic-search skip with the skip set naming the repo, the read that shows a listed repo, and the listed id, and the catalog test covers a catalog candidate with no lookup; "passes the list that the variable names" runs the CLI with `ZPI_DELISTED`; `test/delisted.test.ts` asserts the default path.
- AC6: `test/issue.test.ts` "an issue that names a plugin a maintainer removed" asserts the comment, the not-planned close, and only those two writes for the four cases.
- AC7: `test/merge.test.ts` "does not merge an entry on the delisted list" uses `pnpmCheck` with a planted list; p1 is in `failed` with `delisted-repo`, and p2 merges.
- AC8: README "Removing a plugin" has the steps and the `ids` rule; DESIGN's Contract boundary and Data sources state the grounds and the list; CHANGELOG has the entries; `pnpm test` and `pnpm check` exit 0.

Consistency gate: `cairn_validate` passes, with the one sizing advisory recorded in the plan; the profile's slot names no toolchain checks.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: the handoff route carries the list only through untyped spreads — fix now: typed field and a `discoverRead` test.
- diff-bug #2: a list refusal is recorded, so a repo waits up to 30 days after its record goes — fix now: not recorded, with a test.
- diff-bug #3: AC5's "committed list" differs from the test — amendment routed.
- diff-bug #4: DESIGN's discovery family text omits the list — fix now.
- diff-bug #5: the owner ground has no step that confirms ownership — fix now: README step.
- diff-bug #6: a queued run can read an older list — follow-up: parked row "Close gaps in the delisted list reads".
- diff-bug #7: a held pull request gets no check before a hand merge — follow-up: same row.
- diff-bug #8: two helpers differ on `.git` case — fix now: `issue.ts` uses `githubRepoOf`.
- diff-bug #9: the schema takes `owner/name.git`, which never matches — fix now: pattern and test.
- diff-bug #10: the date pattern takes impossible dates — follow-up: same row.
- diff-bug #11: duplicate records overwrite — follow-up: same row.
- diff-bug #12: the link text was not tied to the link — fix now: the test reads the anchor.
- diff-bug #13: repeated test cases and a weak assertion — fix now: cases cut; the issue test's case-folding case stays, as AC6 names it.
- diff-bug #14: comment reflow — fix now.
- blame-history #1: same as diff-bug #2 — fix now.
- blame-history #2: same as diff-bug #14 — fix now.
- blame-history #3: a fork with a listed id costs a read each run — reject, edge: it needs a fork of a removed plugin, outside common use, and its effect is one read of a budget of 100.
- blame-history #4: an unreadable list stops the discover run — reject, planned change: the plan fails closed on a lost list.
- prior-review #1: About and README disagree on proposing again — reject, false: About states the same limit in its next sentence.
- prior-review #2: a possible race on the issue close path — reject, false: the refusal uses the same `refuse` answer as every other refusal.
- prior-review #3: garbled comment — fix now, same as diff-bug #14.
- prior-review #4: `.git` case — fix now, same as diff-bug #8.
- prior-review #5: `repoName` is not host-checked in `draftEntry` — reject, false: the reader gives GitHub's `html_url`.
- prior-review #6: signature length — reject, style.
- ripple #1: DESIGN's "no entry names" — fix now.
- ripple #2: README's "leaves out" sentence — fix now.
- ripple #3: DESIGN's catalog skip — fix now.
- ripple #4: README's issue refusals — fix now.
- ripple #5: the state text omits the new failures — fix now, in README and DESIGN.
- ripple #6: DESIGN's About list — fix now.
- ripple #7: the Details card text — fix now, in README and DESIGN.
- ripple #8: "two schemas" — reject, false: the build still publishes two.
- ripple #9: the renamed-repo line — reject, false: it stays true.
- ripple #10: ROADMAP's "owner's removal" — reject, false: it concerns a text override.
