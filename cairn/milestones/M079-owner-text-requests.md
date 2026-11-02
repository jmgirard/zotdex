# M079: Let owners request name and description changes

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — plugin owners use the form, and each plugin page links to it
- **Branch/PR:** m079-owner-text-requests

## Goal

A plugin's repository owner can ask, through a form linked from the plugin page, for a stated name or description within published rules, and the maintainer can check and apply the request with one command.

## Scope

**In:** An issue form with the rules, and a link to it in each plugin page's Details card. `src/text-request/` holds the rules and `pnpm text-request <issue> --data <file>`, which prints the facts and problems of a request and, with `--apply`, writes or removes the override. Upstream edits stay the first choice, as the form says. D-049, README, About, DESIGN, the two schemas' text, and CHANGELOG state the rule. The user allowed creating the `text-change` label and one hand run of Build data after the merge.

**Out:**
- A bot that answers requests or opens pull requests: row "Answer text change requests with a bot".
- Rechecking existing names, descriptions, and overrides against the new limits: no work is planned, as the rules apply to requests only.
- Telling English from other languages that are not Chinese, Japanese, or Korean: the maintainer reads the text, since a detector needs a new dependency.
- A check that the author has write access to the repo: the API does not tell the index that, so the maintainer checks a non-owner or an organization by hand.

## Acceptance criteria

- [x] AC1: `.github/ISSUE_TEMPLATE/text-change.yml` is an issue form that adds the label `text-change`, with required inputs `plugin` and `field` (a dropdown of `name` and `description`) and an optional `text` input. Its words state that the repository's owner files it, that editing the plugin's manifest or GitHub About text upstream comes first, that a blank `text` asks to remove the index's override, that the text is in English, the format (one or two plain sentences that say what the plugin does, with the point in the first 120 characters), and the limits `NAME_MIN`, `NAME_MAX`, `DESCRIPTION_MIN_WORDS`, and `DESCRIPTION_MAX`. A test reads the file and checks the input ids, the labels that the parser reads, the options, the issue label, and that it states the value of each of those four constants.
- [x] AC2: Every plugin page that `pnpm site` writes from the site test fixture, as `htmlFiles(out)` lists them, has in its Details card one link with `data-text-change` whose `href` is `https://github.com/jmgirard/zotero-plugin-index/issues/new?template=text-change.yml&plugin=<the encoded id>`. The home and About pages have none.
- [x] AC3: `textProblems` runs on non-blank text, after removing outer spaces, and returns one named problem for each rule that the text breaks. A `description` breaks a rule when it has under 6 words (runs of letters, marks, and digits), over 200 code points, a character of category `Cc`, `Cf`, `Zl`, or `Zp`, a URL (`http://`, `https://`, or `www.`, ignoring case), a `<`, a CJK share of 0.5 or more, or only repeats the plugin's name. A `name` breaks a rule when it has under 2 or over 40 code points, a character of those categories, a URL, a `<`, a first character that is not a letter or digit, or a CJK share of 0.5 or more. A test fires each rule with its condition asserted, and texts at 6 words, 200 code points, 2 code points, and 40 code points return no problem.
- [x] AC4: `pnpm text-request <issue> --data <file>` reads all lines under each heading of the issue body from the GitHub API, and the owner's `login` and `type` from `GET /repos/<owner>/<repo>` for the entry's `repoUrl`. It prints, as JSON-quoted values with control and format characters escaped, the plugin id, the field, the text, the issue author's login, the owner, whether the two match ignoring case, each problem from `textProblems`, each other record whose display name has the same non-empty `nameKey` as a requested name, the categories that the request adds (`categories` on the data record with the checkout's overrides after the edit that `--apply` makes, minus the same call before it), any override with a `version` that would still win over the text, and, for a blank text, the description gap that `gapOf` finds after the removal. For an owner of type `Organization`, it prints that the maintainer must check the author by hand. It exits 0 when `--apply` can write without `--owner-checked`, 1 with a problem, a mismatch, or an organization owner, and 2 on a named failure: an unknown plugin id, no entry in the checkout, an issue without the `text-change` label, a field other than the two, a missing heading, a failed issue read, a failed owner read, or an unreadable data file. A test on recorded responses shows each output and each failure.
- [x] AC5: With `--apply`, the command writes the request to `plugins/<id>/index.json`. A non-blank text adds a `{field, value, reason}` override with no `version`, or replaces the override of that field with no `version`. A blank text removes that override, and with no such override it changes nothing. Overrides with a `version`, and overrides of other fields, stay as they are. The `reason` names the issue and says that the repository's owner asked for the text. It writes nothing on a problem or a named failure, or when the author does not match the owner or the owner is an organization, unless `--owner-checked` is given. A test shows each of these, and `pnpm check` passes on each written entry.
- [x] AC6: The About page's Overrides section says that a repository's owner can ask for a name or description override, and a site test reads the values of the four constants of AC1 from the built page. `cairn/DECISIONS.md` holds D-049. README, `cairn/DESIGN.md` (Data sources item 3), `CHANGELOG.md` Unreleased, and the `overrides` and `reason` text of `schemas/index.v1.schema.json` and `schemas/plugins.v1.schema.json` state the same rule. `gh label list` shows `text-change`.
- [x] AC7: The active profile's verify slot is clean: `pnpm test` and `pnpm check`.

