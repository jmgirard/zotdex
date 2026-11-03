# M084: Read the last merged plugins for paid services

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — a mark from this read shows to visitors, with no code change
- **Branch/PR:** m084-paid-service-third-read

## Goal

Mark each plugin merged since the second paid service read whose main use needs a paid service from its maker, by the same read by hand.

## Scope

**In:** one read of the 7 entries added between `34a02a8` and `1b2cebf`, recorded in `cairn/references/paid-service-sweep.md`, with `paidService` written on each entry that the read marks.

**Out:** later plugins (candidate row "Read new plugins for paid services", narrowed at this milestone's hygiene). Any change to the rule (D-054), the schema, the site, or the docs outside `cairn/`. The site build, which runs after the merge at the user's request.

## Acceptance criteria

- [x] AC1: `cairn/references/paid-service-sweep.md` gains a "Third read" section for the 7 entries that `git diff --name-only --diff-filter=A 34a02a8 1b2cebf -- plugins/` lists as added `meta.json` files, and its Scope names all three reads and states that a plugin added after `1b2cebf` has not been read. The section uses the page's word list and matching rule over each entry's `meta.json` description at `1b2cebf`, its GitHub About text as read on a read date that the section names, and each top-level file whose name starts with README, ignoring case, at a default-branch SHA that the section records for that entry. It records each entry's SHA and its About text, or "none", lists each entry with a hit with a verdict and a one-clause reason, and names each text that could not be read.
- [x] AC2: Each recorded SHA is a commit on the repo's default branch, and each recorded About text equals GitHub's at review or the section names the change. A re-run of the word list over the recorded About texts, the READMEs at the recorded SHAs, and the same `meta.json` files reports no entry with a hit that the section does not list. The entries the section marks are exactly the entries of those 7 with `paidService` at the branch head, and each `read` equals the section's read date, compared by a one-time script at review. For each marked entry, `source` answers HTTP 200 to a script or, where a script is blocked, loads in the browser pane, and a review read finds that the page states what `note` says and that this meets the rule on the About page: the plugin's main use stops without paying its maker, or stops after a trial.
- [x] AC3: `git diff --name-status main...HEAD -- . ':!cairn/'` lists only `M` lines on `index.json` files of those 7 entries, each differing from the merge base only by an added `paidService`, compared by the same script. `pnpm test` and `pnpm check` pass at the branch head.

## Coverage

- AC1 → T1
- AC2 → T1, T2
- AC3 → T2

## Tasks

- [x] T1: Read the 7 entries by AC1's procedure, with the earlier reads' rule and verdict wording. Write the "Third read" section and the Scope lines.
- [x] T2: Write `paidService` on each marked entry, with an English `note` of one sentence, a `source` that states it, and the section's read date. Where a page does not show that payment is needed, the entry gets no mark. Run `pnpm test` and `pnpm check`. At review, a fresh reader re-reads every verdict of no mark, and a wrong one is a finding.

## Work log

- 2026-11-03: created by /milestone-plan from candidate row "Read new plugins for paid services", absorbed in part: this milestone reads the entries of one commit, and the row keeps later plugins.
- 2026-11-03: tier check: milestone — it can write a field that the site shows, so it has a runtime surface.
- 2026-11-03: idea vet: no flaw. Gap, an entry can be marked wrongly: the rule (D-054) and the source check apply. Gap, plugins added later stay unread: the row keeps them, and the About page says a plugin with no mark can still cost money.
- 2026-11-03: lessons used: 2026-11-02 (M082, used M083) GraphQL batches; 2026-11-02 (M082, used M083) reading a test run's exit code; 2026-10-31 (M066, used M083) a merge deploys nothing.
- 2026-11-03: inbox sweep: 0 open issues and 0 open pull requests.
- 2026-11-03: collision check: M082 and M083 read other entries, so this extends them; D-054 sets the rule and is not changed.
- 2026-11-03: criteria audit (full mode, fresh Opus reader): 3 findings, all fixed: the Scope's last-read commit in AC1, the recorded SHAs and About texts checked in AC2, and the no-mark re-read kept in T2 as a review procedure.
- 2026-11-03: question set: none posed; the user asked for this read, and the rule and scope are settled.
- 2026-11-03: T1 done: 7 entries read, 10 READMEs read at recorded SHAs, 3 with a hit, 0 marked.
- 2026-11-03: T2 done: the read marks no entry, so no `paidService` is written and the branch changes nothing outside `cairn/`.
- 2026-11-03: claim audit: not owed — no added lines outside cairn/

## Decisions

## Review

Evidence read on 2026-11-03 at `cdea3af`, level with `origin/main`.

- AC1: the "Third read" section names the read date, the word list and rule, and the three texts, records 7 rows of entry, SHA, and About text, lists 3 hits with verdicts, and says that every text was read. The page's Scope names all three reads and says that a plugin added after `1b2cebf` has not been read. A script found the 7 rows equal to the `git diff --diff-filter=A` list.
- AC2: the script found each recorded SHA identical to its repo's default-branch head and each About text equal to GitHub's. Its re-run over those texts, the 10 READMEs, and the `meta.json` files found 3 hits, all listed, none unlisted. The section marks no entry, and none of the 7 has `paidService`, so no `read` date or `source` is left to check. A fresh Opus reader found that the 3 verdicts of no mark hold and that the 4 entries with no hit show no maker's paid service.
- AC3: the script found `git diff --name-status origin/main...HEAD -- . ':!cairn/'` empty. `pnpm test` exits 0 with 2173 passed and 6 skipped, and `pnpm check` reports 736 entries and 0 problems.
- Consistency gate: `cairn_validate.py` exits 0; the profile names no toolchain checks; no principle changed.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: the Extraction line says only 2026-11-02 — fix now.
- diff-bug #2: the row still says reads stop at `34a02a8` — reject, false: step 9's hygiene narrows it.
- diff-bug #3: the `zotero-ai-collection` reason leaves out its trial hit — fix now.
- diff-bug #4: the `zotero-tray` reason leaves out its register hit — fix now.
- diff-bug #5: 2026-11-03 is the UTC date — reject, style: the date stays a true read date.
- diff-bug #6: one Scope line is long — fix now.
- blame-history #1: same row as diff-bug #2 — reject, false.
- blame-history #2: the Scope's count changed — reject, false: it reports the intended extension.
- prior-review #1: T1 and T2 are ticked before the re-read — reject, false: the re-read is the review procedure recorded here.
- prior-review #2: the session read the hits itself — reject, false: a fresh reader re-read all 7 at this review.
- prior-review #3: the verdicts rest on README and About text — reject, false: D-054's read gives no mark where a page names no payment.
- prior-review #4: the claim audit is not owed — reject, false: it reports that the line holds.
- ripple #1: same row as diff-bug #2 — reject, false.
- ripple #2: same as diff-bug #1 — fix now.
- ripple #3: "Texts read" covers only the first read — reject, false: the Scope says that the sections before "Second read" hold the first read.
- fresh reader #1: three reasons leave some hits unexplained — fix now, including `zhinfo`'s register hit.
- fresh reader #2: `zhinfo`'s PDF route needs a third-party LLM key — reject, false: it is not the main use, and a third party's key gets no mark.
- fresh reader #3: same as diff-bug #5 — reject, style.
