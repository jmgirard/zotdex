# M089: Fill the description gaps of 2026-11-03

**Status:** done (2026-11-03, PR #824 https://github.com/jmgirard/zotero-plugin-index/pull/824)

**Goal:** Each plugin that `pnpm description-gaps` lists for the deployed data of 2026-11-03 shows an English description of at least six words, from an index override.

**Outcome:** 80 `description` overrides with no `version` in `plugins/<id>/index.json`: 15 missing, 18 short, and 47 cjk gaps, none `kept`, so the command prints 0 gaps on that data. Each text comes from the plugin's README or another upstream file, and each `reason` names it and the case of each upstream text. The overrides added 53 categories: a hand read marked 32 right, and the other 21 went on `exclude` lists in `src/site/categories.ts`. `README.md` and `.github/ISSUE_TEMPLATE/text-change.yml` now say that an override hides both upstream texts. `CHANGELOG.md` has the entry. The ledger is `cairn/references/description-ledger-2026-11-03.md`.

**Decisions:** none. Texts leave out a README's privacy and safety assurances, and features it marks unreleased, since an override states them in the index's voice and has no `version`. A model named as a translation engine counts as right under `ai`, as `category-ledger.md` marks such plugins.

**Review:** Four-lens fan-out, 26 findings: 8 fixed, 3 follow-ups, 15 rejected. Fixed: `zoteropaperagent`'s QR code login step, which `doc/3_1_Introduction_EN.md` makes stale; privacy and safety claims in 6 texts; six `ai` excludes that contradicted `category-ledger.md`; `paperplanex`'s submodule source; the override count in the row "Refine the Latin part and short picks"; `README.md` and the text-change form on overrides. Follow-ups: paid-service reads of `zotero@wilddata.cn` and `zotbox` went to "Read new plugins for paid services", and excludes that outlive an override went to the new parked row "Drop excludes left by removed overrides". The claim audit read 717 claims and corrected 12. Hygiene: the row "Close gaps in the description pick" graduated; one lesson captured, and the 2026-10-31 (M069, used M071) lesson evicted by rank at the limit.