## Coverage

- AC1 → T2
- AC2 → T5
- AC3 → T1
- AC4 → T2, T3
- AC5 → T4
- AC6 → T5, T6
- AC7 → T6

## Tasks

- [x] T1: Tests first: add `src/text-request/rules.ts` with the constants and `textProblems`, reusing `cjkShare` and the site's name-repeat check from `src/site/description.ts`.
- [x] T2: Add the form and `parseTextRequest`, with the labels in one exported constant as `src/reports/report.ts` keeps them, reading every line under a heading and reading `_No response_` as blank. Test the form file and the parser.
- [x] T3: Add `src/text-request/` and the `pnpm text-request` script for the read and the printed report, through `githubClient`, with recorded responses in tests. Reuse `nameKey`, `categories`, `displayName`, and `gapOf`, reading the checkout's overrides as `src/site/description-gaps.ts` does.
- [x] T4: Add `--apply` and `--owner-checked`, with each write run through `pnpm check` in a test.
- [x] T5: Add `textChangeHref` beside `reportHref` in `site/src/data.ts`, the Details card link, and the About text from the constants, with site tests. Look at a plugin page at 375 px in the browser pane on the real site (lessons M035, M015, and M021).
- [x] T6: Update README, DESIGN, CHANGELOG, and the two schemas' text; a schema copy test may name the same text. Create the `text-change` label with `gh label create`, and run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — a new form, command, and page link, with a design decision on what an override can be.
- 2026-11-02: idea vet: flaw: no owner has asked, and owners can already edit their manifest or GitHub About text; the user chose the form with a hand-run command over a bot, guidance alone, and no work. gap: a title change can copy another plugin's name or game the sort order; the plan prints a name match and requires a first letter or digit, and the maintainer reads each request. gap: an override can add categories; the command prints them. gap: which language rule and limits; the user took English with a refusal only of half-CJK text, name 2 to 40, description 6 words to 200 characters. gap: how long the text lasts; the user chose until removed.
- 2026-11-02: collision check: extends the hand-written description overrides of M055 and M067; D-030, D-031, and D-038 limit those overrides and do not cover an owner replacing good English text, so D-049 widens the rule; D-045's "A name is not a claim" makes a name match a printed fact and no refusal; no candidate row overlaps.
- 2026-11-02: inbox sweep: 0 open issues; 61 open pull requests, all discovery bot entries, do not overlap.
- 2026-11-02: lessons used: 2026-10-25 (M001), 2026-10-26 (M015), 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-30 (M061), 2026-10-31 (M070, for parsed issue text and `fixtureFetch` answers).
- 2026-11-02: criteria audit: full mode, a fresh Opus reader; it returned 16 findings on AC1, AC3, AC4, AC5, and AC6. All were taken: blank text skips the rules, a name match moved from refused to printed, the non-empty key, the English and CJK wording, the character categories, more named failures and exit codes, all lines under a heading, the live owner read, the category before-and-after read, the version override case, the gap print, D-049, the data schema's text, and the named constants. The answers changed no criterion.
- 2026-11-02: question set: create the `text-change` label and start one Build data run by hand after the merge — yes to both, the run as `gh workflow run build.yml --ref main`.
- 2026-11-02: plan gate chose the form with a hand-run command over a bot at the user's choice, because no owner has asked and a bot needs a new workflow; falsified by requests waiting over a week for the maintainer.
- 2026-11-02: plan gate chose text that lasts until removed over text tied to one release at the user's choice, because some plugins release several times a week; falsified by owner text that goes stale behind better upstream text.
- 2026-11-02: plan chose the owner from `GET /repos` over the entry's `repoUrl`, because a transfer leaves the stored owner stale; falsified by a read limit that makes this read fail for hand-run use.
- 2026-11-02: T1: added `src/text-request/rules.ts` with `DESCRIPTION_SHOWN` beside the four limits, and `onlyRepeatsName` in `src/site/description.ts`; the rule tests pass.
- 2026-11-02: T2, T3, T4: added the form, `parseTextRequest`, `textRequest`, and `pnpm text-request`; `readData` and `checkoutOverrides` are now exported from `description-gaps.ts`, and `parseRepoUrl` from the reader; a read data or entry failure keeps its own name, such as `data-unreadable` and `entry-not-json`; after `--apply` writes, the exit is 0, also past `--owner-checked`; the name-match reads the data file's shown names; the tests passed before the commit.
- 2026-11-02: T5: added `textChangeHref`, the link at the end of the Details card, and the About paragraph; the pane on the real site at 375 px shows the link inside the Details card, the `href` with the plugin id, no sideways scroll, and no console errors.
- 2026-11-02: T6: updated README, DESIGN, CHANGELOG, and both schemas' text; created the `text-change` label on the repository; `pnpm test` 2085 passed, 6 skipped; `pnpm check` 0 problems; left the simple-english hook hits on older lines of README and CHANGELOG, and fixed those on new lines.
- 2026-11-02: claim audit: 125 claims read, 5 corrected — .github/ISSUE_TEMPLATE/text-change.yml, README.md, cairn/DESIGN.md, src/text-request/rules.ts, src/text-request/request.ts. The count is the reader's hand count. The one re-read found the name-match line still false and two small gaps, and each was fixed; by the stopping rule no second pass ran.
- 2026-11-02: D-050 written at review: an owner's text can replace a maintainer's description override, annotating D-049. New parked row "Tighten the text request rules".
- 2026-11-02: step-7 approval: m079-owner-text-requests approved for merge

