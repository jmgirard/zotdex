# M083: Read the merged plugins for paid services

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — it adds marks that visitors see, with no code change
- **Branch/PR:** m083-paid-service-second-read

## Goal

Mark each plugin merged since the first paid service read whose main use needs a paid service from its maker, by the same read by hand.

## Scope

**In:** one read of the 34 entries that `34a02a8` adds since `c8f2b65`, recorded in `cairn/references/paid-service-sweep.md`, with `paidService` written on each entry that the read marks.

**Out:** the 7 open bot pull requests and later plugins (candidate row "Read new plugins for paid services", narrowed at this milestone's hygiene). A listing command (same row). Any change to the rule (D-054), the schema, the site, or the docs outside `cairn/`. The site build, which runs after the merge at the user's request.

## Acceptance criteria

- [x] AC1: `cairn/references/paid-service-sweep.md` gains a "Second read" section for the 34 entries that `git diff --name-only --diff-filter=A c8f2b65 34a02a8 -- plugins/` lists as added `meta.json` files, and its Scope names both reads. The section uses the page's word list and matching rule over each entry's `meta.json` description at `34a02a8`, its GitHub About text as read on a read date that the section names, and each top-level file whose name starts with README, ignoring case, at a default-branch SHA that the section records for that entry. It records each entry's SHA and its About text, or "none", lists each entry with a hit with a verdict and a one-clause reason, and names each text that could not be read.
- [x] AC2: A re-run of the word list over the recorded About texts, the READMEs at the recorded SHAs, and the same `meta.json` files reports no entry with a hit that the section does not list. The entries the section marks are exactly the entries of those 34 with `paidService` at the branch head, and each `read` equals the section's read date, compared by a one-time script at review. For each marked entry, `source` answers HTTP 200 to a script or, where a script is blocked, loads in the browser pane, and a review read finds that the page states what `note` says and that this meets the rule on the About page: the plugin's main use stops without paying its maker, or stops after a trial.
- [x] AC3: `git diff --name-status main...HEAD -- . ':!cairn/'` lists only `M` lines on `index.json` files of those 34 entries, each differing from the merge base only by an added `paidService`, compared by the same script. `pnpm test` and `pnpm check` pass at the branch head.

## Coverage

- AC1 → T1
- AC2 → T1, T2
- AC3 → T2

## Tasks

- [x] T1: Read the 34 entries by AC1's procedure, with the first read's rule and verdict wording. Write the "Second read" section and the Scope line.
- [x] T2: Write `paidService` on each marked entry, with an English `note` of one sentence, a `source` that states it, and the section's read date. Where a page does not show that payment is needed, the entry gets no mark. Run `pnpm test` and `pnpm check`. At review, a fresh reader re-reads every verdict of no mark, and a wrong one is a finding.

## Work log

- 2026-11-02: created by /milestone-plan from candidate row "Read new plugins for paid services", absorbed in part: this milestone reads the entries of one commit, and the row keeps later plugins.
- 2026-11-02: tier check: milestone — it writes a field that the site shows, so it has a runtime surface.
- 2026-11-02: idea vet: no flaw. Gap, an entry can be marked wrongly: the first read's rule (D-054) and its source check apply. Gap, plugins still open or added later stay unread: the row keeps them, and the About page says a plugin with no mark can still cost money.
- 2026-11-02: lessons used: 2026-11-02 (M082) GraphQL batches; 2026-11-02 (M082) reading a test run's exit code; 2026-10-31 (M066) a merge deploys nothing.
- 2026-11-02: inbox sweep: 0 open issues and 7 open bot pull requests, none overlapping, since this scope names merged entries only.
- 2026-11-02: collision check: M082 shipped the first read over other entries, so this extends it; D-054 sets the rule and is not changed.
- 2026-11-02: criteria audit (full mode, fresh Opus reader): 8 findings, all fixed: About text recorded with "none" for an empty one, a named read date, the page's Scope, entries in place of lines in AC2, the `read` date compared, the merge base in AC3, and a re-read of every no-mark verdict moved to T2 as a review procedure. The reader confirmed the count of 34.
- 2026-11-02: question set: none posed; the user asked for this read, and the rule and scope are settled.
- 2026-11-02: plan chose a second section in the existing page over a new page, so one record holds the word list and both reads; falsified by the page outgrowing a reader's use.
- 2026-11-02: T1 done: 34 entries read, 44 READMEs read at recorded SHAs, 17 with a hit, 0 marked. The session read the hits itself, since few were left; `paper-chat@zotero.plugin` was the nearest call, and its README offers the user's own provider key beside the maker's service.
- 2026-11-02: T2 done: the read marks no entry, so no `paidService` is written and the branch changes nothing outside `cairn/`. The site gains no mark from this milestone, which is what the read found.
- 2026-11-02: claim audit: not owed — no added lines outside cairn/
- 2026-11-02: step-7 approval: m083-paid-service-second-read approved for merge

## Decisions

## Review

Evidence read on 2026-11-02 at `cc26bf3`, level with `origin/main`.

- AC1: the "Second read" section names the read date, the word list and rule, and the three texts, records 34 rows of entry, SHA, and About text or "none", lists 17 hits with verdicts, and says that every text was read; the page's Scope names both reads. A script found the 34 rows equal to the `git diff --diff-filter=A` list.
- AC2: a script took the word list and rows from the page, the `meta.json` files from `34a02a8`, and the READMEs from the recorded SHAs, read 44 READMEs, and found 17 hits, all listed, none unlisted. The section marks no entry, and none of the 34 has `paidService`, so no `read` date or `source` is left to check. A fresh Opus reader found that all 17 verdicts of no mark hold and that the 17 entries with no hit show no maker's paid service.
- AC3: the same script found `git diff --name-status origin/main...HEAD -- . ':!cairn/'` empty. `pnpm test` exits 0 with 2173 passed and 6 skipped, and `pnpm check` reports 729 entries and 0 problems.
- Consistency gate: `cairn_validate.py` exits 0; the profile names no toolchain checks; no principle changed.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: "the 34 entries that `34a02a8` adds" reads as one commit adding them — fix now.
- diff-bug #2: DESIGN says the page records the read at one commit — fix now.
- diff-bug #3: the page's title and Provenance name only M082 — fix now.
- diff-bug #4: the header says this adds marks, and none were added — reject, planned change: the slot was written before the read and states the tier.
- diff-bug #5: T2 is ticked before its review re-read — reject, false: the re-read is the review procedure that this section records.
- diff-bug #6: the reason for `paper-chat@zotero.plugin` omits that PPT generation needs the maker's service — fix now.
- diff-bug #7: the bluebook About text drops two trailing spaces — reject, style: no hit changes.
- blame-history #1: the session read the hits itself, where the first read used three readers — reject, false: AC1 names the rule and not who reads, and a fresh reader re-read all 34 at this review.
- blame-history #2: the count of 17 with no hit cannot be checked — reject, false: the 34 rows less the 17 listed give it.
- blame-history #3: the page's 7 marks against 6 listed — reject, false: the paragraph after it says why.
- blame-history #4 and #5: no contradiction with D-054, and the Scope removes nothing — reject, false: each reports no defect.
- prior-review #1: same as blame-history #1 — reject, false.
- prior-review #2: the verdicts rest on README text, the gap M082 closed for Immersive Translate — reject, false: M082 read a pricing page to confirm a mark, and D-054's read gives no mark where a page names no payment.
- prior-review #3: the claim audit was skipped — reject, false: the step owes it only for added lines outside `cairn/`, and there are none.
- prior-review #4: the SHAs sit inline, not in the first read's file — reject, planned change: AC1 has the section record them.
- ripple #1: same as diff-bug #2 — fix now.
- ripple #2: "Texts read" reads as the whole page — fix now, the Scope says which sections hold the first read.
- ripple #3: the row says later plugins carry no mark — reject, false: step 9's hygiene narrows it to the plugins after `34a02a8`.
- ripple #4: same as diff-bug #3 — fix now.
- ripple #5: the INDEX line names only M082 — fix now.
- fresh reader #1: `bilingual-reader@local` needs no activation code only since 0.3.4 — fix now, the reason says so.
- fresh reader #2: same as diff-bug #6 — fix now.
- fresh reader #3: the reason for `zotero-mineru@example.com` omits its MinerU token — fix now.
- fresh reader #4: the bluebook root README only summarizes the plugin, and its subfolder README has no pay words — reject, false: the verdict holds.
- Every fix-now line above: fixed `1734385`, which changes `cairn/` text only; `cairn_validate.py` exits 0 there, and no verdict or row changed, so the evidence stands.
- Findings: 25, with 11 fixed, 14 rejected, 0 sent to a follow-up. Substantive amendments: 0. Changed snapshot files: 0. No PR is open, so no PR conversation was read.
