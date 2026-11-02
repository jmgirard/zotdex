# M077: Hold update files that leave owner sites

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the README documents the holds, and bot pull request bodies state them
- **Branch/PR:** m077-update-files-leaving-sites

## Goal

The bot holds a pull request whose update file leaves the repo owner's `<owner>.github.io` site by a redirect, or is read over plain http.

## Scope

**In:** The reader gives each URL of the update file read, outside the published facts. The `update-host` hold uses it for the redirect rule and the `http:` rule (D-047). The hold's details and `pnpm refresh-holds` give the facts. `HOLD_TEXT`, README, DESIGN, and CHANGELOG state the rules. After the merge, `pnpm refresh-holds --apply` updates the open held pull requests, as the user chose.

**Out:**
- Reading the update file again at merge time or after listing: a hold reads once, at the draft. Row "Close gaps in bot holds and merges", item (8).
- Testing the redirects of `github.com` and `raw.githubusercontent.com` addresses: they keep passing (D-047).
- A published field for the hosts of the read, or a change to the site's "Host of update.json": no work is planned, since no data user asked for it.
- The merge or close of #142: it stays held by the user's M074 choice, and that choice stays with the maintainer.

## Acceptance criteria

- [x] AC1: In `test/holds.test.ts`, a draft whose `update_url` is an `https:` address on the repo owner's `<owner>.github.io` site gets the `update-host` hold when a redirect of its update file read goes to any other host. The cases are a custom domain as the last host, a custom domain as an earlier host followed by a return to the owner's site, another owner's `.github.io` site, `raw.githubusercontent.com`, and the owner's site with a non-default port. With only `https:` URLs in the read, and with no redirect or a redirect to another path on the same host, the draft gets no `update-host`.
- [x] AC2: In `test/holds.test.ts`, a draft whose `update_url` is an `https:` address on `github.com` or `raw.githubusercontent.com`, with only `https:` URLs in the read, gets no `update-host` when a redirect ends on another host. The cases are `github.com` to `release-assets.githubusercontent.com` and `raw.githubusercontent.com` to another host. A draft whose `update_url` names any other host gets `update-host` when a redirect ends on `raw.githubusercontent.com` and when a redirect ends on the owner's site.
- [x] AC3: In `test/holds.test.ts`, a draft gets `update-host` when any URL of its update file read uses `http:`. The cases are a named `http:` address on `github.com`, on `raw.githubusercontent.com`, and on the owner's site, each with no redirect and each with a redirect to `https:` on its own host. Further cases are an `https:` address on the owner's site that redirects to `http:` on the same host, an `https:` address on `github.com` that redirects to `http:` on another host, and `http:` as a middle step between `https:` URLs.
- [x] AC4: For an `update-host` hold, the details under "Details for the maintainer" give the named host, each other host of the update file read in request order with no repeats, and whether any URL of the read used `http:`. `test/holds.test.ts` checks `holdDetails` from a read that has a repeated host, a return to the named host, and `http:` as a middle step. `test/propose.test.ts` checks these lines in a drafted body. `test/handoff.test.ts` checks that `holdDetails` output from a read with 5 other hosts, each longer than `HOST_MAX`, passes `readHandoff`.
- [x] AC5: `test/refresh-holds.test.ts` checks that `pnpm refresh-holds` works out the lines of AC4 from a new read of the update file through the reader's host check. It also checks that a failed read leaves the body as it is and lists the pull request as failed. The failed reads are a final HTTP error, a rejected request, a refused host, and more than 5 redirects.
- [x] AC6: The published data gets no new field. In `test/upstream.test.ts`, a read whose update file redirects gives the same `facts` as one that does not, and `git diff main -- schemas/ test/fixtures/build` prints nothing.
- [x] AC7: In `README.md`, `cairn/DESIGN.md`, and `src/discover/propose.ts`, each passage that a search for `update-host` or `github.io` finds and that states when the hold applies also states the redirect rule and the `http:` rule. README's list of details gives the new facts, and its `pnpm refresh-holds` text says that the command reads the update file and that a failed read fails the pull request. `CHANGELOG.md` has a new entry that states both rules.
- [x] AC8: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T2
- AC2 → T2
- AC3 → T2
- AC4 → T3
- AC5 → T4
- AC6 → T1
- AC7 → T5
- AC8 → T6

## Tasks

