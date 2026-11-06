# Decisions

Append-only. Never renumber; supersede with a new entry. D-entries record
choices with rationale — never deferrals ("not now" is a ROADMAP fact).

### D-001: Node toolchain for the bot, schema, and checks

2026-10-24, M001 plan. The project uses pnpm, TypeScript, Ajv for JSON Schema
checks, Vitest for tests, and fflate to read the zip inside an XPI. GitHub
calls use plain fetch, with no API client library. The user chose this set
at the plan question set over a smaller npm set with node:test and
hand-written checks, because it matches the zotero-plugin-registry tools and
checks JSON Schema directly.

### D-002: Each entry is a registry meta.json plus a sibling index.json

2026-10-24, M001 plan. Each plugin entry is `plugins/<id>/meta.json`, valid
against the zotero-plugin-registry schema, beside `plugins/<id>/index.json`,
which holds the fields only the index uses, such as overrides and their
reasons. The registry schema sets `additionalProperties: false`, so a field
the index adds to `meta.json` makes the entry invalid there. The user chose
the sibling file over one file with the index's own schema, which would give
up registry validity.

### D-003: Add @types/node to the D-001 toolchain

2026-10-24, M001 implement. The project adds `@types/node` as a dev
dependency, so `tsc --noEmit` can type-check code that imports Node's
built-in modules. D-001 did not name it. The user approved it at a chip over
running the code with no type check.

### D-004: Build the plugin site with Astro

2026-10-25, M007 plan. The static site uses the `astro` package, pinned at an
exact version when M007 adds it. Astro writes plain HTML from TypeScript
templates and sends no browser framework by default, so each page reads
without JavaScript and the version check stays one small script. The user
chose a framework at the plan question set over a TypeScript script that
writes HTML with no new package, which gives templates and routing. Any
further package, such as `@astrojs/check`, takes its own approval.

### D-005: Hand the bot's read results to its write job with actions/download-artifact

2026-10-26, M011 plan. The bot workflows read untrusted repos in a job with
read-only permissions and push from a second job, so the second job needs the
first job's output. The write job fetches it with `actions/download-artifact`,
beside the `actions/upload-artifact` that `build.yml` already uses. The user
chose the action at the plan question set over `gh run download` with an
`actions: read` permission, which adds no action but puts more script in the
workflow.

### D-006: List archived repos with an archived fact, added to schema v1 as an optional field

2026-10-26, M013 plan. Bot PR #13 proposed a repo that its owner archived, and
the inclusion bar did not say whether archived repos pass. The user chose at
the plan question set to list them and show "archived" as a fact in the data,
on the plugin page, and on the home list. The user rejected refusing archived
repos like forks, and refusing only new ones. A person who has the plugin
installed still needs its declared range. Inclusion is not a judgment of
quality. Many abandoned plugins are never archived, so a refusal would not
leave a list of maintained plugins. The data gains `archived` as an optional
field of schema v1. An added optional field does not need a new schema
version, because readers that ignore unknown fields keep working.

### D-007: D-006 supersedes M003's rule that a v1 file never changes shape

2026-10-26, M013 review. The M003 review recorded a milestone-local decision:
the v1 schema stays strict (`additionalProperties: false`), and adding a field
means `plugins.v2`. D-006 adds `archived` to v1 without naming that rule, and
its reason covers only readers that ignore unknown fields. The v1 schema stays
strict, so a consumer that validates against a saved copy of it rejects the
new data until it fetches the schema again. The user chose the optional v1
field at the M013 plan question set with that cost stated, so D-006 stands
and replaces the M003 rule. The README and the changelog tell consumers to
fetch the schema again.

### D-008: Read the newest stable release first, superseding M002's prereleases-included rule

2026-10-26, M014 review. M002 shipped a reader that takes the manifest from
the newest release with an `.xpi`, prereleases included. The M002 review left
a candidate row to read stable releases first. At the M014 plan question set
the user chose to read the newest stable release with an `.xpi` first. The
user also chose a fallback over a stable-only rule. If the stable release is
not a Zotero 7+ build (`no-manifest`, `no-zotero-id`, or
`max-version-below-7`), the reader reads the newest later release. A
stable-only rule drops each plugin whose Zotero 7 build exists only as a
prerelease. The data gains an optional `prerelease` field under D-006 and
D-007. For some plugins the change moves the values of existing v1 fields,
such as `version` and `latestReleaseDate`. This is not a breaking change,
because each field still describes the release whose manifest was read, as
the v1 schema says, and the record keeps its shape.

### D-009: The pages carry no script, annotating D-004

2026-10-26, M015 review. D-004 chose Astro partly because "the version check
stays one small script". At the M015 plan question set the user chose version
pills over the typed Zotero version field, so M015 removes the field and its
script. The pages now carry no script. The choice of Astro stands: it still
writes plain HTML from TypeScript templates and sends no browser framework.

### D-010: The deploy build restores no Actions cache

2026-10-26, M016 review. The build job of `build.yml` writes the site and data
that Pages publishes, so it restores no Actions cache: it sets
`cache-mode: none`, and no step sets a `cache` input. The fix sits in the job
that restores, not in the jobs that might write, because the discover read job
reads repos that anyone can tag and must save its state cache, and GitHub lets
its scheduled and dispatched runs save caches in the default branch's scope. A
job that a crafted file took over could save any key there. `ci.yml` keeps its
dependency cache, because it deploys nothing and no check gates a merge. A
later workflow that publishes or writes takes the same rule.

### D-011: Withhold a deploy only for build-level failures, narrowing M006's rule

2026-10-26, M017 review. M006 made `pnpm build` exit 1, so the daily build
deploys nothing, when more than half of the records carry any failure, because
so many failures usually come from the build. That rule also counted failures
that stay for good, such as a fork, a deleted repo, or a release with no XPI,
so an index where most plugins sat in such states would never deploy again.
At the M017 plan question set the user chose to count only build-level
failures, sorted by cause and HTTP status: an unexpected error, a request with
no whole response, a GitHub API 401 or 403, and a 429 or 5xx from any host.
The reader carries the mark beside the failure name, never in the published
data, so the v1 schema (D-006, D-007) stays as it is. The cost is that a reader
or schema regression that fails every record with a named failure, such as
`xpi-unreadable` or `facts-invalid`, now deploys a site with no plugin data.
Candidate row "Withhold deploys when all reads fail" holds the safety net.

### D-012: Also withhold a deploy when every record carries a failure, annotating D-011

2026-10-26, M018 plan. D-011 withholds a deploy only for build-level
failures, so a reader or schema regression that fails every record with a
named failure deploys a site with no plugin data. At the M018 plan question
set the user chose a second bar: `pnpm build` also exits 1 when every record
carries a failure, whatever its name. The build-level bar keeps the rule that
D-011 states. The user declined a bar on a failure share far above the live
data's, because it needs a read of the live data and more code. Thus a
regression that fails most records, but not all, still deploys. The cost is
the one D-011 avoided, in a smaller form: an index where every plugin fails
for good never deploys again.

### D-013: Count user reports from closed report issues, and withhold a deploy when they cannot be read, annotating D-011 and D-012

