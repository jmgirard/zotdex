# Plain words for plugin pages and About

**Provenance.** Ingested 2026-11-07 by the M110 plan from the current
`site/src/pages/` text. It records new page wording in the tone of the M109
home page. It covers plugin pages (M110) and the About and 404 pages (M111).
Pagination: none.
Extraction: first-hand, so it has nothing to re-verify against. Status: the
user approved it at the plan question set — observed 2026-11-07. The user approved "of the
plugin" in About's reports line after the M111 claim audit (2026-11-07). The user approved the
icon and screenshot lines at the M113 and M114 plan question set (2026-11-07). `<v>` is the release version. `<date>` is a day in UTC written as
"November 7, 2026". `{…}` is a value that the page fills in.

## Plugin page (M110)

- Older data badge title, on the plugin page and the home row: "Zotdex
  couldn't reach this plugin in its latest update, so these facts are from
  <date>"
- Older data note: "Zotdex couldn't reach this plugin on <date>: `{name}`:
  {message}. This page shows what it found on <date>. About older data"
- Failure line: "Zotdex couldn't read this plugin when it last updated this
  page, on <date>: `{name}`: {message}"
- Categories label: "Zotdex categories:"
- Buttons: "Download <v> (.xpi)", "Source code" (or "Repository" for a repo
  with the lock), "Releases"
- Install note: "To install, save the .xpi file and drag it onto the Plugins
  window in Zotero (Tools → Plugins). In Firefox, right-click the download
  link and choose Save Link As. A plugin has full access to Zotero and your
  computer, and Zotdex doesn't test plugins' safety or features, so look into
  a plugin before you trust it with your library. More about installing"
- Version card heading: "Zotero versions". Line under it: "For version <v>,
  the release this page shows"
- Table headers: "Zotero", "Supports", "Startup check", "User reports"
- Support cells: "Yes", "Partly", "No", or "Not stated"
- Startup check cells: "Loaded Zotero {v}" and the other start words, or
  "Not checked"
