# Plain words for plugin pages and About

**Provenance.** A first-hand record of page wording. It covers plugin pages
(M110) and the About and 404 pages (M111). The M110 plan drafted it on
2026-11-07 in the tone of the M109 home page. Status: draft, waiting for the
user's approval at the plan question set — observed 2026-11-07. It quotes no outside source, so
it has nothing to re-verify against. `<v>` is the release version. `<date>`
is a day in UTC written as "November 7, 2026". `{…}` is a value that the page
fills in.

## Plugin page (M110)

- Older data badge title, on the plugin page and the home row: "Zotdex
  couldn't reach this plugin today, so these facts are from <date>"
- Older data note: "Zotdex couldn't reach this plugin on <date>: `{name}`:
  {message}. This page shows what it found on <date>. About older data"
- Failure line: "Zotdex couldn't read this plugin when it last updated this
  page, on <date>: `{name}`: {message}"
- Categories label: "Zotdex categories:"
- Buttons: "Download <v> (.xpi)", "Source code" (or "Repository" for a repo
  with the lock), "Releases"
- Install note: "To install, save the .xpi file and drag it onto the Plugins
  window in Zotero (Tools → Plugins). In Firefox, right-click the download
  link and choose Save Link As. A plugin has full access to your Zotero and
  your computer, and Zotdex doesn't review its code before listing it, so
  install only plugins from developers you trust. More about installing"
- Version card heading: "Zotero versions". Line under it: "For version <v>,
  the release this page shows"
- Table headers: "Zotero", "Supports", "Startup check", "User reports"
- Support cells: "Yes", "Partly", "No", or "Not stated"
- Startup check cells: "Loaded Zotero {v}" and the other start words, or
  "Not checked"
- Report cells: "{n} works {n} broken" or "None yet"
- Line under the table: "The plugin says it supports {Zotero 7.0 to 9.*}.
  How Zotdex reads plugins". The first sentence shows only for a plugin with
  a range.
- Report line: "Tried version <v> on Zotero? Report what you found:",
  buttons "Works" and "Broken"
- Details heading: "Details". Labels and values:
  - "Plugin ID"
  - "Requires paying its maker": "{note} Source, checked <date>"
  - "Description in the plugin file"
  - "Description on GitHub"
  - "Archived on GitHub": "Yes" or "No"
  - "Source code in the repository's top folder": "Yes" or "No"
  - "Repository created": "<date>"
  - "Release on this page": "<v>, published <date>" and " (prerelease)"
  - "Releases with an .xpi file"
  - "Open issues and pull requests"
  - "Updates come from": the update host
  - "Languages": the names, or "Language not listed"
- Corrections heading: "Corrections by Zotdex"
- Corrections text: "Zotdex corrects, fills in, or replaces these facts from
  the plugin's own files or GitHub page."
- Corrections headers: "Fact", "Plugin's value", "Zotdex's value", "For
  version", "In use", "Reason". A description's lines: "Plugin file: …" and
  "GitHub: …"
- Owner links: "Is this your plugin? Ask to change its name or
  description." and "Ask to remove this plugin or report harm."
- Badge card heading: "Badge for your README". Text: "If this is your plugin, you can add
  this Markdown to its README. The badge shows the Zotero versions where it
  passed Zotdex's startup check, or why it shows none, and it links to this
  page."
- About's quotes of these labels follow them: "Source code in the
  repository's top folder", the "Corrections by Zotdex" table, and its "In
  use" column.

## About page (M111)

`<title>`: "About: Zotdex". Meta description: "How Zotdex reads plugins:
where the facts on a plugin page come from and what they don't show."

**How Zotdex reads plugins** (h1). Every day, Zotdex reads each listed
plugin's GitHub repository and releases. A plugin page shows what it found
for one release. A maintainer checks the paid service fact by hand, and
Zotdex reads the rest on its own. This page explains where the main facts
come from and what they don't show. It also tells you how to install a
plugin, and it ends with the license terms.

