# M093: Let people ask to remove a plugin

**Status:** done (2026-11-04, PR #832 https://github.com/jmgirard/zotero-plugin-index/pull/832)

**Goal:** A plugin's owner or any reader can ask from the site to remove a listed plugin, and a removed plugin stays off the index.

**Outcome:** `.github/ISSUE_TEMPLATE/remove-plugin.yml` opens a public issue with the `remove-plugin` label, a plugin id, a reason, and evidence. Each plugin page (`removeHref`) and an About section link to it. A top-level `delisted.json` (`schemas/delisted.schema.json`, `src/check/delisted.ts`) lists each removed repo, its `issue` and `date`, and any `ids` judged unique to it. `pnpm check` adds the rules `delisted-id`, `delisted-repo`, and `delisted-file`, for any `dir`, from the package root or `ZPI_DELISTED`. `pnpm discover` skips a listed repo as `delisted` with no read, and `draftEntry` refuses `delisted` and `delisted-id` after a read, unrecorded in the state. An "Add a plugin" issue gets the refusal comment and a not-planned close. The merge job's check stops a listed bot pull request. A missing or refused list stops discovery and fails the issue read. A copy under a new name is covered only if it keeps a listed id. README "Removing a plugin" gives the maintainer's steps.

**Decisions:** D-062 (the four grounds for a removal, and why the list exists). The plan split the audit's request into M093, M094, and M095, chose a checked-in list over more skip logic, and one form over two.

**Review:** Criteria audit (full) 12 findings, all applied. Claim audit 90 claims, 5 corrected, then one narrowed at its re-read. Four-lens fan-out, 34 finding reports: 20 fixed (typed list option and handoff test, unrecorded refusals, owner check step, `.git` handling and schema, tests, stale README and DESIGN lines); 4 sent to the new parked row "Close gaps in the delisted list reads"; 9 rejected (6 false, 1 edge, 1 planned change, 1 style); 1 amendment of AC5, whose wording the user chose after a second re-audit. Lessons marked used: M015, M021, M035, M036, M066, M082 (`pnpm test`). None captured or retired. No Known issues entry.
