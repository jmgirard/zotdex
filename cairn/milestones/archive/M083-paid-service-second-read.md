# M083: Read the merged plugins for paid services

**Status:** done (2026-11-03, PR #813 https://github.com/jmgirard/zotero-plugin-index/pull/813)

**Goal:** Mark each plugin merged since the first paid service read whose main use needs a paid service from its maker, by the same read by hand.

**Outcome:** A "Second read" section in `cairn/references/paid-service-sweep.md` records the 34 entries added between `c8f2b65` and `34a02a8`, with each SHA and About text. The word list hit 17 of them, and the read marked none, so no `paidService` was written and the merge changed only tracking records. The nearest call was PaperChat, whose chat works with the user's own key while only slide generation needs the maker's service.

**Decisions:** none. D-054 sets the rule.

**Review:** Full fan-out plus a fresh reader of all 34 entries, all three criteria met. Of 25 findings, 11 were fixed on the branch, 14 were rejected, and none went to a follow-up. The fixes were wording in the record, its Scope and title, its INDEX line, and DESIGN's text. CI passed 4 of 4 checks. The row "Read new plugins for paid services" was narrowed to plugins after `34a02a8`. Three lessons took a `used` mark, and none was captured.