2026-10-27, M020 and M021 plan. User reports are GitHub issues filed from two
issue forms. At the plan question set the user chose to keep no copy of a
report in the repo. The daily build lists the index repo's closed issues with
the label `report` and counts the ones the bot closed as completed. The user
rejected a bot commit per report, which pushes to the default branch with no
review and no CI. The user also rejected a pull request per report, which
makes every count wait on the maintainer. The user chose to count only reports
on the plugin version the index read, so counts start over when the index
reads a new release. One report counts per GitHub account, plugin, and Zotero
major: the newest. The count follows each issue's current text, so a reporter
who edits a closed report changes it, which gains no more than filing a new
one. A maintainer removes an abusive report with the label `not-counted`.
The counts come only from the issues, so a build that cannot read them
withholds the deploy, whatever the failure, and it reads them before any
plugin read. This annotates D-011 and D-012, which withhold a deploy only for
build-level failures or when every record fails. The cost is that GitHub's
answer when the repo's issues are turned off stops every deploy until the
maintainer turns them back on. The data gains `reports` as an optional field
of schema v1 under D-006 and D-007.

### D-014: The home page carries one language-filter script, superseding D-009

2026-10-27, M023 and M024 plan. At the plan question set the user chose a
language menu on the home list, run by a script, over one static page per
language and over no filter. D-009 recorded that the pages carry no script
after M015 removed the version field. The home page now carries one script.
It shows the menu, hides the rows of other languages, and keeps the choice in
the URL. The menu is hidden in the HTML, so without JavaScript the home page
shows the full list and no menu, and each page still reads without
JavaScript, as D-004 says. The other pages carry no script. The menu's
options and counts are written at build, so the script reads no data file.

### D-015: A read cut by a time limit is build-level, annotating D-011

2026-10-27, M029. `pnpm build` stops a plugin read after 3 minutes and
starts no plugin read after 18 minutes from its start. Thus hosts that do
not answer cannot take the build job past its 30-minute limit, where GitHub
stops the job and nothing is kept or deployed. A read cut by the first limit
fails as `request-failed`, the name that README already gives a request
with no whole response. An entry that the second limit leaves unread fails
as `not-read`. Both count as build-level under D-011, because they point at
the build or a host, not at the plugin. So when more than half of the records
carry a build-level failure, these included, the build deploys nothing, and
the last good data stays.
The cost is that an unread plugin shows no facts on that day's site, since
the build restores no earlier data (D-010).

### D-016: The M029 time limits bound the plugin reads only, narrowing D-015

2026-10-27, M029 review. D-015 says that hosts that do not answer cannot
take the build job past its 30-minute limit. That holds for the plugin
reads alone. The read of the report issues before them has no total limit,
only 60 seconds for each page. A host lookup whose wait the limit ended can
also keep the process open after the build writes its file. Candidate row
"Bound the build's report issue read" holds both gaps. The rest of D-015
stands.

### D-017: Correct D-016's candidate row pointer

2026-10-27, M029 hygiene. D-016 names candidate row "Bound the build's
report issue read" as the home of the two gaps. That row belongs to a group
of rows that carries review findings from two milestones, and the hygiene
rule files new findings for such a group as a new row. So the gaps are in
candidate row "Close gaps in the build time limits", which names the first
row. The rest of D-016 stands.

### D-018: The v1 languages patterns refuse zxx and mul, narrowing schema v1

2026-10-28, M036 plan. The language codes `zxx` ("No linguistic content")
and `mul` ("Multiple languages") name no one interface language that a
visitor can pick. The user chose at the plan question set to refuse them in
`LANGUAGE_TAG`, as it refuses `und`, and so in the reader and in the
`languages` patterns of both v1 schemas. The user rejected refusing them in
the reader alone, which would let an override record them. The narrower
pattern accepts a subset of what v1 accepted, so a consumer that validates
new data against a saved copy of the schema still accepts it. The README's
rule gives a new schema version to a breaking change, and this change does
not break a consumer of the data. A `languages` override can no longer hold
these codes.

### D-019: The home page's one script also runs the version buttons, annotating D-014

2026-10-28, M037 plan. D-014 gave the home page one script, for the language
menu. M037 adds buttons that filter the home list by a declared Zotero major.
They act on the same rows and keep their choice in the address beside the
language, so they join that script rather than add a second one. The home
page still carries one script, and the other pages carry none. The buttons
are hidden in the HTML, so without JavaScript the home page shows every row
and no buttons, as D-014 says for the menu.

### D-020: A branch-name check that cannot run answers the issue, narrowing M011's no-request rule

2026-10-28, M038. M011 made `pnpm propose` refuse a handoff it cannot trust
before any request, so an issue whose handoff is refused gets no answer.
M030 put a time limit on the branch-name check in that path, and a check
that threw then stopped the command with a stack trace, so that issue got
no answer either. At the M038 plan question set the user chose to treat a
branch-name check that cannot run (git does not start, ends with any result
other than exit status 1, or passes its limit) as a failure of the write
step, not a refusal. An issue run comments `unexpected-error` and leaves
the issue open, as it does for a failed push, because a check that cannot
run says nothing about whether the handoff can be trusted. The user kept
the rule that a refused handoff sends no request, and a refusal by any
other check wins over a check that cannot run. The user rejected refusing
quietly, which left the issue unanswered.

### D-021: A missing report label or closed_by key withholds the deploy, annotating D-013

2026-10-28, M041 plan and review. D-013 withholds a deploy when the build
cannot read the report issues. A renamed or deleted `report` label makes
GitHub answer the issue list with no issues, and an issue with no
`closed_by` key cannot be counted, so both gave counts of zero with no
failure. At the plan question set the user chose that the build reads the
label before the list and stops when that read fails. The build also stops
when a listed issue has no `closed_by` key. Each case is a failed read
under D-013. The cost adds to D-013's: a renamed or deleted label, or a
fork that builds the data with issues on but no `report` label, stops
every deploy until the label exists. An issue whose `closed_by` is `null`
still counts as read, so a list that keeps the key and sends `null` on
every issue still gives counts of zero.

### D-022: A GitHub API body that is not JSON and a 403 on a GitHub release URL are build-level, annotating D-011

2026-10-28, M045 plan. D-011 sorts build-level failures by cause and HTTP
status. Two answers that it left with the plugin point at GitHub or the
network instead. A GitHub API answer that succeeds but whose body is not
JSON, such as an HTML error page, comes from GitHub or a host between, since
a plugin cannot shape an API body. An HTTP 403 answer to an XPI or
`update.json` download that requested a GitHub release URL, a `github.com`
URL whose path's third segment is `releases`, comes from GitHub's release
file service. At the plan question set the user chose this work from its
candidate row. The rule looks at the release URL in the redirect chain, not
at the host that answers, because GitHub moved release files from one host
name to another, and a later move would put these 403s back with the
plugin. The cost is that a release file that GitHub refuses for good marks
its record build-level every day: it counts toward the more-than-half bar,
the discover bot keeps no state for that repo and reads it again, and an
"Add a plugin" issue for it stays open. The rest of D-011 stands.

### D-023: Start each listed plugin in Zotero in an isolated CI job, as a start fact only

2026-10-28, M046 and M047 plan. At the plan question set the user chose to
start each listed plugin in a Zotero that GitHub Actions runs, and to show
the result as a start, not as "works". A plugin starts only in the tested
releases that its manifest's range covers, because Zotero refuses to
install it outside that range, so users cannot run it there. The tested
releases are pinned in the workflow with a SHA-256 for each download, and
a maintainer edits the list when Zotero ships a release. The start-test
job holds no token permissions and no secrets, and it restores and saves
no cache (D-010). No artifact holds an XPI. Each job downloads the XPI
from the URL that the build read and checks its SHA-256, so the index
still re-serves no plugin file. The user also allowed CI to download
Zotero from download.zotero.org and to install Ubuntu packages with apt.
No npm package changes. The cost is that plugin code in a start-test job
can rewrite that job's results, its own included, so the data can show a
forged start. The user rejected starting plugins outside their range with
Zotero's compatibility check off, and finding the newest Zotero release at
run time, since Zotero publishes no release list as data and such a
download has no pinned hash to check.

