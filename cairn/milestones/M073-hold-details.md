# M073: Show hold details in bot pull requests

- **Status:** in-progress
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** internal — text that the maintainer reads in bot pull requests and a command the maintainer runs; the data and the site do not change
- **Branch/PR:** m073-hold-details

## Goal

A held bot pull request's body names the facts behind its hold reasons, when the bot opens it and, through one refresh command, when it is already open.

## Scope

**In:**
- In `src/discover/holds.ts`, work out a hold's details from the facts `holdReasons` reads: the index entries that a `name-match` matched, the update host, and the owner's account date. The account date goes on every held body, since it also helps to judge a name match.
- Carry the details from the read job to the write job as an optional handoff field that `entrySchema` bounds.
- In `body()`, write the details after the reason sentences of a held entry. An unheld body does not change.
- Add `pnpm refresh-holds [--apply]`, run by hand. It works out the details again for open held bot pull requests and replaces their detail lines. It never changes a Hold line or a label.
- README, DESIGN, and CHANGELOG text.
- After the merge, run `pnpm refresh-holds --apply` once on this repo with the maintainer's token, read the bodies back, and give the count in the close block. The user granted this at the question set.

**Out:**
- Changing which pull requests the bot holds → M074 for owner Pages hosts, and the candidate row "Close gaps in bot holds and merges" for the `name-match` gaps.
- A workflow for the refresh → no row; the new bodies carry the details, so a hand run is enough.
- Releasing or merging a held pull request → M074 for its five, the maintainer for the rest.

## Acceptance criteria

- [ ] AC1: For an entry held for `name-match`, the body names the matched index entries by `owner/repo` and by name, when the entry has one. Tests in `test/holds.test.ts` and `test/propose.test.ts` cover 1 match, 6 matches (5 named, then a count of 1 more), a repo-part match with an entry that has no name, and an index entry of the same owner with the same name (not named).
- [ ] AC2: For an entry held for `update-host`, the body names the update host with any non-default port. The body that `body()` builds for a held entry gives the owner's account creation date as YYYY-MM-DD, or says that the bot could not read it for `owner-unread`. Tests cover each of the five hold reasons, and a test shows that an entry with no hold gets `Hold: none`, `UNHELD_TEXT`, and no detail lines.
- [ ] AC3: A matched name that holds a line break, a backtick, and the text `Hold: none` stays in one code span. A test shows that such a body has one line outside fences that starts with `Hold:`, and that `pnpm merge-discover` skips it with the reason `its body has no Hold: none line`. `test/handoff.test.ts` shows `readHandoff` refusing a detail field with too many matches, a name over the limit, a malformed date, and a malformed repo.
- [ ] AC4: `pnpm refresh-holds` reads every page of open pull requests and acts on those that pass the head-branch and author checks of `pnpm merge-discover`, have the `hold` label, and have one `Hold:` line outside fences that names reasons. Without `--apply` it prints each number and its new detail lines and sends no write request. With `--apply` it sends one PATCH of the body alone for each body that changes. If a pull request's `meta.json` read fails, or its account read gives no date and its Hold line does not name `owner-unread`, the command leaves that body as it is, prints the number with the cause, and exits 1. `fixtureFetch` tests show both modes, that failure, a held pull request on a second page, and a skip for a head branch outside `discover/`, no Hold line, `Hold: none`, no label, and another author.
- [ ] AC5: In a test, removing the detail lines from a refreshed body gives the source body byte for byte. A second run on the refreshed body sends no PATCH. The request log of the `--apply` test holds only GET and PATCH requests, with no request to a labels URL. A body with no closing sentence is skipped and printed by number.
- [ ] AC6: At review, `pnpm refresh-holds` without `--apply` on this repo prints each number that `gh pr list --state open --label hold --limit 100 --json number,body` lists with a Hold line that names reasons. For 3 of them, one each of `name-match`, `update-host`, and `new-account`, the printed facts equal `plugins/`, the pull request's `meta.json`, and `GET /users/<owner>`.
- [ ] AC7: The README's Hold line text describes the detail lines and `pnpm refresh-holds`, `CHANGELOG.md` gains one entry under `## Unreleased`, and `pnpm test` and `pnpm check` exit 0.

## Coverage

- AC1 → T1, T3
- AC2 → T1, T3
- AC3 → T2, T3
- AC4 → T4
- AC5 → T4
- AC6 → T6
- AC7 → T5

## Tasks

