# Requests

## Proposing a plugin with an issue

To propose a plugin, open an issue with the "Add a plugin" form. Give the URL
of the plugin's GitHub repository. The form adds the label `add-plugin` to the
issue. If the repository has no such label, GitHub does not add it.

When an issue with that label opens, the `Add a plugin from an issue` workflow
runs in three jobs. The `pick` job names the issue. The read job and the write
job split the work as those of `Discover plugins` do. The read job runs
`pnpm discover-issue --handoff handoff/<issue>` with the issue number in
`ISSUE_NUMBER`. The command reads the issue body from the GitHub API and
takes the URL from it. It writes its outcome and any new entry into the
handoff, and makes no change on GitHub. The write job runs
`pnpm propose handoff/<issue>` with the issue number, which answers the
issue. If an entry already names the repository, the bot comments the entry
and closes the issue as completed. A bot pull request for the repository can
be open, or closed without a merge.
Then the bot comments its link and closes the issue as not planned. An open
bot pull request whose body has exactly one `Closes #<issue>` line outside
code blocks, for this issue, is the exception: the bot comments its link as
for a new pull request and leaves the issue open. In these cases the bot does
not read the repository.

Otherwise, the bot reads the repository in the same way as `pnpm add-plugin`.
If the plugin passes the inclusion bar, the bot opens a pull request in the
same way as for `Discover plugins`. The body of the pull request contains
`Closes #<issue>`. Thus a merge of the pull request closes the issue. The bot
comments the link to the pull request on the issue.

The bot can also find no URL in the issue body. It can find that
`delisted.json` names the repository or the plugin's id. It can find that an
entry or an open bot pull request already has the plugin's id, or that the id
cannot name a directory. Its read of the repository can also fail for a reason
that is not build-level. Then it comments the failure name and its message,
and it closes the issue as not planned. A failed read includes a GitHub API
answer of HTTP 404, which a repository that does not exist or is private
gives.

