<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M118: Define the removal rules before launch

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — About, the remove form, and the docs that visitors and plugin owners read
- **Branch/PR:** m118-removal-rules

## Goal

Before Zotdex is advertised, its rules say when a plugin is removed and
how it comes back, define spam and harm, add a ground for plugins with a
court-blocked site built in, and say how legal notices and private
reports reach the maintainer.

## Scope

**In:** one D-entry annotating D-006, D-051, and D-062; the "Removing a
plugin" section of `docs/requests.md` and a short section there on legal
notices, private reports, and the three promises; removal, notice, lift,
and removal-issue steps in `docs/maintaining.md`; a required `ground` in
`delisted.json` records (`schemas/delisted.schema.json`,
`src/check/delisted.ts`, tests); About's `#removing` card and
`.github/ISSUE_TEMPLATE/remove-plugin.yml`; DESIGN.md's removal
paragraphs; `cairn/references/plain-words-copy.md`; CHANGELOG.

**Out:** the sites file, the court rulings, and the removals → M119. The
daily re-check of listed plugins → M120. A public list of removed plugins:
RR01 R16 (consider) → candidate row. A full harm definition on About: the
precise text lives in `docs/`, and About gets one approved sentence
(CLAUDE.md, Approved page wording).

## Acceptance criteria

- [x] AC1: The "Removing a plugin" section of `docs/requests.md` states
      five grounds: the owner's request, spam, a misleading entry, harm,
      and a listed site built in. It defines spam, harm, and "built in",
      and states the fifth ground, in the words of this file's Decisions
      entries for spam, harm, and the fifth ground, which govern where they
      differ from RR01 (spam from RR01 §8 item 3, harm R3, built in R2,
      fifth ground R1). It says that a maintainer applies the fifth
      ground without a report only to a plugin whose name, description,
      repository name, or topics name a listed site, reading its README
      and settings and not its code.
- [x] AC2: The same section states what a request to bring a removed
      plugin back must show after harm (this file's Decisions, Return path:
      RR01 R5, R6) or a listed site built in (a release drops the site, and
      a second removal on that ground stays: R8), and that a plugin
      removed as spam or for a misleading entry returns once its repository
      or entry no longer meets that ground; that only
      the owner can undo an owner's request, that any removal is lifted
      when its evidence proves wrong or a maintainer misread the plugin
      (R7), and that a plugin found sending data without saying so first
      gets an issue and 14 days to disclose it (R17).
- [x] AC3: `docs/requests.md` states that the index hosts no plugin files,
      that a complaint about a plugin's own code goes to GitHub, where
      legal notices and private harm reports go, how to ask for a
      screenshot to be taken down, that no response time is promised and
      malware reports come first, that the rules can change and where
      their dated history is, and that a request with no new evidence is
      closed.
- [x] AC4: About's `#removing` card states the five grounds in short form,
      that a removed plugin can ask to come back, and the private contact;
      the form names the five grounds and its reason menu has a choice that
      names the narrow fact (a listed site built in), not "copyright"; and
      every changed line of About and the form is one the user said yes to
      at T6, which `cairn/references/plain-words-copy.md` records, with the
      form in its own section, under that approval's date (CLAUDE.md,
      Approved page wording).
- [x] AC5: Each `delisted.json` record carries a `ground`, one of `owner`,
      `spam`, `misleading`, `harm`, or `copyright`. `pnpm check` fails on a list
      with a record that has no `ground` or a `ground` outside those five,
      shown by a test of each failure and a test that each of the five
      values passes. The record description in `docs/requests.md` names
      `ground` and its values.
- [x] AC6: `docs/maintaining.md` states the steps to remove a plugin, to
      send the 14-day notice, to lift a removal, including the step that
      lets a lifted plugin be listed again although the bot does not
      propose a repo whose pull request was closed, and to close a held
      pull request for a misleading entry (D-053), naming each file or
      command each step changes or runs; it gives the removal issue's outline (RR01 R13); it says
      where the record that a plugin was removed once lives after a lift;
      and `docs/requests.md` links to these steps rather than repeating
      them.
