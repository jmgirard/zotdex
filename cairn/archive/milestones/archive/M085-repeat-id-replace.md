# M085: Let an older, larger repo ask for a listed add-on id

**Status:** done (2026-11-03, PR #815 https://github.com/jmgirard/zotero-plugin-index/pull/815)

**Goal:** When a repo older and far larger than the repo that lists its add-on id appears, the bot asks the maintainer through a held pull request, and the entries for pdf2zh and Beaver move to their larger repos now.

**Outcome:** New hold reason `replaces-entry`, for an exact id, outside issue runs, with no open pull request on that id, when the read repo is older, has at least 20 stars, and has at least 10 times the listed repo's stars (`replacedEntry`, `farLarger`). The pull request changes only `meta.json`, is titled `Replace a listed repo with <repo>`, and shows both repos' creation day, stars, and GitHub latest release, plus each override and `paidService` value of the kept `index.json` (`keptLines`). The write step skips with `listed-changed` when the id no longer lists the compared repo. `pnpm refresh-holds` takes a pull request with one modified `meta.json` (`changedMeta`). `pdf2zh@guaguastandup.com` and `beaver@jlegewie.com` moved to `guaguastandup/zotero-pdf2zh` and `jlegewie/beaver-zotero`, each read for a paid service, no mark. `zoteroshortdoi@wiernik.org` and `zoteropreview@carter-tod.com` stayed by the maintainer's choice. `cairn/references/repeat-id-ledger.md` holds the 19 refused pairs from 30 discover runs.

**Decisions:** D-056.

**Review:** Fan-out of four lenses, then diff-bug, blame-history, and ripple on the fixes, with one defect return for AC2 (the body named only `paidService.note`). Of 49 findings, 21 were fixed, 22 rejected (one as edge: a repo listing two ids), 5 went to the new parked row "Tighten the reads behind replaces-entry", and 1 was noted. The row "Review repeats of a listed add-on id" graduated, and "Flag copies listed before the original" narrowed to what the test misses and moved to parked. No lesson retired, one captured.