## Decisions

## Review

Evidence read 2026-11-02 at 8d5ea81, the branch level with `origin/main`.

- AC1 evidence: `test/text-request.test.ts` "the text-change form" passes: the label, the three input ids, their parser labels and `required` values, the two options, the owner, upstream, blank, English, and format words, and each constant's value.
- AC2 evidence: `test/site.test.ts` "links each plugin page's Details card to the text-change form, and no other page" passes over the 20 fixture ids and checks the literal `href` with the encoded id, the place after `data-section="details"`, and the home and About pages; the pane at 375 px on the real site showed the link in the Details card at T5.
- AC3 evidence: `test/text-request.test.ts` "textProblems" passes: each rule fired with its problem named, and texts at the four limits return none.
- AC4 evidence: `test/text-request.test.ts` "textRequest's report" passes for each output and each named failure, and "pnpm text-request" for a wrong command line; a real read-only run on issue #68 printed `failure: no-text-change-label` and exited 2.
- AC5 evidence: `test/text-request.test.ts` "textRequest with apply" passes: add, replace, remove, nothing to remove, the refusals, `ownerChecked`, and a failed write, with `pnpm check` exit 0 on the entries that it wrote.
- AC6 evidence: the About site test reads the four values from the built page; D-049 is in `cairn/DECISIONS.md`; README has "Changing a plugin's name or description"; DESIGN Data sources item 3, `CHANGELOG.md` Unreleased, and the `overrides` and `reason` text of both schemas state the rule (`git diff main...HEAD`); `gh label list` shows `text-change`.
- AC7 evidence: `pnpm test` 2085 passed, 6 skipped; `pnpm check` 671 entries, 0 problems; tracking checks pass; no snapshot files changed.
- Evidence after the review fixes, at 725d542: `pnpm test` 2087 passed, 6 skipped on the same code; tracking checks pass. AC3's tests now also fire `Zp`. AC4's tests add the named failures `duplicate-heading` and `issue-not-open`, and the lines `data-generated`, `not-read`, `replaces-override`, and `removes-override`; the gap line is now `description-gap`, and it also prints for a new name that leaves a gap. AC2's test now requires the link before the Details section ends. The criteria did not change. `pnpm check` 0 problems.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: the check run and the `--apply` run each read the issue, so its text can change between them — fix now: README says to read the report of the `--apply` run, which prints what it wrote, fixed 725d542.
- diff-bug #2: the parser takes the first heading, also one inside a hidden HTML comment — fix now: a repeated heading is refused, fixed 725d542.
- diff-bug #3: the issue's state is not read, so a closed request still applies — fix now: `issue-not-open`, fixed 725d542.
- diff-bug #4: with `--owner-checked`, the `reason` says that the owner asked when the author is not the owner — reject, false: that flag is the maintainer's word that the author speaks for the owner, and AC5 sets the wording.
- diff-bug #5: a new name can hide the shown description with no word in the report — fix now: the gap line prints when a gap exists, fixed 725d542.
- diff-bug #6: nothing records an owner's removal, so `pnpm description-gaps` lists the plugin again — follow-up, parked row "Tighten the text request rules".
- diff-bug #7: AC3 names `Zp`, but no test fired it — fix now, fixed 725d542.
- diff-bug #8: a record with no read takes an override that does not show, with no note — fix now: `not-read`, fixed 725d542.
- diff-bug #9: the write used overrides from the first read — fix now: it edits what it reads just before writing, fixed 725d542.
- diff-bug #10: the data file's age is not printed — fix now: `data-generated`, fixed 725d542.
- diff-bug #11: some invisible characters pass the rules — follow-up, parked row "Tighten the text request rules".
- diff-bug #12: a bare `example.com` and look-alike letters pass — follow-up, the same parked row.
- diff-bug #13: README's `reason` bullet omits the owner case — fix now, fixed 725d542.
- diff-bug #14: a failure test does not assert the status — fix now, fixed 725d542.
- diff-bug #15: a failed write drops the report lines, and its test needs a non-root user — reject, edge: a read-only `index.json` is outside the documented use, and the effect is a named error.
- diff-bug #16: an entry with no `index.json` passes the check run and fails at `--apply` — reject, edge: `pnpm check` already refuses such an entry, and the effect is a named error.
- diff-bug #17: a heading with a space before it did not end a section — fix now, fixed 725d542.
- diff-bug #18: someone who re-registers a deleted owner name matches the owner check — follow-up, the same parked row.
- diff-bug #19: `shownName` and the 6-word limit repeat other code — reject, style: `categories.ts` and `description.ts` spell the name the same way, and the two limits can differ.
- diff-bug #20: `TEXT_CHANGE_LABEL` and `editedOverrides` were exported with no outside use — fix now, fixed 725d542.
- diff-bug #21: `AAA Plugin` passes the first-character rule — follow-up, the same parked row.
- diff-bug #22: a repo URL off GitHub has no `--owner-checked` route — reject, edge: no current entry has one, and the effect is a named error.
- diff-bug #23: the link test did not show the link inside the card — fix now, fixed 725d542.
- diff-bug #24: `www.` matches inside `Awww.`, and a script and an import sit out of order — reject, style: the maintainer reads a refused text.
- diff-bug #25: tests that the test rule excludes: a weaker check after an exact one, repeats on one code path, and a comment that restates the code — fix now, fixed 725d542.
- diff-bug #26: the plugin page test asserts the link's words, and the form test reads YAML with patterns — reject, planned change: the words guard the dropped-space trap of lesson 2026-10-27 (M021), and the report tests read forms the same way.
- blame-history #1: an owner's text replaces a maintainer's text with no word in the report — fix now: `replaces-override` and `removes-override`, and D-050, fixed 725d542.
- blame-history #2: About says that authors do not choose categories, though a requested text can change them — fix now, fixed 725d542.
- blame-history #3: a blank request can show short or non-English upstream text, which the form did not say — fix now, fixed 725d542.
- prior-review #1: `nameKey` gives no match for names with no a-z or 0-9, and the guard prints no note — follow-up, parked row "Tighten the text request rules".
- prior-review #2: a kana-heavy text can score under half CJK — follow-up, already in row "Close gaps in the description pick", item (1).
- prior-review #3: the entry path has no name guard — reject, false: the id equals a data file record's, so the issue's text cannot choose a path.
- prior-review #4: `INIT_CWD` resolves `--data` — reject, false: `description-gaps-cli.ts` does the same, and the M067 review accepted it.
- ripple #1: README says to use an override "only" when the author cannot fix the fact — fix now, fixed 725d542.
- ripple #2: DESIGN item 3 opens with the older rule — reject, false: the item goes on with "can also" for each widened case, as for D-030.
- ripple #3: About's Overrides section opens with the older rule — reject, false: the next paragraph says "can also".
- ripple #4: the `reason` text in README and DESIGN omits the owner case — fix now, fixed 725d542.
- ripple #5: DESIGN says "both requests" for delisting and corrections — reject, false: the sentence is still true of those two.
- ripple #6: README's `field` bullet says "correct or fill in" — fix now, fixed 725d542.
- ripple #7: the plugin page says "corrects, fills in, or replaces" — reject, false: that covers owner text.
- ripple #8: the schema's `overrides` text opens with the older rule — reject, false: the added sentence says "also".