The bot itself can fail. Its read of the issue can fail, for example with
an HTTP 503 or 404 answer. Its read of the repository can stop with a
build-level failure, as "Building the data" in
[maintaining.md](maintaining.md#building-the-data) defines it. Examples are
a rate limit, an outage, a read stopped at 3 minutes, and an error that the reader
does not name. The bot can fail to write the entry: its directory can
already be in the output directory (`entry-exists`), or the write can fail
(`write-failed`). The check of the written entry can also stop with an
error, `unexpected-error`. Examples are a git that cannot start and a
branch-name check stopped at 30 seconds. "Finding new plugins" in
[maintaining.md](maintaining.md#finding-new-plugins) gives both
time limits. The bot can fail to read `plugins/` in its checkout, its own
pull requests, or the default branch. It can fail to fetch the default
branch, or the fetched commit can have no `plugins/` folder. The push or the
pull request can also fail. The git and `pnpm check` limits of "Pull
requests from the bot" in
[maintaining.md](maintaining.md#pull-requests-from-the-bot) also apply. The read
job can also fail and leave no handoff. In the write job, `pnpm propose`
checks the branch name again, and that check can also stop with an error,
`unexpected-error`: git cannot start, git ends with any result other than
exit status 1, or the check passes its 30-second limit.
Then the bot comments the error and leaves the issue open, and the workflow
run fails. A failed read of the repository, write of the entry, or check of
the written entry also puts the failure name in the comment. So does a
failed branch-name check of `pnpm propose`.
If `pnpm propose` refuses the handoff, the bot does not answer the issue,
and the workflow run fails. A branch name that git refuses, with status 1,
is such a refusal.

A maintainer can close a bot pull request without a merge. Then the
`Close the issue of a closed bot pull request` workflow runs
`pnpm close-issue` with the pull request number in `PR_NUMBER`. The bot
comments on the issue that the `Closes #<issue>` line of the pull request
names, and closes that issue as not planned. The command acts only on a pull
request from a `discover/` branch of the index repository whose body has
exactly one `Closes #<issue>` line outside code blocks. The issue must be
open, have the label `add-plugin`, and have a bot comment with the link to
the pull request. If the bot already commented that the pull request was
closed without a merge, the command does nothing. One run at a time handles
each pull request. The workflow runs on `pull_request_target`, so it runs its
file from the default branch and runs no code from the pull request. A pull
request that the bot's own token closes starts no workflow run, so its issue
stays open.

Once a day at 02:43 UTC, the workflow also sweeps for issues that no run
answered. A maintainer can also run the sweep by hand from the default
branch. The `pick` job runs
`pnpm unanswered-issues --label add-plugin --workflow add-plugin-issue.yml --limit 3`.
The command prints, oldest first, at most 3 open issues with the label
`add-plugin`. Each issue was opened at least 1 hour and at most 7 days
before, and has no comment from `github-actions[bot]`. The command prints
none while any of the 100 newest `issues` runs of the workflow has not
finished. Then the read job and the write job handle each of these issues in
turn, as for a new issue. A failure for one issue does not stop the others,
and the job fails at the end. A rerun of the write job answers each issue of
its run again. An issue with any bot comment stays for a maintainer. An
example is the comment that starts with `The bot could not finish`.

The jobs get only issue numbers. The read job and the write job get them
from the `pick` job in the `ISSUES` environment variable. Each command gets
one in `ISSUE_NUMBER`. Some runs share the concurrency group of
`Discover plugins` and `Merge bot pull requests`, so the workflows do not
push or merge at the same time.
These are a run for an issue with the label `add-plugin`, a sweep, and a
dispatch from the default branch. Up to 100 runs wait in the group, and
they run one at a time. GitHub does not promise their order. If 100 runs
already wait, GitHub cancels a new run. The issue of a canceled run gets no
answer at first. A later sweep can answer it while it is at most 7 days
old. Each sweep answers at most 3 issues, oldest first. An issue without
the label `add-plugin` also starts a run of the workflow. That run does
nothing, so it takes a group of its own and waits for no other run.

## Reporting whether a plugin works

To report on a plugin, open an issue with the "Report that a plugin works"
form or the "Report that a plugin is broken" form. Each form asks for the
plugin id, the plugin version, and the Zotero version. The works form adds
the labels `report` and `works`. The broken form adds the labels `report`
and `broken`. If the repository has no such label, GitHub does not add it.

When an issue with the label `report` opens, the `Answer a report` workflow
runs `pnpm report-issue` with the issue number in `ISSUE_NUMBER`. The
command reads the issue's body, labels, and comments from the GitHub API,
and the entry directories under `plugins/`. If all of these hold, the bot
takes the report:

- Each of the three fields has a value.
- The plugin id is the name of an entry directory under `plugins/`.
- The plugin version has at most 100 characters and no spaces.
- The first number in the Zotero version is a major from 7 to the newest
  major in `ZOTERO_MAJORS` (`src/site/version.ts`).
- The issue has exactly one of the labels `works` and `broken`.

If the bot takes the report, it comments the plugin id, the plugin version,
the Zotero major, and the verdict. The comment also states how the index
counts the report. It counts a report only while it reads that plugin
version, and once per GitHub account for each plugin and Zotero major.
"Using the data" in [data.md](data.md#using-the-data) gives the whole rule.
Then the bot closes the issue as completed. Otherwise, the bot
comments the name and the message of the first problem it found, and
closes the issue as not planned. The comment puts each value from the issue
in a code span, so the value cannot link to a page or mention a user.

If the bot cannot read the issue, its comments, or `plugins/`, it sends
nothing. If it cannot post the comment, it does not close the issue. In
these cases the workflow run fails. A failed close also fails the run. If
the bot already commented on the issue, it sends the close alone. So a
rerun of a run whose close failed closes the issue with no second comment.
Each report run has a concurrency group of its own, so a report run does
not wait for another run or cancel one. Its job restores no Actions cache.

Once a day at 03:13 UTC, the workflow runs `pnpm report-issue --sweep`. A
maintainer can also run it by hand from the default branch. The command
answers, in turn, at most 20 report issues that no run answered. It picks
them as `pnpm unanswered-issues` does for the label `report` and the
workflow `report-issue.yml`, as "Proposing a plugin with an issue" says. A
failed answer does not stop the others, and the command exits 1 at the end.
The sweeps share one concurrency group, so two sweeps do not answer one
issue at once. A sweep can answer an issue from 1 hour to 7 days old. That
holds also for an issue whose `report` label was added after it opened. An
issue with a
bot comment stays for a maintainer, as does a report issue opened more than
7 days before the sweep.

## Changing a plugin's name or description

A plugin's manifest and GitHub About text are the first place to change its
text. A manifest edit shows once the index reads a new release with it. If the
manifest's description is missing, only repeats the name, or is half or more
Chinese, Japanese, or Korean, an About edit changes the description. A
`description` override in the index comes before both upstream texts until
someone removes it, and the plugin page's Overrides table lists it. A
repository's owner can also ask the index for another name or description, or
for the removal of its override, through the link in the plugin page's Details
card. It opens the form
`.github/ISSUE_TEMPLATE/text-change.yml`, which adds the label `text-change`.

The new text follows these rules, which `src/text-request/rules.ts` holds:

- The text is in English. The command refuses only text of which half or more
  is Chinese, Japanese, or Korean, so a maintainer reads for other languages.
- A name has 2 to 40 characters and starts with a letter or digit.
- A description has at least 6 words and at most 200 characters, and it does
  more than repeat the name. On a wide screen, a home page row shows about the
  first 120 characters. On a narrow screen, it shows no description.
- The text has no `http://`, `https://`, or `www.`, no `<`, and no control or
  format characters, line breaks included.

The rules bind requests only, so existing text can break them.

No bot answers the form. To check a request, download the deployed data file
and run the command with the issue's number:

```sh
curl -sSLo plugins.json https://zotdex.jmgirard.com/v1/plugins.json
pnpm text-request <issue> --data plugins.json
```

The command reads the issue and the owner of the entry's repository from the
GitHub API. It prints the plugin, the field, the text, the issue's author, the
owner, and whether the two match, ignoring letter case. It also prints:

- each rule that the text breaks,
- each other plugin whose shown name has the same non-empty key, as `nameKey`
  in `src/discover/holds.ts` gives it, which the command does not refuse,
- the categories that the text adds, other than Other tools,
- an override with a `version` that still wins over the text,
- the age of the data file, by its `generatedAt`,
- a note for a plugin that the data file has no read of,
- the override that the request replaces or removes,
- the description gap that the request leaves: `missing`, `cjk`, or `short`, as
  `pnpm description-gaps` names them. A blank text prints `none` for no gap, and
  a new text with no gap prints no such line.

For an owner that is an organization, it says to check the author by hand.

The command has three exit statuses:

- 0: nothing blocks `--apply`. A blank text with no override writes nothing.
- 1: the text breaks a rule, or the author and owner differ or the owner is an
  organization, unless `--owner-checked` clears the author.
- 2: a named failure, such as a plugin that the data file does not have, or a
  wrong command line.

With `--apply`, the command writes the entry's `index.json`. A text adds an
override with no `version`, or replaces the override that has none. So the
text stays through new releases and hides later upstream edits. A blank text
removes that override.

The command writes nothing past a broken rule. If the author and owner differ,
or the owner is an organization, check the author by hand, then add
`--owner-checked`. The issue can change between two runs, so read the report of
the `--apply` run. Then read the text, answer the issue, and open a pull
request with the change.

## Removing a plugin

Anyone can ask to remove a plugin with the "Remove a plugin or report harm"
issue form. Each plugin page's Details card links to the form with the plugin
filled in, and the About page links to it too. The form adds the label
`remove-plugin` and opens a public issue. No bot answers it. A maintainer
reads each request.

A maintainer removes a plugin for any of four reasons:

- Its repository's owner asks.
- It is spam.
- Its entry misleads people about what the plugin is or who makes it.
- A report shows harm with evidence that a reader can check.

A claim with no evidence removes nothing. The index still cannot vet plugins,
and it does not review their code.

Before you act on an owner's request, make sure that the issue's author owns
the repository, or ask the owner to confirm from the repository itself.

To remove a plugin, do these steps on a branch:

1. Delete the entry's directory under `plugins/`.
2. Add a record to `delisted.json` at the top of the repo.
3. Run `pnpm check`, then merge the change.
4. Close any open bot pull request for the repo or the id.
5. Run `Build data` by hand. Otherwise, the plugin stays on the site until the
   next daily build.
6. Answer the issue, then close it.

A record has four fields:

```json
{ "repo": "owner/name", "ids": ["plugin@example.org"], "issue": 123, "date": "2026-11-04" }
```

Write `repo` in lowercase. `issue` is the number of the request, and `date` is
the day of the removal. Put an id in `ids` only if you judged it unique to that
repo. A fork can keep its source's id, and a listed id blocks every repo that
carries it. `ids` can be empty.

The list keeps a removed plugin off the index in three places:

- `pnpm discover` skips a listed repo with the reason `delisted`, and it does
  not read that repo. If a read shows that a search name is a listed repo, it
  refuses that repo as `delisted`. It refuses another repo that carries a
  listed id as `delisted-id`.
- An "Add a plugin" issue that names such a repo gets a comment that names the
  removal. The bot closes the issue as not planned and opens no pull request.
  The exception is an unlisted repo that carries a listed id and already has a
  bot pull request. That issue gets the answer about the pull request.
- `pnpm check` fails on an entry that the list names, so the merge job does not
  merge a bot pull request for it. The job skips a held pull request and one
  under 48 hours old. For any other, the job reports it as failed and exits 1
  each day until you close it.

The list names a repo and the ids in its record, and nothing else. If a repo
moves to a new name, the bot can propose it again unless its id is listed. The
same is true of a fork.

To list a plugin again, remove its record. The bot can then propose it, unless
a bot pull request for that repo was closed without a merge. In that case, add
the entry by hand.