### D-024: The daily build's site and start-test jobs follow D-010, and start results never withhold a deploy, annotating D-010 and D-011

2026-10-28, M047 review. M047 splits `build.yml` into build, start-test,
site, and deploy jobs. The site job now writes the site that Pages
publishes, so D-010's rule moves with it: the build, start-test, and site
jobs each set `cache-mode: none`, and no step sets a `cache` input. The
start-test job runs plugin code, so it sets no cache either. D-011 and
D-012 still decide when the build withholds a deploy. Start tests add no
reason of their own: a failed start-test job, a missing result, or a
results entry that cannot be read drops those results, and the site still
deploys. `pnpm add-start-results` exits 1, and so withholds the deploy, only
when the build's own data or plan cannot be read or the schema rejects the
merged data, the same kind of fault as a failed `pnpm site`. The deploy
job's `if:` names the site job's result, since GitHub skips a job whose
earlier jobs include a failed one unless its `if:` says otherwise. The cost
is that a day whose start tests all fail deploys with no start results.

### D-025: Correct D-024's list of the add-start-results failures that withhold a deploy, superseding that sentence of D-024

2026-10-28, M047 review. D-024 says `pnpm add-start-results` withholds the
deploy only when the build's data or plan cannot be read or the schema
rejects the merged data. The command also exits 1, and so withholds the
deploy, when it cannot list the results directory for a reason other than
its absence, when it cannot write the data file, and when its `--tested`
list is not a list of versions. Each is a fault of the site job's own files
or of the workflow, never a start result, so D-024's rule stands: no start
result withholds a deploy. The site job runs no plugin code, so plugin code
cannot cause these faults.

### D-026: Any page can carry a script that a feature needs, superseding D-019 and the script limits of D-014

2026-10-29, M048 plan. D-014 gave the home page one script, and D-019 kept
that one script for the version buttons and said that the other pages carry
none. At the M048 plan the user rejected those limits: a page can carry a
script where a feature needs one, and a feature can add a second script to
a page. One rule of D-004 stays: each page reads in full without
JavaScript. A part that a script runs is hidden in the HTML or is extra, as
the home page's menu and buttons are, so a page with no JavaScript still
shows every fact. The site still sends no browser framework (D-004).

### D-027: The report issue read stops at 3 minutes and then fails the build, annotating D-013 and D-016

2026-10-29, M050. D-016 records that the build's read of the report issues
had no total limit, only 60 seconds for each page. The read of the `report`
label and every issue page now stops after 3 minutes in all. A read that the
limit cuts is a failed read of the report issues, so under D-013 the build
writes no file, reads no plugin, and deploys nothing. The plan rejected a
page cap: a cap that counts part of the list gives wrong counts, which D-013
forbids, and a cap that fails the build would stop deploys at a list size
that reads in seconds. The read still counts toward the 18 minutes after
which the build starts no plugin read (D-015). The cost is that a list of
report issues too long to read in 3 minutes stops every deploy until it is
shorter or the limit changes. M050 also closes D-016's second gap: the build
exits once its output is written, so a host lookup that a limit cut no longer
holds the process open.

### D-028: The build alternates its plugin read order by UTC day, annotating D-015

2026-10-29, M051. `pnpm build` reads the plugins in id order when the whole
UTC days from 1970-01-01 to `now`, the data file's `generatedAt`, are even,
and in reverse id order when they are odd. The data file, the build-level
list, and the start plan keep id order. Before, the build always read in id
order, so a build that D-015's 18-minute limit cut left the same last
plugins unread each day. The plan chose alternation over a rotation or a
shuffle by date. A build deploys only when at most half of its records are
build-level, so on two consecutive days that both deploy, the forward cut
and the reverse cut leave no entry unread on both days. A rotation or a
shuffle can. The limit: two deployed builds on days of the same parity,
such as two days apart with the build between them withheld, read in the
same order and can leave the same entries unread. The rest of D-015 stands.

### D-029: The data publishes the XPI address, and a plain link to it is not an install button, annotating D-023 and DESIGN's out-of-scope line

2026-10-29, M052. At the plan question set for the site redesign, the user
chose to link each plugin page straight to the author's XPI file, with the
address added to the data as an optional `upstream.xpiUrl` (D-006, D-007).
Before this, the XPI URL that the build read went only into the start plan,
and the reader's comment said it stayed out of the published data (M047).
The data now carries that URL. DESIGN keeps "install buttons" out of scope:
a link to the author's file on GitHub downloads it and installs nothing,
and Zotero installs a plugin only from its own add-ons dialog. The site
shows the link as a plain button beside the source and releases links, not
as a highlighted one, so it does not read as an endorsement. The index
still keeps no copy of a plugin file (D-023). The author can replace a
release file at the same address, so the file a reader downloads later can
differ from the one the build read and the start tests checked. The plan
rejected linking to the latest release page, which can name a newer release
than the one the index read.

### D-030: A description override can give English text for a plugin with none upstream, widening DESIGN's override rule

2026-10-29, M055. DESIGN says an override corrects a fact that the author
cannot or will not fix upstream. At the M055 question set the user chose to
also allow a `description` override that gives English text for a plugin
whose manifest, English locale, and GitHub About text hold no English
description, because the site is in English. Such a text is the index's
own wording drawn from the plugin's README or other upstream file, not a
correction. Its `reason` names that source and says that the upstream has
no English description. It carries no `version`, so it also hides any
English text the author adds later until the override is removed. The plan
rejected leaving those plugins with their Chinese or blank description,
and rejected machine translation, which needs a paid service or a model.

### D-031: D-030 also covers an upstream description that only repeats the name, and annotates DESIGN's override rule and the reason schema text

