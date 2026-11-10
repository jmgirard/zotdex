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
request from a `discover/` branch of the index repository. The pull request's
body must have exactly one `Closes #<issue>` line outside code blocks. The
issue must be open, have the label `add-plugin`, and have a bot comment with
the link to the pull request. If the bot already commented that the pull
request was closed without a merge, the command does nothing. One run at a
time handles each pull request. The workflow runs on `pull_request_target`,
so it runs its file from the default branch and runs no code from the pull
request. A pull
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
someone removes it, and the plugin page's "Corrections by Zotdex" table
lists it. A
repository's owner can also ask the index for another name or description, or
for the removal of its override. The owner uses the link in the plugin page's
Details card. It opens the form
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

## Adding a screenshot

A repository's owner can ask the index to show one screenshot on the plugin's
page, or to remove it. The owner line in the plugin page's Details card links
to the form `.github/ISSUE_TEMPLATE/screenshot.yml`, with the plugin id filled
in. The form adds the label `screenshot`. It has three fields: the plugin id,
the screenshot, which is an image attached to the issue, and a description of
the screenshot. If the Screenshot field is blank, the request asks to remove
the screenshot, and the command ignores the description.

The request follows these rules. `src/screenshot-request/rules.ts` holds their
hosts and limits:

- The Screenshot field holds one image link. An image link is a Markdown
  image or the `src` attribute of an `<img>` element, which GitHub writes for
  an attached image. An image in an HTML comment, a code span, or a fenced
  code block does not count.
- The link and each redirect use HTTPS and stay on the hosts in
  `SCREENSHOT_HOSTS`. GitHub's attachment links are on `github.com` and
  redirect to its file host. A link of any other scheme, such as `data:` or
  `ftp:`, breaks this rule.
- The image is at most 10 MiB.
- The image is a PNG, JPEG, or WebP file, by its first bytes, and sharp reads
  it as at most 8000 pixels wide and 8000 pixels tall. Sharp can read all of
  it, so a cut file breaks this rule.
- The index's copy, which the next paragraphs describe, is at most 1 MiB.
- The description follows the rules for a description in "Changing a plugin's
  name or description".

No bot answers the form. To check a request, download the deployed data file
and run the command with the issue's number:

```sh
curl -sSLo plugins.json https://zotdex.jmgirard.com/v1/plugins.json
pnpm screenshot-request <issue> --data plugins.json
```

The command reads the issue and the owner of the entry's repository, and checks
the owner as `pnpm text-request` does. It downloads the image and prints the
plugin, each image link, the description, the issue's author, the owner, and
whether the two match. It also prints the image's format, its sizes in pixels
and in bytes, and the SHA-256 of its bytes. It makes the index's copy, prints
the copy's size in pixels and in bytes, and writes the copy to
`zotdex-screenshot-<issue>.webp` in the system temporary folder. The `preview:`
line names that file. It prints the description of the
screenshot that the request replaces or removes, and the age of the data file.
It prints each rule that the request breaks as a `problem:` line. A rule of the
description prints as `description-` and the name that `pnpm text-request`
gives the rule.

The command has the three exit statuses of `pnpm text-request`. A download
that fails or gets an HTTP error is a named failure, so it exits 2. A removal
from an entry with no screenshot writes nothing and exits 0. A removal with
`--file` is a named failure.

If the download does not work, save the image by hand and run the command
with `--file <path>`. The command then reads that file in place of the
download. It still checks the Screenshot field, the link's own host, the
image, its size, and the description. Only the redirects go unchecked. If a
redirect goes to a host that is not in `SCREENSHOT_HOSTS`, the command prints
`host-not-allowed` with that address. If the address is GitHub's own file host,
use `--file`.

The command makes the index's copy with sharp. Sharp turns the image upright
by its orientation tag. It makes the image fit within 1600 by 2400 pixels, but
never larger. It saves the copy as WebP with no metadata. If the copy is more
than 1 MiB, ask the owner for a smaller image.

Before you apply a screenshot, open the preview file and look at it. Do not
rely on the issue page, which can show another image than the one the command
reads. Each run removes the issue's earlier preview, so a run that prints no
`preview:` line leaves no file to look at. With `--apply`, the command writes
the copy to `plugins/<id>/screenshot.webp` and sets the `screenshot` field of
the entry's `index.json`, as [data.md](data.md#plugin-entries) says. It reads
`index.json` again just before it writes, so it keeps other edits to the file.
If the command cannot write `index.json`, the image file and `index.json` still
match. A removal deletes both. The command writes nothing past a broken rule,
and `--owner-checked` works as in `pnpm text-request`.

The `--apply` run reads the image again. Its files stay in your checkout until
you commit them. If its SHA-256 differs from the run whose preview you looked
at, the owner changed the image: restore the entry's files and run the report
again. Otherwise answer the issue and open a pull request with the change.

A maintainer can also remove a shown screenshot without a request, as for any
entry file: delete `plugins/<id>/screenshot.webp` and the `screenshot` field of
`index.json` in a pull request.

## Removing a plugin

Anyone can ask to remove a plugin with the "Remove a plugin or report harm"
issue form. Each plugin page's Details card links to the form with the plugin
filled in, and the About page links to it too. The form adds the label
`remove-plugin` and opens a public issue. No bot answers it. A maintainer
reads each request.

A maintainer removes a plugin on any of five grounds:

- Its repository's owner asks.
- It is spam.
- Its entry misleads people about what the plugin is or who makes it.
- It does harm, and a report shows the harm with evidence that a reader can
  check.
- It has a listed site built in.

