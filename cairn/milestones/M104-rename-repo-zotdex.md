# M104: Rename the GitHub repo to zotdex

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the repo URL, the links on every page, and the build's issue reads change
- **Branch/PR:** m104-rename-repo-zotdex

## Goal

Rename the GitHub repo `jmgirard/zotero-plugin-index` to `jmgirard/zotdex` so the repo, the site (Zotdex), and GitHub search match, with the code and docs naming the new repo (D-070).

## Scope

**In:**
- `INDEX_REPO` (`src/build/build.ts`), the issue, discussion, and license links (`site/src/data.ts`), the upstream reader's user-agent, `package.json`'s name, the schemas' `title`, and the tests and fixtures that name the repo (`test/site.test.ts`, `test/text-request.test.ts`, `test/fixtures/build/responses.json`).
- The rename during implementation, before the merge: `gh repo rename zotdex`, `origin` set to the new URL, the description "Zotdex: a community index of Zotero 7+ plugins with tracked version compatibility", and a `zotdex` topic; then reads of the old repo URL, the old github.io address, and the Pages settings.
- README (title `# Zotdex`, the build's default repo, no text on the old github.io address), `CLAUDE.md`'s title, the CHANGELOG Unreleased section, and `cairn/DESIGN.md` (the repo name; what the old address answers).
- After the merge, the next build's deploy is read, as no deploy from the renamed repo runs before it.

**Out:**
- The localStorage keys and the start-test reporter's name and id: internal identifiers no user sees, unchanged.
- The user's local folder name: the user's.
- The author badge: the next milestone, from the row "Offer plugin authors a README badge".

## Acceptance criteria

- [x] AC1: `INDEX_REPO` in `src/build/build.ts` is `jmgirard/zotdex`; `LICENSE_HREF`, the issue-form base, and `FEEDBACK_HREF` in `site/src/data.ts` start with `https://github.com/jmgirard/zotdex`; the upstream reader's user-agent is `zotdex`; `package.json`'s name is `zotdex`; and each published schema's `title` starts with `Zotdex`. The site tests that read the built top bar, plugin pages, and About pass with the new repo URLs, and the build and text-request tests pass with API URLs under `repos/jmgirard/zotdex`.
- [x] AC2: Each line that `git grep -n 'zotero-plugin-index'` finds outside `cairn/`, `plugins/`, and CHANGELOG's released sections is one of: the start-test reporter's name or id, a localStorage key or the test trace of a removed one, the link sweep's refused old path, or the CHANGELOG Unreleased section's one line on the old github.io address.
- [x] AC3: Before the merge, `gh repo view jmgirard/zotdex --json name` reads `zotdex`; `git remote get-url origin` names `jmgirard/zotdex`; `gh api repos/jmgirard/zotdex/pages` reads `cname` `zotdex.jmgirard.com` with `https_enforced` true; and `curl -sI https://github.com/jmgirard/zotero-plugin-index` answers 301 to `https://github.com/jmgirard/zotdex`.
- [x] AC4: README's title is `# Zotdex`, and `grep -n -i -E 'jmgirard\.github\.io|forward' README.md` finds no line. In CHANGELOG's Unreleased section, the only text on the old github.io address is one line that says what `curl -sI https://jmgirard.github.io/zotero-plugin-index/about/` answers after the rename, and a bullet names the repo `https://github.com/jmgirard/zotdex`. In `cairn/DESIGN.md`, the purpose line names the repository zotdex, and the data-URL paragraph says what that curl answers after the rename.
- [x] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T1, T3
- AC3 → T2
- AC4 → T2, T3
- AC5 → T1, T3

## Tasks

- [x] T1: Change the repo name in code, schemas, `package.json`, the user-agent, and the tests and fixtures that name it.
- [x] T2: `gh repo rename zotdex --yes`; `git remote set-url origin` to the new URL; `gh repo edit` for the description and the `zotdex` topic; read the old repo URL, `https://jmgirard.github.io/zotero-plugin-index/about/`, and the Pages settings.
- [x] T3: README, `CLAUDE.md`, the CHANGELOG Unreleased section, and `cairn/DESIGN.md`, from T2's reads.

## Work log

- 2026-11-05: created by /milestone-plan.
- 2026-11-05: tier check: milestone — renames the public repo, changes links on every page, and needs a decision entry annotating D-069.
- 2026-11-05: idea vet: flaw — the rename likely ends the forward from `jmgirard.github.io/zotero-plugin-index/`, on which D-068 rests; the user judged that address unused and chose to rename and drop it from README. No gap.
- 2026-11-05: lessons used: 2026-10-28 (M036), 2026-10-31 (M066), 2026-10-26 (M018).
- 2026-11-05: collision check: absorbs the candidate row "Rename the GitHub repo to zotdex"; M102 and M103 (done) set the address and name; D-069 kept the repo name and D-070 annotates it and D-068; the badge row stays for the next plan.
- 2026-11-05: inbox sweep: no open issues; 14 open bot pull requests, none overlapping; a rename keeps them.
- 2026-11-05: criteria audit (full mode) returned 6 findings: D-070 records the user's acceptance that the old github.io address stops forwarding before the rename runs; DESIGN's repo line joined AC4; AC1, AC3, AC5, and proportionality had none; a read of the first deploy after the merge joined Scope In. Workflows read `GITHUB_REPOSITORY`, so they need no edit.
- 2026-11-05: re-audit of AC2 and AC4 after the question set: AC2's allowed line is the Unreleased section's one line; AC4's README search adds `forward`; AC4 allows one CHANGELOG line on the old address; D-070 also annotates D-068's README and forward clauses. All applied.
- 2026-11-05: question set: rename, remote, description, and topic — the agent runs them with gh during implementation.
- 2026-11-05: question set: the old github.io address — README drops it; CHANGELOG keeps one line on what it answers after the rename.
- 2026-11-05: plan gate chose renaming before the merge over after it, as GitHub forwards the old repo URLs the live site links to and the build reads the repo from `GITHUB_REPOSITORY`, so the read results can shape the docs before review; falsified by a renamed repo whose Pages deploy fails.
- 2026-11-05: implement started on m104-rename-repo-zotdex; untracked `.claude/` left unstaged.
- 2026-11-05: T1 done: `INDEX_REPO` `jmgirard/zotdex`; `LICENSE_HREF`, the issue-form base, and `FEEDBACK_HREF` under `https://github.com/jmgirard/zotdex`; user-agent `zotdex`; `package.json` name `zotdex`; schema titles `Zotdex entry fields` and `Zotdex published data`; the site, text-request, and build fixture URLs follow. pnpm test 2484 passed, pnpm check 0 problems.
- 2026-11-05: T2 done: `gh repo rename zotdex` ran; `origin` is `https://github.com/jmgirard/zotdex.git` and fetches; description "Zotdex: a community index of Zotero 7+ plugins with tracked version compatibility" and topic `zotdex` set. Reads: `https://github.com/jmgirard/zotero-plugin-index` and its `issues/new` answer 301 to the zotdex paths; `gh api repos/jmgirard/zotero-plugin-index` resolves to `jmgirard/zotdex`; Pages keeps `cname` `zotdex.jmgirard.com` with HTTPS enforced; 14 bot pull requests stay open. Old github.io addresses read past the cache (`x-cache: MISS`) answer 404, `about/?r=…` once gave a cached 301 aged 607 s.
- 2026-11-05: T3 done: README title `# Zotdex`, the build's default repo `jmgirard/zotdex`, and its old-address paragraph removed; `CLAUDE.md` title `# Zotdex`; CHANGELOG Unreleased drops the forward sentences and adds a repo bullet and one line that old github.io addresses answer 404; DESIGN's purpose line names `jmgirard/zotdex`, and its data paragraph says those addresses answer 404 since the rename. The plain `about/` address still gave an edge-cache 301 (age 779 s, `x-cache: HIT`), so a background read waits for it to expire. No new plain-English hit in README or CHANGELOG. pnpm test 2484 passed, pnpm check 0 problems.
- 2026-11-05: claim audit: 9 claims read, 2 corrected — CHANGELOG.md: the repo forward lasts while no new repo takes the old name; the 404 line held once the edge cache's 301 expired, about one hour after it was stored. Re-read: both hold.
- 2026-11-05: the plain `https://jmgirard.github.io/zotero-plugin-index/about/` now answers 404, as does the root. Implement done; status review.

## Decisions

## Review

Evidence at `d367037d`, 2026-11-05, re-verified after the one fix below.

- AC1: `src/build/build.ts:132` `INDEX_REPO = "jmgirard/zotdex"`; `site/src/data.ts:175`, `:178`, `:184` start with `https://github.com/jmgirard/zotdex`; `src/upstream/reader.ts:409` user-agent `zotdex`; `package.json` name `zotdex`; schema titles `Zotdex published data` and `Zotdex entry fields`. `pnpm test` passes the site tests that read the top bar, plugin pages, and About links, and the build and text-request tests with fixture URLs under `repos/jmgirard/zotdex`.
- AC2: the search lists CHANGELOG.md:13 (the Unreleased line on the old github.io address), `src/site/theme.ts:9`, `:21` and `test/support/theme-page.ts:4` (localStorage key), `test/site.test.ts:2158` (trace of a removed key), `src/start-test/reporter/manifest.json:3`, `:7` and `src/start-test/start-test.ts:15` (reporter name and id), and `test/site.test.ts:166` (the refused old path); no other line.
- AC3: before any merge, `gh repo view jmgirard/zotdex --json name` reads `zotdex`; `git remote get-url origin` is `https://github.com/jmgirard/zotdex.git`; `gh api repos/jmgirard/zotdex/pages` reads `cname` `zotdex.jmgirard.com`, `https_enforced` true; `curl -sI https://github.com/jmgirard/zotero-plugin-index` answers 301 with `location: https://github.com/jmgirard/zotdex`.
- AC4: README line 1 is `# Zotdex`, and `grep -n -i -E 'jmgirard\.github\.io|forward' README.md` finds no line. `curl -sI https://jmgirard.github.io/zotero-plugin-index/about/` answers `HTTP/2 404`; CHANGELOG's Unreleased section holds one line on the old address, lines 13-14 "now answer 404", and lines 10-12 name `https://github.com/jmgirard/zotdex`. `cairn/DESIGN.md` lines 11-12 name the repository `jmgirard/zotdex`, and line 254 says those old addresses answer 404 since the rename.
- AC5: `pnpm test` exits 0 with 35 files passed, 1 skipped, and 2484 tests passed, 6 skipped; `pnpm check` reads "checked 736 entries in plugins, 0 problems".
- Gate: `cairn_validate.py` all checks passed; the generic profile names no toolchain checks; no DESIGN principle changed.
- spawned: diff-bug, blame-history, prior-review, ripple
- prior-review: no regression of a past review point; the PR comment probe returned none.
- diff-bug #1: the 404 line held only after the edge cache's 301 expired — noted: it holds now, as AC4's read shows.
- diff-bug #2: DESIGN's "(named by D-069, D-070)" did not say which decision named what — fix now: "(the site named by D-069, the repository by D-070)".
- diff-bug #3: no test asserts the user-agent — reject, false as a defect: the value changes no behavior, as GitHub needs only that one is present.
- diff-bug #4, #5, #6: the schema `title`, the package name, and the build fixture's coupling to `INDEX_REPO` change nothing a consumer reads — noted.
- blame-history #1: the 404 line was unverified — reject, false: the rename ran in T2, and the plain read answers 404.
- blame-history #2: the browser-script caveat from M102 was removed — reject, planned change: the old address no longer forwards, so the caveat has no subject (D-070).
- blame-history #3: a local build before the rename reads a 404 for report issues — reject, false: the rename ran before review.
- blame-history #4-#6 and the unchanged storage keys and reporter id — noted; Scope Out names the keys and id.
- ripple #1: the candidate row "Rename the GitHub repo to zotdex" still reads as open — reject, planned change: it carries ` — started M104`, and this milestone's hygiene removes it.
- ripple #2: the link sweep still refuses the old Pages path — reject, false: it guards against that path coming back, and its comment says so.
- snapshot: no changed snapshot file.