- Report cells: "{n} works {n} broken" or "None yet"
- Line under the table: "Supported versions: {Zotero 7.0 to 9.*}. How
  Zotdex reads plugins". The first sentence shows only for a plugin with a
  range, which includes Zotdex's corrections.
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
  - "Checks for updates at": the update host (corrected M110, at the user's choice after the claim audit)
  - "Languages": the names, or "Language not listed"
- Corrections heading: "Corrections by Zotdex"
- Corrections text: "Zotdex corrects, fills in, or replaces these facts from
  the plugin's own files or GitHub page."
- Corrections headers: "Fact", "Plugin's value", "Zotdex's value", "For
  version", "In use", "Reason". A description's lines: "Plugin file: …" and
  "GitHub: …"
- Owner links: "Is this your plugin? Ask to change its name or
  description." and "Ask to remove this plugin or report harm."
- About's quotes of these labels follow them: "Source code in the
  repository's top folder", the "Corrections by Zotdex" table, and its "In
  use" column.

## About page (M111)

`<title>`: "About: Zotdex". Meta description: "How Zotdex works: what the
facts on a plugin page mean and what they don't tell you."

Each section keeps its current `id`. "Site docs" links to
`https://github.com/jmgirard/zotdex/blob/main/docs/site.md`.

**How Zotdex works** (h1). Every day, Zotdex reads each listed plugin's
GitHub repository and releases. Here's what the facts
on a plugin page mean, and what they don't tell you. The site docs on GitHub
have the full rules.

**Supported Zotero versions** (`#declared`). Each plugin says which Zotero
versions it supports, and Zotdex shows that range, with any corrections. ✓
means it supports every release of that version, ◐ some releases, and –
none. A plugin that doesn't say shows no mark. The range is what the author
says, not a test result. Then: "This update counted these as the newest
releases:", items "Zotero {N}: {release}" or "Zotero {N}: no known release".

**Startup check** (`#start-test`). Zotdex installs each plugin in a clean Zotero
setup, once for each Zotero version the plugin says it supports, and waits 3
seconds. ● means Zotero lists it as active and it logged no startup error. ✕
means it failed to load, didn't install, or didn't finish loading within 90
seconds. Passing doesn't mean the plugin works, because the check doesn't use
any of its features, and the plugin's own code can change its result. Zotdex
checks a plugin again when its file changes, after a failed check, and once a
week, so a result is usually less than a week old.

**Older data** (`#older-data`). When Zotdex can't reach a plugin because of a
time limit or a server problem, it keeps what it found in the past 7 days
and marks the plugin "Older data". A plugin it can't read for another
reason, such as a deleted repository, shows "Not read".

**User reports** (`#reports`). Anyone with a GitHub account can report that a
plugin works or is broken, with the buttons on its page. A bot checks each
report, and Zotdex counts the ones that pass, keeping each person's latest
for each Zotero version. The counts start over with each new release of the
plugin, and
they show what people found, not what Zotdex tested.

**Descriptions** (`#descriptions`). A plugin's description comes from its own
file or its GitHub page. If a plugin comes in several languages, Zotdex uses
its English text. For a description that's mostly Chinese, Japanese, or
Korean, Zotdex shows just the part in Latin letters, if there is one. The
Details card shows both descriptions when a plugin has both.

**Corrections** (`#overrides`). When a fact from a plugin is wrong and its
author can't or won't fix it, Zotdex can correct it, such as its name,
description, or supported versions. A plugin's owner can also ask for a new
name or description with the link on its page, and a maintainer reads each
request. Each plugin page lists its corrections in the "Corrections by
Zotdex" table, beside the plugin's own values.

**Categories** (`#categories`). Zotdex sorts plugins into its own categories,
from words in their names and descriptions plus some fixes by hand, so you
can find plugins of one kind. A category can be wrong or missing, and plugin
authors don't choose them. The category list stays as it is.

**Source code** (`#source`). A lock means Zotdex found no obvious source code
in the top folder of the plugin's repository. It only looks at file and
folder names, not at the code, so it can be wrong either way, and a plugin
without the lock isn't always open source. A plugin with the lock stays
listed.

**Paid service** (`#paid-service`). A card icon means the plugin's main use
stops unless you pay its maker, or stops after a trial. A maintainer checks
this by hand. A free plan with paid extras, a plugin that also works with
another service's key, or a donation gets no mark. A plugin with no mark can
still cost money, because new plugins get checked later.

**Removing a plugin** (`#removing`). A maintainer removes a plugin when its
owner asks, when it's spam, when its entry misleads people about what it is
or who makes it, or when someone shows evidence that it causes harm. To ask,
use the form for removing a plugin or reporting harm (a link), or the link
on the plugin's page. A removed plugin stays off Zotdex.

**Installing a plugin** (`#installing`). Save the plugin's .xpi file, then in
Zotero go to Tools → Plugins and drag the file onto the Plugins window. In
Firefox, right-click the download link and choose Save Link As. A plugin has
full access to Zotero and your computer, and Zotdex doesn't test plugins'
safety or features, so look into a plugin before you trust it with your
library. A bot
adds most new plugins, and a maintainer steps in when the bot flags one,
mainly to keep out entries that mislead people about what a plugin is or who
makes it.

**What Zotdex doesn't do** (`#not-vetted`). Zotdex is independent and
unofficial, and it's not part of Zotero. It can't vet the plugins it lists,
because one person runs it and any plugin can change with each release. It
doesn't host plugin files: download links go to each author's own file.

**License** (`#license`). Zotdex's code is under the MIT License, and its
data, categories, and own text are under CC0 1.0. Names, descriptions, and
other text from plugin authors keep their authors' terms. The license page
(a link) gives the details, including the exceptions.

**404 page.** Heading "Page not found"; text: "No page is at this address. A
plugin's page goes away when Zotdex no longer lists the plugin. See all
plugins or read the About page."

## Icons and screenshots (M113, M114)

Approved at the M113 and M114 plan question set, 2026-11-07. Links are in
brackets.

- M113, About, new section **Icons** (`#icons`, after Descriptions): "A
  plugin's icon is the one its author made for Zotero's Plugins window.
  Zotdex doesn't look at icons before it shows them, and a maintainer can
  hide one."
- M113, About license line, replacing "Names, descriptions, and other text
  from plugin authors keep their authors' terms.": "Names, descriptions,
  icons, and other work from plugin authors keep their authors' terms."
- M113, plugin page: the icon has empty alt text and adds no words.
- M114, About: the section heading becomes **Icons and screenshots**, and
  the section adds: "A screenshot comes from the plugin's owner, who asks
  for it with the link on the plugin's page. A maintainer looks at each one
  before it's shown."
- M114, About license line: "Names, descriptions, icons, screenshots, and
  other work from plugin authors keep their authors' terms."
- M114, plugin page owner line, replacing "Is this your plugin? [Ask to
  change its name or description].": "Is this your plugin? [Ask to change
  its name or description] or [add a screenshot]."
