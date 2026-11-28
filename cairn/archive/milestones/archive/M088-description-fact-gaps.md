# M088: Fix the small description fact gaps

**Status:** done (2026-11-03, PR #823 https://github.com/jmgirard/zotero-plugin-index/pull/823)

**Goal:** The description facts on a plugin page stay right for kana, decomposed, blank, and GitHub texts.

**Outcome:** `cjkShare` in `src/site/description.ts` takes the NFC form and counts, as CJK, each `Script` Han, Hiragana,
Katakana, or Hangul character and each letter whose `Script_Extensions` names one of them, which moves 11 code points
(U+3006, U+3031 to U+3035, U+303C, U+30FC, U+FF70, U+FF9E, U+FF9F). A comparison over the 736 records of 2026-11-03 found
no change in `shownDescription`. A manifest description of only whitespace shows no "Manifest description" row.
`upstreamLines` in `site/src/data.ts` gives a `description` override's Upstream value cell a `Manifest:` line and a
`GitHub:` line, each only for a text that is not blank, or `none`; another field keeps its one value. `.overrides table`
sets `overflow-wrap: normal`, so words stay whole. README, About, DESIGN, and CHANGELOG updated. Items (1) to (3) of the
row "Close gaps in the description pick"; item (4) is M089.

**Decisions:** none. The question set chose to build the two fixes that reach no plugin today (0 of 736), and both
upstream texts over the picked text alone.

**Review:** Criteria audit (full) 8 findings across M088 and M089, all applied. Claim audit 36 claims, 1 corrected. Four-lens
pass, 28 findings: 11 fixed (including the review record itself, a test the rule excludes, a test for the blank-GitHub
branch, and three docs' "both descriptions"), 14 rejected, 3 to two new DESIGN Known issues (rough CJK count for unusual
marks, format-character-only manifest text), accepted at the gate. CI passed. Lessons: 14 marked used, none captured.
Source row narrowed to item (4) with M089's started token. Before this review, M085's done row was pruned at the plan.
