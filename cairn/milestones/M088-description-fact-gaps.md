# M088: Fix the small description fact gaps

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the plugin pages, the shown description, and the owner request check change
- **Branch/PR:** m088-description-fact-gaps

## Goal

The description facts on a plugin page stay right for kana, decomposed, blank, and GitHub texts.

## Scope

**In:** Items (1), (2), and (3) of the candidate row "Close gaps in the description pick": the CJK share count in
`cjkShare`, the blank "Manifest description" row, and the Overrides table's Upstream value cell for a `description`
override. The docs that state these.

**Out:** Item (4), the overrides for the gap list → M089. A pick rule for a short manifest text beside a longer GitHub
text → the parked row "Refine the Latin part and short picks". Text in other languages, which `pnpm description-gaps`
does not see → the row "Fill description gaps on new plugins". A change to `upstream.description` in the data: a blank
text stays as the manifest has it.

## Acceptance criteria

- [x] AC1: `cjkShare` in `src/site/description.ts` takes the NFC form of its text. It counts one CJK unit for each
      character whose `Script` is Han, Hiragana, Katakana, or Hangul, and for each letter whose `Script_Extensions`
      names one of them. It counts one other unit for each run of other letters. Tests in `test/description.test.ts`
      give these shares: `コーヒー` 1, `〆切` 1, `、。` 0, `Résumé notes 中文` with its accents decomposed 0.5, and
      `논문 notes` with its Hangul decomposed 2/3.
- [x] AC2: On `cairn/references/sources/plugins-data-2026-11-03.json`, with the checkout's overrides, `shownDescription`
      gives the same result on the branch as on the default branch for every record in the file, by a comparison run
      over all records.
- [x] AC3: A plugin page whose manifest description holds only whitespace has no "Manifest description" row in Details.
      A test in `test/site.test.ts` shows this, and shows that a page with a non-blank manifest description keeps the
      row.
- [x] AC4: In the Overrides table, the Upstream value cell of a `description` override lists the manifest text after the
      label `Manifest:` and the GitHub text after the label `GitHub:`. Each appears only when it exists and is not
      blank. The cell reads `none` when neither does. Tests in `test/site.test.ts` cover these shapes: both texts,
      manifest only, GitHub only, a blank manifest with a GitHub text, a blank manifest alone, an upstream block with
      neither text, and a failure record with no upstream block. They also show that an override of another field keeps
      its one value.
- [x] AC5: README's and DESIGN's sentences on the CJK share name NFC and `Script_Extensions` letters. The About page's
      Overrides paragraph says that a description override lists both upstream texts. The Unreleased section of
      `CHANGELOG.md` has an entry that claims only what the tests of AC1, AC3, and AC4 enforce.
- [x] AC6: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T4
- AC5 → T5
- AC6 → T1, T3, T4, T5

## Tasks

- [x] T1: Change `CJK` and `OTHER_LETTERS` in `src/site/description.ts:34` and normalize in `cjkShare`, with the tests
      of AC1. Limit the `Script_Extensions` part to letters, since CJK punctuation also names these scripts. Plant the
      letter limit's removal once to see `、。` fail.
- [x] T2: Run a one-off comparison, kept out of the repo, of the default branch's and the branch's `shownDescription`
      over every record of the data file. Record the result in the work log.
- [x] T3: Show the "Manifest description" row at `site/src/pages/plugins/[id]/index.astro:264` only for a non-blank text,
      with the test of AC3. Update the expected row list at `test/site.test.ts:578`.
- [x] T4: Build the description cell's lines in `site/src/data.ts` beside `upstreamValue`, and render them in the table
      at `site/src/pages/plugins/[id]/index.astro:340`, with the tests of AC4. A new fixture record goes into each hand
      list of fixture ids in `test/site.test.ts`.
- [x] T5: Update README near line 108, DESIGN near line 186, the About page near line 151, and `CHANGELOG.md`.

## Work log