- [x] T1: In `src/discover/holds.ts:53`, let one function decide the matches for both `holdReasons` and the details, so the two cannot disagree. Cut a matched name to 100 characters, list at most 5 entries, and keep the count of the others. Add the `test/holds.test.ts` cases.
- [x] T2: Add the optional details to `PlannedEntry` and `entrySchema` (`src/discover/handoff.ts:27`, `:60`) and to `planned()`, `Drafted`, and the written `ReadItem` (`src/discover/discover.ts:100`, `:291`). Add the `test/handoff.test.ts` refusals.
- [x] T3: In `body()` (`src/discover/propose.ts:540`), write the detail lines through `code()`, with each repo as a link to `https://github.com/<owner>/<repo>`. Add the `test/propose.test.ts` cases and the `test/merge.test.ts` skip. Extend the body-length test to the longest details the schema allows.
- [x] T4: Add `src/discover/refresh-holds.ts`, `src/discover/refresh-holds-cli.ts`, and the `package.json` script, in the shape of `merge.ts` and `merge-cli.ts`. Read each entry's `meta.json` at the head SHA, the index with `indexed()`, and the account date with `ownerCreatedAt`. Share the detail lines with `body()`. If a `name-match` matches nothing now, say so in its line. Add `test/refresh-holds.test.ts`.
- [ ] T5: Write the README, DESIGN, and CHANGELOG text, and wrap it near 76 columns. Run the verify slot.
- [ ] T6: Run `pnpm refresh-holds` without `--apply` on this repo with `GITHUB_TOKEN` from `gh auth token`, and put the count and the 3 compared facts in the work log.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: not run — work named at the question set
- 2026-11-02: idea vet: gap, new bodies alone do not reach the 58 open held pull requests, and the bot has opened no held pull request since 2026-10-31; sent to the question set, which chose new bodies plus one refresh; gap, which facts go on which body; reading taken, a match list under `name-match`, the host under `update-host`, and the account date on every held body; no flaw.
- 2026-11-02: question set: should the details also reach open pull requests — yes, edit the open held bodies once after the merge; Hold lines and labels stay.
- 2026-11-02: question set: which work — both candidate rows, as M073 and M074.
- 2026-11-02: collision check: absorbs candidate row "Show hold details in bot pull requests"; the row "Close gaps in bot holds and merges" stays apart; D-033 and D-042 stand, since no hold rule changes here.
- 2026-11-02: inbox sweep: 0 open issues; 61 open bot pull requests propose entries and none overlaps this work, beyond being what the refresh edits; nothing written to GitHub at plan.
- 2026-11-02: plan gate chose a kept `pnpm refresh-holds` command over a throwaway script because the run comes after the merge, maybe in another session, and a kept command gets tests; falsified by the command never running again and its upkeep costing more than a script would.
- 2026-11-02: plan gate chose to carry the details in the handoff over working them out in the write job because the write job has no index names and the read job already reads the account; falsified by a detail field that the write job cannot trust after `entrySchema` bounds it.
- 2026-11-02: lessons used: 2026-10-25 (M001), 2026-10-26 (M010), 2026-10-26 (M018), 2026-10-28 (M036).
- 2026-11-02: criteria audit (reduced, fresh Opus reader): 5 findings, all fixed: AC1 now allows an entry with no name; AC2's date sentence is scoped to `body()`, and AC4 now says what a failed read does in a refresh, so a refresh cannot overwrite a good date; AC4 names a second-page case and a head-branch skip; AC7 now says "gains one entry", since `## Unreleased` already holds entries. No proportionality or instrument finding.
- 2026-11-02: audit note answered: the `--apply` run after the merge has no criterion, since review ticks criteria before the merge; it stays in Scope, as M071's after-merge steps did, and the close block gives the count.
- 2026-11-02: T1 done: `matchedEntries` now decides both the `name-match` reason and `holdDetails`; a matched entry whose repo the handoff would refuse counts in `moreMatches`, so one odd entry cannot refuse a whole handoff; verify clean.
- 2026-11-02: T2 done: `holdDetails` rides on the drafted entry, the written item, and `planned()`, and `entrySchema` bounds it; `REPO` moved to `holds.ts`; verify clean.
- 2026-11-02: T3 done: `body()` writes `DETAILS_HEADING` and `holdDetailLines` after the reason sentences; one line per fact, with each repo as a link; verify clean.
- 2026-11-02: T4 done: `pnpm refresh-holds [--apply]` shares `botPullProblem`, `newEntry`, and `contents` with `pnpm merge-discover`; it looks for the Hold line and detail heading from the body's end, so quoted check output cannot pose as them; verify clean.

## Decisions

## Review
