# M077: Hold update files that leave owner sites

- **Status:** in-progress
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

- [ ] AC1: In `test/holds.test.ts`, a draft whose `update_url` is an `https:` address on the repo owner's `<owner>.github.io` site gets the `update-host` hold when a redirect of its update file read goes to any other host. The cases are a custom domain as the last host, a custom domain as an earlier host followed by a return to the owner's site, another owner's `.github.io` site, `raw.githubusercontent.com`, and the owner's site with a non-default port. With only `https:` URLs in the read, and with no redirect or a redirect to another path on the same host, the draft gets no `update-host`.
- [ ] AC2: In `test/holds.test.ts`, a draft whose `update_url` is an `https:` address on `github.com` or `raw.githubusercontent.com`, with only `https:` URLs in the read, gets no `update-host` when a redirect ends on another host. The cases are `github.com` to `release-assets.githubusercontent.com` and `raw.githubusercontent.com` to another host. A draft whose `update_url` names any other host gets `update-host` when a redirect ends on `raw.githubusercontent.com` and when a redirect ends on the owner's site.
- [ ] AC3: In `test/holds.test.ts`, a draft gets `update-host` when any URL of its update file read uses `http:`. The cases are a named `http:` address on `github.com`, on `raw.githubusercontent.com`, and on the owner's site, each with no redirect and each with a redirect to `https:` on its own host. Further cases are an `https:` address on the owner's site that redirects to `http:` on the same host, an `https:` address on `github.com` that redirects to `http:` on another host, and `http:` as a middle step between `https:` URLs.
- [ ] AC4: For an `update-host` hold, the details under "Details for the maintainer" give the named host, each other host of the update file read in request order with no repeats, and whether any URL of the read used `http:`. `test/holds.test.ts` checks `holdDetails` from a read that has a repeated host, a return to the named host, and `http:` as a middle step. `test/propose.test.ts` checks these lines in a drafted body. `test/handoff.test.ts` checks that `holdDetails` output from a read with 5 other hosts, each longer than `HOST_MAX`, passes `readHandoff`.
- [ ] AC5: `test/refresh-holds.test.ts` checks that `pnpm refresh-holds` works out the lines of AC4 from a new read of the update file through the reader's host check. It also checks that a failed read leaves the body as it is and lists the pull request as failed. The failed reads are a final HTTP error, a rejected request, a refused host, and more than 5 redirects.
- [ ] AC6: The published data gets no new field. In `test/upstream.test.ts`, a read whose update file redirects gives the same `facts` as one that does not, and `git diff main -- schemas/ test/fixtures/build` prints nothing.
- [ ] AC7: In `README.md`, `cairn/DESIGN.md`, and `src/discover/propose.ts`, each passage that a search for `update-host` or `github.io` finds and that states when the hold applies also states the redirect rule and the `http:` rule. README's list of details gives the new facts, and its `pnpm refresh-holds` text says that the command reads the update file and that a failed read fails the pull request. `CHANGELOG.md` has a new entry that states both rules.
- [ ] AC8: `pnpm test` and `pnpm check` pass.

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
- [ ] T3: Add the hosts and the `http:` fact to `HoldDetails`, `holdDetails` (each host cut to `HOST_MAX`), `entrySchema` in `src/discover/handoff.ts`, and `holdDetailLines`. A draft that breaks this schema refuses the whole handoff at `readHandoff`, so test `holdDetails` output, not hand-built values.
- [ ] T4: In `src/discover/refresh-holds.ts`, add a `lookup` option to `RefreshOptions`, read the URLs for a pull request held for `update-host`, and record a failed read in `failed`. Add the AC5 tests. Without this read, `--apply` would remove a drafted redirect line.
- [ ] T5: Update `HOLD_TEXT["update-host"]`, README's `update-host` bullet, details list, and `pnpm refresh-holds` text, DESIGN's hold sentence, and CHANGELOG. Search the docs on a joined copy, since prose wraps (lesson 2026-10-26, M018).
- [ ] T6: Run `pnpm test` and `pnpm check`. By hand, run `pnpm refresh-holds` without `--apply`, and see that #142's lines name `forrt.org` while that address still redirects. Record the result in the work log.
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

## Decisions

## Review
