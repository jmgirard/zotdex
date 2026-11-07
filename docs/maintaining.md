# Maintaining the index

## Setup

The project uses Node 24 or later and pnpm. To install the dependencies, run:

```bash
pnpm install
```

## Adding a plugin

To draft an entry from the GitHub repository of a plugin, run:

```bash
pnpm add-plugin https://github.com/<owner>/<repo>
```

The command reads the repository and its releases. It reads the
`manifest.json` in the newest stable release that has an `.xpi` file, and the
`update.json` that the manifest names. A stable release is a release that
GitHub does not mark as a prerelease. If no stable release has an `.xpi`
file, the command reads the newest release that has one. The stable release
can fail to be a Zotero 7+ build: its `.xpi` file has no `manifest.json`, the
manifest has no `applications.zotero.id`, or its `strict_max_version` is
below 7. If a later release has an `.xpi` file, the command then reads the
newest such release instead. Then it writes `plugins/<id>/meta.json` and
`plugins/<id>/index.json`. To write the entry in another directory, add
`--out <dir>`. The command does not replace an entry that already exists.

If the plugin does not meet the inclusion bar, or the command cannot read one
of these files, the command writes no file. It prints the name of the failure
and a message, then exits with status 1. Two failure names are `fork` and
`no-xpi-release`. An archived repository, and one with no source code at its
top level, passes the inclusion bar, so the command writes its entry. The `Failure` type in `src/upstream/reader.ts`
lists each failure name for reading a plugin. The `WriteResult` type in
`src/add-plugin/add-plugin.ts` adds `entry-exists`, `unsafe-id`, and
`write-failed`. If the rule `entry-name` of "Checking entries" refuses the
id as a directory name, the command fails with `unsafe-id`. An example is
the Windows name `CON`. If an entry has the id as its name, the command fails
with `entry-exists`. A name that differs from the id only in case also
counts.

The command limits what it downloads from the plugin's release and update
host, and what it unzips from the XPI:

- An XPI larger than 50 MiB fails with `xpi-too-large`.
- A `manifest.json`, or the `messages.json` of the default locale, whose
  size in the zip, unzipped or compressed, is more than 1 MiB fails with
  `manifest-too-large`.
- An `update.json` larger than 1 MiB fails with `update-json-too-large`.
- An XPI whose zip claims more entries than its length can hold, at 46
  bytes for each entry, fails with `xpi-unreadable`.
- An XPI whose zip has more than one entry named `manifest.json`, or more
  than one entry named the `messages.json` of the default locale, fails
  with `xpi-unreadable`.
- A `manifest.json`, or the `messages.json` of the default locale, whose
  deflate data inflates past the unzipped size that the zip declares fails
  with `xpi-unreadable`. The command inflates 16 KiB of that data at a time
  and stops after the first 16 KiB whose output passes that size.
- The `messages.json` of `_locales/en/`, `_locales/en_US/`, or
  `_locales/en_GB/` fails nothing. If the command refuses such a file under
  the rules above, it skips the file. The rules still apply to the same
  file as the default locale's.
- A file in a locale folder fails nothing. The command inflates the whole
  file, 1 KiB of input at a time, and then counts its messages. For each
  file it counts the largest of the declared size, the compressed size, and
  the output. It does not inflate a
  locale file that takes that count for the XPI past 8 MiB. One file that
  inflates past its declared size can add about 1 MiB more. A locale file
  over 1 MiB, past that count, or not readable keeps its language in the
  list.

Before the command requests the XPI, the `update.json`, or a redirect target,
it checks the host. The read fails with `host-refused` for `localhost` and
for names that end in `.localhost`. It also fails for a host that is, or
resolves to, an address in a blocked range. The blocked ranges include the
loopback, private, link-local, shared, multicast, documentation, benchmark,
6to4, and NAT64 ranges. `src/upstream/host-guard.ts` lists them. The command
follows at most 5 redirects for these two files.

GitHub limits the number of API requests per hour. If the `GITHUB_TOKEN`
environment variable is set, the command sends it with each GitHub API
request, which gives a higher limit.

## Finding new plugins

To search GitHub for plugins that the index does not list, run:

```bash
pnpm discover
```

