# The site

The website <https://zotdex.jmgirard.com/> shows the index.
A top bar on every page links to the home page and to the About page. It
also links to the "Add a plugin" issue form, to the repository's GitHub
Discussions as "Feedback", to the data file, and, with a GitHub mark
labeled "Zotdex on GitHub", to the repository. With
JavaScript, it also has a button that flips the page between the light and
dark color schemes. The home
page lists every plugin in one table, with the most GitHub stars first, as
the sort paragraph below says. Without JavaScript the
table shows every row in that order. With it, the table shows 50 rows at a
time, as the pager paragraph below says. Each row
shows the plugin's name, the owner of its repository as `By <owner>`, the
repository's GitHub star count if the data has one, and
its description. If the repository address is not of the form
`https://github.com/<owner>/<repo>`, with or without a trailing slash, the
row shows no owner and no star count. If the plugin's GitHub
repository is archived, the row shows "Archived" after the name. If the index
found no source code at the top level of the repository, the row shows a lock
after the name. If a maintainer read that the plugin's main use needs a paid
service from its maker, the row shows a card icon after the name. Then come
one cell for each Zotero major version from 7 to 10 and a "Languages"
cell. Next comes the month of
the release that the index read, as the year and month in UTC, such as
`2026-09`. Last come links to the source code, or to the repository for a row
with a lock, and to the `.xpi` file.

A version cell shows how much of that version the plugin's declared range
covers. A check mark (✓) means all of it, a half circle (◐) means part of
it, and a dash means none of it. Hold the pointer over a mark to read
its meaning and, for a half circle, the declared range. On a touch screen,
open the plugin's page to read its declared range. A mark counts Zotero N
as the versions from N.0 to the newest release of N. A check mark thus
means every release of that version up to its newest release. For the
current Zotero version, the newest release is the `zoteroRelease` that the
build read. For an earlier version, it is the last release, which the
index keeps in its code. The About page names each one. For a version
with no known release, a mark counts N.0 to N.9. Plugin authors often
write a maximum such as 10.99.99 to mean every Zotero 10 release. A
range that ends before N.0 or starts after the newest release covers none
of that version. Plugin authors also write a minimum such as 8.999 to mean
Zotero 9 and newer, and it covers none of Zotero 8. The declared range
uses the overrides that apply to the plugin version that the index read.
The marks show what each plugin declares, not a test result.

