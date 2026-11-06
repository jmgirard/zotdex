# M104: Rename the GitHub repo to zotdex

- **Status:** in-progress
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

- [ ] AC1: `INDEX_REPO` in `src/build/build.ts` is `jmgirard/zotdex`; `LICENSE_HREF`, the issue-form base, and `FEEDBACK_HREF` in `site/src/data.ts` start with `https://github.com/jmgirard/zotdex`; the upstream reader's user-agent is `zotdex`; `package.json`'s name is `zotdex`; and each published schema's `title` starts with `Zotdex`. The site tests that read the built top bar, plugin pages, and About pass with the new repo URLs, and the build and text-request tests pass with API URLs under `repos/jmgirard/zotdex`.
- [ ] AC2: Each line that `git grep -n 'zotero-plugin-index'` finds outside `cairn/`, `plugins/`, and CHANGELOG's released sections is one of: the start-test reporter's name or id, a localStorage key or the test trace of a removed one, the link sweep's refused old path, or the CHANGELOG Unreleased section's one line on the old github.io address.
- [ ] AC3: Before the merge, `gh repo view jmgirard/zotdex --json name` reads `zotdex`; `git remote get-url origin` names `jmgirard/zotdex`; `gh api repos/jmgirard/zotdex/pages` reads `cname` `zotdex.jmgirard.com` with `https_enforced` true; and `curl -sI https://github.com/jmgirard/zotero-plugin-index` answers 301 to `https://github.com/jmgirard/zotdex`.
- [ ] AC4: README's title is `# Zotdex`, and `grep -n -i -E 'jmgirard\.github\.io|forward' README.md` finds no line. In CHANGELOG's Unreleased section, the only text on the old github.io address is one line that says what `curl -sI https://jmgirard.github.io/zotero-plugin-index/about/` answers after the rename, and a bullet names the repo `https://github.com/jmgirard/zotdex`. In `cairn/DESIGN.md`, the purpose line names the repository zotdex, and the data-URL paragraph says what that curl answers after the rename.
- [ ] AC5: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T1, T3
- AC3 → T2
- AC4 → T2, T3
- AC5 → T1, T3

## Tasks

- [x] T1: Change the repo name in code, schemas, `package.json`, the user-agent, and the tests and fixtures that name it.
- [x] T2: `gh repo rename zotdex --yes`; `git remote set-url origin` to the new URL; `gh repo edit` for the description and the `zotdex` topic; read the old repo URL, `https://jmgirard.github.io/zotero-plugin-index/about/`, and the Pages settings.
- [ ] T3: README, `CLAUDE.md`, the CHANGELOG Unreleased section, and `cairn/DESIGN.md`, from T2's reads.

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

## Decisions

## Review
