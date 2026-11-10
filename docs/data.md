# Data

## Using the data

The index publishes its data file on GitHub Pages:

- Data: <https://zotdex.jmgirard.com/v1/plugins.json>
- Schema for the data file:
  <https://zotdex.jmgirard.com/schemas/plugins.v1.schema.json>
- Schema for `index.json`:
  <https://zotdex.jmgirard.com/schemas/index.v1.schema.json>

[License](license.md#license) gives the terms for reusing the data.

A daily build updates the data. If more than half of the records carry a
build-level failure, such as a rate limit or a network error, the build
deploys nothing. "Building the data" in
[maintaining.md](maintaining.md#building-the-data) says which failures are
build-level. A record that keeps earlier facts, as the `kept` paragraph
below says, counts here as a record with that failure. If every record
carries a failure, whatever its name, the build
also deploys nothing. The build also deploys nothing in these cases: it
cannot read the report issues, it cannot write the start plan,
`pnpm add-start-results` or `pnpm add-scan-results` fails, or the site
build fails. If the data or
the start plan that the site job downloads fails its check, the build
deploys nothing too. "The daily build" in
[maintaining.md](maintaining.md#the-daily-build) names the commands. A
failed start test does not stop the deploy. The data from the last good
build then stays in place. "Building the data" in
[maintaining.md](maintaining.md#building-the-data) describes the file. A
breaking change to the file gets a new schema version under a new path, such as `v2/`. By this project's rule, a new
optional field does not get a new schema version. The schema rejects fields
that it does not define. If you check data
against a saved copy of the schema, fetch it again after such a change.

The data file can have a top-level `zoteroRelease` field, such as
`"10.0.7"`. It is the current Zotero release that the build read from
zotero.org, as "Building the data" in
[maintaining.md](maintaining.md#building-the-data) says. The site's
declared marks use it as the newest release of its Zotero version. If the build did not read
it, the field is absent. Data written before the build wrote this field has
none. The field is new in schema v1. If you check data against a saved copy
of the schema, fetch the schema again.

Each `upstream` block has an `xpiUrl` field. It is the download address
that GitHub gives for the first `.xpi` file of the release whose manifest
the index read. The start plan names the same address. The file is the
author's own: the data gives its address, and the index keeps no copy. An
author can replace a release file later, so the file at the address can
differ from the one the build read. Data written before the build wrote
this field has none.

Each `upstream` block has an `xpiSha256` field. It is the SHA-256 of the
bytes that the build read from `xpiUrl`, in 64 lowercase hexadecimal
characters. The start plan names the same value. If a file that you
download from `xpiUrl` has another SHA-256, it is not the file that the
build read and the start tests started. Data written before the build
wrote this field has none. The field is new in schema v1. If you check data
against a saved copy of the schema, fetch the schema again.

An `upstream` block can have a `repoDescription` field. It is the About
text of the plugin's GitHub repository, with the spaces before and after
it removed. If GitHub gives no such text, or the text is blank, the field
is absent. Data written before the build wrote this field has none. The
site uses the field by the description rule in [site.md](site.md).

An `upstream` block can have an `icon` field, such as
`icons/<sha>.png`. It is the path of the plugin's icon, relative to the
folder of `plugins.json`, so the file is at `v1/icons/<sha>.png`. The
build takes the file that the manifest's `icons` names: of the keys that
are whole numbers, the smallest at or above 96, else the largest. It
redraws a PNG, JPEG, WebP, or SVG file as a 96 by 96 PNG and names the file
by the SHA-256 of its bytes. In these cases the field is absent:

- The manifest names no icon.
- The build cannot read or draw the file.
- The file is a stock icon of zotero-plugin-template.
- A maintainer hid the icon with `iconHidden`.
- The record keeps earlier facts, and the build cannot read the earlier
  icon file back.

Data written before the build wrote this field has none. The
field is new in schema v1. If you check data against a saved copy of the
schema, fetch the schema again. The icon keeps its author's terms, as
[license.md](license.md) says.

A record can have a `screenshot` block. If the entry's `index.json` has a
`screenshot` field, the record has the block, also when its read failed.
The block has two fields. `file` is the path of the image, such as
`screenshots/<sha>.webp`, relative to the folder of `plugins.json`, so the
file is at `v1/screenshots/<sha>.webp`. The build copies the entry's
`screenshot.webp` and names the copy by the SHA-256 of its bytes. `alt` is
the owner's description of the image, for a reader who cannot see it. The
image is a WebP file at most 1600 pixels wide, 2400 pixels tall, and
1 MiB. Data written before the build wrote this field has none. The field
is new in schema v1. If you check data against a saved copy of the schema,
fetch the schema again. The screenshot keeps its owner's terms, as
[license.md](license.md) says.

An `upstream` block can have a `stars` field. It is the star count that
the build read for the plugin's GitHub repository. If GitHub gives no
whole number of 0 or more, the field is absent. Data written before the
build wrote this field has none. The field is new in schema v1. If you
check data against a saved copy of the schema, fetch the schema again.

Each `upstream` block has a `languages` list, such as `["en-US", "zh-CN"]`.
It holds the language tags of the locale folders in the plugin's XPI, the
one whose manifest the index read. A locale folder is `locale/<tag>/` or
`chrome/locale/<tag>/`. The build counts the messages in the files of each
tag's folders. In an `.ftl` file, each Fluent message or term line, such as
`hello = Hello`, is a message. In a `.properties` file, each line that is
not blank and not a `#` or `!` comment is a message. In a `.dtd` file, each
`<!ENTITY` outside `<!-- -->` comments is a message. If a tag's count is at
least 1 and at least half the largest count among the XPI's tags, the list
keeps the tag. So a folder whose files hold only comments, as some plugins
ship for each language that Zotero supports, adds no language. Neither does
a translation with under half the messages of the fullest one. A tag with a
file of any other type is kept whatever its count. The build inflates at
most about 9 MiB of locale files from each XPI. A tag with a file that the
build does not read, or cannot inflate, is kept whatever its count too.
Such a file adds no messages to any count. The build writes each tag in its
standard form, so `zh_CN` becomes `zh-CN`, and sorts the list. It
leaves out a folder whose name does not have the form of a language tag. It
also leaves out a tag whose language is `und` (undetermined), `zxx` (no
linguistic content), or `mul` (multiple languages), in any letter case. It
skips such a folder before it counts messages, so the folder cannot drop
another tag. It also leaves out a tag whose language has no English name in
the `Intl` data of the Node.js that runs the build. So a folder such as
`locale/img/` or `locale/js/` adds no language. It does not check the
script, region, or variant of a tag, so `en-XX` stays. A `languages`
override value is not checked for an English name. The list says which
languages a plugin ships interface text for. A listed language can still be
incomplete, since a tag with half the fullest tag's messages stays. A
plugin that writes
its text straight into its code ships no locale folders, so its list is
empty. A `languages` override in its `index.json` can record its
languages in the record's `overrides` block, as "Plugin entries" says.
Data written before the list existed has no `languages` field.

Each record that has an `upstream` block also has a `reports` list. It
counts the user reports on the plugin version in `upstream.version`. The
list has one item for each Zotero major with at least one counted report,
ordered by major, such as `{ "zoteroMajor": 7, "works": 3, "broken": 1 }`.
If no report counts, the list is empty. A report is a closed issue of this
repository with the label `report`. The build drops a report in each of
these cases:

- It is a pull request.
- It was not closed as completed.
- It was not closed by `github-actions[bot]`, the account that the report
  bot closes issues as. A report that someone reopens and closes again is
  dropped.
- It has the label `not-counted`.
- It fails the bot's checks, as "Reporting whether a plugin works" in
  [requests.md](requests.md#reporting-whether-a-plugin-works) lists
  them.
- Its plugin version is not the version in the record's `upstream.version`.

Of one GitHub account's remaining reports on one plugin and Zotero major,
only the newest counts. The account is known by its user id, so a renamed
account stays one account. If two such reports have the same creation time,
the one with the higher issue number counts. The count follows each issue's
current text, so a reporter who edits a closed report changes the count.
When the index reads a new release of a plugin, its counts start over.

A record can have a `kept` block in place of a `failure` block. Then the
build failed to read the plugin for a build-level reason. The record holds
the `upstream` block and the `startTests` list that an earlier build
published. It can also keep that build's `malwareScan` result, since its
file is unchanged. The `kept` block has two fields. `readAt` is the
start time of the build that read those facts, as that build's
`generatedAt` gives it. `failure` has this build's failure name and
message. The record's `reports` list counts the reports that this build
read, for the version in `upstream`. The build keeps earlier facts for at
most 7 days after `readAt`, as "Building the data" in
[maintaining.md](maintaining.md#building-the-data) says. A deploy can fail
for some days, so facts on the published site can be older than 7 days.
Data written before the build kept facts has no `kept` block. The field is
new in schema v1. If you check data against a saved copy of the schema,
fetch the schema again.

A record with an `upstream` block can have a `startTests` list. It says
whether the plugin version in `upstream.version` started in each tested
Zotero release, such as
`[{ "zotero": "7.0.32", "result": "started" }, { "zotero": "10.0.6", "result": "start-error" }]`.
The build installs the plugin in a new profile of Zotero for Linux and
waits 3 seconds. Then it reads one of four results:

- `started`: Zotero lists the plugin as active, and the plugin logged no
  startup error.
- `start-error`: the plugin's startup threw an error, or an async startup
  rejected, in those 3 seconds. A startup that fails later counts as
  `started`.
- `not-installed`: Zotero does not list the plugin, or lists it as
  inactive.
- `timed-out`: no result came before the start's time limit of 90 seconds.

A start does not show that the plugin works. Zotero does not install a
plugin outside the range of its manifest's `strict_min_version` and
`strict_max_version`. So the build tests only the releases in that range.
Overrides do not change which releases it tests. The list is ordered by
Zotero version. If no tested release gave a result, the record has no
`startTests` field. Data written before the start tests has none. The
tested releases are Zotero 7.0.32, 8.0.4, 9.0.6, and 10.0.6. When Zotero
ships a release, a maintainer adds it to the workflow. The `startTests`
field is new in schema v1. If you check data against a saved copy of the
schema, fetch the schema again.

The build does not start every plugin each day. Once in each build,
`pnpm carry-start-results` reads the published data of the last deploy. That data's record can have
the same entry id, plugin id, plugin version, and `xpiSha256`. If so, the
build keeps the record's `started` result for each tested release. It starts
the plugin in a tested release in these cases:

- The XPI's SHA-256 differs from the one last tested.
- The tested release has no earlier result.
- The last result was not `started`.
- It is the entry's re-test day. Each entry has one such day in every 7,
  fixed by its entry id. A build on that day keeps no earlier result for
  the entry.
- The published data names the entry twice, or its record names the
  release twice.
- The build cannot read the published data. It then keeps no earlier
  result that day.
- The published record has a `kept` block, so its results come from an
  earlier build.

A record with a `kept` block has no start test in that build. It keeps
the `startTests` list of the build that read its facts.

So a `started` result is most often up to 7 days old. If the build on the
re-test day deploys nothing, the result stays until the next re-test day.

Plugin code runs during its start test. Code that runs in a start-test job
can rewrite that job's results, its own included. That code can also leave
a process running. If the process uploads results under the artifact name
of another tested release before that release's job does, its results
count. So a `startTests` item can be forged. For an unchanged XPI, the
build keeps a forged `started` result to the entry's next re-test day. If
the build on that day deploys nothing, the forged result stays longer.
Plugin code that forges the result again on each re-test day keeps it in
place.
"Starting plugins in Zotero" in
[maintaining.md](maintaining.md#starting-plugins-in-zotero) says which
results the build keeps.

A record with an `upstream` block can have a `malwareScan` object. It holds
the newest ClamAV scan of the file that `upstream.xpiSha256` names, such as
`{ "xpiSha256": "…", "scannedAt": "2026-11-09", "clamav": "ClamAV 1.5.4/27800/Sun Nov  8 09:00:00 2026" }`.
The object has these fields:

- `xpiSha256`: the SHA-256 of the scanned file, which equals
  `upstream.xpiSha256`.
- `scannedAt`: the UTC date of the scan, as YYYY-MM-DD.
- `clamav`: the first line that `clamscan --version` printed in the scan.
  It names the ClamAV version and the version and date of its signatures.
- `found`: the name of the signature that ClamAV found in the file. A file
  in which ClamAV found nothing has no `found` field.

The build scans the plugin files on a scheduled run on a Monday (UTC). It
also scans on a run that a maintainer starts with the `malware-scan` input.
ClamAV asks its users not to download the full signature set often, and the
build keeps no cache. On every run, `pnpm carry-scan-results` keeps the
published result of each record whose `xpiSha256` is unchanged. On other
runs the build scans nothing. So a new release has no `malwareScan` until
the next scan run. A published result is most often at most a week old. When
a scan run did not reach the file or failed, the result is older. A scan run
takes the files with no kept result first, then the files with the oldest
results. It starts no download 20 minutes after it begins. In these cases a
file gets no new result:

- Its download fails.
- Its SHA-256 differs from `upstream.xpiSha256`.
- ClamAV reports an error for it.
- ClamAV reports that the file passed a scan limit or holds an encrypted
  entry. ClamAV then did not scan the whole file.
- ClamAV prints no line for it, or more than one line.
- ClamAV prints its line in another form, such as text before `OK`, or a
  version line too long for the `clamav` field.
- Its batch's `clamscan` is stopped, at its limit of 10 minutes, at its
  output limit, or from outside, before it prints the file's line.
- `clamscan --version` gives no version. Then no file of the run gets a
  result.

The scan splits the files into batches, at most 4, and no more than the
machine's cores or the files. It runs one `clamscan` for each batch at the
same time. A batch that is stopped keeps the result of each file whose line
it printed before the stop. The last line of a stopped batch's output gives
no result unless it ends with a line break, since the stop can cut it.

A scan run that fails adds no result at all. Examples are a refused
`freshclam`, a failed or stopped job, and a results file of the wrong
shape. If a file with no new result has an earlier result, it keeps it. A
file that the scan run did not reach keeps its earlier result too. If the
build cannot read the published data, it keeps no result that day. The next
builds then have no result to keep either, so every page reads "Not scanned
yet" until the next scan run. Nor does it keep a result for an id that two
published records name.

A clean scan does not show that a plugin is safe. ClamAV matches the file
against signatures of known malware, and it finds nothing new. A find hides
nothing: the plugin stays listed, and a maintainer handles it as a report of
harm. A find alone removes nothing: it counts as evidence only with a second
source that supports it. The build opens a GitHub issue labeled
`malware-scan` for each find. ClamAV reads the plugin files in its own job,
which has no token permission and no secret. A file that takes over ClamAV in
that job can forge the scan results of that run. The `malwareScan` field is
new in schema v1. If you check data against a saved copy of the schema, fetch
the schema again.

## Plugin entries

Each plugin has one directory, `plugins/<id>/`, where `<id>` is the plugin id
from its manifest, for example `plugins/first-plugin@example.org/`. The
directory holds two files, and a third, `screenshot.webp`, for a plugin with a
screenshot.

`meta.json` is an entry in the registry format. The registry is
[zotero-plugin-registry](https://github.com/zotero-plugin-dev/zotero-plugin-registry),
and its schema rejects fields that it does not define. Thus this file holds
only registry fields. Its `id` must equal the directory name.

`index.json` holds the data that only this index uses. It has these fields:

- `schemaVersion`: the version of the `index.json` schema. The current version
  is `1`. This field is required.
- `paidService`: set when a maintainer read that the plugin's main use stops
  without paying its maker, or stops after a trial. A lasting free plan with
  a paid upgrade, a plugin that also works with a third party's key, and a
  donation do not count. The build copies the field to the data. It has these
  fields, all required:
  - `note`: what the plugin needs to be paid for, in English, in 1 to 160
    characters.
  - `source`: the page that says so, as an address that starts with
    `https://`.
  - `read`: the date that the maintainer read that page, as `YYYY-MM-DD`.
- `iconHidden`: set when a maintainer hides the icon that the plugin's
  manifest names. Then the data and the site show no icon for the plugin.
  This also holds for a record that keeps earlier facts. It has one
  required field, `reason`: why the icon is hidden. The reason must hold a character other
  than whitespace and Unicode format characters, as for an override.
- `screenshot`: set when the repository's owner asked for a screenshot and a
  maintainer applied it with `pnpm screenshot-request`, as
  [requests.md](requests.md#adding-a-screenshot) says. The image is
  `screenshot.webp` in the entry's directory. It has two required fields:
  - `description`: what the image shows, in the owner's words. It must hold
    a character other than whitespace and Unicode format characters, as for
    an override's reason.
  - `reason`: the issue that asks for the screenshot. It must hold a
    character other than whitespace and Unicode format characters, as for an
    override.

  If `index.json` has this field and `screenshot.webp` is missing,
  `pnpm check` fails the entry. If the file exists and `index.json` has no
  such field, it also fails the entry. It also fails a file that is not
  WebP, is more than 1600 pixels wide or 2400 pixels tall, or is more than
  1 MiB.
- `overrides`: a list of corrections to upstream facts. Use an override only
  when the plugin author cannot or will not fix the fact upstream, or in the
  cases that follow. A `description` override can also give English text for
  a plugin with no English description upstream. "Upstream" here means the manifest, its
  English locale files, and the About text of the GitHub repository. A
  description that is not in English or only repeats the name counts as
  none. So does a description of which half or more is Chinese, Japanese,
  or Korean, by the share that the site counts. A `description` override
  can also replace an English description of fewer than six words, where a
  word is a run of letters, marks, and digits. This case reads the
  description that the site shows without the override. The site's
  categories read the shown description, so a `description` override can
  change them. After you write one, check the plugin's categories. A
  repository's owner can also ask for a `name` or `description` override, as
  "Changing a plugin's name or description" in
  [requests.md](requests.md#changing-a-plugins-name-or-description) says.
  Each item has these fields:
  - `field`: the fact to correct, fill in, or replace. The value is one of
    `name`, `description`, `homepage`, `strict_min_version`,
    `strict_max_version`, or `languages`.
  - `version`: the plugin version that the override applies to. If you leave
    it out, the override applies to every version.
  - `value`: the corrected value. For `languages`, the value is one or more
    language tags joined by a comma and a space, such as `zh-CN, en-US`. A
    tag starts with a language of 2 or 3 letters. An optional script,
    region, and variant follow, each after a `-`. Examples are `zh`,
    `zh-TW`, and `sr-Latn-RS`. A tag whose language is `und`, `zxx`, or
    `mul`, in any letter case, is not allowed.
  - `reason`: why the upstream value is wrong. For English description
    text, the reason names the upstream file or section the text came
    from. It also says which case above each upstream description is, or
    that it is in English and not shown. For a text that the repository's
    owner asks for, the reason names the issue. The reason must hold a character
    other than whitespace, as JavaScript's `\s` defines it, and Unicode
    format characters, such as U+200B.

Two overrides must not have the same `field` and `version`.

The schema for `index.json` is
[`schemas/index.v1.schema.json`](../schemas/index.v1.schema.json).
