# M088: Fix the small description fact gaps

- **Status:** in-progress
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

- [ ] AC1: `cjkShare` in `src/site/description.ts` takes the NFC form of its text. It counts one CJK unit for each
      character whose `Script` is Han, Hiragana, Katakana, or Hangul, and for each letter whose `Script_Extensions`
      names one of them. It counts one other unit for each run of other letters. Tests in `test/description.test.ts`
      give these shares: `コーヒー` 1, `〆切` 1, `、。` 0, `Résumé notes 中文` with its accents decomposed 0.5, and
      `논문 notes` with its Hangul decomposed 2/3.
- [ ] AC2: On `cairn/references/sources/plugins-data-2026-11-03.json`, with the checkout's overrides, `shownDescription`
      gives the same result on the branch as on the default branch for every record in the file, by a comparison run
      over all records.
- [ ] AC3: A plugin page whose manifest description holds only whitespace has no "Manifest description" row in Details.
      A test in `test/site.test.ts` shows this, and shows that a page with a non-blank manifest description keeps the
      row.
- [ ] AC4: In the Overrides table, the Upstream value cell of a `description` override lists the manifest text after the
      label `Manifest:` and the GitHub text after the label `GitHub:`. Each appears only when it exists and is not
      blank. The cell reads `none` when neither does. Tests in `test/site.test.ts` cover these shapes: both texts,
      manifest only, GitHub only, a blank manifest with a GitHub text, a blank manifest alone, an upstream block with
      neither text, and a failure record with no upstream block. They also show that an override of another field keeps
      its one value.
- [ ] AC5: README's and DESIGN's sentences on the CJK share name NFC and `Script_Extensions` letters. The About page's
      Overrides paragraph says that a description override lists both upstream texts. The Unreleased section of
      `CHANGELOG.md` has an entry that claims only what the tests of AC1, AC3, and AC4 enforce.
- [ ] AC6: `pnpm test` and `pnpm check` pass.

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
- [ ] T2: Run a one-off comparison, kept out of the repo, of the default branch's and the branch's `shownDescription`
      over every record of the data file. Record the result in the work log.
- [ ] T3: Show the "Manifest description" row at `site/src/pages/plugins/[id]/index.astro:264` only for a non-blank text,
      with the test of AC3. Update the expected row list at `test/site.test.ts:578`.
- [ ] T4: Build the description cell's lines in `site/src/data.ts` beside `upstreamValue`, and render them in the table
      at `site/src/pages/plugins/[id]/index.astro:340`, with the tests of AC4. A new fixture record goes into each hand
      list of fixture ids in `test/site.test.ts`.
- [ ] T5: Update README near line 108, DESIGN near line 186, the About page near line 151, and `CHANGELOG.md`.

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

## Decisions

## Review
