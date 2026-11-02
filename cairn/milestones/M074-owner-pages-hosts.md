# M074: Allow owner GitHub Pages update hosts

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — it changes which plugins reach the public index without a person's look
- **Branch/PR:** m074-owner-pages-hosts

## Goal

The bot no longer holds a pull request whose `update.json` is on the repo owner's own `<owner>.github.io` site.

## Scope

**In:**
- In `holdReasons`, allow the host `<owner>.github.io`, where `<owner>` is the repo's owner.
- `HOLD_TEXT["update-host"]`, README, DESIGN, and CHANGELOG text. D-043 records the rule and lands with this plan.
- After the merge, release #473, #142, #468, #510, and #753. Read each one first, and go on only if it is open, its Hold line is exactly `Hold: update-host`, and its `update_url` host is its owner's `<owner>.github.io`. Change its hold text to `Hold: none` and `UNHELD_TEXT`, with any detail lines removed, and remove its `hold` label. Read each one back and name each result in the close block. The daily merge job then merges it, after `pnpm check`. The user granted this at the question set.

**Out:**
- Other update hosts, such as Gitee, jsDelivr, S3, or an author's own domain → they stay held for the maintainer, as D-033 says; no row, since nothing asks to change that.
- Another owner's `.github.io` site → it stays held.
- Details in held pull request bodies → M073.
- Waiting for the daily merge job to merge the five → it runs after this milestone closes, and a pull request that fails `pnpm check` stays open for the maintainer.

## Acceptance criteria

- [x] AC1: `holdReasons` gives no `update-host` for a repo whose update host is `<owner>.github.io`, where `<owner>` is the repo's owner. Tests in `test/holds.test.ts` show no holds at all from `draftEntry` for `bob/zotero-tagger` with `bob.github.io`, `Juris-M/zotero-odf-scan-plugin` with `juris-m.github.io`, and `forrtproject/flora-zotero` with `forrtproject.github.io`, and no `update-host` from a direct `holdReasons` call with `repo` `Bob/zotero-tagger` and `updateHost` `BOB.github.io`.
- [x] AC2: `holdReasons` still gives `update-host` in tests for `bob/zotero-tagger` with `alice.github.io`, `bob.github.io:8443`, `sub.bob.github.io`, `bob.evil.github.io`, `bobx.github.io`, `bob-x.github.io`, `bob.github.io.example.org`, `bob.gitlab.io`, and `github.io`. The existing github.com with a port case stays.
- [x] AC3: `HOLD_TEXT["update-host"]`, the README's `update-host` bullet, and DESIGN's hold sentence name the owner's `<owner>.github.io` site among the allowed hosts. `CHANGELOG.md` gains one entry under `## Unreleased`. `pnpm test` and `pnpm check` exit 0.

## Coverage

- AC1 → T1
- AC2 → T1
- AC3 → T2

## Tasks

