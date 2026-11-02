# M074: Allow owner GitHub Pages update hosts

- **Status:** in-progress
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

- [ ] AC1: `holdReasons` gives no `update-host` for a repo whose update host is `<owner>.github.io`, where `<owner>` is the repo's owner. Tests in `test/holds.test.ts` show no holds at all from `draftEntry` for `bob/zotero-tagger` with `bob.github.io`, `Juris-M/zotero-odf-scan-plugin` with `juris-m.github.io`, and `forrtproject/flora-zotero` with `forrtproject.github.io`, and no `update-host` from a direct `holdReasons` call with `repo` `Bob/zotero-tagger` and `updateHost` `BOB.github.io`.
- [ ] AC2: `holdReasons` still gives `update-host` in tests for `bob/zotero-tagger` with `alice.github.io`, `bob.github.io:8443`, `sub.bob.github.io`, `bob.evil.github.io`, `bobx.github.io`, `bob-x.github.io`, `bob.github.io.example.org`, `bob.gitlab.io`, and `github.io`. The existing github.com with a port case stays.
- [ ] AC3: `HOLD_TEXT["update-host"]`, the README's `update-host` bullet, and DESIGN's hold sentence name the owner's `<owner>.github.io` site among the allowed hosts. `CHANGELOG.md` gains one entry under `## Unreleased`. `pnpm test` and `pnpm check` exit 0.

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

## Decisions

## Review