Under the declared mark, a version cell shows the result of the start
tests on that major, which "Using the data" in
[data.md](data.md#using-the-data) describes. If more than
one release of that major has a result, the cell shows the result of the
newest release. A dot (●) means that the plugin loaded. A cross (✕) means
that it failed to load, didn't install, or didn't finish loading. A
cell with neither has no start result. A legend under the table names each
mark. It calls the start test Zotdex's startup check and says that it tests
no features, and it says that the list is sorted by GitHub stars, which show
popularity, not necessarily quality. A
plugin with no declared range shows no declared marks. If the last
build failed to read a plugin, its row shows "Not read" in place of the
version cells. There is one exception: a read that failed for a
build-level reason. If an earlier build read the plugin at most 7 days
before, the row then shows the facts of that build. It has an "Older data"
badge after the name, and the plugin's page names the day of the read and
the failure. "Building the data" in
[maintaining.md](maintaining.md#building-the-data) says which failures are
build-level.

The "Languages" cell shows the language codes of the plugin's
languages list, after overrides, in list order. Regional forms such as
`zh-CN` and `zh-TW` share one code. Hold the pointer over a code to read its
name. If the list has more than 3 codes, the cell shows the first 2 and "+N"
for the rest. An empty cell means that no language is left, which the
plugin's page shows as "Unknown (no translations found)".
The source link goes to the plugin's repository. The download link goes to
the `.xpi` file that the index read, on the author's release. The author
can replace that file later. A link whose address does not start with
`http://` or `https://` does not show.

On a screen 760 pixels wide or less, the table hides the languages and the
release columns. At 560 pixels or less, it also hides the descriptions and
the source links. An owner stays on one line, and an ellipsis cuts an owner
that is too long for the cell. The star count stays whole.

The description comes from the plugin's manifest or from the About text of
its GitHub repository. A manifest name or description of the form
`__MSG_<key>__` names a message in a `_locales/<locale>/messages.json` file.
The index first tries the English folders `_locales/en/`, `_locales/en_US/`,
and `_locales/en_GB/`, in that order. If none of them holds a message that
is not blank, the index reads the message of the manifest's default locale.

A `description` override that applies to the plugin version that the index
read comes first. The site shows it, and none of the steps below apply to
it. With no such override, the site works through these steps.

The site first takes the Latin-script part of each description of which
half or more is Chinese, Japanese, or Korean, by the share described
below. It cuts the text at each ` / ` and after each `。`. A word is a run
of letters, marks, and digits. The site keeps the pieces whose letters are
all Latin and that hold at least three words, and it joins them with one
space. If that part exists and does not only repeat the name, the site
uses it in place of the whole text. Otherwise it uses the whole text. For
example, "点击关闭按钮只最小化窗口。Minimize Zotero instead of
quitting." becomes its English sentence. A Latin-script piece in another
language, such as Portuguese, shows as it is.

The site then drops a description that is missing, blank, or only repeats
the plugin's name. The site checks for a repeated name this way. It takes the
words of the description and of the name. It leaves out "zotero", "plugin",
"addon", "add", "on", "extension", "for", "a", "an", and "the". If every word
of the description that is left is also a word of the name, the description
only repeats the name. For example, "Zotero Plugin for OCR" only repeats the
name "Zotero OCR".

Last, the site compares the share of Chinese, Japanese, and Korean text in
the descriptions that are left. It reads each text in its NFC form, Unicode's
composed form. It counts each Han, Hiragana, Katakana, or Hangul character as
one unit. Each letter whose `Script_Extensions` property names one of these
scripts, such as ー or 〆, is also one unit. Each run of other letters is one
unit. If less than half of the manifest description is such text, the site
shows the manifest description. If not, the site shows the GitHub description
in two cases: the site dropped the manifest description, or the GitHub
description has a lower share. In all other cases the site shows the
manifest description, or no description.

The home page has a search box. It shows only the plugins whose name or
description holds the text you type. It does not read the owner. The search
ignores letter case and the spaces before and after the text, but not
accents. The page keeps the text
in the `q` query parameter of its address, such as `?q=pdf`.

The home page has a "Category" menu. It lists each category that at least
one plugin has, with the number of those plugins in parentheses after its
name. Apart from Other tools, the categories with the most plugins come
first. Categories with the same number of plugins come in the order of the
About page's list. The menu lists Other tools last, whatever its number.
A plugin that fits no other category is under Other tools. A plugin that the
latest build did not read, and that keeps no earlier facts, has only the
categories added by hand, so it often shows none. If you pick a category, the table shows only the plugins in it.
"All categories" passes every plugin. The page keeps your choice in the
`category` query parameter of its address, such as `?category=translation`.
If the parameter names no category in the menu, the page passes every
plugin and removes the parameter. Each plugin page links each of its
categories to the home page filtered by it. The categories are the index's
own grouping, not a fact that a plugin's author declares. The index
assigns them from words in a plugin's name and descriptions. It also adds
or removes some by hand. So a category can be wrong or missing. The About
page lists them.

The home page has a "Language" menu. It lists each language on
at least one plugin's languages list, after overrides, with the number of
those plugins, such as "Chinese (2)". The languages with the most plugins
come first, and languages with the same number of plugins come in order of
their names. If you pick a language, the table shows only the plugins whose
languages list includes it. The menu groups the regional forms of a
language, so a plugin with `zh-CN` or `zh-TW` counts under Chinese.
"Any language" passes every plugin. The page keeps your choice in the
`language` query parameter of its address, such as `?language=zh`, so you
can link to the filtered table. If the parameter names no language in the
menu, the page passes every plugin and removes the parameter.

The home page also has "Supports Zotero" buttons: "Any" and one button for
each Zotero major from 7 to 10. If you press a major, the table shows only
the plugins whose declared range covers all or part of that version. These
are the plugins with a ✓ or ◐ mark for it. A plugin with no declared range,
or one that the last build failed to read and that keeps no earlier
facts, does not show. The page keeps
your choice in the `zotero` query parameter of its address, such as
`?zotero=8`. If the parameter names no button, the page acts as if "Any" is
pressed and removes the parameter.

The home page has a "Sort by" menu above the table, with the options Most
stars, Name, and Recently updated. Most stars is the default. It puts a higher
GitHub star count first, and 0 counts as a value. Recently updated puts a later
release date first, for the release that the index read. Name ignores letter
case and accents, and names that are then equal sort by plugin id. Under Most
stars and Recently updated, a plugin with no such value comes after every
plugin that has
one, and plugins that tie stay in Name order. A star count is a fact from
GitHub. It is not a review. If you change the menu, the table shows page 1 in
the new order. The
page keeps your choice in the `sort` query parameter of its address, as
`?sort=name` or `?sort=latest`. For Most stars, or a value that names no other
option, the page removes the parameter.

The search box, the two filter menus, and the buttons work together: the table
shows the plugins that pass all four, in the order of the sort menu. A count
above the table reads "M plugins",
where M is the number of plugins in the index. While a filter is on, it
reads "N of M plugins", where N is the number that the filters pass. The
count covers the plugins on every page. If the filters pass no plugin, the
count reads "No plugins match. Try removing a filter."

The table shows 50 of the plugins that the filters pass at a time. When
they pass more than 50, a pager below the table reads "Page p of P" between
a Previous and a Next button. Each of them moves one page and scrolls back
to the top of the table. It also adds an entry to the browser history, so
Back returns to the address before, filters included. On the first page
Previous does nothing, and on the last page Next does nothing. The page
keeps the page number in the `page` query parameter of its address, such as
`?page=2`, and leaves it out for page 1. If the parameter names no page that
the filtered plugins fill, the page shows page 1 and removes the parameter.
A change to the search box, a menu, or the buttons shows page 1 at once.
For the search box, the address takes the new text and drops `page` once
typing stops for half a second.

A script runs the search box, the menus, the buttons, the sort menu, the
count, and the pager. Without JavaScript, the home page shows none of them and
lists every plugin.

The "Feedback" link in the top bar opens the repository's GitHub
Discussions. Posting there needs a GitHub account. A post there is not a
compatibility report, and the report counts do not read it.

The "Add a plugin" link in the top bar opens the issue form that
"Proposing a plugin with an issue" in
[requests.md](requests.md#proposing-a-plugin-with-an-issue) describes. The
form needs a GitHub
account.

Each plugin has its own page. It opens with an "All plugins" link back to
the home page, the plugin's name with any marks, a repository line, and its
description.
The repository line needs an address of the form
`https://github.com/<owner>/<repo>`, with no query or fragment. A
trailing slash is allowed. The line reads `By <owner> · <repo>`. The
owner links to the owner's GitHub page, and the repository name links to
the repository. If the data has a star count for the plugin, the line
ends with a gold star icon and the count, such as "★ 8,400". A tooltip
gives the count with its label, such as "8,400 stars on GitHub", or
"1 star on GitHub" for a count of 1. Screen readers skip the icon and the
number and read hidden text with the same words. For any other address,
the page has no repository line. If the plugin has categories, a line
after the description lists them after the words "Index categories". Each
category links to the home page filtered by it. Then come up to
three links, each with an icon and text: "Download <version> (.xpi)" to the `.xpi`
file that the index read, "Source" to the repository, or "Repository" for a
plugin with a lock, and "Releases" to
the repository's releases page. If the download address does not start
with `http://` or `https://`, the page has no download link. If the
repository address does not, the page shows that address, and the releases
address after it, as plain text. A plugin whose read failed has no download or releases link.

A plugin page with a download link has an install note after those links.
It says how to install the file in Zotero, and it gives a step for Firefox.
It also says that a plugin has full access to Zotero and the computer, and
that the index does not review its code before listing it. The note links to
the "Installing a plugin" section of the About page (`#installing`).

A "Zotero compatibility" card follows. It names the plugin version that
the index read and holds a table, newest major first. The table has one
row for each Zotero major from 7 to 10. It also has a row for each other
major that the plugin's counted reports or start-test results name. Each
row has three cells:

- Declared: the mark and the word for how much of that major the declared
  range covers. The words are "Yes" (✓), "Partly" (◐), and "No" (a dash). If the
  plugin declares no range, the cell shows "No range".
- Start test: the result of the newest tested release of that major, in
  words, with that release, such as "Loaded Zotero 10.0.6". A dot (●)
  marks a start, and a cross (✕) marks a failure. If no release of that
  major has a result, the cell shows "Not tested".
- User reports: the number of "works" reports and of "broken" reports on
  that major, as "Using the data" in [data.md](data.md#using-the-data)
  counts them. If no report counts, the
  cell shows "None yet".

Under the table, the card shows a link to the About page. If the plugin
declares a range, the declared range comes before that link. Then a line names the plugin version that the index read, beside a
"Works" button and a "Broken" button. The buttons open the report forms on
GitHub with the plugin id and that version filled in. If the last build
failed to read a plugin, the card shows the failure in place of the table,
with no report buttons. A plugin that keeps earlier facts shows the table
and the buttons for the version of those facts.

An open "Details" card comes next. Its last lines link to the forms that ask
to change the plugin's text and to remove the plugin or report harm. A
"Badge for your README" card comes last, with the plugin's badge Markdown. The
Details card lists
the plugin id. For a plugin with
the card icon, it then gives the paid service fact, whether or not the build
read the plugin. If the build
read the plugin, it also lists facts about the repository and the release
that the index read. Its last fact is "Menus and settings in". That fact names the
languages of the `languages` list that "Using the data" in
[data.md](data.md#using-the-data) describes, which
come from the plugin's locale folders. If a `languages` override applies to
the plugin version that the index read, the override replaces that list.
The fact does not say how complete each language is. If no language is
left, the page shows "Unknown (no translations found)". The description
comes from the plugin's manifest, from the About text of its GitHub
repository, or from an index override. So it can be in another language
than the languages fact names. The card shows the manifest description and
the GitHub description as two more facts, unless one is missing or blank. If
the index has overrides for the plugin, an "Overrides" table under its own heading in the card
lists them.

The About page says how the index shows the declared range and how the
start test runs. It says which user reports count. It also says how
overrides and the Used column of the Overrides table work. Each page's footer
says: "Zotdex is an independent project, not part of Zotero, and it doesn't
test the safety or features of the plugins it lists." The home page's intro
says that Zotdex is independent and unofficial and doesn't review anyone's
code. The About page says that the index cannot vet the plugins it lists,
gives the reason, and says that the start test is not a review of
plugin code. It also states the terms in "License" in
[license.md](license.md), and it links there.
Its "Older data" section says when a row shows the facts of an earlier
build. Each page's footer also names the day of the build that the data
comes from, such as "Updated November 7, 2026.", and links to the data file
as "Get all the data as JSON" and to the repository as "Zotdex on GitHub".
The home page's intro also says what the site shows, and it links to the About
page's "Installing a plugin" section (`#installing`). That section gives
Zotero's install steps, the step for Firefox, and Zotero's warning. It also
says how a bot and a maintainer add plugins.

The index lists a plugin whose GitHub repository is archived. Its row on the
home page and the name on its page show "Archived". The Details card of its
page shows the fact "Archived on GitHub" with the value "Yes". GitHub makes
an archived repository read-only until someone with admin access to it
unarchives it.

The index also lists a plugin whose repository shows no source code at its top
level. Each day the build reads the top-level file and folder names of the
repository's default branch, for each plugin that it could read, in
`src/build/source.ts`. It reads no code. These names do not count as source
code, in any letter case: a name that starts with a dot; README, LICENSE,
LICENCE, COPYING, NOTICE, CHANGELOG, or CHANGES, with or without one extension;
a name that ends in `.xpi`, `.md`, `.txt`, `.rdf`, `.png`, `.jpg`, `.jpeg`,
`.gif`, `.svg`, or `.webp`; `update*.json`; and docs, doc, images, image, img,
assets, screenshots, dist, build, releases, update, and updates. Any other name
does. If no name counts, the row on the home page and the name on the plugin page
show a lock, and the link to the repository reads "Repository" in place of
"Source code" or "Source". When the read succeeds, the Details card of the plugin
page shows "Source code at the repository's top level" with "Yes" or "No". "Yes"
does not mean an open-source license or an XPI built from that code. "Yes" can be
wrong, because a name such as `LICENSE-MIT` counts. "No" can be wrong, because the
index does not look inside folders.

The card icon comes from a read by hand, not from the build. A maintainer sets
it when the plugin's main use stops without paying its maker, or stops after a
trial. The name on the home page and on the plugin page shows the icon. The
Details card shows "Requires paying its maker" with a note, a link to
the source, and the date of the read. A plugin with no mark can still cost money.

An address on the site that has no page shows a "Page not found" page, with
links to the home page and the About page. It asks search engines not to
index it.

The site has a sitemap at `sitemap.xml`, and the head of each page links to
it. It lists the home page, the About page, and each plugin page, each at
its canonical address. The site's `robots.txt`, at the top of its host, lets
search engines read every page and names the sitemap. A maintainer can also
submit the sitemap to a search engine by hand.

Each plugin has a README badge file at
`https://zotdex.jmgirard.com/badges/<id>.json`, with the plugin's id
percent-encoded. The badge service shields.io draws a badge from it, labeled
Zotdex. Each plugin page ends with a "Badge for your README" card that holds
the Markdown to copy. The Markdown shows the badge through `img.shields.io` and
links it to the plugin's page. The site shows the Markdown as text and loads
nothing from shields.io.

The badge names the Zotero majors whose newest start result is `started`,
joined by " · ". An example is "started in Zotero 7 · 8 · 9". If no major
started, the badge says "no start in tests". If the plugin has no start
results, it says "not start-tested". If the last build failed to read the
plugin and kept no earlier facts, it says "no data". A plugin that keeps
earlier facts gets the badge of those facts. A start does not show that a
plugin works.

Only a build that deploys changes a badge. Start results come from each day's
build. After a day whose start tests fail, a badge can name fewer majors or
say "not start-tested" until a later build has results. GitHub Pages keeps the
badge file for up to 10 minutes. shields.io and GitHub each keep a copy of the
image for up to an hour. So a change can take a few hours to show. When the
index removes a plugin, its badge shows an error badge from shields.io.

Each page has a favicon, the icon that a browser shows for the page. It is the
Zotdex lens mark, a ringed blue lens that holds a Z, in `favicon.svg`. The full
Zotdex logo is a handheld with that lens, three lights, and a lid line. The top
bar shows the full logo, 2rem square, beside the site's name. The site build
draws three PNG files from the same shapes:

- `favicon.png`, 32 by 32, the lens mark, for a browser that shows no SVG icon
- `apple-touch-icon.png`, 180 by 180, the full logo, for a phone's home screen
- `preview.png`, 1200 by 1200, the full logo, for link previews

Each page also has tags for link previews. The tags are a meta description,
Open Graph tags, a Twitter card tag, and a canonical link. A shared link can
show the page's title, its description, and `preview.png`. A plugin page uses
its shown description. The
page cuts a description of more than 200 characters at the last space in its
first 200 characters. A space with only whitespace before it does not count. If
that part has no other space, the page cuts the description at 200 characters.
If a plugin has no shown description, or the result holds only whitespace, its
page uses a sentence that names the plugin.