- [x] T1: In `src/upstream/reader.ts`, have `Download` give each URL that `downloader` requested, and have a successful `readUpstream` give the update file read's URLs beside `topics`, outside `UpstreamFacts`, since `build.ts:326` publishes `facts`. Export a function that gives these URLs for one address through the reader's host check. Add the same-`facts` test in `test/upstream.test.ts`.
- [x] T2: Give `holdReasons` the URLs, and have `draftEntry` pass them. Keep the named-host rule, add the owner-site test on every URL, and add the `http:` test. Give `pluginRepo` an optional full update address and redirect answers, as an optional field (lesson 2026-11-02, M075). Write the AC1, AC2, and AC3 cases first, and see those that describe the new holds fail on `main`.
- [x] T3: Add the hosts and the `http:` fact to `HoldDetails`, `holdDetails` (each host cut to `HOST_MAX`), `entrySchema` in `src/discover/handoff.ts`, and `holdDetailLines`. A draft that breaks this schema refuses the whole handoff at `readHandoff`, so test `holdDetails` output, not hand-built values.
- [x] T4: In `src/discover/refresh-holds.ts`, add a `lookup` option to `RefreshOptions`, read the URLs for a pull request held for `update-host`, and record a failed read in `failed`. Add the AC5 tests. Without this read, `--apply` would remove a drafted redirect line.
- [x] T5: Update `HOLD_TEXT["update-host"]`, README's `update-host` bullet, details list, and `pnpm refresh-holds` text, DESIGN's hold sentence, and CHANGELOG. Search the docs on a joined copy, since prose wraps (lesson 2026-10-26, M018).
- [x] T6: Run `pnpm test` and `pnpm check`. By hand, run `pnpm refresh-holds` without `--apply`, and see that #142's lines name `forrt.org` while that address still redirects. Record the result in the work log.
- [ ] T7: At review, after the merge, run `pnpm refresh-holds --apply`, read each edited body back, and confirm that each Hold line and label stayed the same, as M073 did.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — it changes running code and holds a rule choice, and the README documents the named-host rule as it works now, so no documented behavior is restored.
- 2026-11-02: idea vet: gap — a final-host compare on every address would hold the listed plugins whose `github.com` address ends on `release-assets.githubusercontent.com` (374 of 671, read 2026-11-02) and would release a named outside host that redirects to GitHub; reading taken: keep the named-host rule and test redirects only for an owner's site. gap — the last host or every host of the read; reading taken: every host, as the title says "leave". gap — plain http, which the row names and no listed plugin or open pull request uses; another reading also fit, so the set asked, and the answer was to hold http too. No flaw found.
- 2026-11-02: lessons used: 2026-11-02 (M074) request the real URLs; 2026-11-02 (M075) optional `pluginRepo` fields; 2026-10-26 (M018) search a joined copy.
- 2026-11-02: collision check: this absorbs candidate row "Hold update files that leave owner sites"; M074 shipped the owner-site pass and D-044 named this gap; no standing rejection.
- 2026-11-02: inbox sweep: 0 open issues; 61 open bot pull requests, of which #142 overlaps and stays held by its M074 choice, and 60 have no overlap; no disposition needed beyond the absorbed row, which already cites #142.
- 2026-11-02: question set: hold plain http as well as redirects — yes, hold http too.
- 2026-11-02: question set: run `pnpm refresh-holds --apply` on open held pull requests after the merge — yes; 7 of the 15 pull requests held for their update host would gain a line, read 2026-11-02.
- 2026-11-02: criteria audit (full): fresh Opus reader returned 8 findings, all fixed: AC1 and AC2 limited to `https:`-only reads where they conflicted with the `http:` rule; `raw.githubusercontent.com` case added to AC2; AC3's positions widened; "longest" defined, with a test on `holdDetails` output and on derived order; failed reads named in AC5, which split from AC4; `lookup` option added to T4; a same-`facts` test added to AC6; AC7 restated as a property of the docs, with the README details and refresh text added.
- 2026-11-02: plan gate chose keeping the read's URLs beside `topics` over a new field in the v1 data, because no data user asked and D-006's optional fields stay open later; falsified by a data user asking for the hosts of an update read.
- 2026-11-02: plan gate chose testing every URL of the read over the last host, because a host on the way can change where the read goes at any time; falsified by maintainers releasing such holds whose redirect stays on hosts GitHub serves.
- 2026-11-02: plan gate chose having `pnpm refresh-holds` read the update file over keeping the lines from the old body, because the command works out each fact again and a failed read has a named result; falsified by a run where these reads fail often enough to block the other lines.
- 2026-11-02: sizing: 8 criteria pass the split tripwire by one, and AC8 is the standard verify line; no split, since the reader, hold, details, and refresh changes share one read and ship as one PR.
- 2026-11-02: T1: `readUpstream` gives `updateRoute` beside `topics`, and `readUpdateRoute` reads it for one address; `MAX_REDIRECTS` is now exported for the handoff schema; upstream tests pass.
- 2026-11-02: T2: `holdReasons` applies the redirect and `http:` rules; before the change, the 14 cases that describe new holds failed with `expected [] to deeply equal [ 'update-host' ]`, and the cases that describe no hold passed.
- 2026-11-02: T3, T4: `HoldDetails` gains `updateHosts` and `updateHttp`, and `pnpm refresh-holds` reads the route for an `update-host` hold, so `--apply` keeps these lines; chose the detail line text "Update file redirects to:" and "Update file read used http: yes"; refresh and handoff tests pass.
- 2026-11-02: T5: `HOLD_TEXT`, README, DESIGN, and CHANGELOG state both rules; the writing hook also flags older README and CHANGELOG sentences that this branch did not write, and those stay as they are, since they are outside this scope.
- 2026-11-02: T6: `pnpm test` 1967 passed, 6 skipped; `pnpm check` 671 entries, 0 problems; `pnpm refresh-holds` without `--apply` exits 0, with 10 to edit, 15 unchanged, and 36 skipped; #142's lines name `forrt.org`, and 7 pull requests gain a redirect line; the other 3 to edit (#289, #485, #592) are `name-match` holds whose read facts differ from their bodies.
- 2026-11-02: claim audit: 72 claims read, 2 corrected — CHANGELOG.md, README.md, src/discover/holds.ts, src/discover/propose.ts, src/discover/refresh-holds.ts, src/upstream/reader.ts, test/handoff.test.ts, test/holds.test.ts, test/propose.test.ts, test/refresh-holds.test.ts, test/support/plugin-repo.ts, test/upstream.test.ts; the corrections are `HOLD_TEXT`'s closing clause and the text on what `pnpm refresh-holds` reads; the same reader re-read both, and they hold.
- 2026-11-02: T7 stays open at this handoff, since it runs after the merge at review, by its own wording; `pnpm test` after the corrections: 1967 passed, 6 skipped.
- 2026-11-02: step-7 approval: m077-update-files-leaving-sites approved for merge

