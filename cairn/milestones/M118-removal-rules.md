<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M118: Define the removal rules before launch

- **Status:** planned
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — About, the remove form, and the docs that visitors and plugin owners read
- **Branch/PR:** —

## Goal

Before Zotdex is advertised, its removal rules say what harm means, add a
ground for plugins that get papers from sites that courts found infringing,
and say how a removed plugin comes back.

## Scope

**In:** a D-entry annotating D-006, D-051, and D-062; the "Removing a
plugin" section of `docs/requests.md`; removal and return steps in
`docs/maintaining.md`; a required `ground` in `delisted.json` records
(`schemas/delisted.schema.json`, `src/check/delisted.ts`, tests); About's
`#removing` paragraph and `.github/ISSUE_TEMPLATE/remove-plugin.yml`;
DESIGN.md's two removal paragraphs; `cairn/references/plain-words-copy.md`;
CHANGELOG.

**Out:** applying the copyright ground to listed plugins, the sites file,
and the bot hold → M119. A notice period before a removal for data sent
without saying so: not asked for; the return path covers a plugin that
then discloses it, so no row.

## Acceptance criteria

- [ ] AC1: The "Removing a plugin" section of `docs/requests.md` states
      five removal grounds: the repository owner's request, spam, a
      misleading entry, harm, and the copyright ground. It defines harm as
      a plugin built to do something that the people who install it did
      not agree to and were not told about, to them or through their
      computer or accounts, or built to attack other people's computers;
      it says that a bug is not harm; and it asks for evidence a reader can
      check. It defines the copyright ground as a plugin with a built-in
      way (a default address, a menu choice, or a button, not an address
      the user types) to get copyrighted papers or books from a site that
      courts in at least two countries have found, in copyright cases,
      infringes copyright, and says that a maintainer can remove such a
      plugin without a report.
- [ ] AC2: The same section states, for each of the five grounds, what a
      request to bring a removed plugin back must show. It states that a
      plugin whose author built it to spread malware, take passwords or
      files, or attack other computers stays off, and that a plugin removed
      for other harm, or for harm that someone else's change caused, such
      as a taken-over account, can come back once a release removes it.
- [ ] AC3: About's `#removing` paragraph and the `remove-plugin.yml` form
      state the copyright ground, the meaning of harm, and that a removed
      plugin can ask to come back; the form's reason menu has a copyright
      choice; and every changed line of About and the form is one that the
      user approved (CLAUDE.md, Approved page wording).
- [ ] AC4: Each `delisted.json` record carries a `ground`, one of `owner`,
      `spam`, `misleading`, `harm`, or `copyright`. `pnpm check` fails on a
      list with a record that has no `ground` or a `ground` outside those
      five, shown by a test of each failure and a test that each of the
      five values passes. The record description in `docs/requests.md`
      names `ground` and its five values.
- [ ] AC5: `docs/maintaining.md` states the steps to remove a plugin and
      to lift a removal, naming each file or command that each step
      changes or runs, and `docs/requests.md` links to those steps rather
      than repeating them.
- [ ] AC6: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T3
- AC2 → T1, T3
- AC3 → T5
- AC4 → T2
- AC5 → T4
- AC6 → T6

## Tasks

- [ ] T1: Write the D-entry: the harm definition, the copyright ground with
      its built-in line and two-country test, the narrow exception that a
      maintainer reads a matching plugin's README and settings without a
      report (no review of its code, D-051 stands), and the return path by
      ground. Update DESIGN.md's removal paragraphs (`cairn/DESIGN.md:294`,
      `:445`).
- [ ] T2: Add the required `ground` enum to `schemas/delisted.schema.json`
      and `DelistedRecord` (`src/check/delisted.ts:9`); tests in
      `test/delisted.test.ts` for a missing ground, an unknown ground, and
      each of the five values; update the record description and example
      in `docs/requests.md`.
- [ ] T3: Rewrite the "Removing a plugin" section of `docs/requests.md`
      (line 326 on): the five grounds, the harm definition, the copyright
      ground, and what a return request must show for each ground.
- [ ] T4: Write the removal and lift steps in `docs/maintaining.md`. Read
      how discovery and "Add a plugin" issues treat a repo whose bot pull
      request was closed (the 30-day and closed-PR memory in
      `src/discover/`), and name the step that lets a lifted plugin return.
- [ ] T5: Draft the About and form lines. Stop once and show the user each
      changed line, old and new, for a yes; apply the approved lines,
      including About's "A removed plugin stays off Zotdex"
      (`site/src/pages/about.astro:143`) and the form's "A removed plugin
      stays off the index" (`.github/ISSUE_TEMPLATE/remove-plugin.yml:17`);
      add the copyright choice to the form's reason menu; update
      `cairn/references/plain-words-copy.md`.
- [ ] T6: CHANGELOG entry; run `pnpm test` and `pnpm check`.

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

## Decisions

## Review