The command searches for repositories with the topic `zotero-plugin` or
`zotero-addon`. It also reads the
[zotero-chinese plugin catalog](https://github.com/zotero-chinese/zotero-plugins),
a list of plugins that its maintainers add by hand. It reads the list from
the file `plugins.json` on the catalog's `gh-pages` branch, through the
GitHub API. Then it runs five GitHub code searches for files of Zotero
plugins, and takes the repository of each file found:

- `"applications" "zotero" "strict_min_version" filename:manifest.json`
- `"applications" "zotero" "update_url" filename:manifest.json`
- `"zotero-plugin-toolkit" filename:package.json`
- `"zotero-plugin-scaffold" filename:package.json`
- `"zotero-plugin" "zotero-types" filename:package.json`

Some repositories in the catalog or the code search results are not in the
topic search. For each of them, the command asks the GitHub GraphQL API for
the current name and the time of the last push. One request asks about at
most 100 repositories. This lookup needs the `GITHUB_TOKEN` environment
variable. If `CODE_SEARCH_TOKEN` is set, the code search sends it.
Otherwise it sends `GITHUB_TOKEN`. A repository that more than one
source names counts once, by its lowercase owner/repo name after the
lookup. The report names its source as the first of the topic search, the
catalog, and the code search that names it.
The command leaves out each repository that an entry already names or that
`delisted.json` names (see "Removing a plugin" in
[requests.md](requests.md#removing-a-plugin)). It reads the other
repositories in the same way as `pnpm add-plugin`, the newest pushed first. It writes the entries of at most 5 repositories that
pass the inclusion bar under `plugins/`, and it reads at most 100
repositories. To
change these numbers, add `--limit <n>` or `--budget <n>`. To write the
entries in another directory, add `--out <dir>`. The command prints a JSON
report that names each repository that it wrote, refused, or skipped.

If the read of the catalog fails, the report gets a warning, and the
command reads the repositories of the topic search. These cause the read to
fail:

- a failed connection or an HTTP error answer
- a body that is not a JSON list, or a body larger than 8 MiB
- a read longer than 60 seconds

A catalog item whose `repo` is not an owner/repo name gets a warning, and
the command skips it. The report names at most 10 such items and counts
the rest. The catalog and the code search each have their own lookup. If a
lookup request fails, the report gets one warning. The command then looks
up no more repositories of that source. It reads none of the repositories
that it did not look up. Without `GITHUB_TOKEN`, the first lookup request
fails, so the command reads no repository that only the catalog or the
code search names. A repository that GitHub does not have, or that has no
last push, also gets a warning, and the command does not read it. A failed topic
search still ends the run before any read.

GitHub allows 10 code search requests a minute. So the command sends at
most 10 of them in any 60 seconds, failed requests included, and waits
before the next one. An answer can also name a wait: `retry-after` in
seconds, or `x-ratelimit-remaining: 0` with the `x-ratelimit-reset` time.
Then no query sends a code search request until 1 second after that wait
ends. The command reads a reset against the `date` of the answer, so a
runner clock ahead of GitHub's waits longer. GitHub can refuse a page with
HTTP 403 or 429 and name a wait. Then the report gets a warning, and the
command sends that page once more after the wait. If a code search request
fails otherwise, or a page fails twice, the report gets a warning that
names the query. The command keeps the repositories of that
query's earlier pages and runs the next query. A page with no list of items
counts as a failed request. These cause a request to fail:

- a failed connection or an HTTP error answer
- a body that is not JSON
- a request longer than 60 seconds

The command sends no code search request from 8 minutes after its start.
Each query that it did not finish then gets a warning, and the command goes
on with the repositories that it found. An item with no owner/repo name
gets a warning, and the command skips it. The report names at most 10 such
items for each query and counts the rest. A query with more than 1,000
results also gets a warning, since GitHub returns only the first 1,000. If
every query ends with no item and no failure, the report gets one warning.
A token that cannot see GitHub's code index can get such empty pages. The
time of the code search counts toward the run's time limit of 18 minutes,
which the paragraphs below describe.

The command also refuses a plugin that the bot cannot propose, with the
failure name `not-proposable`. Some examples:

- an id that is not a Mozilla add-on id
- a repository name that git refuses as a branch name
- a value longer than `pnpm propose` accepts

`pnpm discover-issue` refuses such a plugin in the same way.

The command keeps a state file, `.cache/discovery-state.json`. The file
records each refused repository. A later run reads that repository again
only after a new push or after 30 days. The file does not record a GitHub API
error, such as a rate limit, or a failed request. It also does not record an
HTTP 429 or 5xx answer to the download of the XPI or the `update.json`, after
any redirects. Nor does it record a 403 answer to a download that requested
a GitHub release download URL, as "Building the data" defines it. Nor does it
record a refusal by `delisted.json`. Such a
repository is read again on the next run. If a run does not find a refused
repository, the file still keeps its record until 30 days after the
refusal. So a failed catalog read or code search loses no record that makes
a run skip a repository. To use another file, add `--state <file>`.

The command gives each repository read 3 minutes, as `pnpm build` does. If a
read takes longer, the command stops it and refuses the repository with
`request-failed`. The state file does not record this refusal, so the next
run reads the repository again. The check of the branch name with git stops
after 30 seconds. If it takes longer, the command refuses the repository with
`unexpected-error`, which the state file also does not record. The command
starts no lookup request and no repository read after 18 minutes from its
start. The `unread` field
of the report counts each repository that it did not reach. The report also
gets a warning that names the time limit. The command still writes its state
file and, with `--handoff`, its handoff. These limits leave time for the
other steps of the first job of `Discover plugins`, which GitHub stops at 30
minutes. In the second job, `pnpm propose` has limits on each process but
none on the whole run.

### Pull requests from the bot

The `Discover plugins` workflow runs once a day in two jobs. You can also
start it by hand on the default branch and set its `limit` and `budget`
inputs. They reach `pnpm discover` as `--limit` and `--budget`, and
`limit` also reaches `pnpm propose`. A scheduled run sets neither, so the
defaults of 5 and 100 apply. A run started on another branch does nothing.

The first job can only read the index repository, and its checkout keeps no
token. It runs `pnpm discover --handoff handoff`. With `--handoff <dir>`, the
command writes each new entry under `<dir>/entries/` and a plan file,
`<dir>/plan.json`, that lists them. The command makes no change on GitHub.
The job keeps the directory as a workflow artifact.

The `pnpm discover` step also gets the repository secret
`CODE_SEARCH_TOKEN`, and no other step gets it. Only the code search
requests use it. On 2026-10-31, GitHub answered HTTP 429 to every code
search request that the workflow's built-in token sent (discover run
41224882790). Make the secret a fine-grained personal token with
read-only access to public repositories. If the secret is not set, the
code search uses the built-in token, and each query gets a warning.

The second job can push and open pull requests, and it reads no plugin
repository. It runs `pnpm propose handoff`. For each entry in the handoff,
the command pushes the branch `discover/<owner>/<repo>` with one commit that
adds the two files of the entry. For a `replaces-entry` hold, the commit
changes only the entry's `meta.json`. Then it opens a pull request from that
branch. A run opens at most 5 pull requests, or the number that `--limit`
gives.

The first job reads files that anyone can write, so `pnpm propose` does not
trust the handoff. It refuses the whole handoff, and pushes nothing and sends
no request, in cases such as these:

- `plan.json` does not match its schema.
- An id is not a Mozilla add-on id.
- A repository name is not a lowercase owner/repo that makes a valid branch
  name.
- The handoff holds more entries than the limit, which is 1 for an issue
  run.
- An entry directory holds anything other than the regular files `meta.json`
  and `index.json`.

Before it pushes, the command reads the bot pull requests again. It also
fetches the default branch and reads the index at the fetched commit. Each
pull request builds on that commit, so an entry merged before the fetch
counts, also one merged while the read job ran. It skips an entry that the
pull requests or that index has. An entry held for `replaces-entry` needs its
id in that index. If that id no longer lists the repository that the read job
compared, the command skips the entry. It gives the token to git only in git's
environment, and `pnpm check` gets no token.

The workflow uses the built-in `GITHUB_TOKEN`, and a pull request that this
token opens starts no CI run. Thus the body of each pull request gives the
exit status and the output of `pnpm check` on the new entry. If the output
is longer than 10,000 characters, the body quotes only its first 10,000
characters and says that the output is cut. The body also gives the
repository URL, the plugin version, and the declared range of Zotero
versions. Its first sentence says how the bot found the repository: by its
GitHub topic, in the zotero-chinese plugin catalog, by GitHub code search
for Zotero plugin files, or from an issue.

The body also has a Hold line. The read job reads the hold reasons of each
entry, and the line names them, or says `Hold: none`. An entry has these
reasons, in this order:

- `name-match`: the manifest name matches the name of an entry from another
  owner, or the repository name without its owner matches that part of such
  an entry's repository. The match ignores letter case and each character
  other than `a` to `z` and `0` to `9`. It also drops `zotero`, `plugin`,
  `addon`, and `for` where they stand apart as words. A name with nothing
  left matches no entry. Two plugins can share a name, so a match alone is
  no hold. The bot holds for a matched entry in one of these cases:
  - The two default branches have the same first commit.
  - Identical files are at least 30% of either repository's files, not
    counting empty files and boilerplate such as licenses, lock files, and
    `.github` folders.
  - The entry's repository is older, has at least 20 stars, and has at least
    10 times the new repository's stars.
  - The bot did not get one of these facts. This includes an entry that is
    not on GitHub and an entry past the 5 that the body names. A brief
    failure also gives this hold, and the hold stays until the maintainer acts.
- `owner-unread`: the bot did not get the creation date of the owner's
  GitHub account.
- `new-account`: the owner's GitHub account is less than 30 days old.
- `update-host`: the host of the manifest's `update_url`, with any port other
  than the default one, is not `github.com`, `raw.githubusercontent.com`, or
  `<owner>.github.io`, where `<owner>` is the repository's owner in any letter
  case. Another owner's `.github.io` site gets this hold. If a redirect of
  the bot's read takes a file on `<owner>.github.io` to any other host, the
  pull request gets this hold. A later redirect back does not change that.
  This hold does not test the redirects of `github.com` and
  `raw.githubusercontent.com` addresses, since GitHub's release addresses
  redirect to its own file hosts. On every host, a URL of that read that uses
  `http:` gives this hold. When the bot drafts the pull request, it decides
  this hold. `pnpm refresh-holds` changes no Hold line, so a pull request
  drafted earlier keeps its Hold line.
- `issue-no-topic`: an issue proposed the repository, and it has neither the
  topic `zotero-plugin` nor `zotero-addon`. A repository that
  `pnpm discover` finds in the catalog or by code search never gets this
  hold, since no issue proposed it.
- `replaces-entry`: an entry already lists the plugin's add-on id from another
  repository on GitHub. The new repository is older, has at least 20 stars,
  and has at least 10 times that repository's stars. Any other repository
  whose id the index has is refused as `entry-exists`. A repeated id in an
  issue run is also refused. So are an id that differs only in letter case and
  an id that an open bot pull request adds or changes. The pull
  request changes only the entry's `meta.json`, so the entry keeps its
  `index.json`. The numbers cannot show which repository is the original, so
  the maintainer decides. A listed repository that credits the new one and has
  a newer release stays. Otherwise the maintainer merges the pull request.

A held pull request also gets the label `hold`, and the maintainer merges or
closes it. The maintainer mainly checks whether the entry misleads people about
what the plugin is, who makes it, or who controls its updates. If the label request fails, `pnpm propose` names the pull request
as a failed entry and exits with status 1. The pull request stays open, and
its Hold line still keeps the bot from merging it. In an issue run, the
issue still gets the comment that names the pull request.

Below the reasons, a held pull request's body has the lines "Details for
the maintainer". They give the facts behind the hold:

- For `name-match`, one line with the new repository's creation day and
  stars, and one line for each matched entry. An entry's line has its name
  and a link to its repository. It also has the repository's creation day
  and stars, whether the first commit is the same, and the larger share of
  identical files. The body names at most 5 and counts the others. A fact
  that the bot did not get says "not read".
- For `update-host`, the host of the manifest's `update_url`, each other host
  that a redirect of the read went to, and whether a URL of the read used
  `http:`.
- For `replaces-entry`, one line for the new repository and one for the listed
  repository. Each has the creation day, the stars, and the day of the newest
  stable release, which is GitHub's latest release of that repository. A fact
  that the bot did not get says "not read", and a 404 for the release says
  "none". If no entry lists the id from another GitHub repository now, one line
  says so in place of the listed repository's line. The new repository's line
  then goes too, unless a `name-match` names or counts an entry. More lines
  name each
  override and each value of the paid-service mark that the kept `index.json`
  holds, or say that it holds neither.
- For every hold, the day that the owner's GitHub account was made, or a
  note that the bot did not get that day.

To write these lines to held pull requests that are already open, run
`pnpm refresh-holds` by hand. No workflow runs it. It needs
`GITHUB_REPOSITORY`. It works out the facts again from the pull request's
`meta.json`, the `plugins/` folder in your checkout, and the owner's
account. For a `name-match`, it also reads the new repository and the named
entries on GitHub. A failed read of these says "not read" in the line and
does not fail the pull request. For an `update-host`, it also reads the
update file's route: it requests the `update_url` and follows its redirects,
without reading the file's contents. A failed read of the route fails the
pull request and leaves its body as it is. An HTTP error, a refused host, a
failed request, and a read past 60 seconds are each a failed read. For a
`replaces-entry`, it also reads the two repositories and the kept `index.json`.
A failed read of a repository says "not read" in the line. A failed read of
`index.json` fails the pull request and leaves its body as it is. First
update your
checkout to the default branch, or the match
lines can be wrong. The command acts on an open pull request that meets all
of these conditions:

- Its branch and author pass the first two conditions of
  `pnpm merge-discover`.
- It has the `hold` label.
- Its one Hold line names reasons.
- Its files are exactly `plugins/<id>/meta.json` and
  `plugins/<id>/index.json`, both added. For a `replaces-entry` hold, its one
  file is a modified `plugins/<id>/meta.json`.
- Its body has the closing sentence below the Hold line.

If nothing matches a `name-match` now, the line says so. Without options,
the command prints a `to edit #<n>:` line and the new lines for each pull
request whose body changes. With `--apply` and a `GITHUB_TOKEN` that can
edit pull requests, it sends the new body and prints `edited #<n>:` instead.
Just before it sends a body, it reads the pull request again. If the
pull request closed, lost its `hold` label, or has another body, the command
skips it. The command changes only the text from the "Details for the
maintainer" line to the closing sentence. So a note that you add there is
lost on the next run. It changes no Hold line and no label, so it holds or
releases nothing.

The command also prints `unchanged #<n>`, and `skipped #<n>: <reason>` for
each other open pull request. If a read of a pull request fails, it leaves
that body as it is. If the owner's account gives no date and the Hold line
does not name `owner-unread`, it does the same. In both cases it prints
`failed #<n>: <error>` on stderr and goes on to the next. If a pull request
failed, it exits with status 1.

If you close a bot pull request without a merge, the bot does not propose
that owner/repo name again. The bot also skips a repository whose bot pull
request is still open, and a plugin whose id an open bot pull request already
adds. A renamed repository has a new name, so the bot can
propose it again.

If the push or the pull request fails for one entry, the command goes on to
the next entry. At the end, it names each failed entry with its error and
exits with status 1. If the fetch of the default branch fails, every entry
fails, and the command pushes nothing. If the fetched commit has no
`plugins/` folder, the same happens. An entry that a bot pull request adds
also fails then.

`pnpm propose` stops each git process that fetches, builds, or pushes a
commit after 2 minutes, and each `pnpm check` process after 5 minutes. If a
process for one entry takes longer, that entry fails, and the command opens
no pull request for it. If the fetch of the default branch takes longer,
every entry fails, as when the fetch fails. The
command also checks each branch name in the handoff with git again, with the
30-second limit of "Finding new plugins". The check can pass that limit,
or git can fail to start or end with any result other than exit status 1.
Then the command pushes nothing, prints the error, and exits with
status 1. In an issue run, the command first comments the error on the
issue, as "Proposing a plugin with an issue" in
[requests.md](requests.md#proposing-a-plugin-with-an-issue) says.

Both commands read the name of the index repository from the
`GITHUB_REPOSITORY` environment variable, which GitHub Actions sets. The
workflow needs the repository setting "Allow GitHub Actions to create and
approve pull requests" under Settings > Actions > General.

### Merging bot pull requests

The `Merge bot pull requests` workflow runs `pnpm merge-discover` once a day
at 05:13 UTC, before the daily build. You can also start it by hand on the
default branch. It runs in the same group as `Discover plugins`, so it never
runs while that workflow or `Add a plugin from an issue` runs.

The command reads every page of the open pull requests. It merges a pull
request that meets all of these conditions:

- Its branch starts with `discover/` and is in the index repository.
- `github-actions[bot]` opened it.
- Its body has a line that is exactly `Hold: none`.
- It has no `hold` label.
- It opened at least the run's wait before the run: 48 hours, or that run's
  `wait_hours` in a run started by hand.
- Its files are exactly `plugins/<id>/meta.json` and
  `plugins/<id>/index.json` for one id, both added.
- The checkout's `plugins/` folder has no folder of that id in any letter
  case.

The command looks for the Hold line only outside fenced code, so a line in
the quoted check output does not count. The body must have no other line
that starts with `Hold:`. It matches the `hold` label in any letter
case. It also skips a draft and a pull request whose base is not the default
branch.

So the bot can merge a bot pull request without a hold reason at its first
daily run at least 48 hours after it opens. A run started by hand uses its
own `wait_hours` (48 unless changed) instead, so a smaller value merges it
sooner. To stop the
bot from merging one, add the `hold` label or close it. Bot pull requests
opened before the Hold line existed have no `Hold: none` line, so the
command never merges them.

When you start the workflow by hand, its `wait_hours` input sets the wait in
whole hours, from 0 to 9999. It is 48 unless you change it. Scheduled runs
have no inputs, so they always wait 48 hours. If the command refuses the
value, such as `1.5` or `-1`, the run fails and merges nothing. On the
command line, `pnpm merge-discover --wait-hours <n>` sets the same wait. A
pull request whose opening time cannot be read or is after the run is
skipped whatever the wait.

To add every clean plugin at once, for example to fill a new index, run
rounds of these two steps:

1. Start `Discover plugins` by hand with `limit` 100.
2. After that run finishes, start `Merge bot pull requests` by hand with
   `wait_hours` 0.

GitHub does not promise the order of runs that wait in the group, so start
the merge only after the discover run ends. Repeat both steps while a
discover run reports unread repos. Held pull requests stay open for you. A
run reads at most `budget` repositories, 100 by default, within its time
limit of 18 minutes. The code search takes part of that time, so a larger
`budget` can end at the time limit instead.

Before it merges, the command reads the two files at the head commit of the
pull request. It copies the checkout's `plugins/` folder, adds the new entry,
and runs `pnpm check` on the copy. An entry that this run merged is in that
copy too. Then it reads the pull request again. The command skips it if,
since the first read, it closed, got the `hold` label, lost its
`Hold: none` line, or moved its head. Otherwise it squash-merges the pull
request at that head commit.

In these cases a pull request fails, and the command goes on to the next:

- Its head has no commit SHA.
- A read of its files or their contents fails.
- The check fails or passes its time limit of 5 minutes.
- GitHub refuses the merge.

The command first prints a `merged #<n>` line for each merged pull request.
Then it prints a `skipped #<n>: <reason>` line for each skipped one. Last,
it prints a `failed #<n>: <error>` line on stderr for each failed one. If a
pull request failed, the command exits with status 1. Some reads stop the
whole run: the default branch, the list of pull requests, and the
checkout's `plugins/` folder. If one of them fails, the command prints
`merged nothing: <error>` and exits with status 1.

A merge made with the workflow's `GITHUB_TOKEN` starts no workflow run, so
the merged plugin appears on the site after the next daily build.

## Checking entries

To check every entry under `plugins/`, run:

```bash
pnpm check
```

The command prints one line for each problem, then a summary line. Each
line names the entry directory or file and the rule that failed. If it finds a problem or cannot
load the registry schema, it exits with status 1. To check
the entries in another directory, give its path: `pnpm check <dir>`.

The command skips each name that starts with `.`, such as `.idea`. Three
rules check the names in the directory:

- `entry-is-directory`: each other name must be a directory.
- `entry-name`: a directory name holds only the letters A to Z and a to z,
  the digits, and `_ @ { } + . -`, at most 200 characters. It must not end
  with `.`. The part before its first `.` must not be one of the
  names that Windows reserves, in any case: CON, PRN, AUX, NUL, COM1 to
  COM9, and LPT1 to LPT9. For example, `nul.tar.gz` is refused.
- `unique-ignoring-case`: two directory names must not differ only in case,
  because Windows and macOS check them out as one directory. The line names
  every directory of the set.

In each entry, the rule `registry-schema` checks `meta.json` against the
registry schema, and `index-schema` checks `index.json` against its schema.
A file can start with a UTF-8 byte-order mark (U+FEFF). Then the line names
the mark, in place of "is not valid JSON". Save such a file as UTF-8
without the mark. Besides `index-schema`, two rules check the overrides in
`index.json`:

- `reason-not-blank`: a reason must hold a character other than whitespace,
  as JavaScript's `\s` defines it, and Unicode format characters. Most
  format characters, such as U+200B (zero width space), print nothing.
- `unique-override`: two overrides must not have the same `field` and
  `version`. An override with no `version` repeats only another override
  with no `version`. Versions must match exactly, so `1.0` and `1.0.0` do
  not repeat each other. The line names the index of the repeat and the index
  of the first override with that field and version. The site never applies
  the repeat.

Three rules read `delisted.json` at the top of the repo, whatever directory
the command checks (see "Removing a plugin" in
[requests.md](requests.md#removing-a-plugin)):

- `delisted-id`: an entry's directory name or `meta.json` id must not be on the
  list, in any letter case.
- `delisted-repo`: an entry's `repoUrl` on github.com must not name a repo on
  the list, in any letter case and with or without `.git`.
- `delisted-file`: the list must exist and match
  `schemas/delisted.schema.json`.

The first run downloads the registry schema into `.cache/`, so that run needs
a network connection. The command refuses a downloaded or cached schema whose
SHA-256 differs from the hash pinned in `src/check/registry-schema.ts`.

## Building the data

To build the data file, run:

```bash
pnpm build
```

The command reads each entry under `plugins/`. Then it reads the label
`report` and every page of the closed issues with that label. It reads them
from the repository that `GITHUB_REPOSITORY` names. If that variable is not
set, it reads them from `jmgirard/zotdex`. A fork that builds
the data must have a label named `report`, or the build exits 1. Then it
reads each plugin
from GitHub in the same way as `pnpm add-plugin`. It writes one file,
`dist/v1/plugins.json`. The file has a `schemaVersion` of `1`, a
`generatedAt` time, an optional `zoteroRelease` from the read below, and
one record for each entry. Each record keeps the upstream facts in an
`upstream` block and the overrides of the entry, with their reasons, in an
`overrides` block. Beside them it holds any `paidService` of the entry. The
schema for the file is
[`schemas/plugins.v1.schema.json`](../schemas/plugins.v1.schema.json). If the
GitHub response for the repository says whether it is archived, the
`upstream` block has an `archived` field, `true` or `false`. If the build read
the repository's top-level names, the block has a `sourceInRepo` field, `true`
or `false`. A failed read leaves the field out, prints a warning, and does not
fail the build. If the entry's `index.json` has a `paidService` field, the
record has the same field, whether or not the read succeeds. If you validate
against a saved copy of the schema, fetch the schema again. The `upstream`
block also has a `prerelease` field, `true` or `false`. It says whether
GitHub marks the release that the reader read as a prerelease. It also has
a `languages` list and an `xpiUrl` field, which "Using the data" in
[data.md](data.md#using-the-data) describes. Each record
with an `upstream` block has a `reports` list, which "Using the data" in
[data.md](data.md#using-the-data) describes. The command writes no
`startTests` list, except on a record that keeps earlier facts. The daily build adds it with
`pnpm add-start-results`, as "Starting plugins in Zotero" says.

If the read of a plugin fails, its record has no `upstream` block, unless
it keeps earlier facts as `--previous` below says. The record has a
`failure` block with the failure name and a message. If the
read stops with an error that the reader does not name, the failure name is
`unexpected-error`. If the read gives facts that the schema rejects, the
failure name is `facts-invalid`. The command still writes the file.

To keep earlier facts, add `--previous <url>`. The daily build gives the
address of the published `v1/plugins.json`. The command reads that data
after the reads of the top-level names below. It reads it once, and only
if a record has a build-level failure. The limits are those of
`pnpm carry-start-results`: 60 seconds and 16 MiB. If all of these hold, a
record with a build-level failure keeps the published record's `upstream`
block and `startTests` list, with a `kept` block:

- The published `plugins` list names the entry id exactly once.
- That record has the same `repoUrl`, has an `upstream` block, and is valid
  against the record schema.
- Its `readAt` falls at most 7 days before this build's `generatedAt`, and
  not after it. `readAt` is the published record's own `kept.readAt`, or
  else the published file's `generatedAt`.
- The kept record as the command writes it is valid against the record
  schema. So `readAt` must be a UTC time that ends in `Z`.

So a record that two builds in a row fail to read keeps the first
`readAt`. The kept record also keeps this entry's own overrides and
`paidService`, and gets the reports that this build counts. In every
other case the record has a `failure` block, as above. If the command
cannot read the published data, or its `generatedAt`, it keeps nothing. It
prints one line that starts with `::warning::cannot read the deployed data`
and names the cause. The line does not change the exit status. Without
`--previous`, the command reads no published data and keeps nothing.

The command reads up to 4 plugins at once. It starts each GitHub API request
of these reads at least 80 ms after the one before it, and a request to
another host does not wait. A redirect that fetch follows inside a request
does not wait either. The command gives each plugin read 3 minutes. If
a read takes longer, the command stops it, and the record fails with
`request-failed`. The command starts no plugin read after 18 minutes from
its start, and a read that is open at that time runs on to its end. Each
entry whose read it did not start gets a record that fails with `not-read`.
If the number of whole days from 1970-01-01T00:00Z to `generatedAt` is even,
the command starts the reads in id order. Id order sorts the entry directory
names by character code, so capital letters come before small letters. If
that number is odd, it starts them in reverse id order. So the entries that
get `not-read` are the last ids on even days and the first ids on odd days.
The file lists its records in id order on every day. A plugin with either
failure shows no facts until a later build reads it, unless it keeps
earlier facts. The read of the
`report` label and the report issues, which comes before the plugin reads,
also counts toward the 18 minutes. After the plugin reads, the build reads each
repository's top-level names with GraphQL requests of 40 repositories each, for
at most 3 minutes in all. The reads of the Zotero release and of
the Zotero changelog pages below come next. They run at
the same time and take at most 30 seconds in all. These limits leave time
for the other steps of the daily build, whose job GitHub stops at 30
minutes.

After the plugin reads, the command reads
<https://www.zotero.org/download/client/version?channel=release> with no
token and a limit of 30 seconds. It writes the answer's `linux-x86_64`
value as the top-level `zoteroRelease`. The value must be numbers joined by
dots, such as `10.0.7`. These cases fail the read:

- an answer that is not a success,
- a request or a body read that fails or passes 30 seconds,
- a body that is not JSON,
- a value that is missing or has another form.

Then the command writes no `zoteroRelease`, and it prints one line that
starts with `::warning::cannot read the Zotero release:` and names the
cause. GitHub Actions shows this line as a warning on the run. This read
does not change the exit status. It writes no record, so it is not a
build-level failure or a failure of a plugin.

The site keeps two hand-kept lists in `src/site/version.ts`:
`ZOTERO_MAJORS`, the Zotero versions that get a mark, and `LAST_RELEASES`,
the newest release of each version before the last. A Zotero release
leaves them behind until someone edits them. So the command also reads the
changelog page of each version in `LAST_RELEASES`, such as
<https://www.zotero.org/support/9.0_changelog>, with no token and the same
limit. It takes the version in the page's first heading that starts with
"Changes in 9." for Zotero 9. It passes over a beta heading such as
"Changes in 9.0.7-beta". It prints a `::warning::` line in each of these
cases, one line for each page in the last two:

- the current release is from a newer version than the last in
  `ZOTERO_MAJORS`, such as `11.0.0` while the list ends at 10,
- a changelog page names a newer release than `LAST_RELEASES` holds for
  its version, such as `9.0.7` while the list holds `9.0.6`,
- a changelog read fails, as the release read above can fail, or the page
  has no such heading.

The lines for the first two cases name the lists to edit. The marks stay
as they are until someone edits the lists. The lines change neither the
exit status nor the data file.

A build-level failure usually comes from the build, not from the plugin.
A plugin's own download host that is down also gives one. These failures
are build-level:

- an `unexpected-error`,
- a request that gets no whole response, such as a failed host lookup, a
  network error, or a timeout, such as a read stopped at 3 minutes,
- a `not-read` entry,
- an HTTP 401 or 403 answer from the GitHub API,
- an answer from the GitHub API that succeeds but whose body is not JSON,
  such as an HTML error page,
- an HTTP 403 answer to an XPI or `update.json` download that requested a
  GitHub release download URL, as its first URL or after a redirect. The
  rule counts any URL on `github.com` whose path has `releases` as its
  third part. An example is
  `https://github.com/<owner>/<repo>/releases/download/<tag>/<file>`,
- an HTTP 429 or 5xx answer from any host.

Every other failure of a record, a 404 included, belongs to the plugin. A failed
read of the top-level names is not a failure of a record, so it is never
build-level, whatever its cause (D-052).
If the Zotero release read failed, the command first prints its line. If the
read of the top-level names failed for any repository, it prints that
`::warning::` line next. Next, it prints the `::warning::` lines for the
release lists above, and then the line for a failed read of the published
data. With `--plan`, it next prints the line that names the start plan it
wrote. If the command started a plugin read, it then prints how long the
reads took. The first line, `plugin reads took <s> s`, gives the time
from the start of the first plugin read to the end of the last. Next comes
one line `<result>: <n> reads, <s> s in all` for each result, in
code-unit order. A result is `read` or the failure name that the read
gave. A later schema check of the facts or a kept record does not change
it. The reads run 4 at once, so these sums can add up to more than the
first line. A read's time also holds its waits for the pace of the GitHub
API requests. Then up to 10 lines `slow read: <id>: <s> s (<result>)` name
the slowest reads, slowest first, with ties in id order. Each time is in
seconds with one decimal, and reads that show the same time count as
ties. An entry that the time limit leaves `not-read` has no read, so these
lines leave it out. Then it prints one line for each failed record. A
record that keeps earlier facts counts as failed, and its line ends with
`(kept the facts read at <readAt>)`. Next, it prints one line
for each failure name, with the number of records that carry it. Then it
prints the number of records with a build-level failure. With
`--previous`, it next prints the number of records that keep earlier
facts. If a record carries a build-level failure, the command also prints a
`::warning::`
line. GitHub Actions shows this line as a warning on the run. If more than
half of the records carry a build-level failure, the command exits with
status 1. If every record carries a failure, whatever its name, the command
also exits with status 1. For each of these two cases that holds, the
command prints one line on stderr. In every other build that writes the
file, the command exits with status 0.

The command also writes copies of the two schemas to `dist/schemas/`.

The command writes no data file and exits with status 1 in these cases:

- It finds no entries, or it cannot read the entry directory.
- An entry is not valid, for example a `meta.json` with no `repoUrl`.
- It cannot read the `report` label, which it reads before the report
  issues. After a rename or a delete of the label, GitHub answers HTTP 404.
  It prints a line that names the failure, and it reads neither the report
  issues nor any plugin.
- It cannot read a page of the report issues, for example after an HTTP
  error, a network error, or an answer that is not a list. It prints a line
  that names the failure, and it reads no plugin.
- An issue in the list of report issues has no `closed_by` field. It prints
  a line that names the field. If the issue has a number, the line also
  names that number. It reads no plugin.
- The read of the `report` label and every page of the report issues takes
  more than 3 minutes in all. It prints a line that names the time limit,
  and it reads no plugin.
- The file it built is not valid against the schema.
- It cannot write the schema copies or the data file.

A data file from an earlier run then stays in place. In the last case, the
schema copies can already be in `dist/schemas/`. The command writes the
data file before the start plan that `--plan` names. If it cannot write the
plan, it prints `write-failed` with the plan's path and exits with status
1. The new data file then stays in place.

The full usage is
`pnpm build [<dir>] [--out <dir>] [--plan <file>] [--previous <url>]`.
To read the entries in another directory, give its path: `pnpm build <dir>`.
To write the file under another directory, add `--out <dir>`. As with
`pnpm add-plugin`, set `GITHUB_TOKEN` to get a higher GitHub API limit.

To also write a start plan, add `--plan <file>`. The plan has one item for
each record whose `upstream` block this build read, so a record that keeps
earlier facts has none. Each item names the entry id, the
plugin id and version, and the manifest's `strict_min_version` and
`strict_max_version`. It also names the URL of the XPI that the build read
and the SHA-256 of the bytes that it got. The data's `xpiUrl` and
`xpiSha256` hold the same URL and SHA-256. The plan is not part of the data
file, and the daily build writes it outside `dist/`. Without `--plan`, the
command writes no plan.

## Starting plugins in Zotero

To start one plugin in one Zotero install, run:

```bash
pnpm start-test --zotero <binary> --xpi <file> --out <file>
```

The command reads the Zotero version from the `app/application.ini` file
beside the binary, or on macOS from `../Resources/app/application.ini`.
It makes a new Zotero profile with a reporter plugin of the index. It
starts Zotero with `MOZ_HEADLESS=1`. On Linux, Zotero also needs a display,
such as the one `xvfb-run` gives. Once Zotero is ready, the reporter
installs the XPI and waits 3 seconds. Then it reports one of the four
results that "Using the data" in [data.md](data.md#using-the-data) lists.
The command writes the result as JSON, such as
`{ "id": "<plugin id>", "version": "1.0.0", "zotero": "10.0.6", "result": "started" }`,
and exits with status 0. A start gets 90 seconds. To give it another limit
from 1 to 3600 seconds, add `--limit <seconds>`. If the command cannot run
the start, it writes no file. It then prints a failure name, such as
`zotero-missing` or `reporter-not-started`, and exits with status 1. At the
end, the command stops every process that Zotero started and removes the
profile.

To reuse the start results of the published data in a start plan, run:

```bash
pnpm carry-start-results --plan <file> --data <file> [--previous <url>]
```

The command reads the data file at `--previous`, which is the published
`v1/plugins.json` unless you name another URL. For each plan item, it
finds the earlier record with the item's entry id. That record's
`upstream` can have the item's plugin id and version, and the item's
SHA-256 as `xpiSha256`. If so, the command copies the record's `started`
results into the item as a `carried` list. It copies nothing from a
record with a `kept` block. An item gets no `carried` list
on its entry's re-test day. The command counts the day from `generatedAt`
in the `--data` file, which is the data file that `pnpm build` wrote. It
then writes the plan in place and prints how many results it carried.

The command carries nothing in these cases:

- It cannot read the earlier data in 60 seconds.
- The answer is not HTTP 200, or the body is over 16 MiB.
- The body is not data with a `plugins` list.
- It cannot read the plan, or the plan is not a valid start plan.
- It cannot read the `--data` file or its `generatedAt`.
- It cannot write the new plan.

In each case, it leaves the plan as it was, prints one line that names the
cause, and exits with status 0.

To start the plugins of a start plan in one Zotero install, run:

```bash
pnpm start-tests --plan <file> --zotero <binary> --out <file>
```

The command starts only the plan items whose manifest range covers the
binary's Zotero version. It does not download or start an item whose
`carried` list names that version, and its summary line counts such items
as carried. It downloads each XPI from the plan's URL with the
same host check as the build. If the download fails, or its SHA-256 differs
from the plan, the item gets no result. The command runs `pnpm start-test`
for each other item. If that command exits with status 1, the item also
gets no result. The command prints one line for each item that it tries.
After 20 minutes, it starts no new plugin. If that leaves items in range
unstarted, it prints a `::warning::` line with their number. It
writes the results as a JSON array, each with its entry id beside the
fields of `pnpm start-test`, and exits with status 0. If it cannot read
the plan or the binary's Zotero version, it writes no file and exits with
status 1.

To add start results to a data file, run:

```bash
pnpm add-start-results --data <file> --plan <file> --results <dir> --tested <versions>
```

The command reads each file in each directory under `--results`. A
directory named `start-results-<version>` holds the results of one Zotero
version, as the daily build names its artifacts. `--tested` lists the Zotero
versions to keep, joined by commas, such as `7.0.32,10.0.6`. The daily build
passes the versions of its start-test jobs. Plugin code in a start-test job
can upload an artifact of another name, so the list stops it from adding a
version. If a result meets all of these conditions, the command keeps it:

- Its entry id, plugin id, and plugin version match an item of the plan.
- Its entry's record in the data file has an `upstream` block.
- Its Zotero version is the one in its directory's name, and `--tested`
  lists it.
- Its Zotero version is in the range of the item's manifest.
- Its result is one of the four names.
- The item's `carried` list does not name its Zotero version.

The command also adds each result of an item's `carried` list whose Zotero
version `--tested` lists and the item's range covers. Two or more results
from the directories can meet all of these conditions and name one entry
and one Zotero version. The command then drops all of them. It also drops
each entry that is not a readable JSON array. Such an entry can be a
directory, a link, or a file over 1 MiB.
Then it writes each record's kept results into the data file as
`startTests`, ordered by Zotero version. It prints how many results it
kept, how many of those the plan carried, and how many it dropped. If
`--results` does not exist, the command adds only the carried results and
exits with status 0. The command can fail to read the data, the plan, or
the list of the results directories, or the schema can reject the new
data. In each case, the command leaves the file as it was and exits with
status 1.

## Building the site

To build the site, first run `pnpm build`. To show start tests, also run
`pnpm add-start-results` on `dist/v1/plugins.json`, as "Starting plugins in
Zotero" says. Then run:

```bash
pnpm site
```

The command reads `dist/v1/plugins.json`. It writes these pages: the home
page, `dist/index.html`, the About page, `dist/about/index.html`, one page
for each record, `dist/plugins/<id>/index.html`, and the "Page not found"
page, `dist/404.html`. It also writes the favicon, `dist/favicon.svg`, and
the three PNG files, such as `dist/preview.png`. It writes
`dist/sitemap.xml`, `dist/robots.txt`, and one badge file for each record,
`dist/badges/<id>.json`. It does not change the data file
or the schemas. It
replaces each of those files and folders of an earlier run. So a page for a
plugin that the data no longer lists goes away. Links between the pages, and
to the data file, start with `/`, the top of the site's host.

To read the data from another directory and write the pages there, add
`--out <dir>`. The command then reads `<dir>/v1/plugins.json`. If it cannot
read or parse the data file, or the file has no `plugins` list, it writes no
page and exits with status 1.

## Finding description gaps

To list the plugins whose description needs a `description` override, run
the command on a data file, for example the published one:

```bash
pnpm description-gaps dist/v1/plugins.json
```

The command gives each record the overrides of
`plugins/<id>/index.json` in the checkout that holds the command, from any
directory you run it in. If that file does not exist, the record gets no
overrides. So the command shows the gaps that the overrides you wrote
leave, with no new build. It checks each record with an `upstream` block.
It prints one line for each record in one of these cases:

- `missing`: the site shows no description.
- `cjk`: half or more of the shown description is Chinese, Japanese, or
  Korean.
- `short`: the shown description has fewer than six words.

The line holds the plugin id, the case, and the shown text, with a tab
between them. A `missing` line has no shown text. The command drops
whitespace at the start and end of the shown text. It prints each other
run of whitespace as one space, so each gap stays on one line. The line
names the first of these cases that applies, in that order.
The last line gives the count, as `description gaps: <count>`, and the
command exits with status 0.

The command prints a message, lists nothing, and exits with status 1 in
these cases: it cannot read the data file, the file is not JSON, or the v1
schema refuses it. It does the same for an `index.json` that it cannot
read, that is not JSON, or that its schema refuses.

The command does not tell English from another language written in Latin
script, such as Portuguese. If such a description has fewer than six
words, the command lists it as `short`. Find the others by reading the list
of descriptions.

## The daily build

The `Build data` workflow runs once a day, and you can also start it by
hand. It has four jobs:

1. The build job runs `pnpm check` and `pnpm build --plan start-plan.json`.
   It gives `pnpm build` the published data's address as `--previous`, so a
   plugin that it fails to read can keep earlier facts. Then it runs
   `pnpm carry-start-results` on the plan with the published data, as
   "Starting plugins in Zotero" says. It gives the SHA-256 of the plan and
   the `pnpm data-digest` value of `dist/` as job outputs. It keeps `dist/` as a workflow artifact named `plugins-data`, and the plan
   as an artifact named `start-plan`. No artifact holds an XPI.
2. The start-test job runs once for each tested Zotero release for Linux.
   It downloads Zotero from download.zotero.org and checks the file against
   a SHA-256 in the workflow. Then it runs `pnpm start-tests` under
   `xvfb-run` and keeps the results as an artifact named
   `start-results-<version>`. The job has no token permission, reads no
   secret, keeps no git credentials, and uses no cache, since plugin code
   runs in it.
3. The site job checks the downloaded data with
   `pnpm data-digest --dir dist --expect`, and the start plan against its
   SHA-256, each against the value that the build job gives as a job
   output. Plugin code in a start-test job can upload artifacts. If that
   code reaches the run's artifact token, it can also delete
   `plugins-data` and upload another under that name. Then the site job runs
   `pnpm add-start-results` and `pnpm site`. It runs when the build job
   succeeded, whatever the start-test jobs' results.
4. If the site job succeeded, the deploy job deploys `dist/` to GitHub
   Pages, whatever the start-test jobs' results.

If `pnpm build`, `pnpm add-start-results`, or `pnpm site` exits with
status 1, the workflow deploys nothing. If the downloaded data or the
start plan fails its check, the workflow also deploys nothing. So does an
exit status of 1 from `pnpm carry-start-results`, which it gives only for
a usage error. The site and data from the last good build then stay
published.
GitHub stops the build job at 30 minutes, and then the workflow also
deploys nothing. The repository's
`github-pages` environment, set in its GitHub settings, lets only runs on the
`main` branch deploy.

A merge to `main` deploys nothing by itself. A change to the pages, the
build, or the data format reaches the site at the next run of `Build data`.
To publish the change sooner, start the workflow on `main` by hand:

```bash
gh workflow run build.yml --ref main
```

To print the value that the data check compares, run:

```bash
pnpm data-digest --dir <dir> [--expect <sha256>]
```

Without `--expect`, the command prints one SHA-256 value. It hashes one
JSON line for each entry under `--dir`, sorted by path. A line holds the
entry's kind (file or directory), its path relative to `--dir`, and the
SHA-256 of a file's bytes. File times and modes do not change the value.

If an entry is not a file or a directory, the command prints no value. A
symbolic link and a named pipe are such entries. The command then names
the entry and exits with status 1. If it cannot read an entry, it names
the folder and exits with status 1. If the value equals the `--expect`
value, the command exits 0. If the two values differ, it prints both and
exits with status 1. These arguments give the usage line and status 1: no
`--dir`, an empty `--dir`, a `--dir` that is not a directory, and an
`--expect` value that is not 64 lowercase hex digits. An unknown option
and a positional argument do the same.

## Running the tests

To run the tests, run:

```bash
pnpm test
```

The tests of `pnpm start-test` use a stand-in for Zotero. The test file
`test/start-test-zotero.test.ts` starts a real Zotero. If `ZOTERO_BIN`
is not set, the file skips its tests. The `start-test`
job of `ci.yml` sets it. To run that file yourself, run:

```bash
ZOTERO_BIN=<binary> pnpm exec vitest run test/start-test-zotero.test.ts
```