**Supported Zotero versions** (`#declared`). A plugin's file lists the Zotero
versions it supports, in its `strict_min_version` and `strict_max_version`
fields. Zotdex shows that range for the release it read, after any
corrections. List: ✓ "Supports every release of that Zotero version, up to
the newest one." ◐ "Supports some releases of it." – "Doesn't support it."
Then: Zotdex counts Zotero N as every version from N.0 to the newest release
of N. So a maximum such as 10.0.* covers all of Zotero 10 while 10.0 is the
newest release, and only part of it once Zotero 10.1 is out. A range that
ends before N.0, or starts after the newest release, covers none of it. So a
minimum such as 8.999, which authors write to mean Zotero 9 and newer, covers
none of Zotero 8. Every day Zotdex reads the current Zotero release from
zotero.org, and it keeps the last release of each older Zotero version. For
a Zotero version with no release yet, Zotdex counts N.0 to N.9, because
authors often write a maximum such as 10.99.99 to mean every Zotero 10
release. A plugin that lists no range shows no mark. The range is what the
author says, not a test result. Then: "This update used these newest
releases:", items "Zotero {N}: {release}" or "Zotero {N}: no release yet, so
Zotdex counts {N}.0 to {N}.9".

**Startup check** (`#start-test`). Zotdex installs the plugin release it read
in a fresh Zotero profile on Linux. It does this for each tested Zotero
release that the plugin's range covers. It waits 3 seconds after the
install, then records one of four results. Then: Zotdex doesn't check every
plugin every day. It checks a plugin in a tested release when the plugin
file changed since the last check, when that release has no result yet, or
when the last result wasn't a load. It also checks every plugin again one
day each week, and on any day when it can't read the last published data. On
other days it keeps the last result, so a result is usually up to a week
old. A plugin with older data gets no startup check until Zotdex can read it
again. If the weekly day's update doesn't reach the site, the result stays
another week. List: ● "Loaded: Zotero lists the plugin as active, and the
plugin logged no startup error." ✕ "Failed to load: the plugin hit an error
while starting up, in those 3 seconds." ✕ "Didn't install: Zotero doesn't
list the plugin, or lists it as inactive." ✕ "Didn't finish loading: no
result came within 90 seconds." Then: Passing the startup check doesn't mean
the plugin works. The check doesn't use any of its features, and an error
after the 3 seconds still counts as loaded. The plugin's own code runs
during the check, so a plugin can change its own result.

**Older data** (`#older-data`). Sometimes Zotdex can't reach a plugin because
of a problem on its side or a host's, such as a time limit, a slow read, or
a server error. If the published data has facts about the plugin from the
past 7 days, the site keeps them. The plugin's row gets an "Older data"
badge, and its page names the day of that read and the problem. A plugin
that Zotdex can't read for another reason, such as a deleted repository,
shows "Not read". The 7 days count back from each update, and an update can
fail to reach the site, so kept facts on the site can be older. A plugin
with older data gets no startup check, and it keeps the results that were
published with its facts.

**User reports** (`#reports`). Anyone with a GitHub account can report that a
plugin version works or is broken on a Zotero version. The Works and Broken
buttons on a plugin page open the report forms on GitHub. A bot checks each
report and closes it. Then: Zotdex counts a report only when the bot closed
it as completed and the report names the plugin version Zotdex read. A
report labeled `not-counted` doesn't count. If one GitHub account reports
more than once on the same plugin and Zotero version, only the newest report
counts. When Zotdex reads a new release of a plugin, its counts start over.
The counts show what people found, not what Zotdex tested.

