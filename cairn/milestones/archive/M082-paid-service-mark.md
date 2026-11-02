# M082: Mark plugins that need a paid service

**Status:** done (2026-11-02, PR #812 https://github.com/jmgirard/zotero-plugin-index/pull/812)

**Goal:** Show on the site when a plugin's main use needs a paid service from its maker, as a fact read by hand with its source, with no change to who is listed.

**Outcome:** An optional `paidService` in `index.json`, with `note`, `source`, and `read`, goes unchanged onto each record in `v1/plugins.json`, on read and failed records alike. `PaidServiceMark.astro` shows a card icon on the home row and in the plugin page's h1, the legend names it, the Details card gives "Needs a paid service from its maker" with the note, a link, and the date, and the About page gets a "Paid service" section. Both intros say that a maintainer reads this fact by hand. A read of the 695 entries at `c8f2b65`, recorded in `cairn/references/paid-service-sweep.md` with `paid-service-sweep-shas.tsv`, found 357 with a word hit and marked 6: FanyiPaiban, FileTrans AI, Geyi, AI Guided Reader, Equalang, and Immersive Translate. MagicZotero and AI4Paper got no mark, since no public page read says what stops after their 7-day trial.

**Decisions:** D-054 marks only required payment from the maker, over any paid offer, and leaves later plugins to a read by hand, over a listing command. The user chose both at the question set.

**Review:** Full fan-out plus a fresh reader of the marks and 20 random no verdicts, all seven criteria met. Of 34 findings, 15 were fixed on the branch, 19 were rejected, and none went to a follow-up. The fixes include the fact's link text, so a page has no two links named "Source", stale doc lines, and redundant tests. The claim audit corrected 3 records, which took the marks from 7 to 6 and moved the FileTrans source to the maker's tutorial. The criteria audit changed the wording before the plan was written. CI passed 4 of 4 checks. The row "Mark plugins that sell a paid service" graduated. The lessons of M035, M061, M066, M075, and M081 took a `used` mark, and two lessons were captured.