- 2026-11-03: created by /milestone-plan.
- 2026-11-03: tier check: milestone — the row mixes a CJK count rule, page changes, and data work, so it is more than a bug fix.
- 2026-11-03: collision: candidate row "Close gaps in the description pick" absorbed; items (1) to (3) here and item (4) in M089. M055 and M067 shipped the rules this changes; D-032's "as the site's rule measures it" follows the new count, so no D-entry changes. Inbox sweep: 0 open issues, 0 open pull requests on 2026-11-03.
- 2026-11-03: idea vet: flaw: items (1) and (2) reach no plugin today (0 of 736 on the 2026-11-03 data: no blank manifest text, no decomposed text, no ー or 〆; 1 text holds kana); the question set chose to build both. Gap: the Upstream value cell can show both texts or the picked one; another reading fits, so the question set chose both, labeled. Gap: `Script_Extensions` alone also takes CJK punctuation; reading taken: letters only, which moves 11 code points (U+3006, U+3031 to U+3035, U+303C, U+30FC, U+FF70, U+FF9E, U+FF9F).
- 2026-11-03: lessons used: 2026-10-25 (M001), 2026-10-27 (M027), 2026-11-02 (M082), 2026-10-26 (M018), 2026-10-28 (M036), 2026-10-27 (M021), 2026-10-30 (M061), 2026-11-02 (M081), 2026-10-31 (M066), 2026-10-28 (M035).
- 2026-11-03: criteria audit (full mode) by a fresh Opus reader: 3 findings on this milestone, each fixed in the wording: AC1's decomposed probes could pass without NFC, so they now mix scripts and put an accent inside a word (0.4 against 0.5, 0.857 against 2/3 on the old code); AC4's shapes varied no blank text and now do; AC5 left README's rule stale and now names it.
- 2026-11-03: plan gate chose both upstream texts, labeled, over the picked text alone, because 33 of 34 plugins with a description override have a GitHub text that the table leaves out; falsified by a user who reads the cell as what the site would show without the override.
- 2026-11-03: plan chose `Script_Extensions` letters over a hand list of the 11 code points, because the property follows Unicode; falsified by a letter it takes that is not used in CJK text.
- 2026-11-03: split: M088 covers items (1) to (3), which are code; item (4) becomes M089, which is data; plugins added later and other-language texts become the row "Fill description gaps on new plugins". This milestone's hygiene narrows the source row to item (4) and gives it M089's started token.
- 2026-11-03: T1: `cjkShare` takes the NFC form and counts `Script_Extensions` letters as CJK; 4 new rows failed on the old count. Removing the letter limit made `、。` fail, as planted.
- 2026-11-03: T2: a one-off comparison of the default branch's and the branch's `shownDescription` over `plugins-data-2026-11-03.json` with the checkout's overrides: 736 records, 682 with a shown text, 0 differ.
- 2026-11-03: T3: the Manifest description row needs a non-blank text; the new test failed on the old page. Its own small build keeps these records out of the shared fixture's hand lists.
- 2026-11-03: T4: `upstreamLines` in `site/src/data.ts` gives the cell's lines, and a `<br>` splits two lines, so one value and `none` keep their plain cell; `upstreamValue` no longer reads `description`, and its test stays.
- 2026-11-03: T5: README, DESIGN, About, and CHANGELOG state the new count and table; DESIGN also says where a `description` override's texts sit.
- 2026-11-03: hand check on the real data of 2026-11-03 in the browser pane: Jasminum's cell shows both labeled texts, and the page has no sideways scroll at 1024 or 375 px. The table's narrow columns break "Field" mid-word, and the same CSS rule is on the default branch, so this milestone leaves it.
- 2026-11-03: claim audit: 36 claims read, 1 corrected — site/src/pages/about.astro ("Its Used column" followed the new sentence, so the sentence moved to the paragraph's end). A blank `repoDescription` still shows a Details row, but the schema's `\S` pattern refuses one, so the data never holds it.
- 2026-11-03: review fix-now commit: comment, tests, three docs' "both descriptions", and the Overrides table's word breaks, which the hand-check line above had left, because the longer cell made them more visible.

## Decisions

## Review

Branch up to date with `origin/main` on 2026-11-03; `gh` lists no PR for the branch, so this is route (d).

- AC1: 9 `cjkShare` rows pass in `test/description.test.ts`, by name in a verbose run: `コーヒー` 1, `〆切` 1, `、。` 0, decomposed `Résumé notes 中文` 0.5, decomposed `논문 notes` 2/3, and the 4 older rows. Implement saw the 4 new discriminating rows fail on the old code and `、。` fail with the letter limit removed.
- AC2: a comparison of the default branch's and the branch's `shownDescription` over `plugins-data-2026-11-03.json`, with the checkout's overrides: 736 records, 682 shown, 0 differ.
- AC3: "shows no Manifest description row for a blank text and keeps it for a text" passes in `test/site.test.ts`; the test failed on the old page.
- AC4: 7 named shapes of the Upstream value cell and the other-field test pass in "the description facts" in `test/site.test.ts`, and `upstreamLines` leaves out a blank GitHub text in `test/site-data.test.ts`. With the default branch's page and `data.ts`, the 5 shapes that hold a text or a blank fail, and `no-text`, `failed-read`, and the other-field test pass, as they pin behavior the change keeps (corrected at review; an earlier line said all 8 failed, because that run's test read a `<div>` the old page did not have). The browser pane showed Jasminum's two labeled lines on the real data.
- AC5: README's and DESIGN's share sentences name NFC and `Script_Extensions`, and About says a description override lists both texts, each read in a joined copy. CHANGELOG's two new entries state the table, the blank row, the marks, and decomposed text; a sentence on which commands use the share was not enforced by these tests, so it was removed here before this tick.
- AC6: `pnpm test` exit 0, 2238 passed and 6 skipped; `pnpm check` exit 0, 736 entries, 0 problems. Rerun after the fixes below.

