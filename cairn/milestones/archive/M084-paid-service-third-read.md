# M084: Read the last merged plugins for paid services

**Status:** done (2026-11-03, PR #814 https://github.com/jmgirard/zotero-plugin-index/pull/814)

**Goal:** Mark each plugin merged since the second paid service read whose main use needs a paid service from its maker, by the same read by hand.

**Outcome:** A "Third read" section in `cairn/references/paid-service-sweep.md` records the 7 entries added between `34a02a8` and `1b2cebf`, with each SHA and About text. The word list hit 3 of them, and the read marked none, so no `paidService` was written and the merge changed only tracking records.

**Decisions:** none. D-054 sets the rule.

**Review:** Full fan-out plus a fresh reader of all 7 entries, all three criteria met. Of 18 findings, 6 were fixed on the branch, 12 were rejected, and none went to a follow-up. The fixes were wording in the record. CI passed 4 of 4 checks. The row "Read new plugins for paid services" was narrowed to plugins after `1b2cebf`. Three lessons took a `used` mark, and none was captured.
