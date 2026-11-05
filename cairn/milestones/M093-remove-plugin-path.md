# M093: Let people ask to remove a plugin

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — a new public form and About text, and a list that changes what the bot proposes
- **Branch/PR:** —

## Goal

A plugin's owner or any reader can ask from the site to remove a listed plugin, and a removed plugin stays off the index.

## Scope

**In:** an issue form and its label; a link from each plugin page; a "Removing a plugin" section on the About page; a top-level `delisted.json`; refusals in `pnpm check`, `pnpm discover`, and the "Add a plugin" issue path; the maintainer's steps in README; DESIGN and CHANGELOG updates.

**Out:** a command that reads a request and applies it (no request exists yet, so the maintainer edits by hand, and nothing is filed for it); a bot answer to the form (D-049 chose a maintainer who reads); private reporting (the form is public); any review of plugin code (D-051); link previews → M094; the license → M095.

## Acceptance criteria

- [ ] AC1: `.github/ISSUE_TEMPLATE/remove-plugin.yml` adds the label `remove-plugin`, which `gh label list` shows. It has a required input with the id `plugin`, a required reason dropdown with the options "I own this plugin's repository", "It is spam", "It misleads people about what it is or who makes it", and "It does harm, and I can show it", and a required evidence text area. Its text says that the issue is public and that a claim with no evidence removes nothing. A test reads the file and asserts each of these.
- [ ] AC2: In the site built from `test/fixtures/site/plugins.json`, each plugin page holds exactly one link with the text "Ask to remove this plugin or report harm" to that form with its own id in the `plugin` parameter, and the home and About pages hold no link to the form with a `plugin` parameter. A test walks every built page and asserts this.
- [ ] AC3: The built About page has a "Removing a plugin" section. It names the four grounds: an owner's request, spam, an entry that misleads about what the plugin is or who makes it, and harm that a report shows with evidence a reader can check. It says that the form is public, that a removed plugin stays off the index, and that the index still cannot vet plugins and does not review their code. It links to the form with no `plugin` parameter. A test reads the built text of that section and asserts each of these.
- [ ] AC4: Given any `dir`, `pnpm check` reads the package root's `delisted.json`, or the file that the `ZPI_DELISTED` variable names. The file is a list of records with `repo` (lowercase owner/name), `ids` (which can be empty, and holds only ids that the maintainer judged unique to that repo), `issue`, and `date`. `pnpm check` exits 1 and names a distinct rule for (a) an entry whose id is on the list, in any letter case, (b) an entry whose GitHub `repoUrl` names a repo on the list, in any letter case and with or without `.git`, and (c) a file that its schema refuses. It stays silent on an entry that is not on the list, and on a non-GitHub `repoUrl` with the same path as a listed repo. A test runs the CLI on a temporary directory for each case and asserts which rule. The committed list passes `pnpm check`.
- [ ] AC5: In `pnpm discover`, a candidate repo on the list appears in the report as skipped with the reason `delisted`, with no repo read sent for it, also when an earlier closed bot pull request puts it in the skip set. A search name that resolves to a listed repo through the read is refused as `delisted` and writes no entry. A repo not on the list that carries a listed id is refused as `delisted-id` and writes no entry. Tests assert these on `discover()`, and one test asserts that the CLI passes the committed list to it.
- [ ] AC6: An "Add a plugin" issue gets a comment that names the removal, is closed as not planned, and sends no create-pull-request request in each of these cases: it names a repo on the list, it names a listed repo that also has a closed bot pull request, it names an old name that redirects to a listed repo, and it names a repo that carries a listed id. A test asserts the comment, the close reason, and the missing request for each.
- [ ] AC7: A bot pull request whose entry is on the list is not merged by the merge job, and the run reports it as failed until the maintainer closes it. A test of `mergeDiscover` with `pnpmCheck` and a planted list asserts this, and that a pull request not on the list in the same run is merged.
- [ ] AC8: README has a section with the maintainer's steps for a removal: delete the entry directory, add the record, close any open bot pull request for the repo, and answer the issue, with the rule for `ids`. DESIGN's Contract boundary and Data sources state the four grounds and the list. CHANGELOG's Unreleased section has an entry for the form and the lasting removal. `pnpm test` and `pnpm check` exit 0.

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

- [ ] T1: Create the `remove-plugin` label, write `.github/ISSUE_TEMPLATE/remove-plugin.yml` on the shape of `text-change.yml`, and test the file in the shape of `test/text-request.test.ts:19`.
- [ ] T2: Add `removeHref` beside `textChangeHref` (`site/src/data.ts:171`), the plugin page link (`site/src/pages/plugins/[id]/index.astro:354`), and the About section before "What the index does not do" (`site/src/pages/about.astro:213`), with tests in `test/site.test.ts:1805`'s shape. Read the built text, as Astro can drop a space.
- [ ] T3: Add `delisted.json`, its schema under `schemas/`, the loader, and the three rules in `src/check/check.ts`, with `ZPI_DELISTED` for tests. Limit (b) to GitHub URLs, as `repoName` takes any host (`src/discover/discover.ts:714`).
- [ ] T4: Pass the list from `src/discover/cli.ts` and `src/discover/propose.ts` to `discover()`. Test the list before the skip set (`discover.ts:201`, `:245`), and refuse in `draftEntry` after the read resolves the name (`discover.ts:349`).
- [ ] T5: Answer in `src/discover/issue.ts` before `known` (`issue.ts:194`), and after the read for a redirected name (`issue.ts:111`).
- [ ] T6: Test `mergeDiscover` with the real check runner and a planted list, and read how `src/discover/merge-cli.ts:46` reports the failure.
- [ ] T7: Write the README section, update DESIGN and CHANGELOG, and run `pnpm test` and `pnpm check`.

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

## Decisions

## Review
