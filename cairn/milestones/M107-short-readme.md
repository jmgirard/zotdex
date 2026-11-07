# M107: Shorten the README and move its detail to docs/

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the README, the docs, and the About page are what visitors read
- **Branch/PR:** m107-short-readme

## Goal

`README.md` becomes a short overview for a first-time visitor, and its other
text moves, unchanged except for links and references, into five files under
`docs/`.

## Scope

**In:** a new README under 150 lines; the old sections moved into
`docs/site.md` (The site), `docs/data.md` (Using the data, Plugin entries),
`docs/requests.md` (Proposing a plugin with an issue, Reporting whether a
plugin works, Changing a plugin's name or description, Removing a plugin),
`docs/maintaining.md` (Setup, Adding a plugin, Finding new plugins with its
other two `###` parts, Checking entries, Building the data, Starting plugins
in Zotero, Building the site, Finding description gaps, The daily build,
Running the tests), and `docs/license.md` (License); link and reference fixes;
the About page's License link and text; outside text that cites a moved README
section.

**Out:** condensing the moved text → candidate row "Condense the docs moved
from README". Released `CHANGELOG.md` entries stay as they are. The deploy
of the About change waits for a `Build data` run (offered after the merge).

## Acceptance criteria

- [x] AC1: `README.md` has at most 150 lines by `wc -l`. It holds the old
  README's opening paragraph unchanged, a link to
  `https://zotdex.jmgirard.com/`, the data file address and its two schema
  addresses, a link to
  `https://github.com/jmgirard/zotdex/issues/new?template=<file>` for each of
  the five files under `.github/ISSUE_TEMPLATE/`, a relative link to each of
  the five files under `docs/`, and a license part of at most 6 lines that
  names the MIT License for the code and CC0 1.0 for the facts, categories,
  and maintainer text, and links to `docs/license.md`.
- [x] AC2: Each `##` and `###` section of the old README
  (`git show main:README.md`; a section runs from its heading to the next
  heading of any level) is in exactly one of the five `docs/` files, in the
  old order within that file, under the same heading text. Its heading level
  may change. Each docs file starts with one `#` title, and no other text
  sits outside old sections. A `#` title may be an old section's heading
  raised to level 1, and it then counts as that heading. Each old heading
  text occurs once as a heading across `docs/*.md`. Each old section's text,
  with wrapped lines joined, equals its new copy except for link targets
  changed so that AC3 holds, and the reference edits of AC3 and AC4. The
  evidence is a script that prints each joined line that differs.
- [x] AC3: Every inline Markdown link in `README.md` and `docs/*.md` (they use
  no reference-style links) whose target is a repo path or a `#` anchor
  resolves relative to the linking file's folder, as GitHub does, to an
  existing file and, for an anchor, to a heading of that file by GitHub's
  slug rule. A list of each quoted heading name (`"…"`) and each
  `above`/`below` phrase in the moved text shows each one that points to text
  now in another file, and each such reference names that file in place of
  `above` or `below`, the site section's `"License" below` included.
- [x] AC4: A search for `README` in `src/`, `site/src/`, `test/`, `.github/`,
  `schemas/`, `cairn/DESIGN.md`, `docs/license.md`, and the `## Unreleased`
  part of `CHANGELOG.md` lists every hit. Each hit that names a README
  section, or says that the README holds text now under `docs/`, names the
  `docs/` file or files that now hold it. Released `CHANGELOG.md` entries
  stay as they are.
- [x] AC5: The About page's License link targets
  `https://github.com/jmgirard/zotdex/blob/main/docs/license.md`. Its License
  card says "the files that the license page names" in place of "the files
  that the README names", and the link text reads "license page" in place of
  "README's License section". `test/site.test.ts` asserts the new target and
  both new phrases.
- [x] AC6: `CHANGELOG.md` gets one `## Unreleased` entry saying that the
  README now holds an overview, that its detail moved to the five `docs/`
  files it names, and that the About page's License link goes to
  `docs/license.md`. `pnpm test` passes.

## Coverage

- AC1 → T3, T7
- AC2 → T1, T2, T7
- AC3 → T2, T7
- AC4 → T2, T4, T7
- AC5 → T5, T7
- AC6 → T6, T7

## Tasks

- [x] T1: Write a split script in the session scratchpad (not committed) that
  cuts `git show main:README.md` at its headings into the five `docs/` files,
  each with its `#` title (`docs/license.md` raises `## License`), and run it.
- [x] T2: In the moved text, change link targets so they resolve from
  `docs/` (`LICENSE` → `../LICENSE`, `schemas/…` → `../schemas/…`,
  `#license` → `license.md#license`, and the like), make each quoted heading
  and `above`/`below` reference that points to another file name it, and make
  License's own "this section" and "this README" statements name the files.
- [x] T3: Write the new `README.md` per AC1, from same-session reads of the
  old opening, the issue forms, and `docs/license.md`.
- [x] T4: Update outside text that cites a moved section: `cairn/DESIGN.md`
  (the two README "Building the data" mentions), `.github/workflows/build.yml`
  (comments near lines 58 and 66), the `test/check.test.ts:194` comment, the
  three README mentions in `schemas/plugins.v1.schema.json` (:78, :147) and
  `schemas/index.v1.schema.json` (:72), and the Unreleased badge entry of
  `CHANGELOG.md`; then run AC4's search for the rest.
- [x] T5: Change `LICENSE_HREF` in `site/src/data.ts`, the License card in
  `site/src/pages/about.astro`, and the license test in `test/site.test.ts`
  (its title included) per AC5.
- [x] T6: Add the `## Unreleased` entry of AC6.
- [x] T7: Run the link check, the joined-line diff, the heading-uniqueness
  check, the long-line check
  (`git diff -U0 main | grep '^+' | awk 'length > 80'`), and
  `npx -y pnpm@12.15.0 test` with its output sent to a file and `$?` read.

## Work log

- 2026-11-06: created by /milestone-plan.
- 2026-11-06: tier check: milestone — moves about 1,900 lines and needs a layout decision.
- 2026-11-06: idea vet: gap — move the text, cut it, or condense it; the request left this open and gave different results, so it went to the question set, which chose move unchanged. No flaw.
- 2026-11-06: lessons used: 2026-10-26 (M018) joined-copy search, 2026-10-28 (M036) long lines after an Edit, 2026-10-31 (M066) a merge deploys nothing until `Build data` runs.
- 2026-11-06: collision check: no D-entry, archive, or ROADMAP row covers a README move; D-063 sets license terms, not where they are written. Inbox sweep: 0 open issues; 14 open bot PRs, none overlapping.
- 2026-11-06: no test reads README text; the site links to README `#license` (`site/src/data.ts:182`), which this milestone moves.
- 2026-11-06: question set: what happens to the moved text — move it unchanged.
- 2026-11-06: question set: docs layout — four files by reader (license became a fifth by the next answer).
- 2026-11-06: question set: License — move it to `docs/license.md`; the README keeps a short summary, and the About page changes.
- 2026-11-06: plan gate chose an unchanged move over move-and-condense because a move keeps every claim as checked and fits one PR; falsified by readers still finding the docs too long to use.
- 2026-11-06: plan gate chose four files by reader over one file per section and one guide file because each reader opens one file of moderate size; falsified by links into the docs needing finer files.
- 2026-11-06: plan gate chose moving License to docs over keeping it in README, at the user's choice, at the cost of a site link and text change; falsified by readers or tools that expect the terms in the README.
- 2026-11-06: criteria audit (full mode, first draft): 12 findings, all taken toward the narrower promise — form links as `issues/new?template=`; section bounds and level changes; AC2 bound to the text, not the script; heading uniqueness; links resolved per file; inline links only; references found by quoted names and above/below; the `"License" below` case; hits that say the README holds moved text; `#license` checked as a heading; `#` titles allowed.
- 2026-11-06: criteria audit (full mode, revised draft): 8 findings, taken — AC2 limited to `##`/`###` sections; a `#` title may be the raised old heading; link-target changes allowed; AC4 names the file or files; `schemas/` added to AC4's search; AC3 names the file in place of above/below; AC5 says "license page"; AC5's test sentence is test scope. No finding on AC1, AC6, or decisions.
- 2026-11-06: implement started on m107-short-readme; `.claude/` is untracked and stays unstaged.
- 2026-11-06: T1 done: a scratchpad script cut `git show main:README.md` at its 21 headings into the five docs files (2,063 lines); site.md and license.md take their raised heading as title, data.md is "Data", requests.md "Requests", maintaining.md "Maintaining the index", and "Proposing a plugin with an issue" rose to `##`.
- 2026-11-06: T2 done: 23 paragraphs changed, each a link-target change (`../LICENSE`, `../schemas/…`, `license.md#license`) or a reference that now names its file; a scratchpad check (`check_move.py`) reports 0 structural problems, and planted defects (a dropped word, a bad anchor, a duplicated section) each showed. Same-file above/below references stay.
- 2026-11-06: the simple-english style hook flags long sentences and modals in moved text; left as is, since the plan moves that text word for word (question set answer).
- 2026-11-06: T3 done: new README of 55 lines with sections The site, The data, Asking for a change (the five forms as `issues/new?template=<file>`, as `site/src/data.ts` builds them, plus Discussions), Documentation, and License (6 lines); its links pass the check.
- 2026-11-06: T4 done: all of `CHANGELOG.md` sits under `## Unreleased`, so AC4 covered 12 of its README mentions, now naming `docs/site.md`, `docs/data.md`, `docs/maintaining.md`, or `docs/license.md`; also DESIGN.md (2), build.yml (2), the check.test.ts comment, and 3 schema descriptions. Remaining hits name plugin authors' READMEs, the badge, or file names (T7 lists them).
- 2026-11-06: T5 done: the license test, changed first, failed on the old `#license` link (Received `https://github.com/jmgirard/zotdex#license`), then passed after `LICENSE_HREF` and the About card changed.
- 2026-11-06: T6 done: one `## Unreleased` entry naming the five docs files and the License link.
- 2026-11-06: T7 done: README 55 lines; `check_move.py` 0 structural problems, 23 changed paragraphs (all link or reference edits); AC4 search leaves only plugin-README, badge, file-name, and docs-naming hits; long-line check rewrapped 6 CHANGELOG lines and 2 workflow comments; `pnpm test` 2508 passed, 6 skipped; `pnpm check` 741 entries, 0 problems.
- 2026-11-06: merged origin/main (M108 plan, cairn/ only) into the branch; the ROADMAP conflict kept both rows; `pnpm test` 2508 passed, 6 skipped, and `pnpm check` 0 problems after the merge.
- 2026-11-06: claim audit: 74 claims read, 3 corrected — README.md (About names four topics, not "each fact"), CHANGELOG.md (the move also changed two license sentences), test/check.test.ts (the comment claimed an empty-value limit that no docs file states, a gap from before this branch); the same reader re-read all three as OK.
- 2026-11-06: the docs never state that an override's `value` must not be empty; filed as parked candidate row "Say that an override value needs text", since the moved text stays unchanged here.
- 2026-11-06: after the last full `pnpm test`, only README and CHANGELOG prose and one test comment changed; status set to review.

## Decisions

## Review

- AC1 evidence (2026-11-06, head e775fca3): `wc -l README.md` 56; lines 1-7 equal `git show main:README.md` lines 1-7; one each of the site link, the data address, and the two schema addresses; one `issues/new?template=<file>` link for each of the 5 files under `.github/ISSUE_TEMPLATE/`; a relative link to each of the 5 docs files; the License part has 6 non-blank lines naming the MIT License and CC0 1.0 and linking `docs/license.md`.
- AC2 evidence (head e775fca3): the scratchpad `check_move.py` against `git show main:README.md` (20 `##`/`###` sections) reports 0 structural problems: each heading once across `docs/*.md`, old order kept, one `#` title per file (`Data`, `License` raised, `Maintaining the index`, `Requests`, `The site` raised), no text outside sections. It prints 23 changed joined paragraphs, the same list the implement session read word by word: each is a link-target change or a reference that now names its file, plus the two license sentences of AC4. Planted defects (dropped word, duplicate section, bad anchor) each showed at implement.
- AC3 evidence (head e775fca3): the same script resolves each inline link in README.md and docs/*.md from its own folder and each anchor by GitHub's slug rule, 0 problems; no reference-style links (`grep '\]\['` empty). The scratchpad `refs.py` lists 60 references: 24 quoted headings that live in another file, all naming that file; 23 above/below phrases, each pointing inside its own file (the site section's `"License"` now names `license.md`).
- AC4 evidence (head e775fca3): `grep -rn README` over `src/ site/src/ test/ .github/ schemas/ cairn/DESIGN.md docs/license.md` lists 33 hits; none names a README section or says the README holds moved text: they are plugin authors' READMEs, `README.md` fixture file names, the badge, the source-code rule's name list, `docs/license.md`'s list of places that can quote text, and DESIGN.md's "moved from README by M107" note. `CHANGELOG.md` (all of it under `## Unreleased`) had 15 README mentions on main; 12 now name the docs file that holds the text, and the rest are the badge, a plugin's README, and the new entry.
- AC5 evidence (head 9aaac2da): `site/src/data.ts:182` sets `LICENSE_HREF` to `https://github.com/jmgirard/zotdex/blob/main/docs/license.md`; `about.astro:297` says "the files that the license page names" and `:302` has link text "license page"; `test/site.test.ts:907-910` asserts the target, the link text, and the sentence. `vitest run test/site.test.ts test/check.test.ts`: 2 files passed, 637 tests passed, 1 skipped. At implement the changed test failed on the old link first (work log T5).
- AC6 evidence (head 9aaac2da): `CHANGELOG.md:5-9` is one `## Unreleased` entry saying the README holds an overview, naming the five docs files, and saying the About License link goes to `docs/license.md`. `npx -y pnpm@12.15.0 test` exit 0: 37 files passed, 1 skipped; 2508 tests passed, 6 skipped.
- Consistency gate: `cairn_validate.py` exit 0, all checks passed; the generic profile names no toolchain checks; no principle changed, so no impact report.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: the published schemas cite bare `docs/site.md` and `docs/data.md`, which a reader of the schema at zotdex.jmgirard.com cannot follow — fix now, fixed 4f576bc4
- diff-bug #2: the new License link reaches users only after a `Build data` run — reject (false as a defect): until then the live `zotdex#license` link still lands on the README's `## License` heading; the run is offered after the merge
- diff-bug #3: README "The code is under the MIT License." omits the third-party exception — fix now, fixed 4f576bc4
- diff-bug #4: data.md's "description rule in [site.md](site.md)" has no anchor — reject (false): site.md has no heading for the rule, so the file link is the most exact target
- diff-bug #5: site.md's "in "License" in [license.md]" reads with two "in"s — reject (style)
- diff-bug #6: the workflow comment rewrap leaves a short line and lines of 81 to 83 characters — reject (style): comments only, neighbors run to 92
- diff-bug #7: the changelog's "changed only links" — reject (false): each changed reference adds a link, the site's "License" one included
- diff-bug #8: local `main` lags `origin/main`, so `git diff main..HEAD` shows M108's cairn files — reject (false as a defect): those files came in by the merge of origin/main and are not M107 work
- diff-bug #9: AC5 and AC6 had no evidence — reject (false): evidence written at 9aaac2da..f250d79b
- blame-history #1: `LICENSE_HREF` names a file that main lacks until the merge — reject (false): only a build from main deploys, after the merge
- blame-history #2: the ragged workflow comment — reject (style)
- blame-history #3: DESIGN.md:512 runs past its neighbors' width — reject (style)
- blame-history #4: the schemas cite repo paths, not URLs — fix now (same as diff-bug #1), fixed 4f576bc4
- prior-review #1: the ragged workflow comment — reject (style)
- prior-review #2: five README form-link lines exceed 80 columns — reject (style): each is one unbreakable URL
- prior-review #3: about.astro:297 is a 112-character line — reject (style): the line was long on main and the file wraps near 120
- ripple #1: the new candidate row says M107 "moves" the lines — fix now, fixed 4f576bc4
- After the fixes: `npx -y pnpm@12.15.0 test` exit 0, 2508 passed, 6 skipped; both schemas parse; `check_move.py` 0 problems; README 56 lines, license part 6 lines. No finding met the return floor (none shows a criterion failing or a defect users meet), so status stays `review`. Open-PR cap read: 0 open PRs of mine. No snapshot files changed.
- ripple #2: DESIGN.md:1016 "moved from README by M107" — reject (false): the note is true and points at the right file
- ripple #3: CHANGELOG.md:116 "README or another of its upstream files" — reject (false): it names a plugin's README