**Descriptions** (`#descriptions`). A plugin's description comes from its
plugin file or from the About text of its GitHub repository. When the plugin
file's name or description points to a translated message, Zotdex reads the
plugin's English translation first, if it has one. Then: A description
correction for the release Zotdex read comes first. Without one, when half
or more of a description is Chinese, Japanese, or Korean, the site takes its
Latin-script part. It splits the text at each `/` with a space on each side
and after each `。`. It keeps the pieces whose letters are all Latin and that
have at least three words, and joins them with a space. If that part exists
and doesn't just repeat the plugin's name, the site uses it in place of the
whole text. A piece in another language that uses Latin letters, such as
Portuguese, shows as it is. Then: The site then drops a description that's
missing, blank, or just repeats the plugin's name. Last, if less than half
of the plugin file's description is Chinese, Japanese, or Korean, the site
shows it. If not, the site shows the GitHub description, when it kept that
in one of two cases: the plugin file's description was dropped, or the
GitHub description has less of that text. The Details card on a plugin page
shows both descriptions, unless one is missing or blank.

**Corrections** (`#overrides`). When a fact from a plugin is wrong and its
author can't or won't fix it, Zotdex can correct it. A correction changes one
fact: the name, the description, the homepage, `strict_min_version`,
`strict_max_version`, or the languages list. It applies to one plugin
version or to every version. A description correction can also give English
text for a plugin with no English description of its own. That covers a
description that isn't in English, that just repeats the name, or that is
half or more Chinese, Japanese, or Korean. It can also replace an English
description of fewer than six words. Then: A repository's owner can also
ask for a new name or description, through the link in the plugin's
Details, after first trying to change it in the plugin itself. The text must
be in English. A name has {NAME_MIN} to {NAME_MAX} characters, and a
description has at least {DESCRIPTION_MIN_WORDS} words and at most
{DESCRIPTION_MAX} characters. A maintainer reads each request. The text
stays through new releases until the owner asks to remove it. Then: The
"Corrections by Zotdex" table in a plugin's Details lists each correction
beside the plugin's own value. Its "In use" column says "yes" for the
correction that applies to the version Zotdex read. A correction for that
version wins over one for every version. The supported range uses the
`strict_min_version` and `strict_max_version` corrections marked "yes". A
description correction lists both of the plugin's texts, from its plugin
file and from GitHub, when it has them.

**Categories** (`#categories`). Zotdex sorts plugins into its own categories,
so you can find plugins of one kind. It picks them from words in a plugin's
name and descriptions, and adds or removes some by hand. A plugin can be in
several categories. A plugin that fits no other category goes under Other
tools. A plugin that Zotdex couldn't read in its latest update, and that has
no older data, only has the categories added by hand, so it often shows
none. A category can be wrong or missing. Plugin authors don't choose them,
but a requested name or description can change the words Zotdex reads. The
category list stays as it is.

**Source code** (`#source`). A lock beside a plugin's name means Zotdex found
no source code in the top folder of its repository. Every day Zotdex reads
the names of the files and folders in the top folder of the repository's
default branch, for each plugin it could read. It reads no code to decide
this. These names don't count as source code, in any letter case: (the
current list of names, unchanged). Any other name does. Then: A plugin page
shows the result as "Source code in the repository's top folder". "Yes"
doesn't mean an open-source license, and it doesn't mean the .xpi was built
from that code. "Yes" can be wrong, because a name such as `LICENSE-MIT`
counts. "No" can be wrong, because Zotdex doesn't look inside folders. A
plugin with the lock stays listed, because Zotdex states this as a fact and
doesn't judge plugins by it.

**Paid service** (`#paid-service`). A card icon beside a plugin's name means
the plugin's main use stops unless you pay its maker, or stops after a
trial, whether the payment is for credits, a membership, an activation code,
or a paid plan. A maintainer checks this by hand from the plugin's own text.
The plugin page's Details card gives a note on what you pay for, a link to
the source, and the date of the check. Then: A lasting free plan with a paid
upgrade gets no mark. A plugin that also works with a third party's key gets
no mark. A donation gets no mark. A plugin with no mark can still cost
money, because the maintainer checks new plugins later and doesn't read
every page about a plugin. A marked plugin stays listed, because Zotdex
states this as a fact and doesn't judge plugins by it. An author can open an
issue to correct it.

