# M090: Fill the six later description gaps

**Status:** done (2026-11-03, PR #825 https://github.com/jmgirard/zotero-plugin-index/pull/825)

**Goal:** With this milestone's overrides, the deployed data whose `generatedAt` is 2026-11-03T22:05:15.306Z shows an English description of at least six words for `zoterotransnator@euclpts.com`, `zotfetch@edslab.research`, `zotfetch@nikhilweee.me`, `zoturead@zotero.org`, `zotwanglele@wanglele.com`, and `zotxt@e6h.org`.

**Outcome:** 6 `description` overrides with no `version`, each from the plugin's README: 4 short and 2 cjk gaps that the first data file of that day hid, since its build did not read these plugins. `pnpm description-gaps` prints 0 gaps on `plugins-data-2026-11-03b.json`. The overrides add 9 categories: 7 marked right, and 2 on the `export` `exclude` list in `src/site/categories.ts`. The `CHANGELOG.md` entry now says 86. The ledger is `cairn/references/description-ledger-2026-11-03.md`, section "Later gaps (M090)".

**Decisions:** none. `zotfetch@edslab.research`'s text names Sci-Hub mirrors among its sources, as its README does, since naming only open-access sources suggested legal sourcing.

**Review:** Four-lens fan-out, 32 findings: 16 fixed, none sent to candidate rows, 16 rejected. Fixed: five texts (`zotfetch@edslab.research`'s source list, `zotxt`'s causal claim, `zotwanglele`'s missing whole-PDF translation, `zoturead`'s tie to one site, `zotfetch@nikhilweee.me`'s user-data assurance, which also removed two excludes), `zoterotransnator`'s cost estimate as a setting, two reasons to DESIGN's words, and the ledger, `INDEX.md`, and two rows that M090 made stale. The claim audit read 57 claims and corrected 2. Hygiene: the row "Fill description gaps on new plugins" narrowed and lost its started token; no lesson captured.