- [x] T1: In `src/discover/holds.ts:68`, compare `facts.updateHost` with the owner's site, in lowercase on both sides. In `test/support/plugin-repo.ts`, key the `/users/<owner>` answer in lowercase, since `repoName` lowercases the owner. Add the `test/holds.test.ts` cases of AC1 and AC2.
- [x] T2: Write the `HOLD_TEXT`, README, DESIGN, and CHANGELOG text, and wrap it near 76 columns. Run the verify slot.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: not run — work named at the question set
- 2026-11-02: idea vet: gap, the new rule applies only when the bot opens a pull request, so the five open ones held only for this stay held; sent to the question set, which chose to release them; gap, whether "owner" covers an organization and letter case; reading taken, the repo's owner of any kind, in any case; no flaw, since only the owner can publish to that site and `raw.githubusercontent.com` already passes for any owner.
- 2026-11-02: question set: what happens to the 5 open pull requests held only for this reason — release them after the merge (remove the `hold` label, set `Hold: none`) so the daily merge job merges each that passes `pnpm check`.
- 2026-11-02: question set: which work — both candidate rows, as M073 and M074.
- 2026-11-02: collision check: absorbs candidate row "Allow owner GitHub Pages update hosts"; D-033 holds an update host outside GitHub, so D-043 annotates it; D-042 stands.
- 2026-11-02: inbox sweep: 0 open issues; of 61 open bot pull requests, 5 are the ones to release and the rest do not overlap; nothing written to GitHub at plan.
- 2026-11-02: plan gate chose to release the five with one-time body and label edits over a re-check inside `pnpm merge-discover` because the case is one batch and the merge job's Hold line rule stays simple; falsified by a later hold rule change that again leaves many open pull requests to release.
- 2026-11-02: lessons used: 2026-10-25 (M001), 2026-10-26 (M018), 2026-10-28 (M036).
- 2026-11-02: criteria audit (full, fresh Opus reader): 5 findings, all fixed: AC1's spelled-host case 404s in `pluginRepo`, so letter case moved to a direct `holdReasons` call; `pluginRepo` keys `/users/<owner>` in the raw case, so T1 keys it in lowercase and AC1 expects no holds; draft-only cases cannot catch lost lowercasing, fixed by the same direct call; AC2 gained `bobx`, `bob-x`, and `bob.evil` hosts against a prefix-and-suffix defect; AC3 now says "gains one entry", since `## Unreleased` already holds entries. The reader also read the five pull requests: each has exactly `Hold: update-host` and its owner's site as host.
- 2026-11-02: audit note answered: the release after the merge has no criterion, since review ticks criteria before the merge; it stays in Scope, as M071's after-merge steps did, and the close block names each result.
- 2026-11-02: T1 done: `holdReasons` passes the owner's `<owner>.github.io` host in lowercase on both sides, `pluginRepo` keys `/users/<owner>` in lowercase, and `test/holds.test.ts` has the AC1 and AC2 cases; the 4 owner-site cases failed with `update-host` before the rule. Choice: the host compare stays inline in `holdReasons`, with no new exported helper.
- 2026-11-02: T2 done: `HOLD_TEXT["update-host"]`, README, DESIGN, and one CHANGELOG entry name the owner's site. Choice: `HOLD_TEXT` puts `<owner>.github.io` in a code span, since a pull request body would read a bare `<owner>` as an HTML tag and drop it.
- 2026-11-02: the simple-english lint hook flagged 3 README lines and 8 CHANGELOG lines; none is a line this branch adds, so they stay as they are, outside this milestone's scope; the one hit on a new CHANGELOG line is fixed.
- 2026-11-02: claim audit in progress: the fresh reader found 1 of 13 claims wrong, the `holds.ts` comment that only the owner can publish to its Pages site; the comment is corrected and D-044 annotates D-043; the reader's re-read of that comment is still pending.
- 2026-11-02: claim audit: 13 claims read, 1 corrected — src/discover/holds.ts
- 2026-11-02: the reader's re-read found the corrected comment true; GitHub's Pages docs, read this session, say a project site is at `<owner>.github.io/<repositoryname>` and that a push to the source branch publishes it, so a person who can push can publish. The reader also changed `GITHUB_HOSTS`' comment to "fixed hosts".
- 2026-11-02: open concern for review: the hold reads the host of the declared `update_url`, while `checkUpdateJson` follows redirects, so a `<owner>.github.io` URL that redirects to another domain gets no hold; github.com URLs have the same gap, and the plan does not cover it.
- 2026-11-02: correction of the re-read line above: the implementing session made the `GITHUB_HOSTS` comment change that the reader proposed; the reader edited nothing.
- 2026-11-02: step-7 approval: m074-owner-pages-hosts approved for merge
- 2026-11-02: user override at the merge question: after the merge, release #473, #468, #510, and #753 by Scope's steps; #142 stays held for the maintainer, since its update file redirects to `forrt.org`.

## Decisions

## Review