A claim with no evidence removes nothing. The index still cannot vet plugins,
it does not endorse them, and it does not review their code. The steps for
each removal are in "Removing a plugin" in [maintaining.md](maintaining.md).

### Spam

Spam is a repository that is not a working Zotero plugin. One example is an
unchanged template or sample under a new name. Others are a repository made to
carry ads or links, and many near-identical copies from one account.

### Harm

Harm means that a release of the plugin does something to its users, or
through their computer or accounts, that they were not told about. Examples
are malware, taking passwords or files, and sending library contents or
account details somewhere without saying so. Deleting or
corrupting a Zotero library on purpose is harm. So is disabling or changing
other plugins or settings to the user's cost, and using the computer to
attack, spam, or mine for someone else. A plugin built to break into, flood,
or infect other people's computers also does harm.

When the README, the release notes, or text that the plugin shows before it
acts says so, the users were told. When the behavior is plainly what the
plugin is for, the users were told too.

A bug is not harm. A plugin that damages a library by mistake stays listed,
and a Broken report on its page warns others. When a check for updates or a
count of installs carries no library contents and does not identify the
person, it is not harm. Code that a plugin loads at run time is not harm by
itself.

The evidence must be something a reader can check. One example is a link to
the code that does it. Others are a malware scan find that a second source
supports, and steps that make it happen again.

A plugin can do harm by sending data somewhere without saying so, where the
sending serves what the plugin says it does. Such a plugin first gets an issue
on the index. If its README or release notes do not say so within 14 days, a
maintainer removes it. Hidden behavior that serves no part of what the plugin
says it does gets no notice.

### A listed site built in

A maintainer can remove a plugin that has a built-in way to get papers or
books from a listed site. A listed site is one that courts in at least two
countries ordered blocked or shut down for copyright infringement. A default
judgment counts, and so does a court's order to internet providers to block
the site. A block by a regulator or an industry body does not count, and
neither does a ruling that was later overturned. A site means the service
under any address or mirror. If a ruling names a site's new name, or its
operator presents it as the same service, the new name counts too. The file
[`sites.json`](../sites.json) lists the listed sites that the bot looks for,
with their rulings: the country, court, date, case, kind, and a link for each
one.

"Built in" means that the plugin's latest release ships the site: a default or
preset address, a menu choice, a button, or a list that the plugin loads by
itself. It also means that the plugin's README or settings text tells the user
to enter the site's address. A plugin that takes any address the user types,
and names no listed site, is not covered. A plugin's name alone does not make
the site built in.

A report can ask for this ground for any plugin. Without a report, a
maintainer applies it only to a plugin whose name, manifest or GitHub
description, repository name, or topics name a listed site. The maintainer reads that plugin's README
and settings, not its code, and checks every match the same way. A plugin
that stays listed has not been checked. The index forms no view of its own
about whether a plugin or its users break the law. A site's terms of use, a
licence dispute between authors, and other legal questions are not grounds
for removal.

### Coming back

A removal lasts until a maintainer lifts it. To ask, reply on the plugin's
removal issue, or open an issue on the index that names the plugin. Show
what the ground needs:

- The owner's request: only the owner can ask to undo it.
- Spam or a misleading entry: the repository or entry no longer meets that
  ground.
- A listed site built in: a release drops the site. A plugin removed a second
  time on this ground stays off.
- Harm: if the author built the hidden behavior in, and that behavior serves
  no part of what the plugin says it does, the plugin stays off for good.
  Examples are spreading malware, taking passwords, and attacking other
  computers. Other harm can come back once a release stops the behavior or
  tells users about it.
- Harm from someone else's change, such as a taken-over account or a poisoned
  dependency: the plugin comes back once a release removes it and the public
  record shows what happened. That record is the commit or release that added
  it, an advisory or a statement on the repository, and nothing that
  contradicts the owner's account.

For harm, a maintainer checks only that the reported evidence no longer holds:
the linked code is gone, or the steps no longer make it happen. This is not a
finding that the plugin is safe. A removal covers the repository and its ids,
not a person.

If the evidence for a removal proves wrong, or a maintainer misread the
plugin, a maintainer lifts the removal. The issue says why.

### The list of removed plugins

A record has five fields:

```json
{ "repo": "owner/name", "ids": ["plugin@example.org"], "ground": "spam", "issue": 123, "date": "2026-11-04" }
```

Write `repo` in lowercase. `ground` names the ground the removal used: `owner`,
`spam`, `misleading`, `harm`, or `copyright`, which is the ground for a listed
site built in. `issue` is the number of the removal's issue, and `date` is the
day of the removal. If you judged an id unique to that repo, put it in `ids`,
and put no other id there. A fork can keep its source's id, and a listed id
blocks every repo that carries it. `ids` can be empty.

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

To lift a removal, follow "Lifting a removal" in
[maintaining.md](maintaining.md).

## Legal notices and private reports

The index hosts no plugin files. It links to each plugin's repository and
releases on GitHub. It hosts only its own data, the icons it redraws, and the
screenshots that owners send. A complaint about a plugin's own code, such as
a claim that one plugin copied another, goes to GitHub, where the code is. The
index removes a plugin only on the five grounds in "Removing a plugin".

To send a legal notice, or to report harm in private, use GitHub's private
report form, linked from the About page. Name the plugin and give the
evidence.

To take a screenshot down, the plugin's owner sends the screenshot form with a
blank Screenshot field, as "Adding a screenshot" says. Anyone else uses the
private report form and names the plugin and the reason.

One person reads requests, so the index promises no response time. Reports of
malware come first.

The rules can change. A change applies to plugins that are already listed. The
git history of this file holds each change with its date.

If a request brings no new evidence after an earlier answer, a maintainer
closes it.
