# M079: Let owners request name and description changes

**Status:** done (2026-11-02, PR #804 https://github.com/jmgirard/zotero-plugin-index/pull/804)

**Goal:** A plugin's repository owner can ask, through a form linked from the plugin page, for a stated name or description within published rules, and the maintainer can check and apply the request with one command.

**Outcome:** Each plugin page's Details card links to `.github/ISSUE_TEMPLATE/text-change.yml`, which adds the label `text-change` and states the rules. `src/text-request/rules.ts` holds `textProblems` and its limits: a name of 2 to 40 characters that starts with a letter or digit, a description of at least 6 words and at most 200 characters that does more than repeat the name, no URL start, no `<`, no control or format characters, and under half CJK. `pnpm text-request <issue> --data <file> [--apply [--owner-checked]]` reads the issue and the live repo owner, prints the facts, and with `--apply` adds, replaces, or removes the override with no `version`. It prints a name match without refusing it. It refuses a closed issue and a repeated heading. No bot answers. Rejected at the plan: a bot that opens pull requests, guidance alone, and text tied to one release. The user chose one hand run of Build data after the merge.

**Decisions:** D-049 lets a repository's owner ask for a name or description override, and D-050 records that such a text can replace a maintainer's.

**Review:** Full fan-out, all seven criteria met. Of 41 findings, 20 were fixed on the branch, 14 rejected, and 7 went to rows: 6 to the new parked row "Tighten the text request rules", and 1 already in "Close gaps in the description pick". The fixes include repeated headings, closed issues, the replaced-override line, and the gap that a new name leaves. Three rejects are `edge`: a read-only `index.json`, an entry with no `index.json`, and a repo URL off GitHub. Six lessons named in the plan and three whose traps it met were marked `used M079`, and one lesson was added from this session's browser checks. The write path has run only in tests, since no owner has filed a request.