- [x] AC7: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T3
- AC2 → T1, T3, T9
- AC3 → T4
- AC4 → T6
- AC5 → T2
- AC6 → T5, T8
- AC7 → T7

## Tasks

- [x] T1: Write the D-entry from this file's Decisions: the five grounds,
      the definitions, the read-without-report exception and its limit
      (RR01 R4), the limit on new legal grounds (R10), the return path,
      and the notice period. Update DESIGN.md's removal paragraphs
      (`cairn/DESIGN.md:294`, `:445`).
- [x] T2: Add the required `ground` enum to `schemas/delisted.schema.json`
      and `DelistedRecord` (`src/check/delisted.ts:9`); tests in
      `test/delisted.test.ts`; update the record description and example
      in `docs/requests.md`.
- [x] T3: Rewrite the "Removing a plugin" section of `docs/requests.md`
      (line 326 on) per AC1 and AC2.
- [x] T4: Write the section on legal notices, private reports, screenshot
      takedowns, and the three promises in `docs/requests.md`.
- [x] T5: Write the steps and the removal issue's outline in
      `docs/maintaining.md`. Read how discovery and "Add a plugin" issues
      treat a repo whose bot pull request was closed (`src/discover/`), and
      name the step that lets a lifted plugin return.
- [x] T6: Stop once: ask the user for the private contact and show each
      changed line of About and the form, old and new, for a yes. Apply
      the approved lines, including About's "A removed plugin stays off
      Zotdex" (`site/src/pages/about.astro:143`) and the form's "A removed
      plugin stays off the index" (`remove-plugin.yml:17`); add the reason
      choice; update `cairn/references/plain-words-copy.md`.
- [x] T7: CHANGELOG entry; run `pnpm test` and `pnpm check`.
- [x] T8: Review return 1: name the `gh` command for each removal, notice,
      and held-pull-request step that changes GitHub state in
      `docs/maintaining.md`; rewrap the long line in `docs/requests.md`.
- [x] T9: Review return 2: widen the 14-day notice to data sent without
      saying so; fix removal step 4 against the held-PR rule, the order
      for a removal with no request, the removal and notice issue titles
      and searches, DESIGN's "sites file", the private-contact wording in
      `docs/requests.md`, the scan-issues pointer and the malware-find
      line, the wrap, and the About links test's name.

## Work log