2026-10-29, M055. A plan re-audit found that D-030's case, no English
description upstream, leaves out plugins whose only English description
repeats the name, which the site hides (M015). D-030 covers those too, and
the `reason` then says that the upstream description only repeats the
name. The no-`version` rule of D-030 is intended: a text drawn by hand
stays until someone removes it. DESIGN's Data sources item 3 and the
`reason` prose of `schemas/index.v1.schema.json` ("Why the upstream value
is wrong") gain this case, since such an override fills a gap rather than
correcting a wrong value. The rest of D-030 stands.

### D-032: D-030 also covers upstream text that is half or more CJK, extending D-030 and D-031

2026-10-29, M055. The claim audit and the AC6 re-audit found that
Jasminum's GitHub About text opens with one short English sentence and
then a Chinese one, so D-030's case, no English description upstream, does
not cover its override. At the implement stop the user chose to keep the
override. A `description` override can now give English text for a plugin
whose manifest description and GitHub About text are each missing, only
repeat the name, or have a CJK share of 0.5 or more, as the site's rule
measures it, even when one of them holds some English. The `reason` says
which of these each text is. The plan's first count of seven such plugins
came before the CJK share counted runs of letters as one unit; that change
added Jasminum. The rest of D-030 and D-031 stands.

### D-033: The bot merges its own pull requests after a wait unless held, replacing DESIGN's per-pull-request approval

2026-10-29, M056 plan. DESIGN.md said that the maintainer approves each bot
pull request. The maintainer merged every bot pull request that the bot
opened, and inclusion is not a judgment of quality, so the approval added a
wait and no filter. From M056 on, a daily job squash-merges a bot pull
request whose body says `Hold: none`, that has no `hold` label, and that
opened at least 48 hours earlier, once its entry passes `pnpm check`
against the current entries. The bot holds a pull request at opening for a
name that matches another owner's entry, an owner account that is under 30
days old or cannot be read, an update host outside GitHub, or an issue-form
repo with neither topic. A held pull request waits for the maintainer.
Closing a bot pull request without a merge still keeps the bot from
proposing that repo again (M009). The user chose these four rules over also
holding repos under 30 days old, and a 48-hour wait.

### D-034: A merge run started by hand may set a shorter wait, annotating D-033

2026-10-29, M057 plan. D-033 has the merge job wait 48 hours after a bot pull
request opens. For the first backfill of the index the user chose to land
every clean plugin at once rather than over days. `Merge bot pull requests`
gains a `wait_hours` input that only a run started by hand sets, 0 included.
Scheduled runs keep 48 hours, and the hold reasons, the `hold` label, and the
check before each merge are unchanged. The rest of D-033 stands.

### D-035: The daily build reuses deployed start results for an unchanged XPI, annotating D-023 and D-024

2026-10-30, M059. Each daily run started every plugin in each tested release
that its range covers, and the slowest start-test job neared its 20-minute
limit. At the M059 plan question set the user chose to reuse results. The
build job reads the deployed `v1/plugins.json` over HTTPS and copies into the
start plan each `started` result whose record has the same entry id, plugin
id, version, and `xpiSha256` as the plan item. The start-test jobs skip those
starts, and the site job merges them from the plan, which only the build job
writes. A result other than `started` is never reused, so a failure is tested
again on the next run. Each entry is tested again on one fixed day in every 7,
so that a flaky or outdated result, or a change to the start-test code,
reaches every result within a week. The user declined a date on each result.
D-010 and D-024 hold: the read uses no Actions cache, and a failed read
carries nothing and exits 0, so start results still never withhold a deploy.
The cost changes D-023's: a forged `started` result for an unchanged XPI now
stays until the entry's next re-test day, and longer if that day's build
deploys nothing. A job result for a pair that the plan carries is dropped, so
plugin code can no longer overwrite a carried result. The plan rejected a
previous run's artifact as the source, since it needs `actions: read`, expires,
and can come from a run that did not deploy.

### D-036: The build reads the current Zotero release from zotero.org, and a failed read never withholds a deploy, annotating D-011

2026-10-30, M062. A declared mark counted Zotero N as N.0 to N.9, so a range
such as 10.0.* showed part of 10 while 10.0 was the only release line. To mark
such a range all, the index needs the newest release of each major. At the M062
plan question set the user chose a daily read of
`https://www.zotero.org/download/client/version?channel=release` over a
hand-kept value, since a hand-kept value lags each Zotero release and shows
all too early until someone updates it. The earlier majors' last releases stay
in `LAST_RELEASES` in `src/site/version.ts`, since that address gives only the
current release. The build writes the value into the data as `zoteroRelease`,
so that `pnpm site` builds the same pages from the same data file. The request
sends no token, since zotero.org is not GitHub. A failed read leaves the field
out and does not change the exit code: the marks then fall back to N.9 for that
major, which shows part, never a false all, so D-011's rule of withholding a
deploy only for build-level failures holds. A range that starts after the
newest release reads none. This choice is wrong if the address changes its
shape or fails on most days.

### D-037: Plugin categories are the site's own grouping, shown apart from the checkable facts, annotating DESIGN's Contract boundary

2026-10-31, M066 plan. With hundreds of listed plugins, many of one kind,
the user asked for groups of related plugins to filter and explore. DESIGN's
Contract boundary says a plugin page shows facts that a reader can check, and
a category is not such a fact: the index assigns it from a fixed list of
categories by words in the plugin's name and descriptions, with a hand list
of fixes. At the question set the user chose this over machine clustering,
whose groups and names shift as plugins are added and which puts each plugin
in one group, and over a hand tag in each `index.json`, which needs work on
each bot merge. So the site shows categories as the index's own grouping,
labeled so and linked to the About page, which says they can be wrong or
missing and that authors do not choose them. The site build computes them,
and the published data carries none, so they add nothing to the data's
contract (D-006). This choice is wrong if a hand read finds more than 1 in 10
assignments wrong after tuning, or if data users ask for the categories.

### D-038: A description override can replace a short English description, and the site shows the Latin-script part of a mixed text, extending D-030, D-031, and D-032

2026-10-31, M067 plan. After the backfill of 2026-10-29, many shown
descriptions were again missing, mostly Chinese, in Portuguese, or English
but too short to say what the plugin does. The user rejected writing every
description by hand. That would replace author text that works, hide later
author edits, and need work on each new plugin. At the question set the
user chose two changes.

First, a `description` override can also give English text for a plugin
whose description, as the site shows it without the override, is in
English and has fewer than six words. A word is a run of letters, marks,
and digits. Every such plugin gets an override. The plan rejected a hand
read that keeps the clear short texts, and the user chose this. Such an
override has no `version`, as D-031 states, so it hides a longer text that
the author writes later until someone removes the override.

Second, for a manifest or GitHub description whose CJK share is 0.5 or
more, the site shows its Latin-script part. That part is the pieces, cut at
` / ` and after `。`, whose letters are all Latin script and that hold at
least three words. The user chose this over an override for each such
plugin, since new ones arrive often and an override hides author edits. A
Latin-script piece in another language, such as Portuguese, shows as it
is. A text whose CJK share is below 0.5 gets no override by these rules.

This choice is wrong if the Latin-script part shows a fragment that does
not describe the plugin, or if the short overrides keep hiding better
author text. The rest of D-030, D-031, and D-032 stands.

### D-039: A triage pass drops seven candidate rows as not worth keeping

2026-10-31, triage pass. A `/cairn-triage` pass weighed every candidate row
and Known issues entry. The user accepted dropping seven rows, each because
the case it covers does not arise in this repo or costs almost nothing:

- "Read plugins folders alike in both steps" would have made the read step
  fail on a missing `plugins/` folder and made `pnpm propose` and `pnpm
  check` treat symlinked or submodule entry folders alike. The index always
  has `plugins/`, and entries come from the bot or a reviewed pull request.
- "Name the failure when --out is a file" would have replaced the untrue
  `entry-exists` message that `pnpm add-plugin` prints when `--out` names a
  file. Only the maintainer uses `--out`, and the run still stops.
- "Bound per-entry work in the locale walk" would have charged each tiny
  locale file a minimum cost, so a crafted XPI of many such files could not
  add seconds to a read, and made the half rule past 8 MiB of locale files
  not depend on zip order. The XPI size cap and the read time limit bound
  the cost.
- "Drop stale state records on a reread" would have removed a discovery
  state record whose reread fails without a record. The old record hides no
  repo.
- "Answer issues when a handoff read throws" would have caught `readdir` and
  `lstat` errors in `readHandoff` and answered the issue. The job's own read
  step writes those files.
- "Keep the check summary in a cut body" would have kept the `pnpm check`
  summary line when the pull request body is cut. The exit status still
  shows.
- "View the star in forced colors mode" would have added a browser view of
  the plugin page star's `CanvasText` fill, which a source test pins.

Each drop can be reopened by an entry that supersedes this one.

### D-040: The build warns when the Zotero release lists fall behind, and the lists stay hand-kept, annotating D-036

2026-10-31, M068 plan. D-036 keeps the newest release of each earlier
Zotero major in the hand-kept `LAST_RELEASES`, since the release address
gives only the current release. A new major or a new patch of an earlier
major then goes unnoticed until someone edits the lists, and the marks
read wrong until then. At the question set the user chose a daily read of
each earlier major's changelog page on zotero.org, with a `::warning::`
line when the page names a newer release than the list, and a warning
when the current release's major is not the last of `ZOTERO_MAJORS`. The
lists stay hand-kept, and the marks change after a hand edit. The user
rejected writing each earlier major's newest release into the data, which
would update the marks with no edit but add a data field and a daily
dependency on the shape of three HTML pages. A failed changelog read only
warns, so D-036's rule that these reads never withhold a deploy holds.
This choice is wrong if a warning sits unread while a stale list keeps
the marks wrong for a week or more.

### D-041: Plugin code can withhold a deploy by changing the build's artifacts, annotating D-023, D-024, and D-025

2026-10-31, M069 review. Plugin code in a start-test job that reaches the
run's artifact token can delete an artifact of another job and upload
another under the same name, as M069's read of the artifact client found.
The site job checks the start plan (since M059) and the data (since M069)
against values that the build job gives as job outputs, which no
start-test job can change. A changed artifact then fails the site job and
withholds the deploy. So plugin code can stop a deploy but cannot change
what deploys, which narrows D-023's forgery cost to start results. D-024's
rule that no start result withholds a deploy holds, since this fault is in
the build's own artifacts. D-025's sentence that plugin code cannot cause
the site job's faults is narrowed to the faults D-025 lists. The cost is
that one plugin can stop each daily deploy until a maintainer removes it.
The parked candidate row "Keep plugin code from stopping deploys" holds
the follow-up.

### D-042: Discovery also reads the zotero-chinese catalog and GitHub code search, and their topic-less finds get no hold, annotating D-033

2026-10-31, M070 and M071 plan. Topic search finds only repos whose authors
tag them, so plugins with no topic never reached the index. Discovery also
reads the repos that the zotero-chinese plugin catalog lists (M070) and
the repos that five GitHub code searches for Zotero plugin files return
(M071). The catalog is curated by hand, and code search finds repos that
no one listed, but GitHub's code index holds only part of all repos, so
discovery reads both. D-033 holds a repo that an issue proposes with
neither topic. A catalog or code-search find with neither topic gets no
such hold: the index states facts and does not judge quality, and anyone
can add a topic to a repo today. The inclusion bar and D-033's other holds
apply to these finds as to topic finds. The user chose no hold over a hold
for each source. This choice is wrong if bot pull requests from these
sources add repos that are not Zotero plugins, or that a maintainer would
close.

### D-043: An update file on the repo owner's own GitHub Pages site gets no hold, annotating D-033

2026-11-02, M074 plan. D-033 holds a bot pull request for an update host
outside GitHub, and M056 built that as every host other than github.com and
raw.githubusercontent.com. From M074 on, the host `<owner>.github.io` also
passes when `<owner>` is the repo's owner. GitHub serves that site, and only
the owner can publish to it, so it gives no new party control of the
plugin's updates. Another owner's `.github.io` site and every host outside
GitHub stay held. The user chose this rule, and chose to release the open
pull requests held only for it. The rest of D-033 stands. This choice is
wrong if an update file on an owner's Pages site serves a plugin that a
maintainer would have closed.

### D-044: People with write access can also publish to the owner's GitHub Pages site, annotating D-043

2026-11-02, M074 claim audit. D-043 says that only the owner can publish to
`<owner>.github.io`. That host also serves the project sites of the owner's
repos at `<owner>.github.io/<repo>`, so people to whom the owner gives write
access can publish there too. The rule stands, since the owner chooses those
people, and a repo's writers already control its files on
raw.githubusercontent.com. D-043 also says that the rule gives no new party
control of a plugin's updates. That is not so where a Pages site has a custom
domain: the site redirects to that domain, the hold reads only the host that
`update_url` names, and whoever controls the domain's DNS then serves the
update file. The rule stays for now, and a candidate row asks for a hold on
such a redirect. The rest of D-043 stands.

### D-045: A name match holds a bot pull request only on evidence of copying, annotating D-033

2026-11-02, M075 plan. D-033 holds a bot pull request for a name that matches
another owner's entry. The bot's read order decides which repo reaches the
index first, so that rule made the later repo wait for a reason that says
nothing about either plugin. A name is not a claim, and the index keys entries
on the add-on id. From M075 on, a name match holds only if the two repos share
code or the listed repo is a far larger, older namesake. If the bot cannot read
these facts, it holds. The user chose this rule over shared code alone, which
misses a plugin written from scratch under a popular name, and over no name
holds. The rest of D-033 stands. This choice is wrong if a copy merges under
the rule and a maintainer removes it, or if a maintainer always releases
namesake holds.

### D-046: A triage pass drops candidate rows as not worth keeping

2026-11-02, triage pass. A `/cairn-triage` pass weighed every candidate row
and Known issues entry. The user accepted dropping these rows, because each
covers a case with a low cost that a maintainer can handle by hand:

- "Close small gaps in pnpm refresh-holds" would have kept a failed account
  read from replacing a date that an earlier run wrote, kept a fenced `Hold:`
  line that a person adds from giving a second detail block, and given the
  command a whole-run limit. Only the maintainer runs it, and a rerun is safe.
- "Make close-issue safe on retry and races" would have let a run whose
  comment posted and whose close failed be rerun, and handled pull requests
  reopened or closed during a run, comments that name only the branch, renamed
  repos, and unusual fences around the `Closes` line. The worst case is an
  issue that the maintainer closes or reopens by hand.
- "Label cut reads on plugin pages" would have said that the build's time
  limit cut a read, in place of the failure names `not-read` and
  `request-failed`. The page already says that the build could not read the
  plugin, and the next daily build reads it again.

Each drop can be reopened by an entry that supersedes this one.

### D-047: The update-host hold follows an owner site's redirects and holds plain http, annotating D-033, D-043, and D-044

2026-11-02, M077 plan. D-044 kept the owner-site pass of D-043 for now, though
a Pages site with a custom domain redirects to a host that another party can
control. From M077 on, an update file named on `<owner>.github.io` passes only
if every URL of the bot's read stays on that host. Any other host, at any step,
holds, since a host on the way can change where the read goes. Also, any URL of
the read that uses `http:` holds, on every host, since anyone on the network
path can change that file. The user chose to hold http as well. The bot does not
test the redirects of `github.com` and `raw.githubusercontent.com` addresses,
since GitHub's release addresses redirect to its own file hosts and those two
hosts already pass for any owner's repo. A named host outside these stays held
whatever a redirect does. The read happens once, at the draft. The rest of D-043
and D-044 stands. This choice is wrong if a maintainer always releases these
holds, or if an update file reached through `github.com` or
`raw.githubusercontent.com` turns out to be served off GitHub.

### D-048: The read that decides the update-host hold happens once, narrowing D-047

2026-11-02, M077 review. D-047 says "The read happens once, at the draft." That
means the read that decides the hold. `pnpm refresh-holds` reads the update
address again for a held pull request's detail lines, and it changes no Hold
line. The rest of D-047 stands.

### D-049: A repository's owner can ask for a name or description override, widening DESIGN's override rule and annotating D-031, D-038, and D-045

2026-11-02, M079 plan. DESIGN says that an override corrects a fact that the
author cannot or will not fix upstream, and D-030 to D-038 add cases where
upstream has no usable English text. None covers an owner who wants other
wording. At the question set the user chose to let a repository's owner ask
for a stated name or description through an issue form, with a command the
maintainer runs by hand to check and apply it. The user rejected a bot that
answers and opens pull requests, guidance alone, and no work, since no owner
has asked yet. An upstream edit stays the first choice, as the form says.

Such an override has no `version`, as D-031 states, so it lasts until the owner
asks to remove it and hides later upstream edits until then. The owner's
removal wins over D-038's "Every such plugin gets an override": the command
prints the gap that a removal leaves, and the site then shows the upstream
text. English is asked for, and the command refuses only text that is half or
more CJK, so the maintainer judges other languages by reading. A requested name
that matches another plugin's is printed and not refused, as D-045 says that
"A name is not a claim". The limits live in `src/text-request/rules.ts`, and
they bind requests only.

This choice is wrong if owners use the form for advertising that the maintainer
cannot keep up with, or if owner text goes stale behind better upstream text.

### D-050: An owner's text can replace a maintainer's description override, annotating D-049

2026-11-02, M079 review. D-049 names an owner's removal of the index's text and
not its replacement. `pnpm check` allows one override of a field with no
`version`, so an owner's text takes the place of a text that a maintainer wrote
under D-030 to D-038, and the older reason stays only in git. The command prints
the override that a request replaces or removes, so the maintainer sees it first.

### D-051: The pages say the index cannot vet plugins, replacing the footer's does-not-vet line

2026-11-02, M080. M054's plan kept a footer line on every page that said the
index does not vet the plugins it lists. At the question set the user asked for
one disclaimer that also says the index is unofficial and that it is unable to
vet. So every page's footer and the home page's intro now say that the index
cannot vet, which goes past "does not". The holds and the start tests screen in
part, and neither is a review of plugin code. About gives the reason: one person
maintains the index, and each plugin can change with any release. This choice is
wrong if the index comes to review plugin code.

### D-052: A repo with no source is listed with a shown fact, and a failed read of it never withholds a deploy, annotating D-006 and D-011

2026-11-02, M081 plan. Held PR 371 led the maintainer to consider a rule that
listed code must be open source. A count on 2026-11-02 found 8 of 695 repos
with no source at the top level, and 158 with no source or no license that
GitHub recognizes. The maintainer wanted PR 161 merged and PR 371 closed, but
the two repos have the same shape. So no source rule can separate them. The
user chose a shown fact over a new hold, a refusal of repos with no source, and
a license requirement. D-006 lists archived repos the same way, and inclusion
stays no judgment of quality (D-033, D-042). The mark says "at the top level",
since the index reads names and no code. D-011, D-015, and D-022 make a failed
GitHub read build-level. This read is an exception: a failure leaves the field
out and warns, as D-036 does for the Zotero release, because the fact is not
needed to list a plugin. This choice is wrong if plugins commonly hide their
source in ways that the top-level names do not show.

### D-053: The maintainer merges a held bot pull request by default and closes one only for a misleading entry, annotating D-033

2026-11-02, held pull request review. D-033 holds a bot pull request for the
maintainer and does not say how to decide. Inclusion is not a judgment of
quality (D-033, D-042), and the index cannot vet plugins (D-051), so the default
is to merge. The maintainer closes a pull request only when its entry would
mislead people about what the plugin is, who makes it, or who controls its
updates. A pull request that the maintainer cannot settle stays open, because
closing keeps the bot from proposing that repo again and waiting costs nothing.

Each hold reason has one question. For `update-host`: does the host belong to
the same party as the repo? A matching account, or a domain that the plugin id,
homepage, or README also uses, shows that. A file there that is identical to the
GitHub release's XPI supports it. For `name-match`: would a visitor mistake this
plugin for the other one? A copy passes with its own name and id and credit to
its source. A shared descriptive name with different code also passes. A credited
copy that keeps its source's name or id takes the maintainer's judgment. For
`new-account`: is this a real plugin repo with a release? Account age alone closes
nothing. A repo with no source is not closed for that reason, since D-052 shows it
as a fact.

The first pass closed one pull request, for a plugin that kept Zotero's sample
plugin's id and update address. This choice is wrong if a held plugin that passes
these questions misleads users.

### D-054: A plugin whose main use needs its maker's paid service shows a hand-read fact, annotating D-037 and D-052

2026-11-02, M082 plan. Upstream files are the source of the other facts, but
payment words in a README cannot show this one, so a maintainer reads it and
keeps it in `index.json` with its note, source, and read date. Unlike a category
(D-037), it is a fact that a reader can check against the source. At the question
set the user chose to mark only a plugin whose main use stops without paying its
maker, or stops after a trial. The user rejected marking every plugin whose maker
sells something, since a mark then says less. So a lasting free plan with a paid
upgrade, a plugin that also works with a third party's key, and a donation get no
mark. The user also chose to read new plugins by hand later, over a command that
lists them, so a plugin with no mark can still cost money and the About page says
so. Such a plugin stays listed with a shown fact, as D-052 does for a repo with
no source, and inclusion stays no judgment of quality. There is no hold and no
refusal. This choice is wrong if users want a paid upgrade marked, or if marks
fall far behind the new plugins.

### D-055: A triage pass drops four candidate rows as not worth keeping

2026-11-03, triage pass. A `/cairn-triage` pass weighed every candidate row
and Known issues entry. The user accepted dropping these rows, because each
covers a case with a low cost or one that no deployed data reaches:

- "Close gaps in the home owner line" would have kept a long owner from
  widening the table in a browser without `contain: inline-size`, and fixed
  the owner shown for URLs such as `https://GitHub.com/a/b` or owner `..`. Such
  a browser scrolls inside `.table-card`, and all 671 deployed URLs read
  2026-11-02 have the plain form.
- "Tighten the refresh-holds update read" would have kept the detail lines of
  `pnpm refresh-holds` from going stale when a redirect goes away or a push
  comes during a run. Only the maintainer runs it, and a rerun is safe, as D-046
  says of its sibling row.
- "Skip closed pull requests in local runs" would have stopped a local `pnpm
  discover` from drafting a repo whose bot pull request was closed without a
  merge. Only the maintainer runs it, and the maintainer reads each draft.
- "Check the theme button's double label" would have stopped a screen reader
  from reading the theme button's `aria-label` and `title` twice, at the cost of
  the tooltip. A user report needs no row to be heard.

Each drop can be reopened by an entry that supersedes this one.

### D-056: A far larger, older repo can ask for a listed add-on id through a held pull request, annotating D-033, D-045, and D-053

2026-11-03, M085 plan. One add-on id holds one entry, and the bot's read order
decides which repo gets it, as D-045 said of names. So a recent fork that kept
its source's id could hold it while the bot refused the source on every read,
and an index that names a stranger's repo for a popular plugin also gives that
stranger the plugin's updates. From M085 on, a repo that is older than the listed
repo, has at least 20 stars, and has at least 10 times its stars gets a bot pull
request held as `replaces-entry`. These are the numbers of D-045's namesake test,
turned the other way. The pull request changes only `meta.json`, so a maintainer's
overrides and paid-service mark stay and the body names them. The user chose this
over a warning in the discover report, which only someone reading the logs would
see, and over changing no bot behavior. The numbers cannot show which repo is the
original: two of the first four pairs that passed were credited continuations
with newer releases. So the bot never replaces an entry itself, and D-053's
default to merge has an exception. For `replaces-entry`, the question is whether
the listed repo credits the new one and has a newer release. If it does, the
listed repo stays and the maintainer closes the pull request. Otherwise the pull
request merges. A pull request also held for `name-match` takes this question
alone, since the entry already holds the id. At this plan the user moved two entries by this question and kept
two. The rest of D-033, D-045, and D-053 stands. This choice is wrong if the
maintainer closes nearly every such pull request, or if a listed repo hides a far
larger original below these numbers.

### D-057: A read plugin that no category takes shows Other tools, annotating D-037

2026-11-03, M086 plan and T6. The user asked that no plugin be missing a category.
Word rules and hand lists cannot place every plugin, since some fit none of the
categories and some say too little, and the bot adds plugins that no one has read.
At the question set the user chose a computed "Other tools" category for a record
with upstream facts that no other category takes, over leaving such plugins with
none. The menu lists it last. A record with no upstream facts has no text to read,
so it keeps only its `include` categories. The rest of D-037 stands: categories
are the index's own grouping, the data carries none, and no bot merge needs hand
work. This choice is wrong if Other tools holds so many plugins that a visitor
cannot use it, or if users ask for it to go.

### D-058: The build reads four plugins at once and paces its API requests, annotating D-015 and D-028

2026-11-03, M087 plan. `pnpm build` read plugins one at a time, and a daily build
reached D-015's 18-minute limit, which left plugins `not-read`. At the question set
the user chose four reads at once, with the GitHub API requests of the plugin reads
started at least 80 ms apart. GitHub's best-practices page advises serial requests,
and its rate-limit page gives secondary limits by number. This choice departs from
the advice and stays inside the numbers, and M087's branch runs test it. The plan
rejected a longer limit, which the index outgrows, and serial API requests with
parallel downloads, since API requests take most of a read's time. The 18-minute
limit stays as a safety stop, and `not-read` keeps D-015's meaning and cost. D-028
still holds, since reads start in the day's order, so a cut leaves the last entries
in that order. A refused request still fails that plugin's read as build-level.
This choice is wrong if a build log shows an HTTP 403 or 429 from the API.

### D-059: The 1-in-10 test of the category rules reads plugins that the tuning did not see, annotating D-037

2026-11-03, M091 plan. D-037 says that its choice of word rules is wrong if a hand
read finds more than 1 in 10 assignments wrong after tuning. M066 and M086 read that
test on the data the rules were tuned on, where a wrong mark becomes a fix, so the
test could not fail. At the question set the user chose a held-out group: plugins
that the read keeps out of the tuning and marks only after the rules are fixed. Over
1 in 10 wrong on that group stops the milestone before the merge question, and the
user decides whether word rules stay. The user chose this over reporting the rate
and going on, and over tuning on every new plugin with no such group, which gives
every plugin to the rules and no measure of a plugin they have not seen. The rest of
D-037 and D-057 stands. Later reads of new plugins use the same test. This choice
is wrong if a held-out rate does not hold on the next new plugins that a read marks.

### D-060: Word rules stay although a held-out read missed the 1-in-10 test, annotating D-037 and D-059

2026-11-03, M091 stop. M091's held-out read marked more than 1 in 10 assignments
wrong on plugins that the tuning did not see, and the tuning changed almost none of
them. `cairn/references/category-ledger-2026-11-03.md` holds the counts. D-059 gave
this decision to the user. The user kept word rules and finished the milestone, over
finishing with a high-priority row to replace them, and over stopping to re-plan. A
category stays the index's own grouping, which the About page says can be wrong, and
the other ways to place a new plugin need work on each bot merge, which D-037
rejected. So 1 in 10 no longer decides whether word rules stay. A category that a
pattern gives a plugin that no read has marked can expect the rate of the latest
held-out read, until a read fixes it. Later reads still state a held-out rate, as D-059 says. This choice is wrong if
visitors report wrong categories as a problem, or if a later held-out read finds a
rate clearly above this one.

### D-061: A rule can be scored on earlier held-out marks that its author did not see, annotating D-059

2026-11-04, M092 plan. D-059 says that a held-out group is one that a read marks
only after the rules are fixed. M092 tests new `ai` and `attachments` rules, and
every listed plugin already has marks, so no such group exists now. At the question
set the user chose a blind test: a fresh author who sees neither the held-out
section of `cairn/references/category-ledger-2026-11-03.md` nor the id lists writes
the rules, the rules are frozen, and they are scored on those marks. The user chose
this over waiting for new plugins and over not building. The result of that test
decides whether each rule ships, but it does not stand for unread plugins, since
these marks are why the two categories were chosen. So DESIGN's expected rate stays
that of the latest held-out read until a read of new plugins replaces it. The rest
of D-059 and D-060 stands, and later reads of new plugins use D-059's test. This
choice is wrong if that later read shows these two categories no better than the
base rules.

### D-062: The maintainer removes a plugin for an owner's request, spam, a misleading entry, or shown harm, annotating D-006, D-051, and D-053

2026-11-04, M093 plan. DESIGN says that the maintainer removes spam and honors an
author's request to delist, and no public text said so. Before the index is
advertised, the user chose four grounds: a repository owner's request, spam, an
entry that misleads about what the plugin is or who makes it, as D-053 frames it,
and harm that a report shows with evidence a reader can check. A claim with no
evidence removes nothing. The user rejected a rule of spam and misleading entries
only, since a plugin with shown malware would stay listed, and a decision case by
case with no stated rule.

This does not make the index a reviewer. D-051 stands: the index cannot vet plugins
and reads no plugin code unless a report's evidence asks for it. Inclusion stays no
judgment of quality (D-006), and a plugin with no report stays listed. A removal
lasts, because deleting an entry alone lets the bot propose the repo again. So a
checked-in list names each removed repo. Its ids hold only ids that the maintainer
judged unique to that repo, since a fork can keep its source's id (D-053, D-056).
This choice is wrong if reports of harm take more of the maintainer's time than one
person can give, or if a report of shown harm proves false after a removal.

### D-063: The code is under MIT and the index's own data work is under CC0

2026-11-04, M095 plan. The repo had no license, while its data is a public API
(D-006). The user chose MIT for the code and CC0 1.0 for the facts the index
gathers, its categories, and text the maintainer wrote, over MIT for everything,
whose notice is awkward for a data file, and over AGPL for the code, which limits
reuse. All other text keeps its author's terms, since the index cannot license
plugin names, descriptions, GitHub About text, or text that an owner asked for.
This choice is wrong if a data user or an author shows that these terms block a use
that the index means to allow.

### D-064: Plugin pages state a plugin's access and that the index does not review code, annotating D-029 and D-051

2026-11-05, M096 plan. Before the index is advertised, a visitor who found a
plugin had a download link but no install steps, and the site said that it
cannot vet without saying what a plugin can reach. A plugin page with a
download link now has a note with Zotero's own install steps and its warning
that a plugin has full access to Zotero and the computer. The note says that
the index does not review a plugin's code before listing it, not that no one
reads it, since nothing can show that no person ever did. An About section
adds how a bot and a maintainer list plugins. The note is text, so D-029's
plain link stays and an install button stays out of scope. D-051 stands, and
the home intro still says that the index cannot vet, now after a first
sentence on what the site shows. The intro's other sentences, on the daily
read, who reads the paid service fact (M082), and when a plugin starts again
(M059), stay on About only, so a visitor to the home page reads them one click
away. At the question set the user kept the home rows' download icons, which
skip the note, and put the bot's role on About only. This choice is wrong if
visitors install from a home row without knowing the risk, or if Zotero's
steps or warning change.

### D-065: The home table opens in star order, and the legend says that this is no review, annotating D-006 and D-051

2026-11-05, M097 plan. Before the index is advertised, the home table had no
sort, so a visitor could not pick out established plugins. The user chose a
"Sort by" menu with Stars as the default, over keeping Name as the default,
which implies no ranking but leaves the first screen to the alphabet. A star
count is a fact that GitHub gives, and the plugin page already shows it. It is
not a review. The legend says that the count and the default order come from
GitHub and that neither is a review by the index. D-006 and D-051 stand:
inclusion is no judgment of quality, and the index cannot vet plugins. The
plain list order now favors older, known repos, and a new plugin starts far
down. This choice is wrong if visitors read the order as the index's advice,
or if star counts get inflated to reach the first page.

### D-066: A record whose read fails for a build-level reason keeps the deployed record's facts for 7 days, annotating D-011, D-012, D-015, D-023, and D-035

2026-11-05, M100 plan. A build that its time limit or a host cuts left each unread
plugin with no facts, since the build restored no earlier data (D-015), and such a
build deploys when at most half of its records are build-level. With `--previous`,
`pnpm build` now gives a record whose read fails for a build-level reason the
`upstream` and `startTests` of the deployed record, with a new optional `kept` field
that holds when those facts were read and this build's failure. It keeps them for at
most 7 days after that read, and the site marks the row "Older data". The user chose
build-level failures only, the 7-day limit, the badge on the home row and a note on
the plugin page, and keeping the deploy bars at more than half, over a bar at a
quarter, which would hold back every plugin's fresh facts for one cut build.
A kept record still counts as failed in both bars (D-011, D-012), so a kept record
can never make a build deploy that would not deploy before. The build-level mark now
reaches the data through `kept`, which narrows D-011's sentence that it never does.
D-015's cost, no facts for an unread plugin, now holds only for a plugin with no
deployed facts younger than 7 days. A kept record keeps every start result of the
build that read it, which D-035 never reuses for a result other than `started`, and
`pnpm carry-start-results` carries nothing from it, so a result ages at most one keep
beyond D-035's week. That also lets a forged result (D-023) stay up to 7 days longer.
The plan read the deployed data after the plugin reads, only when a build-level
failure exists, so a normal build spends nothing on it. This choice is wrong if
visitors read kept facts as current despite the badge, or if a kept record shows a
release that its author withdrew.

### D-067: A triage pass drops one candidate row as not worth keeping

2026-11-05, triage pass. A `/cairn-triage` pass weighed every candidate row and
Known issues entry. The user accepted dropping "Tighten the paced build reads".
It would have fixed five gaps that the M087 review found in the paced API reads:
a test that can show a gap under 80 ms after a pause over 1 ms, a read aborted in
the queue that fails about 240 ms late, the host `api.github.com.` with a trailing
dot skipping the pacing, a 64 KiB stdout test that a build slower than 12 s passes
without a full pipe, and a test with about 160 ms of margin. No documented or
common use meets them. A test that fails in CI shows itself without a row, and the
build writes its API URLs with `api.github.com` and no trailing dot.

The drop can be reopened by an entry that supersedes this one.

### D-068: The site and its data move to zotero-plugins.jmgirard.com, and GitHub's forward serves the old addresses, annotating DESIGN's stable data URL

2026-11-05, M102 plan. DESIGN promises the data at a stable URL under
`https://jmgirard.github.io/zotero-plugin-index/`. Before the index is
advertised, the user chose to move the site, the data, and the schemas to
`https://zotero-plugins.jmgirard.com/`, a subdomain of the user's own domain. The
address is shorter to share, the link names what the site is, the user's domain
shows that the index is not Zotero's planned directory, and a site at a host's
root can have a `robots.txt`. The user rejected a new domain, whose lapsed renewal
would break every link and whose name would need "Zotero" to say what it is, and
staying on github.io, whose address every link shared after launch would then fix.
With a custom domain set, GitHub answers each old address with a 301 to the same
path and query on the new host, observed on the user's `circumplex` repo. That
forward goes to http first and carries no Access-Control-Allow-Origin header, so
a script in another site's page that fetches the old data URL fails, while page
visits and clients that follow redirects still work. The user chose to move with
that cost stated, as no outside use of the data is known. The README and the
changelog tell data users to switch. Each schema's `$id` moves too, so it stays
its own URL. That changes no field, so the data stays at v1 (D-007 governs
shape, not address). This choice is wrong if a data user reports a working client
that the move broke, or if GitHub's forward stops keeping the path.

### D-069: The site moves to zotdex.jmgirard.com and is named Zotdex, annotating D-068

2026-11-05, M103 plan. D-068 chose `zotero-plugins.jmgirard.com` partly because
the link names what the site is. The user then judged that a name under their own
domain reads as plugins they wrote, and that a longer descriptive name such as
`zotero-plugin-index.jmgirard.com` is too long. So the site, the data, and the
schemas move to `https://zotdex.jmgirard.com/`, and the site's visible name
becomes Zotdex, with the home title "Zotdex: a Zotero plugin index" saying what
it is. D-068's other reasons stand: a subdomain of the user's own domain, no
Zotero-branded domain, and GitHub's forward for old github.io addresses, with the
same cost for a script in another site's page. `zotero-plugins.jmgirard.com` gets
no redirect, as it served the site for about two hours and was never announced.
The GitHub repo keeps its name. This choice is wrong if readers do not connect
Zotdex with Zotero plugins, or if a link to the old subdomain turns up in use.

### D-070: The GitHub repo is renamed zotdex, and the old github.io address may stop forwarding, annotating D-068 and D-069

2026-11-05, M104 plan. D-069 kept the repo's name. The user then chose to rename
it to `jmgirard/zotdex` so that people who know the site as Zotdex find the repo
by that name. GitHub forwards a renamed repo's web, issue, and git addresses, and
the build reads the repo from `GITHUB_REPOSITORY`. The rename likely ends the
forward from `https://jmgirard.github.io/zotero-plugin-index/`, which exists only
because a repo of that name holds the custom domain. D-068 relied on that forward
and had the README tell data users to switch. The user judged that address unused
in its 11 days and chose to drop it from the README, with the changelog saying
what it answers after the rename. Creating a new repo named `zotero-plugin-index`
under the same account would end GitHub's forwards from the old repo name. This
choice is wrong if a user reports a broken link to the old repo or old github.io
address.

### D-071: Each plugin has a Zotdex badge file at a stable address, and the badge states starts only, annotating D-023 and D-066

2026-11-05, M105 plan. The site publishes `badges/<id>.json` for each listed
plugin, a shields.io endpoint file that authors embed in a README through
`img.shields.io`. The address is a public path that READMEs depend on, so it
stays stable like the data URL. The badge is labeled Zotdex, so readers see who
ran the test and can reach the index. It says "started in Zotero" and the majors
whose newest start result is `started`, never "works" (D-023). A record that
keeps earlier facts (D-066) shows the same badge with no mark, at the user's
choice: the facts are at most 7 days old, and the plugin page keeps its "Older
data" note. The site shows the snippet as text and loads nothing from
shields.io. The user rejected a page on About alone. This choice is wrong if
readers take the badge as a works claim, or if a kept record's badge misleads a
user.
