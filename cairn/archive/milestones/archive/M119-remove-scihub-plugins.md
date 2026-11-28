# M119: Remove plugins with Sci-Hub built in

**Status:** done (2026-11-10, PR #889 https://github.com/jmgirard/zotdex/pull/889)

**Goal:** Before Zotdex is advertised, remove the listed plugins that name and have built in Sci-Hub or a site like it,
and hold new bot pull requests that name such a site for the maintainer.

**Outcome:** `sites.json` (schema `schemas/sites.schema.json`, reader and match `src/check/sites.ts`) lists Sci-Hub
(US 2017, FR 2019, IN 2025) and Anna's Archive (NL 2024, US 2026) with five source notes; `pnpm check` refuses, as
`sites-file`, rulings from fewer than two countries, a repeated site, a non-ISO country, an impossible date, or two
names that match the same texts. Sweep ledger `cairn/references/listed-site-sweep-2026-11-09.md`: six matches, all
removed (`delisted.json` ground `copyright`, issues #883 to #888, closed as `Removed …`; entries deleted). The bot's
seventh hold reason `listed-site` matches the manifest name and description, GitHub description, repo name in
GitHub's case (`repoNameAsGiven`), and topics; `refresh-holds` reads the GitHub texts again. Docs: the hold, a
three-item removal-issue outline in the issue body, closing a held pull request under a removal ground.

**Decisions:** D-087 (the hold, whole-run match, a tripwire; a held pull request closes under a ground with its own
`delisted.json` record; annotates D-033, D-053); D-088 (case split, marks, seventh reason; corrects D-087).

**Review:** user override to a short issue outline; AC3 amended once at a user stop; claim audits 133 and 126 claims,
9 corrected; review return 1 (repo name matched in lowercase); passes 2 and 3 of four lenses, 49 findings: 28 fixed,
17 rejected, 4 to Known issues (glued or accented names escape the match; a hold is decided at the draft; Library
Genesis not listed). Lessons: 5 marked used M119; none captured (at the 25-lesson limit).