- 2026-11-09: created by /milestone-plan.
- 2026-11-09: tier check: milestone — new removal rules are a design decision.
- 2026-11-09: idea vet: gap — "the Sci-Hub plugin" or the whole kind; the user chose the whole kind at the set. gap — "built in" or "main use"; the user chose built in. flaw — none.
- 2026-11-09: lessons used: 2026-10-26 (M018) docs wrap near 76 columns; 2026-11-07 (M109) Astro writes an apostrophe as `&#39;`.
- 2026-11-09: collision: D-062 annotated, not superseded (its four grounds stay); D-006 and D-051 stand; D-065's star order untouched.
- 2026-11-09: inbox sweep: 0 open issues; 16 open bot pull requests, none overlapping.
- 2026-11-09: criteria audit (full, fresh Opus reader): 12 findings. Taken: D-entry for the read-without-report exception; return rule split by who built the harm; About and form "stays off" lines added to AC3; form reason menu in AC3; approval stated as a gate on the change; record description in AC4; docs link instead of repeat in AC5. One posed at the set (read without a report).
- 2026-11-09: question set: apply the copyright ground without a report — yes; built in at all, not main use — yes.
- 2026-11-09: plan gate chose a court-ruling test in at least two countries over "an illegal source" because a ruling can be linked and checked and one outlier court is not enough; falsified by a site that rulings in two countries cover but that serves only lawful copies.
- 2026-11-09: plan gate chose harm defined by design and consent over harm defined by outcome because a bug that damages a library would otherwise remove a plugin; falsified by a plugin left listed after a bug that the author refuses to fix destroys users' libraries.
- 2026-11-09: agent decision: permanent removal only for malware, taking passwords or files, and attacks; other harm, such as data sent without saying so, can come back once a release stops or discloses it.
- 2026-11-09: the user asked for a Fable second opinion on the complete draft rules before implementation.
- 2026-11-09: blocked on RB01 (`cairn/reviews/RB01-removal-rules.md`), which also covers M119's application.
- 2026-11-09: RR01 ingested (`cairn/reviews/archive/RR01-removal-rules.md`); the user accepted all rule fixes, the README clause, and four launch gaps; plan amended: AC1, AC2, AC4, AC6 reworded, AC3 added, ground value `copyright` kept for the fifth ground (RR01: accurate enough for a data field), re-check moved to M120.
- 2026-11-09: question set (ingestion): private contact — the user supplies it at T6; the 14-day notice length is the agent's choice (RR01 R17 named no length).
- 2026-11-09: RR01 R16 (public list of removed plugins) recorded as a candidate row; R19 and R20 rejected, as RR01 did.
- 2026-11-09: unblocked: status back to planned, since no branch was cut; the criteria amended at ingestion were not re-audited, so `/milestone-implement` step 6's re-audit applies to AC1 to AC6.
- 2026-11-09: implement started on branch `m118-removal-rules`; `.claude/` is untracked and unrelated, left unstaged.
- 2026-11-09: re-audit: AC1 (full) — "RR01 R14" holds no wording and the fifth ground had two texts; cite this file's Decisions with each source.
- 2026-11-09: re-audit: AC2 (full) — return conditions for spam and a misleading entry had no source; state them as "returns once it no longer meets that ground".
- 2026-11-09: re-audit: AC3 (full) — nothing.
- 2026-11-09: re-audit: AC4 (full) — approval in conversation is an instrument; bind the lines to `plain-words-copy.md`'s approved record.
- 2026-11-09: re-audit: AC5 (full) — nothing.
- 2026-11-09: re-audit: AC6 (full) — closing a held pull request under any ground contradicts D-053 until M119's annotation; narrowed to a misleading entry.
- 2026-11-09: substantive amendment: AC1, AC2, AC4, AC6 reworded per the re-audit, each narrower; the deliverable the user sees is unchanged.
- 2026-11-09: T2 done: `ground` required in the schema and `DelistedRecord`; tests for a missing ground, an unknown ground, and each of the five values; existing fixtures carry `ground: "owner"`; the docs record description names the field; `pnpm test` 2815 passed, `pnpm check` 0 problems.
- 2026-11-09: plain-English lint (simple-english hook) fixed four older sentences in `docs/requests.md` near the edit.
- 2026-11-09: re-audit: AC1 (full) — the Decisions condense R1 and R2, so "the words of this file's Decisions" names two texts that differ; also asked for a D-entry clause.
- 2026-11-09: re-audit: AC2 (full) — the listed-site return condition is in RR01 R8, not in the cited Decisions entry.
- 2026-11-09: re-audit: AC4 (full) — a line in `plain-words-copy.md` can exist without the user's yes, and the file has no section for the form.
- 2026-11-09: re-audit: AC6 (full) — lift steps can pass without bringing the plugin back, since the bot does not propose a repo whose pull request was closed (`src/discover/issue.ts:212`).
- 2026-11-09: stop: second re-audit on AC1, AC2, AC4, AC6 goes to the user (repeated review-failure stop).
- 2026-11-09: T1 written (D-085, DESIGN removal paragraphs); T3 drafted in `docs/requests.md`, plain-English lint fixed in the new text.
- 2026-11-09: substantive amendment: at the stop the user chose the four narrower rewordings of AC1, AC2, AC4, AC6; AC1's D-entry clause left out, as a record clause binds an instrument and D-085 is written.
- 2026-11-09: T4 and T5 done: legal notices, private reports, screenshot takedowns, and the three promises in `docs/requests.md`; removal, issue outline, 14-day notice, lift, and held-PR steps in `docs/maintaining.md`; the lift step adds the entry with `pnpm add-plugin` when a closed bot pull request blocks the repo.
- 2026-11-09: question set (T6 stop): the user approved the five About lines and the form lines as shown, and chose GitHub's private report form (`security/advisories/new`) as the private contact; private vulnerability reporting is off on the repo (`gh api .../private-vulnerability-reporting` read `enabled: false`), and turning it on is the user's, per the option they chose.
- 2026-11-09: T6 done: About card and form applied as approved, recorded in `plain-words-copy.md` (About under "Removal rules (M118)", the form in its own section); new link constants `REMOVAL_RULES_HREF` and `PRIVATE_REPORT_HREF` in `site/src/data.ts`; site and form tests updated; built site checked in the browser pane (card text and three links).
- 2026-11-09: plain-English lint: older hits left in `plain-words-copy.md` (it quotes approved wording, which changes only on the user's yes) and in older CHANGELOG entries (outside this milestone); older hits fixed in `docs/maintaining.md`.
- 2026-11-09: T7 done: CHANGELOG entry; `pnpm test` 2815 passed.
- 2026-11-09: claim audit: 32 claims read, 1 corrected — `docs/requests.md` (the fifth ground's match now says "name a listed site", since no sites file exists until M119; AC1's "sites file" wording is met by M119's file). Not corrected: the private report link opens no form while private vulnerability reporting is off on the repo; turning it on is the user's, and review's merge question names it.
- 2026-11-09: status review; handed to /milestone-review.
- 2026-11-09: review: branch level with `origin/main`; Copilot round off (no header line); `pnpm test` 2815 passed, `pnpm check` 0 problems; the missing-ground test fails with the schema's `required` ground removed and passes with it restored.
- 2026-11-09: review return 1: AC6 — removal steps 4 and 6, the notice's step 1, and closing a held pull request name no file or command; also `docs/requests.md` has one line past the wrap width.
- 2026-11-09: amendment routed: AC1 — the docs say "name a listed site", and AC1 asks for "match a name in the sites file", which no file meets until M119; AC1 holds two `re-audit: AC1` lines, so the amendment goes to the user.
- 2026-11-09: question set (review stop): the user chose to change AC1 to "name a listed site" over changing the docs back; status back to in-progress for review return 1 and the AC1 amendment.
- 2026-11-09: amendment return: AC1 — "repository name, or topics name a listed site, reading its README and settings and not its code" (no reader spawned: AC1 holds two re-audit lines, and the user chose this wording at the stop).
- 2026-11-09: T8 added for review return 1 (minor amendment) and done: `gh` commands named for each step that changes GitHub state in `docs/maintaining.md`; four lines of the new `docs/requests.md` text rewrapped.
- 2026-11-09: status review; handed back to /milestone-review.
- 2026-11-09: review return 2: AC2 — the 14-day notice in `docs/requests.md` covers only "library contents or account details", narrower than AC2's "sending data" (diff-bug #7); AC2 unticked; the other fix-now findings ride the same return as T9.
- 2026-11-09: T9 added for review return 2 (minor amendment).
- 2026-11-09: T9 done: the notice covers data sent without saying so; removal step 1 opens or renames the issue `Removed <owner>/<repo>`, step 5 closes a removed plugin's pull request on the removal's ground, and the held-PR section covers plugins not removed; the notice issue is titled `Notice for <owner>/<repo>`, and the earlier-removal search matches `Removed` titles; `is:unmerged` on the closed-PR search; DESIGN's "name a listed site"; the private report form named in `docs/requests.md`; the scan-issues body and the malware-find line point to `docs/maintaining.md` and the second-source rule; prose rewrapped; the About links test renamed; `pnpm test` 2815 passed, `pnpm check` 0 problems.
- 2026-11-09: status review; handed back to /milestone-review.

## Decisions

- 2026-11-09 (RR01): Fifth ground, replacing draft rule 2 (R1, R2): a maintainer can remove a plugin that has a built-in way to get papers or books from a site that courts in at least two countries have ordered blocked or shut down for copyright infringement. A default judgment counts, and so does a court's order to internet providers to block the site. A block by a regulator or an industry body does not count, and neither does a ruling later overturned. A site means the service under any address or mirror; a renamed site counts when a ruling names it or its operator presents it as the same service. "Built in" means the plugin's latest release ships the site (a default or preset address, a menu choice, a button, or a list the plugin loads by itself) or its README or settings text tells the user to enter the site's address. A plugin that takes any address the user types, and names no listed site, is not covered; a plugin's name alone does not make the site built in.
- 2026-11-09 (RR01): Harm, replacing draft rule 1 (R3): RR01 R3's text verbatim, including the disclosure places (README, release notes, text shown before the plugin acts, or behavior plainly what the plugin is for), the exclusion of anonymous update checks and install counts, and evidence as a link to the code, a scan find that a second source supports, or steps that make it happen again.
- 2026-11-09 (RR01): Return path (R5 to R8): permanent for hidden behavior the author built in that serves no part of the plugin's stated purpose; other harm returns once a release stops or discloses it; harm from someone else's change (a taken-over account, a poisoned dependency) returns once a release removes it and the public record shows what happened; a maintainer checks only that the reported evidence no longer holds, which is no finding of safety; any removal is lifted when its evidence proves wrong or a maintainer misread the plugin; a second removal on the fifth ground stays.
- 2026-11-09 (RR01): Spam (R14): a repository that is not a working Zotero plugin, such as an unchanged template or sample under a new name, a repository made to carry ads or links, or many near-identical copies from one account.
- 2026-11-09 (RR01): D-entry notes (R4, R10): the read-without-report exception covers only plugins that match a sites-file name, reads README and settings only, checks every match the same way, and is wrong if a maintainer reads plugins no match or report names; a new legal ground needs an outside fact a reader can look up, as court orders are.

## Review

- AC1 evidence (2026-11-09, `1f029309`): `docs/requests.md` "Removing a plugin" lists the five grounds and has "Spam", "Harm", and "A listed site built in" subsections holding the spam, harm, built-in, and fifth-ground texts of this file's Decisions. The terms and conditions are the same; some sentences are split or reordered for the repo's plain-English lint, with no condition added or dropped. It says the fifth ground applies without a report only to a plugin whose name, description, repository name, or topics name a listed site, reading README and settings, not code.
- AC2 evidence: its "Coming back" subsection gives the harm return (permanent for hidden behavior serving no stated purpose; other harm on a release that stops or discloses it; someone else's change with the public record; evidence-only check, no finding of safety), the listed-site return (a release drops the site; a second removal stays), spam and misleading entries returning once they no longer meet the ground, owner-only undo, and the lift on wrong evidence or a misread; the "Harm" subsection gives the issue and 14 days to disclose.
- AC3 evidence: `docs/requests.md` "Legal notices and private reports" says the index hosts no plugin files, that a complaint about a plugin's code goes to GitHub, that legal notices and private reports use the private contact on About, how a screenshot is taken down (owner: blank Screenshot field; others: the private contact), no promised response time with malware first, that rules can change with dated history in the file's git history, and that a request with no new evidence is closed.
- AC4 evidence: the built site's About card (checked in the browser pane on a `pnpm site` build of the deployed data) reads the five grounds in short form, the way back, and the private contact, with links to the remove form, `security/advisories/new`, and the full rules; the form's description and grounds sentence name the five grounds and its menu adds "It has a listed site built in"; each changed line is one the user said yes to at T6, recorded in `plain-words-copy.md` under "Removal rules (M118)" and "Remove form (M118)", dated 2026-11-09; `test/site.test.ts` and `test/delisted.test.ts` assert the card text, its three links, and the five reasons.
- AC5 evidence: `schemas/delisted.schema.json` requires `ground` with the five values; `test/delisted.test.ts` passes for a missing ground and an unknown ground (`delisted-file`, with Ajv's message) and for each of the five values (7 tests); with `ground` taken out of `required`, the missing-ground test fails; `docs/requests.md`'s record description names `ground` and its values.
- AC6 evidence (`1f029309`): `docs/maintaining.md` "Removing a plugin" gives the removal steps (`plugins/`, `delisted.json`, `pnpm check`, `gh pr close`, `gh workflow run build.yml`, `gh issue close`), "The removal issue" outline (RR01 R13) with `gh issue create --label remove-plugin`, "Sending the 14-day notice" (`gh issue create`, `gh issue close`), "Lifting a removal" (`delisted.json`, `pnpm check`, `gh pr list --state closed`, and `pnpm add-plugin` when a closed bot pull request blocks the repo), the record of an earlier removal in the closed issue (`gh issue list --label remove-plugin`), and "Closing a held pull request" for a misleading entry (D-053, `gh pr close`); `docs/requests.md` links to these steps and no longer repeats them.
- AC7 evidence (`1f029309`): `pnpm test` 2815 passed, 6 skipped; `pnpm check` 754 entries, 0 problems.
- Consistency gate: `cairn_validate.py` all checks passed; profile `generic` names no toolchain checks; no DESIGN principle changed, so no impact report.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: removal step 4 closes any bot pull request, against the held-PR rule's "Close no held pull request for another reason" — fix now, fixed cdd870d2
- diff-bug #2: the private report link opens no form while private vulnerability reporting is off — fix now, by the user's setting before the merge (step 7 names it)
- diff-bug #3: notice issues share the `remove-plugin` label, so the search for an earlier removal can find a notice or a declined request — fix now, fixed cdd870d2
- diff-bug #4: a removal with no request needs its issue's number at step 2, but the issue is opened later — fix now, fixed cdd870d2
- diff-bug #5: DESIGN.md and D-085 say "the sites file", which the docs and AC1 no longer use — fix now, fixed cdd870d2, for DESIGN.md (architecture as it is); D-085 rejected (false: it records the decision, which M119's sites file carries out)
- diff-bug #6: `gh pr list --state closed` also lists merged pull requests — fix now, fixed cdd870d2
- diff-bug #7: the 14-day notice covers only library contents or account details, narrower than AC2's "sending data" — fix now, review return 2 (AC2 fails as written), fixed cdd870d2
- diff-bug #8: the permanent-harm examples omit "taking files" — reject (planned change: the Decisions entry, RR01 R5, governs and names passwords)
- diff-bug #9: About says "ordered blocked", the rule "blocked or shut down" — fix now if the user approves the line at step 7 (approved wording)
- diff-bug #10: lines past the wrap width in docs and the form — fix now, fixed cdd870d2
- diff-bug #11: the About links test's name still says the section links only the form — fix now, fixed cdd870d2
- diff-bug #12: screenshot takedowns go through a security-advisory form — reject (planned change: the user chose that private contact; it suits a takedown that holds personal data)
- diff-bug #13: no test ties the schema's enum to the TypeScript union — reject (style; `tsc` and the schema agree today)
- diff-bug #14: five value tests could be one `pnpm check` run — reject (style)
- blame-history #1: "plainly what the plugin is for" counts as told, absent from D-085 — reject (planned change: RR01 R3, which the user accepted; D-085 points to the docs for the full text)
- blame-history #2: a scan find needs a second source, against D-084 — reject (false: D-084 handles a find as a report of harm and says to look before acting; the docs ripple is ripple #3)
- blame-history #3: run-time code and anonymous counts carve-outs are unrecorded — reject (false: recorded in this file's Decisions from RR01 R3)
- blame-history #4: DESIGN.md says "the sites file" — fix now (same as diff-bug #5), fixed cdd870d2
- blame-history #5: About links the full rules to `docs/requests.md`, while D-078 names `docs/site.md` — reject (planned change: the user approved the line at T6; `docs/site.md` already points removals to requests.md)
- prior-review #1: ragged wrap in the new prose — fix now (same as diff-bug #10), fixed cdd870d2
- ripple #1: the form and docs say "the contact on the About page", and About shows a private report form — fix now, fixed cdd870d2, in `docs/requests.md`; the form's line rejected (planned change: the user approved it, and the About card's form is that contact)
- ripple #2: `src/malware-scan/scan-issues.ts:74` points removals to `docs/requests.md`, whose steps moved to `docs/maintaining.md` — fix now, fixed cdd870d2
- ripple #3: `docs/maintaining.md`'s malware-find line cites requests.md for looking at the signature and source, which requests.md no longer says — fix now, fixed cdd870d2
- AC2 evidence (pass 2, `cdd870d2`): the "Harm" subsection now gives the issue and 14 days to disclose for a plugin found sending data somewhere without saying so; the "Coming back" text is as in pass 1.
- AC6 evidence (pass 2, `cdd870d2`): the removal steps now open or rename the issue first (step 1) and close a removed plugin's pull request on the removal's ground (step 5); the held-pull-request section covers plugins not removed; the notice and removal issues carry the `Notice for` and `Removed` titles that the earlier-removal search reads; each step that changes GitHub state names its `gh` command.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: the 14-day notice now reaches a plugin that takes passwords, which "Coming back" keeps off for good — amendment routed (AC2 promises the notice for any data sent without saying so)
- diff-bug #2: the notice steps do not leave out anonymous update checks and install counts, which are not harm — fix now
- diff-bug #3: removal step 5 closes a held pull request on any ground, and D-053 is not annotated — fix now (D-086)
- diff-bug #4: long and ragged lines remain — fix now
- diff-bug #5: the closed-PR search reads titles, while the bot keys on the `discover/<owner>/<repo>` branch — fix now
- diff-bug #6: "Then run `pnpm add-plugin`" reads as unconditional — fix now
- diff-bug #7: the earlier-removal search does not check that the removal used the listed-site ground — fix now
- diff-bug #8: the title search is not an exact phrase — fix now
- diff-bug #9: a no-request removal's issue carries the answer before the removal — fix now
- diff-bug #10: step 1 sets the `Removed` title before the removal merges — fix now
- diff-bug #11: the notice command has no body flag — fix now
- diff-bug #12a: About says "its owner can ask to bring it back", while anyone can ask — reject (planned change: the user approved the line; the owner is the usual asker)
- diff-bug #12b: `issue` is "the number of the request", wrong for a no-request removal — fix now
- diff-bug #12c: DESIGN says "courts in two countries", the rule "at least two" — fix now
- diff-bug #12d: "So look at the signature" does not follow from the sentence before — fix now
- blame-history #1: the second-source condition on scan finds narrows D-082 and D-084 with no decision recording it — fix now (D-086)
- blame-history #2: the built-in list, the renamed-site rule, and the public-record test are not in D-085 — fix now (D-086)
- prior-review #1: ragged wrap in docs and DESIGN — fix now (same as diff-bug #4)
- ripple #1: About says "ordered blocked", the rule "blocked or shut down" — fix now if the user approves the line at step 7 (approved wording; same as pass 1 diff-bug #9)
- ripple #2: the form says "the contact on the About page", and About links a private report form — fix now if the user approves the line (approved wording)
