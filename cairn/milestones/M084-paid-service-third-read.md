# M084: Read the last merged plugins for paid services

- **Status:** planned
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — a mark from this read shows to visitors, with no code change
- **Branch/PR:** —

## Goal

Mark each plugin merged since the second paid service read whose main use needs a paid service from its maker, by the same read by hand.

## Scope

**In:** one read of the 7 entries added between `34a02a8` and `1b2cebf`, recorded in `cairn/references/paid-service-sweep.md`, with `paidService` written on each entry that the read marks.

**Out:** later plugins (candidate row "Read new plugins for paid services", narrowed at this milestone's hygiene). Any change to the rule (D-054), the schema, the site, or the docs outside `cairn/`. The site build, which runs after the merge at the user's request.

## Acceptance criteria

- [ ] AC1: `cairn/references/paid-service-sweep.md` gains a "Third read" section for the 7 entries that `git diff --name-only --diff-filter=A 34a02a8 1b2cebf -- plugins/` lists as added `meta.json` files, and its Scope names all three reads and states that a plugin added after `1b2cebf` has not been read. The section uses the page's word list and matching rule over each entry's `meta.json` description at `1b2cebf`, its GitHub About text as read on a read date that the section names, and each top-level file whose name starts with README, ignoring case, at a default-branch SHA that the section records for that entry. It records each entry's SHA and its About text, or "none", lists each entry with a hit with a verdict and a one-clause reason, and names each text that could not be read.
- [ ] AC2: Each recorded SHA is a commit on the repo's default branch, and each recorded About text equals GitHub's at review or the section names the change. A re-run of the word list over the recorded About texts, the READMEs at the recorded SHAs, and the same `meta.json` files reports no entry with a hit that the section does not list. The entries the section marks are exactly the entries of those 7 with `paidService` at the branch head, and each `read` equals the section's read date, compared by a one-time script at review. For each marked entry, `source` answers HTTP 200 to a script or, where a script is blocked, loads in the browser pane, and a review read finds that the page states what `note` says and that this meets the rule on the About page: the plugin's main use stops without paying its maker, or stops after a trial.
- [ ] AC3: `git diff --name-status main...HEAD -- . ':!cairn/'` lists only `M` lines on `index.json` files of those 7 entries, each differing from the merge base only by an added `paidService`, compared by the same script. `pnpm test` and `pnpm check` pass at the branch head.

## Coverage

- AC1 → T1
- AC2 → T1, T2
- AC3 → T2

## Tasks

- [ ] T1: Read the 7 entries by AC1's procedure, with the earlier reads' rule and verdict wording. Write the "Third read" section and the Scope lines.
- [ ] T2: Write `paidService` on each marked entry, with an English `note` of one sentence, a `source` that states it, and the section's read date. Where a page does not show that payment is needed, the entry gets no mark. Run `pnpm test` and `pnpm check`. At review, a fresh reader re-reads every verdict of no mark, and a wrong one is a finding.

## Work log

- 2026-11-03: created by /milestone-plan from candidate row "Read new plugins for paid services", absorbed in part: this milestone reads the entries of one commit, and the row keeps later plugins.
- 2026-11-03: tier check: milestone — it can write a field that the site shows, so it has a runtime surface.
- 2026-11-03: idea vet: no flaw. Gap, an entry can be marked wrongly: the rule (D-054) and the source check apply. Gap, plugins added later stay unread: the row keeps them, and the About page says a plugin with no mark can still cost money.
- 2026-11-03: lessons used: 2026-11-02 (M082, used M083) GraphQL batches; 2026-11-02 (M082, used M083) reading a test run's exit code; 2026-10-31 (M066, used M083) a merge deploys nothing.
- 2026-11-03: inbox sweep: 0 open issues and 0 open pull requests.
- 2026-11-03: collision check: M082 and M083 read other entries, so this extends them; D-054 sets the rule and is not changed.
- 2026-11-03: criteria audit (full mode, fresh Opus reader): 3 findings, all fixed: the Scope's last-read commit in AC1, the recorded SHAs and About texts checked in AC2, and the no-mark re-read kept in T2 as a review procedure.
- 2026-11-03: question set: none posed; the user asked for this read, and the rule and scope are settled.

## Decisions

## Review
