# M107: Shorten the README and move its detail to docs/

- **Status:** in-progress
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

- [ ] AC1: `README.md` has at most 150 lines by `wc -l`. It holds the old
  README's opening paragraph unchanged, a link to
  `https://zotdex.jmgirard.com/`, the data file address and its two schema
  addresses, a link to
  `https://github.com/jmgirard/zotdex/issues/new?template=<file>` for each of
  the five files under `.github/ISSUE_TEMPLATE/`, a relative link to each of
  the five files under `docs/`, and a license part of at most 6 lines that
  names the MIT License for the code and CC0 1.0 for the facts, categories,
  and maintainer text, and links to `docs/license.md`.
- [ ] AC2: Each `##` and `###` section of the old README
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
- [ ] AC3: Every inline Markdown link in `README.md` and `docs/*.md` (they use
  no reference-style links) whose target is a repo path or a `#` anchor
  resolves relative to the linking file's folder, as GitHub does, to an
  existing file and, for an anchor, to a heading of that file by GitHub's
  slug rule. A list of each quoted heading name (`"…"`) and each
  `above`/`below` phrase in the moved text shows each one that points to text
  now in another file, and each such reference names that file in place of
  `above` or `below`, the site section's `"License" below` included.
- [ ] AC4: A search for `README` in `src/`, `site/src/`, `test/`, `.github/`,
  `schemas/`, `cairn/DESIGN.md`, `docs/license.md`, and the `## Unreleased`
  part of `CHANGELOG.md` lists every hit. Each hit that names a README
  section, or says that the README holds text now under `docs/`, names the
  `docs/` file or files that now hold it. Released `CHANGELOG.md` entries
  stay as they are.
- [ ] AC5: The About page's License link targets
  `https://github.com/jmgirard/zotdex/blob/main/docs/license.md`. Its License
  card says "the files that the license page names" in place of "the files
  that the README names", and the link text reads "license page" in place of
  "README's License section". `test/site.test.ts` asserts the new target and
  both new phrases.
- [ ] AC6: `CHANGELOG.md` gets one `## Unreleased` entry saying that the
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
- [ ] T4: Update outside text that cites a moved section: `cairn/DESIGN.md`
  (the two README "Building the data" mentions), `.github/workflows/build.yml`
  (comments near lines 58 and 66), the `test/check.test.ts:194` comment, the
  three README mentions in `schemas/plugins.v1.schema.json` (:78, :147) and
  `schemas/index.v1.schema.json` (:72), and the Unreleased badge entry of
  `CHANGELOG.md`; then run AC4's search for the rest.
- [ ] T5: Change `LICENSE_HREF` in `site/src/data.ts`, the License card in
  `site/src/pages/about.astro`, and the license test in `test/site.test.ts`
  (its title included) per AC5.
- [ ] T6: Add the `## Unreleased` entry of AC6.
- [ ] T7: Run the link check, the joined-line diff, the heading-uniqueness
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

## Decisions

## Review