**Removing a plugin** (`#removing`). A maintainer removes a plugin from Zotdex
for any of four reasons: its repository's owner asks, it's spam, its entry
misleads people about what the plugin is or who makes it, or a report shows
harm with evidence that others can check. A claim with no evidence removes
nothing. To ask, use the form for removing a plugin or reporting harm (a
link), or the link on the plugin's page. The form opens a public GitHub
issue, and a maintainer answers there. Then: A removed plugin stays off
Zotdex, and the bot doesn't suggest it again. A list keeps its repository
and, when a maintainer judges it unique, its plugin ID, so a copy under a new
name is caught only if it keeps a listed ID. Zotdex still can't vet plugins,
and it doesn't review their code.

**Installing a plugin** (`#installing`). To install a plugin, save its .xpi
file to your computer. Then, in Zotero, go to Tools → Plugins and drag the
file onto the Plugins window. In Firefox, right-click the download link and
choose Save Link As. Then: A plugin has full access to your Zotero and your
computer, so install only plugins from developers you trust. Then: A bot
adds most new plugins on its own. If one of the bot's checks flags a plugin,
the bot waits, and a maintainer decides whether to list it. A maintainer can
also add a plugin by hand or keep one out. When deciding, a maintainer
mainly checks whether the entry would mislead people about what the plugin
is, who makes it, or who controls its updates. A maintainer can compare
files to spot a copy, but doesn't review the code. Zotdex doesn't review a
plugin's code before listing it.

**README badge** (`#badge`). Each plugin has a badge file at
`https://zotdex.jmgirard.com/badges/<id>.json`, with the plugin's ID
percent-encoded. The badge service shields.io draws a badge from it, labeled
Zotdex. Each plugin page ends with the Markdown that shows the badge in a
README and links it to that page. Then: The badge says "started in Zotero"
and each Zotero version whose newest tested release the plugin loaded in,
such as "started in Zotero 7 · 8 · 9". If it loaded in none, it says "no
start in tests". If the plugin has no results, it says "not start-tested".
If Zotdex couldn't read the plugin in its last update and kept no older
facts, it says "no data". A plugin with older facts gets the badge of those
facts. Loading doesn't show that a plugin works. Then: Only an update that
reaches the site changes a badge. Startup check results come from each day's
update. After a day when the checks fail, a badge can name fewer versions or
say "not start-tested" until a later update has results. GitHub Pages keeps
the badge file for up to 10 minutes, and shields.io and GitHub each keep a
copy of the image for up to an hour. So a change can take a few hours to
show. When Zotdex removes a plugin, its badge shows an error from
shields.io.

**What Zotdex doesn't do** (`#not-vetted`). Zotdex is unofficial: it's not
part of Zotero or endorsed by it. It can't vet the plugins it lists, because
one person runs it and any plugin can change with each release. The startup
check isn't a review of a plugin's code: it only shows whether a plugin
loads. Zotdex doesn't endorse plugins. It doesn't host plugin files: the
download link on a plugin page goes to the author's own file, which Zotdex
doesn't copy.

**License** (`#license`). Zotdex's code is under the MIT License, except the
third-party parts of the files the license page names. The Zotdex logo is
Zotdex's own drawing, under the same terms as its code. The other icons on
these pages come from Lucide, under the ISC License, and from Feather, under
the MIT License. The facts Zotdex gathers, its categories, and text a
maintainer wrote are under CC0 1.0. All other text keeps its author's terms:
plugin names and descriptions, GitHub About text, and text an owner asked
for. The license page (a link) gives the details.

**404 page.** Heading "Page not found"; text: "No page is at this address. A
plugin's page goes away when Zotdex no longer lists the plugin. See all
plugins or read the About page."