Gate: `cairn_validate` passed; the profile's slot names no toolchain checks; no principle changed.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: the Review line said all 8 tests failed before the change, but 3 pin kept behavior — fix now: the line is corrected from a fresh run on the default branch's page.
- diff-bug #2: the new "data file is valid against the v1 schema" test passes on main and pins nothing the change could break — fix now: removed.
- diff-bug #3: the other-field cell test repeats a code path that older tests cover — reject, planned change: AC4 names that behavior.
- diff-bug #4: the blank-GitHub branch of `upstreamLines` was never fired by a test; the Details row for such a text also differs — fix now for the branch: a test in `test/site-data.test.ts`, which fails with `.trim()` removed; reject for the row, edge: only a `repoDescription` that the schema and the reader refuse reaches it, outside any documented use.
- diff-bug #5: the owner request check's refusal widens with no doc or test saying so, for example `コーヒー notes` from 0.4 to 0.8 — reject, planned change: the surface tier names the check, D-049 says "half or more CJK", and AC1's rows test that one function.
- diff-bug #6: the comment "a decomposed Latin word stays one run" is false for a letter plus a mark with no composed form — fix now for the comment; known issue for the count, below.
- diff-bug #7: NFC does not unify halfwidth katakana or conjoining jamo that do not compose — known issue: the CJK share is a rough count. A letter plus a mark with no composed form splits a run of other letters, and halfwidth katakana with a voiced mark or conjoining Hangul letters that do not compose count as several CJK units, so such a mixed text can land on the other side of 0.5. None of the 1,282 upstream texts read on 2026-11-03 holds such a form beside CJK text. Accepted at the M088 gate
- diff-bug #8: a manifest description of only a format character passes the blank test — known issue: a manifest description of only format characters, such as U+200B, is not blank to `trim`, so Details shows a row that looks empty and the Overrides cell shows a bare `Manifest:`. None of the 1,282 upstream texts read on 2026-11-03 has no letter or digit. Accepted at the M088 gate
- diff-bug #9: DESIGN's "shows both descriptions" is stale for a blank manifest — fix now: DESIGN, About, and README now say so.
- diff-bug #10: longer cells may worsen the table's mid-word breaks — fix now: `.overrides table` sets `overflow-wrap: normal`, as the compat table does. The browser pane shows "Field" and "Used" whole at 1024 px; at 375 px the table scrolls inside its wrapper and the page does not.
- diff-bug #11: the source row still lists items (1) to (3) — reject, planned change: this milestone's hygiene narrows it.
- diff-bug #12: the moved letters follow the runtime's Unicode tables and no test names all 11 — reject, planned change: the work log records this choice and what would falsify it.
- diff-bug #13: the expected-row expression at `test/site.test.ts:578` repeats the page's condition — reject, planned change: T3 names this edit.
- diff-bug #14: two calls in the blank-row test overlap in part — reject, false: one pins the label and one the text, as the reviewer also found.
- diff-bug #15: `upstreamLines` computes `value` before a branch that does not use it — reject, style.
- blame-history #1: the owner request check now measures the marks differently, with no test of them — reject, planned change: as diff-bug #5.
- blame-history #2: no D-entry records the display change, and DESIGN's line reads as one value — reject, false: this is a choice for one page, in the work log, and the next clause of that DESIGN line states it.
- blame-history #3: the comment "Letters only for Script_Extensions" overstates the rule, since the `Script` branch counts other characters — reject, false: the comment speaks of `Script_Extensions` only, and AC1 words the rest.
- blame-history #4: the manifest row checks for blank and the GitHub row does not — reject, false: `src/upstream/reader.ts` drops a blank GitHub text and the schema refuses one.
- blame-history #5: D-032 and D-038 quote a share whose count changed — reject, false: D-032 says "as the site's rule measures it", and AC2 found no change on the data.
- prior-review #1: About, DESIGN, and README still say the card shows both descriptions — fix now: as diff-bug #9.
- prior-review #2: a screen reader may run the two lines together — reject, false: a `<br>` splits them into separate text runs with their own labels; M015's case was inline spans with no break.
- prior-review #3: combining marks still split runs of other scripts — known issue: as diff-bug #7.
- prior-review #4: README's paragraph kept its old wrap — fix now: rewrapped.
- ripple #1: the source row still lists items (1) to (3) — reject, planned change: as diff-bug #11.
- ripple #2: About's "shows both descriptions" — fix now: as diff-bug #9.
- ripple #3: DESIGN's "shows both descriptions" — fix now: as diff-bug #9.
- ripple #4: README's "as two more facts" — fix now: as diff-bug #9.