- AC1 evidence (2026-11-02, branch at ed661e7, main unmoved): `vitest run test/holds.test.ts` passed 38 of 38. The `draftEntry` cases give `[]` for `bob/zotero-tagger` on `bob.github.io`, `Juris-M/zotero-odf-scan-plugin` on `juris-m.github.io`, and `forrtproject/flora-zotero` on `forrtproject.github.io`; the direct `holdReasons` call with `Bob/zotero-tagger` and `BOB.github.io` gives `[]`. Before the rule, these 4 cases failed with `update-host` (T1).
- AC2 evidence (same run): each of `alice.github.io`, `bob.github.io:8443`, `sub.bob.github.io`, `bob.evil.github.io`, `bobx.github.io`, `bob-x.github.io`, `bob.github.io.example.org`, `bob.gitlab.io`, and `github.io` gives exactly `["update-host"]` for `bob/zotero-tagger`, and "update-host for github.com with a port" still passes.
- AC3 evidence (same head): read `HOLD_TEXT["update-host"]` (`src/discover/propose.ts:495`), README's `update-host` bullet (lines 756-759), and DESIGN's hold sentence (lines 232-235); each names the owner's `<owner>.github.io` site. `git diff` shows one new CHANGELOG entry under `## Unreleased`. `pnpm test` exit 0 (1815 passed, 6 skipped); `pnpm check` exit 0 (671 entries, 0 problems).
- Consistency gate: `cairn_validate.py` exit 0, all checks passed; no DESIGN principle changed, so `cairn_impact.py` is skipped; the `generic` profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: `holdReasons` reads only the declared host, and `forrtproject.github.io/flora-zotero/update.json` answers 301 to `forrt.org` (confirmed by `curl -L` in this review; the other 4 of the 5 answer 200 with no redirect), so a domain the owner picked gets no hold — follow-up: candidate row "Hold update files that leave owner sites", normal. It is not a criterion failure, and it is not load-bearing, since the hold is one check on a list that states facts and the one live case can stay held by hand.
- diff-bug #2: the release test in Scope passes #142, and the work log's "github.com URLs have the same gap" has no read behind it, while a Pages redirect goes to a domain the owner picks — fix now: the work-log line is corrected below, and the choice on #142 goes to the merge question.
- diff-bug #3: the `forrtproject` test case answers 200 directly, unlike the live host — reject, planned change: AC1 names that case, and the candidate row covers the redirect.
- diff-bug #4: the `bob` and `forrtproject` positive cases run one path — reject, planned change: AC1 names both.
- diff-bug #5: the 9 negative cases overlap — reject, planned change: AC2 names them all.
- diff-bug #6: the lowercase test uses an input production never sends — reject, planned change: AC1 and T1 name that direct call.
- diff-bug #7: `GITHUB_HOSTS.includes` is case-sensitive beside a lowercase compare — reject, style: `repoName` and `URL.host` lowercase both values, so production cannot reach the difference.
- diff-bug #8: DESIGN's hold sentence has a short line — fix now, fixed d21f064.
- diff-bug #9: the test title "not bob's own site" is loose for the port case — reject, style.
- diff-bug #10: `http://bob.github.io` also passes — follow-up: same candidate row; the hold has never read the scheme.
- diff-bug #11: open pull requests keep the old `HOLD_TEXT` sentence — reject, false: the sentence stays true for each pull request still held, and it requests no action.
- blame-history #1: the rule passes the whole `<owner>.github.io` host, so also another repo's project site — reject, planned change: D-043 and D-044 accept this.
- blame-history #2: the redirect concern is only in the work log, and "a Pages site cannot redirect to another host" — follow-up: same candidate row; the claim is false, since the probe of #142 shows such a redirect.
- blame-history #3: D-043's "no new party" still stands — fix now: D-044 now corrects it, fixed d21f064.
- blame-history #4: the defensive lowercase and its test go beyond `HoldFacts.repo`'s lowercase contract — reject, planned change: AC1 and T1 name them.
- blame-history #5: `pluginRepo` keys `/users/<owner>` in lowercase only — reject, planned change: T1 asks for it, and production requests the lowercase owner.
- blame-history #6: the hold compares the host and never the scheme — follow-up: same candidate row.
- blame-history #7: `refresh-holds.ts:93` skips the http and https check — reject, false: the reader refuses other schemes before any `meta.json` is written, so it has no effect.
- prior-review #1: the redirect gap, against M004's follow-redirects rule — follow-up: same candidate row.
- prior-review #2: DESIGN omits letter case and the other-owner clause that README states — reject, style: DESIGN summarizes, README holds the detail, and AC3 asks DESIGN only to name the site.
- ripple #1: the candidate row "Allow owner GitHub Pages update hosts" still states the old rule — reject, false: the row carries `started M074`, and this merge's hygiene removes it.
- ripple #2: DESIGN's "is not on" can read as the final host after redirects — fix now, fixed d21f064; the CHANGELOG entry took the same wording.
- correction: the implement work log says that github.com URLs have the same redirect gap; no read backs that, and only a Pages custom domain is shown to leave GitHub.
- snapshot list: empty; the branch changes no `_snaps` or `__snapshots__` file.
- verify after fixes (d21f064): `pnpm test` exit 0 (1815 passed, 6 skipped); `pnpm check` exit 0 (671 entries, 0 problems). Findings: 22 in all; 4 fixed on the branch, 5 sent to one candidate row, 13 rejected.
