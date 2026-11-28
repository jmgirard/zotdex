# RB01: Removal rules before launch (M118, M119)

- **Date:** 2026-11-09
- **Output required:** write findings to `cairn/reviews/RR01-removal-rules.md`
- **Binding criteria:** not requested

You are performing an independent expert review. This brief is fully
self-contained — do not assume any conversation context. Read only what this
brief directs you to read, answer the numbered questions, and write your
findings to the output path above using the same numbering. Do not edit any
other file.

## Background

Zotdex (https://zotdex.jmgirard.com/, repo `jmgirard/zotdex`) is an
unofficial index of Zotero 7+ plugins, run by one maintainer under their own
name and domain. A bot discovers plugins on GitHub and merges them after 48
hours unless a hold reason applies. The index states that a listing is no
judgment of quality and that it cannot vet plugins or review their code. The
home page sorts by GitHub stars by default.

The maintainer is about to advertise the index (Zotero forums, academic and
library audiences) and wants a sound set of rules first. A readiness check
found "Sci-Hub Plugin for Zotero" (4,178 stars) tenth on the home page. A
word search of the data found six plugins that name Sci-Hub or a similar
site. Today a maintainer removes a plugin on four grounds only (D-062): the
repository owner's request, spam, a misleading entry, and harm that a report
shows with evidence a reader can check. "Harm" is not defined anywhere, and
a removal lasts forever with no way back.

Over a planning conversation the maintainer chose the draft rules below.
Two milestones are planned: M118 writes the rules into the docs, About page,
and removal form; M119 applies the copyright ground to the listed plugins
and adds a bot hold. Nothing is implemented yet. The maintainer asked for an
independent second opinion on the complete draft before implementation.

### Draft rule 1: harm

> Harm means the plugin is built to do something that the people who install
> it did not agree to and were not told about, to them or through their
> computer or accounts. Examples are malware, taking passwords or files,
> sending library data somewhere without saying so, deleting or corrupting a
> Zotero library on purpose, and using the computer to attack, spam, or mine
> for someone else. A plugin built to attack other people's computers also
> does harm. A bug is not harm: a plugin that damages a library by mistake
> stays listed, and a Broken report on its page warns others. The evidence
> must be something a reader can check, such as a link to the code that does
> it, a malware scan find that a maintainer confirmed, or steps that make it
> happen again.

### Draft rule 2: the copyright ground

> A maintainer can remove a plugin that has a built-in way to get
> copyrighted papers or books from a site that courts in at least two
> countries have found, in copyright cases, infringes copyright.

"Built-in" means the plugin ships the site as a source: a default address, a
menu choice, or a button. A plugin that lets the user type any download
address is not covered. A maintainer applies this ground without waiting for
a report, reading only a matching plugin's README and settings, not reviewing
its code. "At least two countries" and "in copyright cases" were chosen to
guard against a single outlier or captured court and against blocks for
political reasons. The maintainer chose "built-in" over "main use" (a mixed
plugin such as one that tries Unpaywall and also offers Sci-Hub is covered).

### Draft rule 3: coming back

A removal lasts until a maintainer lifts it. Anyone, usually the owner, can
ask through a public issue and must show:

- owner's request: the owner asks to return;
- misleading entry: a release fixes what misled;
- copyright: a release drops the built-in source;
- spam: the repo is now a real plugin with a release;
- harm: a plugin whose author built it to spread malware, take passwords or
  files, or attack other computers stays off for good; a plugin removed for
  other harm (for example data sent without saying so), or for harm that
  someone else's change caused (for example a taken-over account), can come
  back once a release removes it, which a maintainer and the malware scan
  find clean.

Each `delisted.json` record gains a `ground` field naming one of the five
grounds.

### Draft application (M119)

The six plugins found are checked by README and settings; each one that has
a qualifying site built in is removed, with one public GitHub issue per
plugin on the index repo that mentions the repo owner's account, names the
court rulings, and links how a plugin comes back. A checked-in sites file
lists each qualifying site with name spellings and its rulings. The bot holds
a new pull request whose manifest name, manifest description, GitHub
description, or repo name matches a listed site's name, for the maintainer.

## Materials

- `cairn/DECISIONS.md`: D-006 (line 52), D-033 (433), D-051 (748), D-053
  (775), D-062 (938), D-065 (989), D-082 (1273), D-084 (1342). Read each
  entry whole; an entry ends at the next `### D-` heading.
- `cairn/DESIGN.md` lines 284-298 (scope and removal paragraph) and 430-456
  (inclusion bar and removal).
- `docs/requests.md` lines 320-360 (the current "Removing a plugin" section).
- `site/src/pages/about.astro` lines 130-150 (About's `#removing` card).
- `.github/ISSUE_TEMPLATE/remove-plugin.yml` (the removal form).
- `delisted.json` (empty today) and `schemas/delisted.schema.json`.
- `src/discover/holds.ts` lines 1-30 and 90-180 (the bot's hold reasons).
- `cairn/milestones/M118-removal-rules.md` and
  `cairn/milestones/M119-remove-scihub-plugins.md` (the plans).

## Questions

1. Harm. Does draft rule 1 cover the behaviors a plugin index needs to act
   on, and exclude the ones it should not (bugs, disclosed telemetry, a
   plugin doing what it says)? Name any concrete plugin behavior it gets
   wrong in either direction. Is "were not told about" checkable, and where
   must a disclosure appear for it to count?
2. Copyright test. Is "courts in at least two countries have found, in
   copyright cases, infringes copyright" a sound and workable test? Weigh at
   least: default judgments, blocking orders versus findings on the merits,
   administrative (non-court) blocks, a site with rulings in one country
   only, and mirrors or renamed successor sites. Is "copyrighted papers or
   books" the right object, or is it too narrow or too wide?
3. Built-in line. Is "built-in (default address, menu choice, or button), not
   an address the user types" a line a maintainer can apply consistently?
   What cases sit on the edge (for example a preset list the user can edit,
   a resolver list fetched from the author's server at run time)?
4. Reading without a report. The index says it cannot vet plugins and does
   not review their code (D-051, D-062). Does applying the copyright ground
   proactively, by reading README and settings, conflict with that stance in
   substance or in how visitors and owners will read it? Is the exception
   scoped tightly enough not to grow, and how should it be worded?
5. Return path. Are the per-ground conditions sound? Is the permanent list
   (malware, taking passwords or files, attacks) right? How can an owner
   credibly show that someone else's change caused harm? Is any condition
   easy to game, for example a plugin that drops Sci-Hub, returns, and adds
   it back?
6. Coherence. Do the rules stay consistent with "a listing is no judgment of
   quality" (D-006), the star order (D-065), and D-053's rule that a held
   pull request is closed only for a misleading entry? Does adopting a
   copyright ground create pressure to add grounds for other legal
   questions, such as plugins that scrape sites against their terms, and how
   should the record answer that?
7. Application. Is one public issue per removed plugin, mentioning the
   owner, the right way to notify, in tone and risk (for example drawing
   attention to the plugins, or reading as hostile)? Is a name-match bot
   hold an adequate guard against new such plugins, given false positives
   (a plugin that mentions Sci-Hub to warn against it) and easy evasion?
8. Gaps. Before advertising, what else should a one-maintainer public index
   of third-party plugins define in its rules that this set leaves out (for
   example what spam means, response times, how rights holders' notices are
   handled, a public log of removals, conflicts of interest)? Rank by how
   much each matters at launch.

## Constraints

- D-006 and D-051 stand: a listing is no judgment of quality, and the index
  cannot vet plugins or review their code.
- D-062's four grounds stay; the new rules add a fifth and define harm.
- D-065's star order is not to become an editorial ranking.
- The maintainer chose: applying the copyright ground without a report; the
  built-in line over "main use"; a two-country court test; one public issue
  per removed plugin, mentioning the owner.
- Flag disagreement with any constraint or choice explicitly, with reasons,
  rather than working around it. You are not asked for legal advice; where a
  point turns on law, say what kind of legal question it is.

## Output format

In `RR01-removal-rules.md`: answer each question by number with your
reasoning and evidence; list any additional findings separately under
"Beyond the brief"; end with concrete recommendations, each marked apply /
consider / reject-with-reason, and for each one that changes a draft rule,
give the replacement wording. Your report is advisory: emit a `## Binding
criteria` section ONLY if this brief's header slot says `requested`.