## Decisions

## Review

- AC1 evidence: `test/holds.test.ts` "the update file read" passes on 2026-11-02: the 5 "update-host when the owner's site redirects to" cases (custom domain last, custom domain earlier then a return, another owner's site, raw.githubusercontent.com, non-default port) and the 2 "no update-host for the owner's site with" cases (no redirect, another path on the same host). The 5 hold cases failed before the change with `expected [] to deeply equal [ 'update-host' ]` (T2).
- AC2 evidence: same file, passes: "no update-host for github.com to release-assets.githubusercontent.com", "no update-host for raw.githubusercontent.com to another host", and "update-host for another named host that redirects to" raw.githubusercontent.com and to the owner's site.
- AC3 evidence: same file, the 9 "update-host for http:" cases pass: a named `http:` address on github.com, raw.githubusercontent.com, and the owner's site, each with no redirect and with a redirect to `https:` on its host; `https:` to `http:` on the owner's site; `https:` on github.com to `http:` on another host; `http:` between `https:` URLs. All 9 failed before the change (T2).
- AC4 evidence: pass: `test/holds.test.ts` "update-host gives each other host of the read once, in request order, and its http use" (a repeated host, a return to the named host, `http:` as a middle step); `test/propose.test.ts` "an update-host body names the update host, each other host, and its http use"; `test/handoff.test.ts` "takes the update-host details of a read with 5 other hosts over the host limit", which runs `holdDetails` output through `readHandoff`.
- AC5 evidence: `test/refresh-holds.test.ts` passes: "it works out the update-host lines from a new read of the update file", and the 4 failed-read cases (a final HTTP error, a rejected request, a refused host, more than 5 redirects), each with no PATCH and the pull request in `failed`. A hand run without `--apply` on 2026-11-02 printed `forrt.org` for #142.
- AC6 evidence: `test/upstream.test.ts` "a redirected update.json read gives each URL in updateRoute and the same facts" passes; `git diff main -- schemas/ test/fixtures/build` printed 0 lines.
- AC7 evidence: a search of joined copies for `update-host` and `<owner>.github.io` gives 5 hits in README.md, 1 in cairn/DESIGN.md, and 2 in src/discover/propose.ts. The passages that state when the hold applies are README's `update-host` bullet, DESIGN's hold sentence, and `HOLD_TEXT["update-host"]`, and each states both rules. README's details list gives the new facts (README.md:802), and its `pnpm refresh-holds` text says that the command reads the update file's route and that a failed read fails the pull request (README.md:814). `CHANGELOG.md` has a new entry with both rules.
- AC8 evidence: `pnpm test` 1967 passed, 6 skipped, 29 files passed, 1 skipped; `pnpm check` 671 entries, 0 problems (2026-11-02, this head).
- Consistency gate: `cairn_validate` passes, with 1 advisory (8 criteria, recorded in the work log); no principle changed, so no impact report; the profile's slot names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: `pnpm refresh-holds` can remove the only fact that explains a hold when a redirect goes away — follow-up, row "Tighten the refresh-holds update read", parked, promote when a user reports it, since only the maintainer runs this command by hand.
- diff-bug #2: `readUpdateRoute` has no limit on the whole read, so a stalled host costs up to 12 minutes per pull request — fixed f8f2869: fix now, 60-second limit per pull request.
- diff-bug #3: an outside host's failure blocks the other lines of a combined hold — reject, planned change: the plan gate chose this read and named what would prove it wrong, and README states it.
- diff-bug #4: a push during the new wait goes unnoticed, since the read before the PATCH does not compare the head — follow-up, row "Tighten the refresh-holds update read", parked; the gap predates this branch.
- diff-bug #5: open pull requests marked `Hold: none` get neither rule — follow-up, row "Close gaps in bot holds and merges", item (8), low; a read of all 61 open bot pull requests on 2026-11-02 found only #142 leaving an owner site and no `http:` address, and #142 is held. README now says that a pull request drafted earlier keeps its Hold line.
- diff-bug #6: DESIGN's architecture text omits the new read — fixed f8f2869: fix now.
- diff-bug #7: an empty route passes the owner-site test — reject, false: no caller gives `holdReasons` an empty route, since a successful read always holds its first URL, and `refreshHolds` passes `[]` only to `holdDetails`.
- diff-bug #8: repeats are removed before hosts are cut, so two long hosts could print alike — reject, false: `refusal` looks a host up before it enters the route, and a name over 253 characters fails that lookup.
- diff-bug #9: the CHANGELOG entry is out of order — fixed f8f2869: fix now.
- diff-bug #10: test rows that run one code path, in AC1, AC2, AC3, and AC5 — reject, planned change: the criteria name each row, after the criteria audit asked for them.
- diff-bug #11: `test/upstream.test.ts` repeats a route check, a backtick host adds nothing in `test/propose.test.ts`, and two comments restate code — fixed f8f2869: fix now for the first two; reject the comments, style, as they match each file's helper comments.
- blame-history #1: same as diff-bug #5 — follow-up, as there.
- blame-history #2: `pnpm refresh-holds` reads again, against D-047's "The read happens once, at the draft" — fixed f8f2869: fix now, D-048 and README wording.
- blame-history #3: README's "A failed read of these" contradicts the account read's failure — reject, false: "these" names the `name-match` reads of the sentence before it.
- blame-history #4: `pnpm refresh-holds` now requests third-party hosts from the maintainer's machine — reject, planned change: the plan called for it, and README and DESIGN state it. It sends no GitHub token there.
- blame-history #5: `HOLD_TEXT` is hard to parse — reject, style: it lists three alternatives with "or", and each is true of the code.
- blame-history #6: `handoff.ts` imports `MAX_REDIRECTS` from the reader — reject, style: `holds.ts`, which `handoff.ts` imports, already imports the reader.
- prior-review #1: the new read adds network time to a run with no whole-run limit — fixed f8f2869: fix now through diff-bug #2's limit per pull request; the whole-run limit stays dropped by D-046.
- prior-review #2: after a 429 from an update host, the loop still requests other update hosts — reject, false: M075's stop guards one shared GitHub budget, and each update host here is another party.
- ripple #1: CHANGELOG's M074 entry says that an owner-site host gets no hold — fixed f8f2869: fix now.
- ripple #2: README's list of what `pnpm refresh-holds` reads reads as complete — reject, false: the next sentences add to it with "also".
- ripple #3: the candidate row describes the old gap — reject, planned change: post-merge hygiene removes the row.
- ripple #4: CHANGELOG's M073 entry names only "the host of an `update-host`" — reject, false: it stays true, and the new entry adds the other facts.
- ripple #5: DESIGN says `readUpstream` returns the facts and topics alone — fixed f8f2869: fix now.
- ripple #6: README's "First update your checkout" now follows the route text — reject, style: it still names the match lines.
- ripple #7: README's "does not check the redirects" can be read against the reader's host check — fixed f8f2869: fix now, "This hold does not test".
- ripple #8: README's "it reads the file once" — fixed f8f2869: fix now, with blame-history #2.
- ripple #9: no doc says that open pull requests are not judged again — fixed f8f2869: fix now in README.
- AC8 evidence after the fixes: `pnpm test` 1968 passed, 6 skipped; `pnpm check` 671 entries, 0 problems; `cairn_validate` passes.
- snapshot files changed: none. Open-PR cap: 0 of your open PRs against a feature cap of 1. No open PR, so no conversation read.
